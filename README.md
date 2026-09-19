# Khel Ghar & Ganit Ghar

Two free, single-file learning websites for kids, written in Hinglish (Hindi in Roman script).

| Project | For | What it is |
|---|---|---|
| **Khel Ghar** (`khel-ghar.html`) | Younger kids | 11 small games for study and focus |
| **Ganit Ghar** (`ganit-ghar.html`) | Older kids | 15 math topics, 10 levels each, easy to hard |

Live previews:

- Khel Ghar: https://claude.ai/artifact/1fQek23bpnHYsEc5U5Yu69
- Ganit Ghar: https://claude.ai/artifact/Bq5PK1XN1Wnw9MeSnQ262z

Each site is one self-contained HTML file. No build step, no framework, no server, no sign-up.

---

## 🎲 Khel Ghar

Short games that make studying fun and train attention.

**Study games**

| Game | What kids do |
|---|---|
| Math Dhamaka | Quick add, subtract, multiply and divide (3 difficulty levels) |
| Shabd Jodo | Unscramble letters to spell English words (with Hindi hints) |
| Sahi Jawab | Multiple-choice quiz: science, GK, English, math |
| Aage Kya? | Find the next number in a pattern; the rule is shown after each answer |
| Jodi Milao | Memory card game: match a picture with its English word |

**Focus games**

| Game | What kids do |
|---|---|
| Rang Pehchano | Stroop test: name the ink colour, not the word |
| Yaad Rakho | Repeat a growing colour-and-sound sequence |
| Tara Pakdo | Tap the stars, avoid the bombs (30 seconds) |
| Alag Kaun? | Spot the odd emoji in a growing grid |
| Focus Garden | Stay on the page to grow a plant; leaving the tab makes it wilt |
| Saans Lo | One-minute guided breathing (4 s in, 4 s hold, 4 s out) |

Extras: star rewards, saved best scores, sound on/off, light and dark themes, mobile friendly.

## 📐 Ganit Ghar

A level-based math practice site.

- **15 topics × 10 levels**, each level has 10 questions.
- **Progression:** score 7/10 to pass and unlock the next level. Stars: 7 correct = ⭐, 9 = ⭐⭐, 10 = ⭐⭐⭐.
- **Teaching built in:** a short lesson before each level, and a step-by-step explanation after every wrong answer. A review of all mistakes is shown at the end.
- **Custom keypad** so the phone keyboard never covers the question. Keys for minus, decimal point and fraction slash appear only when needed.
- **Motivation:** rank system (Ganit Seekhu → Ganit Samrat), daily streak, and a daily Mix Test with bonus stars (once per day).

**Topics**

| Group | Topics |
|---|---|
| Numbers | Jod-Ghata (add/subtract), Pahade aur Guna (multiplication), Bhaag (division), Ank ki Keemat (place value, up to lakh and crore), Factors / Primes / HCF / LCM |
| Fractions, decimals, percent | Fractions (with pie diagrams), Decimals, Percentage (discount, profit and loss) |
| Reasoning | BODMAS (with step-by-step working), Algebra, Negative Numbers, Word Problems |
| Shape, time, measure | Geometry (perimeter, area, angles, circle, Pythagoras), Clock and Time, Units and Money |

---

## Run it

Open either `.html` file in any modern browser (Chrome, Edge, Safari, Firefox). That's it.

Google Fonts (Baloo 2 and Lexend) load from the internet. Offline, the sites fall back to system fonts and still work.

## Put it online

Because each site is a single static file, any static host works:

- **GitHub Pages:** upload the file (rename to `index.html` if you want it at the root) and enable Pages.
- **Netlify or Vercel:** drag and drop the file.
- **Any web host:** upload the file and open its URL.

## Saved data

Progress is stored in the browser's `localStorage`, on that device only. Clearing browser data resets it.

| Site | Key prefix | Stores |
|---|---|---|
| Khel Ghar | `kg:` | stars, sound setting, best score per game |
| Ganit Ghar | `gg:` | level stars, sound, bonus stars, streak, last test date |

Ganit Ghar also has a "Progress mitao" link at the bottom of the home screen to reset everything.

## Customising

### Khel Ghar: add a game

Games live in the `GAMES` array. Add an object:

```js
{ id:'mygame', name:'My Game', emoji:'🎯', color:'--green',
  tags:['padhai'],            // 'padhai' and/or 'focus'
  desc:'One-line description', unit:'', run:gMyGame }
```

Then write `function gMyGame(c){ ... }`. The `c` helper gives you:

| Method | Purpose |
|---|---|
| `c.el` | The game area (set its `innerHTML`) |
| `c.later(fn, ms)` / `c.every(fn, ms)` | Timers that are cleaned up automatically when the player leaves |
| `c.on(target, event, fn)` | Event listeners that are also cleaned up automatically |
| `c.score(text)` | Update the score chip |
| `c.finish({emoji, title, text, score, stars})` | Show the result screen, save the best score, award stars |

Word lists (`WORDS`) and quiz questions (`QUIZ`) are plain arrays near the top of the script.

### Ganit Ghar: add or edit a topic

Each topic is an object with a question generator `gen(L)`, where `L` is the level from 1 to 10:

```js
const mytopic = {
  id:'mytopic', name:'My Topic', sym:'∑', color:'--blue', grp:0,
  desc:'Short description',
  tips:[ [1,'Lesson title','Lesson text shown from level 1'], [5,'Next title','Shown from level 5'] ],
  gen(L){
    const a = R(1, 10*L), b = R(1, 10*L);
    return num(`${a} + ${b} = ?`, a + b, `Add them: ${a} + ${b} = ${a+b}.`);
  }
};
```

Add it to the `GAMES` array. `grp` is the index into `GROUPS` (which section of the home screen it appears in).

Question builders:

| Builder | Answer type |
|---|---|
| `num(prompt, answer, explanation, opts)` | Typed number. Options: `u` (unit shown after the answer), `neg`, `dec` (force those keypad keys) |
| `mc(prompt, correct, wrongs, explanation)` | Multiple choice |
| `fr(prompt, n, d, explanation)` | Typed fraction (any equivalent form is accepted, with a hint to simplify) |

Helpers: `R(a,b)` random integer, `P(array)` random pick, `F(n,d)` stacked fraction HTML, `MINUS` the proper minus sign. Explanations may contain simple HTML.

**Tuning rules:** pass mark and star thresholds are in `finishQuiz()` and `starsFor()`. Rank thresholds are in `RANKS`.

## Tech notes

- Plain HTML, CSS and JavaScript. No dependencies.
- Themes: automatic light and dark mode via `prefers-color-scheme`.
- Accessible basics: real buttons, visible focus outline, reduced-motion support.
- Ganit Ghar keyboard support: number keys, Backspace, Enter, and 1–4 for multiple choice.
- Ganit Ghar's generators were checked with an automated script (45,000 generated questions across all topics and levels, and every BODMAS answer compared against JavaScript evaluation).

## Ideas for next steps

- Class-wise topic selection (for example class 6 or class 8)
- A timed Speed Round
- More topics: ratio, averages, mensuration
- Hindi (Devanagari) mode
- A parent/teacher progress page

## License

Add your preferred license here (for example MIT) before sharing publicly.
