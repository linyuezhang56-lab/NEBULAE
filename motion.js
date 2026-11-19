const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
function random(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function canvasSize(canvas,dpr=1.25){const w=canvas.clientWidth,h=canvas.clientHeight,k=Math.min(devicePixelRatio||1,dpr);if(canvas.width!==Math.round(w*k)||canvas.height!==Math.round(h*k)){canvas.width=Math.round(w*k);canvas.height=Math.round(h*k);canvas.getContext('2d').setTransform(k,0,0,k,0,0);}return {w,h};}

class TypographyDust{
 constructor(element,stage){this.element=element;this.stage=stage;this.lines=element.innerText.split('\n').filter(Boolean);this.canvas=document.createElement('canvas');this.canvas.className='type-dust';this.canvas.setAttribute('aria-hidden','true');stage.append(this.canvas);this.ctx=this.canvas.getContext('2d');this.points=[];this.key='';this.ready=false;document.fonts.ready.then(()=>{this.ready=true;this.key='';});}
 build(){if(!this.ready)return;const {w,h}=canvasSize(this.canvas),key=[w,h,innerWidth].join(':');if(key===this.key&&this.points.length)return;this.key=key;this.points=[];
  const rect=this.element.getBoundingClientRect(),stageRect=this.stage.getBoundingClientRect(),style=getComputedStyle(this.element),scale=.6;
  const buffer=document.createElement('canvas');buffer.width=Math.ceil(w*scale);buffer.height=Math.ceil(h*scale);const c=buffer.getContext('2d',{willReadFrequently:true});c.scale(scale,scale);c.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;c.textAlign='center';c.textBaseline='middle';c.fillStyle='white';const lineHeight=parseFloat(style.lineHeight)||parseFloat(style.fontSize)*1.5;const x=rect.left-stageRect.left+rect.width*.5,y=rect.top-stageRect.top;
  this.lines.forEach((line,i)=>c.fillText(line,x,y+lineHeight*(i+.5),rect.width));const pixels=c.getImageData(0,0,buffer.width,buffer.height).data,rnd=random(651);const step=innerWidth<800?3:3;
  for(let py=0;py<buffer.height;py+=step)for(let px=0;px<buffer.width;px+=step){const alpha=pixels[(py*buffer.width+px)*4+3];if(alpha<55||rnd()>.87)continue;this.points.push({x:px/scale,y:py/scale,vx:(rnd()-.5)*650,vy:(rnd()-.7)*540,phase:rnd()*6.28,s:.7+rnd()*1.5,alpha:alpha/255});}
 }
 render(time,scatter,reduced){const {w,h}=canvasSize(this.canvas);this.ctx.clearRect(0,0,w,h);this.canvas.style.opacity=(!reduced&&scatter>0&&scatter<1)?'1':'0';if(reduced||scatter<=0||scatter>=1)return;this.build();const c=this.ctx,fade=smooth(0,.08,scatter)*(1-smooth(.65,1,scatter));c.fillStyle='#e3eaf6';
  for(const p of this.points){const delay=(p.phase/6.28)*.12,t=clamp((scatter-delay)/.88),spread=t*t;c.globalAlpha=fade*p.alpha*(.75+.25*Math.sin(time*.7+p.phase));const x=p.x+p.vx*spread+Math.sin(time*.7+p.phase)*t*17,y=p.y+p.vy*spread+Math.cos(time*.65+p.phase)*t*24;c.fillRect(x,y,p.s*(1-t*.5),p.s*(1-t*.5));}c.globalAlpha=1;
 }
}

class InterludeField{
 constructor(canvas,kind){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.kind=kind;this.points=[];const rnd=random(kind==='distance'?7627:4892);const count=kind==='distance'?(innerWidth<800?550:1100):(innerWidth<800?2500:4500);
  for(let i=0;i<count;i++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd());this.points.push({x:Math.cos(a)*r,y:Math.sin(a)*r,z:rnd(),phase:rnd()*6.28,size:.4+rnd()*1.3,tone:rnd()});}canvas.dataset.ready=kind==='distance'?'star-tunnel':'expanding-dust';}
 render(time,p,velocity,reduced){const {w,h}=canvasSize(this.canvas),c=this.ctx;c.clearRect(0,0,w,h);const t=reduced?0:time;
  if(this.kind==='distance'){
   const travelled=reduced?.1:p*2.15+t*.021,stretch=clamp(Math.abs(velocity)*.13,0,1);c.lineWidth=.6;
   for(const s of this.points){const depth=((s.z-travelled)%1+1)%1+.13,zoom=1/depth;const x=w*.5+s.x*w*.35*zoom,y=h*.5+s.y*h*.45*zoom;if(x<0||x>w||y<0||y>h)continue;const a=clamp((1.2-depth)*.6,.08,.65)*(1-smooth(.9,1,p));c.fillStyle=`rgba(194,211,238,${a})`;c.strokeStyle=`rgba(150,183,225,${a*.65})`;const r=s.size*zoom*.6;c.fillRect(x,y,r,r);
    if(stretch>.05){const dx=x-w*.5,dy=y-h*.5,f=(.004+stretch*.06)*zoom;c.beginPath();c.moveTo(x,y);c.lineTo(x+dx*f,y+dy*f);c.stroke();}
   }
  }else{
   const expansion=.32+smooth(.08,.96,p)*2.8,rotation=t*.08,cx=w*.5,cy=h*.52,scale=Math.min(w,h)*.43;c.globalCompositeOperation='lighter';
   for(const s of this.points){const a=s.phase+rotation,r=Math.hypot(s.x,s.y),curl=Math.sin(r*5+t*.19)*.12;const x=cx+(Math.cos(a+curl)*r*expansion+s.z*.12)*scale,y=cy+Math.sin(a+curl)*r*expansion*scale*.55;const alpha=(.1+(1-r)*.34)*(1-smooth(.75,1,p)*.55);c.fillStyle=s.tone>.3?`rgba(167,190,225,${alpha})`:`rgba(208,182,153,${alpha})`;const size=s.size*(.7+expansion*.2);c.fillRect(x,y,size,size);}
   c.globalCompositeOperation='source-over';
  }
 }
}

