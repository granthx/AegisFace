"""
=============================================================================
  DATASET TOOL — DOWNLOAD & EXTRACT KAGGLE IMAGE DATASETS
=============================================================================

Supported datasets:
  1) xhlulu/140k-real-and-fake-faces (Recommended: high quality 140k 256x256 faces)
  2) manjilkarki/deepfake-and-real-images

Usage:
  # Option 1: Direct Kaggle download (requires ~/.kaggle/kaggle.json or env vars)
  python dataset_tool.py download --dataset xhlulu/140k-real-and-fake-faces

  # Option 2: Extract any downloaded zip file automatically into data/train and data/val
  python dataset_tool.py extract-zip --zip archive.zip

  # Option 3: Verify and print summary of data/train and data/val splits
  python dataset_tool.py verify
"""

import argparse
import os
import shutil
import sys
import zipfile
from pathlib import Path


def verify_dataset(data_dir: Path = Path("data")):
    """Check class counts in train and val directories."""
    print("=" * 60)
    print(f"Dataset Verification at: {data_dir.resolve()}")
    print("=" * 60)

    splits = ["train", "val"]
    classes = ["real", "fake"]
    total_images = 0

    valid_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

    for split in splits:
        split_path = data_dir / split
        if not split_path.exists():
            print(f"[!] Warning: Missing folder: {split_path}")
            continue

        print(f"\n--- Split: {split.upper()} ---")
        split_total = 0
        for cls in classes:
            cls_path = split_path / cls
            if not cls_path.exists():
                print(f"  {cls}: Missing folder ({cls_path})")
                continue

            count = sum(1 for f in cls_path.iterdir() if f.suffix.lower() in valid_extensions)
            print(f"  {cls:4s}: {count:,} images")
            split_total += count
            total_images += count

        print(f"  Total {split}: {split_total:,} images")

    print("\n" + "=" * 60)
    print(f"Grand Total Images Ready: {total_images:,}")
    print("=" * 60)
    return total_images > 0


def extract_zip(zip_path_str: str, target_dir: Path = Path("data")):
    """Extract a downloaded dataset zip file and structure it into data/train and data/val."""
    zip_path = Path(zip_path_str)
    if not zip_path.exists():
        # Check in user's Downloads folder as fallback
        downloads_candidate = Path.home() / "Downloads" / zip_path.name
        if downloads_candidate.exists():
            zip_path = downloads_candidate
        else:
            print(f"[ERROR] Zip file not found: {zip_path_str}")
            print(f"Also checked in Downloads: {downloads_candidate}")
            return False

    temp_extract = Path("data_temp_extract")
    if temp_extract.exists():
        shutil.rmtree(temp_extract)
    temp_extract.mkdir(parents=True, exist_ok=True)

    print(f"[*] Extracting {zip_path} (this may take a minute for large archives)...")
    with zipfile.ZipFile(zip_path, 'r') as zf:
        zf.extractall(temp_extract)
    print("[*] Extraction complete. Organizing directory structure...")

    # Organize known structures
    # 1. 140k-real-and-fake-faces structure:
    #    real_vs_fake/real-vs-fake/{train,valid,test}/{real,fake}
    found_train = None
    found_val = None

    for root, dirs, files in os.walk(temp_extract):
        root_path = Path(root)
        dir_names = [d.lower() for d in dirs]
        if "real" in dir_names and "fake" in dir_names:
            parent_name = root_path.name.lower()
            if parent_name in ("train", "training"):
                found_train = root_path
            elif parent_name in ("valid", "val", "validation", "test"):
                if found_val is None:
                    found_val = root_path

    if found_train and found_val:
        print(f"[*] Detected train set at: {found_train}")
        print(f"[*] Detected val set at  : {found_val}")

        for cls in ("real", "fake"):
            dst_tr = target_dir / "train" / cls
            dst_va = target_dir / "val" / cls
            dst_tr.mkdir(parents=True, exist_ok=True)
            dst_va.mkdir(parents=True, exist_ok=True)

            # Move or copy
            for f in (found_train / cls).iterdir():
                if f.is_file():
                    shutil.move(str(f), str(dst_tr / f.name))

            for f in (found_val / cls).iterdir():
                if f.is_file():
                    shutil.move(str(f), str(dst_va / f.name))

    else:
        # Fallback: Search all real and fake files and split 80/20
        print("[*] Performing automatic 80/20 train/val partition...")
        import random
        random.seed(42)

        for cls in ("real", "fake"):
            dst_tr = target_dir / "train" / cls
            dst_va = target_dir / "val" / cls
            dst_tr.mkdir(parents=True, exist_ok=True)
            dst_va.mkdir(parents=True, exist_ok=True)

            all_cls_files = [
                Path(r) / f
                for r, _, files in os.walk(temp_extract)
                for f in files
                if cls in Path(r).name.lower() and Path(f).suffix.lower() in {".jpg", ".jpeg", ".png"}
            ]

            random.shuffle(all_cls_files)
            n_val = max(1, int(len(all_cls_files) * 0.2))
            val_files = all_cls_files[:n_val]
            train_files = all_cls_files[n_val:]

            for f in train_files:
                shutil.move(str(f), str(dst_tr / f.name))
            for f in val_files:
                shutil.move(str(f), str(dst_va / f.name))

    # Clean up temporary extract directory
    try:
        shutil.rmtree(temp_extract)
    except Exception:
        pass

    print("[SUCCESS] Dataset successfully organized into data/train and data/val!")
    verify_dataset(target_dir)
    return True


