import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { storySlides } from '../../data/mockData';

const PAGE_VIEWS = ['home', 'about', 'meetup', 'gallery'];

function visibleCountForWidth(width) {
  if (width < 640) return 1;
  if (width < 1024) return 2;
  return 3;
}

function slideWindow(slides, start, count) {
  if (!slides.length) return [];
  const size = Math.min(count, slides.length);
  return Array.from({ length: size }, (_, offset) => slides[(start + offset) % slides.length]);
}

function isExternal(href) {
  return /^https?:\/\//i.test(href || '');
}

export default function StorySection({ onReadFullStory, onNavigate, slides = storySlides, story = null }) {
  const title = story?.title || 'مکثی کوتاه، میانِ هیاهوی روزها';
  const text = story?.text || '«دَمی برای زیستن» دورهمی‌ای صمیمی و عمیق است که در آن با کمکِ شعر و ادبیات، برای لمسِ لحظه‌ای زندگی در آشوبِ روزمرگی مجالی می‌سازیم. ما اینجا «آهستگی» را تمرین می‌کنیم تا در هر لحظه‌ای که هستیم، واقعاً حضور داشته باشیم.';
  const image = story?.image || '/tea-illustration.jpg';
  const buttonLabel = story?.buttonLabel || 'داستان دمی برای زیستن';
  const items = (slides || []).filter((slide) => slide && slide.image);
  const [start, setStart] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const update = () => setVisibleCount(visibleCountForWidth(window.innerWidth));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const canSlide = items.length > visibleCount;
  const shown = slideWindow(items, start, visibleCount);

  const step = (direction) => {
    if (!canSlide) return;
    setStart((current) => (current + direction + items.length) % items.length);
  };

  const openSlide = (event, href) => {
    if (!href) {
      event.preventDefault();
      return;
    }
    const view = href.replace(/^\//, '').replace(/\/$/, '');
    if (onNavigate && PAGE_VIEWS.includes(view)) {
      event.preventDefault();
      onNavigate(view);
    }
  };

  return (
    <section className="py-12 bg-[#F7F3EA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-[28px] border-2 border-[#6d8c3b] bg-[#FFFcf6] px-6 py-7 sm:px-10 sm:py-9">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            <div className="lg:col-span-8 order-2 lg:order-1 text-right">
              <h2 className="text-[1.7rem] sm:text-4xl font-black text-[#1c1c1c] leading-snug">
                {title}
              </h2>
              <p className="mt-4 text-sm sm:text-[15px] leading-8 text-[#3d3d3d] font-normal">
                {text}
              </p>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={onReadFullStory}
                  className="inline-flex items-center rounded-full bg-[#6f8f38] hover:bg-[#5f7d2e] text-white text-sm font-medium px-5 py-2 shadow-sm transition-colors"
                >
                  {buttonLabel}
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 order-1 lg:order-2 flex justify-center">
              <img
                src={image}
                alt="استکان چای ایرانی و دفتر شعر"
                className="w-44 sm:w-52 lg:w-56 h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {shown.length > 0 && (
        <div className="relative mt-8 bg-[#9EB456]">
          <div className="max-w-5xl mx-auto px-14 sm:px-16 py-8 sm:py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-items-center">
              {shown.map((slide) => {
                const external = isExternal(slide.href);
                return (
                  <a
                    key={slide.id}
                    href={slide.href || undefined}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noreferrer' : undefined}
                    onClick={(event) => openSlide(event, slide.href)}
                    className="group block w-full max-w-[230px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-t-[999px]"
                    aria-label={slide.label || 'مشاهده'}
                  >
                    <div className="relative aspect-[354/431]">
                      <img
                        src={slide.image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover rounded-t-[999px]"
                      />
                      <div className="absolute inset-x-[7px] bottom-[10px] bg-[#7f9a42] text-[#f4e7c4] text-center text-sm font-semibold py-2 px-2">
                        {slide.label}
                      </div>
                      <img
                        src="/arch-frame.png"
                        alt=""
                        className="absolute inset-0 h-full w-full pointer-events-none select-none"
                      />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {canSlide && (
            <>
              <button
                type="button"
                onClick={() => step(1)}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-white/95 text-[#5c6b3a] shadow-md flex items-center justify-center hover:bg-white"
                aria-label="قاب‌های بعدی"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => step(-1)}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-white/95 text-[#5c6b3a] shadow-md flex items-center justify-center hover:bg-white"
                aria-label="قاب‌های قبلی"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
