import {JOURNEY_W,JOURNEY_H} from '../journey-world.js';
import assert from 'node:assert/strict';

// Observe the existing atlas marker and painted camera; no production debug API.
export async function checkMazeTrial(browser,origin){
 const results=[];
 for(const [width,height] of [[320,568],[390,844],[844,390]])for(const mode of ['A','B']){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(({w,h})=>{
   const arc=CanvasRenderingContext2D.prototype.arc,scale=CanvasRenderingContext2D.prototype.scale,translate=CanvasRenderingContext2D.prototype.translate;
   let cameraNext=false;
   CanvasRenderingContext2D.prototype.arc=function(x,y,r,...rest){
    if(this.canvas.id==='miniMap'&&r===6&&this.fillStyle==='#fae5a1')window.mazeMarker={x:x/this.canvas.width*w-.5,y:y/this.canvas.height*h-.5};
    return arc.call(this,x,y,r,...rest);
   };
   CanvasRenderingContext2D.prototype.scale=function(x,y){if(this.canvas.id==='worldCanvas'){window.mazeZoom=x;cameraNext=true;}return scale.call(this,x,y);};
   CanvasRenderingContext2D.prototype.translate=function(x,y){if(cameraNext&&this.canvas.id==='worldCanvas'){window.mazeCamera={x:-x,y:-y};cameraNext=false;}return translate.call(this,x,y);};
  },{w:JOURNEY_W,h:JOURNEY_H});
  await page.goto(origin+(mode==='B'?'/?maze=turns':'/'));
  await page.waitForFunction(()=>document.querySelector('#zoneName')?.textContent==='白い船着場');
  await page.locator('#helpBtn').click();
  assert.match(await page.locator('#helpPanel').innerText(),mode==='B'?/Bを試遊中/:/Aでは今までどおり/);
  await page.locator('#helpPanel [data-close]').click();
  // Use the unmodified atlas walk to reach the same authored maze entry.
  await page.locator('#mapBtn').click();
  const map=page.locator('#miniMap'),size=await map.boundingBox();
  // Raw mouse coordinates retain fractional CSS pixels on the expanded atlas.
  // Locator.click rounds its offset, which can select an adjacent tile at 320px.
  const pixel=(origin,extent,cells,tile)=>extent<cells?Math.round(origin+(tile+.5)/cells*extent-.5):Math.ceil(origin+tile/cells*extent+.01);
  await page.mouse.click(pixel(size.x,size.width,JOURNEY_W,17),pixel(size.y,size.height,JOURNEY_H,102));
  await page.waitForFunction(()=>document.querySelector('#worldCanvas').getAttribute('aria-busy')==='true');
  const settle=()=>page.waitForFunction(()=>document.querySelector('#worldCanvas').getAttribute('aria-busy')==='false',null,{timeout:40000});
  await settle();
  async function position(){
   await page.locator('#mapBtn').click();const p=await page.evaluate(()=>window.mazeMarker);
   await page.locator('#mapPanel [data-close]').click();return p;
  }
  assert.deepEqual(await position(),{x:17,y:102},`atlas entry ${width}x${height} ${mode}`);
  async function fieldTap(target){
   await page.locator('#homeBtn').click();
   await page.waitForFunction(()=>{
    const p=window.mazeCamera,last=window.mazeLast;window.mazeLast=p&&{...p};
    return last&&p&&Math.hypot(p.x-last.x,p.y-last.y)<.15;
   },null,{polling:120,timeout:6000});
   const point=await page.locator('#worldCanvas').evaluate((c,p)=>{
    const r=c.getBoundingClientRect(),camera=window.mazeCamera,z=window.mazeZoom;
    return {x:r.left+r.width/2+((p.x+.5)*32-camera.x)*z,y:r.top+r.height/2+((p.y+.5)*32-camera.y)*z};
   },target);
   assert(point.x>0&&point.x<width&&point.y>0&&point.y<height,'target is visible at this viewport');
   await page.touchscreen.tap(point.x,point.y);
   await page.waitForFunction(()=>document.querySelector('#worldCanvas').getAttribute('aria-busy')==='true');
   await settle();
  }
  await fieldTap({x:21,y:106});
  const first=await position();
  assert.deepEqual(first,mode==='B'?{x:21,y:103}:{x:21,y:106});
  assert.equal(await page.locator('#dialogue').isVisible(),false);
  assert.equal(await page.locator('#toast').evaluate(e=>e.classList.contains('show')),false);
  if(mode==='B'){
   await fieldTap({x:21,y:106});assert.deepEqual(await position(),{x:21,y:106});
   // A site must not be inspected remotely when its approach is cut short.
   const discovered=await page.locator('#discovered').textContent();
   await fieldTap({x:26,y:107});
   assert.equal(await page.locator('#dialogue').isVisible(),false,'an unknown corner does not trigger the final site');
   assert.equal(await page.locator('#discovered').textContent(),discovered);
  }
  await page.screenshot({path:`test-results/maze-${mode}-${width}.png`});
  if(mode==='B'){
   await page.locator('#helpBtn').click();
   await page.getByRole('link',{name:'A：今までの歩き方',exact:true}).click();
   await page.waitForFunction(()=>document.querySelector('#zoneName')?.textContent==='白い船着場');
   assert.equal(new URL(page.url()).searchParams.has('maze'),false,'A is reachable through the real help link');
   await page.locator('#helpBtn').click();
   assert.match(await page.locator('#helpPanel').innerText(),/Aでは今までどおり/);
  }
  assert.deepEqual(errors,[]);results.push({width,height,mode,first,fieldChoices:mode==='B'?2:1});
  await context.close();
 }
 console.log('Maze A/B real touch comparisons',JSON.stringify(results));
}
