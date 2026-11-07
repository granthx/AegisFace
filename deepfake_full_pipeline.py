"""
=============================================================================
  DEEPFAKE DETECTION — FULL PHASED PIPELINE
=============================================================================

PHASES OVERVIEW:
  Phase 1  — Setup & Config           : constants, device, paths
  Phase 2  — Face Detection           : Haar cascade + optional MTCNN/MediaPipe
  Phase 3  — Frame Extraction         : videos → cropped face frames (train/val split by VIDEO)
  Phase 4  — Dataset & Transforms     : augmentation, normalization, DataLoaders
  Phase 5  — Model                    : EfficientNet-B0 backbone (plug-in Xception/ViT ready)
  Phase 6  — Training                 : AdamW + CosineAnnealingLR + AUC tracking
  Phase 7  — Grad-CAM                 : gradient-weighted class activation maps
  Phase 8  — Temporal Model (LSTM)    : per-frame embeddings → video-level decision
  Phase 9  — Prediction               : image / video → fake probability + optional Grad-CAM
  Phase 10 — Cross-Dataset Evaluation : AUC, accuracy, confusion matrix
  Phase 11 — Gradio Demo App          : upload video/image → probability + heatmap frames
  Phase 12 — CLI Entry-Point          : argparse wiring for all commands

USAGE:
  # Extract frames from raw videos
  python deepfake_full_pipeline.py extract --videos raw_videos --out data

  # Train
  python deepfake_full_pipeline.py train --data data --epochs 10

  # Predict on a video or image
  python deepfake_full_pipeline.py predict --input suspect.mp4 --gradcam

  # Cross-dataset evaluation
  python deepfake_full_pipeline.py evaluate --data other_dataset

  # Launch Gradio demo
  python deepfake_full_pipeline.py demo

INSTALL:
  pip install torch torchvision opencv-python numpy scikit-learn tqdm
  # Optional extras (enable in CONFIG below):
  pip install facenet-pytorch mediapipe gradio matplotlib

NOTE: All phases are clearly labelled. You can read, run, and extend them
      independently. Imports for optional features are guarded so the script
      works even when those packages are not installed.
=============================================================================
"""

# ─────────────────────────────────────────────────────────────────────────────
#  PHASE 1 — SETUP & CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────
import argparse
import random
import sys
import warnings
from pathlib import Path

import cv2
import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    classification_report,
    confusion_matrix,
    roc_auc_score,
)
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms
from tqdm import tqdm

warnings.filterwarnings("ignore")

# ── tuneable knobs ────────────────────────────────────────────────────────────
IMG_SIZE   = 224                          # input resolution for EfficientNet-B0
MEAN       = [0.485, 0.456, 0.406]        # ImageNet mean
STD        = [0.229, 0.224, 0.225]        # ImageNet std
DEVICE     = "cuda" if torch.cuda.is_available() else "cpu"
N_FRAMES   = 16                           # frames sampled per video
FACE_MARGIN = 0.30                        # padding around face crop (30 %)

# ── feature flags (set True to enable optional modules) ───────────────────────
USE_MTCNN      = False   # Phase 2: use MTCNN instead of Haar  (pip install facenet-pytorch)
USE_MEDIAPIPE  = False   # Phase 2: use MediaPipe face mesh     (pip install mediapipe)
USE_TEMPORAL   = False   # Phase 8: LSTM over frame embeddings
USE_GRADCAM    = False   # Phase 7: Grad-CAM during prediction  (auto-enabled with --gradcam)

print(f"[Phase 1] Device: {DEVICE}  |  IMG: {IMG_SIZE}  |  Frames/video: {N_FRAMES}")


# ─────────────────────────────────────────────────────────────────────────────
#  PHASE 2 — FACE DETECTION  (Haar → MTCNN → MediaPipe, priority order)
# ─────────────────────────────────────────────────────────────────────────────

# ── Option A: Haar Cascade (safe fallback if cv2 has CascadeClassifier) ───────
_haar = None  # lazy-initialised on first use

def _get_haar():
    global _haar
    if _haar is None:
        try:
            if hasattr(cv2, "CascadeClassifier") and hasattr(cv2, "data") and hasattr(cv2.data, "haarcascades"):
                _haar = cv2.CascadeClassifier(
                    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
                )
        except Exception:
            _haar = None
    return _haar

def _detect_haar(frame_bgr):
    """Return (x, y, w, h) of the largest face or None."""
    try:
        haar = _get_haar()
        if haar is None:
            return None
        gray  = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
        faces = haar.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))
        if len(faces) == 0:
            return None
        return max(faces, key=lambda f: f[2] * f[3])   # largest by area
    except Exception:
        return None


