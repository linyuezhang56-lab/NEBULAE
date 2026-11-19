import {nebulae} from './data.js';
import {ParticleNebula,UniverseRetreat,StarBackground,EarthGlobe} from './visuals.js?v=5';
import {ColorObservatory,AmbientColorDust} from './color-field.js?v=5';
import {SpatialJourney} from './spatial.js?v=6';
import {ScrollCinema} from './motion.js?v=6';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const asset=(id,size='scene')=>`assets/${id}-${size}.webp`;
let sources={};
const sourcesPromise=fetch('sources.json').then(r=>{if(!r.ok)throw new Error('Sources unavailable');return r.json();});
$('#nebula-list').innerHTML=nebulae.map((n,i)=>`<article class="nebula nebula--${n.layout}" id="nebula-${i}" aria-labelledby="nebula-name-${i}"><header class="nebula-heading"><div class="nebula-name"><h2 id="nebula-name-${i}">${n.name}</h2><p class="english" lang="en">${n.english}</p></div><p class="nebula-distance">距地球约 <span class="english">${n.distance}</span> 光年</p></header><figure class="nebula-visual"><div class="image-atmosphere"><img src="${asset(n.id)}" srcset="${asset(n.id,'small')} 1000w,${asset(n.id)} 2400w" sizes="100vw" loading="lazy" alt="${n.name}的${n.band}观测影像"></div><figcaption class="photo-caption">${n.band}${n.id==='horse'?' · 马鬃局部':n.id==='trifid_close'?' · 局部特写':''}</figcaption></figure><div class="nebula-info"><div class="nebula-summary"><p class="type">${n.type}</p><p>${n.description}</p></div><dl class="nebula-composition"><dt>物质</dt><dd>${n.materials}</dd><dt>颜色</dt><dd>${n.color}</dd></dl><div class="nebula-actions"><button class="gallery-open" data-gallery="${i}" aria-label="观看${n.name}图集">观看图集</button><p class="photo-credit" data-credit="${n.id}"></p></div></div></article>`).join('');
$('#atlas-list').innerHTML=nebulae.map((n,i)=>`<button class="atlas-item" data-gallery="${i}" aria-label="打开${n.name}图集"><img src="${asset(n.id,'small')}" loading="lazy" alt="${n.name}"><h3>${n.name}</h3><p>距地球约 ${n.distance} 光年</p></button>`).join('');
const usedIds=new Set(['earth','orion_spitzer',...nebulae.flatMap(n=>[n.id,n.secondary,n.third].filter(Boolean))]);
sourcesPromise.then(data=>{sources=data;$$('[data-credit]').forEach(el=>{const s=data[el.dataset.credit];if(s){const a=document.createElement('a');a.href=s.source_page;a.target='_blank';a.rel='noopener';a.textContent=s.credit;el.replaceChildren(a);}});$('#source-image-list').innerHTML=Object.values(data).filter(s=>usedIds.has(s.id)).map(s=>`<article class="source-image-entry"><h4>${s.name}</h4><p>${s.credit}</p><a href="${s.source_page}" target="_blank" rel="noopener">原始发布与配色说明</a></article>`).join('');}).catch(()=>{$('#source-image-list').textContent='来源资料暂时未加载，请刷新重试。';});
let focusBeforeModal=null,currentGallery=0;
function openModal(id){const active=$('dialog[open]');if(!active)focusBeforeModal=document.activeElement;if(active)active.close();document.body.classList.add('modal-open');const d=$('#'+id);d.showModal();d.scrollTop=0;}
function closeModal(id){$('#'+id).close();if(!$('dialog[open]')){document.body.classList.remove('modal-open');focusBeforeModal?.focus({preventScroll:true});}}
$$('dialog').forEach(d=>d.addEventListener('close',()=>{if(!$('dialog[open]'))document.body.classList.remove('modal-open');}));
function credit(id){const s=sources[id];return s?`${s.credit}<a href="${s.source_page}" target="_blank" rel="noopener">原始发布与配色图例</a>`:'';}
function figure(id,title,copy,secondary=false){return `<figure class="gallery-figure${secondary?' gallery-secondary':''}"><img src="${asset(id,'large')}" alt="${title}" loading="lazy"><figcaption><h3>${title}</h3><p>${copy}</p><p class="credit">${credit(id)}</p></figcaption></figure>`;}
async function openGallery(index){currentGallery=(index+nebulae.length)%nebulae.length;const n=nebulae[currentGallery];if(!Object.keys(sources).length){try{sources=await sourcesPromise;}catch{}}
 $('#gallery-content').innerHTML=`<div class="gallery-header"><p class="gallery-metadata">${n.band} · 距地球约 ${n.distance} 光年</p><h2>${n.name}</h2><p class="english" lang="en">${n.english}</p><p class="gallery-introduction">${n.story}</p></div>${figure(n.id,'完整影像',n.id==='horse'?'这幅取景为马头星云的马鬃局部。':n.id==='trifid_close'?'哈勃2026年发布的三裂星云局部特写。':n.id==='pillars'?'创生之柱是鹰状星云的一部分。本图合成近红外与中红外观测。':'保留本次发布影像的完整取景。')}<div class="gallery-details"><h3>物质与颜色</h3><dl><dt>物质</dt><dd>${n.materials}</dd><dt>颜色</dt><dd>${n.color}</dd><dt>类型</dt><dd>${n.type}</dd>${n.storyLink?`<dt>两次观测</dt><dd><a href="${n.storyLink}" target="_blank" rel="noopener">1997 / 2026 · 官方影像比较</a></dd>`:''}</dl></div>${figure(n.secondary,n.secondaryTitle,n.secondaryCopy,true)}${n.third?figure(n.third,n.thirdTitle,n.thirdCopy):''}<div class="gallery-ending"><button data-next-gallery>下一个星云</button></div>`;
 if($('#gallery').open)$('#gallery').scrollTop=0;else openModal('gallery');
}
document.addEventListener('click',e=>{const g=e.target.closest('[data-gallery]');if(g){openGallery(Number(g.dataset.gallery));return;}const c=e.target.closest('[data-close-dialog]');if(c){closeModal(c.dataset.closeDialog);return;}if(e.target.closest('[data-open-atlas]'))openModal('atlas');if(e.target.closest('[data-open-sources]'))openModal('sources');if(e.target.closest('[data-next-gallery]')||e.target.closest('#gallery-next'))openGallery(currentGallery+1);});
let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const motionButton=$('#motion-toggle');function setMotion(){document.body.classList.toggle('reduced-motion',reduced);motionButton.textContent='动态效果：'+(reduced?'关':'开');motionButton.setAttribute('aria-pressed',String(reduced));}setMotion();motionButton.addEventListener('click',()=>{reduced=!reduced;setMotion();});
const mouse={x:.5,y:.5,energy:0};addEventListener('pointermove',e=>{mouse.x=e.clientX/innerWidth;mouse.y=e.clientY/innerHeight;mouse.energy=1;},{passive:true});
const cover=new ParticleNebula($('#nebula-cover')),matter=new ParticleNebula($('#matter-cloud'),{small:true}),earth=new EarthGlobe($('#earth-canvas')),universe=new UniverseRetreat($('#universe-canvas')),stars=new StarBackground($('#star-background'));
const views={home:$('#home'),matter:$('.matter-visual'),earth:$('#earth'),universe:$('#universe')};const onScreen=new Set();
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{const key=Object.keys(views).find(k=>views[k]===e.target);if(key)e.isIntersecting?onScreen.add(key):onScreen.delete(key);}),{rootMargin:'150px'});Object.values(views).forEach(el=>observer.observe(el));
const cinema=new ScrollCinema({cover,mouse});
const spatial=new SpatialJourney({mouse});
const colorObservatory=new ColorObservatory($('#colors'));
const ambientColorDust=new AmbientColorDust();
const cycle=new ParticleNebula($('#cycle-cloud'));cycle.centerX=.59;cycle.centerY=.49;
const retreatCaptions=$$('[data-retreat-caption]');
let last=0,lastPhoto=0;
function frame(now){requestAnimationFrame(frame);if(document.hidden||$('dialog[open]'))return;const dt=Math.min(60,now-last||16);last=now;mouse.energy*=Math.exp(-dt*.0007);const time=reduced?0:now*.001;
 stars.render(time,scrollY,reduced);
 cinema.update(time,dt,reduced);
 spatial.update(time,dt,reduced);
 colorObservatory.render(time,dt,reduced);
 ambientColorDust.render(time,reduced,colorObservatory.selected);
 const cycleRect=$('#return-to-light').getBoundingClientRect();if(cycleRect.top<innerHeight&&cycleRect.bottom>0){const arrival=clamp((innerHeight-cycleRect.top)/(innerHeight+cycleRect.height));cycle.disperse=reduced?0:1-smooth(0,.42,arrival);cycle.render(time,mouse,reduced);const reveal=reduced?1:smooth(.06,.38,arrival);$('.cycle-copy').style.opacity=String(reveal);$('.cycle-copy').style.transform=`translateY(${(1-reveal)*30}px)`;}
 if(onScreen.has('home'))cover.render(time,mouse,reduced);
 if(onScreen.has('matter'))matter.render(time,null,reduced);
 if(onScreen.has('earth'))earth.render(time);
 if(onScreen.has('universe')){const r=views.universe.getBoundingClientRect();const p=clamp(-r.top/Math.max(1,r.height-innerHeight));universe.render(time,p,reduced);const q=universe.progress??p;const ranges=[[0,.035,.10,.16],[.23,.28,.38,.44],[.46,.51,.61,.67],[.70,.75,.84,.90]];retreatCaptions.forEach((caption,i)=>{const [a,b,c,d]=ranges[i],opacity=(i===0?1:smooth(a,b,q))*(1-smooth(c,d,q));caption.style.opacity=String(opacity);caption.style.transform=`translateY(${(1-opacity)*14}px)`;});$('#star-background').style.opacity='0';}else $('#star-background').style.opacity='.6';

}
requestAnimationFrame(frame);
