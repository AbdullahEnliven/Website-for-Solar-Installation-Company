const $=s=>document.querySelector(s),ST=['pending','confirmed','completed','cancelled'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let rows=[],TODAY='';
async function api(u,m='GET',b){
  const r=await fetch(u,{method:m,headers:{'Content-Type':'application/json'},body:b&&JSON.stringify(b)});
  if(r.status===401&&u!=='/api/admin/login'){$('#login').hidden=false;$('#app').hidden=true;throw Error('Login required')}
  const j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.error||'Error');return j}
async function load(){
  const [b,t]=await Promise.all([api('/api/admin/bookings'),api('/api/admin/today')]);rows=b;TODAY=t.today||'';
  $('#login').hidden=true;$('#app').hidden=false;draw()}
const how=r=>r.fulfillment==='Pickup'?'Pickup':r.fulfillment==='Delivery & install'?'Delivery &amp; install':'Full system install';
const DI='background:#0b1020;color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:8px;padding:5px 7px;font:inherit;font-size:.8rem;color-scheme:dark;margin-top:4px;width:100%;max-width:150px';
const dateCell=r=>{const d=String(r.visit_date||'').slice(0,10);return `<small>Requested ${esc(String(r.created_at||'').slice(0,10))}</small><br><small style="color:${d?'#7be3a1':'#ffc247'}">${d?'Final date set':'Date: to be agreed'}</small><br><input type="date" data-vd="${r.id}" value="${esc(d)}"${TODAY?` min="${TODAY}"`:''} style="${DI}" title="Final date, set after contacting the customer"><br><input type="time" data-vt="${r.id}" value="${esc(r.time_slot||'')}" style="${DI}" title="Final time">`};
const row=r=>`<tr><td>${dateCell(r)}</td><td>${esc(r.name)}<br>${esc(r.phone)}${r.email?'<br>'+esc(r.email):''}</td><td>${esc(r.service)}<br><small>${how(r)}</small><br>${esc([r.address,r.city,[r.state,r.zip].filter(Boolean).join(' ')].filter(Boolean).join(', '))}${r.notes?`<br><i>${esc(r.notes)}</i>`:''}</td><td>${esc(r.ref)}<br><small>${esc(r.source||'FORM')}</small></td><td><select data-id="${r.id}">${ST.map(s=>`<option${s===r.status?' selected':''}>${s}</option>`).join('')}</select></td><td><button data-del="${r.id}">✕</button></td></tr>`;
function draw(){
  const f=$('#fs').value,v=$('#fv').value,q=$('#q').value.toLowerCase();
  $('#stats').innerHTML=[['total',rows.length],...ST.map(k=>[k,rows.filter(r=>r.status===k).length])].map(([a,n])=>`<div class="stat"><b>${n}</b><span>${a}</span></div>`).join('');
  const list=rows.filter(r=>(!f||r.status===f)&&(!v||r.service===v)&&(!q||[r.name,r.phone,r.email,r.ref].join(' ').toLowerCase().includes(q)));
  const pk=list.filter(r=>r.fulfillment==='Pickup'),hm=list.filter(r=>r.fulfillment!=='Pickup');
  $('#tbp').innerHTML=pk.map(row).join('')||'<tr><td colspan="6">No pickup orders</td></tr>';
  $('#tbh').innerHTML=hm.map(row).join('')||'<tr><td colspan="6">No team visits</td></tr>';
  $('#cp1').textContent='('+pk.length+')';$('#cp2').textContent='('+hm.length+')'}
$('#lf').onsubmit=async e=>{e.preventDefault();try{await api('/api/admin/login','POST',{password:$('#pw').value});await load()}catch(x){$('#le').textContent=x.message}};
$('#fs').onchange=$('#fv').onchange=$('#q').oninput=draw;
const onChg=async e=>{const t=e.target,d=t.dataset;try{
  if(d.vd&&t.value&&TODAY&&t.value<TODAY){alert('Past dates are not allowed. Choose today or a later date.');load().catch(()=>{});return}
  if(d.id){await api('/api/admin/bookings/'+d.id,'PATCH',{status:t.value})}
  else if(d.vd){await api('/api/admin/bookings/'+d.vd,'PATCH',{visit_date:t.value||null})}
  else if(d.vt){await api('/api/admin/bookings/'+d.vt,'PATCH',{time_slot:t.value||''})}
  else return;load()}catch(x){alert(x.message);load().catch(()=>{})}};
const onClk=async e=>{const id=e.target.dataset.del;if(id&&confirm('Delete this booking?')){await api('/api/admin/bookings/'+id,'DELETE');load()}};
['#tbp','#tbh'].forEach(s=>{$(s).onchange=onChg;$(s).onclick=onClk});
$('#out').onclick=async()=>{await api('/api/admin/logout','POST');location.reload()};
$('#csv').onclick=()=>{const h=['ref','source','created_at','visit_date','time_slot','name','phone','email','service','fulfillment','address','city','status','notes'];
  const q=v=>{let s=String(v??'');if(/^[=+\-@]/.test(s))s="'"+s;return'"'+s.replace(/"/g,'""')+'"'};
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([[h.join(','),...rows.map(r=>h.map(k=>q(r[k])).join(','))].join('\n')],{type:'text/csv'}));a.download='bookings.csv';a.click()};
// Every time the admin page is opened (or refreshed) the old login is thrown away, so the password is always asked.
api('/api/admin/logout','POST').catch(()=>{}).finally(()=>{$('#app').hidden=true;$('#login').hidden=false;$('#pw').focus()});
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload()});
