import React, { useState, useEffect } from 'react';
import { meetupAlbums, galleryItems } from '../../data/mockData';
import { 
  X, ChevronRight, ChevronLeft, Calendar, MapPin, 
  Sparkles, Images, ArrowRight, ArrowLeft, Eye, Grid3X3, FolderOpen 
} from 'lucide-react';

export default function GalleryPage({ selectedPhoto, setSelectedPhoto }) {
  // State for selected meetup album (null = show all albums)
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  // View mode: 'albums' (default) or 'all' (continuous grid)
  const [viewMode, setViewMode] = useState('albums');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activePhotoList, setActivePhotoList] = useState([]);

  // Handle selectedPhoto prop if navigated from home slider
  useEffect(() => {
    if (selectedPhoto) {
      const parentAlbum = meetupAlbums.find((album) => album.id === selectedPhoto.albumId);
      if (parentAlbum) {
        setSelectedAlbum(parentAlbum);
        setViewMode('albums');
        const photoIdx = parentAlbum.photos.findIndex((p) => p.id === selectedPhoto.id);
        if (photoIdx !== -1) {
          setActivePhotoList(parentAlbum.photos);
          setLightboxIndex(photoIdx);
        }
      }
    }
  }, [selectedPhoto]);

  const handleOpenAlbum = (album) => {
    setSelectedAlbum(album);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
    if (setSelectedPhoto) setSelectedPhoto(null);
  };

  const openLightbox = (photos, index) => {
    setActivePhotoList(photos);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextLightbox = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % activePhotoList.length);
  };

  const prevLightbox = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + activePhotoList.length) % activePhotoList.length);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev + 1) % activePhotoList.length);
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev - 1 + activePhotoList.length) % activePhotoList.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, activePhotoList]);

  return (
    <div className="py-12 bg-[#FAF7F0] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-olive-100 text-olive-800 text-xs font-semibold">
            <Sparkles size={13} />
            <span>گالری خاطرات و رویدادها</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#222D42]">
            تصاویر و یادگاری‌های دورهمی‌ها
          </h1>
          <p className="text-sm text-[#707A65] leading-relaxed">
            هر دورهمی روایت و قابی مجزا از هم‌نشینی، شعرخوانی، چای عصرانه و حضور در اکوموزه بانو حیاتی است.
          </p>
        </div>

        {/* View Switcher Tabs (Albums vs All Photos) */}
        {!selectedAlbum && (
          <div className="flex items-center justify-center gap-2 pb-2">
            <button
              onClick={() => setViewMode('albums')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                viewMode === 'albums'
                  ? 'bg-olive-700 text-white shadow-sm'
                  : 'bg-white text-navy-700 border border-[#E7E3D8] hover:border-olive-400 hover:bg-olive-50'
              }`}
            >
              <FolderOpen size={16} />
              <span>دسته‌بندی بر اساس دورهمی‌ها ({meetupAlbums.length} دورهمی)</span>
            </button>

            <button
              onClick={() => setViewMode('all')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                viewMode === 'all'
                  ? 'bg-olive-700 text-white shadow-sm'
                  : 'bg-white text-navy-700 border border-[#E7E3D8] hover:border-olive-400 hover:bg-olive-50'
              }`}
            >
              <Grid3X3 size={16} />
              <span>همه تصاویر یکجا ({galleryItems.length} عکس)</span>
            </button>
          </div>
        )}

        {/* VIEW 1: Meetup Albums Grid */}
        {!selectedAlbum && viewMode === 'albums' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {meetupAlbums.map((album) => (
              <div
                key={album.id}
                onClick={() => handleOpenAlbum(album)}
                className="group bg-white rounded-3xl border border-[#E7E3D8] overflow-hidden shadow-sm hover:shadow-xl hover:border-olive-500 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Cover Image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
                  <img
                    src={album.coverImage}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* Photo count pill */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
                    <Images size={13} className="text-olive-300" />
                    <span>{album.photos.length} تصویر اختصاصی</span>
                  </div>

                  {/* Title overlay inside cover */}
                  <div className="absolute bottom-4 right-4 left-4 text-white space-y-1">
                    <div className="flex items-center gap-3 text-xs text-olive-200">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        {album.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} />
                        {album.location}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-olive-200 transition-colors">
                      {album.title}
                    </h3>
                  </div>
                </div>

                {/* Album Card Details */}
                <div className="p-6 flex flex-col justify-between flex-grow space-y-4">
                  <p className="text-xs sm:text-sm text-[#5F6B7A] font-light leading-relaxed">
                    {album.description}
                  </p>

                  <div className="pt-4 border-t border-[#E7E3D8]/70 flex items-center justify-between text-xs font-semibold text-olive-700 group-hover:text-olive-800">
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      ورود به آلبوم و مشاهده عکس‌ها
                    </span>
                    <ArrowLeft size={16} className="transform group-hover:-translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 2: Inside a Selected Meetup Album */}
        {selectedAlbum && (
          <div className="space-y-8 fade-in">
            {/* Top Navigation Bar: Back button + Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-[#E7E3D8] shadow-sm">
              <button
                onClick={handleBackToAlbums}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF7F0] hover:bg-olive-100/70 border border-[#E7E3D8] text-navy-800 text-xs sm:text-sm font-semibold transition-all group"
              >
                <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform text-olive-700" />
                <span>بازگشت به همه دورهمی‌ها</span>
              </button>

              {/* Fast Meetup Switcher Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#707A65] hidden md:inline">تغییر دورهمی:</span>
                <select
                  value={selectedAlbum.id}
                  onChange={(e) => {
                    const found = meetupAlbums.find((a) => a.id === e.target.value);
                    if (found) setSelectedAlbum(found);
                  }}
                  className="px-3 py-2 rounded-xl border border-[#E7E3D8] bg-[#FAF7F0] text-xs sm:text-sm text-navy-800 focus:outline-none focus:border-olive-600 cursor-pointer"
                >
                  {meetupAlbums.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.shortTitle || a.title} ({a.photos.length} عکس)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Meetup Information Header */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E3D8] shadow-sm space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#8C9681]">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-olive-100 text-olive-800 font-semibold">
                  <Calendar size={13} />
                  {selectedAlbum.date}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-medium">
                  <MapPin size={13} />
                  {selectedAlbum.location}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-medium">
                  <Images size={13} />
                  {selectedAlbum.photos.length} عکس اختصاصی
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#222D42]">
                {selectedAlbum.title}
              </h2>

              <p className="text-xs sm:text-sm text-[#5F6B7A] leading-relaxed max-w-3xl font-light">
                {selectedAlbum.description}
              </p>
            </div>

            {/* Photos Grid of This Meetup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedAlbum.photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  onClick={() => openLightbox(selectedAlbum.photos, idx)}
                  className="group bg-white rounded-3xl border border-[#E7E3D8] overflow-hidden shadow-sm hover:shadow-xl hover:border-olive-500 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                    <img
                      src={photo.image}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-white text-xs font-medium flex items-center gap-1.5">
                        <Eye size={14} />
                        مشاهده در اندازه بزرگ
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h4 className="text-sm sm:text-base font-bold text-[#222D42] group-hover:text-olive-700 transition-colors">
                      {photo.title}
                    </h4>
                    {photo.description && (
                      <p className="text-xs text-[#707A65] font-light leading-relaxed line-clamp-2">
                        {photo.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: All Photos Continuous Grid */}
        {!selectedAlbum && viewMode === 'all' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => openLightbox(galleryItems, idx)}
                className="group bg-white rounded-3xl border border-[#E7E3D8] overflow-hidden shadow-sm hover:shadow-xl hover:border-olive-500 transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-white text-xs font-medium flex items-center gap-1.5">
                      <Eye size={14} />
                      بزرگ‌نمایی عکس
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                    {item.event}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-[#8C9681]">
                    <Calendar size={12} />
                    <span>{item.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#222D42] group-hover:text-olive-700 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#5F6B7A] font-light leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && activePhotoList[lightboxIndex] && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 fade-in"
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 left-6 text-white/80 hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
            aria-label="بستن"
            title="بستن (Esc)"
          >
            <X size={24} />
          </button>

          {/* Navigation Controls */}
          {activePhotoList.length > 1 && (
            <>
              <button
                onClick={prevLightbox}
                className="absolute right-4 sm:right-8 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
                aria-label="عکس بعدی"
                title="عکس بعدی (کلید راست)"
              >
                <ChevronRight size={28} />
              </button>
              <button
                onClick={nextLightbox}
                className="absolute left-4 sm:left-8 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
                aria-label="عکس قبلی"
                title="عکس قبلی (کلید چپ)"
              >
                <ChevronLeft size={28} />
              </button>
            </>
          )}

          {/* Lightbox Content Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
          >
            <div className="md:w-3/5 bg-black flex items-center justify-center overflow-hidden">
              <img
                src={activePhotoList[lightboxIndex].image}
                alt={activePhotoList[lightboxIndex].title}
                className="w-full h-full max-h-[70vh] object-contain select-none"
              />
            </div>
            
            <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between bg-[#FAF7F0] overflow-y-auto">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-olive-100 text-olive-800 text-xs font-semibold">
                  <span>{selectedAlbum ? selectedAlbum.shortTitle || selectedAlbum.title : activePhotoList[lightboxIndex].event || 'دورهمی دمی برای زیستن'}</span>
                </div>

                <h3 className="text-xl font-bold text-[#222D42]">
                  {activePhotoList[lightboxIndex].title}
                </h3>

                <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed pt-2 border-t border-[#E7E3D8]">
                  {activePhotoList[lightboxIndex].description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#E7E3D8] text-[11px] text-[#707A65] flex items-center justify-between">
                <span>تصویر {lightboxIndex + 1} از {activePhotoList.length}</span>
                <span>اکوموزه بانو حیاتی • کرمان</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

