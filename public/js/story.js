// GSAP scroll animation (purani Three.js dots animation hata di gayi). Content: js/content.js ka STORY
const $=s=>document.querySelector(s),hdr=$('header'),IN={offsetHeight:0},SP={offsetHeight:0},K=1;let p=0; // main.js ke liye
(()=>{
const ST=window.STORY,SH=['sun','panel','wires','inverter','battery','install','shield','sun'];
const WL={about:'Meet our crew',panels:'Explore Solar Panels',wires:'Explore Wires &amp; Cables',inverters:'Explore Inverters',batteries:'Explore Batteries',installation:'See our installation packages'};
const SV={
sun:'<circle cx="100" cy="100" r="38"/><path d="M100 20v25M100 155v25M20 100h25M155 100h25M43 43l18 18M139 139l18 18M157 43l-18 18M61 139l-18 18"/>',
panel:'<path d="M40 60h120l15 90H25z"/><path d="M60 60l-8 90M100 60v90M140 60l8 90M33 90h134M29 120h142"/>',
wires:'<path d="M50 70a50 14 0 0 1 100 0a50 14 0 0 1-100 0M50 95a50 14 0 0 0 100 0M50 120a50 14 0 0 0 100 0M50 145a50 14 0 0 0 100 0M50 70v75M150 70v75"/>',
inverter:'<path d="M45 40h110v120H45z"/><path d="M65 60h70v35H65z"/><path d="M70 120h10M100 120h10M130 120h10M70 140h60"/>',
battery:'<path d="M50 55h100v100H50z"/><path d="M85 40h30v15H85z"/><path d="M65 135h70M65 115h70M65 95h70M65 75h70"/>',
install:'<path d="M30 110l70-65 70 65"/><path d="M45 100v60h110v-60"/><path d="M85 160v-35h30v35"/><path d="M62 88l38-30 38 30"/>',
shield:'<path d="M100 30l65 25v50c0 35-30 60-65 70-35-10-65-35-65-70V55z"/><path d="M70 105l22 22 40-45"/>'};
const svg=k=>`<svg viewBox="0 0 200 200" aria-hidden="true">${SV[k].replace(/<(path|circle)/g,'<$1 pathLength="1"')}</svg>`;
const sec=(s,i)=>{const D=s.d,P=s.pal,top=i===0;
 const btn=s.work?`<button class="btn wbtn rv" data-work="${s.work}">${WL[s.work]} →</button>`:`<button class="btn rv" data-book>${s.btn||'Book Now'}</button>`;
 return `<section class="st" style="--c1:${P[0]};--c2:${P[1]};--c3:${P[2]}"><div class="lc"><div class="vis">${svg(SH[i])}</div><div class="specs">${(D.specs||[]).map((x,j)=>`<div class="spec"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div></div><div class="cp">`+
 (top?`<h2 class="hd s rv">${D.title}</h2>`:`<h2 class="hd rv"><span class="a ${s.h[1]}">${s.h[0]}</span><br><span class="b">${s.h[2]}</span></h2>`)+`<span class="tag rv">${D.tag}</span>`+
 `<p class="lead rv">${top?D.intro:s.h[3]}</p>`+
 `<ul class="pts rv">${(D.pts||[]).map(x=>`<li>${x}</li>`).join('')}</ul>${btn}</div></section>`};
const m=document.createElement('main');m.id='sw';
m.innerHTML=ST.map(sec).join('');
$('footer').before(m);
$('#book').appendChild($('#bookTpl').content.cloneNode(true));
gsap.registerPlugin(ScrollTrigger);
const V='?v=4';
gsap.utils.toArray('.st').forEach(s=>{
 const trg={trigger:s,start:'top 65%',toggleActions:'play none none reverse'},hl=s.querySelector('.hl');
 gsap.from(s.querySelectorAll('.rv'),{y:70,opacity:0,stagger:.1,duration:.9,ease:'power3.out',scrollTrigger:trg});
 if(hl)gsap.fromTo(hl,{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:.9,delay:.3,ease:'power2.out',scrollTrigger:trg});
 gsap.fromTo(s.querySelectorAll('.vis [pathLength]'),{strokeDashoffset:1},{strokeDashoffset:0,ease:'none',stagger:.08,scrollTrigger:{trigger:s,start:'top 80%',end:'top 15%',scrub:.6}});
 gsap.from(s.querySelectorAll('.spec'),{y:26,opacity:0,stagger:.09,duration:.6,ease:'power2.out',clearProps:'transform,opacity',scrollTrigger:{trigger:s.querySelector('.specs'),start:'top 94%',toggleActions:'play none none none'}});
 gsap.fromTo(s.querySelector('.vis svg'),{scale:.7,rotate:-12},{scale:1,rotate:0,ease:'none',scrollTrigger:{trigger:s,start:'top bottom',end:'center center',scrub:true}});
});
// har section ki apni picture: public/images/sections/<naam>.(png|webp|jpg|jpeg). Mil jaye to icon ki jagah wahi dikhti hai, na mile to purana icon rehta hai
const SN=['about','panels','wires','inverters','batteries','installation','warranty','book'],SX=['webp','png','jpg','jpeg'];
// picture ke aas-paas ka khali (transparent) hissa kaat deta hai, taake picture apne box ko poora bhare
const trim=im=>{const w=im.naturalWidth,h=im.naturalHeight,k=Math.min(1,500/Math.max(w,h)),cw=Math.max(1,Math.round(w*k)),ch=Math.max(1,Math.round(h*k)),c=document.createElement('canvas');c.width=cw;c.height=ch;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0,cw,ch);const d=x.getImageData(0,0,cw,ch).data;let t=ch,b=-1,l=cw,r=-1;
 for(let y=0;y<ch;y++)for(let q=0;q<cw;q++)if(d[(y*cw+q)*4+3]>14){if(y<t)t=y;if(y>b)b=y;if(q<l)l=q;if(q>r)r=q}
 if(b<0||(t<=2&&l<=2&&b>=ch-3&&r>=cw-3))return null;
 const m=.015,sx=Math.max(0,Math.floor((l/cw-m)*w)),sy=Math.max(0,Math.floor((t/ch-m)*h)),sw=Math.min(w,Math.ceil(((r+1)/cw+m)*w))-sx,sh=Math.min(h,Math.ceil(((b+1)/ch+m)*h))-sy,f=Math.min(1,1600/Math.max(sw,sh)),o=document.createElement('canvas');o.width=Math.round(sw*f);o.height=Math.round(sh*f);o.getContext('2d').drawImage(im,sx,sy,sw,sh,0,0,o.width,o.height);return o};
let rft;const rf=()=>{clearTimeout(rft);rft=setTimeout(()=>ScrollTrigger.refresh(),150)};
// har section ki picture: public/images/sections/<naam>.(png|webp|jpg|jpeg). Intro khatam hone ke BAAD load hoti hain (taake intro smooth rahe). Na mile to purana icon rehta hai
const loadSec=(sc,i)=>new Promise(res=>{const v=sc.querySelector('.vis'),im=new Image();let k=0;im.alt='';im.decoding='async';
 im.onload=()=>{(im.decode?im.decode():Promise.resolve()).catch(()=>{}).then(()=>{let el=im;try{el=trim(im)||im}catch(e){}el.className='pimg';v.appendChild(el);v.classList.add('has-img');gsap.fromTo(el,{scale:.72,opacity:0,y:80,rotate:-5},{scale:1,opacity:1,y:0,rotate:0,ease:'none',scrollTrigger:{trigger:v,start:'top 92%',end:'top 42%',scrub:.5}});gsap.fromTo(v,{clipPath:'inset(12% 9% 12% 9% round 34px)'},{clipPath:'inset(0% 0% 0% 0% round '+(parseFloat(getComputedStyle(v).borderTopLeftRadius)||34)+'px)',ease:'none',scrollTrigger:{trigger:v,start:'top 96%',end:'top 55%',scrub:.5}});rf();res()})};
 im.onerror=()=>{if(++k<SX.length)im.src='/images/sections/'+SN[i]+'.'+SX[k]+V;else res()};
 im.src='/images/sections/'+SN[i]+'.'+SX[0]+V});
// pehle section (About) ki picture intro shuru hone se PEHLE tayyar hoti hai, baqi intro khatam hote hi (bina delay)
const secs=[...document.querySelectorAll('.st')],firstSec=loadSec(secs[0],0),loadRest=()=>secs.forEach((sc,i)=>{if(i)loadSec(sc,i)});
addEventListener('scroll',()=>hdr.classList.toggle('sc',scrollY>40),{passive:true});
// ---- extra animations ----
// 1) cursor picture ke upar aaye to card 3D tilt ke saath uthta (float) hai aur chamak cursor ke saath chalti hai (sirf mouse wali devices par)
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
 let cur=null,raf=0,ev=null;const KEYS=['--rx','--ry','--mx','--my'];
 const off=v=>{v.classList.remove('hov');KEYS.forEach(k=>v.style.removeProperty(k))};
 const apply=()=>{raf=0;if(!cur||!ev)return;const r=cur.getBoundingClientRect(),px=(ev.clientX-r.left)/r.width,py=(ev.clientY-r.top)/r.height;
  cur.style.setProperty('--ry',((px-.5)*14).toFixed(2)+'deg');cur.style.setProperty('--rx',((.5-py)*12).toFixed(2)+'deg');cur.style.setProperty('--mx',(px*100).toFixed(1)+'%');cur.style.setProperty('--my',(py*100).toFixed(1)+'%')};
 document.addEventListener('pointermove',e=>{const v=e.target.closest?e.target.closest('.vis.has-img'):null;if(v!==cur){if(cur)off(cur);cur=v;if(v)v.classList.add('hov')}ev=e;if(cur&&!raf)raf=requestAnimationFrame(apply)},{passive:true});
 document.documentElement.addEventListener('mouseleave',()=>{if(cur){off(cur);cur=null}});
}
// 2) scroll karte waqt picture card ke andar halka parallax (--py), aur upar scroll-progress line
const pb=document.createElement('div');pb.id='sprog';document.body.appendChild(pb);
let tk=0;const onScroll=()=>{tk=0;const h=innerHeight;
 pb.style.setProperty('--sp',Math.min(1,scrollY/Math.max(1,document.documentElement.scrollHeight-h)).toFixed(4));
 document.querySelectorAll('.vis.has-img').forEach(v=>{const r=v.getBoundingClientRect();if(r.bottom<-50||r.top>h+50)return;v.style.setProperty('--py',(-((r.top+r.height/2)/h-.5)*46).toFixed(1)+'px')})};
addEventListener('scroll',()=>{if(!tk)tk=requestAnimationFrame(onScroll)},{passive:true});onScroll();
history.scrollRestoration='manual';scrollTo(0,0);
// HERO: purana vapor (SOLARWAVE particles) intro. Wo js/vapor.js se page ke upar overlay ki tarah chalta hai aur khud hat jata hai.
// About ki picture us dauran tayyar ho jati hai, baqi pictures intro khatam hone ke baad load hoti hain (taake intro smooth rahe)
firstSec.then(()=>ScrollTrigger.refresh());setTimeout(loadRest,2800);
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(!g)return;e.preventDefault();e.stopImmediatePropagation();hdr.classList.remove('open');
 const s=document.querySelectorAll('.st')[+g.dataset.go];if(s)scrollTo({top:s.getBoundingClientRect().top+scrollY-(innerWidth<=900?hdr.offsetHeight:0),behavior:'smooth'})},true);
// background stars (twinkle + scroll par upar ki taraf)
const cv=document.createElement('canvas');cv.id='stars';document.body.prepend(cv);const cx=cv.getContext('2d');let W=0,Hh=0,S=[];
const rs=()=>{const d=Math.min(devicePixelRatio||1,2);W=innerWidth;Hh=innerHeight;cv.width=W*d;cv.height=Hh*d;cx.setTransform(d,0,0,d,0,0);
 S=Array.from({length:Math.round(W*Hh/2800)},()=>{const z=Math.random()*.9+.3;return{x:Math.random()*W,y:Math.random()*Hh,r:(.3+Math.random()*.9)*(.6+z*.6),z,t:Math.random()*6.28,v:Math.random()*1.5+.4}})};
addEventListener('resize',()=>{if(innerWidth!==W||Math.abs(innerHeight-Hh)>150)rs()});rs();
// scroll down karne par stars saaf upar ki taraf jate hain (door wale dheere, qareeb wale tez), aur halka smooth follow karte hain
let sy=scrollY;
(function f(t){requestAnimationFrame(f);cx.clearRect(0,0,W,Hh);t*=.001;sy+=(scrollY-sy)*.14;
 for(const s of S){const y=((s.y-sy*s.z)%Hh+Hh)%Hh;cx.globalAlpha=.3+.7*(.5+.5*Math.sin(t*s.v+s.t));cx.fillStyle=s.r>1.1?'#ffe9b0':'#fff';cx.beginPath();cx.arc(s.x,y,s.r,0,6.283);cx.fill()}})(0);
})();
