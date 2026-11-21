# 🍃 دَمی برای زیستن | Dami Baray Zistan

> **«برای لمسِ لحظه‌ای زندگی در آشوبِ روزمرگی»**  
> ویترین دیجیتال دورهمی‌های ادبی و فرهنگی در کرمان — با پنل مدیریت محتوا، گالری، و ثبت حضور در گوگل شیت

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.1.6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PHP API](https://img.shields.io/badge/API-PHP-777BB4?logo=php&logoColor=white)]()
[![Live](https://img.shields.io/badge/Live-damizistan.ir-emerald.svg)](https://damizistan.ir/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 فهرست مطالب
- [درباره پروژه](#-درباره-پروژه)
- [بخش‌های سایت](#-بخش‌های-سایت)
- [پنل مدیریت محتوا (CMS)](#-پنل-مدیریت-محتوا-cms)
- [فرم حضور و گوگل شیت](#-فرم-حضور-و-گوگل-شیت)
- [معماری فنی](#-معماری-فنی)
- [مدیریت داده و کانتکست‌ها](#-مدیریت-داده-و-کانتکست‌ها)
- [ساختار پروژه](#-ساختار-پروژه)
- [راه‌اندازی محلی](#-راه‌اندازی-محلی)
- [استقرار روی سرور](#-استقرار-روی-سرور)
- [مجوز](#-مجوز)

---

## 🌿 درباره پروژه

**«دَمی برای زیستن»** بستری فرهنگی و مردمی در **کرمان** است؛ جایی برای مکث، شعرخوانی، هم‌نشینی و حضور واقعی، دور از شتاب روزمره.

این مخزن، فرانت‌اند React + API سبک PHP است که محتوا را بدون دیتابیس در `storage/content.json` نگه می‌دارد و از پنل `/admin` قابل ویرایش است. سایت زنده: [damizistan.ir](https://damizistan.ir/)

---

## 🧭 بخش‌های سایت

### ۱. Navbar
- هدر نیمه‌شفاف با لوگوی SVG برند (`/brand-logo.svg`)
- فاوآیکون تب مرورگر: فقط آیکون پنجره (`/favicon.svg`)
- ناوبری SPA بین خانه، دورهمی پیش‌رو، گالری، درباره ما
- کنترل سریع پخش موسیقی بی‌کلام

### ۲. Hero
- شعار برند + تصویر قهرمان (قابل تنظیم از CMS)
- CTA به دورهمی پیش‌رو و درباره ما

### ۳. داستان ما (Story)
- نوار سبز با قاب‌های قوسی و اسلایدر عکس‌های داستان
- متن و تصویر از محتوا / `siteConfig` مدیریت می‌شود

### ۴. دورهمی پیش‌رو + فرم حضور
- کارت مشخصات رویداد: عنوان، تاریخ، ساعت، **مکان واقعی رویداد**، یادداشت
- فرم RSVP با فیلدهای:
  - نام و نام خانوادگی
  - شماره تماس
- پیام موفقیت مکان را از همان `upcomingEvent.location` می‌گیرد (ثابت «بانو حیاتی» نیست)

### ۵. گالری
- اسلایدر تصادفی در صفحه اول (فقط تصویر، بدون عنوان روی کارت)
- صفحه گالری: آلبوم‌ها / همه عکس‌ها
- لایت‌باکس تصویرمحور با شماره عکس و مکان دورهمی مربوطه

### ۶. پلیر موسیقی شناور
- حالت کپسولی و کارت گسترده
- ترک‌ها از CMS (`tracks` / `musicUrl`)
- در صورت نبود فایل: fallback با Web Audio (سنتور ترکیبی)

### ۷. درباره ما
- فلسفه، ارزش‌ها و روایت مکان از محتوای CMS

### ۸. Footer
- لینک اینستاگرام، نام برند، دامنه و شعار از `siteConfig`

---

## 🗂️ پنل مدیریت محتوا (CMS)

آدرس پنل: **`/admin`**

از طریق پنل می‌توانید این‌ها را ویرایش کنید:
- تنظیمات سایت (نام، شعار، تلفن، اینستاگرام، موزیک، تصاویر، …)
- **وب‌هوک گوگل شیت (Apps Script)**
- دورهمی(های) پیش‌رو
- آلبوم‌ها و عکس‌های گالری
- اسلایدهای داستان، ویژگی‌ها، درباره ما، ترک‌های صوتی
- آپلود تصویر/موزیک به `/uploads`

API سمت سرور:
| Endpoint | نقش |
| :--- | :--- |
| `GET /api/content.php` | خواندن محتوای عمومی |
| `POST /api/content.php` | ذخیره محتوا (نیاز به توکن ادمین) |
| `POST /api/auth.php` | ورود ادمین |
| `POST /api/upload.php` | آپلود فایل |

محتوا روی دیسک: `storage/content.json`  
بذر اولیه: `api/seed.json` و `src/data/content.seed.json`

---

## 📋 فرم حضور و گوگل شیت

فرم «حضور در این دورهمی» دو مسیر ذخیره دارد:

1. **localStorage** مرورگر (`dami_registrations`) — پشتیبان محلی  
2. **Google Apps Script Web App** — ثبت ردیف در شیت

### نکته مهم
مقدار `googleSheetScriptUrl` باید لینک **Apps Script** باشد، نه لینک باز کردن شیت:

```text
✅ https://script.google.com/macros/s/.../exec
❌ https://docs.google.com/spreadsheets/d/.../edit
```

این مقدار از `siteConfig` (API / پنل ادمین / seed) خوانده می‌شود. در پنل ادمین فیلد «وب‌هوک گوگل شیت» برای همین است.

### راه‌اندازی مجدد وب‌هوک (در صورت نیاز)
1. در Google Spreadsheet → `Extensions > Apps Script`
2. تابع `doPost` برای دریافت JSON و افزودن ردیف
3. Deploy به صورت Web App با دسترسی مناسب
4. URL پایان‌یافته به `/exec` را در پنل ادمین یا `content.seed.json` بگذارید

اسکریپت کمکی برای پچ URL روی هاست: `scripts/ftp_patch_sheet_url.py`

---

## 🛠️ معماری فنی

| بخش | ابزار | کاربرد |
| :--- | :--- | :--- |
| فرانت‌اند | React 18 + Vite 5 | SPA، HMR، بیلد پروداکشن |
| استایل | Tailwind CSS 3 | پالت خاکی / زیتونی / سرمه‌ای |
| فونت | **Modam** (لوکال در `/fonts/modam`) | تایپوگرافی فارسی سایت |
| آیکون | Lucide React | آیکون‌های UI |
| محتوا | PHP API بدون DB | `storage/content.json` |
| صوت | HTML5 Audio + Web Audio | پخش MP3 و fallback سنتور |
| استقرار | اسکریپت‌های FTP در `scripts/` | آپلود به هاست `damizistan.ir` |

در توسعه محلی، Vite درخواست‌های `/api` و `/uploads` را به سرور زنده پروکسی می‌کند (`vite.config.js`).

---

## 🔄 مدیریت داده و کانتکست‌ها

1. **`ContentContext`** — بارگذاری محتوا از `/api/content.php` با fallback به `content.seed.json` / `mockData.js`
2. **`AudioContext`** — پخش سراسری، ترک فعال، volume، حالت مینی/گسترده
3. **`AuthContext`** — وضعیت ورود کاربر سایت (مودال عضویت)
4. **ادمین** — توکن جدا در `localStorage` برای پنل `/admin`

---

## 📁 ساختار پروژه

```text
for-life-website-frontend/
├── api/                          # API PHP (محتوا، احراز هویت، آپلود)
│   ├── content.php
│   ├── auth.php
│   ├── upload.php
│   ├── lib.php
│   └── seed.json
├── public/
│   ├── brand-logo.svg            # لوگوی کامل برند
│   ├── favicon.svg               # فقط آیکون پنجره (تب مرورگر)
│   ├── fonts/modam/              # فونت مودام
│   ├── gallery/
│   ├── music.mp3
│   └── …
├── scripts/                      # دیپلوی و تأیید روی هاست
│   ├── ftp_deploy.py
│   ├── ftp_deploy_assets.py
│   ├── ftp_patch_sheet_url.py
│   └── verify_live.py
├── src/
│   ├── admin/AdminApp.jsx        # پنل CMS
│   ├── components/
│   │   ├── about/
│   │   ├── auth/
│   │   ├── common/               # Navbar, Footer, MusicPlayer
│   │   ├── gallery/
│   │   └── home/                 # Hero, Story, Meetup, GallerySlider
│   ├── context/                  # Content, Audio, Auth
│   ├── data/
│   │   ├── content.seed.json     # بذر محتوا
│   │   └── mockData.js
│   ├── utils/ambientPlayer.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx                  # روت سایت یا /admin
├── deploy-package/               # بسته آماده استقرار (اختیاری)
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## ⚡ راه‌اندازی محلی

### پیش‌نیاز
- Node.js 18+

```bash
git clone https://github.com/MohammadMemarnejad/for-life-website-frontend.git
cd for-life-website-frontend
npm install
npm run dev
```

به‌طور پیش‌فرض Vite روی پورت **3000** اجرا می‌شود:

```text
http://localhost:3000
```

پنل ادمین محلی:

```text
http://localhost:3000/admin
```

بیلد پروداکشن:

```bash
npm run build
npm run preview
```

خروجی در پوشه `dist/` است.

---

## 🌐 استقرار روی سرور

هاست فعلی محتوا را از `storage/content.json` و فرانت را از `dist/` / `deploy-package` سرو می‌کند.

### مسیر ساده
1. `npm run build`
2. آپلود محتویات `dist/` + پوشه `api/` + `storage/` روی هاست
3. مطمئن شوید `storage/` و `uploads/` قابل نوشتن هستند

### اسکریپت‌های موجود
| اسکریپت | کار |
| :--- | :--- |
| `scripts/ftp_deploy.py` | دیپلوی کامل بسته |
| `scripts/ftp_deploy_assets.py` | فقط دارایی‌های فرانت بعد از بیلد |
| `scripts/ftp_patch_sheet_url.py` | اصلاح URL گوگل شیت روی سرور |
| `scripts/verify_live.py` | بررسی سلامت سایت زنده |

متغیرهای محیطی FTP: `FTP_HOST`، `FTP_USER`، `FTP_PASS`

### به‌روزرسانی محتوا بدون بیلد
از پنل `/admin` ذخیره کنید، یا فقط `storage/content.json` را روی سرور عوض کنید.

---

## 📜 مجوز

طراحی و توسعه‌یافته برای فرهنگ و ادب ایران‌زمین.  
حقوق معنوی نام و محتوای برند متعلق به **«دَمی برای زیستن»** است.  
کد منبع تحت مجوز **MIT** منتشر شده است.
