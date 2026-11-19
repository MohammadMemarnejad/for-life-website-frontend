#!/usr/bin/env python3
"""One-shot FTP deploy of deploy-package -> /for-life on the host."""
from __future__ import annotations

import os
import sys
from ftplib import FTP, error_perm
from pathlib import Path

HOST = os.environ.get("FTP_HOST", "damizistan.ir")
USER = os.environ.get("FTP_USER", "")
PASS = os.environ.get("FTP_PASS", "")
REMOTE_ROOT = "/for-life"
LOCAL_ROOT = Path(__file__).resolve().parents[1] / "deploy-package"

# Never wipe these on remote (merge only)
PRESERVE_DIRS = {"storage", "uploads"}


def ensure_dir(ftp: FTP, path: str) -> None:
    parts = [p for p in path.split("/") if p]
    cur = ""
    for part in parts:
        cur += "/" + part
        try:
            ftp.mkd(cur)
        except error_perm:
            pass


def list_names(ftp: FTP) -> set[str]:
    names: set[str] = set()
    try:
        ftp.retrlines("NLST", names.add)
    except error_perm:
        pass
    return {n.split("/")[-1] for n in names if n not in (".", "..")}


def clear_remote_dir(ftp: FTP, remote_dir: str) -> None:
    ftp.cwd(remote_dir)
    for name in list(list_names(ftp)):
        try:
            ftp.delete(name)
            print(f"  deleted {remote_dir}/{name}")
        except error_perm:
            try:
                clear_remote_dir(ftp, f"{remote_dir}/{name}")
                ftp.cwd(remote_dir)
                ftp.rmd(name)
            except error_perm as exc:
                print(f"  skip delete {name}: {exc}")
    ftp.cwd(REMOTE_ROOT)


def upload_file(ftp: FTP, local: Path, remote: str) -> None:
    ensure_dir(ftp, str(Path(remote).parent).replace("\\", "/"))
    with local.open("rb") as fh:
        ftp.storbinary(f"STOR {remote}", fh)
    print(f"  uploaded {remote}")


def upload_tree(ftp: FTP, local_dir: Path, remote_dir: str, *, replace_files: bool = True) -> None:
    ensure_dir(ftp, remote_dir)
    for path in sorted(local_dir.rglob("*")):
        rel = path.relative_to(local_dir).as_posix()
        remote = f"{remote_dir}/{rel}"
        if path.is_dir():
            ensure_dir(ftp, remote)
            continue
        if not replace_files:
            # skip existing same-size files for large upload trees
            try:
                size = ftp.size(remote)
                if size is not None and size == path.stat().st_size:
                    continue
            except error_perm:
                pass
        upload_file(ftp, path, remote)


def main() -> int:
    if not USER or not PASS:
        print("FTP_USER / FTP_PASS required", file=sys.stderr)
        return 1
    if not LOCAL_ROOT.is_dir():
        print(f"missing {LOCAL_ROOT}", file=sys.stderr)
        return 1

    ftp = FTP()
    ftp.connect(HOST, 21, timeout=120)
    ftp.login(USER, PASS)
    ftp.set_pasv(True)
    print(f"connected as {USER}, deploying {LOCAL_ROOT} -> {REMOTE_ROOT}")

    ensure_dir(ftp, REMOTE_ROOT)
    ftp.cwd(REMOTE_ROOT)

    # Replace hashed frontend assets completely
    print("refresh assets/")
    ensure_dir(ftp, f"{REMOTE_ROOT}/assets")
    clear_remote_dir(ftp, f"{REMOTE_ROOT}/assets")
    upload_tree(ftp, LOCAL_ROOT / "assets", f"{REMOTE_ROOT}/assets")

    # Frontend shell + configs
    for name in [
        "index.html",
        ".htaccess",
        ".user.ini",
        "php.ini",
        "music.mp3",
        "window-hero.png",
        "tea-illustration.jpg",
        "arch-frame.png",
        "brand-logo-hd.png",
        "brand-logo.png",
        "brand-logo.svg",
        "favicon.png",
        "favicon.svg",
    ]:
        local = LOCAL_ROOT / name
        if local.exists():
            upload_file(ftp, local, f"{REMOTE_ROOT}/{name}")

    # PHP API
    print("refresh api/")
    upload_tree(ftp, LOCAL_ROOT / "api", f"{REMOTE_ROOT}/api")

    # Content (same as host, keep auth)
    print("sync storage/")
    upload_file(ftp, LOCAL_ROOT / "storage" / "content.json", f"{REMOTE_ROOT}/storage/content.json")
    upload_file(ftp, LOCAL_ROOT / "storage" / ".htaccess", f"{REMOTE_ROOT}/storage/.htaccess")
    # keep remote auth.json; only upload if missing
    try:
        ftp.size(f"{REMOTE_ROOT}/storage/auth.json")
        print("  keep existing auth.json")
    except error_perm:
        auth = LOCAL_ROOT / "storage" / "auth.json"
        if auth.exists():
            upload_file(ftp, auth, f"{REMOTE_ROOT}/storage/auth.json")

    # Uploads merge (images + music folder)
    print("sync uploads/ (merge)")
    ensure_dir(ftp, f"{REMOTE_ROOT}/uploads/images")
    ensure_dir(ftp, f"{REMOTE_ROOT}/uploads/music")
    upload_file(ftp, LOCAL_ROOT / "uploads" / ".htaccess", f"{REMOTE_ROOT}/uploads/.htaccess")
    if (LOCAL_ROOT / "uploads" / "images").exists():
        upload_tree(
            ftp,
            LOCAL_ROOT / "uploads" / "images",
            f"{REMOTE_ROOT}/uploads/images",
            replace_files=False,
        )
    if (LOCAL_ROOT / "uploads" / "music").exists():
        upload_tree(
            ftp,
            LOCAL_ROOT / "uploads" / "music",
            f"{REMOTE_ROOT}/uploads/music",
            replace_files=False,
        )

    if (LOCAL_ROOT / "gallery").exists():
        print("sync gallery/")
        upload_tree(ftp, LOCAL_ROOT / "gallery", f"{REMOTE_ROOT}/gallery", replace_files=False)

    ftp.quit()
    print("deploy complete")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
