// Prepare only requested scores. The native audio thread loops the completed PCM;
// opening a panel or painting the landscape never has to schedule its next note.
export async function renderMusicLoop(track, note, Offline=globalThis.OfflineAudioContext||globalThis.webkitOfflineAudioContext, alive=()=>true){
 const rate=24000,frames=Math.round(track.seconds*rate),period=frames/rate;
 const context=new Offline(2,frames*2,rate),beat=60/track.bpm;
 let count=0;
 // The first cycle supplies the preceding release tails. Crop the second cycle
 // so the loop seam contains the same overlapping voices as normal playback.
 for(let cycle=0;cycle<2;cycle++)for(const event of track.events){
  if(!alive())return null;
  const voice=note(context,context.destination,event,cycle*period+event.beat*beat,beat);
  voice.osc.onended=null; // no thousands of cleanup callbacks on the UI thread
  if(++count%32===0)await new Promise(resolve=>setTimeout(resolve,0));
 }
 if(!alive())return null;
 const rendered=await context.startRendering();
 if(!alive())return null;
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
