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

// Each key is an action, not a replacement picture. The same joints continue between them.
const POSES = [
  {t:0,hip:[0,-74],shoulder:[-60,-144],left:[-119,-28],right:[-83,-54],look:0,can:0},
  {t:1200,hip:[0,-74],shoulder:[-60,-144],left:[-147,-6],right:[-95,-27],look:0,can:0},
  {t:1900,hip:[2,-77],shoulder:[-53,-155],left:[-132,-20],right:[-74,-58],look:0,can:0},
  {t:3100,hip:[6,-181],shoulder:[-5,-283],left:[-64,-220],right:[15,-190],look:0,can:5},
  {t:3900,hip:[6,-181],shoulder:[-7,-285],left:[-88,-190],right:[-35,-208],look:3,can:-14},
  {t:6600,hip:[6,-181],shoulder:[-7,-285],left:[-88,-190],right:[-35,-208],look:3,can:-14},
  {t:7600,hip:[9,-187],shoulder:[5,-293],left:[-5,-136],right:[34,-136],look:15,can:12},
  {t:8200,hip:[9,-187],shoulder:[5,-293],left:[10,-128],right:[34,-136],look:20,can:12},
  {t:9600,hip:[8,-187],shoulder:[0,-292],left:[-12,-160],right:[34,-136],look:18,can:0},
  {t:12400,hip:[6,-187],shoulder:[-2,-293],left:[-147,-230],right:[34,-136],look:14,can:0},
  {t:DURATION,hip:[6,-187],shoulder:[-2,-293],left:[-147,-230],right:[34,-136],look:14,can:0},
];

export function poseAt(time) {
  let b=POSES.findIndex(p=>p.t>=time);
  if(b<=0)return {...POSES[b<0?POSES.length-1:0]};
  const a=POSES[b-1],next=POSES[b],p=smooth((time-a.t)/(next.t-a.t));
  return Object.fromEntries(Object.entries(next).map(([key,value])=>[key,Array.isArray(value)?value.map((v,i)=>blend(a[key][i],v,p)):blend(a[key],value,p)]));
}
const plus=(a,b)=>a.map((v,i)=>v+b[i]);
const radians=a=>a*Math.PI/180;
const degrees=a=>a*180/Math.PI;
const rotate=(p,a)=>[p[0]*Math.cos(a)-p[1]*Math.sin(a),p[0]*Math.sin(a)+p[1]*Math.cos(a)];

export function joint(start,end,upper,lower,bend) {
  const dx=end[0]-start[0],dy=end[1]-start[1];
  const distance=Math.max(.01,Math.min(Math.hypot(dx,dy),upper+lower-.01));
  const base=Math.atan2(dy,dx);
  const angle=base+bend*Math.acos(Math.max(-1,Math.min(1,(upper*upper+distance*distance-lower*lower)/(2*upper*distance))));
  return [start[0]+Math.cos(angle)*upper,start[1]+Math.sin(angle)*upper];
}
const place=(point,angle=0,scale=1)=>`translate(${point[0].toFixed(4)}px,${point[1].toFixed(4)}px) rotate(${angle.toFixed(4)}deg) scale(1,${scale.toFixed(5)})`;
const segment=(a,b,length)=>place(a,degrees(Math.atan2(b[1]-a[1],b[0]-a[0]))-90,Math.hypot(b[0]-a[0],b[1]-a[1])/length);

export function rigAt(time) {
  const p=poseAt(time),parts={};
  const torsoAngle=Math.atan2(p.shoulder[1]-p.hip[1],p.shoulder[0]-p.hip[0])+Math.PI/2;
  const torsoLength=Math.hypot(p.shoulder[0]-p.hip[0],p.shoulder[1]-p.hip[1]);
  const neck=plus(p.shoulder,rotate([-2,-13],torsoAngle));
  const head=plus(p.shoulder,rotate([-5,-43],torsoAngle));
  parts.body=place(p.hip,degrees(torsoAngle),torsoLength/104);
  parts.neck=place(neck,degrees(torsoAngle));
  parts.head=place(head,degrees(torsoAngle)+p.look);
  parts.can=place(p.left,p.can);
  const feet={left:[-24,0],right:[24,0]},joints={};
  for(const [side,sign] of [['left',-1],['right',1]]) {
    const hip=plus(p.hip,[sign*14,0]),foot=feet[side],knee=joint(hip,foot,98,92,-1);
    const shoulder=plus(p.shoulder,rotate([sign*37,5],torsoAngle));
    const hand=p[side],elbow=joint(shoulder,hand,82,84,-1);
    parts[side+'Thigh']=segment(hip,knee,98);parts[side+'Shin']=segment(knee,foot,92);
    parts[side+'Foot']=place(foot);
    parts[side+'Upper']=segment(shoulder,elbow,82);parts[side+'Fore']=segment(elbow,hand,84);
    parts[side+'Hand']=place(hand,side==='left'?-25:10);
    joints[side]={shoulder,elbow,hand,hip,knee,foot};
  }
  const spout=plus(plus(p.left,rotate([-67,13],radians(p.can))),[PERSON.x,PERSON.y]);
  return {parts,joints,spout};
}

export function sampleTimes() {
  const values=new Set([0,DURATION,1800,3900,6350,6600,7750,8200,12200,TOWN.start,...POSES.map(p=>p.t)]);
  for(let t=0;t<DURATION;t+=80)values.add(t);
  return [...values].sort((a,b)=>a-b);
}
