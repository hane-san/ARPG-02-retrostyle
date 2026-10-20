// Prepare only requested scores. The native audio thread loops the completed PCM;
// opening a panel or painting the landscape never has to schedule its next note.
export async function renderMusicLoop(track, note, Offline=globalThis.OfflineAudioContext||globalThis.webkitOfflineAudioContext, alive=()=>true){
 const rate=24000,frames=Math.round(track.seconds*rate),period=frames/rate;
 const context=new Offline(2,frames*2,rate),beat=60/track.bpm;
 const events=[];
 // The first cycle supplies preceding release tails; crop the second cycle.
 for(let cycle=0;cycle<2;cycle++)for(const event of track.events)
  events.push({event,time:cycle*period+event.beat*beat});
 events.sort((a,b)=>a.time-b.time);
 let index=0,count=0,voices=[];
 async function prepare(until){
  while(index<events.length&&events[index].time<until){
   const {event,time}=events[index++],voice=note(context,context.destination,event,time,beat);
   voice.osc.onended=null;voices.push(voice);
   if(++count%32===0)await new Promise(resolve=>setTimeout(resolve,0));
  }
 }
 let rendered;
 if(typeof context.suspend==='function'){
  // A whole score's connected filters are expensive even before their note
  // starts. Render in short slices so only nearby voices stay in the graph.
  const total=frames*2/rate,slice=4;
  await prepare(slice);
  if(!alive())return null;
  let boundary=Math.min(slice,total),paused=boundary<total?context.suspend(boundary):null;
  const rendering=context.startRendering();
  while(paused){
   await paused;
   voices=voices.filter(voice=>{if(voice.end<=context.currentTime){voice.clean();return false;}return true;});
   if(!alive()){
    for(const voice of voices)voice.clean();
    await context.resume();await rendering;return null;
   }
   boundary=Math.min(boundary+slice,total);await prepare(boundary);
   paused=boundary<total?context.suspend(boundary):null;
   await context.resume();
  }
  rendered=await rendering;
 }else{
  for(const {event,time} of events){
   if(!alive())return null;
   const voice=note(context,context.destination,event,time,beat);voice.osc.onended=null;
   if(++count%32===0)await new Promise(resolve=>setTimeout(resolve,0));
  }
  if(!alive())return null;
  rendered=await context.startRendering();
 }
 if(!alive())return null;
 for(const voice of voices)voice.clean();
 const loop=context.createBuffer(2,frames,rate);
 for(let channel=0;channel<2;channel++)loop.getChannelData(channel).set(rendered.getChannelData(channel).subarray(frames,frames*2));
 return loop;
}

// Serialize expensive preparations and keep only two finished tracks in memory.
// Superseded selections are skipped before allocating an OfflineAudioContext.
export function createMusicLoopCache(render){
 const cache=new Map();let chain=Promise.resolve(),latest=0,disposed=false;
 return {
  async get(key,track){
   const ticket=++latest;
   if(cache.has(key)){const buffer=cache.get(key);cache.delete(key);cache.set(key,buffer);return buffer;}
   const task=chain.then(async()=>{
    if(disposed||ticket!==latest)return null;
    const buffer=await render(track,()=>!disposed&&ticket===latest);
    if(!buffer||disposed||ticket!==latest)return null;
    cache.set(key,buffer);while(cache.size>2)cache.delete(cache.keys().next().value);
    return buffer;
   });
   chain=task.catch(()=>{});return task;
  },
  cancel(){latest++;},
  destroy(){disposed=true;latest++;cache.clear();},
  get size(){return cache.size;}
 };
}
