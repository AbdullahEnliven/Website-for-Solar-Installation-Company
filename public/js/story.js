const $=s=>document.querySelector(s),Rn=(a,b)=>a+Math.random()*(b-a),cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),sm=(a,b,x)=>{x=cl((x-a)/(b-a));return x*x*(3-2*x)};
const N=90000;
const MOB=innerWidth<=900||innerWidth<=innerHeight*1.1; // mobile UI (header mein 3 lines wala menu) = true
const FW=MOB?0:1; // 1 = laptop (purana 3/4 angle), 0 = mobile (shape bilkul seedha, face forward)

// ---------- helpers ----------
function dir(){const u=Rn(-1,1),a=Rn(0,6.2832),s=Math.sqrt(1-u*u);return[s*Math.cos(a),u,s*Math.sin(a)]}
function rot([x,y,z],rx,ry){rx*=FW;ry*=FW;let c=Math.cos(rx),s=Math.sin(rx),y2=y*c-z*s,z2=y*s+z*c;y=y2;z=z2;c=Math.cos(ry);s=Math.sin(ry);return[x*c+z*s,y,-x*s+z*c]}
function build(fn){const a=new Float32Array(N*3),t=new Float32Array(N);for(let i=0;i<N;i++){const p=fn(i);a[i*3]=p[0];a[i*3+1]=p[1];a[i*3+2]=p[2];t[i]=p[3]||0}return[a,t]}
const T=(p,t)=>{p[3]=t;return p};
function boxSurf(w,h,d){const f=Math.random()*3|0,s=Math.random()<.5?-.5:.5,a=Rn(-.5,.5),b=Rn(-.5,.5);return f==0?[s*w,a*h,b*d]:f==1?[a*w,s*h,b*d]:[a*w,b*h,s*d]}

// colour tones: 0 blue | 1 gold | 2 silver | 3 green | 3.7 orange
// ===== 1) SUN =====
const rays=Array.from({length:70},dir),rl=rays.map(()=>Rn(.9,2.3));
const sun=build(i=>{const r=Math.random();
  if(r<.46){const d=dir(),k=1.1+Rn(-.025,.025);return T(d.map(v=>v*k),1)}
  if(r<.62){const d=dir(),k=1.12+Math.pow(Math.random(),2)*.45;return T(d.map(v=>v*k),1)}
  if(r<.88){const k=i%70,d=rays[k],t=Math.pow(Math.random(),.7),k2=1.3+t*rl[k],j=.05*(1-t)+.01;return T([d[0]*k2+Rn(-j,j),d[1]*k2+Rn(-j,j),d[2]*k2+Rn(-j,j)],1)}
  const k=i%9,d=rays[k*7],ul=Math.hypot(d[0],d[2])||1,u=[-d[2]/ul,0,d[0]/ul],t=Rn(0,Math.PI),RR=.25+(k%3)*.12,c=Math.cos(t)*RR,s=Math.sin(t)*RR;
  return T([d[0]*1.12+u[0]*c+d[0]*s,d[1]*1.12+d[1]*s,d[2]*1.12+u[2]*c+d[2]*s],3.7)});

// ===== 2) SOLAR PANEL: blue chamfered cells, silver grid + busbars, frame (no legs) =====
const PW=4,PH=2.5,C=10,RW=6,cx=PW/C,cy=PH/RW;
const panel=build(i=>{const r=Math.random();let x,y,z=0,tn=0;
  if(r<.54){for(;;){const c=Math.random()*C|0,q=Math.random()*RW|0,u=Math.random(),v=Math.random();
      if(Math.min(u,1-u)+Math.min(v,1-v)<.14)continue;
      x=-PW/2+(c+.03+u*.94)*cx;y=-PH/2+(q+.03+v*.94)*cy;z=Rn(-.005,.005);tn=Math.random()<.12?.4:.05;break}}
  else if(r<.65){if(Math.random()<.5){x=Rn(-PW/2,PW/2);y=-PH/2+(Math.random()*(RW+1)|0)*cy}else{y=Rn(-PH/2,PH/2);x=-PW/2+(Math.random()*(C+1)|0)*cx}x+=Rn(-.003,.003);y+=Rn(-.003,.003);z=.01;tn=2}
  else if(r<.75){const c=Math.random()*C|0,b=1+(Math.random()*3|0);x=-PW/2+(c+b/4)*cx+Rn(-.002,.002);y=Rn(-PH/2,PH/2);z=.015;tn=2}
  else if(r<.81){y=-PH/2+((Math.random()*RW*8|0)+.5)*cy/8;x=Rn(-PW/2,PW/2);z=.008;tn=.45}
  else{const sd=Math.random()*4|0,t=Rn(0,1),o=Rn(0,.1);
    if(sd==0){x=(t-.5)*PW;y=-PH/2-o}else if(sd==1){y=(t-.5)*PH;x=PW/2+o}else if(sd==2){x=(t-.5)*PW;y=PH/2+o}else{y=(t-.5)*PH;x=-PW/2-o}
    z=Rn(-.1,.03);tn=2}
  return T(rot([x,y,z],-.26,.42),tn)});

