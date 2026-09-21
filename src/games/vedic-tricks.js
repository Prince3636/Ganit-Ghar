// Game 5: Vedic & Fast Mental Math Tricks Arcade (Jaadui Tricks)
// Learn Powerful Mental Math Shortcuts with Interactive Practice Drills
import { soundCorrect, soundWrong, soundCheer } from '../audio/sfx.js';
import { launchConfetti } from '../ui/confetti.js';

const TRICKS = [
  {
    id: 'sq5',
    title: '5 par khatam hone wale numbers ka Square',
    tag: 'Square Trick',
    explanation: `
      <b>Niyam:</b> Aakhiri do digit hamesha <b>25</b> honge.<br>
      Pehle wale digit ko uske agle number se guna karo.<br>
      <b>Example: 35²</b><br>
      1. Pehla digit hai 3. Agla number hai 4.<br>
      2. 3 × 4 = <b>12</b><br>
      3. Aage 25 laga do: <b>1225</b>! ✨
    `,
    genDrill() {
      const tens = Math.floor(Math.random() * 8) + 1; // 1 to 8
      const n = tens * 10 + 5;
      const ans = n * n;
      return {
        q: `${n}² = ?`,
        ans,
        tip: `${tens} × ${tens + 1} = ${tens * (tens + 1)}, aur aage 25 lagao.`
      };
    }
  },
  {
    id: 'mul11',
    title: 'Kisi bhi do-digit number ko 11 se guna',
    tag: '× 11 Trick',
    explanation: `
      <b>Niyam:</b> Dono digits ko alag karo, aur beech mein unka jod daalo.<br>
      <b>Example: 43 × 11</b><br>
      1. Digits hain 4 aur 3.<br>
      2. Dono ko jodo: 4 + 3 = <b>7</b>.<br>
      3. Beech mein rakh do: <b>473</b>! ✨<br>
      <i>Agar jod 10 se bada ho to 1 padosi mein carry karo. (Jaise 75 × 11 = 825)</i>
    `,
    genDrill() {
      const a = Math.floor(Math.random() * 6) + 1;
      const b = Math.floor(Math.random() * 6) + 1;
      const n = a * 10 + b;
      return {
        q: `${n} × 11 = ?`,
        ans: n * 11,
        tip: `${a} aur ${b} ke beech mein unka jod (${a + b}) rakho.`
      };
    }
  },
  {
    id: 'comp1000',
    title: '100 ya 1000 se seedha ghatana (All from 9, last from 10)',
    tag: 'Ghatane ki Trick',
    explanation: `
      <b>Niyam:</b> 1000 mein se ghatate waqt sabhi digits ko 9 se ghatao, aur aakhiri digit ko 10 se!<br>
      <b>Example: 1000 − 427</b><br>
      1. 9 − 4 = <b>5</b><br>
      2. 9 − 2 = <b>7</b><br>
      3. 10 − 7 = <b>3</b><br>
      4. Seedha jawab: <b>573</b>! ✨ Zero carry-borrow ka jhanjhat!
    `,
    genDrill() {
      const val = Math.floor(Math.random() * 800) + 120;
      return {
        q: `1000 − ${val} = ?`,
        ans: 1000 - val,
        tip: `Pehle do digit 9 se ghatao, aakhiri digit 10 se ghatao.`
      };
    }
  }
];

let activeTrickIdx = 0;
let drillQ = null;
let drillScore = 0;
let drillTotal = 5;
let currentQuestionIndex = 0;
let onExitCallback = null;

export function startVedicTricks(container, onExit) {
  onExitCallback = onExit;
  renderTricksCatalog(container);
}

function renderTricksCatalog(container) {
  container.innerHTML = `
    <div class="vedic-wrapper">
      <div class="vedic-header">
        <button class="btn sm" id="vedic-quit">✕ Chhodo</button>
        <div class="chip">🪄 Jaadui Vedic Tricks</div>
      </div>

      <div class="hero" style="padding:10px 0;">
        <h1>Tez Mental Math ki Jaadui Tricks</h1>
        <p>Bina pen-paper ke calculations dimag mein karo. Trick seekho aur practice karo!</p>
      </div>

      <div class="tips" style="margin-top:16px;">
        ${TRICKS.map((tr, idx) => `
          <article class="tip" style="cursor:pointer;" data-idx="${idx}">
            <span class="tl2">${tr.tag}</span>
            <h3>${tr.title}</h3>
            <p>Dekhein aur speed practice karein ➜</p>
          </article>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('vedic-quit').onclick = () => {
    if (onExitCallback) onExitCallback();
  };

  container.querySelectorAll('.tip').forEach((el) => {
    el.onclick = () => {
      activeTrickIdx = parseInt(el.dataset.idx, 10);
      showTrickLesson(container);
    };
  });
}

