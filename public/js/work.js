// Showcase slider: About Us (installation photos) + products with prices + installation packages.
// Photos go in  public/images/work/  named  <category>-1, <category>-2, <category>-3  (.jpg / .jpeg / .png / .webp)
// Prices below are demo prices: change them here (o = options [label, price, old price]).
(()=>{
const DIR='/images/work/',EXT=['jpg','jpeg','png','webp'],GOLD='#ffc247';

// t = title  d = text  sp = 3 small spec boxes  c = [light bg, dark bg, accent]  f = photo file name
// product slides: ol = label above the option buttons, o = options [name, price, old price]
// about slides:   s  = big number [value, label]
const CATS={
about:{name:'ABOUT US',btn:'Book a free survey',slides:[
 {t:'OUR CREW<br><em>ON THE ROOF</em>',d:'Every SolarWave system is installed by our own licensed crews, never subcontractors. Here they are mounting rails and setting panels, with a crew leader on every job.',s:['4,200+','Systems installed'],sp:[['2016','In business'],['100%','In-house crews'],['1–2 days','Typical install']],c:['#e8803a','#2a1000','#ffffff'],f:'about-1'},
 {t:'WIRING &amp;<br><em>COMMISSIONING</em>',d:'Neat wiring, labeled runs and a careful turn-on. We test every string, set up monitoring and walk you through the app before we leave.',s:['38 MW','Clean capacity delivered'],sp:[['UL','Listed equipment'],['NEC','Code compliant'],['24/7','Monitoring']],c:['#4f86c6','#07122b',GOLD],f:'about-2'},
 {t:'ONE TEAM,<br><em>START TO FINISH</em>',d:'From the free survey to the day we switch on, one Texas team handles design, permits, installation and service. Local people, and one number to call.',s:['4.9 / 5','Average customer rating'],sp:[['Free','Home survey'],['5 yrs','Warranty'],['Austin','Local support']],c:['#3ddc84','#04210f',GOLD],f:'about-3'}]},

panels:{name:'SOLAR PANELS',btn:'Get a free quote',slides:[
 {t:'SW-400<br><em>MONO PERC</em>',d:'Our everyday workhorse. Sixty monocrystalline PERC cells, anti-reflective tempered glass and an anodized aluminum frame, flash-tested in Texas before it ships.',sp:[['400 W','Peak power'],['21.8%','Efficiency'],['60','Mono cells']],ol:'Choose your pack',o:[['1 panel','$199','$229'],['6-pack','$1,099','$1,194'],['12-pack','$2,090','$2,388']],c:['#4f86c6','#07122b',GOLD],f:'panels-1'},
 {t:'SW-450<br><em>ALL BLACK</em>',d:'A sleek black-frame, black-backsheet module with half-cut cells for lower heat losses and better output in partial shade. The look homeowners ask for most.',sp:[['450 W','Peak power'],['22.3%','Efficiency'],['108','Half-cut cells']],ol:'Choose your pack',o:[['1 panel','$239','$269'],['6-pack','$1,299','$1,434'],['12-pack','$2,490','$2,868']],c:['#6b5bd6','#0d0824',GOLD],f:'panels-2'},
 {t:'SW-550<br><em>BIFACIAL</em>',d:'A dual-glass bifacial module that also collects light reflected onto its back. Made for ground mounts, carports and commercial roofs where every watt counts.',sp:[['550 W','Peak power'],['21.3%','Efficiency'],['Dual glass','Bifacial']],ol:'Choose your pack',o:[['1 panel','$289','$329'],['6-pack','$1,590','$1,734'],['12-pack','$3,050','$3,468']],c:['#2fa7a0','#041d22',GOLD],f:'panels-3'}]},

wires:{name:'WIRES &amp; CABLES',btn:'Get a free quote',slides:[
 {t:'PV CABLE<br><em>10 AWG</em>',d:'UV-resistant tinned-copper solar wire with cross-linked insulation. Red and black for clear polarity, sold by the roll and sized to keep voltage drop low.',sp:[['10 AWG','Conductor'],['2,000 V','DC rating'],['-40 to 194°F','Temperature range']],ol:'Choose your roll',o:[['100 ft','$119','$139'],['250 ft','$279','$298'],['500 ft','$529','$595']],c:['#e0524f','#2a0505','#ffffff'],f:'wires-1'},
 {t:'MC4 STYLE<br><em>CONNECTORS</em>',d:'Locking, polarity-coded connectors sealed against rain and dust. Each kit has male and female pairs plus the spanner tool, ready for the roof.',sp:[['IP67','Sealed'],['30 A','Current rating'],['Locking','Click-in design']],ol:'Choose your kit',o:[['10 pairs','$39','$49'],['25 pairs','$89','$98'],['50 pairs','$169','$195']],c:['#7f93c9','#131a33','#ff5b5b'],f:'wires-2'},
 {t:'COMBINER &amp;<br><em>GROUNDING</em>',d:'A roof combiner box with breakers, surge protection and grounding hardware, plus rapid-shutdown parts. One labeled kit so the install passes inspection.',sp:[['NEC 690.12','Rapid shutdown'],['IP65','Outdoor box'],['4–8','String inputs']],ol:'Choose your box',o:[['4-string','$149','$179'],['6-string','$199','$239'],['8-string','$259','$299']],c:['#d99a2b','#241400','#ffffff'],f:'wires-3'}]},

inverters:{name:'INVERTERS',btn:'Get a free quote',slides:[
 {t:'SW-5K<br><em>GRID-TIED</em>',d:'A compact 5 kW string inverter for homes that want to cut the power bill. Quiet, fan-cooled and rapid-shutdown ready, with Wi-Fi monitoring built in.',sp:[['5 kW','AC output'],['97.2%','Peak efficiency'],['Wi-Fi','Live monitoring']],ol:'Choose your warranty',o:[['5 years','$1,190','$1,390'],['10 years','$1,390','$1,590']],c:['#e8b43b','#1f1500','#ffffff'],f:'inverters-1'},
 {t:'SW-7.6H<br><em>HYBRID</em>',d:'Our most popular inverter. It runs the house from solar, charges your battery and switches to backup in milliseconds when the grid goes down.',sp:[['7.6 kW','Hybrid output'],['97.5%','Peak efficiency'],['UL 1741','Grid-safety listed']],ol:'Choose your warranty',o:[['5 years','$2,490','$2,890'],['10 years','$2,790','$3,190']],c:['#4f86c6','#07122b','#5fe0ff'],f:'inverters-2'},
 {t:'SW-10H<br><em>WHOLE HOME</em>',d:'Ten kilowatts of hybrid power for large homes, workshops and small businesses. Takes up to four battery modules and gives whole-home backup.',sp:[['10 kW','Hybrid output'],['97.6%','Peak efficiency'],['4','Battery modules']],ol:'Choose your warranty',o:[['5 years','$3,290','$3,790'],['10 years','$3,690','$4,190']],c:['#6b5bd6','#0d0824',GOLD],f:'inverters-3'}]},

batteries:{name:'BATTERIES',btn:'Get a free quote',slides:[
 {t:'SW-B10<br><em>10 kWh</em>',d:'One lithium iron phosphate module: safe, non-toxic and long-lasting. Start here for lights, fridge and Wi-Fi backup, and add modules any time later.',sp:[['10 kWh','Capacity'],['6,000','Cycle life'],['90%','Usable depth']],ol:'Choose your mounting',o:[['Wall mount','$4,490','$4,990'],['Floor stand','$4,690','$5,190']],c:['#3ddc84','#04210f','#ffffff'],f:'batteries-1'},
 {t:'SW-B20<br><em>20 kWh</em>',d:'Two stacked modules with built-in battery management and thermal protection. Enough for a full evening plus essential loads through a long outage.',sp:[['20 kWh','Capacity'],['2','Modules'],['UL 9540','Storage listed']],ol:'Choose your mounting',o:[['Wall mount','$8,490','$8,980'],['Floor stand','$8,790','$9,380']],c:['#2a6d8f','#06141f','#c8ff6a'],f:'batteries-2'},
 {t:'SW-B40<br><em>40 kWh</em>',d:'Four modules for whole-home backup, including air conditioning, a well pump and EV charging. The biggest stack we build.',sp:[['40 kWh','Capacity'],['4','Modules'],['6,000','Cycle life']],ol:'Choose your mounting',o:[['Wall mount','$16,490','$17,960'],['Floor stand','$16,990','$18,760']],c:['#d99a2b','#241400','#c8ff6a'],f:'batteries-3'}]},

installation:{name:'INSTALLATION PACKAGES',btn:'Book this package',mk:true,slides:[
 {t:'STARTER<br><em>HOME</em>',d:'A 5.2 kW system: 13 SW-400 panels, a 5 kW grid-tied inverter, cables and connectors, mounting, permits and utility paperwork, installed by our own crew.',sp:[['5.2 kW','System size'],['13','Panels'],['1 day','On site']],ol:'Choose how to pay',o:[['Pay in full','$12,900','$14,900']],c:['#e8803a','#2a1000','#ffffff'],f:'installation-1'},
 {t:'FAMILY<br><em>+ BATTERY</em>',d:'An 8 kW system: 20 SW-400 panels, a 7.6 kW hybrid inverter and a 10 kWh battery. Includes mounting, permits, interconnection and backup for lights, fridge and Wi-Fi.',sp:[['8 kW','System size'],['10 kWh','Battery'],['1–2 days','On site']],ol:'Choose how to pay',o:[['Pay in full','$24,900','$28,900']],c:['#4f86c6','#07122b',GOLD],f:'installation-2'},
 {t:'PREMIUM<br><em>WHOLE HOME</em>',d:'A 12.6 kW system: 28 SW-450 black panels, a 10 kW hybrid inverter and 20 kWh of battery. Whole-home backup, monitoring setup and a crew leader on every job.',sp:[['12.6 kW','System size'],['20 kWh','Battery'],['2 days','On site']],ol:'Choose how to pay',o:[['Pay in full','$36,900','$42,900']],c:['#3ddc84','#04210f',GOLD],f:'installation-3'}]}
};
// pre-select this service in the booking form
const SERVICE={panels:'Solar panels only',batteries:'Battery backup',inverters:'Inverter upgrade',installation:'Full solar system',wires:'Wires & cables',about:'Full solar system'};

// ---------- build the overlay ----------
const el=document.createElement('div');el.id='work';
el.innerHTML=`<div class="wbg"></div><div class="wdots"></div>
<div class="wtop"><a class="logo" href="#">SOLAR<b>WAVE</b></a><div class="wrt"><a class="cta wcta" href="#" data-book>Book Now</a></div></div>
<div class="wl">
 <h2 class="wt wsw"></h2><p class="wd wsw"></p><div class="wsp wsw"></div><a class="btn wbk wsw" href="#" data-book></a></div>
<div class="wc"><div class="wstage"></div><div class="wshadow"></div></div>
<div class="wr2"><div class="wprice wsw"><small class="wpl"></small><b></b><s></s><small class="wsv"></small></div>
 <div class="wstat wsw"><b></b><span></span></div>
 <div class="wopt wsw"><small class="wol"></small><div class="wok"></div><p class="wnote"></p></div></div>
<button class="wx" aria-label="Back" title="Back"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H5M11 6l-6 6 6 6"/></svg></button>
<button class="wp" aria-label="Previous">‹</button><button class="wn" aria-label="Next">›</button>
<div class="wcount"><span class="wnum"></span><div class="wseg"><button data-n="0" aria-label="Photo 1"></button><button data-n="1" aria-label="Photo 2"></button><button data-n="2" aria-label="Photo 3"></button></div></div>`;
document.body.appendChild(el);
const $=s=>el.querySelector(s),stage=$('.wstage');
$('.wdots').innerHTML=Array.from({length:38},()=>`<i style="left:${Math.random()*100}%;top:${Math.random()*100}%;--s:${(Math.random()*4+2).toFixed(1)}px;--d:${(Math.random()*9+7).toFixed(1)}s;--dl:-${(Math.random()*12).toFixed(1)}s"></i>`).join('');

// ---------- galaxy background: twinkling stars, a spinning galaxy, nebula glow and shooting stars ----------
const cv=document.createElement('canvas');cv.className='wgx';el.insertBefore(cv,$('.wdots'));
const g=cv.getContext('2d'),RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
let W=0,H=0,D=1,raf=0,last=0,gmx=0,gmy=0,nextShoot=0,cA=[255,194,71],cB=[79,134,198],tA=cA.slice(),tB=cB.slice();
const rgb=h=>{const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255]};
const mixc=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
function gxSet(c){tB=rgb(c[0]).map(v=>Math.min(255,v*1.25+30));tA=rgb(c[2])}   // galaxy colours follow each slide
const STARS=Array.from({length:240},()=>({x:Math.random(),y:Math.random(),z:Math.random()*.9+.1,p:Math.random()*6.28,s:Math.random()*1.6+.6}));
const GAL=Array.from({length:2300},()=>{const r=Math.pow(Math.random(),1.6),arm=Math.floor(Math.random()*2)*Math.PI;
  return{r,a:arm+r*7+(Math.random()-.5)*(.5+.8*(1-r)),j:Math.random(),b:Math.random()*.7+.3,sz:Math.random()<.1?2.8:1.5}});
const SHOOT=[];
function gxSize(){D=Math.min(devicePixelRatio||1,1.5);W=cv.width=Math.round(innerWidth*D);H=cv.height=Math.round(innerHeight*D)}
function gxFrame(ts){
  if(!RM)raf=requestAnimationFrame(gxFrame);
  const dt=Math.min(.05,(ts-last)/1000||0);last=ts;const t=RM?0:ts/1000;
  for(let i=0;i<3;i++){cA[i]+=(tA[i]-cA[i])*.05;cB[i]+=(tB[i]-cB[i])*.05}
  g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,W,H);
  // soft nebula clouds drifting slowly
  g.globalCompositeOperation='lighter';
  [[.28,.3,.55,cB,.17],[.78,.72,.5,cA,.12],[.6,.18,.4,cB,.1]].forEach((n,i)=>{
    const x=(n[0]+Math.sin(t*.05+i*2)*.05)*W,y=(n[1]+Math.cos(t*.04+i)*.05)*H,r=n[2]*Math.max(W,H)*.6,c=n[3];
    const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${n[4]})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,H)});
  // twinkling stars (nearer ones move a little with the mouse)
  g.globalCompositeOperation='source-over';g.fillStyle='#fff';
  for(const s of STARS){const tw=.55+.45*Math.sin(t*(.8+s.s)+s.p),x=((s.x*W+gmx*40*s.z*D)%W+W)%W,y=((s.y*H+gmy*30*s.z*D)%H+H)%H;
    g.globalAlpha=tw*s.z;g.beginPath();g.arc(x,y,s.s*s.z*D*.8,0,6.283);g.fill()}
  g.globalAlpha=1;
  // spinning galaxy behind the photo
  const cx=W*.55,cy=H*.53,R=Math.min(W*.62,H*1.15),tilt=.42,rot=-.38,cr=Math.cos(rot),sr=Math.sin(rot);
  g.globalCompositeOperation='lighter';
  const core=g.createRadialGradient(cx,cy,0,cx,cy,R*.35);core.addColorStop(0,'rgba(255,240,215,.45)');core.addColorStop(.4,`rgba(${cA[0]|0},${cA[1]|0},${cA[2]|0},.13)`);core.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=core;g.fillRect(cx-R,cy-R,R*2,R*2);
  for(const p of GAL){const a=p.a+t*.16/(p.r+.35),x0=Math.cos(a)*p.r*R,y0=Math.sin(a)*p.r*R*tilt,x=cx+x0*cr-y0*sr,y=cy+x0*sr+y0*cr,
    c=mixc([255,240,215],mixc(cA,cB,p.j),Math.min(1,p.r*1.6));
    g.fillStyle=`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${(.85*p.b*(1-p.r*.45)).toFixed(3)})`;g.fillRect(x,y,p.sz*D,p.sz*D)}
  // shooting stars every few seconds
  g.globalCompositeOperation='source-over';
  if(!RM&&ts>nextShoot){nextShoot=ts+1200+Math.random()*2600;
    for(let i=Math.random()<.25?2:1;i>0;i--){const sp=(900+Math.random()*500)*D,an=.4+Math.random()*.3;
      SHOOT.push({x:(.35+Math.random()*.7)*W,y:Math.random()*H*.45,vx:-Math.cos(an)*sp,vy:Math.sin(an)*sp,l:(160+Math.random()*140)*D,life:0,max:.8+Math.random()*.5})}}
  for(let i=SHOOT.length-1;i>=0;i--){const s=SHOOT[i];s.life+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;
    if(s.life>s.max){SHOOT.splice(i,1);continue}
    const al=Math.sin(Math.PI*s.life/s.max),m=Math.hypot(s.vx,s.vy),tx=s.x-s.vx/m*s.l,ty=s.y-s.vy/m*s.l,gr=g.createLinearGradient(s.x,s.y,tx,ty);
    gr.addColorStop(0,`rgba(255,255,255,${al})`);gr.addColorStop(1,'rgba(255,255,255,0)');
    g.strokeStyle=gr;g.lineWidth=2*D;g.lineCap='round';g.beginPath();g.moveTo(s.x,s.y);g.lineTo(tx,ty);g.stroke();
    g.fillStyle=`rgba(255,255,255,${al})`;g.beginPath();g.arc(s.x,s.y,2.2*D,0,6.283);g.fill()}
}
function gxStart(){gxSize();cancelAnimationFrame(raf);last=performance.now();raf=requestAnimationFrame(gxFrame)}
addEventListener('resize',()=>{if(open)gxSize()});

