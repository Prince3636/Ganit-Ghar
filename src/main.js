// Main Application Controller for Ganit Ghar Multi-Platform Math Suite
import './styles/main.css';
import './styles/games.css';
import './styles/responsive.css';

import {
  ALL_GAMES, GROUPS, MINUS, R, P, shuffle,
  gcd, lcm, rup, dstr, ns, sg, F, X, BOX,
  checkAnswer, ansHTML
} from './games/topics.js';

import {
  soundCorrect, soundWrong, soundCheer, soundClick,
  setSfxEnabled, setSfxVolume, resumeAudio
} from './audio/sfx.js';

import {
  startBgm, setBgmEnabled, setBgmVolume, isBgmEnabled, toggleBgm
} from './audio/bgm.js';

import { storage, getStreak, touchStreak, todayDateString } from './storage.js';
import { launchConfetti } from './ui/confetti.js';
import { setupNavigation, updateNavBadges } from './ui/navigation.js';
import { openSettingsModal } from './ui/modals.js';

// Mini games
import { startSpeedSprint } from './games/speed-sprint.js';
import { startMemoryMatch } from './games/memory-match.js';
import { startTarget24 } from './games/target24.js';
import { startVedicTricks } from './games/vedic-tricks.js';

// State
let prog = storage.get('prog', {});
let Q = null;
let tmr = null;
let cur = { id: null, L: 1 };
let resetArm = false;
let currentView = 'home'; // 'home', 'sprint', 'memory', 'target', 'vedic', 'quiz', 'topic'

const $ = s => document.querySelector(s);
const view = $('#view');
const G = id => ALL_GAMES.find(g => g.id === id);

// Progression & Star Calculations
const lvStars = (id, l) => (prog[id] && prog[id][l - 1]) || 0;
const unlocked = (id, l) => l === 1 || lvStars(id, l - 1) >= 1;
const highest = id => {
  let h = 1;
  for (let l = 2; l <= 10; l++) if (unlocked(id, l)) h = l;
  return h;
};
const gameStars = id => (prog[id] || []).reduce((a, b) => a + (b || 0), 0);
const totalStars = () => Object.keys(prog).reduce((s, k) => s + gameStars(k), 0) + storage.get('bonus', 0);

const RANKS = [
  { min: 0, n: 'Ganit Seekhu', e: '🌱' },
  { min: 15, n: 'Number Explorer', e: '🧭' },
  { min: 45, n: 'Ganit Yodha', e: '⚔️' },
  { min: 100, n: 'Math Ninja', e: '🥷' },
  { min: 180, n: 'Ganit Guru', e: '🧙' },
  { min: 300, n: 'Ganit Samrat', e: '👑' }
];
const rankOf = t => [...RANKS].reverse().find(r => t >= r.min) || RANKS[0];

// Navigation view switcher
function navigateTo(target) {
  stopQuiz();
  currentView = target;
  document.body.classList.remove('inquiz');
  window.scrollTo(0, 0);

  if (target === 'home') {
    renderHome();
  } else if (target === 'sprint') {
    startSpeedSprint(view, () => navigateTo('home'));
  } else if (target === 'memory') {
    startMemoryMatch(view, () => navigateTo('home'));
  } else if (target === 'target') {
    startTarget24(view, () => navigateTo('home'));
  } else if (target === 'vedic') {
    startVedicTricks(view, () => navigateTo('home'));
  }
}

function stopQuiz() {
  clearTimeout(tmr);
  Q = null;
}

function show(fn) {
  stopQuiz();
  document.body.classList.remove('inquiz');
  fn();
  window.scrollTo(0, 0);
  updateNavBadges(totalStars());
}

/* ================= Home View ================= */
function pips(id) {
  return Array.from({ length: 10 }, (_, i) => `<i class="pip s${lvStars(id, i + 1)}"></i>`).join('');
}

