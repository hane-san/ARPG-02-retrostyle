import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {makeFixedRooms,gatePoint} from '../fixed-screens.js';
import {buildTrack} from '../music.js';

export async function checkFixedScreens(browser,origin){
 const rooms=makeFixedRooms(),reports=[];mkdirSync('test-results/fixed-screens',{recursive:true});
 for(const [width,height] of [[320,568],[390,844],[430,932],[844,390]]){
  const reduced=width===320,ctx=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference'}),p=await ctx.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{
   const P=CanvasRenderingContext2D.prototype,scale=P.scale,translate=P.translate,fill=P.fillRect,arc=P.arc,clear=P.clearRect;P.clearRect=function(...a){if(this.canvas.id==='fixedTerrainCanvas')window.fixedActors=[];return clear.apply(this,a);};let next=false;
   P.scale=function(x,y){const r=scale.call(this,x,y);if(this.canvas.id==='worldCanvas'){window.fixedBaseZoom=x;next=true;}if(this.canvas.id==='fixedTerrainCanvas'){const m=this.getTransform(),d=document.querySelector('#fixedCanvas').width/document.querySelector('#fixedCanvas').clientWidth;window.fixedFrame={a:m.a/d,d:m.d/d,x:m.e/d,y:m.f/d};}return r;};
   P.translate=function(x,y){if(next&&this.canvas.id==='worldCanvas'){window.fixedBaseEye={x:-x,y:-y};next=false;}return translate.call(this,x,y);};
   P.fillRect=function(x,y,w,h){if(this.fillStyle==='#b8d9dc'&&w===15&&h===3){const key=this.canvas.id==='worldCanvas'?'fixedBaseHero':this.canvas.id==='fixedTerrainCanvas'?'fixedHero':null;if(key)window[key]={x:(x-8)/32,y:(y-13)/32};if(this.canvas.id==='fixedTerrainCanvas'){const m=this.getTransform();(window.fixedActors||=[]).push({x:m.a*x+m.e,y:m.d*y+m.f});}}return fill.call(this,x,y,w,h);};
   P.arc=function(x,y,r,...args){if(this.canvas.id==='miniMap'&&this.fillStyle==='#fae5a1'&&document.body.classList.contains('fixed-sample'))window.fixedChartHero={x:x/this.canvas.width*45-.5,y:y/this.canvas.height*45-.5};return arc.call(this,x,y,r,...args);};
   const Native=window.AudioContext||window.webkitAudioContext;if(Native){const create=Native.prototype.createBufferSource;Native.prototype.createBufferSource=function(){const s=create.call(this),start=s.start.bind(s);s.start=(...a)=>{if(s.loop){window.fixedMusicStarts=(window.fixedMusicStarts||0)+1;window.fixedMusicSeconds=s.buffer?.duration;}return start(...a);};return s;};}
  });
  await p.goto(origin+'/');await p.waitForFunction(()=>window.fixedBaseEye&&window.fixedBaseHero);await p.clock.install();await p.clock.pauseAt(await p.evaluate(()=>Date.now()+100));
  const sample=p.locator('#fixedCanvas');let current=rooms[0];
  const baseSnapshot=()=>p.evaluate(()=>({hero:window.fixedBaseHero,eye:window.fixedBaseEye,zoom:window.fixedBaseZoom,track:document.querySelector('#trackSelect').value}));
  const frame=()=>p.evaluate(()=>window.fixedFrame);
  async function point(tile,base=false){return p.evaluate(({tile,base})=>{if(base){const r=document.querySelector('#worldCanvas').getBoundingClientRect();return{x:r.width/2+((tile.x+.5)*32-window.fixedBaseEye.x)*window.fixedBaseZoom,y:r.height/2+((tile.y+.5)*32-window.fixedBaseEye.y)*window.fixedBaseZoom};}const f=window.fixedFrame;return{x:f.x+(tile.x+.5)*32*f.a,y:f.y+(tile.y+.5)*32*f.d};},{tile,base});}
  async function openWaystone(){await p.locator('#worldCanvas').tap({position:await point({x:26,y:105},true)});await p.clock.runFor(3500);await p.locator('#fixedEnter').waitFor({state:'visible'});}
  async function settle(){for(let i=0;i<160;i++){await p.clock.runFor(100);if(await sample.getAttribute('aria-busy')==='false')return;}throw Error('fixed route did not settle');}
  async function position(){await p.locator('#mapBtn').click();const a=await p.evaluate(()=>window.fixedChartHero);await p.locator('#mapPanel [data-close]').click();return {x:Math.round(a.x-current.col*15),y:Math.round(a.y-current.row*15)};}
  async function enterFromHelp(){await p.locator('#helpBtn').click();await p.locator('#fixedHelpEnter').scrollIntoViewIfNeeded();await p.locator('#fixedHelpEnter').click();await p.clock.runFor(600);current=rooms[0];assert.equal(await p.locator('#zoneName').textContent(),current.name);}
  async function returned(snapshot){const lit=await p.locator('#worldCanvas').evaluate(c=>{const a=c.getContext('2d').getImageData(c.width/2,c.height/2,1,1).data;return a[0]+a[1]+a[2];});assert.ok(lit>0,'return paints the original world before the next animation frame');await p.clock.runFor(1200);assert.equal(await sample.isVisible(),false);assert.equal(await sample.evaluate(c=>c.width),1);const a=await baseSnapshot();assert.deepEqual(a.hero,snapshot.hero);assert.ok(Math.hypot(a.eye.x-snapshot.eye.x,a.eye.y-snapshot.eye.y)<.02,'return restores the held composition');assert.ok(Math.abs(a.zoom-snapshot.zoom)<.001);assert.equal(a.track,snapshot.track);await p.locator('#mapBtn').click();assert.equal(await p.locator('#zoneList button').count(),33);await p.locator('#mapPanel [data-close]').click();assert.deepEqual(errors,[]);}
  await openWaystone();await p.locator('#dialogueClose').click();
  // Preserve a deliberately held composition, not just a centred spawn.
  await p.mouse.move(width*.55,height*.36);await p.mouse.down();await p.mouse.move(width*.55+35,height*.36+24,{steps:6});await p.mouse.up();await p.clock.runFor(1200);await openWaystone();
  const saved=await baseSnapshot();await p.clock.runFor(250);await p.locator('#fixedEnter').click();await p.clock.runFor(1000);assert.equal(await p.locator('#zoneName').textContent(),current.name);
  const initial=await frame(),stage=await sample.boundingBox();assert.ok(Math.abs(initial.a-initial.d)<1e-9);assert.ok(initial.x>=11&&initial.y>=0&&initial.y+480*initial.d<stage.height);assert.ok(initial.a*32>=(width<height?19:15));
  await p.locator('#soundBtn').click();assert.equal(await p.locator('#trackSelect').inputValue(),'47:2');assert.equal(await p.locator('#musicToggle').textContent(),'OFF');const volumes={music:await p.locator('#volumeRange').inputValue(),sfx:await p.locator('#sfxVolumeRange').inputValue()};if(width===390)await p.locator('#musicToggle').click();await p.locator('#musicPanel [data-close]').click();
  let starts=0;if(width===390){const seconds=buildTrack(47,2).seconds;let ready=false;for(let i=0;i<350;i++){await p.clock.runFor(200);await new Promise(r=>setTimeout(r,10));if(await p.evaluate(s=>Math.abs((window.fixedMusicSeconds||0)-s)<.001,seconds)){ready=true;break;}}assert.ok(ready);starts=await p.evaluate(()=>window.fixedMusicStarts);}
  await sample.tap({position:await point({x:7,y:11})});await p.clock.runFor(400);assert.equal(await sample.isVisible(),true,'tapping the idle hero beside the waystone must not warp');assert.deepEqual(await position(),{x:7,y:11});
  await p.screenshot({path:`test-results/fixed-screens/${width}x${height}-entry.png`});
  // A real floor tap and multiple walking frames must not move the composition.
  await sample.tap({position:await point({x:8,y:9})});for(let i=0;i<5;i++){await p.clock.runFor(120);assert.deepEqual(await frame(),initial);}await settle();assert.deepEqual(await position(),{x:8,y:9});
  // A house goes to its real doorstep; a blocked edge is never an exit.
  await sample.tap({position:await point({x:3,y:5})});await settle();assert.equal(await p.locator('#dialogueName').textContent(),'窓の開いた家');await p.locator('#dialogueClose').click();assert.deepEqual(await position(),{x:4,y:8});
  await sample.tap({position:await point({x:0,y:14})});await p.clock.runFor(800);assert.deepEqual(await position(),{x:4,y:8});
  let slideSeen=false;
  async function exit(d,stress=false){
   const before=current,next=rooms.find(r=>r.id===before.connections[d]),f=await frame();let injected=false;assert.ok(next);
   await sample.tap({position:await point(gatePoint(d))});let arrived=false;
   for(let i=0;i<160;i++){
    await p.clock.runFor(80);const a=await frame();assert.ok(Math.abs(a.a-f.a)<1e-9&&Math.abs(a.d-f.d)<1e-9,'no transition zoom');const name=await p.locator('#zoneName').textContent();
    if(!reduced&&name===before.name&&(Math.abs(a.x-f.x)>1||Math.abs(a.y-f.y)>1)){
     slideSeen=true;const actors=await p.evaluate(()=>window.fixedActors||[]);assert.equal(actors.length,2);assert.ok(Math.hypot(actors[0].x-actors[1].x,actors[0].y-actors[1].y)<.01,'both board clips paint the same single world-space traveller');
     if(stress){await p.screenshot({path:`test-results/fixed-screens/${width}x${height}-slide.png`});for(let j=0;j<8;j++)await sample.tap({position:{x:stage.width*.4,y:stage.height*.7}});await p.keyboard.down('ArrowDown');stress=false;injected=true;}
    }
    if(name===next.name){arrived=true;break;}
   }
   assert.ok(arrived,'real field exit '+before.id+' '+d);current=next;await p.clock.runFor(400);assert.equal(await sample.getAttribute('aria-busy'),'false');const a=await frame();assert.deepEqual(a,initial,'every room keeps the common frame');
   const landing=await position();assert.ok(landing.x>=1&&landing.x<=13&&landing.y>=1&&landing.y<=13);const stay={...landing};await p.clock.runFor(600);assert.deepEqual(await position(),stay,'no automatic return loop');
   if(injected){await p.keyboard.down('ArrowDown');await p.clock.runFor(500);assert.equal(await p.locator('#zoneName').textContent(),current.name);assert.deepEqual(await position(),stay,'a key pressed during the slide remains suppressed');await p.keyboard.up('ArrowDown');}
   assert.equal(await p.locator('#trackSelect').inputValue(),'47:2');if(width===390)assert.equal(await p.evaluate(()=>window.fixedMusicStarts),starts,'room changes must never restart the native loop');
   if(current.id==='bridge'){const here=await position();await sample.tap({position:await point({x:9,y:4})});await p.clock.runFor(600);assert.deepEqual(await position(),here,'water remains a real collision surface');}
   await p.screenshot({path:`test-results/fixed-screens/${width}x${height}-${current.id}.png`});
   reports.push({viewport:`${width}x${height}`,stage:{w:stage.width,h:stage.height},frame:initial,reduced,from:before.id,to:current.id,direction:d,landing,cue:'47:2',scale:initial.a});
  }
  let first=true;for(const d of ['N','N','E','E','S','W','S','W']){await exit(d,first);first=false;}
  assert.equal(current.id,'hearth');assert.equal(slideSeen,!reduced);
  for(const d of ['N','E','S','W'])await exit(d);assert.equal(current.id,'hearth');
  await p.locator('#soundBtn').click();assert.equal(await p.locator('#volumeRange').inputValue(),volumes.music);assert.equal(await p.locator('#sfxVolumeRange').inputValue(),volumes.sfx);assert.equal(await p.locator('#sfxToggle').textContent(),'ON');await p.locator('#musicPanel [data-close]').click();
  // Leave in the middle of a slide, with the original world still untouched.
  if(!reduced){await sample.tap({position:await point(gatePoint('N'))});for(let i=0;i<150;i++){await p.clock.runFor(50);if(Math.abs((await frame()).y-initial.y)>1)break;}}
  await p.locator('#helpBtn').click();assert.equal(await p.locator('#trialHelpReturn').isVisible(),false);await p.locator('#fixedReturn').click();await returned(saved);await p.clock.runFor(1500);assert.equal(await p.locator('#zoneName').textContent(),'白い船着場');
  // A second origin uses the actual existing random warp UI, not a hero setter.
  if(width===390){
   await openWaystone();let found=false;for(let i=0;i<19;i++){await p.clock.runFor(250);await p.locator('#trialJump').click();if(await p.locator('#zoneName').textContent()==='空の生活集落'){found=true;break;}}assert.ok(found);await p.locator('#dialogueClose').click();await p.clock.runFor(800);const village=await baseSnapshot();await enterFromHelp();await p.locator('#soundBtn').click();assert.equal(await p.locator('#musicToggle').textContent(),'ON');await p.locator('#musicToggle').click();await p.locator('#musicPanel [data-close]').click();await sample.tap({position:await point({x:7,y:12})});await returned(village);assert.equal(await p.locator('#musicToggle').textContent(),'OFF');
   // Re-enter repeatedly and rotate while a slide is underway.
   await enterFromHelp();await sample.tap({position:await point(gatePoint('N'))});for(let i=0;i<150;i++){await p.clock.runFor(50);if(Math.abs((await frame()).y-initial.y)>1)break;}await p.setViewportSize({width:844,height:390});await p.clock.runFor(1000);current=rooms.find(r=>r.id==='cypresses');assert.equal(await p.locator('#zoneName').textContent(),current.name);const pos=await position();assert.equal(pos.y,13);await p.setViewportSize({width,height});await p.clock.runFor(500);await p.locator('#helpBtn').click();await p.locator('#fixedReturn').click();await returned(village);
  }
  if(width===320){
   // Enter during an ordinary in-flight step: return to the last safe cell.
   await p.keyboard.press('ArrowRight');await p.clock.runFor(60);await enterFromHelp();await sample.tap({position:await point({x:7,y:12})});await p.clock.runFor(1000);const a=await baseSnapshot();assert.equal(await sample.isVisible(),false);assert.deepEqual(a.hero,saved.hero);assert.equal(await p.locator('#worldCanvas').getAttribute('aria-busy'),'false');
  }
  const tools=await p.locator('.journey-tool').evaluateAll(a=>a.map(b=>{const r=b.getBoundingClientRect();return {w:r.width,h:r.height};}));assert.ok(tools.every(r=>r.w>=44&&r.h>=44));assert.deepEqual(errors,[]);await ctx.close();console.log(`Fixed screens ${width}x${height}: eight rooms, branch, held framing, field gates, slide input, BGM and safe return passed.`);
 }
 for(const q of ['?mode=classic','?prototype=1','?atlas=previous','?maze=turns']){const p=await browser.newPage();await p.goto(origin+'/'+q);assert.equal(await p.locator('#fixedEnter').count(),0);assert.equal(await p.locator('#fixedCanvas').count(),0);await p.close();}
 const compare=await browser.newPage({viewport:{width:390,height:844}});await compare.goto(origin+'/?camera=directional');await compare.locator('#helpBtn').click();await compare.locator('#fixedHelpEnter').click();await compare.locator('#fixedCanvas').waitFor({state:'visible'});await compare.locator('#helpBtn').click();await compare.locator('#fixedReturn').click();await compare.locator('#fixedCanvas').waitFor({state:'hidden'});await compare.locator('#helpBtn').click();assert.equal(await compare.getByRole('link',{name:'以前の追従（比較）'}).getAttribute('aria-current'),'page');await compare.close();
 writeFileSync('test-results/fixed-screens/routes.json',JSON.stringify(reports,null,2));
}
