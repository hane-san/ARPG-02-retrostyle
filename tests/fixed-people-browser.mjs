import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {makeFixedRooms,fixedLayout} from '../fixed-screens.js';
import {walkFixedBrowser} from './fixed-route.mjs';
export async function checkFixedPeople(browser,origin){
 const rooms=makeFixedRooms(),report=[];mkdirSync('test-results/fixed-people',{recursive:true});
 for(const [width,height]of [[320,568],[390,844]]){
  const ctx=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(origin);await p.locator('#fixedCanvas').waitFor();await p.clock.install();await p.clock.pauseAt(await p.evaluate(()=>Date.now()+100));await p.clock.runFor(900);
  let current='watershed-wheel';
  for(const id of ['watershed-wheel','canal-bend','river-mill','forest-picnic','river-mill','canal-bend','watershed-wheel']){
   await walkFixedBrowser(p,id,current);current=id;await p.clock.runFor(1000);const room=rooms.find(r=>r.id===id),n=id==='watershed-wheel'&&report.some(v=>v.width===width&&v.id===id)?room.npcs[0]:room.npcs.at(-1),canvas=p.locator('#fixedCanvas'),box=await canvas.boundingBox(),l=fixedLayout(box.width,box.height);
   await canvas.tap({position:{x:l.x+(n.x+.5)*32*l.scale,y:l.y+(n.y+.5)*32*l.scale}});
   for(let i=0;i<220;i++){await p.clock.runFor(100);if(await p.locator('#dialogue').isVisible())break;}
   assert.equal(await p.locator('#dialogueName').textContent(),n.name);await p.clock.runFor(4000);assert.equal(await p.locator('#dialogueText').textContent(),n.lines[0]);
   const card=await p.locator('#dialogue').boundingBox();assert.ok(card.x>=0&&card.x+card.width<=width+1&&card.y>=0&&card.y+card.height<=height+1,'readable portrait card');
   await p.screenshot({path:`test-results/fixed-people/${width}-${id}-${n.x}-${n.y}.png`});await p.locator('#dialogueNext').click();await p.clock.runFor(4000);assert.equal(await p.locator('#dialogueText').textContent(),n.lines[1]);await p.locator('#dialogueNext').click();await p.clock.runFor(200);assert.equal(await p.locator('#dialogue').isVisible(),false);
   report.push({width,id,name:n.name,lines:n.lines,card});
  }
  assert.deepEqual(errors,[]);await ctx.close();
 }
 writeFileSync('test-results/fixed-people/conversations.json',JSON.stringify(report,null,2));console.log('Atlas people: both short lines, portrait fit, normal tap conversations and return trip passed.');
}
