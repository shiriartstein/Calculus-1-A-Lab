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


// ===== LAB EXPERIMENT 1: one question, blurring, and Skip =====
// Everything below is experimental and can be removed as a single block.
if (chapter === 1 && data && data.pages.length >= 2) {
  const figures = Array.from(document.querySelectorAll('.pages > figure.page'));

  // The logic section ends on the page where section 1.4 begins.
  // Put our checkpoint just after that page, leaving at least one later page.
  const nextSection = data.sections.find(item => item.number === '1.4');
  const afterPage = Math.max(1, Math.min(nextSection ? nextSection.page : 5, figures.length - 1));

  const checkpoint = document.createElement('section');
  checkpoint.id = 'lab-logic-001'; // A permanent identifier for this question.
  checkpoint.className = 'lab-checkpoint';
  checkpoint.innerHTML = `
    <h3>שאלת הבנה · לוגיקה</h3>
    <p>מהי השלילה של הטענה הבאה?</p>
    <p class="lab-formula" dir="ltr">∀x ∈ ℝ ∃y ∈ ℝ : y &gt; x</p>
    <fieldset>
      <legend>בחרו תשובה אחת:</legend>
      <label><input type="radio" name="lab-logic-answer" value="a">
        <span dir="ltr">∃x ∈ ℝ ∀y ∈ ℝ : y ≤ x</span></label>
      <label><input type="radio" name="lab-logic-answer" value="b">
        <span dir="ltr">∀x ∈ ℝ ∃y ∈ ℝ : y ≤ x</span></label>
      <label><input type="radio" name="lab-logic-answer" value="c">
        <span dir="ltr">∃x ∈ ℝ ∃y ∈ ℝ : y ≤ x</span></label>
      <label><input type="radio" name="lab-logic-answer" value="d">
        <span dir="ltr">∀x ∈ ℝ ∀y ∈ ℝ : y ≤ x</span></label>
    </fieldset>
    <div class="lab-buttons">
      <button type="button" class="lab-check-answer">בדיקת תשובה</button>
      <button type="button" class="lab-skip">דלג (במצב ניסוי)</button>
    </div>
    <p class="lab-feedback" role="status" aria-live="polite"></p>
  `;
  figures[afterPage - 1].after(checkpoint);

  // Every later page is blurred until the student passes or skips.
  const lockedPages = figures.slice(afterPage);
  lockedPages.forEach(page => page.classList.add('lab-locked'));

  const feedback = checkpoint.querySelector('.lab-feedback');
  function unlock(skipped) {
    lockedPages.forEach(page => page.classList.remove('lab-locked'));
    checkpoint.querySelectorAll('button, input').forEach(control => control.disabled = true);
    feedback.textContent = skipped
      ? 'דילגתם על השאלה. המשך הפרק פתוח לקריאה.'
      : 'נכון! קיים x כך שאף y אינו גדול ממנו. המשך הפרק פתוח לקריאה.';
  }

  checkpoint.querySelector('.lab-check-answer').addEventListener('click', () => {
    const selected = checkpoint.querySelector('input[name="lab-logic-answer"]:checked');
    if (!selected) {
      feedback.textContent = 'בחרו תחילה אחת מהתשובות.';
    } else if (selected.value === 'a') {
      unlock(false);
    } else {
      feedback.textContent = 'לא בדיוק. בשלילה מחליפים ∀ ב־∃, ואת ∃ ב־∀, וגם > הופך ל־≤. נסו שוב.';
    }
  });
  checkpoint.querySelector('.lab-skip').addEventListener('click', () => unlock(true));

  // ===== LAB EXPERIMENT 1: one question, blurring, and Skip =====
// Everything below is experimental and can be removed as a single block.
if (chapter === 1 && data && data.pages.length >= 2) {
  const figures = Array.from(document.querySelectorAll('.pages > figure.page'));
  // The logic section ends on the page where section 1.4 begins.
  // Put our checkpoint just after that page, leaving at least one later page.
  const nextSection = data.sections.find(item => item.number === '1.4');
  const afterPage = Math.max(1, Math.min(nextSection ? nextSection.page : 5, figures.length - 1));
  const checkpoint = document.createElement('section');
  checkpoint.id = 'lab-logic-001'; // A permanent identifier for this question.
  checkpoint.className = 'lab-checkpoint';
  checkpoint.innerHTML = `
    <h3>שאלת הבנה · לוגיקה</h3>
    <p>מהי השלילה של הטענה הבאה?</p>
    <p class="lab-formula" dir="ltr"
       data-tex="\\forall x\\in\\mathbb{R}\\;\\exists y\\in\\mathbb{R}:y>x">∀x ∈ ℝ ∃y ∈ ℝ : y &gt; x</p>
    <fieldset>
      <legend>בחרו תשובה אחת:</legend>
      <label><input type="radio" name="lab-logic-answer" value="a">
        <span class="lab-math" dir="ltr" data-tex="\\exists x\\in\\mathbb{R}\\;\\forall y\\in\\mathbb{R}:y\\leq x">∃x ∈ ℝ ∀y ∈ ℝ : y ≤ x</span></label>
      <label><input type="radio" name="lab-logic-answer" value="b">
        <span class="lab-math" dir="ltr" data-tex="\\forall x\\in\\mathbb{R}\\;\\exists y\\in\\mathbb{R}:y\\leq x">∀x ∈ ℝ ∃y ∈ ℝ : y ≤ x</span></label>
      <label><input type="radio" name="lab-logic-answer" value="c">
        <span class="lab-math" dir="ltr" data-tex="\\exists x\\in\\mathbb{R}\\;\\exists y\\in\\mathbb{R}:y\\leq x">∃x ∈ ℝ ∃y ∈ ℝ : y ≤ x</span></label>
      <label><input type="radio" name="lab-logic-answer" value="d">
        <span class="lab-math" dir="ltr" data-tex="\\forall x\\in\\mathbb{R}\\;\\forall y\\in\\mathbb{R}:y\\leq x">∀x ∈ ℝ ∀y ∈ ℝ : y ≤ x</span></label>
    </fieldset>
    <div class="lab-buttons">
      <button type="button" class="lab-check-answer">בדיקת תשובה</button>
      <button type="button" class="lab-skip">דלג (במצב ניסוי)</button>
    </div>
    <p class="lab-feedback" role="status" aria-live="polite"></p>
  `;
  figures[afterPage - 1].after(checkpoint);

  // Render the mathematical expressions with a LaTeX-like font (KaTeX).
  // If the external library cannot load, the original Unicode text remains visible.
  const katexCss = document.createElement('link');
  katexCss.rel = 'stylesheet';
  katexCss.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css';
  document.head.appendChild(katexCss);
  const katexScript = document.createElement('script');
  katexScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.js';
  katexScript.onload = () => {
    checkpoint.querySelectorAll('[data-tex]').forEach(node => {
      katex.render(node.dataset.tex, node, {
        throwOnError: false,
        displayMode: node.classList.contains('lab-formula')
      });
    });
  };
  document.head.appendChild(katexScript);

  // Every later page is blurred until the student passes or skips.
  const lockedPages = figures.slice(afterPage);
  lockedPages.forEach(page => page.classList.add('lab-locked'));
  const feedback = checkpoint.querySelector('.lab-feedback');
  function unlock(skipped) {
    lockedPages.forEach(page => page.classList.remove('lab-locked'));
    checkpoint.querySelectorAll('button, input').forEach(control => control.disabled = true);
    feedback.textContent = skipped
      ? 'דילגתם על השאלה. המשך הפרק פתוח לקריאה.'
      : 'נכון, זו השלילה של הטענה! שימו לב שבמספרים הממשיים הטענה המקורית נכונה (למשל, אפשר לבחור y=x+1), ולכן השלילה שלה שקרית.';
  }
  checkpoint.querySelector('.lab-check-answer').addEventListener('click', () => {
    const selected = checkpoint.querySelector('input[name="lab-logic-answer"]:checked');
    if (!selected) {
      feedback.textContent = 'בחרו תחילה אחת מהתשובות.';
    } else if (selected.value === 'a') {
      unlock(false);
    } else {
      feedback.textContent = 'התשובה אינה נכונה. נסו לחשוב: מה צריך לקרות כדי שהטענה המקורית תהיה שקרית?';
    }
  });
  checkpoint.querySelector('.lab-skip').addEventListener('click', () => unlock(true));

  // Temporary styling for this one experiment. Later we can move it to style.css.
  const labStyles = document.createElement('style');
  labStyles.textContent = `
    .lab-checkpoint { margin: 26px auto; max-width: 900px; padding: 24px;
      border: 2px solid #165f64; border-radius: 12px; background: #fff; direction: rtl; }
    .lab-checkpoint h3 { margin: 0 0 14px; color: #165f64; }
    .lab-checkpoint p { line-height: 1.7; }
    .lab-formula { font-size: 1.15rem; text-align: center; background: #f3f6f7;
      padding: 12px; overflow-x: auto; }
    .lab-formula .katex-display { margin: .35em 0; }
    .lab-checkpoint fieldset { border: 0; padding: 0; margin: 18px 0; }
    .lab-checkpoint legend { margin-bottom: 10px; font-weight: bold; }
    .lab-checkpoint label { display: flex; align-items: center; gap: 12px;
      margin: 8px 0; padding: 10px; border: 1px solid #dbe3e7; border-radius: 6px;
      cursor: pointer; }
    .lab-checkpoint label > span.lab-math { unicode-bidi: isolate; text-align: left;
      font-size: 1.08rem; overflow-x: auto; }
    .lab-buttons { display: flex; flex-wrap: wrap; gap: 10px; }
    .lab-buttons button { padding: 10px 16px; border-radius: 6px; cursor: pointer;
      border: 1px solid #165f64; background: #165f64; color: white; }
    .lab-buttons .lab-skip { background: white; color: #165f64; }
    .lab-buttons button:disabled { opacity: .55; cursor: default; }
    .lab-feedback { min-height: 1.7em; font-weight: 600; }
    .page.lab-locked img { filter: blur(12px); pointer-events: none; }
    .page.lab-locked { position: relative; }
    .page.lab-locked::after { content: 'כדי לקרוא בהמשך, ענו על השאלה או לחצו על דלג';
      position: absolute; inset: 45px 0 0; display: grid; place-items: start center;
      padding: 26px; font-weight: bold; text-align: center; color: #172d3e;
      background: rgba(255,255,255,.55); pointer-events: none; }
  `;
  document.head.appendChild(labStyles);
}
// ===== END LAB EXPERIMENT 1 =====
