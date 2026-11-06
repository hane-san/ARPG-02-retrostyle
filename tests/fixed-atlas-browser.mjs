import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {makeFixedRooms,fixedLayout,gatePoint} from '../fixed-screens.js';
import {buildTrack} from '../music.js';
// Actual field taps traverse the retained journey, the eastern escarpment,
// then the six southern transects. There is no hero-position setter.
export async function checkFixedAtlas(browser,origin){
 const rooms=makeFixedRooms(),reports=[];mkdirSync('test-results/fixed-atlas',{recursive:true});
 const old=['N','N','E','E','S','W','S','E','E','N','N','E','E','E','E','E','E','S','S','S','N','N','N','W','S','W','W','W','W','W','S','E','E','E','E','E','S','W','W','W','W','W','N','W','W','W'];
 const route=[...old,'E','E','S','W','W','S'];
 for(let row=4;row<=9;row++){route.push(...Array(9).fill(row%2===0?'E':'W'));if(row<9)route.push('S');}
 for(const [width,height] of [[390,844],[320,568],[430,932],[844,390]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   const P=CanvasRenderingContext2D.prototype,fill=P.fillRect;P.fillRect=function(x,y,w,h){if(this.canvas.id==='fixedTerrainCanvas'&&this.fillStyle==='#b8d9dc'&&w===15&&h===3){const m=this.getTransform();window.atlasActor={a:m.a,d:m.d,x:m.e,y:m.f,hx:(x-8)/32,hy:(y-13)/32};}return fill.call(this,x,y,w,h);};
   const Native=window.AudioContext||window.webkitAudioContext;if(Native){const create=Native.prototype.createBufferSource;Native.prototype.createBufferSource=function(){const s=create.call(this),start=s.start.bind(s);s.start=(...args)=>{if(s.loop){window.atlasStarts=(window.atlasStarts||0)+1;window.atlasSeconds=s.buffer?.duration;}return start(...args);};return s;};}
  });
  await page.goto(origin+'/');await page.locator('#helpBtn').click();await page.locator('#fixedHelpEnter').click();const canvas=page.locator('#fixedCanvas');await canvas.waitFor({state:'visible'});await page.clock.install();await page.clock.pauseAt(await page.evaluate(()=>Date.now()+100));await page.clock.runFor(500);
  if(width===390){
   const sky=await page.evaluate(async()=>{
    const {drawFixedRoom}=await import('./fixed-screen-art.js'),{makeFixedRooms,fixedLayout}=await import('./fixed-screens.js'),rooms=makeFixedRooms(),screen={w:390,h:753,dpr:1},skyHeight=Math.floor(fixedLayout(390,753).y-128*fixedLayout(390,753).scale-8),profiles=new Set(),out=[];
    const render=(room,transition=null)=>{const c=document.createElement('canvas');c.width=390;c.height=753;const g=c.getContext('2d');drawFixedRoom(g,room,{px:7,py:11,stride:0},screen,1500,{rooms,transition});return g.getImageData(0,0,390,skyHeight).data;};
    for(const from of rooms.filter(r=>r.atlas)){if(profiles.has(from.sky))continue;profiles.add(from.sky);const to=rooms.find(r=>r.id===Object.values(from.connections)[0]),t={to,hero:{px:7,py:0},landing:{x:7,y:13},duration:560,elapsed:0},a=render(from),start=render(from,t),b=render(to),end=render(from,{...t,elapsed:560});out.push({profile:from.sky,start:a.every((v,i)=>v===start[i]),end:b.every((v,i)=>v===end[i]),top:[...a.slice(0,3)]});}return out;
   });assert.equal(sky.length,11);assert.ok(sky.every(p=>p.start&&p.end),'all authored sky fades respect both endpoints');assert.ok(new Set(sky.map(p=>p.top.join(','))).size>=10,'distinct authored sky colours');
  }
  const stage=await canvas.boundingBox(),l=fixedLayout(stage.width,stage.height),point=p=>({x:l.x+(p.x+.5)*32*l.scale,y:l.y+(p.y+.5)*32*l.scale});let current=rooms[0],starts=0;const seen=new Set([current.id]),cues=new Set([current.cue]),inspected=new Set();
  await page.locator('#soundBtn').click();assert.equal(await page.locator('#musicToggle').textContent(),'OFF');assert.equal(await page.locator('#sfxToggle').textContent(),'ON');const volumes=[await page.locator('#volumeRange').inputValue(),await page.locator('#sfxVolumeRange').inputValue()];if(width===390)await page.locator('#musicToggle').click();await page.locator('#musicPanel [data-close]').click();
  async function audio(room,changed){
   if(width!==390||room.quiet)return;
   const [id,phase]=room.cue.split(':').map(Number),seconds=buildTrack(id,phase).seconds;let ready=false;
   for(let i=0;i<350;i++){await page.clock.runFor(100);await new Promise(r=>setTimeout(r,10));if(await page.evaluate(({seconds,changed,starts})=>Math.abs((window.atlasSeconds||0)-seconds)<.001&&(!changed||(window.atlasStarts||0)>starts),{seconds,changed,starts})){ready=true;break;}}
   assert.ok(ready,'native regional music '+room.id+' '+room.cue);const now=await page.evaluate(()=>window.atlasStarts);if(!changed)assert.equal(now,starts,'same cue does not restart');starts=now;
  }
  await audio(current,true);
  for(const direction of route){
   const before=current,next=rooms.find(r=>r.id===before.connections[direction]);assert.ok(next,before.id+' '+direction);await canvas.tap({position:point(gatePoint(direction))});let arrived=false;
   for(let i=0;i<160;i++){await page.clock.runFor(100);if(await page.locator('#zoneName').textContent()===next.name){arrived=true;break;}}
   assert.ok(arrived,'real field gate '+before.id+' '+direction);current=next;seen.add(current.id);cues.add(current.cue);await page.clock.runFor(250);assert.equal(await canvas.getAttribute('aria-busy'),'false');assert.equal(await page.locator('#trackSelect').inputValue(),current.cue);
   const actor=await page.evaluate(()=>window.atlasActor);assert.ok(Math.abs(actor.a-l.scale)<1e-6&&Math.abs(actor.d-l.scale)<1e-6);assert.ok(Math.abs(actor.x-l.x)<1e-4&&Math.abs(actor.y-l.y)<1e-4,'common fixed composition');assert.ok(current.walkable(Math.round(actor.hx),Math.round(actor.hy)));assert.equal(current.gateAt(Math.round(actor.hx),Math.round(actor.hy)),null);await audio(current,current.cue!==before.cue||!!current.quiet!==!!before.quiet);
   if(width===390&&current.atlas&&!inspected.has(current.id)){
    for(const site of [current.site,...current.props].filter(Boolean)){
     const feet=[];for(let y=Math.floor(site.y);y<Math.ceil(site.y+site.h);y++)for(let x=Math.floor(site.x);x<Math.ceil(site.x+site.w);x++)if(current.tileAt(x,y)==='h'&&x>0&&x<14&&y>0&&y<14)feet.push({x,y});assert.ok(feet.length,current.id+' inspectable foot');
     feet.sort((a,b)=>Math.hypot(a.x-7,a.y-7)-Math.hypot(b.x-7,b.y-7));await canvas.tap({position:point(feet[0])});let opened=false;for(let i=0;i<160;i++){await page.clock.runFor(100);if(await page.locator('#dialogue').isVisible()){opened=true;break;}}assert.ok(opened,current.id+' '+site.name);assert.equal(await page.locator('#dialogueName').textContent(),site.name);await page.locator('#dialogueClose').click();await page.clock.runFor(100);
    }
    inspected.add(current.id);
   }
   if(current.atlas)await page.screenshot({path:`test-results/fixed-atlas/${width}x${height}-${current.id}.png`});
   reports.push({viewport:`${width}x${height}`,from:before.id,to:current.id,direction,source:current.sourceIndex??23,cue:current.cue,sky:current.sky||'original',scale:l.scale,nativeSeconds:width===390?await page.evaluate(()=>window.atlasSeconds):null});
  }
  assert.equal(seen.size,100,'all hundred screens in one continuous trip');assert.equal(cues.size,new Set(rooms.map(r=>r.cue)).size);if(width===390)assert.equal(inspected.size,67);
  await page.locator('#mapBtn').click();assert.equal(await page.locator('#miniMap').evaluate(c=>c.width/c.height),1);await page.screenshot({path:`test-results/fixed-atlas/${width}x${height}-atlas.png`});await page.locator('#mapPanel [data-close]').click();
  await page.locator('#soundBtn').click();assert.deepEqual([await page.locator('#volumeRange').inputValue(),await page.locator('#sfxVolumeRange').inputValue()],volumes);await page.locator('#musicPanel [data-close]').click();await page.locator('#helpBtn').click();await page.locator('#fixedReturn').click();await page.clock.runFor(1200);assert.equal(await canvas.isVisible(),false);assert.equal(await page.locator('#trackSelect').inputValue(),'30:1');assert.equal(await page.locator('#zoneName').textContent(),'白い船着場');assert.deepEqual(errors,[]);await context.close();console.log(`Hundred-screen atlas ${width}x${height}: all 100 boards, ${cues.size} regional cues, stable framing, sky, map and safe return passed.`);
 }
 writeFileSync('test-results/fixed-atlas/routes.json',JSON.stringify(reports,null,2));
}
