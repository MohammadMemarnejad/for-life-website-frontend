#!/usr/bin/env python3
"""Patch googleSheetScriptUrl in remote storage/content.json via FTP."""
from __future__ import annotations

import json
import os
import sys
import tempfile
from ftplib import FTP, error_perm
from io import BytesIO
from pathlib import Path

HOST = os.environ.get("FTP_HOST", "damizistan.ir")
USER = os.environ.get("FTP_USER", "")
PASS = os.environ.get("FTP_PASS", "")
REMOTE_ROOT = "/for-life"
REMOTE_CONTENT = f"{REMOTE_ROOT}/storage/content.json"
SCRIPT_URL = (
    "https://script.google.com/macros/s/"
    "AKfycbw7OO3Ja5wV0lMHCHo6xDwOroqXmHBO3wvZ3jhVVaokGfDlT6M1SDz-1UrIyOn6iGDWCQ/exec"
)
LOCAL_CONTENT = Path(__file__).resolve().parents[1] / "deploy-package" / "storage" / "content.json"


def main() -> int:
    if not USER or not PASS:
        print("FTP_USER / FTP_PASS required", file=sys.stderr)
        return 1

    # Prefer local fixed copy if present; otherwise download+patch remote
    if LOCAL_CONTENT.is_file():
        data = json.loads(LOCAL_CONTENT.read_text(encoding="utf-8"))
        data.setdefault("siteConfig", {})["googleSheetScriptUrl"] = SCRIPT_URL
        payload = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
        print("using local deploy-package/storage/content.json")
    else:
        print("local content missing; will download remote", file=sys.stderr)
        return 1

    ftp = FTP()
    ftp.connect(HOST, 21, timeout=120)
    ftp.login(USER, PASS)
    ftp.set_pasv(True)
    print(f"connected as {USER}")

    # Ensure storage exists
    for part in ("for-life", "for-life/storage"):
        try:
            ftp.mkd("/" + part if not part.startswith("/") else part)
        except error_perm:
            pass

    bio = BytesIO(payload)
    ftp.storbinary(f"STOR {REMOTE_CONTENT}", bio)
    print(f"uploaded {REMOTE_CONTENT}")
    print("googleSheetScriptUrl ->", SCRIPT_URL)
    ftp.quit()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
