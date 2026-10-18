/* Temporary trial feedback. Set enabled:false to hide it everywhere. */
(() => {
  'use strict';
  const config=window.CALCULUS_FEEDBACK||{};
  if(config.enabled!==true){window.CalcQuestionFeedback={createButton:()=>null};return;}
  const KEY='calculus-question-feedback-v1';
  const node=(tag,text)=>{const e=document.createElement(tag);e.textContent=text||'';return e;};
  let records=[];
  try{const raw=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(raw))records=raw;}catch{}
  const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(records));return true;}catch{return false;}};
  const stylesheet=node('style');stylesheet.textContent=`
    .cq-report-button{font:inherit;padding:.45rem .75rem;border:1px solid #b77c58;color:#75472d;background:#fff7ef;border-radius:7px;cursor:pointer;margin:.4rem 0}
    .cq-report-dialog{direction:rtl;color:#183c46;background:#fffdfa;width:min(520px,calc(100% - 32px));box-sizing:border-box;border:1px solid #c9d8d0;border-radius:14px;padding:24px;font:16px/1.6 system-ui;max-height:90vh;overflow:auto}
    .cq-report-dialog::backdrop{background:#16384280}.cq-report-dialog h2{margin:0 0 12px;font-size:22px}.cq-report-dialog textarea{display:block;width:100%;box-sizing:border-box;min-height:120px;font:inherit;padding:10px;margin:6px 0 12px;border:1px solid #b5c6c4;border-radius:6px}
    .cq-report-dialog button{font:inherit;padding:6px 10px;border:1px solid #b5c6c4;border-radius:7px;background:white;cursor:pointer}.cq-report-dialog button:disabled{opacity:.6}.cq-report-actions{display:flex;gap:8px;flex-wrap:wrap}.cq-report-dialog p{font-size:14px}.cq-report-status{white-space:pre-wrap}.cq-report-dialog label{display:block}
  `;document.head.append(stylesheet);
  const dialog=node('dialog');dialog.className='cq-report-dialog';dialog.dir='rtl';dialog.setAttribute('aria-labelledby','cq-report-title');
  const form=node('form'),title=node('h2','דיווח על בעיה בשאלה');title.id='cq-report-title';
  const idLine=node('p'),label=node('label','מה הייתה הבעיה?'),note=node('textarea');note.required=true;note.maxLength=2000;note.placeholder='למשל: ניסוח לא ברור, שתי תשובות נכונות או נוסחה שלא מוצגת היטב';label.append(note);
  const privacy=node('p','אפשר לכתוב הערה קצרה בלי שם או פרטים אישיים. הדיווח אינו משפיע על ההתקדמות שלכם.');
  const status=node('p');status.className='cq-report-status';status.setAttribute('role','status');
  const actions=node('div');actions.className='cq-report-actions';
  const submit=node('button','שמירת הדיווח ושליחה');submit.type='submit';
  const retry=node('button','ניסיון שליחה מחדש');retry.type='button';
  const download=node('button','הורדת הדיווחים שלי');download.type='button';
  const close=node('button','סגירה');close.type='button';close.onclick=()=>dialog.close();
  actions.append(submit,retry,download,close);form.append(title,idLine,label,privacy,status,actions);dialog.append(form);document.body.append(dialog);
  let target=null,current=null;
  const snapshot=q=>JSON.parse(JSON.stringify(Object.fromEntries(['id','chapter','title','question','formula','choices','correct','hint1','hint2','explanation','level','coverage_group'].filter(k=>q[k]!==undefined).map(k=>[k,q[k]]))));
  async function send(record){
    if(!config.endpoint)return {ok:false,message:'טרם חובר יעד משותף. הדיווח לא נשלח לצוות. אפשר להוריד את הדיווחים ולהעביר את הקובץ לעורכת.'};
    const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),12000);
    try{
      const response=await fetch(config.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:JSON.stringify(record.report),signal:abort.signal});
      const receipt=await response.json();
      if(!response.ok||receipt.id!==record.report.id||receipt.saved!==true)throw Error('invalid receipt');
      record.sent_at=new Date().toISOString();persist();
      return {ok:true,message:'הדיווח נשמר בשרת ונשלח לרשימת הטיפול של הצוות. תודה!'};
    }catch{return {ok:false,message:'לא התקבל אישור שמירה מהשרת. הדיווח עדיין ממתין לשליחה. אפשר לנסות שוב או להוריד אותו לקובץ.'};}
    finally{clearTimeout(timeout);}
  }
  async function submitCurrent(){
    const entry=current;
    submit.disabled=true;retry.disabled=true;status.textContent='שומרים את הדיווח…';
    const result=await send(entry);
    if(current!==entry)return;
    status.textContent=result.message;
    retry.hidden=result.ok||!config.endpoint;retry.disabled=false;
    submit.disabled=true;note.disabled=true;
  }
  form.onsubmit=async event=>{
    event.preventDefault();const text=note.value.trim();if(!text){note.setCustomValidity('נא לכתוב הערה קצרה.');note.reportValidity();return;}note.setCustomValidity('');
    if(current)return;
    current={report:{id:crypto.randomUUID(),question_id:target.q.id,note:text,created_at:new Date().toISOString(),status:'open',source:'trial',question_snapshot:snapshot(target.q),context:target.context},sent_at:null};
    const entry=current;records.push(entry);const stored=persist();
    await submitCurrent();
    if(current===entry&&!stored&&!entry.sent_at)status.textContent+=' הדפדפן לא הצליח לשמור עותק מקומי; הורידו כעת את הדיווחים לפני סגירת העמוד.';
  };
  note.oninput=()=>note.setCustomValidity('');
  retry.onclick=async()=>{if(current)await submitCurrent();};
  download.onclick=()=>{
    const blob=new Blob([JSON.stringify({version:1,reports:records.map(x=>x.report)},null,2)],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=node('a');a.href=url;a.download='question-issue-reports.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  };
  window.CalcQuestionFeedback={createButton(q,context={}){
    const button=node('button','דיווח על בעיה בשאלה');button.type='button';button.className='cq-report-button';
    button.onclick=()=>{target={q,context};current=null;idLine.textContent='מזהה שאלה: '+q.id;note.disabled=false;note.value='';note.setCustomValidity('');submit.disabled=false;retry.hidden=true;status.textContent=config.endpoint?'ההערה תישלח לרשימת הטיפול של הצוות.':'טרם חובר יעד משותף. הדיווח יישמר במכשיר הזה בלבד, ואפשר יהיה להורידו כקובץ.';dialog.showModal();note.focus();};
    return button;
  }};
})();
