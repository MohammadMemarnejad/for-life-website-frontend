#!/usr/bin/env python3
"""Deploy Modam font + rebuilt frontend assets to /for-life."""
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
    ensure_dir(ftp, str(Path(remote).parent).replace("\\", "/"))
    with local.open("rb") as fh:
        ftp.storbinary(f"STOR {remote}", fh)
    print(f"  uploaded {remote}")


def main() -> int:
    if not USER or not PASS:
        print("FTP_USER / FTP_PASS required", file=sys.stderr)
        return 1
    if not DIST.is_dir():
        print("missing dist", file=sys.stderr)
        return 1

    ftp = FTP()
    ftp.connect(HOST, 21, timeout=120)
    ftp.login(USER, PASS)
    ftp.set_pasv(True)
    print("connected, deploying Modam font")

    clear_assets(ftp)
    for path in sorted((DIST / "assets").iterdir()):
        if path.is_file():
            upload_file(ftp, path, f"{REMOTE_ROOT}/assets/{path.name}")
    upload_file(ftp, DIST / "index.html", f"{REMOTE_ROOT}/index.html")

    fonts_dir = DIST / "fonts" / "modam"
    for path in sorted(fonts_dir.glob("*.ttf")):
        upload_file(ftp, path, f"{REMOTE_ROOT}/fonts/modam/{path.name}")

    mirror = Path(r"E:\dami\for-life\for-life")
    if mirror.exists():
        assets = mirror / "assets"
        assets.mkdir(exist_ok=True)
        for old in assets.glob("*"):
            if old.is_file():
                old.unlink()
        for path in (DIST / "assets").iterdir():
            if path.is_file():
                (assets / path.name).write_bytes(path.read_bytes())
        (mirror / "index.html").write_bytes((DIST / "index.html").read_bytes())
        mirror_fonts = mirror / "fonts" / "modam"
        mirror_fonts.mkdir(parents=True, exist_ok=True)
        for path in fonts_dir.glob("*.ttf"):
            (mirror_fonts / path.name).write_bytes(path.read_bytes())
        print("local for-life mirror updated")

    ftp.quit()
    print("deploy complete")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
