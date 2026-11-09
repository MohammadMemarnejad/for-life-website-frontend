import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Sparkles, Send, CheckCircle2, Bookmark, Loader2 } from 'lucide-react';
import { upcomingEvent, siteConfig } from '../../data/mockData';

export default function MeetupSection() {
  const [interestSubmitted, setInterestSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    note: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.contact) return;

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      contact: formData.contact.trim(),
      note: formData.note.trim(),
      event: upcomingEvent.title,
      date: upcomingEvent.date,
      timestamp: new Date().toLocaleString('fa-IR'),
    };

    // 1. Save backup to browser localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('dami_registrations') || '[]');
      stored.push(payload);
      localStorage.setItem('dami_registrations', JSON.stringify(stored));
    } catch (err) {
      // LocalStorage fallback
    }

    // 2. Send to Google Sheets Apps Script Webhook if configured
    const webhookUrl = siteConfig.googleSheetScriptUrl;
    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error('Submission to Google Sheets error:', err);
      }
    } else {
      // Small simulated delay for realistic feel
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    setIsSubmitting(false);
    setInterestSubmitted(true);
  };

  return (
    <section id="meetup-section" className="py-16 bg-[#FAF7F0] border-t border-[#E7E3D8]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header - Exactly from form.jpg */}
        <div className="text-right space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-olive-700 text-white text-xs font-medium">
            <Sparkles size={12} />
            <span>{upcomingEvent.categoryBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#222D42] tracking-tight">
            {upcomingEvent.heading}
          </h2>

          <p className="text-sm sm:text-base text-[#5F6B7A] font-light max-w-2xl">
            {upcomingEvent.subheading}
          </p>
        </div>

        {/* Meetup Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Green Event Details Card - Matching right side of form.jpg */}
          <div className="lg:col-span-6 bg-[#4A622E] text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[460px]">
            {/* Top Pattern Texture */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none"></div>

            <div className="relative z-10 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full bg-[#E4D8BF] text-[#344722] text-xs font-semibold">
                <span>{upcomingEvent.badge}</span>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-snug">
                  {upcomingEvent.title}
                </h3>
                <p className="text-xs sm:text-sm text-olive-100 font-light leading-relaxed">
                  {upcomingEvent.subtitle}
                </p>
              </div>

              {/* Meta Rows with Icons */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 text-sm text-white/95">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Calendar size={16} className="text-olive-200" />
                  </div>
                  <span>{upcomingEvent.date}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-white/95">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-olive-200" />
                  </div>
                  <span>{upcomingEvent.time}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-white/95">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-olive-200" />
                  </div>
                  <span>{upcomingEvent.location}</span>
                </div>
              </div>
            </div>

            {/* Bottom Note Container */}
            <div className="relative z-10 mt-8 p-4 rounded-2xl bg-black/20 border border-white/10 text-xs sm:text-sm text-olive-50 leading-relaxed font-light">
              {upcomingEvent.note}
            </div>

          </div>

          {/* Left Column: Hospitality & Registration Readiness Info */}
          <div className="lg:col-span-6 bg-white/80 rounded-3xl border border-[#E7E3D8] p-8 sm:p-10 shadow-sm flex flex-col justify-between min-h-[460px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-[#222D42]">
                  حضور در این دورهمی
                </h4>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ورود برای عموم علاقه‌مندان آزاد است
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#5F6B7A] leading-relaxed mb-6 font-light">
                در نسخه اولیه وب‌سایت، حضور در دورهمی‌ها نیازمند ثبت‌نام رسمی نیست و ورود رایگان و صمیمانه است. با این حال، چنانچه تمایل دارید پیش از دورهمی متن شعر یا آمادگی خود را اعلام فرمایید یا یادآوری دریافت کنید، می‌توانید یادداشت کوتاهی بگذارید:
              </p>

              {interestSubmitted ? (
                <div className="p-6 bg-olive-50 border border-olive-200 rounded-2xl text-center space-y-3 fade-in">
                  <CheckCircle2 size={36} className="text-olive-700 mx-auto" />
                  <h5 className="text-base font-bold text-olive-900">
                    مشتاقانه منتظر دیدارتان در اکوموزه بانو حیاتی هستیم!
                  </h5>
                  <p className="text-xs text-olive-800 leading-relaxed">
                    یادداشت شما با موفقیت ثبت شد. پنج‌شنبه با یک استکان چای گرم پذیرای شما خواهیم بود.
                  </p>
                  <button
                    onClick={() => setInterestSubmitted(false)}
                    className="text-xs text-olive-700 underline font-medium mt-2"
                  >
                    ثبت یادداشت جدید
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-800 mb-1.5">
                      نام و نام خانوادگی
                    </label>
                    <input
                      type="text"
                      placeholder="مثلاً: سهراب سپهری"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#FAF7F0]/60 text-sm focus:outline-none focus:border-olive-600 focus:bg-white transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-800 mb-1.5">
                      شماره تماس یا آیدی اینستاگرام
                    </label>
                    <input
                      type="text"
                      placeholder="0913... یا @username"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#FAF7F0]/60 text-sm focus:outline-none focus:border-olive-600 focus:bg-white transition-colors dir-ltr text-right"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-800 mb-1.5">
                      یادداشت یا شعری که دوست دارید (اختیاری)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="اگر بار اولتان است یا متنی برای خواندن دارید بنویسید..."
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E7E3D8] bg-[#FAF7F0]/60 text-sm focus:outline-none focus:border-olive-600 focus:bg-white transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 rounded-xl bg-navy-800 hover:bg-navy-900 disabled:bg-stone-400 text-white text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-olive-300" />
                        <span>در حال ثبت همراهی...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>اعلام همراهی و ثبت حضور</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E7E3D8]/60 flex items-center justify-between text-xs text-[#8C9681]">
              <span>پذیرایی با چای سنتی ایرانی</span>
              <span>همراه داشتن کتاب یا شعر دلخواه آزاد است</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
