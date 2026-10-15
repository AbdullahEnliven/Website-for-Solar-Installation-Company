// Book via Message (AI chat) and Book via Call (AI voice). The form option is the existing modal.
(()=>{
const q=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
const post=(u,b)=>fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(async r=>({ok:r.ok,j:await r.json().catch(()=>({}))}));
const SERV=['Full solar system','Solar panels only','Battery backup','Inverter upgrade','Wires & cables','Maintenance / repair'];
let hist=[],busy=false,vapi=null,timer=null,tt=null;

function toast(msg){const t=q('#toast');t.innerHTML=esc(msg)+'<br><a data-open="form">Use the booking form →</a>';t.hidden=false;clearTimeout(tt);tt=setTimeout(()=>t.hidden=true,9000)}
document.addEventListener('click',e=>{const o=e.target.closest('[data-open]');if(!o)return;e.preventDefault();
  q('#choose').hidden=true;q('#toast').hidden=true;const w=o.dataset.open;
  if(w==='form')q('#modal').hidden=false;else{document.body.style.overflow='';w==='chat'?openChat():startCall()}});

// ---------- chat ----------
// Scroll only the chat box (scrollIntoView would also scroll the whole page).
function down(){const m=q('#cmsgs');if(m)requestAnimationFrame(()=>m.scrollTo({top:m.scrollHeight,behavior:'smooth'}))}
function add(role,text){const d=document.createElement('div');d.className='m '+role;d.innerHTML=md(text);q('#cmsgs').appendChild(d);down();return d}
let svc='';
const SVCKEY=[[/full|system/,'Full solar system'],[/panel/,'Solar panels only'],[/batter/,'Battery backup'],[/inverter/,'Inverter upgrade'],[/wire|cable/,'Wires & cables'],[/maint|repair/,'Maintenance / repair']];
function chips(){q('#cmsgs').querySelectorAll('.chips').forEach(x=>x.remove());if(svc)return;const d=document.createElement('div');d.className='chips';d.innerHTML=SERV.map(s=>`<button type="button" data-svc="${esc(s)}">${esc(s)}</button>`).join('');q('#cmsgs').appendChild(d);down()}
function openChat(){q('#chat').hidden=false;if(!q('#cmsgs').children.length){add('bot',"Hi! I'm the SolarWave assistant. What are you looking for today? Tap one below, or just type.");chips()}q('#cin').focus()}
q('#chatx').onclick=()=>q('#chat').hidden=true;
q('#cmsgs').addEventListener('click',e=>{const b=e.target.closest('[data-svc]');if(!b||busy)return;svc=b.dataset.svc;send("I'm interested in: "+svc)});
q('#cform').onsubmit=e=>{e.preventDefault();const i=q('#cin'),t=i.value.trim();if(!t||busy)return;i.value='';send(t)};
async function send(t){q('#cmsgs').querySelectorAll('.chips').forEach(x=>x.remove());if(!svc){const l=t.toLowerCase();for(const[re,n]of SVCKEY)if(re.test(l)){svc=n;break}}add('me',t);hist.push({role:'user',content:t});busy=true;const w=add('bot','…');
  try{const{j}=await post('/api/chat',{messages:hist}),r=j.reply||'Sorry, something went wrong. Please use the booking form.';w.innerHTML=md(r);down();hist.push({role:'assistant',content:r});if(j.done)finishChat();else chips()}
  catch{w.textContent='Sorry, I could not connect. Please use the booking form.';down()}
  busy=false}

function finishChat(){const i=q('#cin');i.value='';i.disabled=true;i.placeholder='Booking complete';if(q('#cnew'))return;const b=document.createElement('button');b.type='button';b.id='cnew';b.className='newchat';b.innerHTML='<span>↻</span> Start a new chat';b.onclick=()=>{hist.length=0;svc='';q('#cmsgs').innerHTML='';i.disabled=false;i.placeholder='';b.remove();openChat()};q('#cmsgs').appendChild(b);down()}

// ---------- voice call ----------
const loadVapi=()=>window.Vapi?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement('script');s.src='/js/vendor/vapi.bundle.js?v=2';s.onload=ok;s.onerror=no;document.head.appendChild(s)});
const callUI=(on,txt)=>{q('#callbox').hidden=!on;if(txt)q('#cst').textContent=txt};
async function showResult(sid){
  if(!sid)return;let r=null;
  for(let i=0;i<4&&!r;i++){try{const j=await(await fetch('/api/voice/result?sid='+sid,{cache:'no-store'})).json();if(j.found)r=j}catch{}if(!r)await new Promise(ok=>setTimeout(ok,700))}
  if(!r)return;
  const o=document.createElement('div');o.className='ov';o.style.zIndex=70;
  const msg=r.pickup?'Please bring this reference to our shop at '+esc(r.shopAddress)+', open '+esc(r.shopHours)+'.':'Our team will contact you soon to finalize the date, day and time.';
  o.innerHTML='<div class="mbox" style="width:min(520px,100%)"><button class="x" aria-label="Close">✕</button><div class="ok"><h3>Booking confirmed ✓</h3><p>Reference <b>'+esc(r.ref)+'</b>. '+msg+'</p></div></div>';
  const close=()=>{o.remove();document.body.style.overflow=''};
  o.querySelector('.x').onclick=close;o.addEventListener('click',e=>{if(e.target===o)close()});
  document.body.appendChild(o);document.body.style.overflow='hidden'}
function tick(on){clearInterval(timer);if(on){let s=0;timer=setInterval(()=>{s++;q('#cst').textContent='In call · '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0')},1000)}}
async function startCall(){
  callUI(true,'Connecting…');q('#cmute').textContent='Mute';const excl=[];
  // Ask for the microphone first, so the browser permission prompt cannot interrupt the call (it used to cut the first attempt).
  try{const st=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});st.getTracks().forEach(t=>t.stop())}
  catch{callUI(false);return toast('Please allow microphone access, then tap the call button again.')}
  try{await loadVapi()}catch{callUI(false);return toast('Could not load the voice assistant. Please use the chat or the form.')}
  for(let a=0;a<3;a++){let key=null;
    try{
      const d=await(await fetch('/api/voice/route-select'+(excl.length?'?exclude='+excl.join(','):''))).json();
      if(!d.available){callUI(false);return toast(d.message)}
      key=d.accountKey;const sid=d.sid;vapi=new window.Vapi(d.publicKey);const t0=Date.now();let sent=false;
      const report=()=>{if(sent)return;sent=true;fetch('/api/voice/end-of-call',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({accountKey:key,minutes:Math.ceil((Date.now()-t0)/6e4)}),keepalive:true}).catch(()=>{})};
      vapi.on('call-end',()=>{report();tick(false);callUI(false);vapi=null;showResult(sid)});
      await vapi.start(d.assistant);
      vapi.on('error',()=>{report();tick(false);callUI(false);vapi=null;showResult(sid);if(Date.now()-t0<8000)toast('The call ended unexpectedly. Please use the chat or the booking form.')});
      tick(true);return;
    }catch(err){console.error('[voice]',key,err);if(key){excl.push(key);fetch('/api/voice/start-failed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({accountKey:key}),keepalive:true}).catch(()=>{})}}}
  callUI(false);toast('Our AI voice assistant is not available right now. Please use the chat or the booking form.')}
q('#cend').onclick=()=>vapi&&vapi.stop();
q('#cmute').onclick=()=>{if(!vapi)return;const m=!vapi.isMuted();vapi.setMuted(m);q('#cmute').textContent=m?'Unmute':'Mute'};
})();
