import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {makeFixedRooms,fixedLayout,gatePoint,FIXED_START} from '../fixed-screens.js';
import {fixedAreaAt} from '../fixed-areas.js';

// Producer decision 2026-11-12: `/` opens the screen-switching journey, music
// follows areas, boards gain small discoveries, and the connected world stays
// one tap (or ?walk=1) away. Ordinary Canvas taps only; no position setter.
export async function checkFixedDefault(browser,origin){
 const rooms=makeFixedRooms(),get=id=>rooms.find(r=>r.id===id),reports=[];mkdirSync('test-results/fixed-default',{recursive:true});
 for(const [width,height] of [[390,844],[320,568],[430,932],[844,390]]){
  const ctx=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(origin+'/');const canvas=p.locator('#fixedCanvas');await canvas.waitFor({state:'visible'});await p.clock.install();
  const start=get(FIXED_START.room);
  assert.equal(await p.locator('#worldCanvas').isVisible(),false,'the connected world waits underneath');
  assert.equal(await p.locator('#zoneName').textContent(),start.name);
  assert.equal(await p.locator('#zoneSub').textContent(),fixedAreaAt(start.col,start.row).name,'the place bar names the music area');
  assert.equal(await p.locator('#trackSelect').inputValue(),start.cue);
  const stage=await canvas.boundingBox(),l=fixedLayout(stage.width,stage.height),point=t=>({x:l.x+(t.x+.5)*32*l.scale,y:l.y+(t.y+.5)*32*l.scale});
  if(width<height){assert.ok(l.y>stage.height*.3,'portrait keeps the board low, with the place behind it above');assert.ok(l.y+l.height<=stage.height,'the whole board stays above the dock');}
  await p.screenshot({path:`test-results/fixed-default/${width}x${height}-entry.png`});
  let current=start;
  async function cross(d){const next=get(current.connections[d]);await canvas.tap({position:point(gatePoint(d,current))});for(let i=0;i<200;i++){await p.clock.runFor(100);if(await p.locator('#zoneName').textContent()===next.name)break;}assert.equal(await p.locator('#zoneName').textContent(),next.name,'walk '+current.id+' '+d);await p.clock.runFor(700);current=next;}
  // East stays in the travel hub: the same area keeps the same piece.
  await cross('E');assert.equal(current.area,start.area);assert.equal(await p.locator('#trackSelect').inputValue(),start.cue,'same area, same piece');
  await cross('W');
  // South leaves for the windmill fields: a new area brings its own piece.
  await cross('S');assert.notEqual(current.area,start.area);assert.equal(await p.locator('#trackSelect').inputValue(),current.cue);assert.equal(await p.locator('#zoneSub').textContent(),current.areaName);
  // A glint is a quiet line of text; a signpost names real exits.
  const glint=current.features.find(f=>f.kind==='glint');assert.ok(glint,'the windmill fields keep a small discovery');
  await canvas.tap({position:point({x:glint.x,y:glint.y})});for(let i=0;i<120;i++){await p.clock.runFor(100);if(await p.locator('#dialogue').isVisible())break;}
  assert.equal(await p.locator('#dialogueName').textContent(),'小さな発見');await p.clock.runFor(2500);assert.ok((await p.locator('#dialogueText').textContent()).length>8);
  if(width===390)await p.screenshot({path:`test-results/fixed-default/${width}x${height}-glint.png`});
  await p.locator('#dialogueClose').click();
  const sign=current.features.find(f=>f.kind==='sign');
  if(sign){await canvas.tap({position:point({x:sign.cells[0][0],y:sign.cells[0][1]})});for(let i=0;i<120;i++){await p.clock.runFor(100);if(await p.locator('#dialogue').isVisible())break;}assert.equal(await p.locator('#dialogueName').textContent(),'道しるべ');await p.clock.runFor(2500);const text=await p.locator('#dialogueText').textContent();assert.ok(Object.values(current.connections).some(id=>text.includes(get(id).chartName)),'the sign names a neighbour');await p.locator('#dialogueClose').click();}
  // Help leads with the screen-switching journey and offers the connected one.
  await p.locator('#helpBtn').click();assert.equal(await p.locator('.fixed-help').isVisible(),true);assert.equal(await p.locator('#fixedHelpEnter').isVisible(),false);
  for(const e of await p.locator('#helpPanel .walk-help').all())assert.equal(await e.isVisible(),false,'connected-world notes step aside');
  const leave=p.locator('#fixedReturn');assert.equal(await leave.textContent(),'つながった大地を歩く（以前の旅）');await leave.scrollIntoViewIfNeeded();await leave.click();await p.clock.runFor(800);
  assert.equal(await canvas.isVisible(),false);assert.equal(await p.locator('#worldCanvas').isVisible(),true,'the connected pilgrimage opens at its usual start');
  await p.locator('#helpBtn').click();assert.equal(await p.locator('#fixedHelpEnter').isVisible(),true);assert.equal(await p.locator('#helpPanel .walk-help').first().isVisible(),true);await p.locator('#fixedHelpEnter').scrollIntoViewIfNeeded();await p.locator('#fixedHelpEnter').click();await p.clock.runFor(800);
  assert.equal(await canvas.isVisible(),true);assert.equal(await p.locator('#zoneName').textContent(),start.name,'re-entering starts again at the central hub');
  assert.deepEqual(errors,[]);reports.push({viewport:`${width}x${height}`,scale:l.scale,board:{x:l.x,y:l.y,size:l.width},area:start.areaName});await ctx.close();
 }
 // ?walk=1 keeps the connected pilgrimage as the opening world.
 const walk=await browser.newPage({viewport:{width:390,height:844}});await walk.goto(origin+'/?walk=1');await walk.waitForSelector('.journey-menu');await walk.waitForTimeout(400);
 assert.equal(await walk.locator('#fixedCanvas').isVisible(),false);assert.equal(await walk.locator('#worldCanvas').isVisible(),true);await walk.close();
 writeFileSync('test-results/fixed-default/report.json',JSON.stringify(reports,null,1));
 console.log('Fixed default entrance, area music, discoveries, help and connected-world switch passed at',reports.map(r=>r.viewport).join(', '));
}
