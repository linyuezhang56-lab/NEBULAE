const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
function random(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function gauss(rnd){return Math.sqrt(-2*Math.log(Math.max(.00001,rnd())))*Math.cos(rnd()*Math.PI*2);}
function sizeCanvas(canvas,maxDpr=1.7){const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,maxDpr);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.getContext('2d').setTransform(dpr,0,0,dpr,0,0);}return {w,h};}
export const colorStories=[
 {id:'rose',en:'ROSE',zh:'玫瑰粉',heading:'受激发的气体，在发光。',copy:'在可见光发射星云中，受激发的氢气会发出红色的 Hα 光。它与其他信号共同构成影像中常见的红与粉。',palette:[[230,116,160],[186,99,156],[239,173,147],[158,140,190],[238,214,224]]},
 {id:'blue',en:'BLUE',zh:'雾蓝',heading:'尘埃，散射恒星的光。',copy:'反射星云中的尘埃更容易散射蓝色星光，云气因此常呈蓝色。在红外影像中，蓝色也可以用来显示某一个观测波段。',palette:[[115,170,225],[155,139,222],[129,204,204],[193,175,222],[220,225,235]]},
 {id:'teal',en:'TEAL',zh:'青碧',heading:'氧，也留下自己的光。',copy:'双电离氧在蓝绿波段有强发射线。观测团队也会把氧的信号映射为蓝色等颜色，让不同气体的结构更容易区分。',palette:[[96,194,178],[123,176,193],[189,201,144],[161,145,202],[219,226,208]]},
 {id:'amber',en:'AMBER',zh:'琥珀',heading:'红外信号，成为金色。',copy:'在一些红外影像中，尘埃与含碳分子的信号被赋予金色、橙色。云壁、细丝与尘埃中的层次因此浮现。',palette:[[236,177,105],[220,139,120],[203,149,178],[161,183,164],[236,218,182]]},
 {id:'violet',en:'VIOLET',zh:'紫罗兰',heading:'几种光，在同一处相遇。',copy:'在多波段合成图中，被映射为红与蓝的信号在同一区域叠加，可以形成紫色。混合色让不同信号的重叠关系显现。',palette:[[170,123,220],[203,126,181],[122,168,212],[220,173,174],[224,212,234]]},
 {id:'pearl',en:'PEARL',zh:'珠白',heading:'许多波段，汇成亮光。',copy:'恒星的连续光覆盖许多可见波段，叠加后可接近白色。在发布影像中，多个波段的强信号汇合，也会形成明亮的白色区域。',palette:[[215,212,207],[169,194,207],[207,174,183],[193,190,151],[237,231,217]]}
];
function sprite(rgb){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,`rgba(${rgb.join(',')},.58)`);r.addColorStop(.18,`rgba(${rgb.join(',')},.28)`);r.addColorStop(.5,`rgba(${rgb.join(',')},.085)`);r.addColorStop(1,`rgba(${rgb.join(',')},0)`);g.fillStyle=r;g.fillRect(0,0,64,64);return c;}
class CloudBody{
 constructor(index){this.index=index;this.scale=1;this.alpha=1;this.burst=0;this.palette=colorStories[index].palette;this.sprites=this.palette.map(sprite);this.points=[];const rnd=random(937+index*1761),count=innerWidth<700?3000:5100;
  for(let i=0;i<count;i++){
   const a=rnd()*Math.PI*2,b=rnd()*Math.PI*2;let x,y,z;
   if(index===0){const r=.61+gauss(rnd)*.13,tube=.20*Math.cos(b);x=(r+tube)*Math.cos(a)*.88;y=(r+tube)*Math.sin(a)*1.06;z=Math.sin(b)*.28+gauss(rnd)*.10;}
   if(index===1){y=gauss(rnd)*.55;x=Math.sin(y*3.1)*.26+gauss(rnd)*.23;z=gauss(rnd)*.26;if(rnd()>.76)x+=Math.cos(y*3)*.33;}
   if(index===2){const angle=(.12+rnd()*.81)*Math.PI*2,r=.69+gauss(rnd)*.13;x=Math.cos(angle)*r*.83;y=Math.sin(angle)*r;z=gauss(rnd)*.24;x+=Math.sin(y*3)*.12;}
   if(index===3){y=gauss(rnd)*.50;const r=.31+Math.sin(y*4)*.15+gauss(rnd)*.1;x=Math.cos(a)*r+Math.sin(y*3)*.24;z=Math.sin(a)*r*.8;}
   if(index===4){const lobe=rnd()>.5?1:-1;x=gauss(rnd)*.23+lobe*.32;y=gauss(rnd)*.43+Math.sin(x*4)*.22;z=gauss(rnd)*.23;}
   if(index===5){const r=gauss(rnd)*.30;x=Math.cos(a)*r;y=Math.sin(a)*r*1.12;z=gauss(rnd)*.27;if(rnd()>.74){x=Math.cos(a)*(.68+gauss(rnd)*.08);y=Math.sin(a)*.40;z=Math.sin(a*2)*.20;}}
   const halo=rnd()>.76;if(halo){x+=gauss(rnd)*.25;y+=gauss(rnd)*.26;z+=gauss(rnd)*.18;}
   const radial=Math.hypot(x,y),tone=rnd()>.94?4:(()=>{const v=rnd();return v<.46?0:v<.73?1:v<.90?2:3;})();
   this.points.push({x,y,z,phase:rnd()*6.28,s:.48+rnd()*.75,a:(halo?.25:.48)+rnd()*(halo?.3:.44),tone,radial,glow:rnd()>.989});
  }
  this.patches=this.points.filter((p,i)=>i%70===0&&p.radial<1);this.points.sort((a,b)=>a.z-b.z);this.groups=this.palette.map((_,i)=>this.points.filter(p=>p.tone===i));
 }
 draw(ctx,cx,cy,base,time,active,muted,reduced,dt){
  this.scale=mix(this.scale,active?1.085:1,reduced?1:1-Math.exp(-dt*.009));this.alpha=mix(this.alpha,muted?.55:1,reduced?1:1-Math.exp(-dt*.009));this.burst*=Math.exp(-dt*.0028);
  const t=reduced?this.index:time,theta=t*.15+this.index*.78,co=Math.cos(theta),si=Math.sin(theta),tilt=(this.index-2)*.12+Math.sin(t*.09+this.index)*.11,ct=Math.cos(tilt),st=Math.sin(tilt),scale=base*this.scale*1.10;
  ctx.globalCompositeOperation='lighter';
  for(let i=0;i<3;i++){const a=i*2.1+t*.12+this.index,x=cx+Math.cos(a)*scale*.23,y=cy+Math.sin(a)*scale*.27,d=scale*(1.8+i*.18);ctx.globalAlpha=this.alpha*(.22+(active?.045:0));ctx.drawImage(this.sprites[i],x-d*.5,y-d*.5,d,d);}
  for(const p of this.patches){const x=p.x+Math.sin(t*.23+p.phase+p.y)*.035,y=p.y+Math.sin(t*.21+p.phase)*.035,z=p.z,rx=x*co+z*si,rz=z*co-x*si,k=1/(1+rz*.16),sx=cx+(rx*ct-y*st)*scale*k,sy=cy+(rx*st+y*ct)*scale*k,d=scale*(.38+.14*Math.sin(p.phase));ctx.globalAlpha=this.alpha*.20;ctx.drawImage(this.sprites[p.tone===4?0:p.tone],sx-d*.5,sy-d*.5,d,d);}
  for(let g=0;g<this.groups.length;g++){ctx.fillStyle=`rgb(${this.palette[g].join(',')})`;
   for(const p of this.groups[g]){
    const flow=Math.sin(t*.23+p.phase+p.y*1.2)*.045,x=p.x+flow,z=p.z+Math.cos(t*.17+p.phase)*.035,y=p.y+Math.sin(t*.21+p.phase+p.x)*.035;
    const rx=x*co+z*si,rz=z*co-x*si,perspective=1/(1+rz*.16),warp=1+this.burst*.055;const sx=cx+(rx*ct-y*st)*scale*perspective*warp,sy=cy+(rx*st+y*ct)*scale*perspective*warp;
    const alpha=p.a*this.alpha*(.88+.12*Math.sin(t*.6+p.phase));ctx.globalAlpha=alpha;
    const size=p.s*perspective*(active?1.025:1);if(p.glow){const d=5+size*3;ctx.globalAlpha=alpha*.65;ctx.drawImage(this.sprites[g],sx-d*.5,sy-d*.5,d,d);ctx.globalAlpha=alpha*.8;}
    ctx.fillRect(sx,sy,size,size);
   }
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 }
}
export class ColorObservatory{
 constructor(section){
  this.section=section;this.canvas=$('#color-clouds',section);this.ctx=this.canvas.getContext('2d');this.selected=-1;this.hovered=-1;this.last=-1;this.rects=[];this.geometryKey='';
  $('#color-cloud-grid',section).innerHTML=colorStories.map((s,i)=>`<button class="color-cloud" type="button" data-color="${s.id}" aria-label="探索${s.zh}：${s.heading}" aria-pressed="false" aria-controls="color-explanation" style="--cloud-tint:rgb(${s.palette[0].join(',')})"><span class="cloud-space" aria-hidden="true"></span><span class="cloud-label"><span class="english" lang="en">${s.en}</span><span class="cloud-chinese">${s.zh}</span></span></button>`).join('');
  this.buttons=$$('.color-cloud',section);this.clouds=colorStories.map((_,i)=>new CloudBody(i));
  this.buttons.forEach((button,i)=>{
   button.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){this.hovered=i;this.section.dataset.hovered=colorStories[i].id;}});
   button.addEventListener('pointerleave',()=>{this.hovered=-1;delete this.section.dataset.hovered;});
   button.addEventListener('focus',()=>{if(button.matches(':focus-visible'))this.hovered=i;});button.addEventListener('blur',()=>{this.hovered=-1;});button.addEventListener('click',()=>this.select(i));
  });
  new ResizeObserver(()=>{this.geometryKey='';}).observe(this.canvas);this.canvas.dataset.ready='six-flowing-color-clouds';
 }
 select(index){this.selected=index;this.clouds[index].burst=1;const s=colorStories[index];this.section.dataset.selected=s.id;
  this.buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));const inner=$('.color-explanation-inner',this.section);inner.style.setProperty('--explanation-tint',`rgb(${s.palette[0].join(',')})`);inner.innerHTML=`<h3>${s.heading}</h3><p>${s.copy}</p>`;
  if(!document.body.classList.contains('reduced-motion'))inner.animate([{opacity:.1,transform:'translateY(9px)',filter:'blur(3px)'},{opacity:1,transform:'translateY(0)',filter:'blur(0)'}],{duration:650,easing:'cubic-bezier(.2,.7,.3,1)',fill:'both'});
 }
 render(time,dt,reduced){
  const sr=this.section.getBoundingClientRect();if(sr.top>=innerHeight||sr.bottom<=0)return;if(!reduced&&this.last>=0&&time-this.last<.035)return;this.last=time;const {w,h}=sizeCanvas(this.canvas),key=`${w}:${h}:${innerWidth}`;
  if(key!==this.geometryKey){this.geometryKey=key;const cr=this.canvas.getBoundingClientRect();this.rects=this.buttons.map(button=>{const r=$('.cloud-space',button).getBoundingClientRect();return {x:r.left-cr.left+r.width*.5,y:r.top-cr.top+r.height*.5,base:Math.min(r.width*.32,r.height*.57)};});}
  this.ctx.clearRect(0,0,w,h);const entrance=smooth(innerHeight,innerHeight*.3,sr.top),parallax=reduced?0:clamp((innerHeight*.5-sr.top-sr.height*.5)*.055,-18,18);
  this.clouds.forEach((cloud,i)=>{const r=this.rects[i];if(!r)return;const drift=reduced?0:Math.sin(time*.21+i*1.6)*3.5,active=this.hovered===i||this.selected===i,muted=this.hovered>=0&&this.hovered!==i;cloud.draw(this.ctx,r.x,r.y+drift+parallax,r.base*(.94+.06*entrance),time,active,muted,reduced,dt);});
 }
}
export class AmbientColorDust{
 constructor(){this.canvas=document.createElement('canvas');this.canvas.className='ambient-color-dust';this.canvas.setAttribute('aria-hidden','true');document.body.insertBefore(this.canvas,document.querySelector('main'));this.ctx=this.canvas.getContext('2d');this.sections=$$('.introduction,.earth-section,.seeing,.journey-heading');const rnd=random(4587);this.points=Array.from({length:innerWidth<700?850:1700},()=>({x:gauss(rnd)*.28,y:gauss(rnd)*.28,z:rnd(),phase:rnd()*6.28,a:.08+rnd()*.19,size:.25+rnd()*.65}));this.sprites=[sprite([140,156,200]),sprite([199,143,158]),sprite([197,174,125])];this.last=-1;}
 render(time,reduced,selected){if(!reduced&&this.last>=0&&time-this.last<.065)return;this.last=time;let visible=0;this.sections.forEach(s=>{const r=s.getBoundingClientRect(),overlap=Math.max(0,Math.min(innerHeight,r.bottom)-Math.max(0,r.top));visible=Math.max(visible,overlap/innerHeight);});const {w,h}=sizeCanvas(this.canvas,1.3),c=this.ctx;c.clearRect(0,0,w,h);if(visible<=.001)return;
  const t=reduced?0:time,palette=colorStories[Math.max(0,selected)].palette;c.globalCompositeOperation='lighter';
  for(let side=0;side<2;side++){const cx=side?w*.96:w*.025,cy=h*(side?.30:.70),scale=Math.min(w,h)*.8;c.globalAlpha=visible*.09;const d=scale*1.2;c.drawImage(this.sprites[side],cx-d*.5,cy-d*.5,d,d);c.fillStyle=`rgb(${(side?palette[2]:palette[0]).join(',')})`;
   for(const p of this.points){const angle=t*.025+side*2.8,x=p.x*Math.cos(angle)-p.y*Math.sin(angle),y=p.x*Math.sin(angle)+p.y*Math.cos(angle);c.globalAlpha=p.a*visible*.42;const sx=cx+(x+Math.sin(t*.10+p.phase)*.025)*scale,sy=cy+y*scale+Math.sin(t*.12+p.phase)*7;if(sx<0||sx>w||sy<0||sy>h)continue;c.fillRect(sx,sy,p.size,p.size);}
  }c.globalAlpha=1;c.globalCompositeOperation='source-over';
 }
}
