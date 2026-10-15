(()=>{
const S=window.SITE;
document.querySelectorAll('[data-site]').forEach(e=>{const k=e.dataset.site;
  if(k==='phoneLink'){e.href='tel:'+S.phoneHref;e.textContent=S.phone}else if(k==='emailLink'){e.href='mailto:'+S.email;e.textContent=S.email}else e.textContent=S[k]});
$('#yr').textContent=new Date().getFullYear();
const ovs=[...document.querySelectorAll('.ov')],show=e=>{e.hidden=false;document.body.style.overflow='hidden'},closeAll=()=>{ovs.forEach(o=>o.hidden=true);$('#lb').hidden=true;document.body.style.overflow=''};
async function openGal(cat,title){
  $('#gt').textContent=title;const g=$('#gg');g.innerHTML='<p class="em">Loading…</p>';show($('#gal'));
  try{const l=await(await fetch('/api/photos?category='+cat)).json();
    g.innerHTML=l.length?l.map(x=>`<figure><img loading="lazy" src="/api/photos/${x.id}/img" alt=""><figcaption></figcaption></figure>`).join(''):'<p class="em">Photos from our latest jobs are coming soon.</p>';
    g.querySelectorAll('figcaption').forEach((c,i)=>c.textContent=l[i].caption||'')}
  catch{g.innerHTML='<p class="em">Could not load photos.</p>'}}
document.addEventListener('click',e=>{const t=e.target,b=t.closest('[data-book]'),g=t.closest('[data-go]'),w=t.closest('[data-work]');
  if(b){e.preventDefault();hdr.classList.remove('open');show($('#choose'))}
  else if(w){e.preventDefault();hdr.classList.remove('open');openWork(w.dataset.work,e.clientX,e.clientY)}
  else if(g){e.preventDefault();hdr.classList.remove('open');const i=+g.dataset.go;scrollTo(0,IN.offsetHeight+i/(K-1)*(SP.offsetHeight-innerHeight));p=i}
  else if(t.closest('#gg img')){const l=$('#lb');l.firstElementChild.src=t.src;l.hidden=false}
  else if(t.closest('#lb'))$('#lb').hidden=true;
  else if(t.classList.contains('ov')||t.classList.contains('x'))closeAll()});
addEventListener('keydown',e=>{if(e.key==='Escape')$('#lb').hidden?closeAll():($('#lb').hidden=true)});
$('#burger').onclick=()=>hdr.classList.toggle('open');

(async()=>{
  const f=$('#bookForm');if(!f)return;
  const sv=f.querySelector('[name=service]'),fw=f.querySelector('.fulfil');
  const sync=()=>{const full=sv.value==='Full solar system';fw.hidden=full;if(full)fw.querySelectorAll('input').forEach(i=>i.checked=false)};
  sv.onchange=sync;sync();document.addEventListener('click',()=>setTimeout(sync,60));
  f.onsubmit=async e=>{
    e.preventDefault();const msg=$('#bmsg'),btn=f.querySelector('[type=submit]'),bad=t=>{msg.textContent=t;msg.className='err'};
    sync();if(!fw.hidden&&!new FormData(f).get('fulfillment'))return bad('Please choose pickup or delivery & install.');
    const body=Object.fromEntries(new FormData(f));btn.disabled=true;
    try{
      const r=await fetch('/api/bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),j=await r.json();
      if(!r.ok)throw Error(j.error||'Something went wrong')
      f.innerHTML='<div class="ok"><h3></h3><p></p></div>';
      f.querySelector('h3').textContent="You're booked, "+body.name.split(' ')[0]+'!';
      f.querySelector('p').textContent=`Reference ${j.ref}. Our team will contact you soon to finalize the date, day and time.`;
    }catch(err){bad(err.message);btn.disabled=false}
  };
})();
})();
