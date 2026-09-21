// Settings, Audio Controls & Help Modals
import { isBgmEnabled, setBgmEnabled, getBgmVolume, setBgmVolume } from '../audio/bgm.js';
import { isSfxEnabled, setSfxEnabled, getSfxVolume, setSfxVolume, soundClick, soundCorrect } from '../audio/sfx.js';
import { storage } from '../storage.js';

export function openSettingsModal(onSave) {
  let modal = document.getElementById('settings-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const bgmOn = isBgmEnabled();
  const sfxOn = isSfxEnabled();
  const bgmVol = Math.round(getBgmVolume() * 100);
  const sfxVol = Math.round(getSfxVolume() * 100);
  const hapticOn = storage.get('haptic', true);

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h2>⚙️ Settings & Audio</h2>
        <button class="btn sm" id="modal-close">✕</button>
      </div>

      <div class="settings-group">
        <h3>🎵 Background Music (BGM)</h3>
        <div class="setting-row">
          <span>BGM Play / Pause</span>
          <button class="btn sm ${bgmOn ? 'active' : ''}" id="toggle-bgm">
            ${bgmOn ? 'BGM: ON 🔊' : 'BGM: OFF 🔇'}
          </button>
        </div>
        <div class="setting-row">
          <span>BGM Volume: <b id="bgm-vol-text">${bgmVol}%</b></span>
          <input type="range" id="bgm-vol-slider" min="0" max="100" value="${bgmVol}" />
        </div>
      </div>

      <div class="settings-group">
        <h3>🔔 Sound Effects (SFX)</h3>
        <div class="setting-row">
          <span>Awaaz (SFX)</span>
          <button class="btn sm ${sfxOn ? 'active' : ''}" id="toggle-sfx">
            ${sfxOn ? 'SFX: ON 🔔' : 'SFX: OFF 🔕'}
          </button>
        </div>
        <div class="setting-row">
          <span>SFX Volume: <b id="sfx-vol-text">${sfxVol}%</b></span>
          <input type="range" id="sfx-vol-slider" min="0" max="100" value="${sfxVol}" />
        </div>
      </div>

      <div class="settings-group">
        <h3>🎨 Theme & Display</h3>
        <div class="setting-row">
          <span>Color Theme</span>
          <button class="btn sm" id="toggle-theme">
            ${currentTheme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
        <div class="setting-row">
          <span>Mobile Haptic Vibration</span>
          <button class="btn sm ${hapticOn ? 'active' : ''}" id="toggle-haptic">
            ${hapticOn ? 'Vibration: ON 📳' : 'Vibration: OFF 📴'}
          </button>
        </div>
      </div>

      <div class="settings-group">
        <h3>⌨️ Keyboard Shortcuts (Desktop)</h3>
        <p class="small-hint">
          • <b>1, 2, 3, 4:</b> Option select<br>
          • <b>0-9, ., /, -:</b> Numpad inputs<br>
          • <b>Enter:</b> Check / Aage bado<br>
          • <b>Backspace:</b> Mitao (⌫)<br>
          • <b>Esc:</b> Wapas main menu
        </p>
      </div>

      <div class="modal-footer">
        <button class="btn big" id="modal-done">Theek Hai (Done) ✓</button>
      </div>
    </div>
  `;

  modal.classList.add('open');

  // Wire up handlers
  const close = () => {
    modal.classList.remove('open');
    if (onSave) onSave();
  };

  document.getElementById('modal-close').onclick = close;
  document.getElementById('modal-done').onclick = close;

  const bgmBtn = document.getElementById('toggle-bgm');
  bgmBtn.onclick = () => {
    soundClick();
    const newState = !isBgmEnabled();
    setBgmEnabled(newState);
    storage.set('bgm', newState);
    bgmBtn.textContent = newState ? 'BGM: ON 🔊' : 'BGM: OFF 🔇';
    bgmBtn.classList.toggle('active', newState);
  };

  const bgmSlider = document.getElementById('bgm-vol-slider');
  bgmSlider.oninput = (e) => {
    const val = parseInt(e.target.value, 10);
    document.getElementById('bgm-vol-text').textContent = `${val}%`;
    setBgmVolume(val / 100);
    storage.set('bgmVol', val / 100);
  };

  const sfxBtn = document.getElementById('toggle-sfx');
  sfxBtn.onclick = () => {
    soundClick();
    const newState = !isSfxEnabled();
    setSfxEnabled(newState);
    storage.set('sound', newState);
    sfxBtn.textContent = newState ? 'SFX: ON 🔔' : 'SFX: OFF 🔕';
    sfxBtn.classList.toggle('active', newState);
    if (newState) soundCorrect();
  };

  const sfxSlider = document.getElementById('sfx-vol-slider');
  sfxSlider.oninput = (e) => {
    const val = parseInt(e.target.value, 10);
    document.getElementById('sfx-vol-text').textContent = `${val}%`;
    setSfxVolume(val / 100);
    storage.set('sfxVol', val / 100);
  };

  const themeBtn = document.getElementById('toggle-theme');
  themeBtn.onclick = () => {
    soundClick();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    storage.set('theme', newTheme);
    themeBtn.textContent = newTheme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode';
  };

  const hapticBtn = document.getElementById('toggle-haptic');
  hapticBtn.onclick = () => {
    soundClick();
    const curHaptic = storage.get('haptic', true);
    storage.set('haptic', !curHaptic);
    hapticBtn.textContent = !curHaptic ? 'Vibration: ON 📳' : 'Vibration: OFF 📴';
    hapticBtn.classList.toggle('active', !curHaptic);
  };
}
