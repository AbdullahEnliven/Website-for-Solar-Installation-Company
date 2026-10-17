// Vapour text hero (vanilla JS port of the 21st.dev "vapour-text-effect" component)
// Crisp vector text while it is still; particles only while it vaporizes.
(()=>{
const sec=document.getElementById('intro'),cv=document.getElementById('vapor'),ctx=cv.getContext('2d'),oc=document.createElement('canvas'),octx=oc.getContext('2d');
const TEXT=['SOLAR','WAVE'],COL=['rgb(255,255,255)','rgb(255,194,71)'];
const CFG={vapor:.8,fade:.5,wait:.25,first:.3,spread:5,density:5,font:'Montserrat,Inter,Arial,sans-serif'}; // first = seconds before the first vaporize
history.scrollRestoration='manual';scrollTo(0,0);document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden'; // page stays still while the intro plays; a refresh plays it again
let finished=false;
function finish(){if(finished)return;finished=true;cancelAnimationFrame(raf);raf=0;document.documentElement.style.overflow='';document.body.style.overflow='';scrollTo(0,0);sec.classList.add('done');setTimeout(()=>sec.remove(),600)}
setTimeout(finish,2600); // safety: never keep the visitor stuck on the intro
let W,H,Dm,P=[],step=1,fs=100,B,w1=0,img,buf,state='waiting',prog=0,fade=0,hold=0,holdMax=CFG.first,last=0,raf=0,lw=0,lh=0;
const font=()=>`800 ${fs}px ${CFG.font}`;
const setup=c=>{c.font=font();c.textBaseline='middle';c.textAlign='left';if('letterSpacing' in c)c.letterSpacing=(fs*.05)+'px'};
const spreadFor=s=>{const a=[[20,.2],[50,.5],[100,1.5]];if(s<=20)return .2;if(s>=100)return 1.5;let i=0;while(a[i+1][0]<s)i++;return a[i][1]+(s-a[i][0])*(a[i+1][1]-a[i][1])/(a[i+1][0]-a[i][0])};
function text(alpha,clipX){
  ctx.save();ctx.setTransform(Dm,0,0,Dm,0,0);
  if(clipX!=null){ctx.beginPath();ctx.rect(clipX,0,W-clipX,H);ctx.clip()}
  ctx.globalAlpha=alpha;setup(ctx);
  ctx.fillStyle=COL[0];ctx.fillText(TEXT[0],B.l,H/2);ctx.fillStyle=COL[1];ctx.fillText(TEXT[1],B.l+w1,H/2);ctx.restore()}
function reset(){for(const p of P){p.x=p.ox;p.y=p.oy;p.o=p.a0;p.sp=0;p.vx=0;p.vy=0}}
function sample(){
  lw=innerWidth;lh=innerHeight;Dm=Math.min(devicePixelRatio||1,2);W=lw;H=sec.clientHeight;
  cv.width=Math.floor(W*Dm);cv.height=Math.floor(H*Dm);oc.width=W;oc.height=H;
  fs=Math.min(190,W/8.6);setup(octx);
  w1=octx.measureText(TEXT[0]).width;const w2=octx.measureText(TEXT[1]).width;B={l:(W-w1-w2)/2,w:w1+w2};
  octx.fillStyle=COL[0];octx.fillText(TEXT[0],B.l,H/2);octx.fillStyle=COL[1];octx.fillText(TEXT[1],B.l+w1,H/2);
  const d=octx.getImageData(0,0,W,H).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)n++;
  step=Math.max(1,Math.ceil(Math.sqrt(n/42000)));P=[];
  for(let y=0;y<H;y+=step)for(let x=0;x<W;x+=step){const i=(y*W+x)*4,a=d[i+3];if(a>0)P.push({ox:x,oy:y,x,y,r:d[i],g:d[i+1],b:d[i+2],a0:a/255,o:a/255,sp:0,vx:0,vy:0,q:false,ang:0})}
  octx.clearRect(0,0,W,H);img=octx.createImageData(W,H);buf=new Uint32Array(img.data.buffer);
  state='waiting';hold=0;holdMax=CFG.first;reset();ctx.clearRect(0,0,cv.width,cv.height);text(1)}
function upd(vx,dt){
  let all=true;const MS=spreadFor(fs)*CFG.spread,dens=.3+CFG.density/10*.7,K=fs/150,fr=.25*(2000/(CFG.vapor*1000))*1.8;
  for(const p of P){
    if(p.ox<=vx){
      if(p.sp===0){p.ang=Math.random()*6.283;p.sp=(Math.random()+.5)*MS;p.vx=Math.cos(p.ang)*p.sp;p.vy=Math.sin(p.ang)*p.sp;p.q=Math.random()>dens}
      if(p.q)p.o=Math.max(0,p.o-dt);
      else{
        const dx=p.ox-p.x,dy=p.oy-p.y,damp=Math.max(.95,1-Math.hypot(dx,dy)/(100*MS)),rs=MS*3;
        p.vx=(p.vx+(Math.random()-.5)*rs+dx*.002)*damp;p.vy=(p.vy+(Math.random()-.5)*rs+dy*.002)*damp;
        const v=Math.hypot(p.vx,p.vy),mx=MS*2;if(v>mx){p.vx*=mx/v;p.vy*=mx/v}
        p.x+=p.vx*dt*20*K;p.y+=p.vy*dt*10*K;p.o=Math.max(0,p.o-dt*fr)}
      if(p.o>.01)all=false;
    }else all=false}
  return all}
function frameVapor(vx){
  buf.fill(0);
  for(const p of P){if(p.sp===0||p.o<=.004)continue;const c=((Math.min(255,p.o*255)|0)<<24)|(p.b<<16)|(p.g<<8)|p.r,x0=p.x|0,y0=p.y|0;
    for(let j=0;j<step;j++){const yy=y0+j;if(yy<0||yy>=H)continue;for(let i=0;i<step;i++){const xx=x0+i;if(xx>=0&&xx<W)buf[yy*W+xx]=c}}}
  octx.putImageData(img,0,0);ctx.clearRect(0,0,cv.width,cv.height);ctx.drawImage(oc,0,0,cv.width,cv.height);
  if(vx<B.l+B.w)text(1,vx)}
function loop(ts){
  raf=requestAnimationFrame(loop);const dt=Math.min(.05,(ts-last)/1000||0);last=ts;if(!P.length)return;
  if(state==='fadingIn'){fade+=dt/CFG.fade;ctx.clearRect(0,0,cv.width,cv.height);text(Math.min(fade,1));if(fade>=1){state='waiting';hold=0;holdMax=CFG.wait}}
  else if(state==='waiting'){hold+=dt;if(hold>=holdMax){state='vaporizing';prog=0}}
  else{prog+=dt*100/CFG.vapor;const vx=B.l+B.w*Math.min(100,prog)/100,all=upd(vx,dt);frameVapor(vx);if(prog>=100&&all){ctx.clearRect(0,0,cv.width,cv.height);finish()}}}
(document.fonts&&document.fonts.load?document.fonts.load('800 100px Montserrat'):Promise.resolve()).catch(()=>{}).then(()=>{sample();if(!finished){last=performance.now();raf=requestAnimationFrame(loop)}}).catch(finish);
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(!finished&&(innerWidth!==lw||Math.abs(innerHeight-lh)>150))sample()},250)});
})();
