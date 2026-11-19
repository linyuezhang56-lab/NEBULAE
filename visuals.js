const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
function seeded(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function gauss(rand){return Math.sqrt(-2*Math.log(Math.max(.00001,rand())))*Math.cos(rand()*Math.PI*2);}
function prepare(canvas,maxDpr=1.4){const dpr=Math.min(devicePixelRatio||1,maxDpr),w=canvas.clientWidth,h=canvas.clientHeight;
 if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.getContext('2d').setTransform(dpr,0,0,dpr,0,0);}
 return {w,h,dpr};
}
const colors=['122,163,197','141,184,184','167,148,203','210,184,205','221,185,137','202,139,161'];
function starSprite(rgb){const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d');const g=x.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,`rgba(${rgb},.95)`);g.addColorStop(.1,`rgba(${rgb},.7)`);g.addColorStop(.32,`rgba(${rgb},.12)`);g.addColorStop(1,`rgba(${rgb},0)`);x.fillStyle=g;x.fillRect(0,0,32,32);return c;}
const sprites=colors.map(starSprite);

export class ParticleNebula{
 constructor(canvas,{small=false}={}){this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:true});this.small=small;this.points=[];this.last=-1;const rand=seeded(small?18:1927);const count=small?4200:(innerWidth<800?11500:20000);
  for(let i=0;i<count;i++){const u=gauss(rand)*1.12;const strand=Math.floor(rand()*5);const spread=.055+.15*Math.exp(-u*u*.55);const y=.24*Math.sin(u*1.6)+.08*Math.sin(u*3.5)+gauss(rand)*spread+(strand-2)*.035;const z=gauss(rand)*.21;const tone=clamp(Math.floor((u<-.6?4:0)+rand()*(u<-.6?2:4)),0,5);
   this.points.push({x:u,y,z,phase:rand()*6.28,s:.38+rand()*.96,tone,a:.32+rand()*.62,glow:rand()>.91});}
  this.groups=colors.map((_,i)=>this.points.filter(p=>p.tone===i));canvas.dataset.ready='particles';
 }
 render(time,mouse,reduced=false){
  if(reduced&&time===this.last&&this.cachedWidth===this.canvas.clientWidth)return;if(!reduced&&this.last>=0&&time-this.last<.032)return;this.last=time;this.cachedWidth=this.canvas.clientWidth;
  const {w,h}=prepare(this.canvas);const c=this.c;c.clearRect(0,0,w,h);
  const scale=this.small?Math.min(w*.32,h*.9):Math.min(w*.29,h*.56),cx=w*(this.small?.55:(this.centerX??.59)),cy=h*(this.small?.52:(this.centerY??.48));
  const scatter=reduced?0:(this.disperse||0);const rotation=(this.small?-.18:-.27)+(this.small?0:Math.sin(time*.085)*.055);const co=Math.cos(rotation),si=Math.sin(rotation);const angle=reduced?0:Math.sin(time*.052)*.17;
  c.globalCompositeOperation='lighter';
  const haze=c.createRadialGradient(cx,cy,0,cx,cy,scale*1.2);haze.addColorStop(0,'rgba(62,77,129,.065)');haze.addColorStop(.5,'rgba(74,55,110,.025)');haze.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=haze;c.fillRect(0,0,w,h);
  for(let g=0;g<this.groups.length;g++){c.fillStyle=`rgba(${colors[g]},${this.small?.35:.68})`;
   for(const p of this.groups[g]){
    const flow=reduced?0:time*.32;let x=p.x+Math.sin(flow+p.phase+p.x*.6)*.105;let y=p.y+Math.cos(flow*.83+p.x*2+p.phase)*.07;const z=p.z+Math.sin(flow*.6+p.x)*.075;
    y+=Math.sin(x*1.4+flow*.32)*.055;x+=z*Math.sin(angle);const perspective=1/(1+z*.16);const rx=x*co-y*si,ry=x*si+y*co;
    let sx=cx+rx*scale*perspective,sy=cy+ry*scale*perspective;
    if(scatter>0){const expansion=scatter*scatter;sx+=(Math.sin(p.phase)*310+(sx-cx)*.7)*expansion;sy+=(Math.cos(p.phase*1.7)*430-260)*expansion;}
    if(mouse&&!reduced){const dx=sx-mouse.x*w,dy=sy-mouse.y*h,dist=Math.hypot(dx,dy),push=Math.max(0,1-dist/160)*mouse.energy*34;sx+=dx/Math.max(1,dist)*push;sy+=dy/Math.max(1,dist)*push;}
    if(sx<0||sy<0||sx>w||sy>h)continue;
    const size=Math.max(.25,p.s*perspective*(this.small?.75:1));c.globalAlpha=p.a*(1-scatter*.94);
    if(p.glow&&!this.small){const d=size*13;c.drawImage(sprites[g],sx-d/2,sy-d/2,d,d);}else c.fillRect(sx,sy,size,size);
   }
  }
  c.globalAlpha=1;c.globalCompositeOperation='source-over';
 }
}

