// LocalStorage Storage & Persistence Manager
const PREFIX = 'ganitghar:';

export const storage = {
  get(key, defaultValue) {
    try {
      const item = localStorage.getItem(PREFIX + key);
      return item === null ? defaultValue : JSON.parse(item);
    } catch (e) {
      console.warn('Storage read failed for', key, e);
      return defaultValue;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage write failed for', key, e);
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch (e) {}
  },
  clear() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .forEach(k => localStorage.removeItem(k));
    } catch (e) {}
  }
};

export const todayDateString = () => new Date().toLocaleDateString('en-CA');
export const yesterdayDateString = () => new Date(Date.now() - 864e5).toLocaleDateString('en-CA');

export function getStreak() {
  const s = storage.get('streak', { n: 0, last: '' });
  const today = todayDateString();
  const yest = yesterdayDateString();
  return (s.last === today || s.last === yest) ? s.n : 0;
}

export function touchStreak() {
  const s = storage.get('streak', { n: 0, last: '' });
  const today = todayDateString();
  const yest = yesterdayDateString();
  if (s.last === today) return;
  storage.set('streak', {
    n: s.last === yest ? s.n + 1 : 1,
    last: today
  });
}
