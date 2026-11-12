import {SOUTHEAST_STUDIES} from '../southeast-world.js';
import {buildTrack} from '../music.js';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {WEST_STUDIES} from '../western-world.js';
import {PILGRIM_W,PILGRIM_H} from '../pilgrimage-world.js';
export async function checkWestern(browser,origin,{quick=false,viewports=[[320,568],[390,844],[844,390]]}={}){
 mkdirSync('test-results/western',{recursive:true});const results=[];
 for(const [width,height] of (quick?[[390,844]]:viewports)){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(({w,h})=>{
   const fillText=CanvasRenderingContext2D.prototype.fillText,clearRect=CanvasRenderingContext2D.prototype.clearRect;
   CanvasRenderingContext2D.prototype.clearRect=function(...args){if(this.canvas.id==='miniMap')window.westChartLabels=[];return clearRect.apply(this,args);};
   CanvasRenderingContext2D.prototype.fillText=function(text,x,y,...args){if(this.canvas.id==='miniMap'){const font=Number(this.font.match(/([\d.]+)px/)[1]);(window.westChartLabels??=[]).push({text,x,y,w:this.measureText(text).width+font*.5,h:font*4/3});}return fillText.call(this,text,x,y,...args);};
   const Native=window.AudioContext||window.webkitAudioContext;
   if(Native){const create=Native.prototype.createBufferSource;Native.prototype.createBufferSource=function(){const source=create.call(this),start=source.start.bind(source);source.start=(...args)=>{if(source.loop){window.westBufferSeconds=source.buffer?.duration;window.westMusicStarts=(window.westMusicStarts||0)+1;}return start(...args);};return source;};}

   const arc=CanvasRenderingContext2D.prototype.arc,scale=CanvasRenderingContext2D.prototype.scale,translate=CanvasRenderingContext2D.prototype.translate;let next=false;
   CanvasRenderingContext2D.prototype.arc=function(x,y,r,...rest){if(this.canvas.id==='miniMap'&&this.fillStyle==='#fae5a1')window.westPosition={x:x/this.canvas.width*w-.5,y:y/this.canvas.height*h-.5};return arc.call(this,x,y,r,...rest);};
   CanvasRenderingContext2D.prototype.scale=function(x,y){if(this.canvas.id==='worldCanvas'){next=true;window.westZoom=x;}return scale.call(this,x,y);};
   CanvasRenderingContext2D.prototype.translate=function(x,y){if(next&&this.canvas.id==='worldCanvas'){next=false;window.westCamera={x:-x,y:-y};}return translate.call(this,x,y);};
  },{w:PILGRIM_W,h:PILGRIM_H});
  await page.goto(origin+'/?walk=1');await page.waitForSelector('.journey-menu');await page.clock.install();
  async function settle(onEnter){let captured=false;for(let i=0;i<450;i++){await page.clock.runFor(1000);assert.deepEqual(errors,[]);if(onEnter&&!captured&&await page.locator('#zoneName').textContent()===onEnter.name){await snapshot(onEnter.key+'-entry');captured=true;}if(await page.locator('#worldCanvas').getAttribute('aria-busy')==='false')return;}throw Error('western route did not arrive');}
  async function position(){await page.locator('#mapBtn').click();const p=await page.evaluate(()=>window.westPosition);await page.locator('#mapPanel [data-close]').click();return {x:Math.round(p.x),y:Math.round(p.y)};}
  async function region(z){await page.locator('#mapBtn').click();const b=page.locator(`[data-zone="${z.id}"]`);await b.scrollIntoViewIfNeeded();await b.click();await settle(z);assert.deepEqual(await position(),{x:z.cx,y:z.cy});await page.clock.runFor(2200);assert.equal(await page.locator('#zoneName').textContent(),z.name);await page.locator('#soundBtn').click();assert.equal(await page.locator('#trackSelect').inputValue(),z.music[0]);await page.locator('#musicPanel [data-close]').click();
   if(width===390&&!quick){const [id,phase]=z.music[0].split(':').map(Number),seconds=buildTrack(id,phase).seconds;let playing=false;for(let i=0;i<250;i++){await page.clock.runFor(200);await new Promise(resolve=>setTimeout(resolve,10));if(await page.evaluate(seconds=>Math.abs((window.westBufferSeconds||0)-seconds)<.001,seconds)){playing=true;break;}}assert.ok(playing,'native audio loop matches the region, not just its selector: '+JSON.stringify({region:z.key,expected:seconds,actual:await page.evaluate(()=>({seconds:window.westBufferSeconds,starts:window.westMusicStarts,hidden:document.hidden,on:document.querySelector('#musicToggle').textContent}))}));}
   await page.locator('#homeBtn').click();await page.clock.runFor(3000);}
  async function snapshot(key){await page.screenshot({path:`test-results/western/${width}x${height}-${key}.png`});const pixels=await page.locator('#worldCanvas').evaluate(c=>{const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data,s=new Set();for(let i=0;i<data.length;i+=40)s.add(data[i]+','+data[i+1]+','+data[i+2]);return s.size;});assert.ok(pixels>25,key+' has actual scenery');if(key==='cliff-day'){const light=await page.locator('#worldCanvas').evaluate(c=>{const p=c.getContext('2d').getImageData(Math.floor(c.width/2),Math.floor(c.height*.1),1,1).data;return p[0]+p[1]+p[2];});assert.ok(light>150,'transparent sky chunks cannot return as an opaque black opening');}}
  if(width===390&&!quick){await page.locator('#soundBtn').click();await page.locator('#musicToggle').click();await page.locator('#musicPanel [data-close]').click();}
  const cliff=WEST_STUDIES[0];await region(cliff);await snapshot('cliff-day');results.push({viewport:`${width}x${height}`,region:cliff.id,cue:cliff.music[0],position:await position(),nativeLoopSeconds:await page.evaluate(()=>window.westBufferSeconds||null)});const cliffStarts=await page.evaluate(()=>window.westMusicStarts||0);
  if(width===390&&!quick){await page.setViewportSize({width:844,height:390});await page.clock.runFor(1500);await snapshot('cliff-rotated');await page.setViewportSize({width,height});await page.clock.runFor(1500);}
  // A real field tap on the open cliff corridor retains the composition, then follows.
  const p=await page.evaluate(()=>{const r=document.querySelector('#worldCanvas').getBoundingClientRect(),a=window.westCamera,z=window.westZoom;return {x:r.width/2+(120.5*32-a.x)*z,y:r.height/2+(345.5*32-a.y)*z};});
  await page.locator('#worldCanvas').tap({position:p});await settle();assert.deepEqual(await position(),{x:120,y:345});if(width===390&&!quick)assert.equal(await page.evaluate(()=>window.westMusicStarts),cliffStarts,'ordinary steps inside one land do not restart its music');
  await page.clock.runFor(82000);await snapshot('cliff-middle');await page.clock.runFor(95000);await snapshot('cliff-dusk');
  if(quick){await context.close();return;}
  // Both cameras share the same land and regional scales.
  // Full A/B interaction regression remains in journey-deadzone-browser.mjs.
  for(const key of ['glass','village','windmill','terrace','mountain','grass','azure','lane','shoal','impression','dots']){
   const z=WEST_STUDIES.find(z=>z.key===key);await region(z);await snapshot(key);
   await page.mouse.move(width*.82,height*.12);await page.mouse.down();await page.mouse.move(width*.82,height*.55,{steps:10});await page.mouse.up();await page.clock.runFor(1600);await snapshot(key+'-look');await page.locator('#homeBtn').click();await page.clock.runFor(1600);
   results.push({viewport:`${width}x${height}`,region:z.id,cue:z.music[0],position:await position(),nativeLoopSeconds:await page.evaluate(()=>window.westBufferSeconds||null)});console.log(`Western ${width}x${height}: ${z.name} → ${z.music[0]}`);
   if(key==='glass'){
    const target=await page.evaluate(({cx,cy})=>{const r=document.querySelector('#worldCanvas').getBoundingClientRect(),c=window.westCamera,z=window.westZoom;return {x:r.width/2+((cx+4.5)*32-c.x)*z,y:r.height/2+((cy+2.5)*32-c.y)*z};},z);
    await page.locator('#worldCanvas').tap({position:target});await settle();assert.equal(await page.locator('#dialogueName').textContent(),'鉢を運ぶ人');await page.locator('#dialogueClose').click();await region(z);
   }
   if(key==='terrace'){

    // Keyboard walks the visible central stairs to the upper field; no relocation.
    for(let step=0;step<33;step++){await page.keyboard.press('ArrowUp');await page.clock.runFor(200);}await settle();const top=await position();assert.ok(top.y<z.cy-10,'stairs connect upper fields');await page.locator('#homeBtn').click();await page.clock.runFor(1600);await snapshot('terrace-upper');await region(z);
   }
  }
  // New southeast countries use exactly the same ordinary walking and native
  // sound path as the twelve existing studies, at every mobile viewport.
  for(const z of SOUTHEAST_STUDIES){await region(z);await snapshot('southeast-'+z.key);results.push({viewport:`${width}x${height}`,region:z.id,cue:z.music[0],position:await position(),nativeLoopSeconds:await page.evaluate(()=>window.westBufferSeconds||null)});console.log(`Southeast ${width}x${height}: ${z.name} → ${z.music[0]}`);}
  for(const key of ['marsh','port','mesa','port','marsh','coast'])await region(SOUTHEAST_STUDIES.find(z=>z.key===key));
  // Short outward/return transitions restore each authored cue, including BGM OFF.
  for(const key of ['impression','dots','impression','dots'])await region(WEST_STUDIES.find(z=>z.key===key));
  await page.locator('#soundBtn').click();if(width===390){assert.equal(await page.locator('#musicToggle').textContent(),'ON');await page.locator('#musicToggle').click();}
  assert.equal(await page.locator('#musicToggle').textContent(),'OFF');await page.locator('#musicToggle').click();assert.equal(await page.locator('#musicToggle').textContent(),'ON');assert.equal(await page.locator('#trackSelect').inputValue(),'47:1');await page.locator('#musicToggle').click();await page.locator('#musicPanel [data-close]').click();
  await page.locator('#mapBtn').click();await page.screenshot({path:`test-results/western/${width}x${height}-atlas.png`});
  const labels=await page.evaluate(()=>window.westChartLabels);const atlasRect=await page.locator('#miniMap').boundingBox();assert.ok(labels.length>=Math.min(20,Math.floor(atlasRect.height/16)),'the atlas retains readable names at its actual display size');
  for(let a=0;a<labels.length;a++)for(let b=a+1;b<labels.length;b++)assert.ok(Math.abs(labels[a].x-labels[b].x)>=(labels[a].w+labels[b].w)/2||Math.abs(labels[a].y-labels[b].y)>=Math.max(labels[a].h,labels[b].h),'actual clamped atlas labels overlap: '+JSON.stringify([labels[a],labels[b]]));
  assert.equal(await page.locator('#zoneList button').count(),33);assert.deepEqual(errors,[]);await context.close();
 }
 // The named former camera remains available for comparison on the same cliff.
 const page=await browser.newPage({viewport:{width:390,height:844}});await page.goto(origin+'/?camera=directional');await page.clock.install();await page.locator('#mapBtn').click();await page.locator('[data-zone="pilgrim-19"]').click();
 for(let i=0;i<150;i++){await page.clock.runFor(1000);if(await page.locator('#worldCanvas').getAttribute('aria-busy')==='false')break;}
 assert.equal(await page.locator('#zoneName').textContent(),WEST_STUDIES[0].name);await page.locator('#homeBtn').click();await page.clock.runFor(5000);await page.screenshot({path:'test-results/western/directional-cliff.png'});await page.close();
 writeFileSync('test-results/western/'+(viewports.length===3?'routes.json':'routes-'+viewports.map(v=>v.join('x')).join('-')+'.json'),JSON.stringify(results,null,2));console.log('Western: all sixteen landscapes walked at '+viewports.length+' mobile viewport(s); regional cues, return travel, stairs, both camera variants. Virtual clock advanced; no product movement/state patched.');
}