# ── Option B: MTCNN  (better recall on profile/low-light faces) ───────────────
def _detect_mtcnn(frame_bgr):
    """Return (x, y, w, h) or None.  Lazily imports facenet_pytorch."""
    try:
        from facenet_pytorch import MTCNN as _MTCNN
        import PIL.Image
    except ImportError:
        print("[Phase 2] facenet-pytorch not installed, falling back to Haar.")
        return _detect_haar(frame_bgr)

    if not hasattr(_detect_mtcnn, "_detector"):
        _detect_mtcnn._detector = _MTCNN(keep_all=True, device=DEVICE)

    rgb  = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    img  = PIL.Image.fromarray(rgb)
    boxes, _ = _detect_mtcnn._detector.detect(img)
    if boxes is None or len(boxes) == 0:
        return None
    # largest box
    box = max(boxes, key=lambda b: (b[2] - b[0]) * (b[3] - b[1]))
    x1, y1, x2, y2 = map(int, box)
    return x1, y1, x2 - x1, y2 - y1


# ── Option C: MediaPipe Face Detection ────────────────────────────────────────
def _detect_mediapipe(frame_bgr):
    """Return (x, y, w, h) or None. Lazily imports mediapipe."""
    try:
        import mediapipe as mp
    except ImportError:
        print("[Phase 2] mediapipe not installed, falling back to Haar.")
        return _detect_haar(frame_bgr)

    if not hasattr(_detect_mediapipe, "_det"):
        _mp_face = mp.solutions.face_detection
        _detect_mediapipe._det = _mp_face.FaceDetection(model_selection=1, min_detection_confidence=0.5)

    rgb  = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    h, w = frame_bgr.shape[:2]
    res  = _detect_mediapipe._det.process(rgb)
    if not res.detections:
        return None
    # pick highest-confidence detection
    det  = max(res.detections, key=lambda d: d.score[0])
    bb   = det.location_data.relative_bounding_box
    x    = int(bb.xmin * w);  y  = int(bb.ymin * h)
    bw   = int(bb.width * w); bh = int(bb.height * h)
    return x, y, bw, bh


def detect_face(frame_bgr):
    """Unified face detector that respects the feature flags."""
    if USE_MTCNN:
        return _detect_mtcnn(frame_bgr)
    if USE_MEDIAPIPE:
        return _detect_mediapipe(frame_bgr)
    return _detect_haar(frame_bgr)


def crop_face(frame_bgr, margin: float = FACE_MARGIN):
    """
    Detect the largest face and return a padded crop.
    If no face detector is available or face is not found (e.g. image is already a face crop),
    returns the original frame_bgr.
    """
    try:
        box = detect_face(frame_bgr)
        if box is None:
            return frame_bgr
        x, y, w, h = box
        m  = int(margin * max(w, h))
        x0 = max(x - m, 0);              y0 = max(y - m, 0)
        x1 = min(x + w + m, frame_bgr.shape[1])
        y1 = min(y + h + m, frame_bgr.shape[0])
        return frame_bgr[y0:y1, x0:x1]
    except Exception:
        return frame_bgr


# ─────────────────────────────────────────────────────────────────────────────
#  PHASE 3 — FRAME EXTRACTION  (video → face crops, split by VIDEO)
# ─────────────────────────────────────────────────────────────────────────────

def sample_faces_from_video(video_path: Path, n_frames: int = N_FRAMES):
    """
    Uniformly sample n_frames from a video and return face crops (BGR).
    Splitting is done at the VIDEO level (not frame level) to prevent
    near-identical frames appearing in both train and val sets.
    """
    cap   = cv2.VideoCapture(str(video_path))
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total == 0:
        cap.release()
        return []
    idxs  = np.linspace(0, max(total - 1, 0), n_frames).astype(int)
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


def extract_frames(args):
    """
    Phase 3 command:
      raw_videos/real/*.mp4  →  data/train/real/*.jpg  +  data/val/real/*.jpg
      raw_videos/fake/*.mp4  →  data/train/fake/*.jpg  +  data/val/fake/*.jpg
    """
    random.seed(42)
    src = Path(args.videos)
    out = Path(args.out)

    for label in ("real", "fake"):
        label_dir = src / label
        if not label_dir.exists():
            print(f"[Phase 3] WARNING: {label_dir} not found — skipping.")
            continue

        vids = sorted(
            p for p in label_dir.iterdir()
            if p.suffix.lower() in {".mp4", ".avi", ".mov", ".mkv", ".webm"}
        )
        if not vids:
            print(f"[Phase 3] WARNING: no videos found in {label_dir}.")
            continue

        random.shuffle(vids)
        n_val = max(1, int(len(vids) * args.val_split))

        for k, v in enumerate(tqdm(vids, desc=f"[Phase 3] Extracting {label}")):
            split = "val" if k < n_val else "train"
            dest  = out / split / label
            dest.mkdir(parents=True, exist_ok=True)
            faces = sample_faces_from_video(v, args.frames)
            for j, face in enumerate(faces):
                cv2.imwrite(str(dest / f"{v.stem}_{j:04d}.jpg"), face)

    print(f"[Phase 3] Done. Frames saved to: {out}")


# ─────────────────────────────────────────────────────────────────────────────
#  PHASE 4 — DATASET & TRANSFORMS
# ─────────────────────────────────────────────────────────────────────────────

