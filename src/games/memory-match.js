// Game 3: Math Memory Match (Jodi Milao)
// Card-Flip Memory Game Matching Mathematically Equivalent Concept Pairs
import { soundFlip, soundCorrect, soundWrong, soundCheer } from '../audio/sfx.js';
import { launchConfetti } from '../ui/confetti.js';
import { storage } from '../storage.js';

const PAIR_POOL = [
  { a: '½', b: '50%' },
  { a: '¼', b: '0.25' },
  { a: '¾', b: '75%' },
  { a: '3²', b: '9' },
  { a: '5²', b: '25' },
  { a: '√49', b: '7' },
  { a: '√81', b: '9' },
  { a: '2x = 12', b: 'x = 6' },
  { a: '3x = 15', b: 'x = 5' },
  { a: '1 km', b: '1000 m' },
  { a: '1 kg', b: '1000 g' },
  { a: '4 × 7', b: '28' },
  { a: '6 × 8', b: '48' },
  { a: '10% of 60', b: '6' },
  { a: '20% of 50', b: '10' },
  { a: '−4 + 9', b: '5' },
  { a: '−6 − 3', b: '−9' }
];

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let lockBoard = false;
let startTime = 0;
let elapsedSeconds = 0;
let timerInterval = null;
let onExitCallback = null;

export function startMemoryMatch(container, onExit) {
  onExitCallback = onExit;
  flippedCards = [];
  matchedPairs = 0;
  moves = 0;
  lockBoard = false;
  elapsedSeconds = 0;
  startTime = Date.now();

  // Pick 6 random pairs = 12 cards
  const selectedPairs = PAIR_POOL.slice().sort(() => Math.random() - 0.5).slice(0, 6);
  cards = [];

  selectedPairs.forEach((pair, pairId) => {
    cards.push({ id: `c-${pairId}-a`, pairId, text: pair.a, flipped: false, matched: false });
    cards.push({ id: `c-${pairId}-b`, pairId, text: pair.b, flipped: false, matched: false });
  });

  cards.sort(() => Math.random() - 0.5);

  renderMemoryUI(container);

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const timeEl = document.getElementById('memory-timer');
    if (timeEl) timeEl.textContent = `${elapsedSeconds}s`;
  }, 1000);
}

function renderMemoryUI(container) {
  container.innerHTML = `
    <div class="memory-wrapper">
      <div class="memory-header">
        <button class="btn sm" id="memory-quit">✕ Chhodo</button>
        <div class="memory-stats-bar">
          <div class="chip">⏱ <span id="memory-timer">0s</span></div>
          <div class="chip">🃏 Chalein: <span id="memory-moves">0</span></div>
          <div class="chip">✨ Jodiyan: <span id="memory-matched">0</span>/6</div>
        </div>
      </div>

      <div class="memory-grid" id="memory-grid">
        ${cards.map((c, i) => `
          <button class="memory-card" data-index="${i}">
            <div class="card-inner">
              <div class="card-front">?</div>
              <div class="card-back">${c.text}</div>
            </div>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('memory-quit').onclick = () => {
    clearInterval(timerInterval);
    if (onExitCallback) onExitCallback();
  };

  const grid = document.getElementById('memory-grid');
  grid.querySelectorAll('.memory-card').forEach((cardBtn) => {
    cardBtn.onclick = () => handleCardClick(parseInt(cardBtn.dataset.index, 10), cardBtn);
  });
}

function handleCardClick(index, cardEl) {
  if (lockBoard) return;
  const card = cards[index];
  if (card.flipped || card.matched) return;

  soundFlip();
  card.flipped = true;
  cardEl.classList.add('flipped');
  flippedCards.push({ card, el: cardEl });

  if (flippedCards.length === 2) {
    moves++;
    const movesEl = document.getElementById('memory-moves');
    if (movesEl) movesEl.textContent = moves;

    checkForMatch();
  }
}

function checkForMatch() {
  const [first, second] = flippedCards;
  const isMatch = first.card.pairId === second.card.pairId;

  if (isMatch) {
    soundCorrect();
    first.card.matched = true;
    second.card.matched = true;
    first.el.classList.add('matched');
    second.el.classList.add('matched');
    matchedPairs++;

    const matchedEl = document.getElementById('memory-matched');
    if (matchedEl) matchedEl.textContent = matchedPairs;

    flippedCards = [];

    if (matchedPairs === 6) {
      clearInterval(timerInterval);
      setTimeout(() => endMemoryGame(), 400);
    }
  } else {
    lockBoard = true;
    soundWrong();
    setTimeout(() => {
      first.card.flipped = false;
      second.card.flipped = false;
      first.el.classList.remove('flipped');
      second.el.classList.remove('flipped');
      flippedCards = [];
      lockBoard = false;
    }, 900);
  }
}

function endMemoryGame() {
  soundCheer();
  launchConfetti(2500);

  const container = document.getElementById('view');
  const bestMoves = storage.get('memory_best_moves', 999);
  const isNewBest = moves < bestMoves;
  if (isNewBest) {
    storage.set('memory_best_moves', moves);
  }

  container.innerHTML = `
    <div class="paper result" style="--c:var(--teal); max-width:640px; margin:0 auto;">
      <div class="qtag">Shabaash! 🎉</div>
      <div class="big">🃏</div>
      <h1>Saari Jodiyan Mil Gayi!</h1>
      <p class="lead">Aapne <b>${elapsedSeconds} seconds</b> aur <b>${moves} chaalon</b> mein poora kiya!</p>
      
      <div class="row" style="margin-top:20px;">
        <button class="btn big" id="memory-replay">Phir Khelo 🔄</button>
        <button class="btn" id="memory-home">Wapas Main Menu</button>
      </div>
    </div>
  `;

  document.getElementById('memory-replay').onclick = () => {
    startMemoryMatch(container, onExitCallback);
  };
  document.getElementById('memory-home').onclick = () => {
    if (onExitCallback) onExitCallback();
  };
}
