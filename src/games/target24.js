// Game 4: Target 24 (Lakshya 24 / Number Quest)
// Brain Training Puzzle: Combine 4 Given Numbers with (+, -, ×, ÷) to Reach Exactly 24!
import { soundCorrect, soundWrong, soundClick, soundCheer } from '../audio/sfx.js';
import { launchConfetti } from '../ui/confetti.js';

const SOLVABLE_SETS = [
  { nums: [1, 2, 3, 4], hint: '1 × 2 × 3 × 4 = 24' },
  { nums: [3, 8, 3, 3], hint: '(3 − 3 ÷ 3) × 8 = 24' },
  { nums: [4, 6, 8, 2], hint: '(8 − 4) × 6 = 24' },
  { nums: [2, 3, 4, 6], hint: '2 × 3 + 4 + 14? Ya 6 × 4 = 24' },
  { nums: [5, 5, 5, 1], hint: '5 × (5 − 1 ÷ 5) = 24' },
  { nums: [6, 6, 6, 6], hint: '6 + 6 + 6 + 6 = 24' },
  { nums: [2, 8, 3, 1], hint: '8 × 3 × 1 = 24' },
  { nums: [7, 3, 3, 1], hint: '(7 + 1) × 3 = 24' },
  { nums: [9, 3, 4, 2], hint: '9 × 2 + 4 + 2? (9 − 3) × 4 = 24' },
  { nums: [4, 4, 4, 4], hint: '4 × 4 + 4 + 4 = 24' }
];

let currentPuzzleIdx = 0;
let expressionTokens = [];
let usedIndices = new Set();
let onExitCallback = null;

export function startTarget24(container, onExit) {
  onExitCallback = onExit;
  currentPuzzleIdx = Math.floor(Math.random() * SOLVABLE_SETS.length);
  expressionTokens = [];
  usedIndices.clear();

  renderTargetUI(container);
}

function renderTargetUI(container) {
  const puzzle = SOLVABLE_SETS[currentPuzzleIdx];

  container.innerHTML = `
    <div class="target-wrapper">
      <div class="target-header">
        <button class="btn sm" id="target-quit">✕ Chhodo</button>
        <div class="chip">🎯 Lakshya: <b>24</b></div>
        <button class="btn sm" id="target-hint-btn">💡 Hint</button>
      </div>

      <div class="paper target-card">
        <div class="qtag">Lakshya 24 · Puzzle #${currentPuzzleIdx + 1}</div>
        <p class="target-instruction">Charon numbers aur operators ka use karke <b>24</b> banao!</p>

        <!-- Expression Screen -->
        <div class="target-display" id="target-screen">
          <span class="target-placeholder">Formula banayein...</span>
        </div>

        <div class="target-val-preview" id="target-val">Value: 0</div>

        <!-- Number buttons -->
        <div class="target-num-row" id="target-nums">
          ${puzzle.nums.map((n, i) => `
            <button class="btn target-num-btn ${usedIndices.has(i) ? 'used' : ''}" data-idx="${i}" data-val="${n}">${n}</button>
          `).join('')}
        </div>

        <!-- Operator buttons -->
        <div class="target-ops-row">
          <button class="btn op-btn" data-token="+">+</button>
          <button class="btn op-btn" data-token="−">−</button>
          <button class="btn op-btn" data-token="×">×</button>
          <button class="btn op-btn" data-token="÷">÷</button>
          <button class="btn op-btn" data-token="(">(</button>
          <button class="btn op-btn" data-token=")">)</button>
          <button class="btn sm" id="target-backspace">⌫</button>
          <button class="btn sm" id="target-clear">C</button>
        </div>

        <div class="row" style="margin-top:16px;">
          <button class="btn big" id="target-submit">Check Karo ✓</button>
          <button class="btn" id="target-skip">Agla Puzzle ➜</button>
        </div>

        <div class="target-feedback" id="target-feedback"></div>
      </div>
    </div>
  `;

  document.getElementById('target-quit').onclick = () => {
    if (onExitCallback) onExitCallback();
  };

  document.getElementById('target-skip').onclick = () => {
    currentPuzzleIdx = (currentPuzzleIdx + 1) % SOLVABLE_SETS.length;
    expressionTokens = [];
    usedIndices.clear();
    renderTargetUI(container);
  };

  document.getElementById('target-hint-btn').onclick = () => {
    const fb = document.getElementById('target-feedback');
    if (fb) {
      fb.className = 'fb ok';
      fb.innerHTML = `<b>💡 Hint:</b> ${puzzle.hint}`;
    }
  };

  // Numbers click
  document.getElementById('target-nums').querySelectorAll('.target-num-btn').forEach((btn) => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.idx, 10);
      if (usedIndices.has(idx)) return;
      soundClick();
      usedIndices.add(idx);
      btn.classList.add('used');
      expressionTokens.push({ type: 'num', value: btn.dataset.val, idx });
      updateTargetDisplay();
    };
  });

  // Operators click
  container.querySelectorAll('.op-btn').forEach((btn) => {
    btn.onclick = () => {
      soundClick();
      expressionTokens.push({ type: 'op', value: btn.dataset.token });
      updateTargetDisplay();
    };
  });

  document.getElementById('target-backspace').onclick = () => {
    soundClick();
    if (!expressionTokens.length) return;
    const popped = expressionTokens.pop();
    if (popped.type === 'num') {
      usedIndices.delete(popped.idx);
      const btn = container.querySelector(`.target-num-btn[data-idx="${popped.idx}"]`);
      if (btn) btn.classList.remove('used');
    }
    updateTargetDisplay();
  };

  document.getElementById('target-clear').onclick = () => {
    soundClick();
    expressionTokens = [];
    usedIndices.clear();
    container.querySelectorAll('.target-num-btn').forEach(b => b.classList.remove('used'));
    updateTargetDisplay();
  };

  document.getElementById('target-submit').onclick = () => {
    evaluateTargetSubmission();
  };
}