class ImageDust{
 constructor(figure){this.figure=figure;this.image=$('img',figure);this.canvas=document.createElement('canvas');this.canvas.className='image-dust';this.canvas.setAttribute('aria-hidden','true');($('.image-atmosphere',figure)||figure).append(this.canvas);this.ctx=this.canvas.getContext('2d');this.points=[];this.key='';this.last=0;this.image.addEventListener('load',()=>{this.key='';},{passive:true});}
 build(){const img=this.image;if(!img.complete||!img.naturalWidth)return;const {w,h}=canvasSize(this.canvas),key=[w,h,img.currentSrc].join(':');if(this.key===key)return;this.key=key;this.points=[];
  const sw=260,sh=Math.max(80,Math.round(sw*h/w)),b=document.createElement('canvas');b.width=sw;b.height=sh;const c=b.getContext('2d',{willReadFrequently:true}),ratio=Math.max(sw/img.naturalWidth,sh/img.naturalHeight),dw=img.naturalWidth*ratio,dh=img.naturalHeight*ratio;c.drawImage(img,(sw-dw)*.5,(sh-dh)*.5,dw,dh);let d;try{d=c.getImageData(0,0,sw,sh).data;}catch{return;}const rnd=random(929);
  for(let y=1;y<sh;y+=5)for(let x=1;x<sw;x+=5){const k=(y*sw+x)*4,r=d[k],g=d[k+1],bl=d[k+2];if(r+g+bl<90||rnd()>.7)continue;this.points.push({x:x/sw,y:y/sh,color:`rgb(${r},${g},${bl})`,phase:rnd()*6.28,dx:(rnd()-.5)*200,dy:40+rnd()*110,s:.8+rnd()*1.5});}
 }
 render(time,p,reduced){const {w,h}=canvasSize(this.canvas),c=this.ctx;c.clearRect(0,0,w,h);if(reduced||p<=.01||p>=1)return;this.build();
  for(const s of this.points){const phase=clamp((p-s.y*.14)/.86);c.fillStyle=s.color;c.globalAlpha=Math.sin(phase*Math.PI)*.9;const drift=phase*phase;c.fillRect(s.x*w+s.dx*drift+Math.sin(time+s.phase)*phase*14,s.y*h+s.dy*drift,s.s*(1+phase),s.s*(1+phase));}c.globalAlpha=1;
 }
}

