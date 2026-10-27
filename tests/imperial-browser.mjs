import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {IMPERIAL_SITES,IMPERIAL_VISTAS,IMPERIAL_ZONES} from '../journey-imperial.js';
import {JOURNEY_W,JOURNEY_H} from '../journey-world.js';
import {IMPERIAL_SCORE_START} from '../music.js';

// Actual Canvas rendering and atlas-to-site walks. No teleport, faster game clock or production debug API.
export async function checkImperialStudies(page,origin){
 await page.goto(origin+'/');await page.waitForSelector('#worldCanvas');
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
 console.log('Imperial studies: 8 actual Canvas vistas, local art response, 7 atlas regions, actual bridge-to-temple walk and reinvestigation, 6 new scores available.');
}
