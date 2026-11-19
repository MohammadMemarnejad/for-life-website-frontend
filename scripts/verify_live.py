import json
import re
import urllib.request

html = urllib.request.urlopen("https://damizistan.ir/", timeout=30).read().decode("utf-8", "replace")
assets = re.findall(r"/assets/[^\"\s>]+", html)
print("index assets:", assets)

data = json.load(urllib.request.urlopen("https://damizistan.ir/api/content.php", timeout=30))
print("event location:", data.get("upcomingEvent", {}).get("location"))
print("albums:", len(data.get("meetupAlbums") or []))
print("musicUrl:", data.get("siteConfig", {}).get("musicUrl"))
print("tracks:", data.get("tracks"))

r = urllib.request.urlopen("https://damizistan.ir/music.mp3", timeout=30)
print("music", r.status, r.headers.get("content-type"), r.headers.get("content-length"))

img = data["meetupAlbums"][0]["photos"][0]["image"]
r2 = urllib.request.urlopen("https://damizistan.ir" + img, timeout=30)
print("sample image", img, r2.status)

js_path = next(a for a in assets if a.endswith(".js") and "AdminApp" not in a)
js = urllib.request.urlopen("https://damizistan.ir" + js_path, timeout=30).read().decode("utf-8", "replace")
print("main js", js_path)
print("has api/content.php:", "api/content.php" in js)
print("hardcoded venue count:", js.count("اکوموزه بانو حیاتی • کرمان"))

admin = urllib.request.urlopen("https://damizistan.ir/assets/AdminApp-CElzhmja.js", timeout=30)
print("admin js", admin.status, admin.headers.get("content-length"))

try:
    urllib.request.urlopen("https://damizistan.ir/api/upload.php", timeout=30)
except urllib.error.HTTPError as exc:
    print("upload endpoint HTTP", exc.code, "(expected 405 for GET)")
except Exception as exc:
    print("upload endpoint error", exc)
