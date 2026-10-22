// No timers or AudioContext here: bounded, deterministic distance scheduling.
export function createAmbienceDirector(sources){
 const states=new Map(sources.map(s=>[s.id,{inside:false,next:-Infinity}]));
 let last=-Infinity;
 return {update(position,now,active=true){
  if(!Number.isFinite(now))return {levels:[],events:[]};
  if(now<last)for(const state of states.values())state.next=now+3000;
  last=now;
  const candidates=[];
  for(const s of sources){
   const state=states.get(s.id),d=Math.hypot(position.x-s.x,position.y-s.y);
   state.inside=active&&d<(state.inside?6:5);
   if(!state.inside||!active){state.next=Math.max(state.next,now+3000);continue;}
   const t=Math.max(0,1-d/5),gain=t*t*(3-2*t);
   if(gain>0)candidates.push({...s,gain,state});
  }
  candidates.sort((a,b)=>b.gain-a.gain||a.id.localeCompare(b.id));
  const selected=candidates.slice(0,2),sum=selected.reduce((n,s)=>n+s.gain,0);
  const levels=selected.map(s=>({id:s.id,gain:s.gain/Math.max(1,sum)})),events=[];
  for(const s of selected)if(now>=s.state.next){
   events.push({id:s.id,kind:s.kind,gain:s.gain/Math.max(1,sum)});
   s.state.next=now+(s.kind==='echo'?6500:s.kind==='clock'?3700:4500);
  }
  // A source losing the two-source budget does not queue an immediate backlog.
  for(const s of candidates.slice(2))s.state.next=Math.max(s.state.next,now+3000);
  return {levels,events};
 }};
}
