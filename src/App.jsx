import React, { useState } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import MinimalMusicPlayer from './components/common/MinimalMusicPlayer';
import { AudioProvider } from './context/AudioContext';
import Hero from './components/home/Hero';
import StorySection from './components/home/StorySection';
import MeetupSection from './components/home/MeetupSection';
import GallerySlider from './components/home/GallerySlider';
import GalleryPage from './components/gallery/GalleryPage';
import AboutPage from './components/about/AboutPage';
import AuthModal from './components/auth/AuthModal';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const handleNavigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPhotoFromSlider = (photo) => {
    setSelectedPhoto(photo);
    setCurrentView('gallery');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AudioProvider>
      <div className="flex flex-col min-h-screen bg-[#FAF7F0] text-navy-800 relative">
        {/* Top Navbar */}
        <Navbar currentView={currentView} setCurrentView={handleNavigate} />

      {/* Main Content Area */}
      <main className="flex-grow">
        {currentView === 'home' && (
          <div className="fade-in">
            {/* 1. Hero Section matching Hero.png */}
            <Hero 
              onExploreClick={() => handleNavigate('about')} 
              onMeetupClick={() => handleNavigate('meetup')}
            />

            {/* 2. Story & 3 Pillars matching section.jpg */}
            <StorySection onReadFullStory={() => handleNavigate('about')} />

            {/* 3. Upcoming Gathering spotlight matching form.jpg */}
            <MeetupSection />

            {/* 4. Random 3-4 Photos Gallery Slider */}
            <GallerySlider
              onViewFullGallery={() => handleNavigate('gallery')}
              onSelectPhoto={handleSelectPhotoFromSlider}
            />
          </div>
        )}

        {currentView === 'about' && (
          <div className="fade-in">
            <AboutPage onExploreMeetup={() => handleNavigate('meetup')} />
          </div>
        )}

        {currentView === 'meetup' && (
          <div className="fade-in pt-6">
            <MeetupSection />
          </div>
        )}

        {currentView === 'gallery' && (
          <div className="fade-in">
            <GalleryPage
              selectedPhoto={selectedPhoto}
              setSelectedPhoto={setSelectedPhoto}
            />
          </div>
        )}
      </main>

      {/* Footer matching footer.jpg */}
      <Footer />

      {/* Minimal Floating Music Player */}
      <MinimalMusicPlayer />

      {/* Minimal Auth Modal matching form aesthetic */}
      <AuthModal />
    </div>
    </AudioProvider>
  );
}