def get_transforms():
    """
    Training: augmentation to improve robustness to compression artifacts.
    Validation/Test: deterministic resize + normalize only.

    Why JPEG/blur augmentation?  Social-media re-encoding degrades forgery
    artifacts — simulating it at train time improves real-world accuracy.
    """
    train_tf = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        # simulate compression / blur degradation
        transforms.RandomApply([transforms.GaussianBlur(kernel_size=3)], p=0.3),
        transforms.RandomApply([
            transforms.RandomAffine(degrees=5, translate=(0.05, 0.05))
        ], p=0.2),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ])

    val_tf = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ])

    # For raw numpy frames (used in predict / grad-cam)
    eval_tf = transforms.Compose([
        transforms.ToPILImage(),
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ])

    return train_tf, val_tf, eval_tf


def get_dataloaders(data_dir: Path, batch_size: int, num_workers: int = 2):
    """Build train and val DataLoaders from an ImageFolder structure."""
    train_tf, val_tf, _ = get_transforms()
    tr = datasets.ImageFolder(data_dir / "train", train_tf)
    va = datasets.ImageFolder(data_dir / "val",   val_tf)
    tl = DataLoader(tr, batch_size, shuffle=True,  num_workers=num_workers, pin_memory=True)
    vl = DataLoader(va, batch_size, shuffle=False, num_workers=num_workers, pin_memory=True)
    return tl, vl, tr.class_to_idx


# ─────────────────────────────────────────────────────────────────────────────
#  PHASE 5 — MODEL  (EfficientNet-B0 backbone, extensible + LoRA support)
# ─────────────────────────────────────────────────────────────────────────────

class LoRALinear(nn.Module):
    """
    Low-Rank Adaptation (LoRA) layer for parameter-efficient fine-tuning.
    W = W_0 + (alpha / rank) * (B @ A)
    """
    def __init__(self, linear_layer: nn.Linear, rank: int = 16, alpha: float = 32.0, dropout: float = 0.05):
        super().__init__()
        self.in_features = linear_layer.in_features
        self.out_features = linear_layer.out_features
        self.rank = rank
        self.scaling = alpha / rank
        self.linear = linear_layer
        # Freeze base weights
        self.linear.weight.requires_grad = False
        if self.linear.bias is not None:
            self.linear.bias.requires_grad = False

        self.lora_A = nn.Parameter(torch.empty(rank, self.in_features))
        self.lora_B = nn.Parameter(torch.zeros(self.out_features, rank))
        nn.init.kaiming_uniform_(self.lora_A, a=5 ** 0.5)
        self.dropout = nn.Dropout(dropout) if dropout > 0 else nn.Identity()

    def forward(self, x):
        base_out = self.linear(x)
        lora_out = self.dropout(x) @ self.lora_A.t() @ self.lora_B.t()
        return base_out + lora_out * self.scaling


def build_model(backbone: str = "efficientnet_b0", use_lora: bool = False,
                lora_rank: int = 16, lora_alpha: float = 32.0, lora_dropout: float = 0.05):
    """
    Build a binary classifier (real=0 / fake=1).

    backbone options (set via --backbone flag):
      'efficientnet_b0'  — default, fast, good baseline
      'efficientnet_b4'  — larger, usually +1-2 % AUC
      'vit_b_16'         — Vision Transformer (torchvision >= 0.13)

    The final classifier is replaced with a single logit → P(fake).
    """
    if backbone == "efficientnet_b0":
        m = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
        in_f = m.classifier[1].in_features
        head = nn.Linear(in_f, 1)
        if use_lora:
            head = LoRALinear(head, rank=lora_rank, alpha=lora_alpha, dropout=lora_dropout)
        m.classifier[1] = head

    elif backbone == "efficientnet_b4":
        m = models.efficientnet_b4(weights=models.EfficientNet_B4_Weights.DEFAULT)
        in_f = m.classifier[1].in_features
        head = nn.Linear(in_f, 1)
        if use_lora:
            head = LoRALinear(head, rank=lora_rank, alpha=lora_alpha, dropout=lora_dropout)
        m.classifier[1] = head

    elif backbone == "vit_b_16":
        m = models.vit_b_16(weights=models.ViT_B_16_Weights.DEFAULT)
        in_f = m.heads.head.in_features
        head = nn.Linear(in_f, 1)
        if use_lora:
            head = LoRALinear(head, rank=lora_rank, alpha=lora_alpha, dropout=lora_dropout)
        m.heads.head = head

    else:
        raise ValueError(f"Unknown backbone: {backbone!r}. "
                         "Choose efficientnet_b0 | efficientnet_b4 | vit_b_16")

    lora_desc = f" (with LoRA r={lora_rank}, alpha={lora_alpha})" if use_lora else ""
    print(f"[Phase 5] Model: {backbone}{lora_desc}  |  Output: single logit (P(fake))")
    return m


# ─────────────────────────────────────────────────────────────────────────────
#  PHASE 6 — TRAINING
# ─────────────────────────────────────────────────────────────────────────────