// ===== 3) HOUSE with blue solar roof =====
const HW=2.6,HD=1.8,HH=1.3;
const house=build(i=>{const r=Math.random();let p,tn=2;
  if(r<.22){const f=Math.random()*4|0,a=Rn(-.5,.5),b=Math.random();p=f<2?[(f?.5:-.5)*HW,b*HH-.6,a*HD]:[a*HW,b*HH-.6,(f==2?.5:-.5)*HD]}
  else if(r<.30){const w=Math.random()<.5?-.7:.7,t=Math.random()*4|0,u=Math.random(),wx=.45,wy=.4;let x,y;
    if(t==0){x=w-wx/2+u*wx;y=-.1}else if(t==1){x=w-wx/2+u*wx;y=-.1+wy}else if(t==2){x=w-wx/2;y=-.1+u*wy}else{x=w+wx/2;y=-.1+u*wy}p=[x,y,HD/2+.01];tn=.3}
  else if(r<.34){p=[.05+Rn(-.2,.2),-.6+Rn(0,.7),HD/2+.01];tn=1}
  else if(r<.38){p=boxSurf(.3,.6,.3);p=[p[0]+.8,p[1]+1.15,p[2]-.3]}
  else if(r<.72){const sd=Math.random()<.5?1:-1,t=Math.random(),x=Rn(-.55,.55)*HW;let xx=x,yy=.7+(1-t)*.75,tt=t;tn=.08;
    if(sd>0&&Math.random()<.55){if(Math.random()<.5)xx=Math.round(x/.26)*.26;else{tt=Math.round(t*5)/5;yy=.7+(1-tt)*.75}tn=2}
    p=[xx,yy,sd*(HD/2+.12)*tt]}
  else if(r<.80){const a=Rn(0,6.283),rr=Math.sqrt(Math.random())*3;p=[Math.cos(a)*rr,-.6,Math.sin(a)*rr*.75];tn=3}
  else if(r<.88){const d=dir(),rr=.45*Math.cbrt(Math.random());p=[d[0]*rr+2,d[1]*rr+.15,d[2]*rr+.3];tn=3}
  else if(r<.91){p=[2+Rn(-.03,.03),-.6+Math.random()*.5,.3+Rn(-.03,.03)];tn=1}
  else p=[Rn(-.2,.3),-.6,HD/2+Math.random()*1.4];
  return T(rot([p[0],p[1]-.15,p[2]],.3,.55),tn)});

// ---------- extra helpers ----------
function tube(f,r){const t=Math.random(),p=f(t),q=f(Math.min(1,t+.003));let u=[q[0]-p[0],q[1]-p[1],q[2]-p[2]];const l=Math.hypot(u[0],u[1],u[2])||1;u=u.map(v=>v/l);
  const n=Math.abs(u[1])<.9?[0,1,0]:[1,0,0];let a=[u[1]*n[2]-u[2]*n[1],u[2]*n[0]-u[0]*n[2],u[0]*n[1]-u[1]*n[0]];const al=Math.hypot(a[0],a[1],a[2])||1;a=a.map(v=>v/al);
  const b=[u[1]*a[2]-u[2]*a[1],u[2]*a[0]-u[0]*a[2],u[0]*a[1]-u[1]*a[0]],th=Rn(0,6.2832),c=Math.cos(th)*r,s=Math.sin(th)*r;
  return[p[0]+a[0]*c+b[0]*s,p[1]+a[1]*c+b[1]*s,p[2]+a[2]*c+b[2]*s]}
