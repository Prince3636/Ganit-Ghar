// Game 2: Speed Math Sprint (Bijli Round)
// 60-Second Rapid-Fire Math Blitz with Combo Multipliers & High-Scores
import { soundCorrect, soundWrong, soundCombo, soundTick, soundCheer } from '../audio/sfx.js';
import { launchConfetti } from '../ui/confetti.js';
import { storage } from '../storage.js';

let timerInterval = null;
let timeLeft = 60;
let score = 0;
let streak = 0;
let maxStreak = 0;
let correctCount = 0;
let wrongCount = 0;
let currentQ = null;
let onExitCallback = null;

function generateSprintQuestion() {
  const ops = ['+', '-', '×', '÷', '^2'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let qText = '', answer = 0;

  if (op === '+') {
    const a = Math.floor(Math.random() * 45) + 5;
    const b = Math.floor(Math.random() * 45) + 5;
    qText = `${a} + ${b}`;
    answer = a + b;
  } else if (op === '-') {
    const a = Math.floor(Math.random() * 50) + 15;
    const b = Math.floor(Math.random() * (a - 5)) + 5;
    qText = `${a} − ${b}`;
    answer = a - b;
  } else if (op === '×') {
    const a = Math.floor(Math.random() * 12) + 2;
    const b = Math.floor(Math.random() * 12) + 2;
    qText = `${a} × ${b}`;
    answer = a * b;
  } else if (op === '÷') {
    const b = Math.floor(Math.random() * 10) + 2;
    const ans = Math.floor(Math.random() * 12) + 1;
    qText = `${b * ans} ÷ ${b}`;
    answer = ans;
  } else {
    const a = Math.floor(Math.random() * 12) + 2;
    qText = `${a}²`;
    answer = a * a;
  }

  // Generate 4 options
  const options = new Set([answer]);
  while (options.size < 4) {
    const delta = (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 6) + 1);
    const fake = answer + delta;
    if (fake >= 0 && fake !== answer) {
      options.add(fake);
    }
  }

  const shuffled = Array.from(options).sort(() => Math.random() - 0.5);
  return { qText, answer, options: shuffled };
}

function getMultiplier() {
  if (streak >= 10) return 4;
  if (streak >= 6) return 3;
  if (streak >= 3) return 2;
  return 1;
}

export function startSpeedSprint(container, onExit) {
  onExitCallback = onExit;
  timeLeft = 60;
  score = 0;
  streak = 0;
  maxStreak = 0;
  correctCount = 0;
  wrongCount = 0;

  renderSprintUI(container);
  nextSprintQuestion();

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 10 && timeLeft > 0) {
      soundTick(true);
    } else if (timeLeft % 5 === 0 && timeLeft > 0) {
      soundTick(false);
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endSpeedSprint(container);
    }
  }, 1000);
}

function renderSprintUI(container) {
  container.innerHTML = `
    <div class="sprint-wrapper">
      <div class="sprint-header">
        <button class="btn sm" id="sprint-quit">✕ Chhodo</button>
        <div class="sprint-stats-bar">
          <div class="sprint-timer-badge">⏱ <span id="sprint-timer">60</span>s</div>
          <div class="sprint-score-badge">🏆 <span id="sprint-score">0</span></div>
          <div class="sprint-multiplier-badge" id="sprint-multiplier">1x</div>
        </div>
      </div>

      <div class="paper sprint-card">
        <div class="sprint-streak-indicator" id="sprint-streak">🔥 0 streak</div>
        <div class="sprint-question" id="sprint-q">--</div>
        <div class="sprint-options" id="sprint-opts"></div>
      </div>
    </div>
  `;

  document.getElementById('sprint-quit').onclick = () => {
    clearInterval(timerInterval);
    if (onExitCallback) onExitCallback();
  };
}

function updateTimerDisplay() {
  const timerEl = document.getElementById('sprint-timer');
  if (timerEl) {
    timerEl.textContent = timeLeft;
    if (timeLeft <= 10) {
      timerEl.parentElement.classList.add('urgent');
    }
  }
}

function nextSprintQuestion() {
  if (timeLeft <= 0) return;
  currentQ = generateSprintQuestion();

  const qEl = document.getElementById('sprint-q');
  const optsEl = document.getElementById('sprint-opts');
  const streakEl = document.getElementById('sprint-streak');
  const multEl = document.getElementById('sprint-multiplier');
  const scoreEl = document.getElementById('sprint-score');

  if (qEl) qEl.textContent = currentQ.qText;
  if (streakEl) streakEl.textContent = `🔥 ${streak} streak`;
  if (multEl) multEl.textContent = `${getMultiplier()}x`;
  if (scoreEl) scoreEl.textContent = score;

  if (optsEl) {
    optsEl.innerHTML = currentQ.options.map((opt, i) => `
      <button class="mo sprint-opt" data-val="${opt}">
        <small>${i + 1}</small>
        <span>${opt}</span>
      </button>
    `).join('');

    optsEl.querySelectorAll('.sprint-opt').forEach((btn) => {
      btn.onclick = () => handleSprintAnswer(parseInt(btn.dataset.val, 10), btn);
    });
  }
}

function handleSprintAnswer(selectedVal, btnEl) {
  if (!currentQ || timeLeft <= 0) return;

  const isCorrect = selectedVal === currentQ.answer;
  const mult = getMultiplier();

  if (isCorrect) {
    streak++;
    if (streak > maxStreak) maxStreak = streak;
    correctCount++;
    score += 10 * mult;
    btnEl.classList.add('ok');
    soundCorrect();
    if (streak >= 3) soundCombo(streak);
  } else {
    streak = 0;
    wrongCount++;
    btnEl.classList.add('no');
    soundWrong();
  }

  setTimeout(nextSprintQuestion, 240);
}

function endSpeedSprint(container) {
  soundCheer();
  launchConfetti(2500);

  const bestScore = storage.get('sprint_best', 0);
  const isNewRecord = score > bestScore;
  if (isNewRecord) {
    storage.set('sprint_best', score);
  }

  const accuracy = Math.round((correctCount / Math.max(1, correctCount + wrongCount)) * 100);

  container.innerHTML = `
    <div class="paper result sprint-result-card" style="--c:var(--yellow)">
      <div class="qtag">Bijli Round Samapt! ⚡</div>
      <div class="big">${isNewRecord ? '🏆' : '⚡'}</div>
      <h1>${score} Points!</h1>
      <p class="lead">${isNewRecord ? '🎉 Naya High Score Ban Gaya!' : `Aapka Best Score: ${bestScore}`}</p>
      
      <div class="sprint-summary-grid">
        <div class="sprint-stat-tile">
          <b>${correctCount}</b>
          <small>Sahi Sawaal</small>
        </div>
        <div class="sprint-stat-tile">
          <b>${wrongCount}</b>
          <small>Galat</small>
        </div>
        <div class="sprint-stat-tile">
          <b>${maxStreak}</b>
          <small>Best Streak</small>
        </div>
        <div class="sprint-stat-tile">
          <b>${accuracy}%</b>
          <small>Accuracy</small>
        </div>
      </div>

      <div class="row" style="margin-top:20px;">
        <button class="btn big" id="sprint-replay">Phir Khelo 🔄</button>
        <button class="btn" id="sprint-home">Wapas Main Menu</button>
      </div>
    </div>
  `;

  document.getElementById('sprint-replay').onclick = () => {
    startSpeedSprint(container, onExitCallback);
  };
  document.getElementById('sprint-home').onclick = () => {
    if (onExitCallback) onExitCallback();
  };
}
