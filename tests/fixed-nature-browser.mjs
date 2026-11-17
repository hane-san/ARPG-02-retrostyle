import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';

// Renderer diagnostics, kept separate from the normal-tap walking checks.
export async function checkFixedNature(browser,origin){
 const p=await browser.newPage({viewport:{width:390,height:844}});
 await p.goto(origin);await p.locator('#fixedCanvas').waitFor();
 await p.clock.install();await p.clock.pauseAt(await p.evaluate(()=>Date.now()+100));
 const report=await p.evaluate(async()=>{
  const {makeFixedRooms,fixedLayout}=await import('./fixed-screens.js'),{drawFixedRoom}=await import('./fixed-screen-art.js'),{drawAtlasTreeCanopy}=await import('./fixed-nature-art.js');
  const rooms=makeFixedRooms(),frames=[];
  for(const [w,h] of [[320,477],[390,753],[844,316]])for(const id of ['forest-picnic','glass-reflection','glacier-rest']){
   const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),draw=g.drawImage;let neighbours=0;
   g.drawImage=function(source,...args){if(source.id==='fixedNeighbourCanvas'){const data=source.getContext('2d').getImageData(0,0,source.width,source.height).data;for(let i=3;i<data.length;i+=4)if(data[i]>0)neighbours++;}return draw.call(this,source,...args);};
   drawFixedRoom(g,rooms.find(r=>r.id===id),{px:7,py:11,stride:0},{w,h,dpr:1},1500,{rooms});frames.push({w,h,id,neighbours});
  }
  // Widening a grass landing must not turn its three-tile trail into a fan.
  const forest=rooms.find(r=>r.id==='forest-picnic'),top=Math.floor(fixedLayout(320,477).y)-1;
  const approach=r=>{const c=document.createElement('canvas');c.width=320;c.height=477;const g=c.getContext('2d');drawFixedRoom(g,r,{px:7,py:11,stride:0},{w:320,h:477,dpr:1},1500,{rooms});return g.getImageData(0,0,320,top).data;};
  const broad=approach(forest),narrow=approach({...forest,seams:{...forest.seams,N:{...forest.seams.N,bands:[[6,8]]}}});
  const grassLandingDoesNotWidenTrail=broad.every((v,i)=>v===narrow[i]);
  const tree={x:5,y:10,kind:'cypress',palette:['#78936f','#bbc99c','#8cb0b0','#486c55'],seed:.23},person={x:5,y:7};
  const render=people=>{const c=document.createElement('canvas');c.width=c.height=480;const g=c.getContext('2d');drawAtlasTreeCanopy(g,tree,people);return g.getImageData(0,0,480,480).data;};
  const bare=render([]),opened=render([person]),again=render([]),outsideExamples=[];let outsideChanges=0,thinned=0;
  // Nested Canvas clips may round alpha by one unit at a silhouette edge.
  for(let y=0;y<480;y++)for(let x=0;x<480;x++){
   const i=(y*480+x)*4,dx=(x+.5-(person.x+.5)*32)/22,dy=(y+.5-((person.y+.5)*32-7))/29;
   if(dx*dx+dy*dy>1.15&&Math.abs(bare[i+3]-opened[i+3])>2){outsideChanges++;if(outsideExamples.length<8)outsideExamples.push({x,y,before:bare[i+3],after:opened[i+3]});}
   if(dx*dx+dy*dy<.8&&bare[i+3]>100&&opened[i+3]<bare[i+3]*.5)thinned++;
  }
  return {frames,grassLandingDoesNotWidenTrail,outsideChanges,outsideExamples,thinned,stable:bare.every((v,i)=>v===again[i])};
 });
 mkdirSync('test-results/fixed-nature',{recursive:true});writeFileSync('test-results/fixed-nature/report.json',JSON.stringify(report,null,2));
 for(const frame of report.frames)if(frame.h>=frame.w)assert.equal(frame.neighbours,0,'portrait has no full-size neighbouring board: '+frame.id);else assert.ok(frame.neighbours>0,'wide view retains neighbouring country: '+frame.id);
 assert.equal(report.grassLandingDoesNotWidenTrail,true,'a broad grass landing does not widen the northern trail');
 assert.equal(report.outsideChanges,0,'a nearby person does not turn the whole tree transparent');
 assert.ok(report.thinned>150,'the leaves actually over the person make room to see them');
 assert.equal(report.stable,true,'the same crown returns unchanged after walking away');
 await p.close();
 console.log('Atlas natural framing: portrait/wide neighbours, local canopy visibility and stable crowns passed.');
}
