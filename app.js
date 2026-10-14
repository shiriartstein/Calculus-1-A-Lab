const chapterData = {};
const chapters = [
  'מה אנחנו עושים כאן, והישר הממשי',
  'סדרות ומושג הגבול',
  'טורים',
  'פונקציות',
  'הנגזרת',
  'טיילור',
  'פרק בונוס: פונקציות קמורות'
];
let chapter = Number(new URLSearchParams(location.search).get('chapter') || 1);
if (!Number.isInteger(chapter) || chapter < 1 || chapter > chapters.length) chapter = 1;
const el = (tag, cls, text) => { const node = document.createElement(tag); if(cls) node.className = cls; if(text) node.textContent = text; return node; };
const nav = document.querySelector('#chapters');
chapters.forEach((title, index) => {
  const number = index + 1;
  const link = el('a', `chapter-link${number === chapter ? ' active' : ''}`);
  link.href = `?chapter=${number}`;
  if(number === chapter) link.setAttribute('aria-current', 'page');
  link.append(el('span', 'chapter-number', String(number)));
  const label = el('span', 'chapter-name', title);
  label.append(el('span', 'status', chapterData[number] ? 'זמין לקריאה' : 'המשך יבוא'));
  link.append(label);nav.append(link);
});
document.title = `${chapters[chapter - 1]} | סיכומים בחדו״א 1א`;
const section = document.querySelector('#chapter');
const heading = el('div', 'chapter-heading');
const titles = el('div');titles.append(el('p', 'chapter-kicker', `פרק ${chapter}`));
const title = el('h2', '', chapters[chapter - 1]);title.id = 'chapter-title';titles.append(title);heading.append(titles);section.append(heading);
const data = chapterData[chapter];
if(data) {
  const actions = el('div', 'actions');
  const open = el('a', 'action', 'פתיחת PDF');open.href = data.pdf;open.target = '_blank';open.rel = 'noopener';
  const download = el('a', 'action primary', 'הורדת הפרק');download.href = data.pdf;download.download = `Chedva1_Chapter${chapter}.pdf`;
  actions.append(open, download);heading.append(actions);
  const contents = el('details', 'contents');contents.open = true;contents.append(el('summary', '', 'תוכן הפרק'));
  const links = el('nav', 'section-list');links.setAttribute('aria-label', `סעיפי פרק ${chapter}`);contents.append(links);if(data.sections.length) section.append(contents);
  data.sections.filter(item => item.level <= 3).forEach(item => {
    const a = el('a', item.level > 2 ? 'subsection' : '');a.href = `#page-${item.page}`;
    a.append(el('span', 'section-number', item.number), el('span', '', item.title));links.append(a);
  });
  section.append(el('p', 'reading-note', `פרק ${chapter} · ${data.pages.length} עמודים. להגדלה, לחיפוש בטקסט או להדפסה אפשר לפתוח את קובץ ה־PDF.`));
  const pages = el('div', 'pages');
  for(let i = 1; i <= data.pages.length; i++) {
    const figure = el('figure', 'page');figure.id = `page-${i}`;
    const caption = el('figcaption');caption.append(el('span', '', `עמוד ${i}`));
    const link = el('a', '', 'פתיחה ב־PDF');link.href = `${data.pdf}#page=${i}`;link.target = '_blank';link.rel = 'noopener';caption.append(link);
    const img = el('img');img.src = data.pages[i - 1].src;img.width = data.pages[i - 1].width;img.height = data.pages[i - 1].height;img.alt = `פרק ${chapter} — עמוד ${i}. הטקסט המלא זמין בקובץ PDF.`;img.loading = i < 3 ? 'eager' : 'lazy';img.decoding = 'async';
    figure.append(caption,img);pages.append(figure);
  }
  section.append(pages);
} else {
  const pending = el('div', 'pending');pending.append(el('span', 'pending-symbol', '…'),el('h3', '', 'המשך יבוא'),el('p', '', 'הפרק יתווסף לרשימות בהמשך.'));
  const back = el('a', 'action primary', 'לקריאת פרק 1');back.href = '?chapter=1';pending.append(back);section.append(pending);
}