const cap=(a,b,r,up)=>{const t=Math.random(),d=dir();if(up)d[1]=Math.abs(d[1]);return[a[0]+(b[0]-a[0])*t+d[0]*r,a[1]+(b[1]-a[1])*t+d[1]*r,a[2]+(b[2]-a[2])*t+d[2]*r]};
const bez=(P,t)=>{const m=1-t;return[0,1,2].map(k=>m*m*m*P[0][k]+3*m*m*t*P[1][k]+3*m*t*t*P[2][k]+t*t*t*P[3][k])};
const poly=(L,j)=>{const k=Math.random()*(L.length-1)|0,t=Math.random(),a=L[k],b=L[k+1];return[a[0]+(b[0]-a[0])*t+Rn(-j,j),a[1]+(b[1]-a[1])*t+Rn(-j,j),Rn(-j,j)]};
const edge=(W,H,D)=>{const k=Math.random()*3|0,s=Math.random()<.5?-1:1,q=Math.random()<.5?-1:1;return k==0?[Rn(-W,W),s*H,q*D]:k==1?[s*W,Rn(-H,H),q*D]:[s*W,q*H,Rn(-D,D)]};

// ===== 3) WIRES: cable spool, red + silver solar cables, gold MC4 connectors =====
const coil=t=>[Math.cos(t*37.7),-.55+1.1*t,Math.sin(t*37.7)];
const cA=[[1,.55,0],[1.7,1.2,.6],[2.1,.3,.4],[2.5,.4,.3]],cB=[[1,-.55,0],[.2,-1.4,1.3],[-1.2,-1.5,.9],[-2.3,-1,.2]];
const eD=P=>{const d=[P[3][0]-P[2][0],P[3][1]-P[2][1],P[3][2]-P[2][2]],l=Math.hypot(d[0],d[1],d[2]);return d.map(v=>v/l)},dA=eD(cA),dB=eD(cB);
const wires=build(i=>{const r=Math.random();let p,tn=2;
  if(r<.36){p=tube(coil,.05);tn=.12}
  else if(r<.50){p=tube(t=>bez(cA,t),.05);tn=4}
  else if(r<.64){p=tube(t=>bez(cB,t),.05);tn=2}
  else if(r<.78){const y=Math.random()<.5?.7:-.7,a=Rn(0,6.2832),rr=Rn(.25,1.25);p=[Math.cos(a)*rr,y+Rn(-.025,.025),Math.sin(a)*rr]}
  else if(r<.84){const a=Rn(0,6.2832);p=[Math.cos(a)*.25,Rn(-.7,.7),Math.sin(a)*.25]}
  else{const A=Math.random()<.5,P=A?cA:cB,d=A?dA:dB,E=P[3];p=tube(t=>[E[0]+d[0]*t*.32,E[1]+d[1]*t*.32,E[2]+d[2]*t*.32],.1);tn=1}
  return T(rot(p,.35,.45),tn)});

// ===== 4) INVERTER: casing, blue display + gold waveform, bolt, LEDs, fins, cables =====
const IW=1.2,IH=.9,ID=.3,bolt=[[.15,-.1],[-.15,-.4],[.02,-.4],[-.12,-.7],[.25,-.33],[.07,-.33],[.15,-.1]],ports=[-.7,-.25,.25,.7];
const inverter=build(i=>{const r=Math.random();let p,tn=2;const F=ID+.01;
  if(r<.12)p=edge(IW,IH,ID);
  else if(r<.32)p=boxSurf(2*IW,2*IH,2*ID);
  else if(r<.47){p=[Rn(-.95,.95),Rn(.15,.75),F];tn=.12}
  else if(r<.51){p=Math.random()<.5?[Rn(-.97,.97),Math.random()<.5?.13:.77,F]:[Math.random()<.5?-.97:.97,Rn(.13,.77),F]}
  else if(r<.56){const x=Rn(-.8,.8);p=[x,.45+.15*Math.sin(x*6),F+.005];tn=1}
  else if(r<.68){const q=poly(bolt,.012);p=[q[0],q[1],F];tn=1}
  else if(r<.72){const k=Math.random()*3|0,rr=.06*Math.sqrt(Math.random()),a=Rn(0,6.2832);p=[-.8+k*.25+Math.cos(a)*rr,-.75+Math.sin(a)*rr,F];tn=3}
  else if(r<.80)p=[-IW+(Math.random()*13|0)*(2*IW/12),IH+Rn(0,.12),Rn(-ID,ID)];
  else if(r<.92){const x=ports[Math.random()*4|0];p=tube(t=>[x+Math.sin(t*3+x)*.08,-IH-t*.9,Math.sin(t*2)*.1],.05);tn=x<0?4:0}
  else{const x=ports[Math.random()*4|0],a=Rn(0,6.2832);p=[x+Math.cos(a)*.1,-IH-Rn(0,.12),Math.sin(a)*.1];tn=1}
  return T(rot(p,-.18,.4),tn)});