function splitHeading(el){const label=el.innerText;el.setAttribute('aria-label',label.replace(/\n/g,' '));const chars=[];
 function walk(parent){for(const n of [...parent.childNodes]){if(n.nodeType===3){const fragment=document.createDocumentFragment();for(const char of Array.from(n.textContent)){if(char==='\n'){fragment.append(document.createTextNode(char));continue;}const span=document.createElement('span');span.className='motion-char';span.textContent=char===' '?'\u00a0':char;span.setAttribute('aria-hidden','true');fragment.append(span);chars.push(span);}n.replaceWith(fragment);}else if(n.nodeType===1&&n.tagName!=='BR')walk(n);}}
 walk(el);return {el,chars};
}

export class ScrollCinema{
 constructor({cover,mouse}){
  this.cover=cover;this.mouse=mouse;this.lastScroll=scrollY;this.velocity=0;this.lastUpdate=-1;this.hero=$('#home');this.heroStage=$('.hero-stage');this.heroTitle=$('.hero-title');this.heroDust=new TypographyDust($('#page-title'),this.heroStage);
  const interludes=[{after:'#nebula-2',kind:'matter',id:'stellar-dust',text:'恒星留下的物质，<br>回到星际空间。'},{after:'#nebula-5',kind:'distance',id:'beyond-the-milky-way',text:'银河系之外',english:'BEYOND THE MILKY WAY',secondary:'下一站，约 16 万光年外的大麦哲伦云。<br>它是银河系的伴星系，蜘蛛星云就在其中。'}];
  this.interludes=interludes.map(config=>{const section=document.createElement('section');section.className='nebula-interlude interlude-'+config.kind;section.id=config.id;section.setAttribute('aria-label',config.kind==='matter'?'恒星抛出的物质扩散到星际空间':'从银河系内的星云过渡到大麦哲伦云');section.innerHTML=`<div class="interlude-stage"><canvas class="interlude-field" aria-hidden="true"></canvas><div class="interlude-copy"><h2>${config.text}</h2>${config.english?`<p class="english" lang="en">${config.english}</p>`:''}${config.secondary?`<p>${config.secondary}</p>`:''}</div></div>`;$(config.after).after(section);const stage=$('.interlude-stage',section),title=$('h2',section);return {section,stage,copy:$('.interlude-copy',section),kind:config.kind,field:new InterludeField($('canvas',section),config.kind),dust:new TypographyDust(title,stage)};});
  this.headings=$$('.intro-main h2,.earth-copy h2,.seeing-copy h2,.color-intro h2,.journey-heading h2,.nebula-name h2').map(splitHeading);
  this.paragraphs=$$('.intro-main>p,.intro-matter>p,.earth-copy>p,.color-intro>div>p,.nebula-summary,.nebula-composition');
  this.histories=$$('.history-list article');this.nebulae=$$('.nebula');this.photos=$$('.nebula-visual').map(el=>({el,img:$('img',el),ring:el.closest('.nebula--ring')!==null,dust:el.closest('.nebula--ring')?null:new ImageDust(el)}));this.seeingImage=$('.seeing-image img');this.earthVisual=$('.earth-visual');this.elements=$('.matter-elements');
  document.documentElement.dataset.motionVersion='6';
 }
 update(time,dt,reduced){
  const h=innerHeight,w=innerWidth;this.velocity=mix(this.velocity,(scrollY-this.lastScroll)/(dt/16||1),.18);this.lastScroll=scrollY;
  const heroRect=this.hero.getBoundingClientRect(),heroP=clamp(-heroRect.top/Math.max(1,heroRect.height-h));
  if(heroRect.bottom>0&&heroRect.top<h){const disperse=reduced?0:smooth(.08,1,heroP);this.cover.disperse=disperse;this.hero.dataset.progress=heroP.toFixed(3);const opacity=reduced?1:1-smooth(.29,.57,heroP);this.heroTitle.style.opacity=String(opacity);this.heroTitle.style.transform=`translate3d(0,${reduced?0:-heroP*85}px,0)`;this.heroTitle.style.filter=`blur(${reduced?0:smooth(.32,.64,heroP)*9}px)`;this.heroDust.render(time,smooth(.32,.94,heroP),reduced);}
  if(this.lastUpdate>=0&&time!==0&&time-this.lastUpdate<.027)return;this.lastUpdate=time;
  for(const {el,chars} of this.headings){const r=el.getBoundingClientRect();if(r.bottom< -100||r.top>h+100)continue;const enter=smooth(h*.97,h*.5,r.top),exit=smooth(h*.025,-h*.18,r.bottom);chars.forEach((char,i)=>{const e=reduced?1:smooth(0,1,clamp(enter*1.65-i/Math.max(chars.length,1)*.65));char.style.opacity=String(reduced?1:(.22+.78*e)*(1-exit));char.style.transform=`translate3d(${reduced?0:(1-e)*7}px,${reduced?0:(1-e)*32-exit*32}px,0) rotate(${reduced?0:(1-e)*-2}deg)`;char.style.filter=`blur(${reduced?0:(1-e)*3}px)`;});}
  for(const el of this.paragraphs){const r=el.getBoundingClientRect();if(r.bottom<0||r.top>h)continue;const e=smooth(h*.98,h*.68,r.top);el.style.transform=`translate3d(0,${reduced?0:(1-e)*24}px,0)`;el.style.opacity=String(reduced?1:.55+.45*e);}
  this.histories.forEach((el,i)=>{if(el.closest('.seeing--spatial'))return;const r=el.getBoundingClientRect();if(r.bottom<0||r.top>h) return;const e=smooth(h*.95,h*.53,r.top);el.style.opacity=String(reduced?1:.38+.62*e);el.style.transform=`translate3d(${reduced?0:(1-e)*45}px,${reduced?0:(1-e)*18}px,0)`;});
  for(const {el,img,ring,dust} of this.photos){if(el.closest('.nebula--cinematic'))continue;const r=el.getBoundingClientRect();if(r.bottom<0||r.top>h)continue;const p=clamp((h-r.top)/(h+r.height)),dy=reduced?0:clamp((h*.5-r.top-r.height*.5)*.2,-95,95),exit=reduced?0:smooth(h*.35,-h*.04,r.bottom);img.style.transform=ring?'none':`translate3d(${reduced?0:(this.mouse.x-.5)*10}px,${dy}px,0) scale(${reduced?1:1.055+p*.075})`;img.style.opacity=String(1-exit*.85);if(dust)dust.render(time,exit,reduced);const caption=$('.photo-caption',el);caption.style.transform=`translateY(${reduced?0:dy*-.14}px)`;}
  for(const el of this.nebulae){if(el.classList.contains('nebula--cinematic'))continue;const r=el.getBoundingClientRect();if(r.bottom<0||r.top>h)continue;const p=clamp((h-r.top)/(h+r.height)),heading=$('.nebula-heading',el),distance=$('.nebula-distance',el);heading.style.transform=`translate3d(0,${reduced?0:(p-.4)*-32}px,0)`;distance.style.transform=`translate3d(0,${reduced?0:(p-.4)*-35}px,0)`;}
  const earthRect=this.earthVisual.getBoundingClientRect();if(earthRect.bottom>0&&earthRect.top<h){const p=clamp((h-earthRect.top)/(h+earthRect.height));this.earthVisual.style.transform=`translate3d(${reduced?0:Math.sin(p*Math.PI)*10}px,${reduced?0:(p-.5)*-28}px,0) scale(${reduced?1:1.03+Math.sin(p*Math.PI)*.04})`;}
  const seeingRect=this.seeingImage.getBoundingClientRect();if(seeingRect.bottom>0&&seeingRect.top<h){const p=clamp((h-seeingRect.top)/(h+seeingRect.height));this.seeingImage.style.transform=`scale(${reduced?1:1.04+p*.09}) translateY(${reduced?0:(p-.5)*40}px)`;}
  const matterRect=this.elements.getBoundingClientRect();if(matterRect.bottom>0&&matterRect.top<h)this.elements.style.transform=`translateY(${reduced?0:Math.sin(time*.5)*10}px)`;
  for(const scene of this.interludes){const r=scene.section.getBoundingClientRect();if(r.bottom<=0||r.top>=h)continue;const p=clamp(-r.top/Math.max(1,r.height-h)),enter=smooth(0,.19,p),exit=smooth(scene.kind==='distance'?.64:.49,scene.kind==='distance'?.84:.73,p);scene.section.dataset.progress=p.toFixed(3);scene.copy.style.opacity=String(reduced?1:enter*(1-exit));scene.copy.style.transform=`translate3d(0,${reduced?0:(1-enter)*60-exit*50}px,0) scale(${reduced?1:1.045-enter*.045+exit*.06})`;scene.copy.style.filter=`blur(${reduced?0:(1-enter)*5+exit*7}px)`;scene.field.render(time,p,this.velocity,reduced);scene.dust.render(time,smooth(scene.kind==='distance'?.66:.51,1,p),reduced);}
 }
}
