import {walkFixedBrowser} from './fixed-route.mjs';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {makeFixedRooms,fixedLayout,gatePoint} from '../fixed-screens.js';
import {buildTrack} from '../music.js';
export async function checkFixedGrandJourney(browser,origin){
 const rooms=makeFixedRooms(),reports=[];mkdirSync('test-results/fixed-grand',{recursive:true});
 const route=['N','N','E','E','S','W','S','E','E','N','N','E','E','E','E','E','S','W','W','W','W','W','S','E','E','E','E','E','S','W','W','W','W','W','N','W','W','W'];
 for(const [width,height] of [[390,844],[320,568],[430,932],[844,390]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{
   const proto=CanvasRenderingContext2D.prototype,fill=proto.fillRect;
   proto.fillRect=function(x,y,w,h){if(this.canvas.id==='fixedTerrainCanvas'&&this.fillStyle==='#b8d9dc'&&w===15&&h===3){const m=this.getTransform();window.grandActor={a:m.a,d:m.d,x:m.e,y:m.f,hx:(x-8)/32,hy:(y-13)/32};}return fill.call(this,x,y,w,h);};
   const Native=window.AudioContext||window.webkitAudioContext;if(Native){const create=Native.prototype.createBufferSource;Native.prototype.createBufferSource=function(){const s=create.call(this),start=s.start.bind(s);s.start=(...args)=>{if(s.loop){window.grandStarts=(window.grandStarts||0)+1;window.grandSeconds=s.buffer?.duration;}return start(...args);};return s;};}
  });
  await p.goto(origin+'/?walk=1');await p.locator('#helpBtn').click();await p.locator('#fixedHelpEnter').click();const canvas=p.locator('#fixedCanvas');await canvas.waitFor({state:'visible'});await p.clock.install();await p.clock.pauseAt(await p.evaluate(()=>Date.now()+100));await p.clock.runFor(500);await walkFixedBrowser(p);
  if(width===390)assert.equal(await p.evaluate(async()=>{
   const {drawFixedRoom}=await import('./fixed-screen-art.js'),{makeFixedRooms,fixedLayout}=await import('./fixed-screens.js'),rooms=makeFixedRooms(),from=rooms.find(r=>r.id==='wet-temple'),to=rooms.find(r=>r.id==='glass-court'),screen={w:390,h:753,dpr:1},height=Math.floor(fixedLayout(390,753).y-128*fixedLayout(390,753).scale-8);
   const render=(room,transition=null)=>{const c=document.createElement('canvas');c.width=390;c.height=753;const ctx=c.getContext('2d');drawFixedRoom(ctx,room,{px:7,py:9,stride:0},screen,1000,{rooms,transition});return ctx.getImageData(0,0,390,height).data;};
   const t={to,hero:{px:7,py:0},landing:{x:7,y:13},duration:560,elapsed:0};
   const same=(a,b)=>a.every((v,i)=>v===b[i]);return same(render(from),render(from,t))&&same(render(to),render(from,{...t,elapsed:560}));
  }),true,'the whole sky, including internally translucent clouds, respects both fade endpoints');
  const stage=await canvas.boundingBox(),l=fixedLayout(stage.width,stage.height),point=t=>({x:l.x+(t.x+.5)*32*l.scale,y:l.y+(t.y+.5)*32*l.scale});let current=rooms[0],starts=0;const visited=new Set([current.id]);
  async function audioReady(room,changed){
   if(width!==390)return;
   if(room.quiet){await p.clock.runFor(1500);return;}
   const [id,phase]=room.cue.split(':').map(Number),seconds=buildTrack(id,phase).seconds;
   let ready=false;for(let i=0;i<250;i++){await p.clock.runFor(100);await new Promise(r=>setTimeout(r,10));if(await p.evaluate(({seconds,starts,changed})=>Math.abs((window.grandSeconds||0)-seconds)<.001&&(!changed||(window.grandStarts||0)>starts),{seconds,starts,changed})){ready=true;break;}}
   assert.ok(ready,'native music loop '+room.id+' '+room.cue);const now=await p.evaluate(()=>window.grandStarts);if(!changed)assert.equal(now,starts,'same region continues its existing loop');starts=now;
  }
  await p.locator('#soundBtn').click();assert.equal(await p.locator('#musicToggle').textContent(),'OFF');assert.equal(await p.locator('#sfxToggle').textContent(),'ON');const volumes={music:await p.locator('#volumeRange').inputValue(),sfx:await p.locator('#sfxVolumeRange').inputValue()};if(width===390)await p.locator('#musicToggle').click();await p.locator('#musicPanel [data-close]').click();await audioReady(current,true);
  for(const d of route){
   const before=current,next=rooms.find(r=>r.id===current.connections[d]);assert.ok(next,`${current.id} ${d}`);await canvas.tap({position:point(gatePoint(d))});let arrived=false;
   for(let i=0;i<150;i++){await p.clock.runFor(100);if(await p.locator('#zoneName').textContent()===next.name){arrived=true;break;}}
   assert.ok(arrived,'walk the real field gate '+current.id+' '+d);current=next;visited.add(current.id);await p.clock.runFor(250);assert.equal(await canvas.getAttribute('aria-busy'),'false');assert.equal(await p.locator('#trackSelect').inputValue(),current.cue);
   const actor=await p.evaluate(()=>window.grandActor);assert.ok(Math.abs(actor.a-l.scale)<1e-6&&Math.abs(actor.d-l.scale)<1e-6,'constant isotropic traveller scale '+current.id+' '+JSON.stringify({actor,l,stage}));assert.ok(Math.abs(actor.x-l.x)<1e-4&&Math.abs(actor.y-l.y)<1e-4,'stationary camera after the slide');assert.ok(current.walkable(Math.round(actor.hx),Math.round(actor.hy)));assert.ok(actor.hx>=1&&actor.hx<=13&&actor.hy>=1&&actor.hy<=13);
   await audioReady(current,current.cue!==before.cue||!!current.quiet!==!!before.quiet);
   if(current.id==='capital-gate'){await p.locator('#mapBtn').click();const map=p.locator('#miniMap');assert.ok(Math.abs(await map.evaluate(c=>c.width/c.height)-1)<1e-9);assert.equal(await p.locator('#zoneList button').count(),Object.keys(current.connections).length);await p.screenshot({path:`test-results/fixed-grand/${width}x${height}-atlas.png`});await p.locator('#mapPanel [data-close]').click();}
   if(current.sourceIndex!==undefined){
    // A solid source-building foot is inspectable; an empty court remains floor.
    if(current.site){const foot=current.tiles.flatMap((row,y)=>row.map((t,x)=>({t,x,y}))).find(a=>a.t==='h'&&a.x>1&&a.x<13&&a.y>2&&a.y<12);if(foot){await canvas.tap({position:point(foot)});for(let i=0;i<150;i++){await p.clock.runFor(100);if(await p.locator('#dialogue').isVisible())break;}assert.equal(await p.locator('#dialogueName').textContent(),current.site.name);await p.locator('#dialogueClose').click();}}
    await p.screenshot({path:`test-results/fixed-grand/${width}x${height}-${current.id}.png`});
   }
   reports.push({viewport:`${width}x${height}`,from:before.id,to:current.id,direction:d,source:current.sourceIndex??23,cue:current.cue,quiet:!!current.quiet,stage:{w:stage.width,h:stage.height},scale:l.scale,nativeSeconds:width===390?await p.evaluate(()=>window.grandSeconds):null});
  }
  assert.equal(current.id,'hearth');assert.equal(visited.size,33,'walk all original and expanded rooms in one continuous trip');
  await p.locator('#soundBtn').click();assert.equal(await p.locator('#volumeRange').inputValue(),volumes.music);assert.equal(await p.locator('#sfxVolumeRange').inputValue(),volumes.sfx);await p.locator('#musicPanel [data-close]').click();await p.locator('#helpBtn').click();await p.locator('#fixedReturn').click();await p.clock.runFor(1200);assert.equal(await canvas.isVisible(),false);assert.equal(await p.locator('#zoneName').textContent(),'白い船着場');assert.equal(await p.locator('#trackSelect').inputValue(),'30:1');
  if(width===390){
   await p.locator('#helpBtn').click();await p.locator('#fixedHelpEnter').click();await p.clock.runFor(500);await walkFixedBrowser(p);current=rooms[0];
   for(const d of ['E','E','E','N','N','E','E','E','E','E']){const next=rooms.find(r=>r.id===current.connections[d]);if(current.id==='capital-gate'){await p.locator('#mapBtn').click();const mini=p.locator('#miniMap'),box=await mini.boundingBox();await mini.tap({position:{x:(next.col*15+7.5)/150*box.width,y:(next.row*15+7.5)/150*box.height}});await p.locator('#mapPanel').waitFor({state:'hidden'});}else await canvas.tap({position:point(gatePoint(d))});let arrived=false;for(let i=0;i<150;i++){await p.clock.runFor(100);if(await p.locator('#zoneName').textContent()===next.name){arrived=true;break;}}assert.ok(arrived);current=next;}
   assert.equal(current.id,'sealed-court');assert.equal(await p.locator('#trackSelect').inputValue(),'39:2');await p.locator('#soundBtn').click();assert.match(await p.locator('#nowPlaying').textContent(),/静まります/);await p.locator('#musicPanel [data-close]').click();await p.locator('#helpBtn').click();await p.locator('#fixedReturn').click();await p.clock.runFor(1200);assert.equal(await p.locator('#zoneName').textContent(),'白い船着場');assert.equal(await p.locator('#trackSelect').inputValue(),'30:1');assert.equal(await canvas.isVisible(),false);
  }
  assert.deepEqual(errors,[]);await context.close();console.log(`Grand fixed journey ${width}x${height}: all 33 rooms, ${new Set(rooms.filter(r=>!r.atlas).map(r=>r.cue)).size} cue assignments, source-site inspection and safe return passed.`);
 }
 writeFileSync('test-results/fixed-grand/routes.json',JSON.stringify(reports,null,2));
}