// ===== 5) LITHIUM BATTERY BANK: two units, green charge bars, terminals, cell grid =====
const battery=build(i=>{const r=Math.random();let p,tn=2;const W=.75,H=1.15,D=.28,F=D+.01,u=Math.random()<.5?0:1,ox=u?.95:-.95;
  if(r<.12)p=edge(W,H,D);
  else if(r<.30)p=boxSurf(2*W,2*H,2*D);
  else if(r<.66){const k=Math.random()*5|0;p=[Rn(-.55,.55),-.88+k*.44+Rn(-.13,.13),F];tn=k<(u?3:4)?3:.4}
  else if(r<.72){const sd=Math.random()<.5?-1:1,a=Rn(0,6.2832);p=[sd*.4+Math.cos(a)*.1,H+Rn(0,.2),Math.sin(a)*.1];tn=sd<0?0:4}
  else if(r<.80)p=Math.random()<.5?[Rn(-.62,.62),Math.random()<.5?-1.02:1.02,F]:[Math.random()<.5?-.62:.62,Rn(-1.02,1.02),F];
  else p=Math.random()<.5?[W+.01,-H+(Math.random()*9|0)/8*2*H,Rn(-D,D)]:[W+.01,Rn(-H,H),-D+(Math.random()*6|0)/5*2*D];
  return T(rot([p[0]+ox,p[1],p[2]],-.15,.45),tn)});

// ===== 6) INSTALLATION: two workers carrying a panel onto a roof =====
function worker(cx,s){const X=v=>cx+s*v;return[
  [[X(0),1.18,0],[X(0),1.18,0],.19,3.7,6],[[X(0),1.3,0],[X(0),1.3,0],.23,2,4,1],[[X(0),.98,0],[X(0),.2,0],.27,1,16],
  [[X(-.1),.2,.05],[X(-.12),-.5,.05],.12,0,6],[[X(-.12),-.5,.05],[X(-.1),-1.2,.08],.1,0,6],
  [[X(.1),.2,-.05],[X(.16),-.5,-.05],.12,0,6],[[X(.16),-.5,-.05],[X(.2),-1.2,-.1],.1,0,6],
  [[X(-.1),-1.2,.08],[X(.08),-1.25,.08],.1,2,2],[[X(.2),-1.2,-.1],[X(.38),-1.25,-.1],.1,2,2],
  [[X(.1),.9,.2],[X(.55),.95,.25],.09,1,5],[[X(.55),.95,.25],[X(.95),.9,.2],.08,3.7,4],
  [[X(.1),.9,-.2],[X(.55),.6,-.25],.09,1,5],[[X(.55),.6,-.25],[X(.95),.55,-.2],.08,3.7,4]]}
const SEG=[...worker(-1.7,1),...worker(1.7,-1)],CW=[];let acc=0;SEG.forEach(q=>{acc+=q[4];CW.push(acc)});
const install=build(i=>{const r=Math.random();let p,tn=0;
  if(r<.22){const c=Math.random(),cw=.35,ch=1/3;
    if(c<.5){p=[-.7+(Math.random()*4|0)*cw+Rn(.02,cw-.02),.35+(Math.random()*3|0)*ch+Rn(.02,ch-.02),Rn(-.01,.01)];tn=.05}
    else if(c<.8){p=Math.random()<.5?[Rn(-.7,.7),.35+(Math.random()*4|0)*ch,.012]:[-.7+(Math.random()*5|0)*cw,Rn(.35,1.35),.012];tn=2}
    else{p=Math.random()<.5?[Rn(-.74,.74),Math.random()<.5?.33:1.37,Rn(-.04,.04)]:[Math.random()<.5?-.74:.74,Rn(.33,1.37),Rn(-.04,.04)];tn=2}}
  else if(r<.34){const x=Rn(-2.5,2.5),z=Math.random()<.6?Math.round(Rn(-1.2,1.2)/.14)*.14:Rn(-1.2,1.2);p=[x,-1.32+x*.05,z];tn=3.7}
  else{const t=Math.random()*acc;let k=0;while(CW[k]<t)k++;const q=SEG[k];p=cap(q[0],q[1],q[2],q[5]);tn=q[3]}
  return T(rot(p,.05,.3),tn)});

