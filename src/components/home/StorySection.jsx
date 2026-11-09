import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Hourglass, LayoutGrid, Sparkles, Check, Shuffle } from 'lucide-react';
import { features } from '../../data/mockData';

export default function StorySection({ onReadFullStory, onOpenPoetry }) {
  const [showPuzzleModal, setShowPuzzleModal] = useState(false);
  const [puzzleWords, setPuzzleWords] = useState([
    { id: 1, text: 'زندگی' },
    { id: 2, text: 'شستن' },
    { id: 3, text: 'یک بشقاب' },
    { id: 4, text: 'است' },
    { id: 5, text: 'در شتاب' },
  ]);
  const [solved, setSolved] = useState(false);

  const getIcon = (type) => {
    switch (type) {
      case 'hourglass':
        return <Hourglass className="w-8 h-8 text-olive-700" strokeWidth={1.5} />;
      case 'grid':
        return <LayoutGrid className="w-8 h-8 text-olive-700" strokeWidth={1.5} />;
      case 'book':
      default:
        return <BookOpen className="w-8 h-8 text-olive-700" strokeWidth={1.5} />;
    }
  };

  return (
    <section className="py-12 bg-[#FAF7F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Story Card - Faithful to section.jpg */}
        <div className="bg-white/80 rounded-3xl border border-[#E7E3D8] p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Right side: Text and Badge */}
            <div className="lg:col-span-8 order-2 lg:order-1 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-olive-700 text-white text-xs font-medium">
                <Sparkles size={12} />
                <span>داستان ما</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#222D42] tracking-tight leading-snug">
                مکثی کوتاه، میانِ هیاهوی روزها
              </h2>

              <p className="text-sm sm:text-base text-[#4A5568] leading-relaxed max-w-2xl font-light">
                «دَمی برای زیستن» دورهمی‌ای صمیمی و عمیق است که در آن با کمکِ شعر و ادبیات، برای لمسِ لحظه‌ای زندگی در آشوبِ روزمرگی مجالی می‌سازیم. ما اینجا «آهستگی» را تمرین می‌کنیم تا در هر لحظه‌ای که هستیم، واقعاً حضور داشته باشیم.
              </p>

              <div className="pt-2">
                <button
                  onClick={onReadFullStory}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-olive-700 hover:text-olive-900 transition-colors group"
                >
                  <span>خواندن کاملِ داستانِ دَمی برای زیستن</span>
                  <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Left side: Persian Tea & Book illustration - exactly from section.jpg */}
            <div className="lg:col-span-4 order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="w-56 sm:w-64 transform hover:rotate-1 transition-transform duration-300">
                <img
                  src="/tea-illustration.jpg"
                  alt="استکان چای ایرانی و دفتر شعر"
                  className="w-full h-auto object-contain rounded-xl"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Bottom 3 Feature Cards - Faithful to section.jpg */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((item) => (
            <div
              key={item.id}
              className="bg-white/80 rounded-3xl border border-[#E7E3D8] p-7 flex flex-col justify-between hover:shadow-md hover:border-[#D5DFCA] transition-all duration-300 group"
            >
              <div>
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 rounded-full bg-[#FAF7F0] border border-[#E7E3D8] text-xs font-medium text-[#707A65]">
                    {item.badge}
                  </span>
                  <div className="p-2.5 rounded-2xl bg-olive-50 group-hover:bg-olive-100 transition-colors">
                    {getIcon(item.icon)}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-[#222D42] mb-2.5">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#5F6B7A] leading-relaxed mb-6 font-light">
                  {item.description}
                </p>
              </div>

              {/* Card Actions */}
              <div className="pt-4 border-t border-[#E7E3D8]/60">
                {item.actionText ? (
                  <button
                    onClick={() => setShowPuzzleModal(true)}
                    className="w-full py-2.5 px-4 rounded-2xl bg-[#F4EFE3] hover:bg-[#EAE2D3] text-navy-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-[#DFCDB8]/50"
                  >
                    <Sparkles size={14} className="text-olive-700" />
                    <span>{item.actionText}</span>
                  </button>
                ) : (
                  <button
                    onClick={onReadFullStory}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5F6B7A] hover:text-olive-700 transition-colors group/link"
                  >
                    <span>{item.linkText}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Interactive Poetry Puzzle Modal */}
      {showPuzzleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm fade-in">
          <div className="bg-[#FAF7F0] rounded-3xl border border-[#E7E3D8] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-olive-600"></span>
                <h4 className="text-lg font-bold text-navy-800">بازی با واژه‌ها • پازل شعر</h4>
              </div>
              <button
                onClick={() => setShowPuzzleModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#5F6B7A] leading-relaxed">
              این یک تجربه تعاملی کوچک برای لمس زیبایی کلمات است. شعر معروف سهراب سپهری:
            </p>

            <div className="bg-white p-5 rounded-2xl border border-[#E7E3D8] text-center space-y-3">
              <p className="text-xs text-olive-800 font-medium">«زندگی رسم پذیرایی است...»</p>
              <div className="p-3 bg-olive-50 rounded-xl text-sm font-semibold text-olive-900">
                «زندگی خالی نیست؛ مهربانی هست، سیب هست، ایمان هست.»
              </div>
              <p className="text-[11px] text-[#707A65]">
                در دورهمی‌های حضوری کرمان، کارت‌های کلمات چوبی بین دوستان دست‌به‌دست می‌شود تا با هم شعری مشترک بسازند.
              </p>
            </div>

            <button
              onClick={() => setShowPuzzleModal(false)}
              className="w-full py-2.5 bg-olive-700 hover:bg-olive-800 text-white rounded-xl text-xs font-medium transition-colors"
            >
              بستن و ادامه گشت‌وگذار
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