export class StarBackground{
 constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d');const rand=seeded(771);this.stars=Array.from({length:innerWidth<800?140:320},()=>({x:rand(),y:rand(),r:rand()*.65+.2,a:rand()*.4+.12,phase:rand()*6.28}));this.last=-1;canvas.dataset.ready='stars';}
 render(time,scroll=0,reduced=false){if(!reduced&&this.last>=0&&time-this.last<.05)return;this.last=time;const {w,h}=prepare(this.canvas,1.5),c=this.c;c.clearRect(0,0,w,h);for(const s of this.stars){const y=((s.y*h-scroll*.012)%h+h)%h;c.fillStyle=`rgba(198,211,232,${s.a*(reduced?1:.85+.15*Math.sin(time*.25+s.phase))})`;c.fillRect(s.x*w,y,s.r,s.r);}}
}

function planetTexture(gas=false){
 const size=gas?384:768,canvas=document.createElement('canvas');canvas.width=canvas.height=size;const c=canvas.getContext('2d'),image=c.createImageData(size,size),d=image.data;
 const light=[-.57,-.38,.73],random=seeded(924),grid=Float32Array.from({length:128*128},()=>random());
 const noise=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),at=(a,b)=>grid[((b%128+128)%128)*128+(a%128+128)%128];return mix(mix(at(ix,iy),at(ix+1,iy),u),mix(at(ix,iy+1),at(ix+1,iy+1),u),v);};
 const fbm=(x,y)=>noise(x,y)*.53+noise(x*2.03+12,y*2.03+18)*.27+noise(x*4.11+29,y*4.11+7)*.13+noise(x*8.19+41,y*8.19+35)*.07;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const nx=(x+.5-size/2)/(size*.485),ny=(y+.5-size/2)/(size*.485),r2=nx*nx+ny*ny;if(r2>=1)continue;
  const nz=Math.sqrt(1-r2),lon=Math.atan2(nx,nz),lat=Math.asin(ny),k=(y*size+x)*4;
  let red,green,blue;
  if(gas){const bands=Math.sin(lat*27+Math.sin(lon*3+lat*6)*.6),detail=Math.sin(lon*22+lat*58)*.5+.5;red=135+bands*35+detail*15;green=119+bands*26;blue=105+bands*13;}
  else{
   const warp=fbm(lon*2.3+18,lat*2.3+36),terrain=fbm(lon*2.5+warp*.8+45,lat*2.8+warp*.6+63),detail=noise(lon*38+75,lat*39+74);
   const coast=smooth(.49,.53,terrain),cloud=smooth(.52,.74,fbm(lon*9+lat*2.8+warp*1.5+8,lat*12+warp*2+32));
   red=mix(12,43+detail*15,coast);green=mix(46,70+detail*25,coast);blue=mix(81,69+detail*18,coast);red=mix(red,199,cloud*.78);green=mix(green,211,cloud*.78);blue=mix(blue,223,cloud*.78);
   const ice=smooth(1.22,1.48,Math.abs(lat));red=mix(red,194,ice);green=mix(green,212,ice);blue=mix(blue,226,ice);
  }
  const diffuse=Math.max(0,nx*light[0]+ny*light[1]+nz*light[2]),shade=.055+.945*Math.pow(diffuse,.8),rim=Math.pow(1-nz,4)*(.15+diffuse*.85);
  d[k]=red*shade+17*rim;d[k+1]=green*shade+50*rim;d[k+2]=blue*shade+89*rim;d[k+3]=Math.min(255,(1-Math.sqrt(r2))*size*190);
 }
 c.putImageData(image,0,0);return canvas;
}