// ===== 7) 5-YEAR WARRANTY SHIELD with "5" and check mark =====
const five=[[-.3,.95],[.3,.95],[.3,.95],[-.3,.95],[-.3,.55],[.3,.55],[.3,.15],[-.3,.15]],fiveL=[[[-.3,.95],[.3,.95]],[[-.3,.95],[-.3,.55]],[[-.3,.55],[.3,.55]],[[.3,.55],[.3,.15]],[[.3,.15],[-.3,.15]]],chk=[[-.4,-.3],[-.12,-.62],[.42,.0]];
const wd=y=>y>0?.95:.95*(1-Math.pow(-y/1.25,1.7));
const shield=build(i=>{const r=Math.random();let x,y,z=0,tn=0;
  if(r<.40){y=Rn(-1.25,1.2);const w=wd(y);x=Rn(-w,w);z=.22*(1-(x/w)*(x/w))*(1-Math.abs(y)/1.5);tn=Math.random()<.1?.4:.05}
  else if(r<.56){y=Rn(-1.25,1.2);x=(Math.random()<.5?-1:1)*(wd(y)+Rn(-.02,.06));z=Rn(-.05,.1);tn=2}
  else if(r<.60){x=Rn(-.95,.95);y=1.2+Rn(0,.06);z=Rn(-.05,.1);tn=2}
  else if(r<.67){y=Rn(-1.1,1.05);x=(Math.random()<.5?-1:1)*wd(y)*.86;z=.2*(1-.74)+.04;tn=1}
  else if(r<.83){const q=poly(fiveL[Math.random()*5|0],0);const L=fiveL[Math.random()*5|0],t=Math.random();x=L[0][0]+(L[1][0]-L[0][0])*t+Rn(-.035,.035);y=L[0][1]+(L[1][1]-L[0][1])*t+Rn(-.035,.035);z=.26+Rn(-.03,.03);tn=1}
  else if(r<.93){const q=poly(chk,.04);x=q[0];y=q[1];z=.27+q[2];tn=3}
  else{const a=Rn(0,6.2832);x=Math.cos(a)*1.7;y=Math.sin(a)*1.7;z=Rn(-.02,.02);tn=1}
  return T(rot([x,y,z],0,.25),tn)});

// ---------- three.js ----------
const renderer=new THREE.WebGLRenderer({canvas:$('#gl'),antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,1,.1,100);cam.position.z=7;
const g=new THREE.BufferGeometry();
g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3));
const S=[sun,panel,wires,inverter,battery,install,shield,house].map(a=>({p:new THREE.BufferAttribute(a[0],3),t:new THREE.BufferAttribute(a[1],1)}));const K=S.length;let cur=-1;
function setSeg(k){cur=k;g.setAttribute('sA',S[k].p);g.setAttribute('sB',S[k+1].p);g.setAttribute('tA',S[k].t);g.setAttribute('tB',S[k+1].t)}setSeg(0);
g.setAttribute('rnd',new THREE.BufferAttribute(Float32Array.from({length:N},Math.random),1));
const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  uniforms:{uF:{value:0},uT:{value:0},uA:{value:1},uSize:{value:.0125},uPix:{value:800},uAsp:{value:1.7}},
  vertexShader:`attribute vec3 sA,sB;attribute float rnd,tA,tB;uniform float uF,uT,uSize,uPix,uA;varying vec3 vC;
  vec3 pal(float t,float r){
    if(t<.5)return mix(vec3(.08,.25,.95),vec3(.45,.75,1.),t*2.);
    if(t<1.5)return mix(vec3(1.,.62,.12),vec3(1.,.85,.35),r);
    if(t<2.5)return vec3(.82,.88,1.)*(.85+.3*r);
    if(t<3.5)return mix(vec3(.12,.7,.25),vec3(.5,.95,.3),r);
    if(t<3.9)return mix(vec3(1.,.35,.1),vec3(1.,.6,.2),r);
    return mix(vec3(1.,.15,.15),vec3(1.,.4,.35),r);}
  void main(){
    // continuous flow: every dot glides from its place in picture A to its place in picture B while you scroll.
    // Dots start at slightly different moments (rnd), so it moves like a stream, not a scatter, and it never stops.
    float S=.45,t=clamp((uF-rnd*S)/(1.-S),0.,1.),m=t*t*(3.-2.*t);
    vec3 p=mix(sA,sB,m);
    float arc=sin(m*3.14159)*.22;                 // small sideways curve so the stream looks organic
    p+=vec3(sin(rnd*40.)*arc,cos(rnd*27.)*arc,sin(rnd*13.)*arc);
    p+=vec3(sin(uT*1.3+rnd*40.),cos(uT*1.1+rnd*31.),sin(uT*.9+rnd*23.))*.01;
    vC=mix(pal(tA,rnd),pal(tB,rnd),m)*(.8+.7*rnd)*1.25*uA;
    vec4 mv=modelViewMatrix*vec4(p,1.);
    gl_PointSize=max(1.,uSize*(.45+rnd*1.1)*uPix/-mv.z);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying vec3 vC;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vC,smoothstep(.5,.1,d));}`});
