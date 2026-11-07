"""
Deepfake detector: EfficientNet-B0 frame classifier (real vs fake).

Pipeline:
  1) extract : videos -> cropped face frames, split by VIDEO (prevents leakage)
  2) train   : fine-tune pretrained EfficientNet-B0
  3) predict : image or video -> fake probability (video = mean over sampled frames)

Expected raw layout for `extract`:
  raw_videos/real/*.mp4
  raw_videos/fake/*.mp4

Usage:
  python deepfake_detector.py extract --videos raw_videos --out data
  python deepfake_detector.py train --data data --epochs 5
  python deepfake_detector.py predict --input test.mp4
"""
import argparse
import random
from pathlib import Path

import cv2
import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import classification_report, roc_auc_score
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms
from tqdm import tqdm

IMG = 224
MEAN, STD = [0.485, 0.456, 0.406], [0.229, 0.224, 0.225]
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

eval_tf = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((IMG, IMG)),
    transforms.ToTensor(),
    transforms.Normalize(MEAN, STD),
])
train_tf = transforms.Compose([
    transforms.Resize((IMG, IMG)),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(0.2, 0.2, 0.2),
    transforms.RandomApply([transforms.GaussianBlur(3)], p=0.2),
    transforms.ToTensor(),
    transforms.Normalize(MEAN, STD),
])
val_tf = transforms.Compose([
    transforms.Resize((IMG, IMG)),
    transforms.ToTensor(),
    transforms.Normalize(MEAN, STD),
])


# ---------- face utils ----------
def crop_face(frame, margin=0.3):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(60, 60))
    if len(faces) == 0:
        return None
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
    m = int(margin * max(w, h))
    x0, y0 = max(x - m, 0), max(y - m, 0)
    x1, y1 = min(x + w + m, frame.shape[1]), min(y + h + m, frame.shape[0])
    return frame[y0:y1, x0:x1]


def sample_faces(video_path, n_frames=16):
    cap = cv2.VideoCapture(str(video_path))
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    idxs = np.linspace(0, max(total - 1, 0), n_frames).astype(int)
    faces = []
    for i in idxs:
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(i))
        ok, frame = cap.read()
        if not ok:
            continue
        face = crop_face(frame)
        if face is not None:
            faces.append(face)
    cap.release()
    return faces


# ---------- 1) extract ----------
def extract(args):
    random.seed(42)
    src, out = Path(args.videos), Path(args.out)
    for label in ("real", "fake"):
        vids = sorted(
            p for p in (src / label).iterdir()
            if p.suffix.lower() in {".mp4", ".avi", ".mov", ".mkv"}
        )
        random.shuffle(vids)
        n_val = max(1, int(len(vids) * args.val_split))
        for k, v in enumerate(tqdm(vids, desc=label)):
            split = "val" if k < n_val else "train"
            dest = out / split / label
            dest.mkdir(parents=True, exist_ok=True)
            for j, face in enumerate(sample_faces(v, args.frames)):
                cv2.imwrite(str(dest / f"{v.stem}_{j}.jpg"), face)


# ---------- model ----------
def build_model():
    m = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
    m.classifier[1] = nn.Linear(m.classifier[1].in_features, 1)  # single logit = P(fake)
    return m


# ---------- 2) train ----------
def train(args):
    tr = datasets.ImageFolder(Path(args.data) / "train", train_tf)
    va = datasets.ImageFolder(Path(args.data) / "val", val_tf)
    fake_idx = tr.class_to_idx["fake"]
    tl = DataLoader(tr, args.batch, shuffle=True, num_workers=2)
    vl = DataLoader(va, args.batch, num_workers=2)

    model = build_model().to(DEVICE)
    opt = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, args.epochs)
    loss_fn = nn.BCEWithLogitsLoss()
    best_auc = 0.0

    for ep in range(args.epochs):
        model.train()
        for x, y in tqdm(tl, desc=f"epoch {ep + 1}/{args.epochs}"):
            x = x.to(DEVICE)
            y = (y == fake_idx).float().to(DEVICE)
            opt.zero_grad()
            loss = loss_fn(model(x).squeeze(1), y)
            loss.backward()
            opt.step()
        sched.step()

        model.eval()
        probs, labels = [], []
        with torch.no_grad():
            for x, y in vl:
                p = torch.sigmoid(model(x.to(DEVICE)).squeeze(1)).cpu().numpy()
                probs += p.tolist()
                labels += (y == fake_idx).int().tolist()
        auc = roc_auc_score(labels, probs)
        print(f"val AUC: {auc:.4f}")
        if auc > best_auc:
            best_auc = auc
            torch.save(model.state_dict(), args.weights)
            print(classification_report(
                labels, [int(p > 0.5) for p in probs], target_names=["real", "fake"]
            ))
    print(f"Best val AUC {best_auc:.4f} -> {args.weights}")


# ---------- 3) predict ----------
@torch.no_grad()
def predict(args):
    model = build_model().to(DEVICE)
    model.load_state_dict(torch.load(args.weights, map_location=DEVICE))
    model.eval()

    path = Path(args.input)
    if path.suffix.lower() in {".jpg", ".jpeg", ".png"}:
        img = cv2.imread(str(path))
        face = crop_face(img)
        faces = [face if face is not None else img]
    else:
        faces = sample_faces(path, args.frames)
    if not faces:
        print("No faces found - cannot score.")
        return

    batch = torch.stack([eval_tf(cv2.cvtColor(f, cv2.COLOR_BGR2RGB)) for f in faces])
    probs = torch.sigmoid(model(batch.to(DEVICE)).squeeze(1)).cpu().numpy()
    score = float(probs.mean())
    print(f"frames scored: {len(probs)}")
    print(f"fake probability: {score:.3f}")
    print("verdict:", "LIKELY FAKE" if score > 0.5 else "LIKELY REAL")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)

    e = sub.add_parser("extract")
    e.add_argument("--videos", required=True)
    e.add_argument("--out", default="data")
    e.add_argument("--frames", type=int, default=16)
    e.add_argument("--val_split", type=float, default=0.2)
    e.set_defaults(fn=extract)

    t = sub.add_parser("train")
    t.add_argument("--data", default="data")
    t.add_argument("--epochs", type=int, default=5)
    t.add_argument("--batch", type=int, default=32)
    t.add_argument("--lr", type=float, default=3e-4)
    t.add_argument("--weights", default="deepfake_effnetb0.pt")
    t.set_defaults(fn=train)

    p = sub.add_parser("predict")
    p.add_argument("--input", required=True)
    p.add_argument("--weights", default="deepfake_effnetb0.pt")
    p.add_argument("--frames", type=int, default=16)
    p.set_defaults(fn=predict)

    a = ap.parse_args()
    a.fn(a)
