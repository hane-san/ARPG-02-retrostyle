import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {IMPERIAL_SITES,IMPERIAL_VISTAS,IMPERIAL_ZONES} from '../journey-imperial.js';
import {JOURNEY_W,JOURNEY_H} from '../journey-world.js';
import {IMPERIAL_SCORE_START} from '../music.js';

// Actual Canvas rendering and atlas-to-site walks. No teleport, faster game clock or production debug API.
export async function checkImperialStudies(page,origin){
 await page.goto(origin+'/?atlas=previous');await page.waitForSelector('#worldCanvas');
 const render=await page.evaluate(async()=>{
  const {IMPERIAL_VISTAS,IMPERIAL_SITES}=await import('./journey-imperial.js');
  const {drawImperialVista,drawImperialSite}=await import('./journey-imperial-art.js');
  const {imperialResponse}=await import('./journey-imperial.js');
  const results=[];
  for(const v of IMPERIAL_VISTAS){
   const c=document.createElement('canvas');drawImperialVista(c,v.kind,0);
   const pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
   const colours=new Set();for(let i=0;i<pixels.length;i+=4)colours.add(pixels[i]+','+pixels[i+1]+','+pixels[i+2]);
   results.push({kind:v.kind,width:c.width,height:c.height,colours:colours.size});
  }
  const s=IMPERIAL_SITES.find(s=>s.form==='confluence'),c=document.createElement('canvas');c.width=s.w*32;c.height=s.h*32;
  const ctx=c.getContext('2d');drawImperialSite(ctx,s,0,0,c.width,c.height,c.width/2,0);
  const before=ctx.getImageData(0,0,c.width,c.height).data.slice();imperialResponse(s);ctx.clearRect(0,0,c.width,c.height);
  drawImperialSite(ctx,s,0,0,c.width,c.height,c.width/2,0);
  const after=ctx.getImageData(0,0,c.width,c.height).data;let changed=0;for(let i=0;i<after.length;i++)if(before[i]!==after[i])changed++;
  return {results,changed};
 });
 assert.equal(render.results.length,IMPERIAL_VISTAS.length);
 for(const r of render.results){assert.deepEqual([r.width,r.height],[480,252]);assert.ok(r.colours>20,r.kind+' must be a drawn composition');}
 assert.ok(render.changed>30,'investigation visibly affects the local art');
 await page.locator('#mapBtn').click();
 for(const z of IMPERIAL_ZONES)assert.equal(await page.locator(`[data-zone="${z.id}"]`).count(),1);
 await page.locator('#mapPanel [data-close]').click();
 const s=IMPERIAL_SITES.find(s=>s.form==='confluence');
 async function investigate(){
  await page.locator('#mapBtn').click();const map=await page.locator('#miniMap').boundingBox();
  await page.mouse.click(map.x+(s.x+s.w/2)/JOURNEY_W*map.width,map.y+(s.y+s.h/2)/JOURNEY_H*map.height);
  await page.waitForSelector('#dialogue:not(.hidden)',{timeout:90000});
  assert.equal(await page.locator('#dialogueName').textContent(),s.name);
  const text=await page.locator('#dialogue').innerText();
  await page.locator('#dialogueClose').click();return text;
 }
 await investigate();
 assert.equal(await page.locator('#zoneName').textContent(),'合水の巡礼路');
 await investigate();
 await page.locator('#soundBtn').click();
 for(let i=IMPERIAL_SCORE_START;i<IMPERIAL_SCORE_START+3;i++)for(const phase of [1,2])assert.equal(await page.locator(`#trackSelect option[value="${i}:${phase}"]`).count(),1);
 await page.locator('#musicPanel [data-close]').click();
 mkdirSync('test-results',{recursive:true});await page.screenshot({path:'test-results/imperial-watercourt.png'});
 // Compare the walkable spaces in real time, not just their optional vistas.
 async function walkTo(x,y,label){
  await page.locator('#mapBtn').click();const box=await page.locator('#miniMap').boundingBox();
  await page.mouse.click(box.x+(x+.72)/JOURNEY_W*box.width,box.y+(y+.72)/JOURNEY_H*box.height);
  await page.waitForFunction(()=>document.querySelector('#worldCanvas').getAttribute('aria-busy')==='false',null,{timeout:60000});
  if(await page.locator('#dialogue:not(.hidden)').count())await page.locator('#dialogueClose').click();
  const inside=IMPERIAL_SITES.find(s=>x>=s.x&&x<s.x+s.w&&y>=s.y&&y<s.y+s.h);
  if(inside&&x===inside.entrance.x&&y<inside.entrance.y){
   for(let step=inside.entrance.y;step>y;step--){await page.keyboard.press('ArrowUp');await page.waitForTimeout(230);}
  }
  await page.locator('#homeBtn').click();
  await page.waitForTimeout(800);
  await page.screenshot({path:`test-results/imperial-${label}.png`});
 }
 await walkTo(196,79,'open-court');
 // The same coordinates within the two plans now admit the traveller between
 // the pillars, rather than an invisible whole-building collision rectangle.
 await walkTo(222,129,'wet-interior');
 assert.equal(await page.locator('#zoneName').textContent(),'水を受ける庭');
 await walkTo(262,129,'dry-interior');
 assert.equal(await page.locator('#zoneName').textContent(),'水を失った庭');
 await walkTo(269,43,'ridge-approach');
 await walkTo(273,57,'notch-approach');
 await walkTo(289,71,'gate-scale');
 await walkTo(253,68,'sealed-approach');
 await page.locator('#soundBtn').click();
 // BGM has a diegetic quiet zone without overwriting the player's ON preference.
 if(await page.locator('#musicToggle').textContent()==='OFF')await page.locator('#musicToggle').click();
 await page.waitForFunction(()=>document.querySelector('#nowPlaying').textContent.includes('静まります'));
 assert.equal(await page.locator('#musicToggle').textContent(),'ON');
 await page.locator('#musicPanel [data-close]').click();
 await walkTo(253,78,'outside-sealed');
 await page.locator('#soundBtn').click();
 assert.ok((await page.locator('#nowPlaying').textContent()).startsWith('再生中：'));
 await page.locator('#musicToggle').click();
 await page.locator('#musicPanel [data-close]').click();
 console.log('Imperial studies: 8 actual Canvas vistas, local art response, 7 atlas regions, actual bridge-to-temple walk and reinvestigation, 6 new scores available.');
 console.log('Imperial comparison: actual open/wet/dry interior walks, ridge and notch, gate scale, sealed quiet and resumed BGM preference.');
}
