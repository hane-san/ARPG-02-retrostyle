// Browser smoke test for the published static ES module game.
// Chromium approximates mobile input; it does NOT certify an actual iPhone.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {chromium} from 'playwright';
import {checkJourney} from './journey-browser.mjs';

const origin='http://127.0.0.1:4173';
const server=spawn('python3',['-m','http.server','4173','--bind','127.0.0.1'],{
 cwd:process.cwd(),stdio:'ignore'
});
let browser, page;
const errors=[];
async function awaitServer(){
 for(let i=0;i<80;i++){
  if(server.exitCode!==null)throw new Error('Local HTTP server terminated');
  try{const r=await fetch(origin+'/');if(r.ok)return;}catch{}
  await new Promise(ok=>setTimeout(ok,125));
 }
 throw new Error('Local HTTP server not ready');
}
async function main(){
 await awaitServer();
 browser=await chromium.launch({headless:true});
 page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,
  isMobile:true,hasTouch:true});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url());});
 page.on('requestfailed',r=>{if(r.failure()?.errorText!=='net::ERR_ABORTED')errors.push('Request '+r.url()+': '+r.failure()?.errorText);});
 const response=await page.goto(origin+'/',{waitUntil:'load'});
 assert.ok(response?.ok(),'static entry point must serve');
 await page.waitForSelector('#worldCanvas');
 await page.waitForFunction(()=>document.querySelector('#zoneName')?.textContent==='風環の庭');
 assert.equal(await page.locator('#worldTitle').textContent(),'潮環群島');
 assert.ok(await page.locator('#worldCanvas').isVisible());
 // Verify all 68 original pieces are discoverable in the sound room.
 await page.locator('#soundBtn').click();
 assert.equal(await page.locator('#trackSelect option').count(),68);
 assert.equal(await page.locator('#musicToggle').textContent(),'OFF');
 await page.locator('#musicPanel [data-close]').click();
 // The new Starwind footbridge is exactly four logical tiles east of START.
 const rect=await page.locator('#worldCanvas').boundingBox();
 assert.ok(rect&&rect.width>=380&&rect.height>=250);
 const clickX=rect.x+rect.width/2+4*32*1.25;
 const clickY=rect.y+rect.height/2;
 assert.ok(clickX<rect.x+rect.width-5,'short bridge must be visible from start');
 await page.mouse.click(clickX,clickY);
 await page.waitForFunction(()=>document.querySelector('#worldTitle')?.textContent==='星風回廊',null,{timeout:12000});
 assert.equal(await page.locator('#atlasTitle').textContent(),'星風回廊の地図');
 assert.ok((await page.locator('#zoneName').textContent()).length>1);
 // Show the world atlas and ensure all nine new regions are selectable.
 await page.locator('#mapBtn').click();
 assert.equal(await page.locator('#zoneList button').count(),9);
 // Return through the mainland gate, then use the distant archipelago bridge.
 const atlas=await page.locator('#miniMap').boundingBox();
 await page.mouse.click(atlas.x+(13.5/430)*atlas.width,atlas.y+(146.5/270)*atlas.height);
 await page.waitForFunction(()=>document.querySelector('#worldTitle')?.textContent==='潮環群島',null,{timeout:15000});
 const backField=await page.locator('#worldCanvas').boundingBox();
 await page.mouse.click(backField.x+backField.width/2+4*32*1.25,backField.y+backField.height/2);
 await page.waitForFunction(()=>document.querySelector('#worldTitle')?.textContent==='星風回廊',null,{timeout:12000});
 // Opt-in Small Journey retains the same controls while using a two-zone map.
 const miniResponse=await page.goto(origin+'/?prototype=1',{waitUntil:'load'});
 assert.ok(miniResponse?.ok(),'compact mode must load');
 await page.waitForFunction(()=>document.querySelector('#discovered')?.textContent==='0 / 4');
 assert.equal(await page.locator('#worldTitle').textContent(),'潮環・小さな旅');
 await page.locator('#mapBtn').click();
 assert.equal(await page.locator('#zoneList button').count(),2);
 await page.locator('#zoneList button').last().click();
 await page.waitForFunction(
  ()=>document.querySelector('#zoneName')?.textContent==='潮騒の旧港',
  null,{timeout:22000});
 await page.locator('#helpBtn').click();
 assert.ok(await page.getByRole('link',{name:'広い世界を遊ぶ（通常版）'}).isVisible());
 await page.locator('#helpPanel [data-close]').click();
 await checkJourney(page,origin);
 if(errors.length)throw new Error('JavaScript browser errors: '+errors.join(' | '));
 console.log('Browser smoke passed: default mobile exploration, 68 tracks, mainland bridge, compact two-zone walk.');
}
try{await main();}
catch(err){
 if(page)try{
  mkdirSync('test-results',{recursive:true});
  await page.screenshot({path:'test-results/browser-failure.png',fullPage:true});
 }catch{}
 console.error(err);
 process.exitCode=1;
}finally{
 await browser?.close().catch(()=>{});
 server.kill('SIGTERM');
}
