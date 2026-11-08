import {DURATION,treeWeights,treeScale,seedOpacity,townProgress,poseOpacity,sampleTimes} from '/grow-create-preview/assets/6d03c4a23b-hero-motion.mjs';

const root=document.querySelector('.hero--story');
if(root){
 const html=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)'),animations=[];
 let finished=false,lastWidth=0;
 function sizeScene(){
  const width=Math.round(root.getBoundingClientRect().width);
  if(!width||width===lastWidth)return;
  lastWidth=width;
  root.style.setProperty('--growth-art-size',`${Math.min(width,520)}px`);
  root.style.setProperty('--hero-town-height',`${Math.round(width*680/2172)}px`);
 }
 sizeScene();
 window.addEventListener('resize',sizeScene,{passive:true});
 const finish=(mode='still')=>{
  finished=true;clearTimeout(window.__growStoryFallback29);html.dataset.heroStory=mode;
  if(mode==='complete'){
   root.querySelectorAll('[data-tree-stage]:not([data-tree-stage="mature"]),[data-paper-pose]:not([data-paper-pose="resting"]),.hero-seed').forEach(el=>el.setAttribute('hidden',''));
   return; // Retain the exact final layer instead of cancelling and rerasterizing it.
  }
  animations.forEach(a=>a.cancel());
 };
 reduced.addEventListener('change',event=>{if(event.matches)finish();});
 window.addEventListener('pageshow',event=>{if(event.persisted)finish();});
 async function start(){
  if(html.hasAttribute('data-hero-still')||reduced.matches||html.dataset.heroStory!=='pending')return finish();
  try{
   const urls=[...new Set([...root.querySelectorAll('img,image')].map(img=>img.getAttribute('src')||img.getAttribute('href')))];
   await Promise.all(urls.map(url=>new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=reject;img.src=url;if(img.decode)img.decode().then(resolve,reject);})));
   if(finished||html.dataset.heroStory!=='pending')return;
   clearTimeout(window.__growStoryFallback29);
   const times=sampleTimes(),clock=document.timeline.currentTime;
   const play=(element,frames,options={})=>{const a=element.animate(frames,{duration:DURATION,fill:'both',easing:'linear',...options});if(Number.isFinite(clock))a.startTime=clock;animations.push(a);};
   root.querySelectorAll('[data-paper-pose]').forEach(pose=>play(pose,times.map(t=>({offset:t/DURATION,opacity:poseOpacity(pose.dataset.paperPose,t)}))));
   root.querySelectorAll('[data-tree-stage]').forEach((tree,i)=>play(tree,times.map(t=>({offset:t/DURATION,opacity:treeWeights(t)[i],transform:`translate3d(0,0,0) scale(${treeScale(i,t)})`}))));
   play(root.querySelector('.hero-seed'),times.map(t=>({offset:t/DURATION,opacity:seedOpacity(t)})));
   play(root.querySelector('.hero-panorama'),times.map(t=>{const inset=(1-townProgress(t))*50;return{offset:t/DURATION,clipPath:`inset(0 ${inset}% 0 ${inset}%)`};}));
   root.querySelectorAll('.hero-char').forEach(character=>{const delay=parseFloat(character.style.getPropertyValue('--char-delay'))||0;play(character,[{opacity:0},{opacity:1}],{duration:290,delay,easing:'cubic-bezier(.2,.65,.3,1)'});});
   html.dataset.heroStoryStarted=String(Date.now());html.dataset.heroStoryDuration=String(DURATION);html.dataset.heroStory='playing';
   if(html.hasAttribute('data-hero-review-ms')){const time=Number(html.dataset.heroReviewMs);animations.forEach(a=>{a.pause();a.currentTime=time;});html.dataset.heroStory='review';return;}
   if(html.hasAttribute('data-hero-frame-metrics')){
    const gaps=[],boxes=[];let last=performance.now(),frames=0;
    const measure=now=>{
     gaps.push(now-last);last=now;
     if(frames++%8===0){const box=root.querySelector('.hero-art').getBoundingClientRect();boxes.push({width:box.width,left:box.left,top:box.top+scrollY});}
     if(!finished)requestAnimationFrame(measure);else{
      gaps.sort((a,b)=>a-b);const out=document.createElement('output');out.id='hero-frame-metrics';out.hidden=true;
      out.textContent=JSON.stringify({frames:gaps.length,p95:gaps[Math.floor(gaps.length*.95)],over50:gaps.filter(g=>g>50).length,widthRange:[Math.min(...boxes.map(b=>b.width)),Math.max(...boxes.map(b=>b.width))],topRange:[Math.min(...boxes.map(b=>b.top)),Math.max(...boxes.map(b=>b.top))]});document.body.append(out);
     }
    };requestAnimationFrame(measure);
   }
   Promise.all(animations.map(a=>a.finished)).then(()=>{if(!finished)finish('complete');}).catch(()=>{});
  }catch{html.dataset.heroStoryError='asset';finish();}
 }
 start();
}
