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

// ===== LAB EXPERIMENT 2: questions are stored in assets/questions.json =====
// Change ALLOW_SKIP to false when we are ready to require checkpoints.
(() => {
  const ALLOW_SKIP = true;
  if (!data || !data.pages.length) return;
  const figures = Array.from(document.querySelectorAll('.pages > figure.page'));
  if (!figures.length) return;

  function addTextWithMath(node, value) {
    node.replaceChildren();
    String(value || '').split(/(\$[^$]+\$)/g).forEach(part => {
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const math = document.createElement('span');
        math.className = 'lab-inline-math';
        math.dir = 'ltr';
        math.dataset.tex = part.slice(1, -1);
        math.textContent = part.slice(1, -1);  // fallback if KaTeX cannot load
        node.append(math);
      } else if (part) {
        node.append(document.createTextNode(part));
      }
    });
    renderMath(node);
  }

  function mathNode(tex, cls) {
    const span = document.createElement('span');
    span.className = cls;
    span.dir = 'ltr';
    span.dataset.tex = tex;
    span.textContent = tex;  // readable fallback if KaTeX is unavailable
    return span;
  }

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
      typeof q.question === 'string' && q.question.trim() &&
      Array.isArray(q.choices) && q.choices.length >= 2 &&
      q.choices.every(c => c && typeof c.id === 'string' &&
        (typeof c.latex === 'string' || typeof c.text === 'string')) &&
      new Set(q.choices.map(c => c.id)).size === q.choices.length &&
      q.choices.some(c => c.id === q.correct);
  }

  function makeCheckpoint(q) {
    const checkpoint = document.createElement('section');
    checkpoint.className = 'lab-checkpoint';
    checkpoint.id = q.id;
    checkpoint.dir = 'rtl';
    checkpoint.append(el('h3', '', q.title || 'שאלת הבנה'));
    const questionText = el('p');
    addTextWithMath(questionText, q.question);
    checkpoint.append(questionText);
    if (q.formula && q.formula.trim()) {
      const formulaWrapper = el('div', 'lab-formula-wrapper');
      formulaWrapper.append(mathNode(q.formula, 'lab-formula'));
      checkpoint.append(formulaWrapper);
    }

    const fieldset = document.createElement('fieldset');
    fieldset.append(el('legend', '', 'בחרו תשובה אחת:'));
    q.choices.forEach(choice => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `answer-${q.id}`;
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
    checkpoint.append(fieldset);

    const buttons = el('div', 'lab-buttons');
    const checkButton = el('button', 'lab-check-answer', 'בדיקת תשובה');
    checkButton.type = 'button';
    const hintButton = el('button', 'lab-hint-button', 'רמז');
    hintButton.type = 'button';
    buttons.append(checkButton, hintButton);
    if (ALLOW_SKIP) {
      const skipButton = el('button', 'lab-skip', 'דלג (במצב ניסוי)');
      skipButton.type = 'button';
      skipButton.addEventListener('click', () => unlock(true));
      buttons.append(skipButton);
    }
    checkpoint.append(buttons);
    const feedback = el('p', 'lab-feedback');
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    const hint = el('div', 'lab-hint');
    hint.hidden = true;
    checkpoint.append(feedback, hint);
    let wrongAttempts = 0;
    let onCompleted = () => {};

    function showHint(detailed) {
      hint.hidden = false;
      addTextWithMath(hint, detailed ? (q.hint2 || q.hint1 || '') : (q.hint1 || ''));
    }
    function unlock(skipped) {
      checkpoint.querySelectorAll('button, input').forEach(control => { control.disabled = true; });
      if (skipped) {
        feedback.textContent = 'דילגתם על השאלה. המשך הפרק פתוח לקריאה.';
      } else {
        addTextWithMath(feedback, q.explanation || 'נכון! המשך הפרק פתוח לקריאה.');
      }
      onCompleted();
    }
    checkButton.addEventListener('click', () => {
      const selected = fieldset.querySelector('input[type="radio"]:checked');
      if (!selected) {
        feedback.textContent = 'בחרו תחילה אחת מהתשובות.';
        return;
      }
      if (selected.value === q.correct) {
        unlock(false);
      } else {
        wrongAttempts += 1;
        checkButton.textContent = 'בדיקה חוזרת';
        if (wrongAttempts === 1) {
          addTextWithMath(feedback, q.wrong1 || 'התשובה אינה נכונה. נסו שוב.');
        } else {
          addTextWithMath(feedback, q.wrong2 || 'עדיין לא. נסו שוב.');
          showHint(true);
        }
      }
    });
    hintButton.addEventListener('click', () => showHint(wrongAttempts >= 2));
    return {checkpoint, completed: false, setCompletionCallback(fn) { onCompleted = fn; }};
  }

  function showError(error) {
    console.error('The question bank could not be loaded:', error);
    const warning = el('p', 'lab-load-warning', 'לא ניתן לטעון את שאלות ההבנה כעת. אפשר להמשיך לקרוא את הפרק ללא חסימה.');
    section.append(warning);
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
      const located = [];
      const usedIds = new Set();
      bank.questions.filter(q => q.status === 'approved' && q.chapter === chapter).forEach(q => {
        if (!validateQuestion(q) || usedIds.has(q.id)) {
          console.warn('Skipping invalid or duplicate question:', q && q.id);
          return;
        }
        usedIds.add(q.id);
        const dest = data.sections.find(s => s.number === q.after_section);
        if (!dest || dest.page < 1 || dest.page >= figures.length) {
          console.warn(`Skipping question ${q.id}: section ${q.after_section} was not found or is too late in the chapter.`);
          return;
        }
        located.push({q, afterPage: dest.page});
      });
      located.sort((a, b) => a.afterPage - b.afterPage);
      if (!located.length) return;
      prepareMath();

      const checkpoints = [];
      const anchors = new Map(); // Keeps multiple questions on the same page in order.
      located.forEach(item => {
        const widget = makeCheckpoint(item.q);
        const anchor = anchors.get(item.afterPage) || figures[item.afterPage - 1];
        anchor.after(widget.checkpoint);
        anchors.set(item.afterPage, widget.checkpoint);
        checkpoints.push({...item, ...widget, completed: false});
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
        item.setCompletionCallback(() => { item.completed = true; refreshLocks(); });
      });
      refreshLocks();
      renderMath(section);
    })
    .catch(showError);

  const labStyles = document.createElement('style');
  labStyles.textContent = `
    .lab-checkpoint { margin: 26px auto; max-width: 900px; padding: 24px;
      border: 2px solid #165f64; border-radius: 12px; background: #fff; direction: rtl; }
    .lab-checkpoint[hidden] { display: none; }
    .lab-checkpoint h3 { margin: 0 0 14px; color: #165f64; }
    .lab-checkpoint p { line-height: 1.7; }
    .lab-formula-wrapper { text-align: center; background: #f3f6f7; padding: 12px;
      overflow-x: auto; }
    .lab-formula { font-size: 1.15rem; }
    .lab-formula-wrapper .katex-display { margin: .35em 0; }
    .lab-checkpoint fieldset { border: 0; padding: 0; margin: 18px 0; }
    .lab-checkpoint legend { margin-bottom: 10px; font-weight: bold; }
    .lab-checkpoint label { display: flex; align-items: center; gap: 12px;
      margin: 8px 0; padding: 10px; border: 1px solid #dbe3e7; border-radius: 6px;
      cursor: pointer; }
    .lab-choice { unicode-bidi: isolate; text-align: left;
      font-size: 1.08rem; overflow-x: auto; }
    .lab-answer-formula { display: inline-block; direction: ltr; }
    .lab-inline-math { display: inline-block; direction: ltr;
      unicode-bidi: isolate; vertical-align: baseline; }
    .lab-buttons { display: flex; flex-wrap: wrap; gap: 10px; }
    .lab-buttons button { padding: 10px 16px; border-radius: 6px; cursor: pointer;
      border: 1px solid #165f64; background: #165f64; color: white; }
    .lab-buttons .lab-hint-button, .lab-buttons .lab-skip { background: white; color: #165f64; }
    .lab-buttons button:disabled { opacity: .55; cursor: default; }
    .lab-feedback { min-height: 1.7em; font-weight: 600; }
    .lab-hint { margin-top: 12px; border-right: 3px solid #165f64;
      background: #f3f6f7; padding: 12px 14px; line-height: 1.9; }
    .lab-hint[hidden] { display: none; }
    .lab-load-warning { color: #87541d; text-align: center; padding: 10px; }
    .page.lab-locked img { filter: blur(12px); pointer-events: none; }
    .page.lab-locked { position: relative; }
    .page.lab-locked::after { content: 'כדי לקרוא בהמשך, ענו על השאלה או לחצו על דלג';
      position: absolute; inset: 45px 0 0; display: grid; place-items: start center;
      padding: 26px; font-weight: bold; text-align: center; color: #172d3e;
      background: rgba(255,255,255,.55); pointer-events: none; }
  `;
  document.head.append(labStyles);
})();
// ===== END LAB EXPERIMENT 2 =====
