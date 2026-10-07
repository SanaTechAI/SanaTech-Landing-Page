/* Rede 3D nativa: coordenadas xyz, câmera interpolada e projeção em Canvas 2D.
   Sem bibliotecas, downloads ou loop de animação permanente. */
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const mobile=matchMedia('(max-width: 640px)');
 const lowPower=navigator.connection?.saveData || (navigator.hardwareConcurrency && navigator.hardwareConcurrency<=2);
 const names=['Diagnóstico','Inteligência artificial','Desenvolvimento','Segurança e arquitetura','Implementação e evolução'];
 const nodes=[[-150,35,0],[60,-110,150],[200,80,-60],[-70,180,130],[-190,-150,-120]];
 const points=nodes.map(p=>({p,main:true}));const edges=[];
 let seed=13;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
 nodes.forEach((origin,index)=>{
  for(let branch=0;branch<7;branch++){
   let parent=index;const a=branch/7*Math.PI*2+index;
   for(let level=1;level<=3;level++){
    const r=level*36;const p=[origin[0]+Math.cos(a)*r+(random()-.5)*26,origin[1]+Math.sin(a)*r+(random()-.5)*26,origin[2]+(random()-.5)*100];
    const id=points.push({p,main:false})-1;edges.push([parent,id]);parent=id;
   }
  }
  edges.push([index,(index+1)%5]);
 });
 const scenes=[];
 for(const id of ['hero-network','journey-network']){
  const canvas=document.getElementById(id);let ctx;
  try{ctx=canvas?.getContext('2d')}catch{}
  if(!ctx)continue;
  canvas.parentElement.classList.add('canvas-ready');
  scenes.push({canvas,ctx,journey:id==='journey-network'});
 }
 let queued=false;
 function draw(scene,t){
  const {canvas,ctx,journey}=scene;const bounds=canvas.getBoundingClientRect();if(!bounds.width||!bounds.height)return;
  const dpr=Math.min(devicePixelRatio||1,1.5);const w=bounds.width,h=bounds.height;
  if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  const simple=reduced.matches||mobile.matches||lowPower;
  const a=Math.floor(t),b=Math.min(a+1,4),mix=t-a;
  const focus=nodes[a].map((v,i)=>v+(nodes[b][i]-v)*mix);
  const rotation=journey&&!simple?t*.22:-.25;
  const zoom=journey&&!simple?.8:.64;
  const transformed=points.map(({p,main},index)=>{
   const x=p[0]-(journey&&!simple?focus[0]*.64:0),y=p[1]-(journey&&!simple?focus[1]*.64:0),z=p[2]-(journey&&!simple?focus[2]*.64:0);
   const rx=x*Math.cos(rotation)+z*Math.sin(rotation),rz=-x*Math.sin(rotation)+z*Math.cos(rotation);
   const perspective=620/(720+rz);const scale=Math.min(w/500,h/450)*zoom;
   return{x:w/2+rx*perspective*scale*1.6,y:h*.45+y*perspective*scale*1.6,z:rz,s:perspective*scale,main,index};
  });
  edges.forEach(([a,b])=>{const p=transformed[a],q=transformed[b];ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle=a<5?'#05f2db70':'#45b9d347';ctx.lineWidth=a<5?1.25:.7;ctx.stroke()});
  transformed.sort((a,b)=>b.z-a.z).forEach(p=>{
   const active=p.main&&p.index===Math.round(t);const r=p.main?(active?16:10)*p.s:2*p.s;
   if(p.main){const glow=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r*4);glow.addColorStop(0,active?'#05f2db60':'#05b6de28');glow.addColorStop(1,'#05f2db00');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(p.x,p.y,r*4,0,Math.PI*2);ctx.fill()}
   const fill=ctx.createRadialGradient(p.x-r*.3,p.y-r*.35,0,p.x,p.y,r);fill.addColorStop(0,'#d4fffa');fill.addColorStop(.35,active?'#05f2db':'#42c4d8');fill.addColorStop(1,'#056784');ctx.fillStyle=fill;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.8,r),0,Math.PI*2);ctx.fill();
   if(active){ctx.strokeStyle='#05f2db65';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,r+7,0,Math.PI*2);ctx.stroke()}
  });
 }
 function render(){queued=false;const steps=[...document.querySelectorAll('[data-node]')];const center=innerHeight*.52;let t=0;
  if(!reduced.matches&&!mobile.matches&&!lowPower){
   const centers=steps.map(el=>{const r=el.getBoundingClientRect();return r.top+r.height/2});
   for(let i=0;i<4;i++){if(center>=centers[i])t=i+Math.min(1,Math.max(0,(center-centers[i])/(centers[i+1]-centers[i])))}
  }
  const index=Math.round(t);document.getElementById('scene-caption').textContent=names[index];document.getElementById('scene-counter').textContent=`0${index+1} / 05`;
  for(const scene of scenes){const r=scene.canvas.getBoundingClientRect();if(!scene.drawn||(r.bottom>0&&r.top<innerHeight)){draw(scene,scene.journey?t:0);scene.drawn=true}}
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(render)}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);mobile.addEventListener('change',schedule);schedule();
})();
