import assert from 'node:assert/strict';

// Record real audio-thread output while the main thread cannot schedule notes.
// Offline PCM alone cannot reproduce a timer-starved browser during UI work.
export async function checkMusicUnderLoad(browser,origin){
 const page=await browser.newPage();
 try{
  await page.goto(origin+'/music.js');
  await page.evaluate(async()=>{
   const {createMusic}=await import('./music.js');
   const Native=window.AudioContext;
   window.AudioContext=class{
    constructor(){
     const context=new Native(),sink=context.createMediaStreamDestination();
     Object.defineProperty(context,'destination',{value:sink});
     const source=context.createBufferSource.bind(context);
     context.createBufferSource=()=>{const node=source(),start=node.start.bind(node);node.start=(...args)=>{window.loopPCM=node.buffer;return start(...args);};return node;};
     window.recordContext=context;window.recordSink=sink;return context;
    }
   };
   document.body.innerHTML='<button id="start">Start recording test</button>';
   document.querySelector('#start').onclick=()=>{
    window.testMusic=createMusic({getItem:()=>null,setItem(){}});
    window.testMusic.setScene(0,1);window.testMusic.setEnabled(true);
   };
  });
  await page.locator('#start').click();
  await page.waitForFunction(()=>window.testMusic.snapshot().scene&&window.recordContext.state==='running',null,{timeout:60000});
  await page.waitForTimeout(200);
  const result=await page.evaluate(async()=>{
   const chunks=[],recorder=new MediaRecorder(window.recordSink.stream,{mimeType:'audio/webm;codecs=opus'});
   recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   const stopped=new Promise(resolve=>recorder.onstop=resolve);
   recorder.start();await new Promise(resolve=>setTimeout(resolve,400));
   const start=performance.now();while(performance.now()-start<4200){} // A slow UI/render frame.
   await new Promise(resolve=>setTimeout(resolve,650));recorder.stop();await stopped;
   const data=await new Blob(chunks).arrayBuffer();
   const decoded=await window.recordContext.decodeAudioData(data),pcm=decoded.getChannelData(0);
   const block=Math.round(decoded.sampleRate*.05);let quiet=0,longestQuiet=0,minRms=Infinity;
   for(let at=Math.round(decoded.sampleRate*.25);at+block<pcm.length-decoded.sampleRate*.15;at+=block){
    let energy=0;for(let i=at;i<at+block;i++)energy+=pcm[i]*pcm[i];
    const rms=Math.sqrt(energy/block);minRms=Math.min(minRms,rms);
    quiet=rms<.00001?quiet+.05:0;longestQuiet=Math.max(longestQuiet,quiet);
   }
   const snapshot=window.testMusic.snapshot(),loop=window.loopPCM.getChannelData(0);
   const seam=Math.abs(loop[0]-loop.at(-1));
   let adjacent=0;
   for(let i=1;i<480;i++)adjacent=Math.max(adjacent,Math.abs(loop[i]-loop[i-1]),Math.abs(loop.at(-i)-loop.at(-i-1)));
   return {longestQuiet,minRms,duration:decoded.duration,renderer:snapshot.renderer,seam,adjacent};
  });
  console.log('Recorded load probe:',result);
  assert.ok(result.longestQuiet<.1,'BGM must remain audible during a 4.2s main-thread stall: '+JSON.stringify(result));
  assert.equal(result.renderer,'buffer','supported browsers must play pre-rendered loops');
  assert.ok(result.seam<=result.adjacent*1.5+.0001,'loop seam must not introduce a sharp sample jump: '+JSON.stringify(result));
  await page.evaluate(()=>window.testMusic.setScene(1,1));
  await page.waitForFunction(()=>window.testMusic.snapshot().preparing);
  await page.evaluate(()=>window.testMusic.setEnabled(false));
  await page.waitForTimeout(850);
  assert.equal(await page.evaluate(()=>window.testMusic.snapshot().scene),null,'OFF during preparation cannot revive old music');
  await page.evaluate(()=>{window.testMusic.setEnabled(true);window.testMusic.setScene(2,1);window.testMusic.setScene(3,1);});
  await page.waitForFunction(()=>window.testMusic.snapshot().scene==='3:ally',null,{timeout:60000});
  assert.ok(await page.evaluate(()=>window.testMusic.snapshot().cachedLoops<=2));
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForFunction(()=>window.recordContext.state==='suspended');
  assert.equal(await page.evaluate(()=>window.testMusic.snapshot().scene),null);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForFunction(()=>window.testMusic.snapshot().scene==='3:ally');
  await page.evaluate(()=>{window.testMusic.setScene(4,1);window.testMusic.destroy();});
  await page.waitForTimeout(450);
  assert.equal(await page.evaluate(()=>window.testMusic.snapshot().scene),null);
  assert.equal(await page.evaluate(()=>window.recordContext.state),'closed');
  console.log('BGM OFF/preparation, rapid selection, bounded cache, hidden/resume and destroy passed.');
  console.log('Real-time BGM recording passed: 4.2s main-thread stall, no sustained silent gap.');
  return result;
 }finally{await page.close();}
}
