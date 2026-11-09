import React from 'react';

export default function Hero({ onExploreClick, onMeetupClick }) {
  const handleMeetupClick = (e) => {
    const elem = document.getElementById('meetup-section');
    if (elem) {
      e.preventDefault();
      elem.scrollIntoView({ behavior: 'smooth' });
    } else if (onMeetupClick) {
      onMeetupClick();
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#FAF7F0] pt-6 sm:pt-10 pb-16 sm:pb-24">
      {/* 1. Horizontal Full-Width Green Band behind the window */}
      <div className="relative w-full flex items-center justify-center">
        {/* Full-width green stripe */}
        <div className="absolute w-full h-32 sm:h-44 md:h-52 lg:h-60 bg-[#9EB456] top-1/2 -translate-y-1/2 z-0 shadow-inner"></div>

        {/* 2. Central Persian Stained-Glass Window Art (Orsi) */}
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-[480px] md:max-w-[580px] lg:max-w-[660px] px-4 transition-transform duration-500 hover:scale-[1.015]">
          <img
            src="/window-hero.png"
            alt="پنجره ارسی سنتی ایرانی گشوده به دورهمی - دمی برای زیستن"
            className="w-full h-auto object-contain filter drop-shadow-2xl select-none"
            loading="eager"
            draggable={false}
          />
        </div>
      </div>

      {/* 3. Centered Headline & Action Button */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center mt-10 sm:mt-14">
        {/* Multicolored Headline matching Hero.png */}
        <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-black tracking-tight leading-tight sm:leading-snug">
          <span className="text-[#3E4A5C]">برای لمسِ </span>
          <span className="text-[#4F8880]">لحظه‌ای </span>
          <span className="text-[#9BB14E]">زندگی </span>
          <span className="text-[#3E4A5C]">در آشوبِ روزمرگی</span>
        </h1>

        {/* 4. Single Centered Action Button matching Hero.png */}
        <div className="mt-8 sm:mt-10 flex justify-center">
          <a
            href="#meetup-section"
            onClick={handleMeetupClick}
            className="inline-flex items-center justify-center px-10 py-3 sm:py-3.5 rounded-full bg-[#94A751] hover:bg-[#869941] text-white font-medium text-base sm:text-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
          >
            دورهمی پیش‌رو
          </a>
        </div>
      </div>
    </section>
  );
}