export class UniverseRetreat{
 constructor(canvas){
  this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.last=-1;this.lastP=-1;this.progress=null;this.clock=0;this.planet=planetTexture();this.gasPlanet=planetTexture(true);
  const rand=seeded(3319),mobile=innerWidth<800;this.farStars=Array.from({length:mobile?550:1150},()=>({x:rand(),y:rand(),r:.5+rand()*.8,a:.3+rand()*.63,phase:rand()*6.28}));
  this.nebula=[];this.galaxy=[];this.web=[];
  for(let i=0;i<(mobile?9000:19000);i++){
   const x=gauss(rand)*31,strand=Math.floor(rand()*4),y=Math.sin(x*.095)*12+Math.sin(x*.21)*4+gauss(rand)*4+(strand-1.5)*2,z=gauss(rand)*7;
   this.nebula.push({x,y,z,s:.07+rand()*.16,a:.3+rand()*.6,tone:x< -18?4+Math.floor(rand()*2):Math.floor(rand()*4),phase:rand()*6.28,glow:rand()>.984});
  }
  for(let i=0;i<(mobile?7500:15000);i++){
   const r=Math.pow(rand(),.65)*55,arm=Math.floor(rand()*2),a=r*.12+arm*Math.PI+gauss(rand)*.26;
   this.galaxy.push({x:Math.cos(a)*r+gauss(rand)*1.2,y:Math.sin(a)*r*.46+gauss(rand)*.7,z:gauss(rand)*(.7+r*.022)+Math.sin(a)*r*.20,s:.08+rand()*.15,a:.3+rand()*.65,tone:r<10?4:Math.floor(rand()*4),phase:rand()*6.28,glow:rand()>.99});
  }
  for(let g=0;g<38;g++){
   const gx=(rand()-.5)*3500,gy=(rand()-.5)*2000,gz=-350-rand()*2700,rad=14+rand()*45,tilt=rand()*Math.PI;
   for(let i=0;i<(mobile?55:105);i++){const r=Math.pow(rand(),.65)*rad,a=r*.15+Math.floor(rand()*3)*2.094+gauss(rand)*.23,dx=Math.cos(a)*r,dy=Math.sin(a)*r*.4;
    this.galaxy.push({x:gx+dx*Math.cos(tilt)-dy*Math.sin(tilt),y:gy+dx*Math.sin(tilt)+dy*Math.cos(tilt),z:gz+gauss(rand)*2,s:.1+rand()*.19,a:.28+rand()*.5,tone:g%4===0?4:Math.floor(rand()*4),phase:rand()*6.28,glow:false});}
  }
  const nodes=Array.from({length:26},()=>({x:(rand()-.5)*6200,y:(rand()-.5)*3600,z:-600-rand()*4200}));
  nodes.forEach((node,i)=>{
   const near=nodes.filter((_,j)=>j!==i).sort((a,b)=>Math.hypot(a.x-node.x,a.y-node.y,a.z-node.z)-Math.hypot(b.x-node.x,b.y-node.y,b.z-node.z)).slice(0,2);
   near.forEach(other=>{for(let j=0;j<(mobile?45:80);j++){const t=rand(),spread=15+Math.sin(t*Math.PI)*38;this.web.push({x:mix(node.x,other.x,t)+gauss(rand)*spread,y:mix(node.y,other.y,t)+gauss(rand)*spread,z:mix(node.z,other.z,t)+gauss(rand)*spread,s:.15+rand()*.34,a:.1+rand()*.3,tone:i%5===0?4:1,phase:rand()*6.28,glow:false});}});
   for(let j=0;j<(mobile?15:25);j++)this.web.push({x:node.x+gauss(rand)*42,y:node.y+gauss(rand)*27,z:node.z+gauss(rand)*42,s:.18+rand()*.4,a:.3+rand()*.45,tone:4,phase:rand()*6.28,glow:false});
  });
  this.nebulaGroups=colors.map((_,i)=>this.nebula.filter(s=>s.tone===i));this.galaxyGroups=colors.map((_,i)=>this.galaxy.filter(s=>s.tone===i));this.webGroups=colors.map((_,i)=>this.web.filter(s=>s.tone===i));
  canvas.dataset.ready='planet-to-cosmos';
 }
 drawPoints(groups,camera,focal,w,h,fade,time,{turn=0,min=.45,max=2.4,nebula=false}={}){
  if(fade<.001)return;const c=this.c,co=Math.cos(turn),si=Math.sin(turn);c.globalCompositeOperation='lighter';
  for(let g=0;g<groups.length;g++){c.fillStyle=`rgb(${colors[g]})`;
   for(const s of groups[g]){
    const drift=nebula?Math.sin(time*.16+s.phase)*.8:0,wx=s.x*co-s.y*si,wy=s.x*si+s.y*co+drift,depth=camera-s.z;if(depth<.7)continue;
    const x=w*.5+wx*focal/depth,y=h*.53+wy*focal/depth;if(x< -5||y< -5||x>w+5||y>h+5)continue;
    const r=clamp(s.s*focal/depth,min,max);c.globalAlpha=s.a*fade;
    if(s.glow&&r>.85){const d=r*6;c.globalAlpha*=.25;c.drawImage(sprites[g],x-d*.5,y-d*.5,d,d);c.globalAlpha=s.a*fade;}
    c.fillRect(Math.round(x),Math.round(y),r,r);
   }
  }
  c.globalAlpha=1;c.globalCompositeOperation='source-over';
 }
 drawSystem(w,h,p,time,alpha){
  if(alpha<.001)return;const c=this.c,focal=Math.min(w,h)*.85,camera=70*Math.exp(p*24);
  const body=(texture,x,y,z,r,tilt=0,ring=false)=>{const depth=camera-z;if(depth<1)return;const sx=w*.5+x*focal/depth,sy=h*.53+y*focal/depth,size=r*focal/depth;if(size<.45)return;c.save();c.globalAlpha=alpha;c.translate(sx,sy);c.rotate(tilt);
   if(ring&&size>3){c.strokeStyle='rgba(184,174,162,.35)';c.lineWidth=Math.max(.6,size*.055);c.beginPath();c.ellipse(0,0,size*1.9,size*.5,0,0,Math.PI*2);c.stroke();}
   if(size>2){const atm=c.createRadialGradient(0,0,size*.92,0,0,size*1.09);atm.addColorStop(0,'rgba(46,99,161,0)');atm.addColorStop(.55,'rgba(61,124,188,.11)');atm.addColorStop(1,'rgba(23,67,130,0)');c.fillStyle=atm;c.fillRect(-size*1.1,-size*1.1,size*2.2,size*2.2);c.drawImage(texture,-size,-size,size*2,size*2);}else{c.fillStyle='#b5c7df';c.fillRect(0,0,1.1,1.1);}c.restore();};
  const sunDepth=camera+800,sunX=w*.5-330*focal/sunDepth,sunY=h*.53-110*focal/sunDepth,sunR=Math.max(.8,16*focal/sunDepth);
  c.globalAlpha=alpha;const glow=c.createRadialGradient(sunX,sunY,0,sunX,sunY,sunR*5);glow.addColorStop(0,'rgba(255,242,217,.8)');glow.addColorStop(.23,'rgba(226,202,169,.1)');glow.addColorStop(1,'rgba(226,202,169,0)');c.fillStyle=glow;c.fillRect(sunX-sunR*5,sunY-sunR*5,sunR*10,sunR*10);c.fillStyle='#f1dfc5';c.beginPath();c.arc(sunX,sunY,sunR,0,Math.PI*2);c.fill();
  body(this.gasPlanet,180,-80,-330,24,-.38,true);body(this.planet,3.2,0,40,7,-.22+time*.008);body(this.gasPlanet,-160,70,-520,9,.2);
  c.globalAlpha=1;
 }
 render(time,target,reduced=false){
  const now=performance.now(),dt=Math.min(70,now-this.clock||16);this.clock=now;this.progress=this.progress===null||reduced?target:mix(this.progress,target,1-Math.exp(-dt*.010));if(Math.abs(target-this.progress)<.00004)this.progress=target;
  const p=clamp(this.progress);if(!reduced&&this.last>=0&&time-this.last<.023&&Math.abs(p-this.lastP)<.0003)return;this.last=time;this.lastP=p;this.canvas.dataset.progress=p.toFixed(3);
  this.canvas.dataset.scale=p<.18?'planetary-system':p<.44?'nebula':p<.71?'galaxy':p<.96?'galaxies':'stars';
  const {w,h}=prepare(this.canvas,2),c=this.c;c.fillStyle='#030406';c.fillRect(0,0,w,h);
  for(const s of this.farStars){const fade=.2+.8*smooth(.30,.98,p),a=s.a*fade*(reduced?1:.9+.1*Math.sin(time*.35+s.phase)),drift=(1-p)*.035;c.fillStyle=`rgba(214,225,241,${a})`;c.fillRect(Math.round((s.x+(s.x-.5)*drift)*w),Math.round((s.y+(s.y-.5)*drift)*h),s.r,s.r);}
  const focal=Math.min(w,h)*.82,nebulaCamera=18*Math.exp((p-.2)*13),galaxyCamera=14*Math.exp((p-.43)*12);
  this.drawPoints(this.webGroups,galaxyCamera,focal,w,h,smooth(.69,.83,p)*(1-smooth(.92,.99,p)),time,{min:.45,max:1.6});
  this.drawPoints(this.galaxyGroups,galaxyCamera,focal,w,h,smooth(.38,.51,p)*(1-smooth(.90,.985,p)),time,{turn:.11+(reduced?0:time*.003),min:.35,max:1.15});
  this.drawPoints(this.nebulaGroups,nebulaCamera,focal,w,h,smooth(.10,.24,p)*(1-smooth(.40,.54,p)),time,{turn:-.22,min:.35,max:1.15,nebula:true});
  this.drawSystem(w,h,p,time,1-smooth(.17,.27,p));
 }
}

