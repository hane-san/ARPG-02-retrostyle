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
 await page.locator('#mapBtn').click();assert.equal(await page.locator('#zoneList button').count(),13);await page.locator('#mapPanel [data-close]').click();
 await page.locator('#soundBtn').click();assert.equal(await page.locator('#trackSelect option').count(),90);assert.equal(await page.locator('#musicToggle').textContent(),'OFF');assert.equal(await page.locator('#sfxToggle').textContent(),'ON');await page.locator('#musicPanel [data-close]').click();
 await page.clock.install();
 async function settle(){for(let i=0;i<75;i++){await page.clock.runFor(1000);if(await page.locator('#worldCanvas').getAttribute('aria-busy')==='false')return;}throw Error('walk did not settle');}
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
 // Repeated nearby ground taps preserve the existing composition without Home.
 const initialCamera=await page.evaluate(()=>window.pilgrimCamera);
 for(const dx of [1,2,1,0]){
  const point=await page.evaluate(({x,y})=>{const c=document.querySelector('#worldCanvas'),r=c.getBoundingClientRect(),a=window.pilgrimCamera,z=window.pilgrimZoom;return {x:r.left+r.width/2+((x+.5)*32-a.x)*z,y:r.top+r.height/2+((y+.5)*32-a.y)*z};},{x:world.start.x+dx,y:world.start.y});
  await page.touchscreen.tap(point.x,point.y);await page.clock.runFor(800);
 }
 const afterTaps=await page.evaluate(()=>window.pilgrimCamera);
 assert.ok(Math.hypot(afterTaps.x-initialCamera.x,afterTaps.y-initialCamera.y)<1,'nearby repeated taps do not recenter the camera');
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