def train_model(args):
    """
    Fine-tune the model with:
      • AdamW optimizer + weight decay
      • CosineAnnealingLR scheduler
      • BCEWithLogitsLoss with optional label smoothing
      • Native LoRA support (--lora)
      • Best checkpoint saved by val AUC
    """
    data_dir = Path(args.data)
    tl, vl, class_to_idx = get_dataloaders(data_dir, args.batch)
    fake_idx = class_to_idx["fake"]

    use_lora = getattr(args, "lora", False)
    rank = getattr(args, "lora_rank", 16)
    alpha = getattr(args, "lora_alpha", 32.0)
    dropout = getattr(args, "lora_dropout", 0.05)
    smoothing = getattr(args, "label_smoothing", 0.05)

    model = build_model(
        backbone=getattr(args, "backbone", "efficientnet_b0"),
        use_lora=use_lora,
        lora_rank=rank,
        lora_alpha=alpha,
        lora_dropout=dropout
    ).to(DEVICE)

    # If LoRA is enabled, optimize only trainable parameters
    trainable_params = [p for p in model.parameters() if p.requires_grad]
    total_params = sum(p.numel() for p in model.parameters())
    trainable_count = sum(p.numel() for p in trainable_params)
    print(f"[Phase 6] Parameters: {trainable_count:,} trainable / {total_params:,} total "
          f"({100 * trainable_count / total_params:.2f}% trainable)")

    opt = torch.optim.AdamW(trainable_params, lr=args.lr, weight_decay=1e-4)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, args.epochs, eta_min=1e-6)
    loss_fn = nn.BCEWithLogitsLoss()
    best_auc = 0.0

    weights_path = Path(args.weights)
    weights_path.parent.mkdir(parents=True, exist_ok=True)

    for ep in range(1, args.epochs + 1):
        # ── train pass ──
        model.train()
        running_loss = 0.0
        for x, y in tqdm(tl, desc=f"[Phase 6] Train epoch {ep}/{args.epochs}"):
            x = x.to(DEVICE)
            y_raw = (y == fake_idx).float().to(DEVICE)
            # Label smoothing: y_smooth = y * (1 - s) + 0.5 * s
            if smoothing > 0:
                y_target = y_raw * (1.0 - smoothing) + 0.5 * smoothing
            else:
                y_target = y_raw

            opt.zero_grad()
            loss = loss_fn(model(x).squeeze(1), y_target)
            loss.backward()
            opt.step()
            running_loss += loss.item() * x.size(0)
        sched.step()
        avg_loss = running_loss / len(tl.dataset)

        # ── val pass ──
        model.eval()
        probs, labels = [], []
        with torch.no_grad():
            for x, y in vl:
                p = torch.sigmoid(model(x.to(DEVICE)).squeeze(1)).cpu().numpy()
                probs  += p.tolist()
                labels += (y == fake_idx).int().tolist()

        auc = roc_auc_score(labels, probs)
        preds = [int(p > 0.5) for p in probs]
        print(f"\n[Phase 6] Epoch {ep:02d}  loss={avg_loss:.4f}  val AUC={auc:.4f}")

        if auc > best_auc:
            best_auc = auc
            torch.save(model.state_dict(), str(weights_path))
            print(f"  [BEST] New best -- saved to {weights_path}")
            print(classification_report(labels, preds, target_names=["real", "fake"]))

    print(f"\n[Phase 6] Training complete. Best val AUC: {best_auc:.4f} -> {weights_path}")


# ─────────────────────────────────────────────────────────────────────────────
#  PHASE 7 — GRAD-CAM
# ─────────────────────────────────────────────────────────────────────────────

class GradCAM:
    """
    Gradient-weighted Class Activation Mapping for EfficientNet / ViT.

    Usage:
        gcam   = GradCAM(model, target_layer)
        heatmap = gcam(tensor_chw)   # shape (H, W), values in [0, 1]

    Why?  Lets you visually confirm the model is reacting to face-swap
    boundaries and blending artifacts rather than scene background.
    """

    def __init__(self, model: nn.Module, target_layer: nn.Module):
        self.model        = model
        self._activations = None
        self._gradients   = None

        # register hooks
        target_layer.register_forward_hook(self._save_activation)
        target_layer.register_full_backward_hook(self._save_gradient)

    def _save_activation(self, module, input, output):
        self._activations = output.detach()

    def _save_gradient(self, module, grad_input, grad_output):
        self._gradients = grad_output[0].detach()

    def __call__(self, tensor_chw: torch.Tensor) -> np.ndarray:
        """
        tensor_chw: (C, H, W) on CPU — will be moved to DEVICE internally.
        Returns:    (H_orig, W_orig) heatmap as float32 in [0, 1].
        """
        self.model.eval()
        x = tensor_chw.unsqueeze(0).to(DEVICE).requires_grad_(True)
        logit = self.model(x).squeeze()          # scalar logit
        self.model.zero_grad()
        logit.backward()

        # global average pool gradients over spatial dims
        weights = self._gradients.mean(dim=(2, 3), keepdim=True)  # (1, C, 1, 1)
        cam     = (weights * self._activations).sum(dim=1).squeeze()  # (H', W')
        cam     = torch.relu(cam).cpu().numpy()
        # normalize to [0, 1]
        cam -= cam.min()
        if cam.max() > 0:
            cam /= cam.max()
        return cam


