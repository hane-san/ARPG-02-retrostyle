import assert from 'node:assert/strict';
import {makePilgrimageWorld,PILGRIM_W,PILGRIM_H} from '../pilgrimage-world.js';

export async function checkDeadzoneCamera(browser,origin){
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  const scale=CanvasRenderingContext2D.prototype.scale;
  const translate=CanvasRenderingContext2D.prototype.translate;
  let next=false;
  CanvasRenderingContext2D.prototype.scale=function(x,y){
   if(this.canvas.id==='worldCanvas'){window.deadzoneTestZoom=x;next=true;}
   return scale.call(this,x,y);
  };
  CanvasRenderingContext2D.prototype.translate=function(x,y){
   if(next&&this.canvas.id==='worldCanvas'){
    window.deadzoneTestCamera={x:-x,y:-y};
    next=false;
   }
   return translate.call(this,x,y);
  };
 });
 await page.goto(origin+'/?walk=1',{waitUntil:'load'});
 await page.waitForFunction(()=>window.deadzoneTestCamera&&document.querySelector('#zoneName')?.textContent==='白い船着場');
 assert.equal(await page.locator('.journey-tool').count(),4,'no additional permanent tool');
 await page.locator('#helpBtn').click();
 const alternate=page.getByRole('link',{name:'落ち着いた追従（標準）'});
 assert.equal(await alternate.getAttribute('aria-current'),'page');
 assert.ok((await page.getByRole('link',{name:'以前の追従（比較）'}).getAttribute('href')).endsWith('?camera=directional'));
 await page.locator('#helpPanel [data-close]').click();
 await page.clock.install();
 const base=await page.evaluate(()=>({...window.deadzoneTestCamera}));
 for(let i=0;i<2;i++){
  await page.keyboard.press('ArrowRight');
  await page.clock.runFor(900);
 }
 const short=await page.evaluate(()=>({...window.deadzoneTestCamera}));
 assert.ok(Math.hypot(short.x-base.x,short.y-base.y)<1,'a two-tile walk holds a composed screen');
 // The full-width map still chooses a far destination in one tap.
 const world=makePilgrimageWorld(),destination={x:world.start.x+13,y:world.start.y};
 await page.locator('#mapBtn').click();
 const rect=await page.locator('#miniMap').boundingBox();
 await page.mouse.click(rect.x+(destination.x+.5)/PILGRIM_W*rect.width,
  rect.y+(destination.y+.5)/PILGRIM_H*rect.height);
 await page.clock.runFor(2000);
 const further=await page.evaluate(()=>({...window.deadzoneTestCamera}));
 assert.ok(further.x>base.x+5,'long taps wake the camera and open forward ground');
 await page.screenshot({path:'test-results/pilgrimage-deadzone-forward.png'});
 assert.deepEqual(errors,[]);
 await page.close();
 console.log('Default composed camera passed: comparison link, static two-step screen, forward movement without HUD.');
}