function showTrickLesson(container) {
  const trick = TRICKS[activeTrickIdx];

  container.innerHTML = `
    <div class="vedic-wrapper">
      <button class="btn sm" id="trick-back">← Saari Tricks</button>
      
      <div class="paper intro" style="--c:var(--yellow); margin-top:14px;">
        <div class="qtag">${trick.tag}</div>
        <h1>${trick.title}</h1>
        <div class="lesson" style="margin-top:14px;">
          ${trick.explanation}
        </div>
        <div class="row" style="margin-top:20px;">
          <button class="btn big" id="trick-start-drill">Practice Drill Shuru Karo (5 Sawaal) ⚡</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('trick-back').onclick = () => {
    renderTricksCatalog(container);
  };

  document.getElementById('trick-start-drill').onclick = () => {
    currentQuestionIndex = 0;
    drillScore = 0;
    renderDrillQuestion(container);
  };
}

function renderDrillQuestion(container) {
  const trick = TRICKS[activeTrickIdx];
  drillQ = trick.genDrill();

  container.innerHTML = `
    <div class="vedic-wrapper">
      <div class="qtop">
        <button class="btn sm" id="drill-quit">✕ Ruko</button>
        <div class="chip">Sawaal ${currentQuestionIndex + 1}/${drillTotal}</div>
        <div class="chip">⭐ Score: ${drillScore}</div>
      </div>

      <div class="paper quiz" style="--c:var(--yellow);">
        <div class="qtag">${trick.tag} Drill</div>
        <div class="qp" style="margin:20px 0;">${drillQ.q}</div>
        <div class="ansrow">
          <input type="number" id="drill-input" class="ansline" placeholder="Jawab likho" style="border:none; border-bottom:4px solid var(--line); width:100%; max-width:280px; background:transparent;" autocomplete="off" autofocus />
        </div>
        <div class="row" style="margin-top:14px;">
          <button class="btn big" id="drill-submit">Check ✓</button>
        </div>
        <div class="fb" id="drill-fb"></div>
      </div>
    </div>
  `;

  const inputEl = document.getElementById('drill-input');
  if (inputEl) inputEl.focus();

  document.getElementById('drill-quit').onclick = () => {
    showTrickLesson(container);
  };

  document.getElementById('drill-submit').onclick = () => checkDrillAnswer(container);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkDrillAnswer(container);
  });
}

function checkDrillAnswer(container) {
  const inputEl = document.getElementById('drill-input');
  const fb = document.getElementById('drill-fb');
  const trick = TRICKS[activeTrickIdx];
  const userVal = parseInt(inputEl.value.trim(), 10);

  if (isNaN(userVal)) return;

  const isCorrect = userVal === drillQ.ans;
  if (isCorrect) {
    drillScore++;
    soundCorrect();
    fb.className = 'fb ok';
    fb.innerHTML = `<b>Sahi Jawab! 🎉</b><p>${drillQ.tip}</p>`;
  } else {
    soundWrong();
    fb.className = 'fb no';
    fb.innerHTML = `<b>Sahi jawab: ${drillQ.ans}</b><p>${drillQ.tip}</p>`;
  }

  currentQuestionIndex++;
  const submitBtn = document.getElementById('drill-submit');
  submitBtn.disabled = true;

  setTimeout(() => {
    if (currentQuestionIndex < drillTotal) {
      renderDrillQuestion(container);
    } else {
      endDrill(container);
    }
  }, 1400);
}

function endDrill(container) {
  soundCheer();
  launchConfetti(2000);

  container.innerHTML = `
    <div class="paper result" style="--c:var(--yellow); max-width:640px; margin:0 auto;">
      <div class="qtag">Drill Poori Hui! 🏆</div>
      <div class="big">${drillScore >= 4 ? '🌟' : '💪'}</div>
      <h1>${drillScore}/${drillTotal} Sahi!</h1>
      <p class="lead">${drillScore === 5 ? 'Aapne trick ko bilkul master kar liya!' : 'Thoda aur abhyaas karein, dimag mein aur tezi aayegi.'}</p>
      <div class="row" style="margin-top:20px;">
        <button class="btn big" id="drill-again">Phir Try Karo 🔄</button>
        <button class="btn" id="drill-home">Saari Tricks</button>
      </div>
    </div>
  `;

  document.getElementById('drill-again').onclick = () => {
    currentQuestionIndex = 0;
    drillScore = 0;
    renderDrillQuestion(container);
  };
  document.getElementById('drill-home').onclick = () => {
    renderTricksCatalog(container);
  };
}