// ===== LAB EXPERIMENT 3: question pools and four-question checkpoints =====
// Only questions marked "approved" in assets/questions.json can appear.
// A checkpoint is one section location; up to QUESTIONS_PER_CHECKPOINT are sampled
// without replacement from the approved questions at that location.
(() => {
  const QUESTIONS_PER_CHECKPOINT = 4;
  const ALLOW_SKIP = true;  // A single skip button bypasses the entire checkpoint.
  if (!data || !data.pages.length) return;
  const figures = Array.from(document.querySelectorAll('.pages > figure.page'));
  if (!figures.length) return;

  function renderMath(container) {
    if (!window.katex) return;
    container.querySelectorAll('[data-tex]:not([data-math-ready])').forEach(node => {
      try {
        window.katex.render(node.dataset.tex, node, {
          throwOnError: false,
          displayMode: node.classList.contains('lab-formula')
        });
        node.dataset.mathReady = 'yes';
      } catch (error) {
        console.warn('Could not render formula:', error);
      }
    });
  }

  function addTextWithMath(node, value) {
    node.replaceChildren();
    String(value || '').split(/(\$[^$]+\$)/g).forEach(part => {
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const span = el('span', 'lab-inline-math');
        span.dir = 'ltr';
        span.dataset.tex = part.slice(1, -1);
        span.textContent = span.dataset.tex; // Fallback if KaTeX is unavailable.
        node.append(span);
      } else if (part) {
        node.append(document.createTextNode(part));
      }
    });
    renderMath(node);
  }

  function mathNode(tex, cls) {
    const span = el('span', cls);
    span.dir = 'ltr';
    span.dataset.tex = tex;
    span.textContent = tex;
    return span;
  }

  function prepareMath() {
    if (window.katex) return;
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css';
    document.head.append(css);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.js';
    script.onload = () => renderMath(section);
    document.head.append(script);
  }

  function validateQuestion(q) {
    return q && /^[a-zA-Z0-9_-]+$/.test(q.id) &&
      Number.isInteger(q.chapter) && q.chapter >= 1 &&
      typeof q.after_section === 'string' &&
      q.type === 'multiple_choice' &&
      typeof q.question === 'string' && Boolean(q.question.trim()) &&
      Array.isArray(q.choices) && q.choices.length >= 2 &&
      q.choices.every(c => c && typeof c.id === 'string' &&
        (typeof c.latex === 'string' || typeof c.text === 'string')) &&
      new Set(q.choices.map(c => c.id)).size === q.choices.length &&
      q.choices.some(c => c.id === q.correct);
  }

  function chooseQuestions(pool, count) {
    const candidates = pool.slice();
    // Fisher-Yates shuffle: every candidate has the same chance to be selected.
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    return candidates.slice(0, Math.min(count, candidates.length));
  }

  function makeCheckpoint(group) {
    const questions = chooseQuestions(group.pool, QUESTIONS_PER_CHECKPOINT);
    const total = questions.length;
    let position = 0;
    let solved = 0;
    let wrongAttempts = 0;
    let skipped = false;
    let onCompleted = () => {};

    const checkpoint = el('section', 'lab-checkpoint');
    checkpoint.id = 'lab-checkpoint-' + group.sectionNumber.replace(/[^a-zA-Z0-9_-]/g, '-');
    checkpoint.dir = 'rtl';
    checkpoint.dataset.section = group.sectionNumber;
    checkpoint.dataset.questionCount = String(total);
    const top = el('div', 'lab-checkpoint-top');
    const heading = el('h3', '', 'בדיקת הבנה · סעיף ' + group.sectionNumber);
    const countLabel = el('span', 'lab-progress-text');
    top.append(heading, countLabel);
    checkpoint.append(top);

    const progress = el('div', 'lab-progress');
    progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-label', 'שאלות שהושלמו בבדיקת ההבנה');
    progress.setAttribute('aria-valuemin', '0');
    progress.setAttribute('aria-valuemax', String(total));
    const dots = [];
    for (let i = 0; i < total; i++) {
      const dot = el('span', 'lab-progress-step', String(i + 1));
      dot.setAttribute('aria-hidden', 'true');
      progress.append(dot);
      dots.push(dot);
    }
    checkpoint.append(progress);

    const prompt = el('div', 'lab-question-prompt');
    checkpoint.append(prompt);
    const fieldset = document.createElement('fieldset');
    checkpoint.append(fieldset);

    const buttons = el('div', 'lab-buttons');
    const checkButton = el('button', 'lab-check-answer', 'בדיקת תשובה');
    checkButton.type = 'button';
    const hintButton = el('button', 'lab-hint-button', 'רמז');
    hintButton.type = 'button';
    const nextButton = el('button', 'lab-next-question', 'לשאלה הבאה');
    nextButton.type = 'button';
    nextButton.hidden = true;
    buttons.append(checkButton, hintButton, nextButton);
    let skipButton = null;
    if (ALLOW_SKIP) {
      skipButton = el('button', 'lab-skip', 'דלג על כל הבדיקה');
      skipButton.type = 'button';
      buttons.append(skipButton);
    }
    checkpoint.append(buttons);

    const feedback = el('p', 'lab-feedback');
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    const hint = el('div', 'lab-hint');
    hint.hidden = true;
    checkpoint.append(feedback, hint);

    function updateProgress() {
      countLabel.textContent = skipped
        ? `${solved} מתוך ${total} הושלמו · דולג`
        : `${solved} מתוך ${total} הושלמו`;
      progress.setAttribute('aria-valuenow', String(solved));
      progress.setAttribute('aria-valuetext', skipped
        ? `${solved} שאלות נענו נכון מתוך ${total}; יתר הבדיקה דולג`
        : `${solved} שאלות נענו נכון מתוך ${total}`);
      dots.forEach((dot, i) => {
        dot.classList.toggle('done', i < solved);
        dot.classList.toggle('current', !skipped && solved < total && i === solved);
        dot.classList.toggle('skipped', skipped && i >= solved);
        dot.textContent = i < solved ? '✓' : skipped ? '—' : String(i + 1);
      });
    }

    function loadQuestion() {
      const q = questions[position];
      wrongAttempts = 0;
      feedback.replaceChildren();
      hint.replaceChildren();
      hint.hidden = true;
      prompt.replaceChildren();
      const title = el('p', 'lab-question-position', `שאלה ${position + 1} מתוך ${total}`);
      const text = el('p');
      addTextWithMath(text, q.question);
      prompt.append(title, text);
      if (q.formula && q.formula.trim()) {
        const wrapper = el('div', 'lab-formula-wrapper');
        wrapper.append(mathNode(q.formula, 'lab-formula'));
        prompt.append(wrapper);
      }
      fieldset.replaceChildren();
      fieldset.append(el('legend', '', 'בחרו תשובה אחת:'));
      q.choices.forEach(choice => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `answer-${checkpoint.id}-${position}`;
        input.value = choice.id;
        label.append(input);
        const answer = el('span', 'lab-choice');
        if (typeof choice.latex === 'string') {
          answer.append(mathNode(choice.latex, 'lab-answer-formula'));
        } else {
          addTextWithMath(answer, choice.text);
        }
        label.append(answer);
        fieldset.append(label);
      });
      fieldset.disabled = false;
      checkButton.hidden = false;
      hintButton.hidden = false;
      checkButton.disabled = false;
      hintButton.disabled = false;
      checkButton.textContent = 'בדיקת תשובה';
      nextButton.hidden = true;
      updateProgress();
      renderMath(checkpoint);
    }

    function showHint(detailed) {
      const q = questions[position];
      const text = detailed ? (q.hint2 || q.hint1 || '') : (q.hint1 || '');
      if (!text) return;
      hint.hidden = false;
      addTextWithMath(hint, text);
    }

    function completeCheckpoint(wasSkipped) {
      skipped = wasSkipped;
      fieldset.disabled = true;
      checkButton.hidden = true;
      hintButton.hidden = true;
      nextButton.hidden = true;
      if (skipButton) skipButton.hidden = true;
      updateProgress();
      if (wasSkipped) {
        feedback.textContent = 'דילגתם על שאר השאלות בבדיקה. המשך הפרק פתוח לקריאה.';
      } else {
        const finish = el('p', 'lab-complete-message', '✓ הבדיקה הושלמה! המשך הפרק פתוח לקריאה.');
        feedback.append(finish);
      }
      onCompleted(wasSkipped);
    }

    checkButton.addEventListener('click', () => {
      const q = questions[position];
      const selected = fieldset.querySelector('input[type="radio"]:checked');
      if (!selected) {
        feedback.textContent = 'בחרו תחילה אחת מהתשובות.';
        return;
      }
      if (selected.value === q.correct) {
        solved++;
        fieldset.disabled = true;
        checkButton.hidden = true;
        hintButton.hidden = true;
        hint.hidden = true;
        addTextWithMath(feedback, q.explanation || 'נכון!');
        updateProgress();
        if (position === total - 1) {
          completeCheckpoint(false);
        } else {
          nextButton.hidden = false;
        }
      } else {
        wrongAttempts++;
        checkButton.textContent = 'בדיקה חוזרת';
        addTextWithMath(feedback, wrongAttempts === 1
          ? (q.wrong1 || 'התשובה אינה נכונה. נסו שוב.')
          : (q.wrong2 || 'עדיין לא. נסו שוב.'));
        if (wrongAttempts >= 2) showHint(true);
      }
    });
    hintButton.addEventListener('click', () => showHint(wrongAttempts >= 2));
    nextButton.addEventListener('click', () => {
      if (position >= total - 1 || nextButton.hidden) return;
      position++;
      loadQuestion();
    });
    if (skipButton) skipButton.addEventListener('click', () => completeCheckpoint(true));

    loadQuestion();
    return {checkpoint, setCompletionCallback(fn) { onCompleted = fn; }};
  }

  function showError(error) {
    console.error('The question bank could not be loaded:', error);
    section.append(el('p', 'lab-load-warning',
      'לא ניתן לטעון את שאלות ההבנה כעת. אפשר להמשיך לקרוא את הפרק ללא חסימה.'));
  }

  fetch('assets/questions.json', {cache: 'no-store'})
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status} loading questions.json`);
      return response.json();
    })
    .then(bank => {
      if (!bank || bank.version !== 1 || !Array.isArray(bank.questions)) {
        throw new Error('Invalid question-bank format');
      }
      const groups = new Map();
      const usedIds = new Set();
      bank.questions.filter(q => q.status === 'approved' && q.chapter === chapter).forEach(q => {
        if (!validateQuestion(q) || usedIds.has(q.id)) {
          console.warn('Skipping invalid or duplicate question:', q && q.id);
          return;
        }
        usedIds.add(q.id);
        const destination = data.sections.find(s => s.number === q.after_section);
        if (!destination || destination.page < 1 || destination.page >= figures.length) {
          console.warn(`Skipping question ${q.id}: section ${q.after_section} was not found or is too late in the chapter.`);
          return;
        }
        // All approved questions assigned to the same section share ONE checkpoint.
        const key = String(q.after_section);
        if (!groups.has(key)) {
          groups.set(key, {sectionNumber:key, afterPage:destination.page, pool:[]});
        }
        groups.get(key).pool.push(q);
      });
      if (!groups.size) return;
      prepareMath();
      const ordered = Array.from(groups.values()).sort((a,b) => a.afterPage-b.afterPage ||
        a.sectionNumber.localeCompare(b.sectionNumber, 'en', {numeric:true}));
      const checkpoints = [];
      const anchors = new Map();
      ordered.forEach(group => {
        const widget = makeCheckpoint(group);
        const anchor = anchors.get(group.afterPage) || figures[group.afterPage - 1];
        anchor.after(widget.checkpoint);
        anchors.set(group.afterPage, widget.checkpoint);
        checkpoints.push({...group, ...widget, completed:false, skipped:false});
      });
      function refreshLocks() {
        const first = checkpoints.findIndex(item => !item.completed);
        const afterPage = first < 0 ? Infinity : checkpoints[first].afterPage;
        figures.forEach((page, index) => {
          page.classList.toggle('lab-locked', index + 1 > afterPage);
        });
        checkpoints.forEach((item, index) => {
          item.checkpoint.hidden = first >= 0 && index > first;
        });
      }
      checkpoints.forEach(item => {
        item.setCompletionCallback(wasSkipped => {
          item.completed = true;
          item.skipped = wasSkipped;
          refreshLocks();
        });
      });
      refreshLocks();
      renderMath(section);
    })
    .catch(showError);

  const labStyles = document.createElement('style');
  labStyles.textContent = `
    .lab-checkpoint {margin: 26px auto; max-width: 900px; padding: 24px;
      border: 2px solid #165f64; border-radius: 14px; background: #fff; direction: rtl;}
    .lab-checkpoint[hidden], .lab-buttons [hidden] {display: none !important;}
    .lab-checkpoint-top {display: flex; gap: 12px; flex-wrap: wrap;
      align-items: baseline; justify-content: space-between;}
    .lab-checkpoint h3 {margin: 0 0 12px; color: #165f64;}
    .lab-progress-text {color: #34545a; font-size: .88rem; font-weight: 600;}
    .lab-progress {display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0,1fr);
      gap: 8px; margin: 8px 0 24px;}
    .lab-progress-step {display: grid; place-items: center; min-height: 34px;
      border-radius: 8px; border: 1px solid #d4e1de;
      background: #f6f8f7; color: #667a7b; font-size: .9rem;}
    .lab-progress-step.current {border: 2px solid #14636b; color: #14636b;
      background: #e8f3f1; font-weight: 700;}
    .lab-progress-step.done {background: #e5f4ed; color: #18734e; border-color: #afd5c3; font-weight: 700;}
    .lab-progress-step.skipped {background: #f4f4f4; color: #a3a8a8;}
    .lab-question-position {font-size: .86rem; color: #557174; font-weight: 700; margin: 0 0 4px;}
    .lab-checkpoint p {line-height: 1.7;}
    .lab-formula-wrapper {text-align: center; background: #f3f6f7; padding: 12px; overflow-x: auto;}
    .lab-formula {font-size: 1.15rem;}
    .lab-formula-wrapper .katex-display {margin: .35em 0;}
    .lab-checkpoint fieldset {border: 0; padding: 0; margin: 18px 0;}
    .lab-checkpoint legend {margin-bottom: 10px; font-weight: bold;}
    .lab-checkpoint label {display: flex; align-items: center; gap: 12px;
      margin: 8px 0; padding: 10px; border: 1px solid #dbe3e7; border-radius: 6px; cursor: pointer;}
    .lab-choice {unicode-bidi: isolate; text-align: left; font-size: 1.08rem; overflow-x: auto;}
    .lab-answer-formula, .lab-inline-math {display: inline-block; direction: ltr; unicode-bidi: isolate;}
    .lab-buttons {display: flex; flex-wrap: wrap; gap: 10px; align-items: center;}
    .lab-buttons button {padding: 10px 16px; border-radius: 7px; cursor: pointer;
      border: 1px solid #165f64; background: #165f64; color: white; font: inherit;}
    .lab-buttons .lab-hint-button, .lab-buttons .lab-skip {background: white; color: #165f64;}
    .lab-buttons button:disabled {opacity: .55; cursor: default;}
    .lab-feedback {min-height: 1.7em; font-weight: 600;}
    .lab-complete-message {color: #18734e; margin: 8px 0 0;}
    .lab-hint {margin-top: 12px; border-right: 3px solid #165f64;
      background: #f3f6f7; padding: 12px 14px; line-height: 1.9;}
    .lab-hint[hidden] {display: none;}
    .lab-load-warning {color: #87541d; text-align: center; padding: 10px;}
    .page.lab-locked img {filter: blur(12px); pointer-events: none;}
    .page.lab-locked {position: relative;}
    .page.lab-locked::after {content: 'כדי לקרוא בהמשך, השלימו את בדיקת ההבנה או לחצו על דלג';
      position: absolute; inset: 45px 0 0; display: grid; place-items: start center;
      padding: 26px; font-weight: bold; text-align: center; color: #172d3e;
      background: rgba(255,255,255,.55); pointer-events: none;}
    @media(max-width:600px) {
      .lab-checkpoint {padding: 14px;}
      .lab-checkpoint-top {display: block;}
    }
  `;
  document.head.append(labStyles);
})();
// ===== END LAB EXPERIMENT 3 =====
