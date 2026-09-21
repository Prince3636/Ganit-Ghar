// Sound Effects Engine using pure Web Audio API (100% Offline)
let audioCtx = null;
let sfxEnabled = true;
let sfxVolume = 0.7; // Crisp, clear volume

export function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

export async function resumeAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (e) {}
  }
  return ctx;
}

export function setSfxEnabled(val) {
  sfxEnabled = !!val;
}

export function isSfxEnabled() {
  return sfxEnabled;
}

export function setSfxVolume(vol) {
  sfxVolume = Math.max(0, Math.min(1, vol));
}

export function getSfxVolume() {
  return sfxVolume;
}

export function haptic(pattern = 30) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
}

export async function playTone(freq, duration = 0.15, type = 'sine', vol = 0.25) {
  if (!sfxEnabled) return;
  try {
    const ctx = await resumeAudio();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    const actualVol = vol * sfxVolume;
    gain.gain.setValueAtTime(actualVol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {}
}

export function soundCorrect() {
  if (!sfxEnabled) return;
  playTone(659.25, 0.12, 'sine', 0.35); // E5
  setTimeout(() => playTone(880, 0.2, 'triangle', 0.35), 90); // A5
  haptic([20, 30, 20]);
}

export function soundWrong() {
  if (!sfxEnabled) return;
  playTone(174.61, 0.25, 'sawtooth', 0.18); // F3
  haptic(120);
}

export function soundCheer() {
  if (!sfxEnabled) return;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.25, 'triangle', 0.25), i * 110);
  });
  haptic([40, 40, 40, 40, 80]);
}

export function soundClick() {
  if (!sfxEnabled) return;
  playTone(480, 0.05, 'triangle', 0.15);
}

export function soundTick(urgent = false) {
  if (!sfxEnabled) return;
  playTone(urgent ? 880 : 440, 0.05, 'sine', urgent ? 0.2 : 0.08);
}

export function soundCombo(streak = 1) {
  if (!sfxEnabled) return;
  const baseFreq = 440 + Math.min(streak * 60, 500);
  playTone(baseFreq, 0.15, 'sine', 0.3);
}

export function soundFlip() {
  if (!sfxEnabled) return;
  playTone(380, 0.07, 'triangle', 0.15);
}