function renderHome() {
  cur = { id: null, L: 1 };
  const tot = totalStars();
  const rk = rankOf(tot);
  const ix = RANKS.indexOf(rk);
  const nx = RANKS[ix + 1];
  const pc = nx ? Math.round((tot - rk.min) / (nx.min - rk.min) * 100) : 100;
  const sk = getStreak();

  const groups = GROUPS.map((gn, gi) => `
    <h2 class="gh">${gn}</h2>
    <div class="grid">${ALL_GAMES.filter(g => g.grp === gi).map(g => `
      <button class="tc" data-a="topic" data-id="${g.id}" style="--c:var(${g.color})">
        <span class="top"><span class="sym">${g.sym}</span><span class="tn">${g.name}</span></span>
        <span class="body">
          <span class="td">${g.desc}</span>
          <span class="pips" aria-hidden="true">${pips(g.id)}</span>
          <span class="tl">Level ${highest(g.id)} · ⭐ ${gameStars(g.id)}/30</span>
        </span>
      </button>`).join('')}
    </div>
  `).join('');

  view.innerHTML = `
    <section class="hero">
      <div class="hcopy">
        <h1>Math ki seedhiyan chadho</h1>
        <p>15 topics, har topic mein 10 level. Saath hi 4 naye mazedaar mini-games, offline background music, aur daily streak rewards!</p>
      </div>
      <div class="rank">
        <div class="re">${rk.e}</div>
        <div class="rb">
          <b>${rk.n}</b>
          <div class="rbar"><i style="width:${pc}%"></i></div>
          <small>${nx ? `${nx.min - tot} ⭐ aur, phir ${nx.n} ${nx.e}` : 'Sabse bada rank! 🎉'}</small>
        </div>
        <div class="rs">${sk ? `🔥 ${sk} din streak` : '🔥 Aaj shuru karo'}</div>
      </div>
    </section>

    <!-- Background Music Control Banner -->
    <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; background:var(--panel); border:3px solid var(--line); border-radius:18px; padding:12px 18px; margin:8px 0 16px; box-shadow:4px 4px 0 var(--line);">
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-size:1.8rem; display:grid; place-items:center; width:44px; height:44px; background:var(--tint); border:2px solid var(--line); border-radius:12px;">🎵</span>
        <div>
          <b style="display:block; font-size:1.05rem;">Soothing Study Music (100% Offline)</b>
          <small style="color:var(--muted); font-size:0.88rem;">Padhte waqt focus ke liye soft background melody</small>
        </div>
      </div>
      <button class="btn sm" data-nav="bgm-toggle" style="background:var(--yellow); color:var(--on); font-weight:800;">
        Music Play / Mute 🔊
      </button>
    </div>

    <!-- 4 Exciting Mini-Games Hub -->
    <h2 class="gh">Naye Mazedaar Math Games</h2>
    <div class="game-modes-grid">
      <button class="mode-card" data-nav="sprint">
        <span class="mode-icon" style="--c:var(--yellow)">⚡</span>
        <div>
          <b>Speed Math Sprint</b>
          <small>60-sec Bijli round, combo multipliers & high score!</small>
        </div>
      </button>

      <button class="mode-card" data-nav="memory">
        <span class="mode-icon" style="--c:var(--teal)">🃏</span>
        <div>
          <b>Jodi Milao (Memory Match)</b>
          <small>Math concepts ke pairs dhoondo aur dimag tej karo</small>
        </div>
      </button>

      <button class="mode-card" data-nav="target">
        <span class="mode-icon" style="--c:var(--orange)">🎯</span>
        <div>
          <b>Lakshya 24 (Target Puzzle)</b>
          <small>4 numbers se 24 banao, brain training challenge</small>
        </div>
      </button>

      <button class="mode-card" data-nav="vedic">
        <span class="mode-icon" style="--c:var(--violet)">🪄</span>
        <div>
          <b>Jaadui Mental Tricks</b>
          <small>Vedic math shortcuts aur lightning-fast drills</small>
        </div>
      </div>
    </div>

    <!-- Daily Mix Test -->
    <button class="test" data-a="test" style="width:100%; display:flex; align-items:center; gap:14px; text-align:left; background:var(--yellow); color:var(--on); border:3px solid var(--line); border-radius:20px; box-shadow:6px 6px 0 var(--line); padding:14px 18px; margin:6px 0 16px;">
      <span class="ti" style="font-size:2.2rem;">📝</span>
      <span style="flex:1;">
        <b style="display:block; font-size:1.25rem;">Aaj ka Daily Mix Test</b>
        <small style="display:block; font-size:0.92rem;">10 sawaal, alag alag topics se. Roz ek baar bonus ⭐ milte hain.</small>
      </span>
      <span class="go" style="font-weight:800;">Shuru ➜</span>
    </button>

    ${groups}

    <p class="foot" style="margin-top:34px; text-align:center; color:var(--muted); font-size:0.9rem;">
      Tumhare stars aur progress 100% offline device par save hote hain.
      <button class="link" data-a="reset">${resetArm ? 'Pakka? Dobara dabao' : 'Progress mitao'}</button>
    </p>
  `;
}