let key='panels',cur=0,oi=0,open=false,busy=0;
const C=()=>CATS[key],sl=()=>C().slides,plain=h=>h.replace(/<br>/g,' ').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&');

function loadImg(img,base,ph){let i=0;const next=()=>{if(i>=EXT.length){ph.classList.add('missing');return}img.src=DIR+base+'.'+EXT[i++]};
  img.onerror=next;img.onload=()=>ph.classList.remove('missing');next()}
function build(){
  stage.innerHTML=sl().map(s=>`<div class="ph after"><div class="fl"><img alt=""><div class="ms">Add photo<br><b>${s.f}.jpg</b><br><small>folder: public/images/work</small></div></div></div>`).join('');
  [...stage.children].forEach((ph,i)=>{ph.querySelector('img').alt=plain(sl()[i].t);loadImg(ph.querySelector('img'),sl()[i].f,ph)})}
function place(){[...stage.children].forEach((ph,i)=>{const r=i-cur;ph.className='ph '+(r==0?'cur':r>0?'after':'before')+(ph.classList.contains('missing')?' missing':'')})}
function price(pop){const s=sl()[cur],o=s.o[oi],p=$('.wprice b'),old=$('.wprice s'),mk=C().mk,n=x=>+String(x).replace(/[^0-9]/g,'');
  p.textContent=o[1];old.textContent=o[2]||'';old.style.display=o[2]?'':'none';
  // installation packages: tell the customer the market price vs our price when they buy and install with us
  $('.wpl').textContent=mk?'Our price when you buy and install with us':'';
  $('.wsv').textContent=!mk?'':o[2]?`Usual market price for the same system. You save $${(n(o[2])-n(o[1])).toLocaleString('en-US')}.`:'Example monthly plan over 84 months.';
  $('.wnote').textContent=!mk?'':o[2]?`Most installers charge about ${o[2]} to supply and install a system like this. Buy it from SolarWave and let our crew install it, and the whole job is ${o[1]}.`:'Same package, paid monthly. Example plan only; final terms after approval.';
  $('.wok').querySelectorAll('button').forEach((b,i)=>b.classList.toggle('on',i==oi));
  if(pop){p.classList.remove('pop');void p.offsetWidth;p.classList.add('pop')}}
