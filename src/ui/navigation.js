// Dual-Mode UI Navigation System (Desktop Topbar & Mobile Bottom Navigation Bar)
import { soundClick } from '../audio/sfx.js';
import { openSettingsModal } from './modals.js';
import { toggleBgm, isBgmEnabled } from '../audio/bgm.js';

export function setupNavigation(onNavigate, getStarCount) {
  const bottomNav = document.getElementById('mobile-bottom-nav');
  const desktopNavItems = document.querySelectorAll('[data-nav]');

  // Handle nav clicks
  document.body.addEventListener('click', (e) => {
    const navBtn = e.target.closest('[data-nav]');
    if (!navBtn) return;

    soundClick();
    const targetView = navBtn.dataset.nav;

    if (targetView === 'settings') {
      openSettingsModal(() => updateNavBadges(getStarCount()));
      return;
    }

    if (targetView === 'bgm-toggle') {
      const active = toggleBgm();
      const bgmIcon = document.getElementById('bgm-quick-icon');
      if (bgmIcon) bgmIcon.textContent = active ? '🎵' : '🔇';
      return;
    }

    // Update active tab styling
    document.querySelectorAll('[data-nav]').forEach(el => el.classList.remove('active'));
    document.querySelectorAll(`[data-nav="${targetView}"]`).forEach(el => el.classList.add('active'));

    if (onNavigate) {
      onNavigate(targetView);
    }
  });

  updateNavBadges(getStarCount());
}

export function updateNavBadges(totalStars) {
  const starDisplays = document.querySelectorAll('.star-counter-val');
  starDisplays.forEach(el => el.textContent = totalStars);

  const bgmIcon = document.getElementById('bgm-quick-icon');
  if (bgmIcon) {
    bgmIcon.textContent = isBgmEnabled() ? '🎵' : '🔇';
  }
}
