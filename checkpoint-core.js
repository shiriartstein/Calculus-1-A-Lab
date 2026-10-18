/* Selection and restoration rules shared by the reader and its tests. */
((root) => {
  'use strict';
  const LEVELS = ['sanity', 'rehearsal', 'challenge'];
  const published = q => q?.status === 'approved' &&
    (q.approval_stage == null || ['partial', 'final'].includes(q.approval_stage));
  function validQuestion(q) {
    return q && /^[A-Za-z0-9_-]+$/.test(q.id) && published(q) &&
      Number.isInteger(q.chapter) && q.chapter >= 1 && q.chapter <= 7 &&
      q.type === 'multiple_choice' && typeof q.question === 'string' && q.question.trim() &&
      LEVELS.includes(q.level) && typeof q.coverage_group === 'string' && q.coverage_group &&
      Number.isInteger(q.available_after_page) && q.available_after_page > 0 &&
      Array.isArray(q.choices) && q.choices.length >= 2 &&
      q.choices.every(c => c && typeof c.id === 'string' &&
        [c.text, c.latex].some(value => typeof value === 'string' && value.trim())) &&
      new Set(q.choices.map(c => c.id)).size === q.choices.length &&
      q.choices.some(c => c.id === q.correct);
  }
  function cleanBank(bank) {
    if (bank?.version !== 1 || !Array.isArray(bank.questions)) throw Error('Invalid question bank');
    const counts = new Map();
    bank.questions.forEach(q => { if(q?.id) counts.set(q.id, (counts.get(q.id) || 0) + 1); });
    return bank.questions.filter(q => validQuestion(q) && counts.get(q.id) === 1);
  }
  function hash(value) {
    let result = 2166136261;
    for (const char of JSON.stringify(value)) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
    return (result >>> 0).toString(16);
  }
  const fingerprint = q => hash([q.id, q.question, q.formula || '', q.choices, q.correct]);
  const gateSignature = gate => hash([gate.id, gate.chapter, gate.after_page, gate.kind, gate.coverage_buckets]);
  const routeLevels = route => route === 'challenge' ? ['challenge'] : ['sanity', 'rehearsal'];
  const available = (questions, chapter, page) => questions.filter(q => q.chapter === chapter && q.available_after_page <= page);
  function shuffled(items, random = Math.random) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function gatePools(questions, gate, route) {
    const pool = available(questions, gate.chapter, gate.after_page).filter(q => routeLevels(route).includes(q.level));
    return gate.coverage_buckets.map(bucket => pool.filter(q => bucket.includes(q.coverage_group)));
  }
  function selectGate(questions, gate, route, random = Math.random) {
    if (!['normal', 'challenge'].includes(route)) return null;
    const pools = gatePools(questions, gate, route);
    if (pools.length !== 3 || pools.some(pool => !pool.length)) return null;
    const selected = pools.map(pool => shuffled(pool, random)[0]);
    return new Set(selected.map(q => q.id)).size === 3 && new Set(selected.map(q => q.coverage_group)).size === 3 ? selected : null;
  }
  function selectPractice(questions, level, count = 3, random = Math.random) {
    const pool = shuffled(questions.filter(q => q.level === level), random);
    const chosen = [], groups = new Set();
    for (const q of pool) if (!groups.has(q.coverage_group)) { chosen.push(q); groups.add(q.coverage_group); }
    for (const q of pool) if (!chosen.includes(q)) chosen.push(q);
    return chosen.slice(0, count);
  }
  function newSession(questions, kind, mode, signature) {
    return {schema:2, kind, mode, signature, questionIds:questions.map(q => q.id),
      fingerprints:questions.map(fingerprint), solvedIds:[], position:0, awaitingNext:false,
      completed:false, wrongAttempts:0, hintsShown:0};
  }
  function restoreSession(saved, pool, kind, signature, gate = null) {
    if (!saved || saved.schema !== 2 || saved.kind !== kind || saved.signature !== signature ||
        !Array.isArray(saved.questionIds) || !saved.questionIds.length ||
        new Set(saved.questionIds).size !== saved.questionIds.length || !Array.isArray(saved.fingerprints)) return null;
    const byId = new Map(pool.map(q => [q.id, q]));
    const chosen = saved.questionIds.map(id => byId.get(id));
    if (chosen.some((q, i) => !q || fingerprint(q) !== saved.fingerprints[i])) return null;
    if (kind === 'gate') {
      if (!gate || chosen.length !== 3 || !['normal', 'challenge'].includes(saved.mode)) return null;
      const pools = gatePools(pool, gate, saved.mode);
      if (chosen.some((q, i) => !pools[i]?.some(candidate => candidate.id === q.id)) ||
          new Set(chosen.map(q => q.coverage_group)).size !== 3) return null;
    } else if (!LEVELS.includes(saved.mode) || chosen.some(q => q.level !== saved.mode)) return null;
    const solved = new Set(Array.isArray(saved.solvedIds) ? saved.solvedIds : []);
    let prefix = 0;
    while (prefix < chosen.length && solved.has(chosen[prefix].id)) prefix++;
    if ([...solved].some(id => !chosen.slice(0, prefix).some(q => q.id === id))) return null;
    const completed = prefix === chosen.length;
    const awaitingNext = !completed && prefix > 0 && saved.awaitingNext === true && saved.position === prefix - 1;
    const position = completed ? chosen.length - 1 : awaitingNext ? prefix - 1 : prefix;
    return {...saved, completed, awaitingNext, position, solvedIds:chosen.slice(0, prefix).map(q => q.id),
      wrongAttempts:position === saved.position && !awaitingNext ? Math.max(0, Math.min(10000, Number(saved.wrongAttempts) || 0)) : 0,
      hintsShown:position === saved.position ? Math.max(0, Math.min(2, Number(saved.hintsShown) || 0)) : 0};
  }
  function chapterPlan(plan, chapter, info) {
    if (!plan || plan.version !== 1 || !Array.isArray(plan.gates)) throw Error('Invalid checkpoint plan');
    const gates = plan.gates.filter(g => g.chapter === chapter).sort((a,b) => a.after_page - b.after_page);
    if (!gates.length) return {gates:[], practice:[], supported:false};
    if (!info || !info.pdf_sha256 || plan.pdf_sha256?.[chapter] !== info.pdf_sha256) throw Error('The checkpoint map does not match this PDF');
    const seen = new Set();
    let previous = 0;
    for (const gate of gates) {
      const buckets = gate.coverage_buckets;
      if (!/^[A-Za-z0-9_-]+$/.test(gate.id) || seen.has(gate.id) ||
          !['gate', 'summary'].includes(gate.kind) || gate.questions_required !== 3 ||
          !Number.isInteger(gate.after_page) || gate.after_page <= previous || gate.after_page > info.pages.length ||
          (gate.kind === 'gate' && gate.after_page === info.pages.length) ||
          !Array.isArray(buckets) || buckets.length !== 3 || buckets.some(b => !Array.isArray(b) || !b.length || b.some(g => typeof g !== 'string')) ||
          new Set(buckets.flat()).size !== buckets.flat().length) throw Error('Invalid checkpoint layout');
      seen.add(gate.id); previous = gate.after_page;
    }
    const practice = [...new Set(plan.practice?.[chapter] || [])];
    if (practice.some(p => !Number.isInteger(p) || p < 1 || p > info.pages.length || gates.some(g => g.after_page === p))) throw Error('Invalid practice page');
    return {gates, practice:practice.sort((a,b) => a-b), supported:true};
  }
  const api = {LEVELS, published, validQuestion, cleanBank, hash, fingerprint, gateSignature, routeLevels,
    available, shuffled, gatePools, selectGate, selectPractice, newSession, restoreSession, chapterPlan};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CalcLabCore = api;
})(globalThis);
