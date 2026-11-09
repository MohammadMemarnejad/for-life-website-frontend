import React, { useState } from 'react';
import { siteConfig } from '../../data/mockData';
import { Menu, X, Play, Pause } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

export default function Navbar({ currentView, setCurrentView }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isPlaying, togglePlay, setIsExpanded } = useAudio();

  const navItems = [
    { id: 'home', label: 'خانه' },
    { id: 'meetup', label: 'دورهمی پیش‌رو' },
    { id: 'gallery', label: 'گالری تصاویر' },
    { id: 'about', label: 'درباره ما' },
  ];

  const handleNavClick = (viewId) => {
    setCurrentView(viewId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleMusic = () => {
    togglePlay();
    if (!isPlaying) {
      setIsExpanded(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#E7E3D8]/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Right: New Brand Logo Lockup (Typography + Arched Window Icon) */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
            title={siteConfig.name}
          >
            <img 
              src="/brand-logo.png" 
              srcSet="/brand-logo.png 1x, /brand-logo-hd.png 2x"
              alt={siteConfig.name} 
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>

          {/* Center: Desktop Navigation Links matching Hero.png */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-sm lg:text-[15px] font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-navy-900 font-bold'
                      : 'text-[#4A5568] hover:text-navy-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Left: Instrumental Music Player button matching Hero.png */}
          <div className="hidden md:flex items-center">
            <button
              onClick={handleToggleMusic}
              className="flex items-center gap-2 text-sm text-[#4A5568] hover:text-navy-900 transition-colors py-1.5 px-3 rounded-full hover:bg-black/5 group"
              title={isPlaying ? "توقف پخش نوای آرامش‌بخش" : "پخش نوای آرامش‌بخش سنتی"}
            >
              <span className="text-sm font-medium">
                {isPlaying ? 'توقف موزیک' : 'پخش موزیک بی‌کلام'}
              </span>
              <div className={`w-6 h-6 rounded-full border border-[#4A5568] flex items-center justify-center text-[#4A5568] transition-all ${
                isPlaying ? 'bg-olive-700 text-white border-olive-700 animate-pulse' : 'group-hover:border-navy-900 group-hover:text-navy-900'
              }`}>
                {isPlaying ? (
                  <Pause size={11} />
                ) : (
                  <Play size={11} className="translate-x-[0.5px]" />
                )}
              </div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={handleToggleMusic}
              className="p-2 rounded-xl text-navy-800 hover:bg-[#EAE2D3]/60 transition-colors"
              title={isPlaying ? "توقف موزیک" : "پخش موزیک بی‌کلام"}
            >
              {isPlaying ? <Pause size={20} className="text-olive-700" /> : <Play size={20} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-navy-800 hover:bg-[#EAE2D3]/60 transition-colors"
              aria-label="باز کردن منو"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7E3D8] bg-[#FAF7F0] px-4 pt-3 pb-6 space-y-2 shadow-lg fade-in">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentView === item.id
                  ? 'bg-olive-600 text-white'
                  : 'text-navy-800 hover:bg-[#EAE2D3]/50'
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="pt-3 mt-3 border-t border-[#E7E3D8]">
            <button
              onClick={handleToggleMusic}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#D5DFCA] bg-white text-navy-800 text-sm font-medium hover:bg-olive-50 transition-colors"
            >
              {isPlaying ? <Pause size={16} className="text-olive-700" /> : <Play size={16} />}
              <span>{isPlaying ? 'توقف موزیک بی‌کلام' : 'پخش موزیک بی‌کلام'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