def get_gradcam_layer(model: nn.Module, backbone: str = "efficientnet_b0"):
    """Return the last convolutional layer appropriate for Grad-CAM."""
    if "efficientnet" in backbone:
        return model.features[-1]          # last MBConv block
    elif backbone == "vit_b_16":
        return model.encoder.layers[-1]    # last transformer encoder block
    raise ValueError(f"Grad-CAM layer not configured for backbone: {backbone}")


def overlay_gradcam(frame_bgr: np.ndarray, cam: np.ndarray) -> np.ndarray:
    """Blend a Grad-CAM heatmap onto a BGR frame."""
    h, w = frame_bgr.shape[:2]
    cam_resized  = cv2.resize(cam, (w, h))
    heatmap      = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_JET)
    overlaid     = cv2.addWeighted(frame_bgr, 0.5, heatmap, 0.5, 0)
    return overlaid


# ─────────────────────────────────────────────────────────────────────────────
#  PHASE 8 — TEMPORAL MODEL (LSTM over per-frame embeddings)
# ─────────────────────────────────────────────────────────────────────────────

class TemporalDeepfakeDetector(nn.Module):
    """
    Uses the EfficientNet-B0 trunk (without its head) as a feature extractor,
    then aggregates the N per-frame embeddings with a bidirectional LSTM.

    Why temporal?
      A single frame classifier cannot exploit temporal inconsistencies
      (blinking patterns, unnatural motion, flickering compression blocks)
      that are strong signals in deepfake videos.

    Input:  (batch, T, C, H, W)   — T = N_FRAMES
    Output: (batch,)               — P(fake) for the whole video clip
    """

    def __init__(self, n_frames: int = N_FRAMES, hidden: int = 256, dropout: float = 0.4):
        super().__init__()
        backbone          = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
        feature_dim       = backbone.classifier[1].in_features
        # strip the classifier head — keep only the feature extractor
        backbone.classifier = nn.Identity()
        self.cnn          = backbone                          # (B, feature_dim)
        self.lstm         = nn.LSTM(
            feature_dim, hidden,
            num_layers=2, batch_first=True, bidirectional=True, dropout=dropout
        )
        self.head         = nn.Linear(hidden * 2, 1)         # bidirectional → hidden*2

    def forward(self, x):
        B, T, C, H, W = x.shape
        # encode each frame independently
        feats   = self.cnn(x.view(B * T, C, H, W))          # (B*T, feat)
        feats   = feats.view(B, T, -1)                        # (B, T, feat)
        out, _  = self.lstm(feats)                            # (B, T, 2*hidden)
        # use the last time-step output as video representation
        logit   = self.head(out[:, -1, :]).squeeze(1)        # (B,)
        return logit


def train_temporal(args):
    """
    Train the LSTM temporal model.
    Expects data/train|val/{real,fake}/ image directories (same as Phase 3).
    Samples N_FRAMES images per class folder per step — simplified for demo.
    For production, write a custom TemporalVideoDataset.
    """
    print("[Phase 8] Building temporal model (EfficientNet-B0 + BiLSTM)…")
    data_dir = Path(args.data)
    tl, vl, class_to_idx = get_dataloaders(data_dir, args.batch)
    fake_idx = class_to_idx["fake"]

    model   = TemporalDeepfakeDetector(n_frames=N_FRAMES).to(DEVICE)
    opt     = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    sched   = torch.optim.lr_scheduler.CosineAnnealingLR(opt, args.epochs)
    loss_fn = nn.BCEWithLogitsLoss()
    best_auc = 0.0

    for ep in range(1, args.epochs + 1):
        model.train()
        for x, y in tqdm(tl, desc=f"[Phase 8] Temporal epoch {ep}/{args.epochs}"):
            # add dummy temporal dim: (B, 1, C, H, W) — replace with real clip loader
            x = x.unsqueeze(1).to(DEVICE)
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
                x = x.unsqueeze(1).to(DEVICE)
                p = torch.sigmoid(model(x).squeeze(1)).cpu().numpy()
                probs  += p.tolist()
                labels += (y == fake_idx).int().tolist()
        auc = roc_auc_score(labels, probs)
        print(f"[Phase 8] Epoch {ep:02d}  val AUC={auc:.4f}")
        if auc > best_auc:
            best_auc = auc
            weights_path = Path(args.weights).stem + "_temporal.pt"
            torch.save(model.state_dict(), weights_path)
            print(f"  [BEST] Saved temporal model -> {weights_path}")

    print(f"[Phase 8] Best temporal AUC: {best_auc:.4f}")


