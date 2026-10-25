// Issue #72: opt-in comparison, not a new pathfinder or persistent discovery.
export const MAZE_TRIAL_AREA=Object.freeze({x0:14,x1:44,y0:98,y1:123});
const key=p=>p.x+','+p.y;
const inside=p=>p.x>=MAZE_TRIAL_AREA.x0&&p.x<=MAZE_TRIAL_AREA.x1&&p.y>=MAZE_TRIAL_AREA.y0&&p.y<=MAZE_TRIAL_AREA.y1;

export function createMazeTrial(search=''){
 const enabled=new URLSearchParams(search).get('maze')==='turns',walked=new Set();
 return {
  enabled,
  arrive(p){if(enabled&&inside(p))walked.add(key(p));},
  plan(path,from,world,source='field'){
   if(!enabled||source!=='field'||!path?.length)return {path,limited:false};
   for(let i=0;i<path.length-1;i++){
    const a=i?path[i-1]:from,b=path[i],c=path[i+1];
    const dx=b.x-a.x,dy=b.y-a.y,nx=c.x-b.x,ny=c.y-b.y;
    // Authored ancient floor only: roads, bridges, other ruins and open fields
    // keep their existing behaviour. Never stop midway through a tile edge.
    // A deliberate reversal while finishing an edge is not a new corner.
    if(dx*ny!==dy*nx&&inside(b)&&world.tileAt(b.x,b.y)==='A'&&!walked.has(key(b)))
     return {path:path.slice(0,i+1),limited:true};
   }
   return {path,limited:false};
  }
 };
}
