import assert from 'node:assert/strict';import {mkdirSync,writeFileSync} from 'node:fs';
export async function checkWesternAudio(browser,origin,{samples=false}={}){
 const page=await browser.newPage();try{
  await page.goto(origin+'/music.js');
  const reports=[];mkdirSync('test-results/western',{recursive:true});
  for(const [key,id,phase] of [['bell',45,1],['box',45,2],['mountain',49,1],['terrace',48,2],['azure',49,2],['reeds',51,1],['mesa',51,2],['port',52,1],['coast',52,2]]){
   const r=await page.evaluate(async({id,phase,samples})=>{
    const {buildTrack,scheduleNote}=await import('./music.js'),{renderMusicLoop}=await import('./music-loop.js');
    const track=buildTrack(id,phase),at=performance.now(),buffer=await renderMusicLoop(track,scheduleNote),pcm=buffer.getChannelData(0);
    let peak=0,energy=0,mean=0,adjacent=0;for(let i=0;i<pcm.length;i++){peak=Math.max(peak,Math.abs(pcm[i]));energy+=pcm[i]*pcm[i];mean+=pcm[i];if(i>0&&(i<480||i>pcm.length-480))adjacent=Math.max(adjacent,Math.abs(pcm[i]-pcm[i-1]));}
    const out={title:track.title,seconds:track.seconds,preparationMs:performance.now()-at,peak,rms:Math.sqrt(energy/pcm.length),dc:mean/pcm.length,seam:Math.abs(pcm[0]-pcm.at(-1)),adjacent};
    if(samples){const len=12*24000,bytes=new Uint8Array(44+len*2),d=new DataView(bytes.buffer);const str=(o,s)=>[...s].forEach((c,i)=>d.setUint8(o+i,c.charCodeAt(0)));str(0,'RIFF');d.setUint32(4,36+len*2,true);str(8,'WAVE');str(12,'fmt ');d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,1,true);d.setUint32(24,24000,true);d.setUint32(28,48000,true);d.setUint16(32,2,true);d.setUint16(34,16,true);str(36,'data');d.setUint32(40,len*2,true);for(let i=0;i<len;i++){const fade=Math.min(1,i/1200,(len-1-i)/12000);d.setInt16(44+i*2,Math.round(Math.max(-1,Math.min(1,pcm[i]*fade*.7))*32767),true);}let b64='';for(let i=0;i<bytes.length;i+=12000)b64+=String.fromCharCode(...bytes.subarray(i,i+12000));out.wav=btoa(b64);}
    return out;
   },{id,phase,samples});
   if(r.wav){writeFileSync(`test-results/western/${key}.wav`,Buffer.from(r.wav,'base64'));delete r.wav;}
   assert.ok(r.peak>0&&r.peak<.9,'no clipping or empty piece');assert.ok(r.rms>.005&&r.rms<.3,'restrained level');assert.ok(Math.abs(r.dc)<.005);assert.ok(r.seam<=r.adjacent*1.5+.0001,'continuous loop seam '+JSON.stringify(r));reports.push({key,cue:`${id}:${phase}`,...r});console.log('Western PCM',reports.at(-1));
  }
  // Exercise the real engine, not just a track selector, across new primary cues.
  await page.evaluate(async()=>{
   const {createMusic}=await import('./music.js');window.westMusic=createMusic({getItem:()=>null,setItem(){}});document.body.innerHTML='<button id="start">Play</button>';document.querySelector('#start').onclick=()=>{westMusic.setScene(45,1);westMusic.setEnabled(true);};
  });await page.locator('#start').click();await page.waitForFunction(()=>westMusic.snapshot().scene==='45:ally',null,{timeout:60000});
  await page.evaluate(()=>{westMusic.setScene(48,2);westMusic.setScene(49,1);westMusic.setScene(49,2);});await page.waitForFunction(()=>westMusic.snapshot().scene==='49:hostile',null,{timeout:60000});
  await page.evaluate(()=>westMusic.setEnabled(false));await page.waitForTimeout(1400);assert.equal(await page.evaluate(()=>westMusic.snapshot().scene),null);
  await page.evaluate(()=>westMusic.setEnabled(true));await page.waitForFunction(()=>westMusic.snapshot().scene==='49:hostile',null,{timeout:60000});
  await page.evaluate(()=>{westMusic.setVolume(0);Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await page.waitForFunction(()=>westMusic.snapshot().state==='suspended');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});await page.waitForFunction(()=>westMusic.snapshot().scene==='49:hostile');assert.equal(await page.evaluate(()=>westMusic.snapshot().volume),0);assert.ok(await page.evaluate(()=>westMusic.snapshot().cachedLoops<=2));await page.evaluate(()=>westMusic.destroy());
  writeFileSync('test-results/western/pcm.json',JSON.stringify(reports,null,2));return reports;
 }finally{await page.close();}
}
