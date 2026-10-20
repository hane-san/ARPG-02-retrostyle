import assert from 'node:assert/strict';

// Reaching a portal switches worlds. A long walk that merely passes the starting
// footbridge must stay in the archipelago and arrive on foot (Issue #18).
export async function checkPortalRoutes(page,origin){
 await page.goto(origin+'/');
 await page.waitForFunction(()=>document.querySelector('#zoneName')?.textContent==='風環の庭');
 await page.locator('#mapBtn').click();
 const atlas=await page.locator('#miniMap').boundingBox();
 // 白環展示宮's entrance (118,49): its shortest route runs along the footbridge row.
 await page.mouse.click(atlas.x+(118.5/164)*atlas.width,atlas.y+(49.5/120)*atlas.height);
 await page.waitForFunction(()=>document.querySelector('#worldTitle')?.textContent!=='潮環群島'||
  document.querySelector('#zoneName')?.textContent==='白磁の未来都',null,{timeout:25000});
 assert.equal(await page.locator('#worldTitle').textContent(),'潮環群島','passing the footbridge must not cross to Starwind');
 console.log('Footbridge pass-through stays in the archipelago and walks on to 白磁の未来都.');
}