# ─────────────────────────────────────────────────────────────────────────────
#  PHASE 9 — PREDICTION  (image / video → fake probability + Grad-CAM)
# ─────────────────────────────────────────────────────────────────────────────

@torch.no_grad()
def _score_faces(model: nn.Module, faces_bgr: list, eval_tf) -> np.ndarray:
    """Convert face crops to tensors, run model, return per-frame probabilities."""
    tensors = [eval_tf(cv2.cvtColor(f, cv2.COLOR_BGR2RGB)) for f in faces_bgr]
    batch   = torch.stack(tensors).to(DEVICE)
    probs   = torch.sigmoid(model(batch).squeeze(1)).cpu().numpy()
    return probs


def predict(args):
    """
    Phase 9 command:
      • Accepts an image (.jpg/.png) or a video (.mp4/.avi/…)
      • Reports per-frame probabilities, mean score, and verdict
      • Optional: saves Grad-CAM overlay images when --gradcam is passed
    """
    backbone = getattr(args, "backbone", "efficientnet_b0")
    model    = build_model(backbone).to(DEVICE)
    model.load_state_dict(torch.load(args.weights, map_location=DEVICE))
    model.eval()

    _, _, eval_tf = get_transforms()
    path = Path(args.input)
    if not path.exists():
        print(f"[Phase 9] ERROR: Input file not found: {path}")
        return

    # ── load face crops ──────────────────────────────────────────────────────
    if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".bmp", ".webp"}:
        img  = cv2.imread(str(path))
        if img is None:
            print(f"[Phase 9] ERROR: OpenCV could not read image at: {path}")
            return
        face = crop_face(img)
        faces = [face if face is not None else img]
    else:
        faces = sample_faces_from_video(path, args.frames)

    if not faces:
        print("[Phase 9] No faces found — cannot score.")
        return

    # ── score ────────────────────────────────────────────────────────────────
    # Need grad for Grad-CAM, so we handle that separately
    use_gradcam = getattr(args, "gradcam", False)
    if use_gradcam:
        gcam_layer = get_gradcam_layer(model, backbone)
        gcam       = GradCAM(model, gcam_layer)
        gcam_dir   = Path("gradcam_outputs")
        gcam_dir.mkdir(exist_ok=True)

        probs_list = []
        for idx, face in enumerate(faces):
            t     = eval_tf(cv2.cvtColor(face, cv2.COLOR_BGR2RGB))
            cam   = gcam(t)                                      # grad-cam
            prob  = torch.sigmoid(
                model(t.unsqueeze(0).to(DEVICE)).squeeze()
            ).item()
            probs_list.append(prob)
            overlay = overlay_gradcam(
                cv2.resize(face, (IMG_SIZE, IMG_SIZE)), cam
            )
            out_path = gcam_dir / f"frame_{idx:04d}_p{prob:.2f}.jpg"
            cv2.imwrite(str(out_path), overlay)
        probs = np.array(probs_list)
        print(f"[Phase 9] Grad-CAM overlays saved to: {gcam_dir}/")
    else:
        probs = _score_faces(model, faces, eval_tf)

    # ── report ───────────────────────────────────────────────────────────────
    score = float(probs.mean())
    print(f"\n[Phase 9] Frames scored : {len(probs)}")
    print(f"          Fake prob/frame: {' '.join(f'{p:.2f}' for p in probs)}")
    print(f"          Mean fake prob : {score:.3f}")
    print(f"          Verdict        : {'[FAKE] LIKELY FAKE' if score > 0.5 else '[REAL] LIKELY REAL'}")
    return score


# ─────────────────────────────────────────────────────────────────────────────
#  PHASE 10 — CROSS-DATASET EVALUATION
# ─────────────────────────────────────────────────────────────────────────────

