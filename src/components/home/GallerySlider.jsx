import React, { useState, useEffect } from 'react';
import { ArrowLeft, Image as ImageIcon, Shuffle } from 'lucide-react';
import { galleryItems } from '../../data/mockData';

export default function GallerySlider({ onViewFullGallery, onSelectPhoto }) {
  const [randomPhotos, setRandomPhotos] = useState([]);

  // Pick 3 or 4 random images on mount
  const shufflePhotos = () => {
    const shuffled = [...galleryItems].sort(() => 0.5 - Math.random());
    setRandomPhotos(shuffled.slice(0, 4));
  };

  useEffect(() => {
    shufflePhotos();
  }, []);

  if (randomPhotos.length === 0) return null;

  return (
    <section className="py-16 bg-[#FAF7F0] border-t border-[#E7E3D8]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-olive-100 text-olive-800 text-xs font-semibold">
              <ImageIcon size={13} />
              <span>لحظات ماندگار</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#222D42]">
              گوشه‌هایی از دورهمی‌های گذشته
            </h2>
            <p className="text-xs sm:text-sm text-[#707A65]">
              تصاویر تصادفی از همنشینی‌ها، کتاب‌خوانی‌ها و چهره‌های صمیمی در اکوموزه بانو حیاتی
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={shufflePhotos}
              title="تغییر تصادفی تصاویر"
              className="p-2.5 rounded-full bg-white border border-[#E7E3D8] text-navy-800 hover:text-olive-700 hover:bg-olive-50 transition-all text-xs font-medium flex items-center gap-1.5 shadow-sm"
            >
              <Shuffle size={14} />
              <span className="hidden sm:inline">تصادفی دیگر</span>
            </button>

            <button
              onClick={onViewFullGallery}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#E7E3D8] hover:border-olive-500 text-navy-800 hover:text-olive-700 text-xs font-semibold transition-all shadow-sm group"
            >
              <span>مشاهده همه تصاویر</span>
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Gallery Cards Grid / Slider — images only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {randomPhotos.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectPhoto && onSelectPhoto(item)}
              className="group bg-white rounded-3xl border border-[#E7E3D8] overflow-hidden shadow-sm hover:shadow-xl hover:border-olive-400 transition-all duration-300 cursor-pointer"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                <img
                  src={item.image}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
