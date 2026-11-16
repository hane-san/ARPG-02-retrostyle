import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {makeFixedRooms,fixedLayout} from '../fixed-screens.js';
import {LANDMARK_ROUTES} from '../fixed-landmarks.js';
import {walkFixedBrowser} from './fixed-route.mjs';
export async function checkFixedLandmarks(browser,origin){
 const rooms=makeFixedRooms(),reports=[];mkdirSync('test-results/fixed-landmarks',{recursive:true});
 for(const [width,height] of [[320,568],[390,844]]){
  const ctx=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{const P=CanvasRenderingContext2D.prototype,fill=P.fillRect;P.fillRect=function(x,y,w,h){if(this.canvas.id==='fixedTerrainCanvas'&&this.fillStyle==='#b8d9dc'&&w===15&&h===3)window.landmarkHero={x:(x-8)/32,y:(y-13)/32};return fill.call(this,x,y,w,h);};});
  await p.goto(origin+'/');const canvas=p.locator('#fixedCanvas');await canvas.waitFor({state:'visible'});await p.clock.install();await p.clock.pauseAt(await p.evaluate(()=>Date.now()+100));await p.clock.runFor(900);
  let current='watershed-wheel';const box=await canvas.boundingBox(),l=fixedLayout(box.width,box.height);
  async function photo(id,suffix=''){await p.clock.fastForward(3500);await p.screenshot({path:`test-results/fixed-landmarks/${width}-${id}${suffix}.png`});}
  async function go(id){await walkFixedBrowser(p,id,current);current=id;const r=rooms.find(r=>r.id===id);assert.equal(await p.locator('#zoneName').textContent(),r.name);const hero=await p.evaluate(()=>window.landmarkHero);assert.ok(r.walkable(Math.round(hero.x),Math.round(hero.y)),id+' safe arrival');reports.push({width,id,hero});}
  async function tap(x,y){await canvas.tap({position:{x:l.x+(x+.5)*32*l.scale,y:l.y+(y+.5)*32*l.scale}});for(let i=0;i<220;i++){await p.clock.runFor(100);if(await canvas.getAttribute('aria-busy')==='false')return;}throw Error('tap did not settle');}
  for(const route of LANDMARK_ROUTES){
   assert.equal(current,route[0]);
   for(const id of route.slice(1)){await go(id);await photo(id);
    if(id==='white-flower-road'){await tap(7,11);await photo(id,'-hidden');await tap(7,4);await photo(id,'-reveal');assert.deepEqual(await p.evaluate(()=>window.landmarkHero),{x:7,y:4});}
   }
   for(const id of route.slice(0,-1).reverse()){await go(id);await photo(id,'-return');}
  }
  // BGM stays off by default throughout the walk: every turn was visual.
  assert.equal(await p.locator('#musicToggle').textContent(),'OFF');assert.deepEqual(errors,[]);await ctx.close();
  console.log(`Landmark journeys ${width}x${height}: all three routes walked by tap in both directions, hidden/revealed fault, captures, BGM off.`);
 }
 writeFileSync('test-results/fixed-landmarks/routes.json',JSON.stringify(reports,null,2));
}