def evaluate(args):
    """
    Phase 10 command:
      Load a trained model and evaluate on a DIFFERENT dataset (cross-dataset
      generalisation test).  Reports: AUC, accuracy, precision/recall/F1,
      confusion matrix.

    Usage:
      python deepfake_full_pipeline.py evaluate \\
        --data other_dataset --weights deepfake_effnetb0.pt

    Directory layout of other_dataset must follow the same
    train/val/{real,fake} convention; we use the 'val' split for evaluation.
    """
    backbone = getattr(args, "backbone", "efficientnet_b0")
    model    = build_model(backbone).to(DEVICE)
    model.load_state_dict(torch.load(args.weights, map_location=DEVICE))
    model.eval()

    _, val_tf, _ = get_transforms()
    data_dir = Path(args.data)
    va       = datasets.ImageFolder(data_dir / "val", val_tf)
    vl       = DataLoader(va, batch_size=getattr(args, "batch", 32),
                          shuffle=False, num_workers=2)
    fake_idx = va.class_to_idx["fake"]

    probs, labels = [], []
    with torch.no_grad():
        for x, y in tqdm(vl, desc="[Phase 10] Evaluating"):
            p = torch.sigmoid(model(x.to(DEVICE)).squeeze(1)).cpu().numpy()
            probs  += p.tolist()
            labels += (y == fake_idx).int().tolist()

    preds   = [int(p > 0.5) for p in probs]
    auc     = roc_auc_score(labels, probs)
    acc     = sum(p == l for p, l in zip(preds, labels)) / len(labels)

    print(f"\n[Phase 10] Cross-Dataset Results")
    print(f"  Dataset : {data_dir}")
    print(f"  Weights : {args.weights}")
    print(f"  AUC     : {auc:.4f}")
    print(f"  Accuracy: {acc:.4f}")
    print()
    print(classification_report(labels, preds, target_names=["real", "fake"]))

    # ── confusion matrix ─────────────────────────────────────────────────────
    try:
        import matplotlib.pyplot as plt
        cm   = confusion_matrix(labels, preds)
        disp = ConfusionMatrixDisplay(cm, display_labels=["real", "fake"])
        disp.plot(cmap="Blues")
        plt.title(f"Cross-Dataset Confusion Matrix  (AUC={auc:.4f})")
        plt.tight_layout()
        out = "confusion_matrix.png"
        plt.savefig(out, dpi=150)
        print(f"[Phase 10] Confusion matrix saved → {out}")
    except ImportError:
        print("[Phase 10] matplotlib not installed — skipping confusion matrix plot.")


# ─────────────────────────────────────────────────────────────────────────────
#  PHASE 11 — GRADIO DEMO APP
# ─────────────────────────────────────────────────────────────────────────────

def launch_demo(args):
    """
    Phase 11 command:
      Launches a Gradio web app where users can upload a video or image,
      see the fake probability, and browse Grad-CAM highlighted frames.

    Install:  pip install gradio matplotlib

    The demo:
      1. Accepts image or video upload.
      2. Extracts face crops (16 frames for video).
      3. Scores each frame with the trained model.
      4. Shows mean probability, verdict, and a Grad-CAM gallery.
    """
    try:
        import gradio as gr
        import matplotlib.pyplot as plt
    except ImportError:
        print("[Phase 11] Please install Gradio:  pip install gradio matplotlib")
        return

    backbone = getattr(args, "backbone", "efficientnet_b0")
    model    = build_model(backbone).to(DEVICE)
    model.load_state_dict(torch.load(args.weights, map_location=DEVICE))
    model.eval()
    gcam_layer = get_gradcam_layer(model, backbone)
    gcam       = GradCAM(model, gcam_layer)
    _, _, eval_tf = get_transforms()

    def analyse(file_obj):
        if file_obj is None:
            return "No file uploaded.", None, []

        file_path = file_obj.name if hasattr(file_obj, "name") else str(file_obj)
        path = Path(file_path)
        if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".bmp", ".webp"}:
            img  = cv2.imread(file_path)
            if img is None:
                return "Could not load image.", None, []
            face = crop_face(img)
            faces = [face if face is not None else img]
        else:
            faces = sample_faces_from_video(path, N_FRAMES)

        if not faces:
            return "No faces detected in the uploaded file.", None, []

        probs_list, gallery = [], []
        for face in faces:
            t    = eval_tf(cv2.cvtColor(face, cv2.COLOR_BGR2RGB))
            cam  = gcam(t)
            prob = torch.sigmoid(
                model(t.unsqueeze(0).to(DEVICE)).squeeze()
            ).item()
            probs_list.append(prob)
            overlay = overlay_gradcam(cv2.resize(face, (IMG_SIZE, IMG_SIZE)), cam)
            overlay_rgb = cv2.cvtColor(overlay, cv2.COLOR_BGR2RGB)
            gallery.append((overlay_rgb, f"P(fake)={prob:.2f}"))

        score   = float(np.mean(probs_list))
        verdict = "[FAKE] LIKELY FAKE" if score > 0.5 else "[REAL] LIKELY REAL"
        summary = f"Mean fake probability: {score:.3f}\nVerdict: {verdict}"
        return summary, score, gallery

    with gr.Blocks(title="Deepfake Detector") as demo:
        gr.Markdown("## Deepfake Detector\nUpload a **video** or **image** to analyse.")

        with gr.Row():
            file_in  = gr.File(label="Upload Video / Image",
                               file_types=["video", "image"])

        analyse_btn = gr.Button("Analyse", variant="primary")

        with gr.Row():
            text_out  = gr.Textbox(label="Result", lines=3)
            score_out = gr.Number(label="Fake Probability (0–1)")

        gallery_out = gr.Gallery(label="Grad-CAM Frame Highlights", columns=4, height="auto")

        analyse_btn.click(analyse,
                          inputs=[file_in],
                          outputs=[text_out, score_out, gallery_out])

    demo.launch(share=False)


# ─────────────────────────────────────────────────────────────────────────────
#  PHASE 12 — CLI ENTRY-POINT
# ─────────────────────────────────────────────────────────────────────────────