function fill(){const s=sl()[cur],prod=!!s.o;
  $('.wt').innerHTML=s.t;$('.wd').textContent=s.d;
  $('.wsp').innerHTML=s.sp.map(x=>`<div><b>${x[0]}</b><span>${x[1]}</span></div>`).join('');
  $('.wbk').textContent=C().btn+' →';
  el.classList.toggle('prod',prod);
  if(prod){oi=0;const many=s.o.length>1;$('.wol').textContent=many?s.ol:'';$('.wok').innerHTML=many?s.o.map((x,i)=>`<button data-o="${i}">${x[0]}</button>`).join(''):'';price()}
  else{$('.wstat b').textContent=s.s[0];$('.wstat span').textContent=s.s[1]}
  gxSet(s.c);el.style.setProperty('--b1',s.c[0]);el.style.setProperty('--b2',s.c[1]);el.style.setProperty('--acc',s.c[2]);
  $('.wnum').textContent=String(cur+1).padStart(2,'0')+' / 03';
  el.querySelectorAll('.wseg button').forEach((b,i)=>b.classList.toggle('on',i<=cur));
  $('.wp').disabled=cur==0;$('.wn').disabled=cur==sl().length-1}
function go(n){ // old text blurs out, new text blurs in, photo flies across, background colour fades
  if(busy||n<0||n>=sl().length||n==cur)return;busy=1;cur=n;
  el.classList.add('sw');place();
  setTimeout(()=>{fill();el.classList.remove('sw')},300);
  setTimeout(()=>busy=0,650)}