def download_from_kaggle(dataset_slug: str, target_dir: Path = Path("data")):
    """Download directly from Kaggle using kaggle API."""
    try:
        from kaggle.api.kaggle_api_extended import KaggleApi
    except ImportError:
        print("[ERROR] kaggle package is not installed. Run: pip install kaggle")
        return False

    api = KaggleApi()
    try:
        api.authenticate()
        print("[*] Successfully authenticated with Kaggle API.")
    except Exception as e:
        print("[ERROR] Kaggle authentication failed!")
        print("Please ensure you have either:")
        print("  1. ~/.kaggle/kaggle.json with your username and key.")
        print("  2. Set environment variables KAGGLE_USERNAME and KAGGLE_KEY.")
        print(f"Details: {e}")
        return False

    download_dir = Path("kaggle_downloads")
    download_dir.mkdir(exist_ok=True)
    print(f"[*] Downloading dataset '{dataset_slug}' to {download_dir}...")
    api.dataset_download_files(dataset_slug, path=str(download_dir), unzip=True)
    print("[*] Download complete. Organizing...")

    # Look for zip or extracted files in download_dir
    extract_zip(str(download_dir), target_dir)
    return True


def main():
    parser = argparse.ArgumentParser(description="Kaggle Dataset Downloader and Extractor Tool")
    sub = parser.add_subparsers(dest="cmd", required=True)

    # download
    d_cmd = sub.add_parser("download", help="Download a dataset using Kaggle API")
    d_cmd.add_argument("--dataset", default="xhlulu/140k-real-and-fake-faces",
                       help="Kaggle dataset slug (e.g., xhlulu/140k-real-and-fake-faces)")

    # extract-zip
    e_cmd = sub.add_parser("extract-zip", help="Extract and structure a local downloaded zip file")
    e_cmd.add_argument("--zip", required=True, help="Path to the downloaded .zip file")

    # verify
    sub.add_parser("verify", help="Check class counts in data/train and data/val")

    args = parser.parse_args()

    if args.cmd == "download":
        download_from_kaggle(args.dataset)
    elif args.cmd == "extract-zip":
        extract_zip(args.zip)
    elif args.cmd == "verify":
        verify_dataset()


if __name__ == "__main__":
    main()

