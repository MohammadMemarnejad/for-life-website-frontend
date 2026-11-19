import re
import urllib.request

html = urllib.request.urlopen("https://damizistan.ir/", timeout=30).read().decode()
print("assets:", re.findall(r"/assets/[^\"\s>]+", html))
admin = urllib.request.urlopen(
    "https://damizistan.ir/assets/AdminApp-DFyJx5rY.js", timeout=30
).read().decode("utf-8", "replace")
print("has description key:", "description" in admin)
print("has title label:", "\u0639\u0646\u0648\u0627\u0646 \u067e\u0644\u06cc\u0631" in admin)
print("has subtitle hint:", "\u0645\u062a\u0646 \u0641\u0631\u0639\u06cc" in admin)
