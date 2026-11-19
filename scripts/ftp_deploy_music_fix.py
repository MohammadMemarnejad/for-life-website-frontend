#!/usr/bin/env python3
"""Upload rebuilt frontend assets + api/lib.php for music player meta edits."""
from __future__ import annotations

import os
import sys
from ftplib import FTP, error_perm
from pathlib import Path

HOST = os.environ.get("FTP_HOST", "damizistan.ir")
USER = os.environ.get("FTP_USER", "")
PASS = os.environ.get("FTP_PASS", "")
REMOTE_ROOT = "/for-life"
ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
API_LIB = ROOT / "api" / "lib.php"


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


def clear_assets(ftp: FTP) -> None:
    remote = f"{REMOTE_ROOT}/assets"
    ensure_dir(ftp, remote)
    ftp.cwd(remote)
    for name in list(list_names(ftp)):
        try:
            ftp.delete(name)
            print(f"  deleted assets/{name}")
        except error_perm as exc:
            print(f"  skip {name}: {exc}")
    ftp.cwd(REMOTE_ROOT)


def upload_file(ftp: FTP, local: Path, remote: str) -> None:
    with local.open("rb") as fh:
        ftp.storbinary(f"STOR {remote}", fh)
    print(f"  uploaded {remote}")


def main() -> int:
    if not USER or not PASS:
        print("FTP_USER / FTP_PASS required", file=sys.stderr)
        return 1
    if not DIST.is_dir() or not API_LIB.is_file():
        print("missing dist or api/lib.php", file=sys.stderr)
        return 1

    ftp = FTP()
    ftp.connect(HOST, 21, timeout=120)
    ftp.login(USER, PASS)
    ftp.set_pasv(True)
    print("connected, updating music player files")

    clear_assets(ftp)
    for path in sorted((DIST / "assets").iterdir()):
        if path.is_file():
            upload_file(ftp, path, f"{REMOTE_ROOT}/assets/{path.name}")
    upload_file(ftp, DIST / "index.html", f"{REMOTE_ROOT}/index.html")
    upload_file(ftp, API_LIB, f"{REMOTE_ROOT}/api/lib.php")

    # keep local host mirror in sync
    mirror = Path(r"E:\dami\for-life\for-life")
    if mirror.exists():
        assets = mirror / "assets"
        assets.mkdir(exist_ok=True)
        for old in assets.glob("*"):
            old.unlink()
        for path in (DIST / "assets").iterdir():
            if path.is_file():
                (assets / path.name).write_bytes(path.read_bytes())
        (mirror / "index.html").write_bytes((DIST / "index.html").read_bytes())
        (mirror / "api" / "lib.php").write_bytes(API_LIB.read_bytes())
        print("local for-life mirror updated")

    ftp.quit()
    print("deploy complete")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
