import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  RotateCw, 
  ChevronUp, 
  ChevronDown, 
  Music2,
  SlidersHorizontal
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

// Helper to convert standard digits to Persian digits
const toPersianDigits = (num) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (x) => persianDigits[parseInt(x, 10)]);
};

// Format seconds into MM:SS in Persian digits
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === 0) return '۰۰:۰۰';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
  const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;
  return toPersianDigits(`${formattedMins}:${formattedSecs}`);
};

export default function MinimalMusicPlayer() {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isExpanded,
    isVisible,
    isSynthesizerMode,
    trackInfo,
    togglePlay,
    seek,
    skip,
    setVolume,
    toggleMute,
    setIsExpanded,
    setIsVisible,
  } = useAudio();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  if (!isVisible) return null;

  const handleSeekChange = (e) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
  };

  return (
    <aside 
      aria-label="پخش‌کننده صوتی دمی برای زیستن"
      className="fixed bottom-5 left-4 sm:left-6 z-40 max-w-[calc(100vw-2rem)] transition-all duration-300 ease-out select-none"
    >
      {/* 1. EXPANDED PLAYER CARD */}
      {isExpanded ? (
        <div className="w-[320px] sm:w-[350px] bg-[#FAF7F0]/95 backdrop-blur-xl border border-[#E7E3D8] shadow-2xl rounded-3xl p-4 sm:p-5 text-navy-800 transition-all duration-300 transform scale-100 animate-fadeIn">
          {/* Header Row: Thumbnail + Track Title + Minimize */}
          <div className="flex items-center justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-3 min-w-0">
              {/* Persian Window Thumbnail with gentle pulse animation */}
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-[#EAE2D3] border border-[#D5DFCA] flex-shrink-0 flex items-center justify-center shadow-inner">
                <img
                  src="/brand-logo.png"
                  alt="لوگو دمی برای زیستن"
                  className={`w-8 h-8 object-contain transition-transform duration-700 ${
                    isPlaying ? 'scale-105' : 'scale-95 opacity-80'
                  }`}
                />
                {isPlaying && (
                  <span className="absolute inset-0 rounded-2xl ring-2 ring-olive-500/30 animate-pulse pointer-events-none" />
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-navy-900 truncate flex items-center gap-1.5">
                  <span>{trackInfo.title}</span>
                  {isSynthesizerMode && (
                    <span className="text-[10px] bg-sand-200 text-[#5A7538] px-1.5 py-0.5 rounded-full font-normal">
                      زنده
                    </span>
                  )}
                </h4>
                <p className="text-xs text-[#718096] truncate mt-0.5 font-normal">
                  {trackInfo.album}
                </p>
              </div>
            </div>

            {/* Collapse / Minimize button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1.5 rounded-full hover:bg-black/5 text-[#718096] hover:text-navy-900 transition-colors"
              title="کوچک‌سازی پلیر"
              aria-label="کوچک‌سازی پلیر"
            >
              <ChevronDown size={19} />
            </button>
          </div>

          {/* Progress Timeline / Scrubber */}
          <div className="space-y-1 my-3">
            <div className="relative flex items-center group cursor-pointer">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={duration ? currentTime : 0}
                onChange={handleSeekChange}
                disabled={isSynthesizerMode || !duration}
                aria-label="نوار زمان موزیک"
                className="w-full h-1.5 bg-[#E2DACB] rounded-lg appearance-none cursor-pointer accent-[#94A751] focus:outline-none transition-all group-hover:h-2"
                style={{
                  background: duration
                    ? `linear-gradient(to left, #94A751 ${(currentTime / duration) * 100}%, #E2DACB ${(currentTime / duration) * 100}%)`
                    : '#E2DACB',
                }}
              />
            </div>

            {/* Timestamps */}
            <div className="flex justify-between items-center text-[11px] text-[#718096] font-mono px-0.5" dir="ltr">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls Bar: Skip 10s - Play/Pause - Skip 10s + Volume */}
          <div className="flex items-center justify-between pt-1">
            {/* Playback Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Skip Back 10 seconds */}
              <button
                onClick={() => skip(-10)}
                disabled={isSynthesizerMode || !duration}
                className="p-2 rounded-full text-[#5A6A80] hover:text-navy-900 hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                title="۱۰ ثانیه عقب‌تر"
                aria-label="۱۰ ثانیه عقب‌تر"
              >
                <RotateCcw size={16} />
              </button>

              {/* Main Play / Pause Button */}
              <button
                onClick={togglePlay}
                className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  isPlaying 
                    ? 'bg-[#829643] hover:bg-[#728537] shadow-olive-900/20' 
                    : 'bg-[#94A751] hover:bg-[#869941] shadow-olive-700/20'
                }`}
                title={isPlaying ? 'توقف پخش' : 'پخش'}
                aria-label={isPlaying ? 'توقف پخش' : 'پخش'}
              >
                {isPlaying ? (
                  <Pause size={18} />
                ) : (
                  <Play size={18} className="translate-x-[1px]" />
                )}
              </button>

              {/* Skip Forward 10 seconds */}
              <button
                onClick={() => skip(10)}
                disabled={isSynthesizerMode || !duration}
                className="p-2 rounded-full text-[#5A6A80] hover:text-navy-900 hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                title="۱۰ ثانیه جلوتر"
                aria-label="۱۰ ثانیه جلوتر"
              >
                <RotateCw size={16} />
              </button>
            </div>

            {/* Sound Wave Visualizer + Volume Controls */}
            <div className="flex items-center gap-2">
              {/* 4-Bar Equalizer Wave */}
              <div 
                className="flex items-end gap-[3px] h-5 px-2 py-0.5 rounded-full bg-[#EAE2D3]/60"
                title={isPlaying ? 'در حال نواختن' : 'متوقف'}
              >
                <span className={`w-[3px] rounded-full bg-[#94A751] transition-all ${isPlaying ? 'animate-soundwave-1' : 'h-1.5'}`} />
                <span className={`w-[3px] rounded-full bg-[#94A751] transition-all ${isPlaying ? 'animate-soundwave-2' : 'h-2.5'}`} />
                <span className={`w-[3px] rounded-full bg-[#94A751] transition-all ${isPlaying ? 'animate-soundwave-3' : 'h-1'}`} />
                <span className={`w-[3px] rounded-full bg-[#94A751] transition-all ${isPlaying ? 'animate-soundwave-4' : 'h-2'}`} />
              </div>

              {/* Volume Slider / Popover */}
              <div className="relative flex items-center">
                <button
                  onClick={toggleMute}
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  className="p-2 rounded-full text-[#5A6A80] hover:text-navy-900 hover:bg-black/5 transition-colors"
                  title={isMuted ? 'وصل صدا' : 'قطع صدا'}
                  aria-label={isMuted ? 'وصل صدا' : 'قطع صدا'}
                >
                  {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
                </button>

                {/* Inline / Floating Volume Slider */}
                <div 
                  className={`flex items-center gap-1.5 bg-[#FAF7F0] border border-[#E7E3D8] px-2 py-1 rounded-full shadow-md transition-all duration-200 ${
                    showVolumeSlider ? 'opacity-100 visible w-20' : 'opacity-0 invisible w-0 pointer-events-none'
                  }`}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    aria-label="میزان بلندی صدا"
                    className="w-16 h-1 bg-[#E2DACB] rounded-lg appearance-none cursor-pointer accent-[#94A751]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 2. COMPACT FLOATING PILL VIEW */
        <div 
          onClick={() => setIsExpanded(true)}
          className="group flex items-center gap-3 bg-[#FAF7F0]/95 hover:bg-[#FAF7F0] backdrop-blur-md border border-[#E7E3D8] hover:border-[#D5DFCA] shadow-xl hover:shadow-2xl rounded-full py-2 px-3 sm:px-4 cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5"
          title="باز کردن پلیر موزیک دمی برای زیستن"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsExpanded(true);
            }
          }}
        >
          {/* Circular Play / Pause Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all shadow-sm ${
              isPlaying
                ? 'bg-[#829643] hover:bg-[#728537]'
                : 'bg-[#94A751] hover:bg-[#869941]'
            }`}
            title={isPlaying ? 'توقف پخش' : 'پخش موسیقی'}
            aria-label={isPlaying ? 'توقف پخش' : 'پخش موسیقی'}
          >
            {isPlaying ? (
              <Pause size={14} />
            ) : (
              <Play size={14} className="translate-x-[0.5px]" />
            )}
          </button>

          {/* Equalizer Wave (Active when playing) */}
          <div className="flex items-end gap-[3px] h-4 py-0.5">
            <span className={`w-[2.5px] rounded-full bg-[#94A751] transition-all ${isPlaying ? 'animate-soundwave-1' : 'h-1.5'}`} />
            <span className={`w-[2.5px] rounded-full bg-[#94A751] transition-all ${isPlaying ? 'animate-soundwave-2' : 'h-3'}`} />
            <span className={`w-[2.5px] rounded-full bg-[#94A751] transition-all ${isPlaying ? 'animate-soundwave-3' : 'h-1'}`} />
            <span className={`w-[2.5px] rounded-full bg-[#94A751] transition-all ${isPlaying ? 'animate-soundwave-4' : 'h-2.5'}`} />
          </div>

          {/* Track Title and Mood Tag */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-[13px] font-medium text-navy-800 whitespace-nowrap">
              {isPlaying ? 'نوای موسیقی در حال پخش' : 'نوای دل‌نشین موسیقی'}
            </span>
          </div>

          {/* Expand Icon */}
          <div className="text-[#8C98A8] group-hover:text-navy-900 transition-colors mr-1">
            <ChevronUp size={16} />
          </div>
        </div>
      )}
    </aside>
  );
}
