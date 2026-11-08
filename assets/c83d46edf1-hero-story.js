import {DURATION,TREE_HEIGHTS,treeHeight,treeWeights,seedOpacity,townProgress,poseOpacity,pouringOpacity,sampleTimes} from '/grow-create-preview/assets/08f34cb123-hero-motion.mjs';

const root=document.querySelector('.hero--story');
if(root){
 const html=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)'),animations=[];
 let finished=false;
 const finish=(mode='still')=>{finished=true;clearTimeout(window.__growStoryFallback27);html.dataset.heroStory=mode;animations.forEach(a=>a.cancel());};
 reduced.addEventListener('change',event=>{if(event.matches)finish();});
 window.addEventListener('pageshow',event=>{if(event.persisted)finish();});
 async function start(){
  if(html.hasAttribute('data-hero-still')||reduced.matches||html.dataset.heroStory!=='pending')return finish();
  try{
   const urls=[...new Set([...root.querySelectorAll('image')].map(image=>image.getAttribute('href')))];
   await Promise.all(urls.map(url=>new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=reject;image.src=url;if(image.decode)image.decode().then(resolve,reject);})));
   if(finished||html.dataset.heroStory!=='pending')return;
   clearTimeout(window.__growStoryFallback27);
   const times=sampleTimes(),clock=document.timeline.currentTime;
   const play=(element,frames,options={})=>{const a=element.animate(frames,{duration:DURATION,fill:'both',easing:'linear',...options});if(Number.isFinite(clock))a.startTime=clock;animations.push(a);};
   root.querySelectorAll('[data-paper-pose]').forEach(pose=>play(pose,times.map(t=>({offset:t/DURATION,opacity:poseOpacity(pose.dataset.paperPose,t)}))));
   root.querySelectorAll('[data-tree-stage]').forEach((tree,i)=>play(tree,times.map(t=>({offset:t/DURATION,opacity:treeWeights(t)[i],transform:`scale(${Math.max(.00001,treeHeight(t)/TREE_HEIGHTS[i])})`}))));
   play(root.querySelector('.hero-seed'),times.map(t=>({offset:t/DURATION,opacity:seedOpacity(t)})));
   play(root.querySelector('.hero-water'),times.map(t=>({offset:t/DURATION,opacity:pouringOpacity(t)})));
   play(root.querySelector('.hero-water'),[{strokeDashoffset:0},{strokeDashoffset:-24}],{duration:600,delay:2700,iterations:6});
   play(root.querySelector('.hero-panorama'),times.map(t=>{const p=townProgress(t);return{offset:t/DURATION,opacity:p,transform:`translate3d(0,${(1-p)*14}px,0) scale(${.955+.045*p},${.98+.02*p})`};}));
   root.querySelectorAll('.hero-char').forEach(character=>{const delay=parseFloat(character.style.getPropertyValue('--char-delay'))||0;play(character,[{opacity:0,transform:'translateY(.12em)'},{opacity:1,transform:'none'}],{duration:290,delay,easing:'cubic-bezier(.2,.65,.3,1)'});});
   html.dataset.heroStoryStarted=String(Date.now());html.dataset.heroStoryDuration=String(DURATION);html.dataset.heroStory='playing';
   if(html.hasAttribute('data-hero-review-ms')){const time=Number(html.dataset.heroReviewMs);animations.forEach(a=>{a.pause();a.currentTime=time;});html.dataset.heroStory='review';return;}
   Promise.all(animations.map(a=>a.finished)).then(()=>{if(!finished)finish('complete');}).catch(()=>{});
  }catch{html.dataset.heroStoryError='asset';finish();}
 }
 start();
}
