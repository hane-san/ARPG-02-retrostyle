import assert from 'node:assert/strict';

// Compare native PCM around a real mid-render stop, rather than reconstructing
// an expected fade with fake AudioParams. This catches retroactive ramp removal.
export async function checkAudioContinuity(browser,origin){
 const page=await browser.newPage();
 try{
  await page.goto(origin+'/music.js');
  const results=await page.evaluate(async()=>{
   const {scheduleNote}=await import('./music.js');
   const rate=48000,release=1.1;
   async function render(voice,stop=false,fallback=false){
    const context=new OfflineAudioContext(1,rate*2,rate);
    if(fallback){
     const create=context.createGain.bind(context);
     context.createGain=()=>{const gain=create();Object.defineProperty(gain.gain,'cancelAndHoldAtTime',{value:undefined});return gain;};
    }
    const note=scheduleNote(context,context.destination,{voice,midi:60,duration:4,velocity:.08},.02,1);
    const paused=stop?context.suspend(.5):null;
    const rendered=context.startRendering();
    if(paused){await paused;note.stop(release);note.stop(release+.1);await context.resume();}
    return (await rendered).getChannelData(0);
   }
   const results=[];
   for(const voice of ['pad','harp','flute']){
    const reference=await render(voice);
    for(const fallback of [false,true]){
     const actual=await render(voice,true,fallback);
     let beforeError=0,tail=0;
     for(let i=0;i<rate*release-1;i++)beforeError=Math.max(beforeError,Math.abs(actual[i]-reference[i]));
     for(let i=Math.ceil(rate*1.3);i<actual.length;i++)tail=Math.max(tail,Math.abs(actual[i]));
     results.push({voice,fallback,beforeError,tail});
    }
   }
   return results;
  });
  for(const result of results){
   assert.ok(result.beforeError<1e-6,'stopping preserves every sample before release: '+JSON.stringify(result));
   assert.equal(result.tail,0,'retired notes end without being revived by later stop calls');
  }
  console.log('BGM continuity PCM passed: pad/harp/flute, native and fallback, unchanged pre-release waveform and silent retirement.');
  return results;
 }finally{await page.close();}
}
