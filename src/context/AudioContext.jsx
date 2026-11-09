import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { siteConfig } from '../data/mockData';

const AudioContext = createContext(null);

// Persian traditional meditative pentatonic / modal frequencies (Dastgah Shur / Homayoun warmth)
const FALLBACK_NOTES = [146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00];

export function AudioProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isSynthesizerMode, setIsSynthesizerMode] = useState(false);

  const audioRef = useRef(null);
  const synthCtxRef = useRef(null);
  const synthGainRef = useRef(null);
  const synthIntervalRef = useRef(null);

  const trackInfo = {
    title: 'نوای دل‌نشین سنتور',
    artist: 'دَمی برای زیستن',
    album: 'تکنوازی سنتور • دستگاه شور',
  };

  // Helper for Web Audio API fallback in case MP3 file fails to play
  const startSynthesizerFallback = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!synthCtxRef.current) {
        synthCtxRef.current = new AudioCtx();
        synthGainRef.current = synthCtxRef.current.createGain();
        synthGainRef.current.gain.setValueAtTime(volume * 0.25, synthCtxRef.current.currentTime);
        synthGainRef.current.connect(synthCtxRef.current.destination);
      }

      if (synthCtxRef.current.state === 'suspended') {
        synthCtxRef.current.resume();
      }

      const ctx = synthCtxRef.current;
      const master = synthGainRef.current;

      // Gentle warm drone
      const droneOsc = ctx.createOscillator();
      const droneGain = ctx.createGain();
      droneOsc.type = 'sine';
      droneOsc.frequency.setValueAtTime(73.42, ctx.currentTime);
      droneGain.gain.setValueAtTime(0.08, ctx.currentTime);
      droneOsc.connect(droneGain);
      droneGain.connect(master);
      droneOsc.start();

      const playHarmonic = () => {
        if (!synthCtxRef.current) return;
        const note = FALLBACK_NOTES[Math.floor(Math.random() * FALLBACK_NOTES.length)];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(note, ctx.currentTime);

        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.05, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

        osc.connect(gain);
        gain.connect(master);
        osc.start(now);
        osc.stop(now + 3.3);
      };

      playHarmonic();
      synthIntervalRef.current = setInterval(playHarmonic, 2200);
      setIsSynthesizerMode(true);
      setIsPlaying(true);
    } catch (e) {
      console.warn('Web Audio fallback failed:', e);
    }
  };

  const stopSynthesizerFallback = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (synthCtxRef.current) {
      try {
        synthCtxRef.current.suspend();
      } catch (e) {
        // ignore
      }
    }
    setIsSynthesizerMode(false);
  };

  useEffect(() => {
    const audioSrc = (siteConfig && siteConfig.musicUrl) ? siteConfig.musicUrl : '/music.mp3';
    const audio = new Audio(audioSrc);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      stopSynthesizerFallback();
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      if (audio && !audio.paused) {
        audio.pause();
      }
      stopSynthesizerFallback();
      setIsPlaying(false);
    } else {
      if (audio) {
        audio.play()
          .then(() => {
            setIsPlaying(true);
            setIsSynthesizerMode(false);
          })
          .catch((err) => {
            console.warn('HTML5 Audio playback prevented, using ambient synthesizer fallback:', err);
            startSynthesizerFallback();
          });
      } else {
        startSynthesizerFallback();
      }
    }
  };

  const seek = (timeInSeconds) => {
    const audio = audioRef.current;
    if (audio && !isSynthesizerMode && duration > 0) {
      const clamped = Math.max(0, Math.min(timeInSeconds, duration));
      audio.currentTime = clamped;
      setCurrentTime(clamped);
    }
  };

  const skip = (seconds) => {
    const audio = audioRef.current;
    if (audio && !isSynthesizerMode) {
      seek(audio.currentTime + seconds);
    }
  };

  const setVolume = (val) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : clamped;
    }
    if (synthGainRef.current && synthCtxRef.current) {
      synthGainRef.current.gain.setValueAtTime(
        isMuted ? 0 : clamped * 0.25,
        synthCtxRef.current.currentTime
      );
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      if (audioRef.current) {
        audioRef.current.volume = nextMuted ? 0 : volume;
      }
      if (synthGainRef.current && synthCtxRef.current) {
        synthGainRef.current.gain.setValueAtTime(
          nextMuted ? 0 : volume * 0.25,
          synthCtxRef.current.currentTime
        );
      }
      return nextMuted;
    });
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        currentTime,
        duration,
        progress: duration > 0 ? (currentTime / duration) * 100 : 0,
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
        toggleExpanded: () => setIsExpanded((prev) => !prev),
        setIsVisible,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
