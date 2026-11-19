import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

const PAGE_VIEWS = ['home', 'about', 'meetup', 'gallery'];

function isExternal(href) {
  return /^https?:\/\//i.test(href || '');
}

export default function StorySection({ onReadFullStory, onNavigate, slides, story = null }) {
  const { storySlides, siteConfig } = useContent();
  const resolvedSlides = slides || storySlides;
  const title = story?.title || siteConfig.storyTitle || 'مکثی کوتاه، میانِ هیاهوی روزها';
  const text =
    story?.text ||
    siteConfig.storyText ||
    '«دَمی برای زیستن» دورهمی‌ای صمیمی و عمیق است که در آن با کمکِ شعر و ادبیات، برای لمسِ لحظه‌ای زندگی در آشوبِ روزمرگی مجالی می‌سازیم.';
  const image = story?.image || siteConfig.storyImage || '/tea-illustration.jpg';
  const buttonLabel = story?.buttonLabel || siteConfig.storyButtonLabel || 'داستان دمی برای زیستن';
  const items = (resolvedSlides || []).filter((slide) => slide && slide.image);

  const trackRef = useRef(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const onUp = () => {
      dragRef.current.active = false;
      setIsDragging(false);
    };
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  const openSlide = (event, href) => {
    if (dragRef.current.moved) {
      event.preventDefault();
      return;
    }
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

  const getCardStep = () => {
    const track = trackRef.current;
    if (!track) return 260;
    const card = track.querySelector('[data-story-card]');
    if (!card) return 260;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '24') || 24;
    return card.getBoundingClientRect().width + gap;
  };

  const scrollByCards = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    // RTL: positive scrollLeft moves visually leftward in many browsers;
    // use scrollBy with inline direction for consistent feel.
    track.scrollBy({ left: direction * getCardStep(), behavior: 'smooth' });
  };

  const onPointerDown = (clientX) => {
    const track = trackRef.current;
    if (!track) return;
    dragRef.current = {
      active: true,
      startX: clientX,
      scrollLeft: track.scrollLeft,
      moved: false,
    };
    setIsDragging(true);
  };

  const onPointerMove = (clientX) => {
    const track = trackRef.current;
    const drag = dragRef.current;
    if (!track || !drag.active) return;
    const delta = clientX - drag.startX;
    if (Math.abs(delta) > 6) drag.moved = true;
    // Invert delta so dragging right reveals content on the left (natural feel in RTL/LTR).
    track.scrollLeft = drag.scrollLeft - delta;
  };

  const onPointerUp = () => {
    dragRef.current.active = false;
    setIsDragging(false);
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

      {items.length > 0 && (
        <div className="relative mt-10">
          {/* Olive band behind arched frames */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[62%] bg-[#8FA84A]" />

          <div className="relative max-w-6xl mx-auto px-12 sm:px-14 lg:px-16 py-7 sm:py-9">
            <div
              ref={trackRef}
              className={`flex gap-4 sm:gap-6 lg:gap-7 overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
                isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
              }`}
              style={{ touchAction: 'pan-y' }}
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                onPointerDown(e.clientX);
              }}
              onMouseMove={(e) => onPointerMove(e.clientX)}
              onMouseLeave={onPointerUp}
              onMouseUp={onPointerUp}
              onTouchStart={(e) => onPointerDown(e.touches[0].clientX)}
              onTouchMove={(e) => onPointerMove(e.touches[0].clientX)}
              onTouchEnd={onPointerUp}
            >
              {items.map((slide) => {
                const external = isExternal(slide.href);
                return (
                  <a
                    key={slide.id}
                    data-story-card
                    href={slide.href || undefined}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noreferrer' : undefined}
                    onClick={(event) => openSlide(event, slide.href)}
                    draggable={false}
                    className="group relative shrink-0 snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-t-[999px] w-[calc((100%-1rem)/2)] sm:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-3.5rem)/3)]"
                    aria-label={slide.label || 'مشاهده'}
                  >
                    <div className="relative aspect-[354/431] pointer-events-none">
                      <img
                        src={slide.image}
                        alt=""
                        draggable={false}
                        className="absolute inset-0 h-full w-full object-cover rounded-t-[999px]"
                      />
                      <div className="absolute inset-x-[8px] bottom-[11px] z-[1] flex items-center gap-2 px-1">
                        <span className="h-px flex-1 bg-[#dce6b8]/70" />
                        <span className="shrink-0 bg-[#7f9a42] text-[#f4e7c4] text-center text-sm sm:text-base font-semibold py-1.5 px-3 min-w-[58%]">
                          {slide.label}
                        </span>
                        <span className="h-px flex-1 bg-[#dce6b8]/70" />
                      </div>
                      <img
                        src="/arch-frame.png"
                        alt=""
                        draggable={false}
                        className="absolute inset-0 h-full w-full select-none"
                      />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => scrollByCards(-1)}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border-2 border-[#4f5f2f] bg-[#F7F3EA]/95 text-[#4f5f2f] flex items-center justify-center hover:bg-white transition-colors"
                aria-label="قاب‌های بعدی"
              >
                <ChevronLeft size={22} strokeWidth={2.25} />
              </button>
              <button
                type="button"
                onClick={() => scrollByCards(1)}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border-2 border-[#4f5f2f] bg-[#F7F3EA]/95 text-[#4f5f2f] flex items-center justify-center hover:bg-white transition-colors"
                aria-label="قاب‌های قبلی"
              >
                <ChevronRight size={22} strokeWidth={2.25} />
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