export class EarthGlobe{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.last=-100;this.ready=false;this.image=new Image();this.image.onload=()=>this.prepare();this.image.src='assets/earth.jpg';}
 prepare(){
  const size=480,tw=1024,th=512;this.canvas.width=this.canvas.height=size;this.size=size;this.tw=tw;
  const buffer=document.createElement('canvas');buffer.width=tw;buffer.height=th;const bc=buffer.getContext('2d',{willReadFrequently:true});bc.drawImage(this.image,0,0,tw,th);this.texture=bc.getImageData(0,0,tw,th).data;
  const output=this.ctx.createImageData(size,size),longitude=new Float32Array(size*size),latitude=new Uint16Array(size*size),shades=new Float32Array(size*size),rims=new Float32Array(size*size),indices=[];
  const radius=.8,tilt=-.31,co=Math.cos(tilt),si=Math.sin(tilt),len=Math.hypot(-.65,.35,1),lx=-.65/len,ly=.35/len,lz=1/len;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const k=y*size+x,px=(x/(size-1)-.5)*2,py=(.5-y/(size-1))*2,r=Math.hypot(px,py),o=k*4;
   if(r>=radius){const a=Math.exp(-Math.max(0,r-radius)*34)*40*clamp((1-r)/.2);output.data[o]=38;output.data[o+1]=86;output.data[o+2]=150;output.data[o+3]=a;continue;}
   const nx=px/radius,ny=py/radius,nz=Math.sqrt(1-r*r/(radius*radius)),nrx=co*nx-si*ny,nry=si*nx+co*ny;longitude[k]=Math.atan2(nz,nrx)/(Math.PI*2)+.5;latitude[k]=Math.round((.5-Math.asin(clamp(nry,-1,1))/Math.PI)*(th-1));
   const diffuse=Math.max(0,nx*lx+ny*ly+nz*lz);shades[k]=.06+.94*Math.pow(diffuse,.9);rims[k]=Math.pow(1-nz,3)*(.2+.8*diffuse);output.data[o+3]=Math.min(255,(radius-r)*size*255);indices.push(k);
  }
  Object.assign(this,{output,longitude,latitude,shades,rims,indices,ready:true});this.canvas.dataset.ready='earth-sphere';
 }
 render(time){if(!this.ready||Math.abs(time-this.last)<.08)return;this.last=time;const {output,texture,indices,longitude,latitude,shades,rims,tw}=this;const rot=time*.035/(Math.PI*2);
  for(const k of indices){const tx=Math.floor((((longitude[k]+rot)%1+1)%1)*(tw-1)),q=(latitude[k]*tw+tx)*4,o=k*4,s=shades[k],f=rims[k];output.data[o]=texture[q]*s+15*f;output.data[o+1]=texture[q+1]*s+48*f;output.data[o+2]=texture[q+2]*s+97*f;}
  this.ctx.putImageData(output,0,0);
 }
}
