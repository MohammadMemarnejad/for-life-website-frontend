import React from 'react';
import { siteConfig } from '../../data/mockData';
import { ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#E7E3D8] bg-[#FAF7F0] py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Instagram Pill Link - Exactly matching footer.jpg */}
          <div className="order-2 md:order-1">
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 border border-[#D5DFCA] text-navy-800 text-sm font-medium hover:bg-olive-50 hover:border-olive-500 hover:text-olive-800 shadow-sm transition-all group"
            >
              <span>همراهی در اینستاگرام</span>
              <ExternalLink size={15} className="text-olive-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          {/* Brand Info & City - Exactly matching footer.jpg */}
          <div className="order-1 md:order-2 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
              <img src="/favicon.png" alt="آیکون دمی برای زیستن" className="w-5 h-5 object-contain" />
              <span className="text-base font-bold text-navy-900 tracking-tight">
                {siteConfig.name}
              </span>
              <span className="text-xs text-olive-800 font-mono font-medium dir-ltr">
                ({siteConfig.domain})
              </span>
            </div>
            <p className="text-xs text-[#707A65]">
              {siteConfig.slogan} • {siteConfig.city}
            </p>
          </div>

        </div>

        {/* Minimal Copyright / Credits */}
        <div className="mt-8 pt-4 border-t border-[#E7E3D8]/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#8C9681]">
          <div>
            تمامی حقوق برای دورهمی ادبی و فرهنگی «{siteConfig.name}» محفوظ است.
          </div>
          <div>
            طراحی‌شده با تمرکز بر «آهستگی» و زیستن در لحظه
          </div>
        </div>

      </div>
    </footer>
  );
}
