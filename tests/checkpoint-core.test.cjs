const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../checkpoint-core.js');
const root = path.join(__dirname,'..');
const bank = JSON.parse(fs.readFileSync(path.join(root,'assets/questions.json')));
const plan = JSON.parse(fs.readFileSync(path.join(root,'assets/checkpoints.json')));
const questions = core.cleanBank(bank);
assert.ok(questions.length > 0);
assert.ok(questions.every(core.published));
assert.equal(core.published({...questions[0],approval_stage:'draft'}),false);
assert.equal(core.published({...questions[0],approval_stage:'final'}),true);
assert.equal(core.cleanBank({version:1,questions:[questions[0],questions[0]]}).length,0,'Ambiguous IDs must not be selected');
for (const [chapter,pages] of [[1,25],[2,41]]) {
  const info = {pages:Array(pages),pdf_sha256:plan.pdf_sha256[chapter]};
  const layout = core.chapterPlan(plan,chapter,info);
  assert.equal(layout.gates.length,chapter === 1 ? 3 : 4);
  assert.throws(() => core.chapterPlan(plan,chapter,{...info,pdf_sha256:'changed'}));
  let previous = 0;
  for (const gate of layout.gates) {
    assert.ok(gate.after_page-previous >= 8); previous=gate.after_page;
    for (const mode of ['normal','challenge']) for (let n=0;n<20;n++) {
      const chosen=core.selectGate(questions,gate,mode);
      assert.equal(chosen.length,3);assert.equal(new Set(chosen.map(q=>q.id)).size,3);
      assert.equal(new Set(chosen.map(q=>q.coverage_group)).size,3);
      chosen.forEach((q,i)=>{assert.ok(gate.coverage_buckets[i].includes(q.coverage_group));assert.ok(q.available_after_page<=gate.after_page);assert.ok(core.routeLevels(mode).includes(q.level));});
    }
    const chosen=core.selectGate(questions,gate,'normal');
    let state=core.newSession(chosen,'gate','normal',core.gateSignature(gate));
    state.completed=true;
    assert.equal(core.restoreSession(state,questions,'gate',core.gateSignature(gate),gate).completed,false,'Completion flag alone must not unlock');
    state.completed=false;state.solvedIds=[chosen[0].id];state.awaitingNext=true;
    let restored=core.restoreSession(state,questions,'gate',core.gateSignature(gate),gate);
    assert.equal(restored.awaitingNext,true);assert.equal(restored.position,0);
    state.solvedIds=chosen.map(q=>q.id);state.position=2;state.awaitingNext=false;
    assert.equal(core.restoreSession(state,questions,'gate',core.gateSignature(gate),gate).completed,true);
    assert.equal(core.restoreSession(state,questions.filter(q=>q.id!==chosen[0].id),'gate',core.gateSignature(gate),gate),null);
    const changed=questions.map(q=>q.id===chosen[0].id?{...q,question:q.question+' שינוי'}:q);
    assert.equal(core.restoreSession(state,changed,'gate',core.gateSignature(gate),gate),null);
    const missingBucket=questions.filter(q=>!gate.coverage_buckets[1].includes(q.coverage_group));
    assert.equal(core.selectGate(missingBucket,gate,'normal'),null);
  }
}
const early=core.available(questions,1,4);
assert.ok(core.available(questions,1,5).every(q=>q.coverage_group!=='sets'),'Set operations are introduced through page 6');
assert.equal(core.selectPractice(early,'challenge').length,0,'Do not substitute a different level');
for(const level of core.LEVELS)assert.ok(core.selectPractice(early,level).every(q=>q.available_after_page<=4&&q.level===level));
const malformed=structuredClone(plan);malformed.gates[0].coverage_buckets[1]=malformed.gates[0].coverage_buckets[0];
assert.throws(()=>core.chapterPlan(malformed,1,{pages:Array(25),pdf_sha256:plan.pdf_sha256[1]}));
console.log('PASS: published stages, all seven checkpoint pools, three distinct topics, future-material exclusion, restoration, stale content, incomplete coverage and PDF/map integrity.');