/* ================= Topic View ================= */
function renderTopic(id) {
  const g = G(id);
  cur = { id, L: 1 };
  const lv = Array.from({ length: 10 }, (_, i) => {
    const l = i + 1, ok = unlocked(id, l), s = lvStars(id, l);
    return `<button class="lv ${ok ? '' : 'lock'} ${s ? 'done' : ''}" data-a="level" data-l="${l}">
      <b>${ok ? l : '🔒'}</b>
      <span class="st">${ok ? '★'.repeat(s) + '<u>' + '★'.repeat(3 - s) + '</u>' : ''}</span>
    </button>`;
  }).join('');

  view.innerHTML = `
    <button class="btn sm" data-a="home">← Saare topics</button>
    <header class="thead" style="--c:var(${g.color})">
      <span class="sym">${g.sym}</span>
      <div>
        <h1>${g.name}</h1>
        <p>${g.desc}</p>
      </div>
    </header>
    <h2 class="gh">Level chuno</h2>
    <p class="hint">Level paas karne ke liye 10 mein se 7 sahi karne hain. Paas hote hi agla level khulega.</p>
    <div class="lvgrid">${lv}</div>
    <h2 class="gh">Seekho</h2>
    <div class="tips">
      ${g.tips.map(t => `<article class="tip"><span class="tl2">Level ${t[0]}+</span><h3>${t[1]}</h3><p>${t[2]}</p></article>`).join('')}
    </div>
  `;
}

/* ================= Intro View ================= */
function tipFor(g, L) {
  return [...g.tips].reverse().find(t => t[0] <= L) || g.tips[0];
}

function renderIntro(id, L) {
  const g = G(id), t = tipFor(g, L);
  cur = { id, L };
  view.innerHTML = `
    <button class="btn sm" data-a="topic" data-id="${id}">← ${g.name}</button>
    <div class="paper intro" style="--c:var(${g.color})">
      <div class="qtag">${g.name} · Level ${L}</div>
      <h1>${t[1]}</h1>
      <p class="lesson">${t[2]}</p>
      <ul class="rules" style="list-style:none; display:flex; flex-wrap:wrap; gap:8px; padding:0; margin:0 0 16px;">
        <li style="background:var(--tint); border:2px solid var(--line); border-radius:99px; padding:2px 12px; font-size:0.88rem; font-weight:700;">10 sawaal</li>
        <li style="background:var(--tint); border:2px solid var(--line); border-radius:99px; padding:2px 12px; font-size:0.88rem; font-weight:700;">7 sahi = paas ✅ (⭐)</li>
        <li style="background:var(--tint); border:2px solid var(--line); border-radius:99px; padding:2px 12px; font-size:0.88rem; font-weight:700;">9 sahi = ⭐⭐</li>
        <li style="background:var(--tint); border:2px solid var(--line); border-radius:99px; padding:2px 12px; font-size:0.88rem; font-weight:700;">10 sahi = ⭐⭐⭐</li>
      </ul>
      <button class="btn big" data-a="begin">Shuru karo</button>
    </div>
  `;
}

/* ================= Quiz Engine ================= */
function makeQs(g, L, n = 10) {
  const qs = [], seen = new Set();
  let guard = 0;
  while (qs.length < n && guard++ < 120) {
    const q = g.gen(L);
    if (seen.has(q.p)) continue;
    seen.add(q.p);
    q.gid = g.id;
    qs.push(q);
  }
  while (qs.length < n) {
    const q = g.gen(L);
    q.gid = g.id;
    qs.push(q);
  }
  return qs;
}

