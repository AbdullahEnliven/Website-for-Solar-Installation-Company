// Site-wide twinkling stars + shooting stars (2D canvas on top of the 3D scene)
(()=>{
const c=document.getElementById('sky'),x=c.getContext('2d'),RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
const rnd=(a,b)=>a+Math.random()*(b-a),TINT=['255,255,255','200,220,255','255,236,190'];
let W,H,D,stars=[],shoots=[],next=1.2,lt=0;
function init(){D=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;c.width=W*D;c.height=H*D;
  stars=Array.from({length:Math.round(W*H/5500)},()=>({x:Math.random()*W,y:Math.random()*H,r:rnd(.35,1.5),a:rnd(.25,.95),s:rnd(.6,2.4),ph:rnd(0,6.28),z:rnd(.02,.2),c:TINT[Math.random()*3|0]}))}
function spawn(){const d=Math.random()<.5?1:-1,ang=rnd(.35,.7),sp=rnd(700,1200);
  shoots.push({x:d>0?rnd(-40,W*.6):rnd(W*.4,W+40),y:rnd(-20,H*.45),vx:Math.cos(ang)*sp*d,vy:Math.sin(ang)*sp,l:rnd(120,240),t:0,max:rnd(.8,1.4)})}
function frame(ts){
  requestAnimationFrame(frame);const t=ts/1000,dt=Math.min(.05,t-lt);lt=t;
  x.setTransform(D,0,0,D,0,0);x.clearRect(0,0,W,H);
  for(const s of stars){let y=(s.y-scrollY*s.z)%H;if(y<0)y+=H;
    x.fillStyle=`rgba(${s.c},${s.a*(.55+.45*Math.sin(t*s.s+s.ph))})`;x.beginPath();x.arc(s.x,y,s.r,0,6.283);x.fill()}
  if(!RM){next-=dt;if(next<=0){spawn();if(Math.random()<.25)spawn();next=rnd(2.2,6)}}
  shoots=shoots.filter(s=>{
    s.x+=s.vx*dt;s.y+=s.vy*dt;s.t+=dt;if(s.t>s.max||s.y>H+50||s.x<-300||s.x>W+300)return false;
    const a=Math.sin(Math.PI*Math.min(1,s.t/s.max)),sp=Math.hypot(s.vx,s.vy),tx=s.x-s.vx/sp*s.l,ty=s.y-s.vy/sp*s.l,g=x.createLinearGradient(s.x,s.y,tx,ty);
    g.addColorStop(0,`rgba(255,255,255,${a})`);g.addColorStop(.3,`rgba(180,210,255,${a*.45})`);g.addColorStop(1,'rgba(180,210,255,0)');
    x.strokeStyle=g;x.lineWidth=1.8;x.lineCap='round';x.beginPath();x.moveTo(s.x,s.y);x.lineTo(tx,ty);x.stroke();
    x.fillStyle=`rgba(255,255,255,${a})`;x.beginPath();x.arc(s.x,s.y,1.6,0,6.283);x.fill();return true});
}
init();addEventListener('resize',init);requestAnimationFrame(frame);
})();
