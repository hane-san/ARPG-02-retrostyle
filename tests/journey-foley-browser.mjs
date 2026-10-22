import assert from 'node:assert/strict';

// Actual browser synthesis into PCM, separate from perceptual/device listening.
// Its own page keeps the game and its real-time AudioContexts untouched.
export async function checkJourneyFoley(browser,origin){
 const page=await browser.newPage();
 try{
  const response=await page.goto(origin+'/journey-foley.js');
  assert.ok(response?.ok(),'journey sound module must serve');
  const results=await page.evaluate(async()=>{
   const {createJourneyFoley}=await import('./journey-foley.js');
   const NativeAudio=globalThis.AudioContext,results=[];
   try{
    for(const kind of ['g','=','h','+','S','select','heal',...['kettle','wood','creak','wind','bell','glass','drip','clock','stone','echo'].map(k=>'ambient:'+k)]){
     const offline=new OfflineAudioContext(1,57600,48000);
     // Offline rendering starts suspended by definition. Present it as ready
     // while retaining its actual native scheduling, nodes and PCM renderer.
     globalThis.AudioContext=class{
      constructor(){return new Proxy(offline,{get(target,key){
       if(key==='state')return 'running';
       const value=Reflect.get(target,key,target);
       return typeof value==='function'?value.bind(target):value;
      }});}
     };
     const sound=createJourneyFoley({getItem:()=>null,setItem(){}});
     sound.unlock();
     if(kind.startsWith('ambient:'))sound.ambience([{id:'pcm',gain:1}],[{id:'pcm',kind:kind.slice(8),gain:1}]);
     else if(kind.length===1)sound.step(2,kind);else sound.play(kind);
     const buffer=await offline.startRendering(),data=buffer.getChannelData(0);
     let peak=0,energy=0,total=0,jump=0,lastNonzero=0;
     for(let i=0;i<data.length;i++){
      peak=Math.max(peak,Math.abs(data[i]));energy+=data[i]*data[i];total+=data[i];
      if(i)jump=Math.max(jump,Math.abs(data[i]-data[i-1]));
      if(Math.abs(data[i])>1e-8)lastNonzero=i;
     }
     results.push({kind,peak,rms:Math.sqrt(energy/(lastNonzero+1)),dc:total/data.length,
      maxSampleDelta:jump,first:data[0],last:data.at(-1),tailSeconds:lastNonzero/48000,
      activeVoices:sound.snapshot().activeVoices});
    }
   }finally{globalThis.AudioContext=NativeAudio;}
   return results;
  });
  for(const result of results){
   assert.ok(result.peak>.005&&result.peak<.025,'bounded non-silent peak: '+result.kind);
   assert.ok(Math.abs(result.dc)<.00001,'negligible DC offset: '+result.kind);
   assert.ok(result.maxSampleDelta<.003,'no hard sample discontinuity: '+result.kind);
   assert.equal(result.first,0,'silent onset: '+result.kind);
   assert.equal(result.last,0,'silent end: '+result.kind);
   assert.ok(result.tailSeconds<(result.kind.startsWith('ambient:')?1:.25),'short tail: '+result.kind);
   assert.equal(result.activeVoices,0,'all ended voices disconnected: '+result.kind);
  }
  console.log('Journey sound PCM passed: 5 surfaces + 2 cues + 10 ambient timbres, bounded peaks/DC/sample changes, silent ends, voice cleanup (listening unverified).');
 }finally{await page.close();}
}
