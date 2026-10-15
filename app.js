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
const practiceMode = new URLSearchParams(location.search).has('practice');
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
const practiceNav = el('a', `chapter-link${practiceMode ? ' active' : ''}`);
practiceNav.href = '?practice=1';
practiceNav.textContent = '✎ רוצים לתרגל?';
nav.append(practiceNav);
document.title = practiceMode ? 'רוצים לתרגל? | חדו״א 1א' : `${chapters[chapter - 1]} | סיכומים בחדו״א 1א`;
const section = document.querySelector('#chapter');
const heading = el('div', 'chapter-heading');
const titles = el('div');titles.append(el('p', 'chapter-kicker', `פרק ${chapter}`));
const title = el('h2', '', chapters[chapter - 1]);title.id = 'chapter-title';titles.append(title);heading.append(titles);section.append(heading);
const data = chapterData[chapter];
if(data && !practiceMode) {
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
} else if (!practiceMode) {
  const pending = el('div', 'pending');pending.append(el('span', 'pending-symbol', '…'),el('h3', '', 'המשך יבוא'),el('p', '', 'הפרק יתווסף לרשימות בהמשך.'));
  const back = el('a', 'action primary', 'לקריאת פרק 1');back.href = '?chapter=1';pending.append(back);section.append(pending);
}

