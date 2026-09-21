// Procedural Web Audio Background Music (BGM) Engine
// 100% Offline, Synthesized in Real-Time with Zero External Audio Assets
import { getAudioContext } from './sfx.js';

let isBgmPlaying = false;
let bgmEnabled = true;
let bgmVolume = 0.25;
let bgmTimer = null;
let masterBgmGain = null;

// Chords progression: C maj -> G maj -> A min -> F maj (each 4 beats)
const CHORDS = [
  { root: 130.81, freqs: [261.63, 329.63, 392.00, 523.25] }, // C (C3, C4, E4, G4, C5)
  { root: 98.00,  freqs: [196.00, 246.94, 293.66, 392.00] }, // G (G2, G3, B3, D4, G4)
  { root: 110.00, freqs: [220.00, 261.63, 329.63, 440.00] }, // Am (A2, A3, C4, E4, A4)
  { root: 87.31,  freqs: [174.61, 220.00, 261.63, 349.23] }  // F (F2, F3, A3, C4, F4)
];

const TEMPO = 112; // BPM
const BEAT_DURATION = 60 / TEMPO;
let currentChordIdx = 0;
let currentStep = 0;

function ensureMasterGain(ctx) {
  if (!masterBgmGain) {
    masterBgmGain = ctx.createGain();
    // Warm low-pass filter to make synth sounds cozy and smooth (not harsh)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1600;

    masterBgmGain.connect(filter);
    filter.connect(ctx.destination);
  }
  masterBgmGain.gain.setValueAtTime(bgmEnabled ? bgmVolume : 0.0001, ctx.currentTime);
  return masterBgmGain;
}

function playNote(ctx, freq, duration, type = 'triangle', vol = 0.15) {
  if (!bgmEnabled) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain);
    gain.connect(masterBgmGain);

    osc.start(t);
    osc.stop(t + duration);
  } catch (e) {}
}

function tickBgm() {
  if (!isBgmPlaying || !bgmEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  ensureMasterGain(ctx);

  const chord = CHORDS[currentChordIdx];

  // Bass note on beat 0 and beat 2 of the measure
  if (currentStep % 4 === 0) {
    playNote(ctx, chord.root, BEAT_DURATION * 1.8, 'sine', 0.22);
  } else if (currentStep % 4 === 2) {
    playNote(ctx, chord.root * 1.5, BEAT_DURATION * 0.9, 'sine', 0.14);
  }

  // Melodic arpeggio pattern on 8th notes
  const noteIndex = [0, 1, 2, 3, 2, 1, 3, 1][currentStep % 8];
  const freq = chord.freqs[noteIndex];
  playNote(ctx, freq, BEAT_DURATION * 0.45, 'triangle', 0.09);

  // Soft high twinkle on step 3 and 7
  if (currentStep % 8 === 3 || currentStep % 8 === 7) {
    playNote(ctx, freq * 2, BEAT_DURATION * 0.25, 'sine', 0.04);
  }

  currentStep = (currentStep + 1) % 16;
  if (currentStep % 4 === 0) {
    currentChordIdx = (currentChordIdx + 1) % CHORDS.length;
  }

  bgmTimer = setTimeout(tickBgm, (BEAT_DURATION / 2) * 1000);
}

export function startBgm() {
  if (isBgmPlaying) return;
  isBgmPlaying = true;
  currentStep = 0;
  currentChordIdx = 0;
  tickBgm();
}

export function stopBgm() {
  isBgmPlaying = false;
  if (bgmTimer) {
    clearTimeout(bgmTimer);
    bgmTimer = null;
  }
}

export function toggleBgm() {
  bgmEnabled = !bgmEnabled;
  const ctx = getAudioContext();
  if (ctx && masterBgmGain) {
    masterBgmGain.gain.setValueAtTime(bgmEnabled ? bgmVolume : 0.0001, ctx.currentTime);
  }
  if (bgmEnabled && !isBgmPlaying) {
    startBgm();
  }
  return bgmEnabled;
}

export function setBgmEnabled(val) {
  bgmEnabled = !!val;
  const ctx = getAudioContext();
  if (ctx && masterBgmGain) {
    masterBgmGain.gain.setValueAtTime(bgmEnabled ? bgmVolume : 0.0001, ctx.currentTime);
  }
  if (bgmEnabled && !isBgmPlaying) {
    startBgm();
  }
}

export function isBgmEnabled() {
  return bgmEnabled;
}

export function setBgmVolume(vol) {
  bgmVolume = Math.max(0, Math.min(1, vol));
  const ctx = getAudioContext();
  if (ctx && masterBgmGain) {
    masterBgmGain.gain.setValueAtTime(bgmEnabled ? bgmVolume : 0.0001, ctx.currentTime);
  }
}

export function getBgmVolume() {
  return bgmVolume;
}
