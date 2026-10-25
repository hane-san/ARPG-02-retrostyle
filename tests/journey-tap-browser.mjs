// Issues #64/#65 regression guard on a real page: close buttons keep a 44px touch
// area, and a tap on the walking explorer ends the walk at once without a notice.
// Which actor wins a crowded tap is decided in journey-tap.js and unit-tested there.
import assert from 'node:assert/strict';

export async function checkJourneyTaps(browser,origin){
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Test-only: remember where the explorer's scarf was last painted, in CSS pixels.
 await page.addInitScript(()=>{
  const fill=CanvasRenderingContext2D.prototype.fillRect;
  CanvasRenderingContext2D.prototype.fillRect=function(x,y,w,h){
   if(this.canvas.id==='worldCanvas'&&this.fillStyle==='#b8d9dc'){
    const m=this.getTransform(),r=this.canvas.getBoundingClientRect(),k=r.width/this.canvas.width;
    const cx=x+w/2,cy=y+h/2;
    window.heroScreen={x:r.left+(m.a*cx+m.c*cy+m.e)*k,y:r.top+(m.b*cx+m.d*cy+m.f)*k};
   }
   return fill.call(this,x,y,w,h);
  };
 });
 await page.goto(origin+'/',{waitUntil:'load'});
 await page.waitForFunction(()=>document.querySelector('#zoneName')?.textContent==='白い船着場');

 // Every closing button answers a finger 22px from its centre in each direction.
 for(const [open,panel] of [['#mapBtn','#mapPanel'],['#soundBtn','#musicPanel'],['#helpBtn','#helpPanel']]){
  await page.locator(open).click();
  const close=page.locator(panel+' [data-close]');
  await close.waitFor({state:'visible'});
  const reach=await close.evaluate(button=>{
   const r=button.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
   return [[22,0],[-22,0],[0,22],[0,-22]].every(([dx,dy])=>document.elementFromPoint(cx+dx,cy+dy)?.closest('[data-close]')===button);
  });
  assert.ok(reach,panel+' close button must keep a 44px touch area');
  await close.click();
  await page.locator(panel).waitFor({state:'hidden'});
 }

 // Set off along the quay, then tap the explorer: the walk ends within a tile.
 const field=await page.locator('#worldCanvas').boundingBox();
 await page.waitForFunction(()=>window.heroScreen);
 const start=await page.evaluate(()=>window.heroScreen);
 await page.mouse.click(start.x,Math.min(field.y+field.height-40,start.y+260));
 await page.waitForFunction(()=>document.querySelector('#worldCanvas').getAttribute('aria-busy')==='true',null,{timeout:3000});
 assert.equal(await page.locator('#toast').evaluate(n=>n.classList.contains('show')),false,'a successful walk shows no notice');
 await page.waitForTimeout(250);
 const walking=await page.evaluate(()=>window.heroScreen);
 await page.mouse.click(walking.x,walking.y);
 await page.waitForFunction(()=>document.querySelector('#worldCanvas').getAttribute('aria-busy')==='false',null,{timeout:800});
 const stopped=await page.evaluate(()=>window.heroScreen);
 assert.ok(Math.hypot(stopped.x-walking.x,stopped.y-walking.y)<40*1.2,'the explorer stops within a tile of the tap');
 assert.equal(await page.locator('#dialogue').isVisible(),false);
 assert.deepEqual(errors,[]);
 await page.close();
 console.log('Journey taps passed: 44px close areas, tap-the-explorer stop, no success notice.');
}