function beginLevel() {
  const g = G(cur.id);
  Q = { mode: 'level', gid: g.id, L: cur.L, qs: makeQs(g, cur.L), i: 0, score: 0, miss: [], res: [], locked: false, buf: '' };
  drawQ();
}

function beginTest() {
  const pool = shuffle(ALL_GAMES).slice(0, 10);
  const qs = pool.map(g => {
    const L = Math.max(1, highest(g.id) - R(0, 1));
    const q = g.gen(L);
    q.gid = g.id;
    q.lv = L;
    return q;
  });
  Q = { mode: 'test', qs, i: 0, score: 0, miss: [], res: [], locked: false, buf: '' };
  drawQ();
}

function keypadHTML(q) {
  const a = q.a;
  const needNeg = q.neg || (q.t === 'num' && a < 0);
  const needDec = q.dec || (q.t === 'num' && !Number.isInteger(a));
  const needFr = q.t === 'frac';
  const ex = [needNeg ? MINUS : null, needDec ? '.' : null, needFr ? '/' : null].filter(Boolean);

  const k = (x, c = '') => `<button class="k ${c}" data-a="key" data-k="${x}" aria-label="${x}">${x}</button>`;
  const e = i => ex[i] ? k(ex[i], 'ex') : '<span></span>';

  return `
    <div class="ansrow">
      <div class="ansline" id="disp" aria-live="polite"></div>
      ${q.u ? `<span class="unit" style="font-weight:700; color:var(--muted); padding-bottom:6px;">${q.u}</span>` : ''}
    </div>
    <div class="pad">
      ${k('1')}${k('2')}${k('3')}${k('⌫', 'bk')}
      ${k('4')}${k('5')}${k('6')}${e(0)}
      ${k('7')}${k('8')}${k('9')}${e(1)}
      ${k('0')}
      <button class="k go" data-a="key" data-k="go">Check ✓</button>
    </div>
  `;
}

function drawQ() {
  document.body.classList.add('inquiz');
  const q = Q.qs[Q.i], g = G(q.gid);
  Q.locked = false;
  Q.buf = '';

  const dots = Q.qs.map((_, k) => `<i class="dot ${k < Q.i ? (Q.res[k] ? 'ok' : 'no') : k === Q.i ? 'cur' : ''}"></i>`).join('');
  const tag = Q.mode === 'level' ? `${g.name} · Level ${Q.L}` : `Mix Test · ${g.name}`;

  let ans;
  if (q.t === 'mcq') {
    ans = `<div class="mopts ${q.small ? 'small' : ''}">${q.o.map((o, i) => `
      <button class="mo" data-a="opt" data-i="${i}">
        <small>${i + 1}</small>
        <span>${o}</span>
      </button>
    `).join('')}</div>`;
  } else {
    ans = keypadHTML(q);
  }

  view.innerHTML = `
    <div class="qtop">
      <button class="btn sm" data-a="quit" aria-label="Chhodo">
        <span aria-hidden="true">✕</span><span class="qt"> Chhodo</span>
      </button>
      <div class="dots" role="img" aria-label="Sawaal ${Q.i + 1}/10">${dots}</div>
      <span class="chip"><span class="cn">${Q.score}</span><span class="cw">&nbsp;sahi</span></span>
    </div>
    <div class="paper quiz" style="--c:var(${g.color})">
      <div class="qtag">${tag} · Sawaal ${Q.i + 1}/${Q.qs.length}</div>
      <div class="qgrid">
        <div class="qp">${q.p}</div>
        <div class="acol">${ans}</div>
      </div>
    </div>
    <div class="fb" id="fb" aria-live="polite"></div>
  `;
}

function typeKey(k) {
  let b = Q.buf;
  if (k === MINUS) {
    if (b === '') b = MINUS;
  } else if (k === '.') {
    if (!b.includes('.') && !b.includes('/')) b += (b === '' || b === MINUS) ? '0.' : '.';
  } else if (k === '/') {
    if (/\d$/.test(b) && !b.includes('/') && !b.includes('.')) b += '/';
  } else if (b.length < 10) {
    b += k;
  }
  Q.buf = b;
  const d = $('#disp');
  if (d) d.textContent = b;
}

