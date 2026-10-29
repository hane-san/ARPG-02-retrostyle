import {JOURNEY_WONDERS,WONDER_VISTAS} from '../journey-wonders.js';
import {FOREST_SITES,FOREST_NPCS} from '../forest-market.js';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {makePilgrimageWorld,PILGRIM_ROUTE,PILGRIM_W,PILGRIM_H,PILGRIM_ZONES} from '../pilgrimage-world.js';
const world=makePilgrimageWorld();
export async function checkPilgrimage(browser,origin){
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(({w,h})=>{
  const fill=CanvasRenderingContext2D.prototype.fillRect,arc=CanvasRenderingContext2D.prototype.arc,scale=CanvasRenderingContext2D.prototype.scale,translate=CanvasRenderingContext2D.prototype.translate;
  window.pilgrimFrames=[];let next=false;
  CanvasRenderingContext2D.prototype.fillRect=function(x,y,w,h){fill.call(this,x,y,w,h);if(window.pilgrimCheckOcclusion&&this.canvas.id==='worldCanvas'&&this.fillStyle==='#b8d9dc'){const p=this.getTransform().transformPoint({x:x+w/2,y:y+h/2});window.pilgrimHeroPixel={x:Math.floor(p.x),y:Math.floor(p.y),before:[...this.getImageData(Math.floor(p.x),Math.floor(p.y),1,1).data]};}};
  CanvasRenderingContext2D.prototype.arc=function(x,y,r,...rest){if(this.canvas.id==='miniMap'&&this.fillStyle==='#fae5a1')window.pilgrimPosition={x:x/this.canvas.width*w-.5,y:y/this.canvas.height*h-.5};return arc.call(this,x,y,r,...rest);};
  CanvasRenderingContext2D.prototype.scale=function(x,y){if(this.canvas.id==='worldCanvas'){next=true;window.pilgrimZoom=x;}return scale.call(this,x,y);};
  CanvasRenderingContext2D.prototype.translate=function(x,y){if(next&&this.canvas.id==='worldCanvas'){next=false;window.pilgrimCamera={x:-x,y:-y};window.pilgrimFrames.push({x:-x,y:-y,zoom:window.pilgrimZoom});}return translate.call(this,x,y);};
 },{w:PILGRIM_W,h:PILGRIM_H});
 await page.goto(origin+'/');await page.waitForSelector('.journey-menu');
 assert.equal(await page.locator('#zoneName').textContent(),'白い船着場');
 assert.equal(await page.locator('.journey-tool').count(),4);
 const arches=world.sites.filter(s=>s.form==='arch');
 const gaps=await page.evaluate(async sites=>{
  const {drawPilgrimSite}=await import(new URL('pilgrimage-art.js',location.href).href);
  return sites.map(site=>{
   const s={...site,x:2,y:4},canvas=document.createElement('canvas');canvas.width=(s.w+4)*32;canvas.height=(s.h+6)*32;
   const c=canvas.getContext('2d');drawPilgrimSite(c,s,0);
   const alpha=(x,y)=>c.getImageData(x*32+16,y*32+16,1,1).data[3];
   return {gap:alpha(s.x+Math.floor(s.w/2),s.y+2),pier:alpha(s.x,s.y+2)};
  });
 },arches);
 for(const a of gaps){assert.equal(a.gap,0,'walkable arch centre must be visually open');assert.equal(a.pier,255,'solid pier remains visible');}
 // Exercise each new vista's actual Canvas commands before the long itinerary.
 const newVistas=await page.evaluate(async vistas=>{
  const {drawJourneyPanorama}=await import('./journey-panorama.js');
  return vistas.map(v=>{const canvas=document.createElement('canvas');drawJourneyPanorama(canvas,v.kind);const d=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data,colours=new Set();for(let i=0;i<d.length;i+=4)colours.add(d[i]+','+d[i+1]+','+d[i+2]);return {w:canvas.width,h:canvas.height,colours:colours.size};});
 },WONDER_VISTAS);
 for(const v of newVistas){assert.deepEqual([v.w,v.h],[480,252]);assert.ok(v.colours>8,'every new vista draws its landscape');}
 await page.locator('#mapBtn').click();assert.equal(await page.locator('#zoneList button').count(),13);await page.locator('#mapPanel [data-close]').click();
 await page.locator('#soundBtn').click();assert.equal(await page.locator('#trackSelect option').count(),90);assert.equal(await page.locator('#musicToggle').textContent(),'OFF');assert.equal(await page.locator('#sfxToggle').textContent(),'ON');await page.locator('#musicPanel [data-close]').click();
 await page.clock.install();
 async function settle(){for(let i=0;i<75;i++){await page.clock.runFor(1000);assert.deepEqual(errors,[],'walking must retain its rendering loop');if(await page.locator('#worldCanvas').getAttribute('aria-busy')==='false')return;}throw Error('walk did not settle');}
 async function position(){await page.locator('#mapBtn').click();const p=await page.evaluate(()=>window.pilgrimPosition);await page.locator('#mapPanel [data-close]').click();return {x:Math.round(p.x),y:Math.round(p.y)};}
 async function walk(target){
  await page.locator('#mapBtn').click();const box=await page.locator('#miniMap').boundingBox();
  const pixel=(v,base,extent,cells)=>extent<cells?Math.round(base+(v+.5)/cells*extent-.5):base+(v+.5)/cells*extent;
  await page.mouse.click(pixel(target.x,box.x,box.width,PILGRIM_W),pixel(target.y,box.y,box.height,PILGRIM_H));
  await settle();if(await page.locator('#dialogue:not(.hidden)').count())await page.locator('#dialogueClose').click();
  const actual=await position();assert.ok(Math.abs(actual.x-target.x)<=1&&Math.abs(actual.y-target.y)<=1,'subpixel atlas reaches requested neighbourhood: '+JSON.stringify({actual,target}));
  for(const [axis,negative,positive] of [['x','ArrowLeft','ArrowRight'],['y','ArrowUp','ArrowDown']])while(actual[axis]!==target[axis]){await page.keyboard.press(actual[axis]>target[axis]?negative:positive);await settle();actual[axis]+=actual[axis]>target[axis]?-1:1;}
  assert.deepEqual(await position(),target);await page.clock.runFor(1800);
 }
 async function fieldTap(target){
  await page.locator('#homeBtn').click();await page.clock.runFor(1500);
  const state=await page.evaluate(()=>({camera:window.pilgrimCamera,zoom:window.pilgrimZoom})),box=await page.locator('#worldCanvas').boundingBox();
  const x=box.width/2+((target.x+.5)*32-state.camera.x)*state.zoom,y=box.height/2+((target.y+.5)*32-state.camera.y)*state.zoom;
  assert.ok(x>0&&x<box.width&&y>0&&y<box.height,'field target visible');
  await page.locator('#worldCanvas').tap({position:{x,y}});await settle();
 }
 async function playWithWheel(site,point){
  const hashes=[];
  for(let i=0;i<4;i++){
   const before=await page.evaluate(async s=>(await import('./pilgrimage-play.js')).pilgrimPlayPhase(s),site);
   await fieldTap(point);assert.equal(await page.locator('#dialogueName').textContent(),site.name);
   const result=await page.evaluate(async s=>{
    const {pilgrimPlayPhase}=await import('./pilgrimage-play.js'),{drawPilgrimSite}=await import('./pilgrimage-art.js');
    const canvas=document.createElement('canvas');canvas.width=700;canvas.height=700;drawPilgrimSite(canvas.getContext('2d'),{...s,x:2,y:8},0);
    const data=canvas.getContext('2d').getImageData(0,0,700,700).data;let hash=2166136261;for(const v of data)hash=Math.imul(hash^v,16777619);return {phase:pilgrimPlayPhase(s),hash};
   },site);
   assert.equal(result.phase,(before+1)%3);hashes.push(result.hash);
   await page.locator('#dialogueClose').click();await page.clock.runFor(250);
  }
  assert.equal(new Set(hashes.slice(0,3)).size,3,'each groove has a distinct rendered boat or cloth position');assert.equal(hashes[0],hashes[3],'one full turn returns to the same picture');
  await page.screenshot({path:`test-results/play-${site.id}.png`});console.log('Wheel play: '+site.name+'; four real investigations and three distinct Canvas states.');
 }
 // Repeated nearby ground taps preserve the existing composition without Home.
 const initialCamera=await page.evaluate(()=>window.pilgrimCamera);
 for(const dx of [1,2,1,0]){
  const point=await page.evaluate(({x,y})=>{const c=document.querySelector('#worldCanvas'),r=c.getBoundingClientRect(),a=window.pilgrimCamera,z=window.pilgrimZoom;return {x:r.left+r.width/2+((x+.5)*32-a.x)*z,y:r.top+r.height/2+((y+.5)*32-a.y)*z};},{x:world.start.x+dx,y:world.start.y});
  await page.touchscreen.tap(point.x,point.y);await page.clock.runFor(800);
 }
 const afterTaps=await page.evaluate(()=>window.pilgrimCamera);
 assert.ok(Math.hypot(afterTaps.x-initialCamera.x,afterTaps.y-initialCamera.y)<1,'nearby repeated taps do not recenter the camera');
 // Reproduce the reported recoil: pan ahead, then tap without using Home.
 await page.mouse.move(330,400);await page.mouse.down();await page.mouse.move(150,400,{steps:12});await page.mouse.up();await page.clock.runFor(1800);
 const panned=await page.evaluate(()=>window.pilgrimCamera);
 assert.ok(panned.x>initialCamera.x+120,'real drag frames the route ahead');
 async function rawTap(target){
  const point=await page.evaluate(({x,y})=>{const r=document.querySelector('#worldCanvas').getBoundingClientRect(),a=window.pilgrimCamera,z=window.pilgrimZoom;return {x:r.left+r.width/2+((x+.5)*32-a.x)*z,y:r.top+r.height/2+((y+.5)*32-a.y)*z};},target);
  await page.touchscreen.tap(point.x,point.y);
 }
 await rawTap({x:world.start.x+2,y:world.start.y});await page.clock.runFor(900);
 const retained=await page.evaluate(()=>window.pilgrimCamera);
 assert.ok(Math.hypot(retained.x-panned.x,retained.y-panned.y)<1,'a tap does not recoil toward the traveller behind the panned view');
 await rawTap({x:world.start.x+13,y:world.start.y});await settle();
 const followed=await page.evaluate(()=>window.pilgrimCamera);
 assert.ok(followed.x>panned.x+10,'camera follows after catch-up: '+JSON.stringify({initialCamera,panned,followed,position:await position()}));
 await walk(world.start);await page.locator('#homeBtn').click();await page.clock.runFor(1500);
 console.log('Catch-up camera: real forward drag, nearby tap retains composition, farther tap resumes following.');
 const visited=new Set();mkdirSync('test-results',{recursive:true});
 // The full itinerary traverses actual routes through normal map/keyboard input.
 // Browser time is advanced; no hero coordinate, terrain or product speed is patched.
 for(let i=1;i<PILGRIM_ROUTE.length;i++){
  await walk(PILGRIM_ROUTE[i]);const zone=await page.locator('#zoneName').textContent();visited.add(zone);
  const z=PILGRIM_ZONES.find(z=>z.at===i);
  if(z){
   if([4,11,12].includes(z.index))await page.clock.runFor(6000);
   console.log('Pilgrimage region '+z.index+': '+zone);
   assert.equal(zone,world.zoneAt(PILGRIM_ROUTE[i].x,PILGRIM_ROUTE[i].y).name);
   if([2,5,6,10,11,12].includes(z.index)){
    await page.locator('#homeBtn').click();await page.clock.runFor(1400);
    await page.screenshot({path:`test-results/pilgrimage-${z.theme}.png`});
   }
   if(![0,1,8].includes(z.index)){
    await page.locator('#vistaBtn').click();
    const canvas=await page.locator('#vistaCanvas').evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,s=new Set();for(let i=0;i<d.length;i+=4)s.add(d[i]+','+d[i+1]+','+d[i+2]);return {w:c.width,h:c.height,colours:s.size};});
    assert.deepEqual([canvas.w,canvas.h],[480,252]);assert.ok(canvas.colours>20);
    await page.locator('#vistaClose').click();assert.equal(await page.locator('#worldCanvas').getAttribute('aria-busy'),'false');
   }
   if(z.index===1){
    assert.equal(zone,'輪を結ぶ森市');
    const toy=world.sites.find(s=>s.id==='pilgrim-place-1');await playWithWheel(toy,{x:toy.x+1,y:toy.y+toy.h-1});await walk(PILGRIM_ROUTE[i]);
    const leaves=await page.evaluate(async()=>{
     const {drawForestCanopies,drawForestTree}=await import('./forest-market-art.js');
     const tree={x:3,y:5,variant:12,seed:.4},canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const c=canvas.getContext('2d');
     drawForestTree(c,tree,'trunk');const behind=c.getImageData(136,90,1,1).data[3];
     const paint=hero=>{c.clearRect(0,0,256,256);c.fillStyle='#2255dd';c.fillRect(130,83,16,18);drawForestCanopies(c,{decor:[tree],npcs:[]},{left:0,right:8,top:0,bottom:8},hero);return c.getImageData(136,90,1,1).data[2];};
     return {behind,covered:paint({px:3,py:3}),edge:paint({px:3,py:.8}),opaque:paint({px:100,py:100}),alpha:c.globalAlpha};
    });
    assert.equal(leaves.behind,0,'the lower tree pass does not paint opaque leaves behind the explorer');
    assert.ok(leaves.covered>leaves.opaque+30,'foreground leaves reveal the explorer beneath them');assert.ok(leaves.edge>leaves.opaque+30,'sprite height is included at the near canopy edge');assert.equal(leaves.alpha,1);

    await page.locator('#soundBtn').click();assert.equal(await page.locator('#trackSelect').inputValue(),'31:1');await page.locator('#musicPanel [data-close]').click();
    for(const s of FOREST_SITES){
     await walk(s.entrance);await fieldTap({x:s.x,y:s.y+2});
     assert.equal(await page.locator('#dialogueName').textContent(),s.name);
     await page.locator('#dialogueClose').click();
     const floor={x:s.x+Math.floor(s.w/2),y:s.y+s.h-1};await fieldTap(floor);assert.deepEqual(await position(),floor);
     const beside={x:s.x+1,y:s.y+s.h-1};await fieldTap(beside);await page.keyboard.press('ArrowLeft');await page.clock.runFor(400);assert.deepEqual(await position(),beside,'timber post stops movement');
     await page.screenshot({path:`test-results/${s.id}.png`});
    }
    for(const p of FOREST_NPCS){await walk({x:p.x,y:p.y-1});await fieldTap(p);assert.equal(await page.locator('#dialogueName').textContent(),p.name);await page.locator('#dialogueClose').click();}
    const tree=world.decor.find(d=>d.variant===12&&world.walkable(d.x,d.y-1));
    await walk({x:tree.x,y:tree.y-1});const before=await position();await page.keyboard.press('ArrowDown');await page.clock.runFor(400);assert.deepEqual(await position(),before,'a visible tree trunk blocks the real controls');
    await walk(PILGRIM_ROUTE[i]);await page.locator('#homeBtn').click();await page.clock.runFor(1000);await page.screenshot({path:'test-results/forest-market-square.png'});
    console.log('Forest market: 3 shops investigated, 2 residents, open verandas, posts/trunk collision, distinctive region music.');
   }
   if(z.index===2){
    const s=world.sites.find(s=>s.id==='pilgrim-place-2'),floor={x:s.x+Math.floor(s.w/2),y:s.y+Math.floor(s.h/2)};
    await fieldTap(floor);assert.deepEqual(await position(),floor);assert.equal(await page.locator('#dialogue').isVisible(),false,'open floor means walk');
    await fieldTap({x:s.x,y:s.y+2});assert.equal(await page.locator('#dialogueName').textContent(),s.name);
    await page.locator('#dialogueClose').click();await page.clock.runFor(500);assert.equal(await page.locator('#worldCanvas').getAttribute('aria-busy'),'false','closing investigation does not leak into walking');
    const beside={x:s.x+1,y:s.y+Math.floor(s.h/2)};await fieldTap(beside);
    await page.keyboard.press('ArrowLeft');await page.clock.runFor(400);assert.deepEqual(await position(),beside,'solid pillar stops the actual walking controls');
    await walk(PILGRIM_ROUTE[i]);
   }
   if(z.index===5){
    const stone=world.sites.find(s=>s.form==='monolith');
    await walk({x:stone.x+4,y:stone.y-3});
    await page.evaluate(()=>{window.pilgrimCheckOcclusion=true;});await page.locator('#homeBtn').click();await page.clock.runFor(1800);
    const difference=await page.evaluate(()=>{const p=window.pilgrimHeroPixel,after=document.querySelector('#worldCanvas').getContext('2d').getImageData(p.x,p.y,1,1).data;return [...after].slice(0,3).reduce((n,v,i)=>n+Math.abs(v-p.before[i]),0);});
    assert.ok(difference<140,'explorer remains visible in final pixels behind the foreground monolith');
    await page.screenshot({path:'test-results/pilgrimage-behind-monolith.png'});await page.evaluate(()=>{window.pilgrimCheckOcclusion=false;});
    await fieldTap({x:stone.x+3,y:stone.y-5});assert.equal(await page.locator('#dialogueName').textContent(),stone.name,'drawn high stone is a real investigation target');
    await page.locator('#dialogueClose').click();await walk(PILGRIM_ROUTE[i]);
   }
   if(z.index===6){const dry=world.sites.find(s=>s.id==='pilgrim-place-6');await playWithWheel(dry,{x:dry.x,y:dry.y+2});await walk(PILGRIM_ROUTE[i]);}
   for(const s of JOURNEY_WONDERS.filter(s=>s.chapter===z.index)){
    await walk(s.entrance);await page.locator('#homeBtn').click();await page.clock.runFor(2000);
    // Inspect an actual solid foot, then walk through the open span.
    await fieldTap({x:s.x,y:s.y});assert.equal(await page.locator('#dialogueName').textContent(),s.name);await page.locator('#dialogueClose').click();
    const gap={x:s.x+Math.floor(s.w/2),y:s.y+s.h-1};await fieldTap(gap);assert.deepEqual(await position(),gap,'new landmark has real walkable space');
    if(s.solid.some(r=>r.x===0&&r.h===s.h)){const beside={x:s.x+1,y:s.y};await fieldTap(beside);await page.keyboard.press('ArrowLeft');await page.clock.runFor(400);assert.deepEqual(await position(),beside,'new visible pier blocks walking');}
    await walk(s.entrance);await page.locator('#homeBtn').click();await page.clock.runFor(2500);
    await page.screenshot({path:`test-results/${s.id}.png`});
    const vista=WONDER_VISTAS.find(v=>v.chapter===s.chapter);
    if(vista){await page.locator('#vistaBtn').click();assert.equal(await page.locator('#vistaTitle').textContent(),vista.title);await page.screenshot({path:`test-results/${s.id}-vista.png`});await page.locator('#vistaClose').click();}
    if(s.form==='wonder-wheel')await playWithWheel(s,{x:s.x,y:s.y});
    console.log('World study walked and investigated: '+s.name);
   }
   if(JOURNEY_WONDERS.some(s=>s.chapter===z.index))await walk(PILGRIM_ROUTE[i]);
   if(z.theme==='sealed'){
    await page.locator('#soundBtn').click();await page.locator('#musicToggle').click();await page.clock.runFor(1000);
    assert.equal(await page.locator('#musicToggle').textContent(),'ON');assert.match(await page.locator('#nowPlaying').textContent(),/静まります/);await page.locator('#musicPanel [data-close]').click();
   }
   if(z.theme==='capital'){
    await page.locator('#soundBtn').click();assert.equal(await page.locator('#musicToggle').textContent(),'ON');assert.match(await page.locator('#nowPlaying').textContent(),/再生中/);await page.locator('#musicToggle').click();await page.locator('#musicPanel [data-close]').click();
   }
  }
 }
 assert.ok(visited.size>=12,'all distinct regions along the loop and changed latter half are seen');
 const frames=await page.evaluate(()=>window.pilgrimFrames);
 assert.ok(frames.some(f=>f.zoom<.4),'capital pulls back strongly');assert.ok(frames.some(f=>f.zoom>.45&&f.zoom<.47),'ridge has its own wider scale');assert.ok(frames.every(f=>f.zoom>=.379&&f.zoom<=.801));
 for(let i=1;i<frames.length;i++)assert.ok(Math.abs(frames[i].zoom-frames[i-1].zoom)<.02,'zoom interpolates rather than cuts');
 assert.deepEqual(errors,[]);console.log('Pilgrimage: all 43 actual map/keyboard walking legs, loop and changed final approach, 13 regions, vistas, quiet/resumed BGM, 90 tracks and stable wide framing. Browser clock advanced, not a real-time human playtest.');
 await context.close();
 for(const [width,height] of [[320,568],[844,390]]){
  const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/?journey=1');await page.waitForSelector('.journey-menu');
  await page.locator('#mapBtn').click();assert.equal(await page.locator('#zoneList button').count(),13);
  for(const e of await page.locator('#zoneList button').all()){await e.scrollIntoViewIfNeeded();const r=await e.boundingBox();assert.ok(r.width>=44&&r.height>=44);}
  await page.locator('#mapPanel [data-close]').click();await page.keyboard.press('ArrowRight');await page.waitForTimeout(300);
  assert.deepEqual(errors,[]);await page.close();
 }
}
