import { siteConfig } from '../data/mockData';

let audioCtx = null;
let masterGain = null;
let isPlaying = false;
let intervalId = null;
let htmlAudio = null;

// Persian traditional meditative pentatonic / modal frequencies (Dastgah Shur / Homayoun warmth)
const NOTES = [146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00];

function createAmbientSound() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 2);
    masterGain.connect(audioCtx.destination);
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  // Soft low drone (tanbur / daf resonance)
  const droneOsc = audioCtx.createOscillator();
  const droneGain = audioCtx.createGain();
  droneOsc.type = 'sine';
  droneOsc.frequency.setValueAtTime(73.42, audioCtx.currentTime); // Low D
  droneGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  droneOsc.connect(droneGain);
  droneGain.connect(masterGain);
  droneOsc.start();

  // Subtle warm overtone
  const overtoneOsc = audioCtx.createOscillator();
  const overtoneGain = audioCtx.createGain();
  overtoneOsc.type = 'triangle';
  overtoneOsc.frequency.setValueAtTime(110.0, audioCtx.currentTime); // Low A
  overtoneGain.gain.setValueAtTime(0.03, audioCtx.currentTime);
  overtoneOsc.connect(overtoneGain);
  overtoneGain.connect(masterGain);
  overtoneOsc.start();

  // Gentle bell / santur / wind harmonic pluck helper
  const playHarmonic = () => {
    if (!isPlaying || !audioCtx) return;
    const note = NOTES[Math.floor(Math.random() * NOTES.length)];
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(note, audioCtx.currentTime);

    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 3.6);
  };

  playHarmonic();
  intervalId = setInterval(() => {
    playHarmonic();
  }, 2200);
}

export function toggleAmbientMusic(onStateChange) {
  if (!htmlAudio) {
    const src = (siteConfig && siteConfig.musicUrl) ? siteConfig.musicUrl : '/music.mp3';
    htmlAudio = new Audio(src);
    htmlAudio.loop = true;
    htmlAudio.volume = 0.5;
  }

  if (isPlaying) {
    isPlaying = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (audioCtx) {
      audioCtx.suspend();
    }
    if (htmlAudio && !htmlAudio.paused) {
      htmlAudio.pause();
    }
    if (onStateChange) onStateChange(false);
  } else {
    isPlaying = true;
    htmlAudio.play()
      .then(() => {
        if (onStateChange) onStateChange(true);
      })
      .catch(() => {
        createAmbientSound();
        if (onStateChange) onStateChange(true);
      });
  }
}

export function isAmbientPlaying() {
  return isPlaying;
}
