import assert from 'node:assert/strict';

export async function checkJourneyTargets(browser,origin){
 const results=[];
 for(const [width,height]of [[320,568],[390,844],[844,390]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/');await page.waitForSelector('.journey-menu');
  const field=await page.locator('#worldCanvas').boundingBox();
  async function measure(selector){
   for(const target of await page.locator(selector).all()){
    await target.scrollIntoViewIfNeeded();
    const r=await target.boundingBox();assert.ok(r.width>=44&&r.height>=44,selector+' '+JSON.stringify(r));
    assert.ok(r.x>=0&&r.x+r.width<=width+.5,'target inside screen');
    assert.ok(await target.evaluate(e=>{const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;return [[0,21],[0,-21],[21,0],[-21,0]].every(([dx,dy])=>{const hit=document.elementFromPoint(x+dx,y+dy);return hit===e||e.contains(hit);});}),'44px hit area is not stolen by a neighbour: '+selector);
   }
  }
  await page.locator('#mapBtn').tap();
  await measure('#zoneList button,#mapHome');
  await page.locator('#zoneList button').nth(1).tap();
  await page.locator('#mapPanel').waitFor({state:'hidden'});
  await page.waitForFunction(()=>document.querySelector('#worldCanvas').getAttribute('aria-busy')==='true');
  assert.equal(await page.locator('#toast').evaluate(e=>e.classList.contains('show')),false);
  await page.locator('#mapBtn').tap();await page.locator('#mapHome').tap();
  assert.equal(await page.locator('#mapPanel').isVisible(),false);

  await page.locator('#soundBtn').tap();await measure('#volumeRange,#sfxVolumeRange');
  for(const id of ['volumeRange','sfxVolumeRange']){
   const slider=page.locator('#'+id);await slider.scrollIntoViewIfNeeded();
   const r=await slider.boundingBox(),before=await slider.inputValue();
   await page.touchscreen.tap(r.x+r.width*.74,r.y+r.height/2);
   assert.notEqual(await slider.inputValue(),before,'actual touch changes '+id);
  }
  await page.locator('#musicPanel [data-close]').tap();
  await page.locator('#helpBtn').tap();await measure('#helpPanel a');
  await page.locator('.maze-trial-links a').nth(1).tap();
  await page.waitForURL('**/?maze=turns');
  await page.locator('#helpBtn').tap();
  assert.match(await page.locator('#helpPanel').innerText(),/Bを試遊中/);
  await page.locator('.maze-trial-links a').first().tap();
  await page.waitForURL(origin+'/');await page.waitForSelector('.journey-menu');
  assert.deepEqual(await page.locator('#worldCanvas').boundingBox(),field,'field/dock geometry unchanged');
  assert.deepEqual(errors,[]);results.push({width,height,targets44:true});
  await context.close();
 }
 console.log('Journey panel targets: '+JSON.stringify(results));
}
