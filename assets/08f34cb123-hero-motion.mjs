export const DURATION = 18000;
export const ROOT = Object.freeze({x:613, y:1167});
export const PERSON = Object.freeze({x:760, y:1167});
export const TOWN = Object.freeze({start:13000, end:18000});
export const TREE_HEIGHTS = Object.freeze([216,552,813,1126]);
const clamp = value => Math.max(0,Math.min(1,value));
export const smooth = value => {const p=clamp(value);return p*p*(3-2*p);};
const blend = (a,b,p) => a+(b-a)*p;

export function treeHeight(time) {return 1126*smooth((time-1800)/10400);}
export function treeWeights(time) {
  const h=treeHeight(time);
  const a=smooth((h-175)/110), b=smooth((h-470)/170), c=smooth((h-760)/170);
  return [1-a,a-b,b-c,c];
}
export function seedOpacity(time) {return smooth((time-700)/350)*(1-smooth((time-1800)/650));}
export function townProgress(time) {return smooth((time-TOWN.start)/(TOWN.end-TOWN.start));}
export function waterOpacity(time) {return smooth((time-3900)/250)*(1-smooth((time-6350)/250));}
export function canOpacity(time) {return smooth((time-2500)/400)*(1-smooth((time-7750)/450));}


const POSE_WINDOWS={planting:[0,0,1800,2300],watering:[1800,2300,6100,6600],watching:[6100,6600,10000,10500],resting:[10000,10500,DURATION,DURATION]};
export function poseOpacity(name,time){const [start,full,fade,end]=POSE_WINDOWS[name];const incoming=full===start?1:smooth((time-start)/(full-start));const outgoing=end===fade?0:smooth((time-fade)/(end-fade));return incoming*(1-outgoing);}
export function pouringOpacity(time){return smooth((time-2700)/300)*(1-smooth((time-5800)/300));}
export function sampleTimes(){const values=new Set([0,DURATION,1800,2300,2700,3000,5800,6100,6600,10000,10500,12200,13000]);for(let t=0;t<DURATION;t+=80)values.add(t);return [...values].sort((a,b)=>a-b);}
