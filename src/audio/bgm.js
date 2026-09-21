// Procedural Web Audio Background Music (BGM) Engine
// 100% Offline, Synthesized in Real-Time with Zero External Audio Assets
import { getAudioContext, resumeAudio } from './sfx.js';

let isBgmPlaying = false;
let bgmEnabled = true;
let bgmVolume = 0.65; // audible, pleasant default volume
let bgmTimer = null;
let masterBgmGain = null;
let lowpassFilter = null;

// Catchy, cheerful lo-fi pentatonic chord progression: C -> G -> Am -> F
// Each chord lasts 4 beats. Melodic notes designed for gentle, pleasant background study
const CHORDS = [
  // C major: C, E, G, C
  { root: 130.81, melody: [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 392.00] },
  // G major: G, B, D, G
  { root: 98.00,  melody: [196.00, 246.94, 293.66, 392.00, 293.66, 246.94, 196.00, 293.66] },
  // A minor: A, C, E, A
  { root: 110.00, melody: [220.00, 261.63, 329.63, 440.00, 329.63, 261.63, 220.00, 329.63] },
  // F major: F, A, C, F
  { root: 87.31,  melody: [174.61, 220.00, 261.63, 349.23, 261.63, 220.00, 174.61, 261.63] }
];

const TEMPO = 110; // BPM
const BEAT_DURATION = 60 / TEMPO;
let currentChordIdx = 0;
let stepCounter = 0;

function ensureMasterGain(ctx) {
  if (!masterBgmGain) {
    masterBgmGain = ctx.createGain();
    lowpassFilter = ctx.createBiquadFilter();
    lowpassFilter.type = 'lowpass';
    lowpassFilter.frequency.value = 2400; // Warm, gentle tone

    masterBgmGain.connect(lowpassFilter);
    lowpassFilter.connect(ctx.destination);
  }
  const currentGain = bgmEnabled ? bgmVolume : 0.0001;
  masterBgmGain.gain.setValueAtTime(currentGain, ctx.currentTime);
  return masterBgmGain;
}

function playSynthNote(ctx, freq, duration, type = 'triangle', vol = 0.35) {
  if (!bgmEnabled) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    const attack = Math.min(0.04, duration * 0.2);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(masterBgmGain);

    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    console.warn('Synth play error:', e);
  }
}

function tickBgm() {
  if (!isBgmPlaying || !bgmEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  ensureMasterGain(ctx);

  const chord = CHORDS[currentChordIdx];

  // Bass note on beats 0 and 2
  if (stepCounter % 4 === 0) {
    playSynthNote(ctx, chord.root, BEAT_DURATION * 1.5, 'sine', 0.45);
  } else if (stepCounter % 4 === 2) {
    playSynthNote(ctx, chord.root * 1.5, BEAT_DURATION * 0.9, 'sine', 0.3);
  }

  // Melodic arpeggio on 8th notes (steps 0 to 7)
  const melFreq = chord.melody[stepCounter % 8];
  playSynthNote(ctx, melFreq, BEAT_DURATION * 0.45, 'triangle', 0.25);

  // Soft high bell chime on beat 3
  if (stepCounter % 8 === 3) {
    playSynthNote(ctx, melFreq * 2, BEAT_DURATION * 0.3, 'sine', 0.12);
  }

  stepCounter = (stepCounter + 1) % 16;
  if (stepCounter % 4 === 0) {
    currentChordIdx = (currentChordIdx + 1) % CHORDS.length;
  }

  bgmTimer = setTimeout(tickBgm, (BEAT_DURATION / 2) * 1000);
}

export async function startBgm() {
  await resumeAudio();
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (e) {}
  }

  if (isBgmPlaying) return;
  isBgmPlaying = true;
  stepCounter = 0;
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

export async function toggleBgm() {
  await resumeAudio();
  bgmEnabled = !bgmEnabled;

  const ctx = getAudioContext();
  if (ctx && masterBgmGain) {
    masterBgmGain.gain.setValueAtTime(bgmEnabled ? bgmVolume : 0.0001, ctx.currentTime);
  }

  if (bgmEnabled) {
    if (!isBgmPlaying) {
      startBgm();
    }
  } else {
    stopBgm();
  }
  return bgmEnabled;
}

export async function setBgmEnabled(val) {
  bgmEnabled = !!val;
  if (bgmEnabled) {
    await resumeAudio();
    startBgm();
  } else {
    stopBgm();
  }
  const ctx = getAudioContext();
  if (ctx && masterBgmGain) {
    masterBgmGain.gain.setValueAtTime(bgmEnabled ? bgmVolume : 0.0001, ctx.currentTime);
  }
}

export function isBgmEnabled() {
  return bgmEnabled;
}

export function isBgmActive() {
  return isBgmPlaying && bgmEnabled;
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
