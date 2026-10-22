// No timers or AudioContext here: bounded, deterministic distance scheduling.
// A place is heard once it is near enough to hear (gain .25, about 3.4 tiles), even
// while walking past; it repeats only after its own interval, so walking back and
// forth never makes a burst. Reading, menus or the background are followed by a
// short quiet (an atlas walk begins as its panel closes), and nothing is caught up.
const ENTER=5,EXIT=6,AUDIBLE=.25,QUIET_AFTER_PAUSE=800,OUT_OF_BUDGET_HOLD=3000;
export function createAmbienceDirector(sources){
 const states=new Map(sources.map(s=>[s.id,{inside:false,next:-Infinity}]));
 let last=-Infinity;
 return {update(position,now,active=true){
  if(!Number.isFinite(now))return {levels:[],events:[]};
  if(now<last)for(const state of states.values())state.next=now+QUIET_AFTER_PAUSE;
  last=now;
  const candidates=[];
  for(const s of sources){
   const state=states.get(s.id),d=Math.hypot(position.x-s.x,position.y-s.y);
   if(!active){state.inside=false;state.next=Math.max(state.next,now+QUIET_AFTER_PAUSE);continue;}
   state.inside=d<(state.inside?EXIT:ENTER);
   if(!state.inside)continue;
   const t=Math.max(0,1-d/ENTER),gain=t*t*(3-2*t);
   if(gain>0)candidates.push({...s,gain,state});
  }
  candidates.sort((a,b)=>b.gain-a.gain||a.id.localeCompare(b.id));
  const selected=candidates.slice(0,2),sum=selected.reduce((n,s)=>n+s.gain,0);
  const levels=selected.map(s=>({id:s.id,gain:s.gain/Math.max(1,sum)})),events=[];
  for(const s of selected)if(now>=s.state.next&&s.gain>=AUDIBLE){
   events.push({id:s.id,kind:s.kind,gain:s.gain/Math.max(1,sum)});
   s.state.next=now+(s.kind==='echo'?6500:s.kind==='clock'?3700:4500);
  }
  // A source losing the two-source budget does not queue an immediate backlog.
  for(const s of candidates.slice(2))s.state.next=Math.max(s.state.next,now+OUT_OF_BUDGET_HOLD);
  return {levels,events};
 }};
}