window.openWork=(k,x,y)=>{
  key=CATS[k]?k:'panels';cur=0;open=true;busy=0;
  el.style.setProperty('--ox',(x||innerWidth/2)+'px');el.style.setProperty('--oy',(y||innerHeight/2)+'px');
  build();fill();cA=tA.slice();cB=tB.slice();gxStart();el.classList.add('sw');
  document.body.style.overflow='hidden';
  el.classList.add('on');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{place()}));
  setTimeout(()=>el.classList.remove('sw'),650)};
function close(){if(!open)return;open=false;el.classList.remove('on');document.body.style.overflow='';setTimeout(()=>{if(!open)cancelAnimationFrame(raf)},1100)}

// the booking form (opened by main.js) gets the service + the product that was being viewed
function prefill(){
  const sv=document.querySelector('#bookForm [name=service]'),nt=document.querySelector('#bookForm [name=notes]'),s=sl()[cur];
  if(sv&&SERVICE[key])sv.value=SERVICE[key];
  if(nt)nt.value=s.o?`Interested in: ${plain(s.t)} (${s.o[oi][0]}, ${s.o[oi][1]})`:''}

// ---------- controls ----------
el.addEventListener('click',e=>{const t=e.target;
  if(t.closest('.wx'))close();
  else if(t.closest('.wp'))go(cur-1);
  else if(t.closest('.wn'))go(cur+1);
  else if(t.closest('[data-n]'))go(+t.closest('[data-n]').dataset.n);
  else if(t.closest('[data-o]')){oi=+t.closest('[data-o]').dataset.o;price(true)}
  else if(t.closest('.logo')){e.preventDefault();close()}
  else if(t.closest('[data-book]')){prefill()}   // main.js opens the booking form on top; this window stays open behind it
  else if(t.closest('.ph.after'))go(cur+1);
});
addEventListener('keydown',e=>{if(!open)return;if(e.key==='Escape'&&document.querySelector('.ov:not([hidden])')==null)close();else if(e.key==='ArrowRight')go(cur+1);else if(e.key==='ArrowLeft')go(cur-1)});
['click','keydown'].forEach(ev=>addEventListener(ev,()=>{if(open)setTimeout(()=>{if(open)document.body.style.overflow='hidden'},40)}));
let wl=0;el.addEventListener('wheel',e=>{e.preventDefault();const n=Date.now();if(n-wl<750||Math.abs(e.deltaY)<8)return;wl=n;go(cur+(e.deltaY>0?1:-1))},{passive:false});
let tx=0;el.addEventListener('touchstart',e=>{tx=e.touches[0].clientX},{passive:true});
el.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>50)go(cur+(d<0?1:-1))},{passive:true});
el.addEventListener('mousemove',e=>{gmx=e.clientX/innerWidth-.5;gmy=e.clientY/innerHeight-.5;stage.style.setProperty('--mx',(e.clientX/innerWidth-.5).toFixed(3));stage.style.setProperty('--my',(e.clientY/innerHeight-.5).toFixed(3))});
})();
