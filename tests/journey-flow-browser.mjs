// Issue #98 P0: map -> walk -> change of mind -> talk -> read -> close -> map again,
// as one continuous run on small screens. Nothing fires twice, closing a card never
// sets the explorer walking, and every card button answers a finger 22px off-centre.
import assert from 'node:assert/strict';
import {makePilgrimageWorld} from '../pilgrimage-world.js';
const world=makePilgrimageWorld();
const npc=world.npcs.find(p=>p.name==='舟を結ぶ人');

export async function checkJourneyFlow(browser,origin){
 for(const [width,height] of [[320,568],[844,390]]){
  const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   const fill=CanvasRenderingContext2D.prototype.fillRect,scale=CanvasRenderingContext2D.prototype.scale,translate=CanvasRenderingContext2D.prototype.translate;let next=false;
   CanvasRenderingContext2D.prototype.fillRect=function(x,y,w,h){
    if(this.canvas.id==='worldCanvas'&&this.fillStyle==='#b8d9dc'){const m=this.getTransform(),r=this.canvas.getBoundingClientRect(),k=r.width/this.canvas.width,cx=x+w/2,cy=y+h/2;window.heroScreen={x:r.left+(m.a*cx+m.c*cy+m.e)*k,y:r.top+(m.b*cx+m.d*cy+m.f)*k};}
    return fill.call(this,x,y,w,h);
   };
   CanvasRenderingContext2D.prototype.scale=function(x,y){if(this.canvas.id==='worldCanvas'){next=true;window.flowZoom=x;}return scale.call(this,x,y);};
   CanvasRenderingContext2D.prototype.translate=function(x,y){if(next&&this.canvas.id==='worldCanvas'){next=false;window.flowCamera={x:-x,y:-y};}return translate.call(this,x,y);};
  });
  await page.goto(origin+'/',{waitUntil:'load'});
  await page.waitForFunction(()=>document.querySelector('#zoneName')?.textContent==='白い船着場'&&window.flowCamera);
  const busy=async()=>await page.locator('#worldCanvas').getAttribute('aria-busy')==='true';
  const tapTile=async t=>{
   const s=await page.evaluate(()=>({camera:window.flowCamera,zoom:window.flowZoom})),box=await page.locator('#worldCanvas').boundingBox();
   const x=box.width/2+((t.x+.5)*32-s.camera.x)*s.zoom,y=box.height/2+((t.y+.5)*32-s.camera.y)*s.zoom;
   assert.ok(x>0&&x<box.width&&y>0&&y<box.height,`${width}x${height}: tile on screen`);
   await page.locator('#worldCanvas').tap({position:{x,y}});
  };
  const reach=sel=>page.locator(sel).evaluate((button,sel)=>{
   const r=button.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
   return [[22,0],[-22,0],[0,22],[0,-22]].every(([dx,dy])=>document.elementFromPoint(cx+dx,cy+dy)?.closest(sel)===button);
  },sel);

  // Talk: one tap on the person walks beside them and opens the card once.
  await tapTile(npc);
  await page.waitForSelector('#dialogue:not(.hidden)',{timeout:8000});
  assert.equal(await page.locator('#dialogueName').textContent(),npc.name);
  for(const sel of ['#dialogueClose','#dialogueNext'])assert.ok(await reach(sel),`${width}x${height}: ${sel} keeps a 44px touch area`);
  const card=await page.locator('#dialogue').boundingBox(),dock=await page.locator('.dock').boundingBox();
  assert.ok(card.y+card.height<=dock.y+1,`${width}x${height}: the card never covers the bottom tools`);
  // Read: each press finishes the page, then turns it, then closes; never walks.
  for(let i=0;i<20&&await page.locator('#dialogue').isVisible();i++){
   await page.locator('#dialogueNext').click();await page.waitForTimeout(220);
   assert.equal(await busy(),false,'reading never sets the explorer walking');
  }
  assert.equal(await page.locator('#dialogue').isVisible(),false,'the card closes after its last page');
  await page.waitForTimeout(500);assert.equal(await busy(),false,'closing does not leak into a walk');
  // Talk again and close with the cross: one press, no walk.
  await tapTile(npc);await page.waitForSelector('#dialogue:not(.hidden)',{timeout:8000});
  await page.locator('#dialogueClose').click();
  assert.equal(await page.locator('#dialogue').isVisible(),false);
  await page.waitForTimeout(500);assert.equal(await busy(),false,'the cross closes without walking');

  // Map: one tap sets off and closes the map; reopening mid-walk changes the destination.
  await page.locator('#mapBtn').click();await page.locator('#mapPanel').waitFor({state:'visible'});
  await page.locator('#zoneList button').nth(2).click();
  await page.waitForFunction(()=>document.querySelector('#worldCanvas').getAttribute('aria-busy')==='true',null,{timeout:3000});
  assert.equal(await page.locator('#mapPanel').isVisible(),false,'choosing a place closes the map');
  await page.waitForTimeout(600);
  await page.locator('#mapBtn').click();await page.locator('#mapPanel').waitFor({state:'visible'});
  await page.locator('#zoneList button').nth(1).click();
  assert.equal(await page.locator('#mapPanel').isVisible(),false);
  assert.equal(await busy(),true,'a new destination keeps walking without a second confirmation');
  // Stop by tapping the explorer, then the map opens again on the first press.
  await page.waitForTimeout(400);
  const hero=await page.evaluate(()=>window.heroScreen);
  await page.mouse.click(hero.x,hero.y);
  await page.waitForFunction(()=>document.querySelector('#worldCanvas').getAttribute('aria-busy')==='false',null,{timeout:1500});
  await page.waitForTimeout(400);assert.equal(await busy(),false,'stopping stays stopped');
  await page.locator('#mapBtn').click();await page.locator('#mapPanel').waitFor({state:'visible'});
  assert.ok(await reach('#mapPanel [data-close]'));
  await page.locator('#mapPanel [data-close]').click();await page.locator('#mapPanel').waitFor({state:'hidden'});
  assert.equal(await page.locator('#dialogue').isVisible(),false);
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('Journey flow passed: talk, read, close, map choice, change of mind and stop at 320x568 and 844x390.');
}