function updateTargetDisplay() {
  const screen = document.getElementById('target-screen');
  const valEl = document.getElementById('target-val');
  if (!screen) return;

  if (expressionTokens.length === 0) {
    screen.innerHTML = `<span class="target-placeholder">Formula banayein...</span>`;
    if (valEl) valEl.textContent = `Value: 0`;
    return;
  }

  const exprStr = expressionTokens.map(t => t.value).join(' ');
  screen.textContent = exprStr;

  try {
    const evalStr = exprStr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    // Safe arithmetic evaluation
    if (/^[0-9+\-*/().\s]+$/.test(evalStr)) {
      const res = Function(`'use strict'; return (${evalStr})`)();
      if (typeof res === 'number' && !isNaN(res)) {
        valEl.textContent = `Value: ${Math.round(res * 100) / 100}`;
      }
    }
  } catch (e) {
    valEl.textContent = `Value: ...`;
  }
}

function evaluateTargetSubmission() {
  const fb = document.getElementById('target-feedback');
  const puzzle = SOLVABLE_SETS[currentPuzzleIdx];

  if (usedIndices.size < 4) {
    soundWrong();
    if (fb) {
      fb.className = 'fb no';
      fb.innerHTML = `<b>Abhi sabhi 4 numbers use nahi hue!</b><p>Aapko charon numbers ka ek-ek baar use karna hai.</p>`;
    }
    return;
  }

  const exprStr = expressionTokens.map(t => t.value).join(' ');
  const evalStr = exprStr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');

  try {
    const res = Function(`'use strict'; return (${evalStr})`)();
    if (Math.abs(res - 24) < 1e-5) {
      soundCheer();
      launchConfetti(2000);
      if (fb) {
        fb.className = 'fb ok';
        fb.innerHTML = `<b>Sahi Jawab! 🎉</b><p>${exprStr} = 24! Kamaal kar diya.</p>`;
      }
    } else {
      soundWrong();
      if (fb) {
        fb.className = 'fb no';
        fb.innerHTML = `<b>Iska result ${res} hai, 24 nahi.</b><p>Dobara try karo ya brackets use karo!</p>`;
      }
    }
  } catch (err) {
    soundWrong();
    if (fb) {
      fb.className = 'fb no';
      fb.innerHTML = `<b>Expression galat hai!</b><p>Signs aur brackets dhyan se check karein.</p>`;
    }
  }
}
