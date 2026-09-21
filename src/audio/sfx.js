// Sound Effects Engine using pure Web Audio API (100% Offline)
let audioCtx = null;
let sfxEnabled = true;
let sfxVolume = 0.5;

export function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
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

export function playTone(freq, duration = 0.15, type = 'sine', vol = 0.1) {
  if (!sfxEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);

    const actualVol = vol * sfxVolume;
    gain.gain.setValueAtTime(actualVol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + duration);
  } catch (e) {}
}

export function soundCorrect() {
  if (!sfxEnabled) return;
  playTone(659.25, 0.1, 'sine', 0.15); // E5
  setTimeout(() => playTone(880, 0.18, 'triangle', 0.15), 90); // A5
  haptic([20, 30, 20]);
}

export function soundWrong() {
  if (!sfxEnabled) return;
  playTone(174.61, 0.25, 'sawtooth', 0.08); // F3
  haptic(120);
}

export function soundCheer() {
  if (!sfxEnabled) return;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.22, 'triangle', 0.14), i * 110);
  });
  haptic([40, 40, 40, 40, 80]);
}

export function soundClick() {
  if (!sfxEnabled) return;
  playTone(400, 0.04, 'triangle', 0.05);
}

export function soundTick(urgent = false) {
  if (!sfxEnabled) return;
  playTone(urgent ? 880 : 440, 0.05, 'sine', urgent ? 0.1 : 0.04);
}

export function soundCombo(streak = 1) {
  if (!sfxEnabled) return;
  const baseFreq = 440 + Math.min(streak * 60, 500);
  playTone(baseFreq, 0.12, 'sine', 0.14);
}

export function soundFlip() {
  if (!sfxEnabled) return;
  playTone(320, 0.06, 'triangle', 0.06);
}