// ===== DEMO PROFILES: browser-local data, NOT real authentication =====
const demoProgress = (() => {
  const PREFIX = 'calc1a-lab-demo-v1:';
  const USERS = ['student1', 'student2', 'student3', 'student4'];
  let user = null;
  try { const saved = localStorage.getItem(PREFIX + 'current'); if (USERS.includes(saved)) user = saved; } catch (_) {}
  function read() {
    if (!user) return {};
    try { const value = JSON.parse(localStorage.getItem(PREFIX + user) || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
    catch (_) { return {}; }
  }
  function write(value) {
    if (!user) return;
    try { localStorage.setItem(PREFIX + user, JSON.stringify(value)); }
    catch (error) { console.warn('Demo progress could not be saved:', error); alert('לא ניתן לשמור התקדמות בדפדפן זה.'); }
  }
  // Display names are separate from permanent profile IDs and progress records.
  function displayNames() {
    try {
      const names = JSON.parse(localStorage.getItem(PREFIX + 'display-names') || '{}');
      return names && typeof names === 'object' && !Array.isArray(names) ? names : {};
    } catch (_) { return {}; }
  }
  function displayName(id) {
    const name = displayNames()[id];
    return typeof name === 'string' && name.trim() ? name.trim() : id;
  }
  function checkpointKey(ch, sectionNumber) { return String(ch) + ':' + sectionNumber; }
  function get(ch, sectionNumber) { return read()[checkpointKey(ch, sectionNumber)] || null; }
  function set(ch, sectionNumber, state) { const all = read(); all[checkpointKey(ch, sectionNumber)] = state; write(all); }
  function switchUser(next) {
    if (!USERS.includes(next)) return;
    user = next;
    try { localStorage.setItem(PREFIX + 'current', user); } catch (_) {}
    location.reload();
  }
  function reset() { if (user) { try { localStorage.removeItem(PREFIX + user); } catch (_) {} location.reload(); } }
  function count() { const states = Object.entries(read()).filter(([key]) => /^[1-7]:/.test(key)).map(([,value]) => value); return {finished: states.filter(s => s && s.completed).length, started: states.length}; }
  const panel = el('div', 'demo-account-panel');
  panel.dir = 'rtl';
  const heading = el('strong', '', 'משתמשי ניסוי · שמירה בדפדפן זה בלבד');
  const controls = el('div', 'demo-account-controls');
  const select = document.createElement('select');
  select.setAttribute('aria-label', 'בחירת משתמש ניסוי');
  select.append(new Option('בחרו משתמש', ''));
  function refreshOptions() {
    const selected = select.value || user || '';
    select.replaceChildren(new Option('בחרו משתמש', ''));
    USERS.forEach(id => select.append(new Option(displayName(id), id)));
    select.value = selected;
  }
  refreshOptions();
  select.value = user || '';
  select.addEventListener('change', () => switchUser(select.value));
  const renameButton = el('button', '', '✎ שינוי שם');
  renameButton.type = 'button';
  renameButton.title = 'שינוי שם התצוגה של המשתמש הנבחר';
  renameButton.addEventListener('click', () => {
    if (!user) return;
    const proposed = prompt('שם חדש עבור ' + displayName(user) + ':', displayName(user));
    if (proposed === null) return;
    const next = proposed.trim();
    if (!next) { alert('יש להזין שם שאינו ריק.'); return; }
    if (next.length > 60) { alert('השם ארוך מדי (עד 60 תווים).'); return; }
    const names = displayNames();
    names[user] = next;
    try { localStorage.setItem(PREFIX + 'display-names', JSON.stringify(names)); }
    catch (_) { alert('לא ניתן לשמור את השם בדפדפן זה.'); return; }
    refreshOptions();
    refresh();
  });
  const status = el('span', '', '');
  const resetButton = el('button', '', 'התחלה מחדש של כל הקורס');
  resetButton.type = 'button';
  resetButton.addEventListener('click', () => {
    if (user && confirm('למחוק את כל ההתקדמות של ' + displayName(user) + ' בכל הפרקים? לא ניתן לבטל פעולה זו.')) reset();
  });
  controls.append(select, renameButton, status, resetButton);
  panel.append(heading, controls);
  section.before(panel);
  // Always-visible indicator of the active demo profile.
  const floatingUser = el('button', 'demo-floating-user');
  floatingUser.type = 'button';
  floatingUser.title = 'מעבר לבחירת משתמש';
  floatingUser.setAttribute('aria-label', 'מעבר לבחירת משתמש הניסוי');
  floatingUser.addEventListener('click', () => panel.scrollIntoView({behavior:'smooth', block:'center'}));
  document.body.append(floatingUser);
  function refresh() {
    const n = count();
    status.textContent = user ? `הושלמו ${n.finished} בדיקות · ${n.started} בדיקות עם התקדמות` : 'בחרו משתמש כדי להתחיל';
    resetButton.disabled = !user;
    renameButton.disabled = !user;
    floatingUser.textContent = user ? '◉ ' + displayName(user) : '◉ בחרו משתמש';
  }
  refresh();
  const style = document.createElement('style');
  style.textContent = `.demo-account-panel{max-width:900px;margin:18px auto;padding:16px 20px;border:1px solid #b9d2ce;border-radius:12px;background:#f2f8f6;direction:rtl}
  .demo-account-controls{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:10px}
  .demo-account-controls select,.demo-account-controls button{font:inherit;padding:7px 12px;border-radius:7px;border:1px solid #165f64;background:white;color:#165f64}
  .demo-account-controls button{cursor:pointer}.demo-account-controls button:disabled{opacity:.5}
  .demo-floating-user{position:fixed;right:16px;bottom:16px;z-index:1000;max-width:calc(100vw - 32px);
    padding:10px 16px;border-radius:999px;border:1px solid #165f64;background:#165f64;color:#fff;
    box-shadow:0 3px 12px rgba(0,0,0,.2);font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;direction:ltr}
  .demo-floating-user:focus-visible{outline:3px solid #f5b544;outline-offset:3px}
  @media(max-width:600px){.demo-floating-user{right:10px;bottom:10px;padding:9px 12px}}`;
  document.head.append(style);
  return { get, set, refresh, hasUser: () => Boolean(user) };
})();

// ===== LAB EXPERIMENT 3: question pools and four-question checkpoints =====
// Only questions marked "approved" in assets/questions.json can appear.
// A checkpoint is one section location; up to QUESTIONS_PER_CHECKPOINT are sampled
// without replacement from the approved questions at that location.
(() => {
  const QUESTIONS_PER_CHECKPOINT = 4;
  const ALLOW_SKIP = true;  // A single skip button bypasses the entire checkpoint.
  if (!practiceMode && (!data || !data.pages.length)) return;
  const figures = Array.from(document.querySelectorAll('.pages > figure.page'));
  if (!practiceMode && !figures.length) return;

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
    const saved = demoProgress.get(chapter, group.sectionNumber);
    const byId = new Map(group.pool.map(q => [q.id, q]));
    const restored = saved && Array.isArray(saved.questionIds) ? saved.questionIds.map(id => byId.get(id)) : [];
    const validRestore = restored.length > 0 && restored.every(Boolean) && new Set(restored.map(q => q.id)).size === restored.length;
    const questions = validRestore ? restored : chooseQuestions(group.pool, QUESTIONS_PER_CHECKPOINT);
    const total = questions.length;
    let position = validRestore ? Math.min(Math.max(0, saved.position || 0), total - 1) : 0;
    let solved = validRestore ? Math.min(Math.max(0, saved.solved || 0), total) : 0;
    let wrongAttempts = validRestore ? Math.max(0, saved.wrongAttempts || 0) : 0;
    let skipped = validRestore ? Boolean(saved.skipped) : false;
    let completed = validRestore ? Boolean(saved.completed) : false;
    let awaitingNext = validRestore ? Boolean(saved.awaitingNext) : false;
    let hintsUsed = validRestore ? Math.max(0, saved.hintsUsed || 0) : 0;
    let attempts = validRestore && Array.isArray(saved.attempts) ? saved.attempts : [];
    function persist() {
      demoProgress.set(chapter, group.sectionNumber, {
        questionIds: questions.map(q => q.id), position, solved, wrongAttempts,
        skipped, completed, awaitingNext, hintsUsed, attempts, updatedAt: new Date().toISOString()
      });
      demoProgress.refresh();
    }
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
      // Keep the marker on the question being displayed until Next is pressed.
      // A correct answer is counted immediately, but the visual step advances only
      // when position changes (or the checkpoint is completed).
      const visualDone = skipped || completed ? solved : position;
      dots.forEach((dot, i) => {
        dot.classList.toggle('done', i < visualDone);
        dot.classList.toggle('current', !skipped && !completed && i === position);
        dot.classList.toggle('skipped', skipped && i >= solved);
        dot.textContent = i < visualDone ? '✓' : skipped ? '—' : String(i + 1);
      });
    }

    function loadQuestion() {
      const q = questions[position];
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
      nextButton.hidden = !awaitingNext;
      if (awaitingNext) {
        fieldset.disabled = true;
        checkButton.hidden = true;
        hintButton.hidden = true;
        addTextWithMath(feedback, q.explanation || 'נכון!');
      } else if (wrongAttempts > 0) {
        checkButton.textContent = 'בדיקה חוזרת';
        addTextWithMath(feedback, wrongAttempts === 1 ? (q.wrong1 || 'התשובה אינה נכונה. נסו שוב.') : (q.wrong2 || 'עדיין לא. נסו שוב.'));
        if (wrongAttempts >= 2) showHint(true, false);
      }
      updateProgress();
      renderMath(checkpoint);
    }

    function showHint(detailed, record = true) {
      const q = questions[position];
      const text = detailed ? (q.hint2 || q.hint1 || '') : (q.hint1 || '');
      if (!text) return;
      hint.hidden = false;
      addTextWithMath(hint, text);
      if (record) { hintsUsed++; persist(); }
    }

    function completeCheckpoint(wasSkipped) {
      skipped = wasSkipped;
      completed = true;
      awaitingNext = false;
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
      persist();
      onCompleted(wasSkipped);
    }

    checkButton.addEventListener('click', () => {
      const q = questions[position];
      const selected = fieldset.querySelector('input[type="radio"]:checked');
      if (!selected) {
        feedback.textContent = 'בחרו תחילה אחת מהתשובות.';
        return;
      }
      attempts.push({questionId:q.id, answerId:selected.value, correct:selected.value === q.correct, at:new Date().toISOString()});
      if (selected.value === q.correct) {
        solved++;
        awaitingNext = position !== total - 1;
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
          persist();
        }
      } else {
        wrongAttempts++;
        checkButton.textContent = 'בדיקה חוזרת';
        addTextWithMath(feedback, wrongAttempts === 1
          ? (q.wrong1 || 'התשובה אינה נכונה. נסו שוב.')
          : (q.wrong2 || 'עדיין לא. נסו שוב.'));
        if (wrongAttempts >= 2) showHint(true);
        persist();
      }
    });
    hintButton.addEventListener('click', () => showHint(wrongAttempts >= 2));
    nextButton.addEventListener('click', () => {
      if (position >= total - 1 || nextButton.hidden) return;
      position++;
      wrongAttempts = 0;
      awaitingNext = false;
      persist();
      loadQuestion();
    });
    if (skipButton) skipButton.addEventListener('click', () => completeCheckpoint(true));

    loadQuestion();
    if (completed) {
      completeCheckpoint(skipped);
    } else if (!validRestore) {
      persist();
    }
    return {checkpoint, initiallyCompleted:completed, initiallySkipped:skipped, setCompletionCallback(fn) { onCompleted = fn; }};
  }

  function showError(error) {
    console.error('The question bank could not be loaded:', error);
    section.append(el('p', 'lab-load-warning',
      'לא ניתן לטעון את שאלות ההבנה כעת. אפשר להמשיך לקרוא את הפרק ללא חסימה.'));
  }

  // Practice uses exactly the same published bank and demo profile as checkpoints.
  // Its history/session live under chapter 0, separate from checkpoint completion.
  function renderPractice(bank) {
    section.replaceChildren();
    section.dir = 'rtl';
    section.append(el('h2', '', 'רוצים לתרגל?'));
    if (!demoProgress.hasUser()) {
      section.append(el('p', 'lab-load-warning', 'בחרו משתמש ניסוי למעלה כדי לתרגל.'));
      return;
    }
    const eligible = bank.questions.filter(q => q.status === 'approved' && validateQuestion(q) &&
      demoProgress.get(q.chapter, q.after_section)?.completed);
    const area = el('div', 'lab-practice-area');
    section.append(area);
    const uniqueChapters = [...new Set(eligible.map(q => q.chapter))].sort((a,b) => a-b);
    const sections = [...new Set(eligible.map(q => q.chapter + ':' + q.after_section))]
      .sort((a,b) => a.localeCompare(b, 'en', {numeric:true}));
    if (!eligible.length) {
      area.append(el('p', '', 'עדיין אין סעיפים שהושלמו. השלימו או דלגו על בדיקת הבנה כדי לפתוח שאלות לתרגול.'));
      return;
    }
    const savedSession = demoProgress.get(0, 'practice-session');
    const history = () => demoProgress.get(0, 'practice-history')?.attempts || [];
    const controls = el('div', 'lab-practice-controls');
    const scope = document.createElement('select');
    scope.setAttribute('aria-label', 'בחירת חומר לתרגול');
    scope.append(new Option('כל החומר שהושלם', 'all'));
    uniqueChapters.forEach(c => scope.append(new Option('פרק ' + c, 'chapter:' + c)));
    sections.forEach(key => {
      const [c, sec] = key.split(':');
      scope.append(new Option('סעיף ' + sec + ' (פרק ' + c + ')', 'section:' + key));
    });
    const amount = document.createElement('select');
    amount.setAttribute('aria-label', 'מספר שאלות');
    [['5','5 שאלות'],['10','10 שאלות'],['all','כל השאלות']].forEach(([v,t]) => amount.append(new Option(t,v)));
    const start = el('button', '', 'התחלת תרגול');
    controls.append(scope, amount, start);
    area.append(controls);
    const info = el('p', 'lab-progress-text');
    const work = el('div', 'lab-checkpoint');
    area.append(info, work);
    let session = savedSession && Array.isArray(savedSession.questionIds) ? savedSession : null;
    function saveSession() { demoProgress.set(0, 'practice-session', session); }
    function showControls() {
      controls.hidden = false;
      info.textContent = 'זמינות ' + eligible.length + ' שאלות לתרגול · ' + history().length + ' תשובות נשמרו בהיסטוריה';
      work.replaceChildren(); work.hidden = true;
    }
    function renderSession() {
      if (!session) { showControls(); return; }
      const byId = new Map(eligible.map(q => [q.id,q]));
      const questions = session.questionIds.map(id => byId.get(id));
      if (!questions.length || questions.some(q => !q)) {
        session = null; saveSession(); showControls(); return;
      }
      if (session.position >= questions.length) {
        controls.hidden = false;
        work.hidden = false;
        work.replaceChildren(el('h3', '', 'התרגול הושלם!'));
        info.textContent = 'סיימתם ' + questions.length + ' שאלות. אפשר להתחיל תרגול חדש.';
        session = null; saveSession(); return;
      }
      controls.hidden = true; work.hidden = false;
      const q = questions[session.position];
      work.replaceChildren();
      work.append(el('h3', '', 'תרגול · שאלה ' + (session.position+1) + ' מתוך ' + questions.length));
      const prompt = el('p'); addTextWithMath(prompt, q.question); work.append(prompt);
      if (q.formula?.trim()) { const formula = el('div', 'lab-formula-wrapper'); formula.append(mathNode(q.formula,'lab-formula')); work.append(formula); }
      const fieldset = document.createElement('fieldset');
      fieldset.append(el('legend', '', 'בחרו תשובה אחת:'));
      q.choices.forEach(c => {
        const label = document.createElement('label');
        const radio = document.createElement('input'); radio.type='radio'; radio.name='practice-answer'; radio.value=c.id;
        const span=el('span','lab-choice');
        if (typeof c.latex === 'string') span.append(mathNode(c.latex,'lab-answer-formula'));
        else addTextWithMath(span,c.text);
        label.append(radio,span); fieldset.append(label);
      });
      work.append(fieldset);
      const buttons = el('div','lab-buttons');
      const check = el('button','','בדיקת תשובה');
      const hintButton = el('button','','רמז');
      const next = el('button','','לשאלה הבאה');
      const end = el('button','','סיום התרגול');
      [check,hintButton,next,end].forEach(b=>b.type='button');
      next.hidden = !session.awaitingNext;
      buttons.append(check,hintButton,next,end); work.append(buttons);
      const feedback=el('p','lab-feedback'); feedback.setAttribute('role','status');
      const hint=el('div','lab-hint'); hint.hidden=true;
      work.append(feedback,hint);
      const showHint = detailed => {
        const content = detailed ? (q.hint2 || q.hint1 || '') : (q.hint1 || '');
        if (!content) return;
        hint.hidden=false; addTextWithMath(hint,content);
      };
      if (session.awaitingNext) {
        fieldset.disabled=true; check.hidden=true; hintButton.hidden=true;
        addTextWithMath(feedback,q.explanation || 'נכון!');
      } else if (session.wrongAttempts > 0) {
        check.textContent='בדיקה חוזרת';
        addTextWithMath(feedback,session.wrongAttempts===1 ? (q.wrong1 || 'התשובה אינה נכונה. נסו שוב.') : (q.wrong2 || 'עדיין לא. נסו שוב.'));
        if (session.wrongAttempts>=2) showHint(true);
      }
      hintButton.onclick = () => { showHint(session.wrongAttempts>=2); };
      check.onclick = () => {
        const selected=fieldset.querySelector('input:checked');
        if (!selected) { feedback.textContent='בחרו תחילה אחת מהתשובות.'; return; }
        const correct=selected.value===q.correct;
        const attempts=history();
        attempts.push({questionId:q.id,chapter:q.chapter,section:q.after_section,answerId:selected.value,correct,at:new Date().toISOString()});
        demoProgress.set(0,'practice-history',{attempts});
        if (correct) {
          session.awaitingNext=true; fieldset.disabled=true; check.hidden=true; hintButton.hidden=true;
          hint.hidden=true; addTextWithMath(feedback,q.explanation || 'נכון!'); next.hidden=false;
        } else {
          session.wrongAttempts=(session.wrongAttempts||0)+1;
          check.textContent='בדיקה חוזרת';
          addTextWithMath(feedback,session.wrongAttempts===1 ? (q.wrong1 || 'התשובה אינה נכונה. נסו שוב.') : (q.wrong2 || 'עדיין לא. נסו שוב.'));
          if (session.wrongAttempts>=2) showHint(true);
        }
        saveSession();
      };
      next.onclick = () => { session.position++; session.awaitingNext=false; session.wrongAttempts=0; saveSession(); renderSession(); };
      end.onclick = () => { session=null; saveSession(); showControls(); };
      renderMath(work);
    }
    start.onclick = () => {
      const filtered=eligible.filter(q => scope.value==='all' ||
        (scope.value.startsWith('chapter:') && q.chapter===Number(scope.value.slice(8))) ||
        (scope.value.startsWith('section:') && q.chapter+':'+q.after_section===scope.value.slice(8)));
      const shuffled=chooseQuestions(filtered,amount.value==='all' ? filtered.length : Number(amount.value));
      if (!shuffled.length) return;
      session={questionIds:shuffled.map(q=>q.id),position:0,awaitingNext:false,wrongAttempts:0};
      saveSession(); renderSession();
    };
    prepareMath();
    renderSession();
  }

  fetch('assets/questions.json', {cache: 'no-store'})
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status} loading questions.json`);
      return response.json();
    })
    .then(bank => {
      if (practiceMode) {
        if (!bank || bank.version !== 1 || !Array.isArray(bank.questions)) throw new Error('Invalid question-bank format');
        renderPractice(bank);
        return;
      }
      if (!demoProgress.hasUser()) {
        section.append(el('p', 'lab-load-warning', 'כדי לפתור שאלות ולשמור התקדמות, בחרו משתמש ניסוי למעלה.'));
        return;
      }
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
        checkpoints.push({...group, ...widget, completed:widget.initiallyCompleted, skipped:widget.initiallySkipped});
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
    .lab-practice-area{max-width:900px;margin:0 auto;direction:rtl}
    .lab-practice-controls{display:flex;flex-wrap:wrap;gap:12px;margin:18px 0}
    .lab-practice-controls select,.lab-practice-controls button{font:inherit;padding:9px;border:1px solid #165f64;border-radius:7px;background:white;color:#165f64}
    .lab-practice-controls button{background:#165f64;color:white;cursor:pointer}
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