function pressKey(k) {
  if (!Q || Q.locked) return;
  if (k === 'go') return submit();
  if (k === '⌫') {
    Q.buf = Q.buf.slice(0, -1);
    const d = $('#disp');
    if (d) d.textContent = Q.buf;
    return;
  }
  typeKey(k);
}

function submit() {
  if (!Q || Q.locked) return;
  const q = Q.qs[Q.i];
  if (!Q.buf || Q.buf === MINUS) {
    const d = $('#disp');
    if (d) {
      d.classList.remove('shake');
      void d.offsetWidth;
      d.classList.add('shake');
    }
    return;
  }
  const r = checkAnswer(q, Q.buf);
  settle(q, r.ok, Q.buf, r.note);
}

function chooseOpt(i) {
  if (!Q || Q.locked) return;
  const q = Q.qs[Q.i];
  if (i < 0 || i >= q.o.length) return;
  const ok = q.o[i] === q.a;
  document.querySelectorAll('.mo').forEach((el, k) => {
    el.classList.add(q.o[k] === q.a ? 'ok' : (k === i ? 'no' : 'dim'));
    el.disabled = true;
  });
  settle(q, ok, q.o[i]);
}

function settle(q, ok, given, note) {
  Q.locked = true;
  Q.res[Q.i] = ok;
  if (ok) Q.score++;
  else Q.miss.push({ q, given });

  ok ? soundCorrect() : soundWrong();
  document.querySelectorAll('.k').forEach(b => b.disabled = true);

  const dots = document.querySelectorAll('.dot');
  if (dots[Q.i]) {
    dots[Q.i].className = 'dot ' + (ok ? 'ok' : 'no');
  }

  const chip = $('.qtop .cn');
  if (chip) chip.textContent = Q.score;

  const fb = $('#fb');
  const last = Q.i >= Q.qs.length - 1;

  if (ok && !note) {
    fb.className = 'fb ok';
    fb.innerHTML = '<b>Sahi! 🎉</b>';
    tmr = setTimeout(nextQ, 850);
  } else if (ok) {
    fb.className = 'fb ok';
    fb.innerHTML = `<b>Sahi! 🎉</b><p>${note}</p><button class="btn" data-a="next">${last ? 'Result dekho' : 'Aage ➜'}</button>`;
  } else {
    fb.className = 'fb no';
    fb.innerHTML = `<b>Sahi jawab: ${ansHTML(q)}</b><p>${q.e}</p><button class="btn" data-a="next" id="nx">${last ? 'Result dekho' : 'Samajh gaya ➜'}</button>`;
    const nx = $('#nx');
    if (nx) nx.focus({ preventScroll: true });
    fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

function nextQ() {
  clearTimeout(tmr);
  if (!Q || !Q.locked) return;
  Q.i++;
  if (Q.i >= Q.qs.length) finishQuiz();
  else {
    drawQ();
    window.scrollTo(0, 0);
  }
}

function starsFor(s) {
  return s >= 10 ? 3 : s >= 9 ? 2 : s >= 7 ? 1 : 0;
}

function finishQuiz() {
  document.body.classList.remove('inquiz');
  const s = Q.score;
  touchStreak();

  if (Q.mode === 'level') {
    const g = G(Q.gid), L = Q.L, st = starsFor(s), prev = lvStars(g.id, L);
    if (!prog[g.id]) prog[g.id] = [];
    if (st > prev) {
      prog[g.id][L - 1] = st;
      storage.set('prog', prog);
    }
    const passed = st >= 1, gain = Math.max(0, st - prev), newUnlock = passed && L < 10 && prev === 0;

    if (passed) {
      soundCheer();
      launchConfetti(2200);
    } else {
      soundWrong();
    }

    view.innerHTML = `
      <div class="paper result" style="--c:var(${g.color})">
        <div class="qtag">${g.name} · Level ${L}</div>
        <div class="big">${passed ? (st === 3 ? '🏆' : '🎉') : '💪'}</div>
        <h1>${s}/10 sahi</h1>
        <div class="starrow" style="font-size:2.6rem; letter-spacing:6px; line-height:1; margin:4px 0 6px; color:var(--grid);">
          ${[1, 2, 3].map(i => `<span style="color:${i <= st ? '#f5a300' : 'var(--grid)'}">★</span>`).join('')}
        </div>
        <p class="lead">${passed ? (st === 3 ? 'Kamaal! Ek bhi galti nahi.' : 'Level paas! Bahut badhiya.') : 'Abhi 7 sahi chahiye the. Seekh kar dobara try karo, ho jayega!'}</p>
        ${gain ? `<p class="earn" style="display:inline-block; margin:4px 8px 4px 0; background:var(--yellow); color:var(--on); border:2px solid var(--line); border-radius:99px; padding:0 14px; font-weight:800;">+${gain} ⭐ mile</p>` : ''}
        ${newUnlock ? `<p class="unl" style="display:inline-block; margin:4px 8px 4px 0; background:var(--green); color:#ffffff; border:2px solid var(--line); border-radius:99px; padding:0 14px; font-weight:800;">🔓 Level ${L + 1} khul gaya!</p>` : ''}
        ${L === 10 && passed ? '<p class="unl" style="display:inline-block; margin:4px 8px 4px 0; background:var(--green); color:#ffffff; border:2px solid var(--line); border-radius:99px; padding:0 14px; font-weight:800;">🏅 Ye topic poora hua!</p>' : ''}
        <div class="row" style="display:flex; flex-wrap:wrap; gap:12px; margin-top:14px;">
          ${passed && L < 10 ? `<button class="btn big" data-a="level" data-l="${L + 1}">Level ${L + 1} ➜</button>` : ''}
          <button class="btn ${passed && L < 10 ? '' : 'big'}" data-a="level" data-l="${L}">Phir khelo</button>
          <button class="btn" data-a="topic" data-id="${g.id}">Topic</button>
        </div>
      </div>
      <div class="review" style="max-width:min(var(--pw),720px); margin:22px auto 0;">
        ${Q.miss.length ? `<h3 class="mh" style="font-size:1.2rem; margin-bottom:10px;">Ye dobara dekh lo</h3>` + Q.miss.map(({ q, given }) => `
          <div class="miss" style="background:var(--panel); border:3px solid var(--line); border-radius:14px; padding:10px 14px; margin-bottom:12px; box-shadow:4px 4px 0 var(--line);">
            <div class="mp" style="font-size:0.78rem; font-weight:800; color:var(--muted);">${G(q.gid).name}${q.lv ? ' · L' + q.lv : ''}</div>
            <div class="mq" style="font-size:1.1rem; font-weight:600; margin:2px 0 4px;">${q.p}</div>
            <p><span style="color:#d23a30; font-weight:600;">Tumhara jawab: ${given}</span> · <span style="color:#178a5c; font-weight:800;">Sahi: ${ansHTML(q)}</span></p>
            <p style="color:var(--muted); font-size:0.95rem; margin:2px 0;">${q.e}</p>
          </div>
        `).join('') : '<p style="text-align:center; font-weight:800; font-size:1.1rem;">Ek bhi galti nahi! 🌟</p>'}
      </div>
    `;
  } else {
    const st = s >= 9 ? 3 : s >= 7 ? 2 : s >= 5 ? 1 : 0;
    const done = storage.get('testday', '') === todayDateString();
    let gain = 0;
    if (!done) {
      gain = st;
      storage.set('bonus', storage.get('bonus', 0) + gain);
      storage.set('testday', todayDateString());
    }

    if (st > 0) {
      soundCheer();
      launchConfetti(2200);
    } else {
      soundWrong();
    }

    view.innerHTML = `
      <div class="paper result" style="--c:var(--yellow)">
        <div class="qtag">Aaj ka Mix Test</div>
        <div class="big">${st >= 2 ? '🎉' : '📝'}</div>
        <h1>${s}/10 sahi</h1>
        <div class="starrow" style="font-size:2.6rem; letter-spacing:6px; line-height:1; margin:4px 0 6px;">
          ${[1, 2, 3].map(i => `<span style="color:${i <= st ? '#f5a300' : 'var(--grid)'}">★</span>`).join('')}
        </div>
        <p class="lead">${gain ? `Bonus mila: +${gain} ⭐` : done ? 'Aaj ka bonus pehle hi mil chuka hai. Kal phir aana!' : 'Thoda aur practice karo, kal bonus milega!'}</p>
        <div class="row" style="display:flex; flex-wrap:wrap; gap:12px; margin-top:14px;">
          <button class="btn big" data-a="test">Naya test</button>
          <button class="btn" data-a="home">Home</button>
        </div>
      </div>
    `;
  }

  updateNavBadges(totalStars());
  window.scrollTo(0, 0);
  Q = null;
}

/* ================= Event Dispatcher ================= */
view.addEventListener('click', e => {
  const b = e.target.closest('[data-a]');
  if (!b || b.disabled) return;
  soundClick();

  const a = b.dataset.a;
  if (a !== 'reset') resetArm = false;

  switch (a) {
    case 'home': return show(renderHome);
    case 'topic': return show(() => renderTopic(b.dataset.id));
    case 'level':
      if (b.classList.contains('lock')) return;
      return show(() => renderIntro(cur.id, +b.dataset.l));
    case 'begin': return beginLevel();
    case 'test': return show(beginTest);
    case 'key': return pressKey(b.dataset.k);
    case 'opt': return chooseOpt(+b.dataset.i);
    case 'next': return nextQ();
    case 'quit': return show(() => cur.id ? renderTopic(cur.id) : renderHome());
    case 'reset':
      if (!resetArm) {
        resetArm = true;
        renderHome();
        return;
      }
      prog = {};
      storage.set('prog', {});
      storage.set('bonus', 0);
      storage.set('streak', { n: 0, last: '' });
      storage.set('testday', '');
      resetArm = false;
      return show(renderHome);
  }
});

// Physical Keyboard Shortcuts for Desktop
document.addEventListener('keydown', e => {
  if (!Q || e.ctrlKey || e.metaKey || e.altKey) return;
  const q = Q.qs[Q.i];

  if (Q.locked) {
    if (e.key === 'Enter') {
      const n = $('[data-a="next"]');
      if (n) {
        e.preventDefault();
        nextQ();
      }
    }
    return;
  }

  if (q.t === 'mcq') {
    if (/^[1-4]$/.test(e.key)) chooseOpt(+e.key - 1);
    return;
  }

  if (/^\d$/.test(e.key)) pressKey(e.key);
  else if (e.key === 'Backspace') {
    e.preventDefault();
    pressKey('⌫');
  } else if (e.key === 'Enter') {
    e.preventDefault();
    pressKey('go');
  } else if (e.key === '-' || e.key === '−') {
    if (q.neg || q.a < 0) pressKey(MINUS);
  } else if (e.key === '.' || e.key === ',') {
    pressKey('.');
  } else if (e.key === '/') {
    e.preventDefault();
    pressKey('/');
  }
});

// Autoplay policy unlocked on first interaction
const unlockAudioOnTouch = async () => {
  try {
    await resumeAudio();
    if (isBgmEnabled()) {
      await startBgm();
    }
    updateNavBadges(totalStars());
  } catch (e) {}
};
window.addEventListener('click', unlockAudioOnTouch);
window.addEventListener('pointerdown', unlockAudioOnTouch);
window.addEventListener('keydown', unlockAudioOnTouch);

// Apply stored settings
const savedTheme = storage.get('theme', 'light');
document.documentElement.setAttribute('data-theme', savedTheme);

setBgmEnabled(storage.get('bgm', true));
setBgmVolume(storage.get('bgmVol', 0.65));
setSfxEnabled(storage.get('sound', true));
setSfxVolume(storage.get('sfxVol', 0.7));

// Initialize Navigation & Mount
setupNavigation((target) => navigateTo(target), totalStars);
renderHome();
updateNavBadges(totalStars());

// Register Service Worker for PWA 100% Offline Capability
if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