def main():
    ap  = argparse.ArgumentParser(
        description="Deepfake Detection — Full Phased Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Commands:
  extract   — Extract face frames from raw videos (Phase 3)
  train     — Fine-tune EfficientNet-B0 classifier (Phase 6)
  train-temporal — Train LSTM temporal model (Phase 8)
  predict   — Score an image or video (Phase 9)
  evaluate  — Cross-dataset evaluation with AUC/confusion matrix (Phase 10)
  demo      — Launch Gradio web demo (Phase 11)

Examples:
  python deepfake_full_pipeline.py extract --videos raw_videos --out data
  python deepfake_full_pipeline.py train --data data --epochs 10
  python deepfake_full_pipeline.py predict --input suspect.mp4 --gradcam
  python deepfake_full_pipeline.py evaluate --data other_dataset
  python deepfake_full_pipeline.py demo
        """
    )
    sub = ap.add_subparsers(dest="cmd", required=True)

    # ── extract ───────────────────────────────────────────────────────────────
    e = sub.add_parser("extract", help="Phase 3: extract face frames from videos")
    e.add_argument("--videos",    required=True, help="Root folder: videos/real  videos/fake")
    e.add_argument("--out",       default="data", help="Output data dir (default: data)")
    e.add_argument("--frames",    type=int, default=N_FRAMES, help="Frames per video")
    e.add_argument("--val_split", type=float, default=0.2,    help="Fraction for val set")
    e.set_defaults(fn=extract_frames)

    # ── train ─────────────────────────────────────────────────────────────────
    t = sub.add_parser("train", help="Phase 6: train the frame classifier")
    t.add_argument("--data",     default="data",                 help="Data dir")
    t.add_argument("--epochs",   type=int,   default=6,          help="Training epochs (recommended: 5-8)")
    t.add_argument("--batch",    type=int,   default=32,         help="Batch size (recommended: 32)")
    t.add_argument("--lr",       type=float, default=3e-4,       help="Learning rate (recommended: 3e-4)")
    t.add_argument("--weights",  default="weights/deepfake_effnetb0.pt", help="Checkpoint path")
    t.add_argument("--backbone", default="efficientnet_b0",
                   choices=["efficientnet_b0", "efficientnet_b4", "vit_b_16"],
                   help="Backbone architecture (Phase 5)")
    t.add_argument("--lora", action="store_true",
                   help="Enable LoRA parameter-efficient fine-tuning")
    t.add_argument("--lora-rank", type=int, default=16,
                   help="LoRA adapter rank r (default: 16)")
    t.add_argument("--lora-alpha", type=float, default=32.0,
                   help="LoRA scaling alpha (default: 32.0)")
    t.add_argument("--lora-dropout", type=float, default=0.05,
                   help="LoRA dropout rate (default: 0.05)")
    t.add_argument("--label-smoothing", type=float, default=0.05,
                   help="BCE label smoothing factor (default: 0.05)")
    t.set_defaults(fn=train_model)

    # ── train-temporal ────────────────────────────────────────────────────────
    tt = sub.add_parser("train-temporal", help="Phase 8: train LSTM temporal model")
    tt.add_argument("--data",    default="data")
    tt.add_argument("--epochs",  type=int,   default=10)
    tt.add_argument("--batch",   type=int,   default=16)
    tt.add_argument("--lr",      type=float, default=1e-4)
    tt.add_argument("--weights", default="deepfake_effnetb0.pt")
    tt.set_defaults(fn=train_temporal)

    # ── predict ───────────────────────────────────────────────────────────────
    p = sub.add_parser("predict", help="Phase 9: predict fake probability")
    p.add_argument("--input",    required=True, help="Image or video file")
    p.add_argument("--weights",  default="deepfake_effnetb0.pt")
    p.add_argument("--frames",   type=int, default=N_FRAMES)
    p.add_argument("--gradcam",  action="store_true",
                   help="Phase 7: save Grad-CAM overlay images")
    p.add_argument("--backbone", default="efficientnet_b0",
                   choices=["efficientnet_b0", "efficientnet_b4", "vit_b_16"])
    p.set_defaults(fn=predict)

    # ── evaluate ──────────────────────────────────────────────────────────────
    ev = sub.add_parser("evaluate", help="Phase 10: cross-dataset evaluation")
    ev.add_argument("--data",    required=True, help="Test dataset directory")
    ev.add_argument("--weights", default="deepfake_effnetb0.pt")
    ev.add_argument("--batch",   type=int, default=32)
    ev.add_argument("--backbone", default="efficientnet_b0",
                    choices=["efficientnet_b0", "efficientnet_b4", "vit_b_16"])
    ev.set_defaults(fn=evaluate)

    # ── demo ──────────────────────────────────────────────────────────────────
    d = sub.add_parser("demo", help="Phase 11: launch Gradio web app")
    d.add_argument("--weights",  default="deepfake_effnetb0.pt")
    d.add_argument("--backbone", default="efficientnet_b0",
                   choices=["efficientnet_b0", "efficientnet_b4", "vit_b_16"])
    d.set_defaults(fn=launch_demo)

    a = ap.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
