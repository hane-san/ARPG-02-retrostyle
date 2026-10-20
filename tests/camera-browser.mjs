import assert from 'node:assert/strict';

// Real multi-touch events, including normal implicit lostpointercapture.
// Node listener/animation tests cover deliberately late cancelled events too.
export async function checkCameraInput(page,origin){
 const cdp=await page.context().newCDPSession(page);
 for(const query of ['?mode=classic', '?prototype=1', '']){
  await page.goto(origin+'/'+query);await page.waitForSelector('#worldCanvas');
  const box=await page.locator('#worldCanvas').boundingBox();
  const p=(id,x,y)=>({id,x:box.x+x,y:box.y+y,radiusX:2,radiusY:2,force:1});
  const first=p(1,box.width/2,box.height/2),second=p(2,box.width/2+50,box.height/2);
  const send=(type,touchPoints)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints});
  await send('touchStart',[first]);await send('touchStart',[first,second]);
  await send('touchMove',[first,{...second,x:second.x+15}]);
  // Lift the original pointer, then introduce another while the second remains.
  await send('touchEnd',[first]);
  const third=p(3,box.width/2-50,box.height/2);
  await send('touchStart',[second,third]);
  await send('touchMove',[second,{...third,x:third.x-15}]);
  await send('touchEnd',[]);
  assert.ok(await page.locator('#zoomIn').isEnabled()||await page.locator('#zoomOut').isEnabled(),'pinching never starts a walk: '+query);
  // Cancel a drag with real touchCancel, then turn the screen during another.
  await send('touchStart',[first]);await send('touchMove',[{...first,x:first.x+80}]);
  await send('touchCancel',[]);
  await send('touchStart',[first]);await page.setViewportSize({width:844,height:390});
  await send('touchEnd',[]);await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(100);
  assert.equal(await page.locator('.overlay:not(.hidden)').count(),0,'cancelled release must not click a newly underlying toolbar button');
  assert.ok(await page.locator('#dialogue').isHidden(),'cancelled release cannot talk either');
  await page.locator('#homeBtn').click();
  await page.locator('#mapBtn').click();assert.ok(await page.locator('#mapPanel').isVisible());
  await page.locator('#mapPanel [data-close]').click();
  // Every mode accepts a clean next walking command after cancelled gestures.
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(()=>!document.querySelector('#zoomIn').disabled||!document.querySelector('#zoomOut').disabled);
  console.log('Camera touch lifecycle / resize / fresh input OK:',query||'default');
 }
 await cdp.detach();
}
