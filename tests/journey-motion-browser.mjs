import assert from 'node:assert/strict';
import {makePilgrimageWorld as makeJourneyWorld,PILGRIM_W as JOURNEY_W,PILGRIM_H as JOURNEY_H} from '../pilgrimage-world.js';
import {nearestWalkable} from '../world.js';

export async function checkJourneyMotion(browser,origin){
 const world=makeJourneyWorld();
 let water=null;
 // Atlas taps near a shore intentionally choose nearby dry ground. Use deep
 // water outside that existing 14-tile convenience radius to request an error.
 outer:for(let y=1;y<JOURNEY_H;y++)for(let x=1;x<JOURNEY_W;x++)if(world.tileAt(x,y)==='L'&&!nearestWalkable(world,x,y,14)){water={x,y};break outer;}
 assert.ok(water);
 assert.equal(world.walkable(water.x,water.y),false);
 const results=[];
 for(const [width,height]of [[320,568],[390,844],[844,390]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  // Observe the actual destination-ring paint, without exposing a product API.
  await page.addInitScript(()=>{
   const arc=CanvasRenderingContext2D.prototype.arc;
   window.destinationFrames=[];
   CanvasRenderingContext2D.prototype.arc=function(x,y,r,...rest){
    if(this.canvas.id==='worldCanvas'&&this.strokeStyle==='#fff4c2'&&this.lineWidth===3){
     window.destinationFrames.push({r,alpha:this.globalAlpha});
    }
    return arc.call(this,x,y,r,...rest);
   };
  });
  await page.goto(origin+'/');await page.waitForSelector('.journey-menu');
  const toast=page.locator('#toast');
  assert.equal(await toast.evaluate(e=>getComputedStyle(e).transitionDuration),'0s','reduce suppresses notice transitions');
  await page.locator('#mapBtn').tap();
  const map=page.locator('#miniMap'),r=await map.boundingBox();
  const border=await map.evaluate(e=>parseFloat(getComputedStyle(e).borderLeftWidth)||0);
  await map.tap({position:{x:(water.x+.5)/JOURNEY_W*r.width-border,y:(water.y+.5)/JOURNEY_H*r.height-border}});
  await page.waitForFunction(()=>document.querySelector('#toast').classList.contains('show'));
  assert.match(await toast.innerText(),/水域は歩けません/);
  assert.equal(await page.locator('#worldCanvas').getAttribute('aria-busy'),'false','water does not start walking');
  assert.equal(await toast.evaluate(e=>getComputedStyle(e).opacity),'1');
  assert.equal(await toast.evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).m42),0,'notice does not slide');
  await page.locator('#mapBtn').tap();await page.locator('#zoneList button').nth(1).tap();
  await page.waitForFunction(()=>window.destinationFrames.length>=8);
  assert.ok((await page.evaluate(()=>window.destinationFrames)).every(f=>f.r===11&&f.alpha===.65),'reduced ring remains visible and still');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>{window.destinationFrames=[];});await page.waitForFunction(()=>window.destinationFrames.length>=8);
  const normal=await page.evaluate(()=>window.destinationFrames);
  assert.ok(new Set(normal.map(f=>f.r.toFixed(3))).size>1,'normal preference preserves pulsation');
  assert.notEqual(await toast.evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>{window.destinationFrames=[];});await page.waitForFunction(()=>window.destinationFrames.length>=8);
  assert.ok((await page.evaluate(()=>window.destinationFrames)).every(f=>f.r===11&&f.alpha===.65),'live switch stops the pulse again');
  assert.equal(await page.locator('#worldCanvas').getAttribute('aria-busy'),'true','changing preference does not stop walking');
  assert.equal(await page.locator('.journey-tool').count(),4);
  assert.deepEqual(errors,[]);results.push({width,height,ringStill:true,noticeStill:true});
  await context.close();
 }
 // The older modes keep their existing notice treatment even under reduce.
 for(const query of ['?mode=classic','?prototype=1']){
  const page=await browser.newPage({reducedMotion:'reduce'});
  await page.goto(origin+'/'+query);
  assert.notEqual(await page.locator('#toast').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  await page.close();
 }
 console.log('Reduced motion cues: '+JSON.stringify(results));
}
