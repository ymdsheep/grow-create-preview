export const DURATION=15000;
export const TOWN=Object.freeze({start:11000,end:15000});
export const TREE_HEIGHTS=Object.freeze([216,552,813,1126]);
const clamp=value=>Math.max(0,Math.min(1,value));
export const smooth=value=>{const p=clamp(value);return p*p*(3-2*p);};
export function treeHeight(time){return 1126*smooth((time-1500)/8700);}
export function treeWeights(time){const h=treeHeight(time),a=smooth((h-175)/110),b=smooth((h-470)/170),c=smooth((h-760)/170);return[1-a,a-b,b-c,c];}
export function seedOpacity(time){return smooth((time-500)/300)*(1-smooth((time-1500)/500));}
export function townProgress(time){return smooth((time-TOWN.start)/(TOWN.end-TOWN.start));}
const POSE_WINDOWS={planting:[0,0,1500,1800],watering:[1500,1800,5100,5400],watching:[5100,5400,8200,8500],resting:[8200,8500,DURATION,DURATION]};
export function poseOpacity(name,time){const[start,full,fade,end]=POSE_WINDOWS[name],incoming=full===start?1:smooth((time-start)/(full-start)),outgoing=end===fade?0:smooth((time-fade)/(end-fade));return incoming*(1-outgoing);}
export function sampleTimes(){const values=new Set([0,DURATION,500,800,1500,1800,2000,5100,5400,8200,8500,10200,11000]);for(let t=0;t<DURATION;t+=80)values.add(t);return[...values].sort((a,b)=>a-b);}

export function treeScale(index,time){return Math.max(.00001,Math.min(treeHeight(time),[285,640,930,1126][index])/TREE_HEIGHTS[index]);}