const pts=new THREE.Points(g,mat);scene.add(pts);

const sa=new Float32Array(2500*3);for(let i=0;i<2500;i++){const d=dir(),r=Rn(18,40);sa.set([d[0]*r,d[1]*r,d[2]*r],i*3)}
const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sa,3));
const stars=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:.05,transparent:true,opacity:.6}));scene.add(stars);

function resize(){renderer.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();
  mat.uniforms.uAsp.value=cam.aspect;mat.uniforms.uPix.value=renderer.getPixelRatio()*innerHeight/(2*Math.tan(25*Math.PI/180))}
addEventListener('resize',resize);resize();

// ---------- layout + text (animation above is untouched) ----------
const ST=window.STORY,hdr=$('header'),SP=$('#spacer'),IN={offsetHeight:0}; // the intro is a one-time overlay now, it takes no space in the page

const LAY={R:[1.9,0,1],L:[-1.9,0,1],M:[0,.75,.82]},OBJ=['R','L','M','R','L','M','R','L'],TS={R:'L',L:'R',M:'M'};
const lay=(i,w)=>w?LAY[OBJ[Math.min(i,K-1)]]:i===0?[.4*3.26*cam.aspect,.72,Math.min(.41,.56*cam.aspect)]:[0,1.4,.5]; // mobile: chhoti; pehli screen par sun chhota aur right-beech mein
const WL={about:'Meet our crew',panels:'Explore Solar Panels',wires:'Explore Wires &amp; Cables',inverters:'Explore Inverters',batteries:'Explore Batteries',installation:'See our installation packages'};
const txt=[],det=[],mk=(t,c)=>{const e=document.createElement(t);e.className=c;return e};
ST.forEach((s,i)=>{
  const P=s.pal,side=TS[OBJ[i]],d=mk('div','txt '+side+(i===0?' first':'')),Ls=s.h[2].split('<br>');
  d.style.cssText=`--c1:${P[0]};--c2:${P[1]};--c3:${P[2]}`;
  d.innerHTML=`<h1><span class="ln a ${s.h[1]}" style="--m:70">${s.h[0]}</span><br>${Ls.map((x,j)=>`<span class="ln b" style="--m:${130+j*60}">${x}</span>`).join('<br>')}</h1><p class="ln" style="--m:230">${s.h[3]}</p>${s.work?`<button class="btn wbtn ln" style="--m:270" data-work="${s.work}">${WL[s.work]} →</button>`:''}${s.btn?`<a class="btn ln" style="--m:300" href="#" data-book>${s.btn} →</a>`:''}`;
  document.body.appendChild(d);txt.push(d);
  if(i<K-1){ // explanation shown in the blank space while the dots are scattered
    const D=s.d,e=mk('div','dtl '+side);e.style.cssText=`--c1:${P[0]};--c2:${P[1]}`;
    e.innerHTML=`<div class="wrap"><div class="dhead ln" style="--m:140"><span class="tag">${D.tag}</span><h2>${D.title}</h2><p>${D.intro}</p></div><div class="dbody ln" style="--m:200"><div class="specs">${D.specs.map(x=>`<div class="spec"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div><ul class="pts">${D.pts.map(x=>`<li>${x}</li>`).join('')}</ul>${s.work?`<button class="btn wbtn" data-work="${s.work}">${WL[s.work]} →</button>`:''}</div></div>`;
    document.body.appendChild(e);det.push(e)}
});
$('#book').appendChild($('#bookTpl').content.cloneNode(true));
SP.style.height=((K-1)*105+100)+'vh'; // pehle 170 tha: ab har stage ka scroll chota hai, animation jaldi chalti hai
let p=0,mx=0,my=0;
addEventListener('mousemove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
const stEl=$('#steps');ST.forEach(()=>stEl.appendChild(document.createElement('i')));const st=[...stEl.children];
setTimeout(()=>{$('#load').style.opacity=0;setTimeout(()=>$('#load').remove(),900)},300);

let lt=0,ut=0,sw=0,idleT=0,lastScr=-9;const SNAP=14;
const touchScr=()=>{lastScr=performance.now()*.001};addEventListener('scroll',touchScr,{passive:true});addEventListener('touchmove',touchScr,{passive:true});addEventListener('wheel',touchScr,{passive:true}); // SNAP jitna bada, scroll ke saath animation utni foran chalti hai
(function loop(t){
  requestAnimationFrame(loop);t*=.001;
  const dt=Math.min(.05,Math.max(0,t-lt));lt=t;
  const ia=1;stEl.style.opacity=ia;
  const tg=cl((scrollY-IN.offsetHeight)/Math.max(1,SP.offsetHeight-innerHeight),0,1)*(K-1),gap=Math.abs(tg-p);
  p+=(tg-p)*(1-Math.exp(-dt*SNAP)); // frame-rate se independent, beech me atakta nahi
  ut+=dt*(1+Math.min(1,gap*3)*5);   // scroll karte waqt dots tez hilte hain
  const pp=cl(p,0,K-1.001),sgm=Math.floor(pp),f=pp-sgm;if(sgm!==cur)setSeg(sgm);
  mat.uniforms.uF.value=f;mat.uniforms.uT.value=ut;
  const spread=0,wide=innerWidth>innerHeight*1.1;
  mat.uniforms.uA.value=1-spread;
  const la=lay(sgm,wide),lb=lay(sgm+1,wide),w=sm(.1,.9,f),k=1-spread;
  pts.position.x=(la[0]+(lb[0]-la[0])*w)*k;
  pts.position.y=(la[1]+(lb[1]-la[1])*w)*k;
  pts.scale.setScalar(1+(la[2]+(lb[2]-la[2])*w-1)*k);
  // swivel sirf tab jab scroll ruka ho; scroll shuru hote hi shape seedhi (face forward) ho jati hai, side se start nahi hoti
  const idle=gap<.02&&(t-lastScr)>.5; // scroll ko ruke 0.5s ho gaya ho tabhi swivel; scroll ke dauran shape hamesha seedhi
  if(idle)idleT+=dt;else idleT=0;
  const swT=idle?Math.sin(idleT*.35)*.5*cl((idleT-.3)/1.2):0;
  sw+=(swT-sw)*(1-Math.exp(-dt*(idle?4:10)));
  pts.rotation.y=(sw*(MOB?.8:1)+(MOB?0:mx*.5))*k;pts.rotation.x=MOB?0:my*.25*k; // mobile: seedha start, phir halka swivel
  stars.rotation.y=t*.01;
  const fv=cl(1-(scrollY-IN.offsetHeight-(SP.offsetHeight-innerHeight))/(innerHeight*.35));
  txt.forEach((e,i)=>{const o=cl(1-Math.max(0,Math.abs(p-i+.025)-.09)*9)*fv*ia;
    e.style.opacity=o;e.style.setProperty('--k',1-o);e.style.transform=`translateY(${(i-p)*30}px)`;e.style.pointerEvents=o>.5?'auto':'none'});
  let dm=0;
  det.forEach((e,i)=>{const q=p-i,o=q>0&&q<1?sm(.15,.26,q)*(1-sm(.62,.74,q)):0;dm=Math.max(dm,o);
    e.style.opacity=o;e.style.visibility=o>.01?'visible':'hidden';e.style.setProperty('--k',1-o)});
  $('#gl').style.opacity=(1-.6*dm)*ia*fv;
  st.forEach((d,i)=>d.classList.toggle('on',Math.abs(p-i)<.45));
  $('#hint').style.opacity=.6*(1-cl(p*6))*ia;
  hdr.classList.toggle('sc',scrollY>40);
  const hv=1;hdr.style.opacity=hv;hdr.style.pointerEvents=hv>.1?'auto':'none';
  renderer.render(scene,cam);
})(0);
