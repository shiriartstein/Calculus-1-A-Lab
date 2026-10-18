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
  function count() { const states = Object.entries(read()).filter(([key,value]) => /^[1-7]:gate-v2:/.test(key) && value?.kind === 'gate').map(([,value]) => value); return {finished: states.filter(s => s && s.completed).length, started: states.length}; }
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

// ===== TRIAL READER: optional practice and three-topic checkpoints =====
(() => {
  'use strict';
  const core = window.CalcLabCore;
  const LEVELS = {sanity:'בדיקת מושגים', rehearsal:'בדיקת הבנה', challenge:'אתגר'};
  const DESCRIPTIONS = {
    sanity:'אני לא סגור על מה מדברים, רוצה לוודא שבכלל הבנתי את הקטע',
    rehearsal:'אני מבין סה״כ, תבדקו אותי',
    challenge:'תשאלו שאלות קשות, נראה אם אני מצליח'
  };
  const ROUTES = {normal:'בדקו אם אפשר להמשיך', challenge:'בדקו אם אפשר להמשיך — עם שאלות מאתגרות'};
  let questions = [], plan = null;
  const gateKey = gate => 'gate-v2:' + gate.id;
  const button = (text, cls = '') => { const b = el('button', cls, text); b.type = 'button'; return b; };
  function rich(host, text) {
    host.replaceChildren();
    String(text || '').split(/(\$[^$]+\$)/g).forEach(part => {
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) host.append(math(part.slice(1,-1)));
      else host.append(document.createTextNode(part));
    });
  }
  function math(tex, display = false) {
    const n = el('span', display ? 'lab-formula' : 'lab-inline-math'); n.dir = 'ltr';
    if (window.katex) {
      try { window.katex.render(tex, n, {throwOnError:true, displayMode:display}); }
      catch (_) { n.textContent = tex; }
    } else n.textContent = tex;
    return n;
  }
  function record(event) {
    if (!demoProgress.hasUser()) return;
    const old = demoProgress.get(0, 'lab-history-v2');
    const events = Array.isArray(old?.events) ? old.events : [];
    events.push({...event, at:new Date().toISOString()});
    demoProgress.set(0, 'lab-history-v2', {events});
  }
  function saveSession(ch, key, value) {
    if (value) value.updatedAt = new Date().toISOString();
    demoProgress.set(ch, key, value); demoProgress.refresh();
  }
  const gateRestore = gate => core.restoreSession(demoProgress.get(gate.chapter, gateKey(gate)), questions,
    'gate', core.gateSignature(gate), gate);
  const layoutFor = ch => core.chapterPlan(plan, ch, chapterData[ch]);
  function readingLimit(ch) {
    const layout = layoutFor(ch);
    const first = layout.gates.find(g => g.kind === 'gate' && !gateRestore(g)?.completed &&
      ['normal','challenge'].some(route => core.selectGate(questions,g,route)));
    return first ? first.after_page : chapterData[ch].pages.length;
  }
  function readThrough(ch) {
    const recorded = demoProgress.get(ch, 'reading-v2');
    const matched = recorded?.pdf_sha256 === chapterData[ch]?.pdf_sha256;
    const visited = matched ? Math.max(0, Number(recorded.page) || 0) : 0;
    const passed = layoutFor(ch).gates.filter(g => gateRestore(g)?.completed).map(g => g.after_page);
    return Math.min(readingLimit(ch), Math.max(visited, 0, ...passed));
  }
  function markRead(ch, page) {
    if (!demoProgress.hasUser()) return;
    const old = demoProgress.get(ch, 'reading-v2');
    const previous = old?.pdf_sha256 === chapterData[ch].pdf_sha256 ? Number(old.page) || 0 : 0;
    if (page <= previous) return;
    demoProgress.set(ch, 'reading-v2', {page, pdf_sha256:chapterData[ch].pdf_sha256});
  }
  function levelPicker(pool, onPick, selected = '') {
    const host = el('div', 'lab-level-picker'); host.setAttribute('aria-label','בחירת רמת תרגול');
    Object.entries(LEVELS).forEach(([level, label]) => {
      const count = pool.filter(q => q.level === level).length;
      const b = button('', 'lab-level-option'); b.dataset.level = level;
      b.setAttribute('aria-pressed', String(level === selected));
      b.append(el('strong','',label), el('span','',DESCRIPTIONS[level]));
      b.disabled = !count || !demoProgress.hasUser();
      if (!count) b.append(el('small','','עדיין אין שאלות ברמה הזו בחומר שנקרא'));
      b.onclick = () => onPick(level); host.append(b);
    });
    return host;
  }
  function questionView(host, state, onSave, onComplete, context) {
    const byId = new Map(questions.map(q => [q.id,q]));
    const q = byId.get(state.questionIds[state.position]);
    host.replaceChildren(); host.hidden = false;
    host.dataset.questionId = q.id; host.dataset.coverageGroup = q.coverage_group;
    host.dataset.level = q.level;
    const progress = el('div','lab-progress'); progress.setAttribute('role','progressbar');
    progress.setAttribute('aria-label','שאלות שנענו נכון'); progress.setAttribute('aria-valuemin','0');
    progress.setAttribute('aria-valuemax',String(state.questionIds.length));
    progress.setAttribute('aria-valuenow',String(state.solvedIds.length));
    state.questionIds.forEach((id, i) => {
      const done = state.solvedIds.includes(id);
      const dot = el('span', 'lab-progress-step' + (done ? ' done' : i === state.position ? ' current' : ''), done ? '✓' : String(i+1));
      dot.setAttribute('aria-hidden','true'); progress.append(dot);
    });
    host.append(progress, el('p','lab-question-position',`שאלה ${state.position+1} מתוך ${state.questionIds.length} · ${LEVELS[q.level]}`));
    const prompt = el('h4','lab-question-prompt'); prompt.tabIndex = -1; rich(prompt,q.question); host.append(prompt);
    if (q.formula?.trim()) {const f = el('div','lab-formula-wrapper'); f.append(math(q.formula,true)); host.append(f);}
    const report = window.CalcQuestionFeedback?.createButton(q, {...context, mode:state.mode});
    if (report) host.append(report);
    const fieldset = el('fieldset'); fieldset.append(el('legend','','בחרו תשובה אחת:'));
    q.choices.forEach(choice => {
      const label = el('label','lab-answer');
      const radio = el('input'); radio.type = 'radio'; radio.name = 'answer-' + context.key; radio.value = choice.id;
      radio.checked = state.selectedAnswer === choice.id;
      radio.onchange = () => {state.selectedAnswer = choice.id; onSave();};
      const text = el('span','lab-choice');
      if (typeof choice.latex === 'string') text.append(math(choice.latex)); else rich(text,choice.text);
      label.append(radio,text); fieldset.append(label);
    });
    fieldset.disabled = state.awaitingNext || state.completed; host.append(fieldset);
    const actions = el('div','lab-buttons');
    const check = button(state.wrongAttempts ? 'בדיקה חוזרת' : 'בדיקת תשובה','lab-check-answer');
    const hintButton = button(state.hintsShown ? 'רמז נוסף' : 'רמז','lab-hint-button');
    hintButton.disabled = state.hintsShown >= 2;
    check.hidden = hintButton.hidden = state.awaitingNext || state.completed;
    const next = button('לשאלה הבאה','lab-next-question'); next.hidden = !state.awaitingNext;
    actions.append(check,hintButton,next); host.append(actions);
    const feedback = el('p','lab-feedback'); feedback.setAttribute('role','status'); feedback.tabIndex = -1;
    const hint = el('div','lab-hint'); hint.hidden = !state.hintsShown || state.awaitingNext || state.completed;
    if (state.hintsShown) rich(hint,state.hintsShown >= 2 ? q.hint2 || q.hint1 : q.hint1);
    if (state.awaitingNext || state.completed) {
      // Old bank entries included a UI unlock sentence after every correct answer.
      rich(feedback,(q.explanation || 'נכון!').replace(/המשך הפרק פתוח לקריאה\.?/g,''));
    } else if (state.wrongAttempts) {
      rich(feedback,state.wrongAttempts === 1 ? q.wrong1 || 'התשובה אינה נכונה. נסו שוב.' : q.wrong2 || 'עדיין לא. נסו להיעזר ברמז.');
    }
    host.append(feedback,hint);
    if (state.completed) {
      let text = '✓ התרגול הושלם. אפשר להמשיך לקרוא או לבחור רמה למקבץ נוסף.';
      if (state.kind === 'gate') text = context.summary ? '✓ בדיקת סיכום הפרק הושלמה.' : '✓ שלוש שאלות משלושה נושאים נענו נכון. המשך הקריאה פתוח.';
      host.append(el('p','lab-complete-message',text));
      if (state.kind === 'gate' && !context.summary) {
        const forward = button('להמשך הקריאה','lab-continue');
        forward.onclick = () => {const figure = document.getElementById('page-' + (context.afterPage+1)); figure?.scrollIntoView({behavior:'smooth',block:'start'}); figure?.focus({preventScroll:true});};
        host.append(forward);
      }
    }
    const redraw = () => questionView(host,state,onSave,onComplete,context);
    check.onclick = () => {
      if (state.completed || state.awaitingNext) return;
      const selected = fieldset.querySelector('input:checked');
      if (!selected) {feedback.textContent = 'בחרו תחילה אחת מהתשובות.'; feedback.focus(); return;}
      const correct = selected.value === q.correct;
      record({type:'answer', ...context, mode:state.mode, questionId:q.id, coverageGroup:q.coverage_group,
        level:q.level, answerId:selected.value, correct});
      if (correct) {
        if (!state.solvedIds.includes(q.id)) state.solvedIds.push(q.id);
        state.completed = state.solvedIds.length === state.questionIds.length;
        state.awaitingNext = !state.completed;
      } else {
        state.wrongAttempts++;
        if (state.wrongAttempts >= 2) state.hintsShown = 2;
      }
      onSave(); redraw();
      if (state.completed) onComplete();
      host.querySelector('.lab-feedback')?.focus({preventScroll:true});
    };
    hintButton.onclick = () => {
      state.hintsShown = Math.min(2,state.hintsShown+1);
      record({type:'hint', ...context, mode:state.mode, questionId:q.id, hint:state.hintsShown});
      onSave(); redraw(); host.querySelector('.lab-hint')?.scrollIntoView({behavior:'smooth',block:'nearest'});
    };
    next.onclick = () => {
      if (!state.awaitingNext || state.completed) return;
      state.position++; state.awaitingNext = false; state.wrongAttempts = 0; state.hintsShown = 0; state.selectedAnswer = '';
      onSave(); redraw(); host.querySelector('.lab-question-prompt')?.focus({preventScroll:true});
    };
  }
  function makeGate(gate, onChanged) {
    let state = gateRestore(gate);
    const host = el('section','lab-checkpoint'); host.id = 'checkpoint-' + gate.id; host.dataset.gateId = gate.id;
    host.dataset.afterPage = String(gate.after_page);
    const title = el('h3','', (gate.kind === 'summary' ? 'בדיקת סיכום · ' : 'לפני שממשיכים · ') + gate.title);
    host.append(title,el('p','lab-checkpoint-intro','שלוש תשובות נכונות, בשלושה נושאים שונים. אפשר להיעזר ברמזים ולנסות שוב.'));
    const routes = el('div','lab-route-picker'); routes.setAttribute('aria-label','בחירת מסלול בדיקה');
    const ready = Object.fromEntries(Object.keys(ROUTES).map(route => [route,Boolean(core.selectGate(questions,gate,route))]));
    const work = el('div','lab-session'); work.hidden = true;
    const persist = () => saveSession(gate.chapter,gateKey(gate),state);
    const context = {key:gate.id, chapter:gate.chapter, kind:'gate', afterPage:gate.after_page, summary:gate.kind === 'summary'};
    const refresh = () => {
      routes.querySelectorAll('button').forEach(b => {b.setAttribute('aria-pressed',String(state?.mode === b.dataset.route)); b.disabled = !ready[b.dataset.route] || !demoProgress.hasUser() || Boolean(state?.completed);});
      host.classList.toggle('lab-completed',Boolean(state?.completed));
      if (state) questionView(work,state,persist,() => {refresh(); onChanged();},context);
    };
    Object.entries(ROUTES).forEach(([route,label]) => {
      const b = button(label,'lab-route-option'); b.dataset.route = route;
      if (!ready[route]) b.title = 'עדיין חסרות שאלות במסלול הזה';
      b.onclick = () => {
        if (state?.mode === route) {work.querySelector('.lab-question-prompt')?.focus(); return;}
        const chosen = core.selectGate(questions,gate,route); if (!chosen) return;
        state = core.newSession(chosen,'gate',route,core.gateSignature(gate));
        markRead(gate.chapter,gate.after_page); persist();
        record({type:'start',...context,mode:route,questionIds:state.questionIds}); refresh(); onChanged();
        work.querySelector('.lab-question-prompt')?.focus({preventScroll:true});
      }; routes.append(b);
    });
    host.append(routes);
    if (!ready.normal && !ready.challenge) host.append(el('p','lab-load-warning','השאלות לבדיקה הזו עדיין אינן מוכנות. אפשר להמשיך לקרוא.'));
    else if (!ready.challenge) host.append(el('p','lab-small','המסלול המאתגר יתווסף כשיהיו בו שאלות לכל שלושת הנושאים.'));
    if (!demoProgress.hasUser()) host.append(el('p','lab-small','בחרו משתמש ניסוי למעלה כדי לפתור שאלות ולשמור התקדמות.'));
    else host.append(el('p','lab-small','בחירת מסלול אחר במהלך הבדיקה מתחילה מקבץ חדש של שלוש שאלות.'));
    host.append(work); refresh();
    return {host, gate, get completed(){return Boolean(state?.completed);}, blocking:gate.kind === 'gate' && (ready.normal || ready.challenge)};
  }
  function makeInlinePractice(page) {
    const pool = core.available(questions,chapter,page);
    const key = 'inline-v2:' + page, signature = core.hash([chapter,page,'inline-v2']);
    let state = core.restoreSession(demoProgress.get(chapter,key),pool,'practice',signature);
    const host = el('section','lab-optional'); host.dataset.practicePage = String(page);
    const toggle = button('רוצים לבדוק את ההבנה? · תרגול רשות','lab-practice-toggle');
    const panel = el('div','lab-optional-panel'); panel.hidden = true; panel.id = 'practice-page-' + page;
    toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-controls',panel.id);
    panel.append(el('h3','',`תרגול מהחומר עד עמוד ${page}`),el('p','lab-small','בחרו רמה למקבץ קצר. אפשר לסגור בכל שלב ולהמשיך לקרוא.'));
    const choices = el('div'), work = el('div','lab-session'); work.hidden = true;
    const context = {key,chapter,kind:'practice',afterPage:page};
    const persist = () => saveSession(chapter,key,state);
    const render = () => {
      choices.replaceChildren(levelPicker(pool,level => {
        const selected = core.selectPractice(pool,level); if (!selected.length) return;
        state = core.newSession(selected,'practice',level,signature); persist(); markRead(chapter,page);
        record({type:'start',...context,mode:level,questionIds:state.questionIds}); render();
        work.querySelector('.lab-question-prompt')?.focus({preventScroll:true});
      },state?.mode));
      if (state) questionView(work,state,persist,() => {},context);
    };
    if (!demoProgress.hasUser()) panel.append(el('p','lab-small','בחרו משתמש ניסוי למעלה כדי להתחיל בתרגול.'));
    const close = button('סגירת התרגול והמשך קריאה','lab-quiet-button');
    close.onclick = () => {panel.hidden = true; toggle.setAttribute('aria-expanded','false'); toggle.focus();};
    toggle.onclick = () => {panel.hidden = !panel.hidden; toggle.setAttribute('aria-expanded',String(!panel.hidden)); if(!panel.hidden) {markRead(chapter,page); render();}};
    panel.append(choices,work,close); host.append(toggle,panel); return host;
  }
  function renderReader(layout) {
    if (!layout.supported) return;
    const figures = Array.from(document.querySelectorAll('.pages > .page'));
    const widgets = [], practices = [];
    const refreshLocks = () => {
      const first = demoProgress.hasUser() ? widgets.find(w => w.blocking && !w.completed) : null;
      const limit = first ? first.gate.after_page : Infinity;
      figures.forEach((figure,i) => {
        const locked = i+1 > limit;
        figure.classList.toggle('lab-locked',locked);
        figure.querySelector('img').setAttribute('aria-hidden',String(locked));
        const message = figure.querySelector('.lab-lock-message'); message.hidden = !locked;
        if (locked) {message.href = '#' + first.host.id; message.textContent = 'כדי להמשיך לקרוא, השלימו את בדיקת ההבנה שמעל';}
      });
      widgets.forEach(w => {w.host.hidden = w.gate.after_page > limit;});
      practices.forEach(p => {p.host.hidden = p.page > limit;});
    };
    figures.forEach(figure => {
      figure.tabIndex = -1;
      const message = el('a','lab-lock-message'); message.hidden = true;
      figure.append(message);
      const marker = el('span','lab-read-marker'); marker.setAttribute('aria-hidden','true'); figure.append(marker);
    });
    layout.gates.forEach(gate => {const widget = makeGate(gate,refreshLocks); widgets.push(widget); figures[gate.after_page-1].after(widget.host);});
    layout.practice.forEach(page => {const host = makeInlinePractice(page); practices.push({page,host}); figures[page-1].after(host);});
    refreshLocks();
    const intro = el('div','lab-reading-guide');
    intro.append(el('strong','','קוראים בקצב שלכם'),el('p','','בין העמודים תמצאו כפתורי תרגול רשות בשלוש רמות. אחרי יחידה שלמה, שלוש שאלות משלושה נושאים יפתחו את המשך הקריאה.'));
    const firstPractice = practices[0];
    if (firstPractice) {const link = el('a','lab-guide-link','שלוש רמות התרגול'); link.href = '#' + firstPractice.host.querySelector('.lab-optional-panel').id; link.onclick = e => {e.preventDefault(); const panel = firstPractice.host.querySelector('.lab-optional-panel'); if(panel.hidden) firstPractice.host.querySelector('button').click(); firstPractice.host.scrollIntoView({behavior:'smooth',block:'start'});}; intro.append(link);}
    document.querySelector('.pages').before(intro);
    if ('IntersectionObserver' in window && demoProgress.hasUser()) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {if (!entry.isIntersecting) return; const figure = entry.target.closest('.page'); if(!figure.classList.contains('lab-locked')) markRead(chapter,Number(figure.id.slice(5)));});
      });
      figures.forEach(f => observer.observe(f.querySelector('.lab-read-marker')));
    }
  }
  function renderStandalonePractice() {
    section.replaceChildren(el('h2','','רוצים לתרגל?'));
    if (!demoProgress.hasUser()) {section.append(el('p','lab-load-warning','בחרו משתמש ניסוי למעלה כדי לתרגל ולשמור התקדמות.')); return;}
    const limits = new Map();
    for (const ch of [...new Set(questions.map(q => q.chapter))]) {
      try {if(layoutFor(ch).supported) limits.set(ch,readThrough(ch));} catch (_) {}
    }
    const eligible = questions.filter(q => q.available_after_page <= (limits.get(q.chapter) || 0));
    if (!eligible.length) {
      section.append(el('p','','כאן יופיעו שאלות מהעמודים שכבר קראתם. אפשר להתחיל לקרוא ולפתוח תרגול רשות בין העמודים.'));
      const link = el('a','action primary','לקריאת פרק 1'); link.href = '?chapter=1'; section.append(link); return;
    }
    section.append(el('p','lab-small','שאלות מהחומר שכבר קראתם. בחירת רמה מתחילה מקבץ חדש; התרגול אינו משנה את פתיחת הפרקים.'));
    const area = el('div','lab-practice-area'), controls = el('div','lab-practice-controls');
    const scope = el('select'); scope.setAttribute('aria-label','בחירת חומר לתרגול'); scope.append(new Option('כל החומר שנקרא','all'));
    [...new Set(eligible.map(q => q.chapter))].sort().forEach(ch => scope.append(new Option('פרק '+ch,String(ch))));
    const amount = el('select'); amount.setAttribute('aria-label','מספר שאלות'); [3,5,10].forEach(n => amount.append(new Option(n+' שאלות',String(n))));
    controls.append(scope,amount); const picker = el('div'), work = el('div','lab-session'); work.hidden = true;
    area.append(controls,picker,work); section.append(area);
    const signature = 'standalone-v2';
    let state = core.restoreSession(demoProgress.get(0,'practice-v2'),eligible,'practice',signature);
    if (state?.scope && [...scope.options].some(o => o.value === state.scope)) scope.value = state.scope;
    const context = {key:'standalone-v2',kind:'practice'};
    const persist = () => saveSession(0,'practice-v2',state);
    const render = () => {
      const pool = eligible.filter(q => scope.value === 'all' || q.chapter === Number(scope.value));
      picker.replaceChildren(levelPicker(pool,level => {
        const selected = core.selectPractice(pool,level,Number(amount.value));
        state = core.newSession(selected,'practice',level,signature); state.scope = scope.value; persist();
        record({type:'start',...context,mode:level,questionIds:state.questionIds}); render();
      },state?.mode));
      if (state) questionView(work,state,persist,() => {},context);
    };
    scope.onchange = () => {state = null; persist(); work.replaceChildren(); work.hidden = true; render();};
    render();
  }
  async function start() {
    if (!core) throw Error('Checkpoint engine did not load');
    const [bank, locations] = await Promise.all(['assets/questions.json','assets/checkpoints.json'].map(async url => {
      const response = await fetch(url,{cache:'no-store'}); if(!response.ok) throw Error('Question data unavailable'); return response.json();
    }));
    questions = core.cleanBank(bank); plan = locations;
    if (practiceMode) renderStandalonePractice();
    else if (data) renderReader(layoutFor(chapter));
  }
  start().catch(error => {
    console.error('Checkpoint reader:',error);
    section.append(el('p','lab-load-warning','שאלות הפרק אינן זמינות כרגע או ממתינות להתאמה לרשימות המעודכנות. בינתיים אפשר להמשיך לקרוא ללא עצירות.'));
    document.querySelectorAll('.lab-locked').forEach(n => n.classList.remove('lab-locked'));
    document.querySelectorAll('.lab-lock-message').forEach(n => {n.hidden = true;});
  });
})();
