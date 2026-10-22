// Real-time UI walks, with no teleport, frame acceleration, or production debug
// hook. The visible atlas marker provides the final position for assertions.
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {JOURNEY_PLAYLISTS} from '../journey-music.js';
import {MUSIC_LIBRARY,ORIGINAL_SCORE_COUNT} from '../music.js';
import {RUINS_ZONES,RUINS_SITES} from '../journey-ruins.js';

export async function checkJourney(page,origin){
 mkdirSync('test-results',{recursive:true});
 // Test-only Web Audio instrumentation: the UI must actually schedule sound,
 // and crossing regions must not create a new audio context each time.
 await page.addInitScript(()=>{
  const Native=window.AudioContext;
  const probe=window.journeyAudioProbe={contexts:[],notes:0,footfalls:0};
  window.AudioContext=class extends Native{
   constructor(...args){super(...args);probe.contexts.push(this);}
   createOscillator(){const oscillator=super.createOscillator();const start=oscillator.start.bind(oscillator);oscillator.start=(...args)=>{probe.notes++;return start(...args);};return oscillator;}
   createBufferSource(){const source=super.createBufferSource();const start=source.start.bind(source);source.start=(...args)=>{probe.footfalls++;return start(...args);};return source;}
  };
  window.journeyVistaDraws=0;
  const scale=CanvasRenderingContext2D.prototype.scale,translate=CanvasRenderingContext2D.prototype.translate;
  let cameraNext=false;
  CanvasRenderingContext2D.prototype.scale=function(x,y){
   if(this.canvas.id==='worldCanvas'){window.journeyRenderZoom=x;cameraNext=true;}
   return scale.call(this,x,y);
  };
  // The translate right after the zoom is the painted camera centre.
  CanvasRenderingContext2D.prototype.translate=function(x,y){
   if(cameraNext&&this.canvas.id==='worldCanvas'){window.journeyRenderCamera={x:-x,y:-y};cameraNext=false;}
   return translate.call(this,x,y);
  };
  const draw=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(...args){
   if(this.canvas.id==='vistaCanvas')window.journeyVistaDraws++;
   return draw.apply(this,args);
  };
 });
 const response=await page.goto(origin+'/',{waitUntil:'load'});
 assert.ok(response?.ok());
 await page.waitForFunction(total=>document.querySelector('#discovered')?.textContent==='0 / '+total,35+RUINS_SITES.length);
 assert.equal(await page.locator('#worldTitle').textContent(),'小さく壮大な旅');
 assert.equal(await page.title(),'潮環群島 × 星風回廊 — TIDAL ATLAS');
 assert.equal(await page.locator('#zoneName').textContent(),'白い船着場');
 assert.ok(await page.locator('.topbar').isHidden());
 assert.ok(await page.locator('.map-hint').isHidden());
 assert.ok(await page.locator('.discover').isHidden());
 assert.ok(await page.locator('#vistaBtn').isVisible(),'a distant view is available at departure');
 await page.waitForFunction(()=>Math.abs(window.journeyRenderZoom-1)<.002);
 await page.screenshot({path:'test-results/journey-port.png'});
 // Directly render the optional distant cliff panorama as well as the original
 // scene. A scenic view can be geographically reachable yet fail only on open.
 const skyPixels=await page.evaluate(async()=>{
  const {drawJourneyPanorama}=await import('./journey-panorama.js');
  const canvas=document.createElement('canvas');
  drawJourneyPanorama(canvas,'sky-edge',0);
  const context=canvas.getContext('2d');
  const sample=(x,y)=>Array.from(context.getImageData(x,y,1,1).data).slice(0,3);
  return {w:canvas.width,h:canvas.height,sky:sample(215,70),horizon:sample(215,200)};
 });
 assert.deepEqual([skyPixels.w,skyPixels.h],[480,252]);
 assert.ok(skyPixels.sky[2]>skyPixels.sky[0],'cliff outlook is cool, open sky');
 assert.ok(skyPixels.horizon[0]>skyPixels.horizon[2],'the horizon has a gentle warm colour');

 // Scenic details must actually paint on canvas, not just exist as data.
 const scenicPixels=await page.evaluate(async()=>{
  const {drawJourneyScenicDetails}=await import('./journey-scenic.js');
  const c=document.createElement('canvas');c.width=128;c.height=128;
  const ctx=c.getContext('2d');ctx.translate(-14*32,-75*32);
  drawJourneyScenicDetails(ctx,{left:12,right:16,top:74,bottom:79},1400);
  const data=ctx.getImageData(0,0,c.width,c.height).data;
  let painted=0;
  for(let i=3;i<data.length;i+=4)if(data[i]>0)painted++;
  return painted;
 });
 assert.ok(scenicPixels>20,'port lanterns visibly render as the player approaches');
 // Structures paint after the scenery, so a prop placed inside a building
 // footprint can vanish completely. Every prop must stay at least partly visible.
 const buriedScenery=await page.evaluate(async()=>{
  const {makeJourneyWorld}=await import('./journey-world.js');
  const {drawJourneyTile,drawJourneySite}=await import('./journey-art.js');
  const {JOURNEY_SCENIC_PROPS,drawJourneyScenicDetails}=await import('./journey-scenic.js');
  const world=makeJourneyWorld();
  const render=(p,withProp)=>{
   const c=document.createElement('canvas');c.width=48;c.height=52;
   const ctx=c.getContext('2d');ctx.translate(-p.x*32,-p.y*32);
   for(let y=p.y-1;y<=p.y+2;y++)for(let x=p.x-1;x<=p.x+2;x++)
    if(x>=0&&y>=0&&x<world.w&&y<world.h)drawJourneyTile(ctx,x,y,world.tileAt(x,y),world);
   if(withProp)drawJourneyScenicDetails(ctx,{left:p.x,right:p.x,top:p.y,bottom:p.y},1400);
   for(const s of world.sites)
    if(s.x<=p.x+5&&s.x+s.w>=p.x-4&&s.y<=p.y+5&&s.y+s.h>=p.y-4)drawJourneySite(ctx,s,1400);
   return ctx.getImageData(0,0,48,52).data;
  };
  const buried=[];
  for(const p of JOURNEY_SCENIC_PROPS){
   const plain=render(p,false),decorated=render(p,true);let visible=0;
   for(let i=0;i<plain.length;i+=4)
    if(Math.abs(plain[i]-decorated[i])+Math.abs(plain[i+1]-decorated[i+1])+Math.abs(plain[i+2]-decorated[i+2])>24)visible++;
   if(visible<16)buried.push(p.id+':'+visible);
  }
  return buried;
 });
 assert.deepEqual(buriedScenery,[],'no scenic prop is hidden under a building');


 async function mapPosition(){
  return page.locator('#miniMap').evaluate(canvas=>{
   const c=canvas.getContext('2d'),{data}=c.getImageData(0,0,canvas.width,canvas.height);
   let minX=Infinity,minY=Infinity,maxX=-1,maxY=-1;
   for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
    const i=(y*canvas.width+x)*4;
    if(data[i]===250&&data[i+1]===229&&data[i+2]===161){
     minX=Math.min(x,minX);maxX=Math.max(x,maxX);minY=Math.min(y,minY);maxY=Math.max(y,maxY);
    }
   }
   if(maxX<0)throw Error('Visible explorer marker missing from atlas');
   return {x:(minX+maxX)/2/canvas.width*176-.5,y:(minY+maxY)/2/canvas.height*136-.5};
  });
 }
 // 自分へ glides back instead of jumping; taps relative to the centre wait until it rests.
 async function returnHome(){
  await page.evaluate(()=>{window.journeyCameraSample=null;});
  await page.locator('#homeBtn').click();
  await page.waitForFunction(()=>{
   const now=window.journeyRenderCamera,before=window.journeyCameraSample;window.journeyCameraSample=now&&{...now};
   return before&&now&&Math.hypot(now.x-before.x,now.y-before.y)<.25;
  },null,{polling:150,timeout:5000});
 }
 async function mapClick(x,y){
  await page.locator('#mapBtn').click();
  const box=await page.locator('#miniMap').boundingBox();
  await page.mouse.click(box.x+(x+.72)/176*box.width,box.y+(y+.72)/136*box.height);
 }
 async function walk(x,y,{name=null,arrival=null,shot=null}={}){
  await mapClick(x,y);
  await page.waitForFunction(()=>document.querySelector('#worldCanvas').getAttribute('aria-busy')==='true');
  await page.waitForFunction(()=>document.querySelector('#worldCanvas').getAttribute('aria-busy')==='false',null,{timeout:40000});
  if(name){
   await page.waitForSelector('#dialogue:not(.hidden)');
   assert.equal(await page.locator('#dialogueName').textContent(),name);
   await page.locator('#dialogueClose').click();
  }
  const target=arrival||{x,y};
  await page.locator('#mapBtn').click();
  const actual=await mapPosition();
  assert.ok(Math.hypot(actual.x-target.x,actual.y-target.y)<1.35,'atlas position '+JSON.stringify({target,actual}));
  await page.locator('#mapPanel [data-close]').click();
  await returnHome();
  if(shot)await page.screenshot({path:'test-results/'+shot+'.png'});
  console.log('Journey walked to',name||`${x},${y}`);
 }

 await page.locator('#mapBtn').click();
 assert.equal(await page.locator('#zoneList button').count(),14+RUINS_ZONES.length);
 const start=await mapPosition();assert.ok(Math.hypot(start.x-19,start.y-70)<1,'new-world spawn');
 await page.screenshot({path:'test-results/journey-atlas.png'});
 await page.locator('#mapPanel [data-close]').click();
 const stepsBefore=await page.evaluate(()=>window.journeyAudioProbe.footfalls);
 await walk(19,74);await walk(19,70);
 assert.equal(await page.evaluate(()=>window.journeyAudioProbe.footfalls)-stepsBefore,4,'eight real walked tiles make four quiet footfalls');
 const idleSteps=await page.evaluate(()=>window.journeyAudioProbe.footfalls);await page.waitForTimeout(220);
 assert.equal(await page.evaluate(()=>window.journeyAudioProbe.footfalls),idleSteps,'standing still makes no queued footsteps');
 await page.locator('#vistaBtn').click();
 assert.equal(await page.locator('#vistaTitle').textContent(),'岸の向こう、石の影');
 assert.ok(await page.locator('#vistaCanvas').isVisible());
 const draws=await page.evaluate(()=>window.journeyVistaDraws);await page.waitForTimeout(420);
 const animated=await page.evaluate(()=>window.journeyVistaDraws);
 assert.ok(animated>draws&&animated-draws<=12,'visible panorama updates at a bounded, low frame rate');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(120);
 const still=await page.locator('#vistaCanvas').evaluate(c=>c.toDataURL());
 const stopped=await page.evaluate(()=>window.journeyVistaDraws);await page.waitForTimeout(250);
 assert.equal(await page.evaluate(()=>window.journeyVistaDraws),stopped,'reduced motion does not redraw');
 assert.equal(await page.locator('#vistaCanvas').evaluate(c=>c.toDataURL()),still);
 await page.screenshot({path:'test-results/journey-departure-view.png'});
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.keyboard.press('Escape');assert.ok(await page.locator('#vistaCard').isHidden());
 assert.equal(await page.evaluate(()=>document.activeElement.id),'vistaBtn');
 const closed=await page.evaluate(()=>window.journeyVistaDraws);await page.waitForTimeout(180);
 assert.equal(await page.evaluate(()=>window.journeyVistaDraws),closed,'closed panoramas perform no rendering');

 await page.locator('#soundBtn').click();
 const trackValues=await page.locator('#trackSelect option').evaluateAll(o=>o.map(x=>x.value));
 assert.equal(trackValues.length,MUSIC_LIBRARY.length*2);
 assert.ok(trackValues.slice(0,68).every(v=>Number(v.split(':')[0])<ORIGINAL_SCORE_COUNT),'the 68 original pieces come first');
 assert.equal(await page.locator('#musicToggle').textContent(),'OFF');
 assert.equal(await page.locator('#sfxToggle').textContent(),'ON');
 assert.equal(await page.locator('#sfxVolumeRange').inputValue(),'55');
 await page.locator('#sfxVolumeRange').evaluate(e=>{e.value='27';e.dispatchEvent(new Event('input',{bubbles:true}));});
 assert.equal(await page.locator('#sfxVolumeLabel').textContent(),'27%');
 await page.locator('#musicToggle').click();
 await page.locator('#sfxToggle').click();
 await page.locator('#trackSelect').selectOption('0:2');
 await page.waitForTimeout(250);
 assert.equal(await page.locator('#trackSelect').inputValue(),'0:2','manual selection persists in a region');
 assert.ok((await page.locator('#nowPlaying').textContent()).startsWith('再生中：'));
 await page.waitForFunction(()=>window.journeyAudioProbe.notes>0&&window.journeyAudioProbe.contexts.some(c=>c.state==='running'));

 // Offline waveform check: Safari-style AudioParam fallback must not jump
 // when a scheduled fade-in is interrupted halfway through.
 const waveform=await page.evaluate(async()=>{
  const {holdFadeAt,gainDuringFade}=await import('./journey-sound.js');
  const sampleRate=48000,transition=.12,fade=.24;
  if(Math.abs(gainDuringFade(transition,fade)-.5)>1e-9)throw Error('invalid fade midpoint');
  async function render(fallback){
   const ctx=new OfflineAudioContext(1,Math.ceil(sampleRate*.39),sampleRate);
   const tone=ctx.createOscillator(),bus=ctx.createGain();
   tone.type='sine';tone.frequency.value=1000;tone.connect(bus);bus.connect(ctx.destination);
   // Offline contexts render only after all automation is scheduled.
   // Build the *result* of the mid-fade hold, so cancelling a future
   // ramp before rendering cannot erase its earlier waveform.
   const held=holdFadeAt(fallback?{
    cancelScheduledValues:()=>{},
    setValueAtTime:()=>{}
   }:{cancelAndHoldAtTime:()=>{}},transition,0,fade);
   bus.gain.setValueAtTime(0,0);
   bus.gain.linearRampToValueAtTime(held,transition);
   bus.gain.linearRampToValueAtTime(0,transition+fade);
   tone.start(0);tone.stop(.38);
   return (await ctx.startRendering()).getChannelData(0);
  }
  const offlineFallback=await render(true);
  const offlineNative=await render(false);
  function rms(samples,from,to){let sum=0,n=0;for(let i=Math.floor(from*sampleRate);i<Math.floor(to*sampleRate);i++){sum+=samples[i]**2;n++;}return Math.sqrt(sum/n);}
  return [offlineFallback,offlineNative].map(samples=>({
   before:rms(samples,.116,.12),
   after:rms(samples,.12,.124)
  }));
 });
 for(const result of waveform){
  assert.ok(result.before>.2,'fade must be audible before transition');
  assert.ok(Math.abs(result.after-result.before)<.055,'no abrupt volume jump at transition: '+JSON.stringify(result));
 }
 await page.locator('#musicPanel [data-close]').click();

 // Field tap: approach an NPC at the edge of the quay, then converse.
 await returnHome();
 const field=await page.locator('#worldCanvas').boundingBox();
 await page.mouse.click(field.x+field.width/2-32,field.y+field.height/2+6*32);
 await page.waitForSelector('#dialogue:not(.hidden)',{timeout:10000});
 assert.equal(await page.locator('#dialogueName').textContent(),'灯りをともす人');
 const reading=await page.locator('#dialogue').boundingBox();
 const arrivalY=field.y+field.height/2+5*32;
 assert.ok(reading.y+reading.height<arrivalY-35||reading.y>arrivalY+12,'reading card leaves the traveller and nearby NPC visible');
 await page.screenshot({path:'test-results/journey-dialogue.png'});
 await page.locator('#dialogueClose').click();
 await returnHome();
 const quay=await page.locator('#worldCanvas').boundingBox();
 const tapNPC=()=>page.touchscreen.tap(quay.x+quay.width/2,quay.y+quay.height/2+32);
 await tapNPC();await page.waitForTimeout(220);
 assert.ok(await page.locator('#dialogue').isVisible(),'revisiting an adjacent NPC must survive its opening click');
 // Issue #44: the page types out, and field taps while reading only turn pages.
 const full=await page.locator('#dialogueText').getAttribute('aria-label');
 assert.ok(full&&full.length>10,'the whole line is available to assistive technology');
 const typed=(await page.locator('#dialogueText').textContent()).length;
 assert.ok(typed<full.length,'the opening page types out instead of appearing at once: '+typed+'/'+full.length);
 const cameraBefore=await page.evaluate(()=>({...window.journeyRenderCamera}));
 await page.touchscreen.tap(quay.x+quay.width/2-120,quay.y+quay.height/2-140);
 assert.equal(await page.locator('#dialogueText').textContent(),full,'the first field tap completes the page');
 await page.touchscreen.tap(quay.x+quay.width/2-120,quay.y+quay.height/2-140);
 await page.touchscreen.tap(quay.x+quay.width/2+90,quay.y+quay.height/2-160);
 await page.waitForTimeout(400);
 assert.equal(await page.locator('#worldCanvas').getAttribute('aria-busy'),'false','taps while reading never start a walk');
 const cameraAfter=await page.evaluate(()=>({...window.journeyRenderCamera}));
 assert.ok(Math.hypot(cameraAfter.x-cameraBefore.x,cameraAfter.y-cameraBefore.y)<1,'taps while reading never pan the field');
 if(await page.locator('#dialogue').isHidden()){await tapNPC();await page.waitForTimeout(220);}
 await page.locator('#mapBtn').click();
 assert.ok(await page.locator('#dialogue').isHidden(),'reading never captures the bottom menu');
 assert.ok(await page.locator('#mapPanel').isVisible());
 // Issue #11: walked regions are marked; far regions stay listed but unmarked.
 assert.ok(await page.locator('#zoneList [data-zone="journey-port"]').evaluate(b=>b.classList.contains('visited')),'the starting port reads as visited');
 const visitedCount=await page.locator('#zoneList button.visited').count(),zoneCount=await page.locator('#zoneList button').count();
 assert.ok(visitedCount>=1&&visitedCount<zoneCount,'not every region is marked visited at the start: '+visitedCount+'/'+zoneCount);
 await page.locator('#mapBtn').click();
 assert.ok(await page.locator('#mapPanel').isHidden(),'the same menu button closes its sheet');
 await tapNPC();await page.waitForTimeout(220);
 await page.keyboard.press('ArrowLeft');
 assert.ok(await page.locator('#dialogue').isHidden(),'walking keys dismiss the reading card');
 await page.waitForFunction(()=>document.querySelector('#worldCanvas').getAttribute('aria-busy')==='false');
 await walk(12,71,{name:'白い連絡舎',arrival:{x:12,y:75}});
 assert.equal(await page.locator('#discovered').textContent(),'1 / '+(35+RUINS_SITES.length));

 // Redirect before arrival; wheel cannot change the authored framing.
 await mapClick(36,38);
 await page.waitForFunction(()=>document.querySelector('#worldCanvas').getAttribute('aria-busy')==='true');
 await page.mouse.wheel(0,-300);
 assert.equal(await page.locator('#zoomIn,#zoomOut').count(),0);
 await mapClick(36,60);
 await page.waitForFunction(()=>document.querySelector('#worldCanvas').getAttribute('aria-busy')==='false',null,{timeout:30000});
 await walk(36,38,{shot:'journey-steppe'});
 await page.waitForFunction(()=>Math.abs(window.journeyRenderZoom-.6)<.002,null,{timeout:9000});
 await page.waitForFunction(pool=>pool.includes(document.querySelector('#trackSelect').value),JOURNEY_PLAYLISTS['journey-steppe'],{timeout:14000});

 await walk(55,52,{shot:'journey-lake'});
 await walk(77,74,{name:'夕空の石段',arrival:{x:77,y:76}});
 await page.waitForSelector('#vistaBtn:visible');await page.locator('#vistaBtn').click();
 assert.equal(await page.locator('#vistaTitle').textContent(),'夕空に、飲み込まれる');
 await page.screenshot({path:'test-results/journey-sunset.png'});
 await page.locator('#vistaClose').click();assert.ok(await page.locator('#vistaCard').isHidden());
 assert.equal(await page.evaluate(()=>document.activeElement.id),'vistaBtn');
 // Opening the atlas closes the optional view without making movement modal.
 await page.locator('#vistaBtn').click();await page.locator('#mapBtn').click();
 assert.ok(await page.locator('#vistaCard').isHidden());await page.locator('#mapPanel [data-close]').click();

 await walk(98,69,{name:'青い岸の小屋',arrival:{x:98,y:72},shot:'journey-hut'});
 await walk(90,19,{name:'潮を待つ船',arrival:{x:90,y:22},shot:'journey-salt'});
 await page.waitForFunction(()=>Math.abs(window.journeyRenderZoom-.6)<.002,null,{timeout:9000});
 await walk(55,13,{name:'名のない石',arrival:{x:55,y:19}});
 await page.waitForFunction(()=>Math.abs(window.journeyRenderZoom-.8)<.002,null,{timeout:9000});
 await page.screenshot({path:'test-results/journey-monolith.png'});
 await page.waitForSelector('#vistaBtn:visible');await page.locator('#vistaBtn').click();
 assert.equal(await page.locator('#vistaTitle').textContent(),'石影の向こうに');
 await page.screenshot({path:'test-results/journey-highland-view.png'});
 await page.locator('#vistaClose').click();
 await walk(14,38);await walk(36,60);
 await walk(46,65,{name:'水路の茶屋',arrival:{x:46,y:69}});
 await page.waitForFunction(()=>Math.abs(window.journeyRenderZoom-1)<.002,null,{timeout:9000});
 assert.equal(await page.locator('#discovered').textContent(),'6 / '+(35+RUINS_SITES.length));
 await walk(19,70);
 assert.equal(await page.locator('#zoneName').textContent(),'白い船着場');
 assert.ok(await page.evaluate(()=>window.journeyAudioProbe.contexts.length<=2),'music and SFX contexts are reused for the entire loop');

 await page.locator('#helpBtn').click();
 assert.ok(await page.getByRole('link',{name:'以前の広い世界を歩く'}).isVisible());
 assert.ok(await page.getByRole('link',{name:'小さな旅を試す（台場ミニ版）'}).isVisible());
 await page.getByRole('link',{name:'以前の広い世界を歩く'}).click();
 await page.waitForFunction(()=>document.querySelector('#worldTitle').textContent==='潮環群島');
 assert.ok(await page.locator('.topbar').isVisible(),'default UI remains intact');
 assert.equal(await page.locator('.journey-menu').count(),0);
 assert.equal(await page.locator('#sfxVolumeRange').count(),0,'journey sound controls do not leak into default mode');
 await page.locator('#soundBtn').click();
 assert.equal(await page.locator('#musicToggle').textContent(),'ON');
 assert.equal(await page.locator('#sfxToggle').textContent(),'OFF');
 const keys=await page.evaluate(()=>Object.keys(localStorage));
 assert.ok(keys.length>0&&keys.every(key=>key.startsWith('tidal-atlas:')));
 await page.goto(origin+'/?prototype=1&journey=1');
 await page.waitForFunction(()=>document.querySelector('#worldTitle').textContent==='小さく壮大な旅');
 assert.equal(await page.locator('#discovered').textContent(),'0 / '+(35+RUINS_SITES.length),'mode flags have explicit precedence, with no game-save added');
 await page.locator('#soundBtn').click();
 assert.equal(await page.locator('#sfxVolumeRange').inputValue(),'27','foley volume persists separately from music');
 await page.locator('#soundBtn').click();
 for(const [width,height] of [[320,568],[844,390],[390,844]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(150);
  const layout=await page.evaluate(()=>{
   const field=document.querySelector('#worldCanvas').getBoundingClientRect();
   const buttons=['mapBtn','soundBtn','homeBtn','helpBtn'].map(id=>{
    const r=document.getElementById(id).getBoundingClientRect();return {id,x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width};
   });
   return {fieldTop:field.top,fieldBottom:field.bottom,buttons,overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert.equal(layout.fieldTop,0,'unobstructed field begins at the top');assert.equal(layout.overflow,false);
  for(const b of layout.buttons)assert.ok(b.x>=0&&b.right<=width&&b.y>=layout.fieldBottom&&b.bottom<=height&&b.width>=44,JSON.stringify({width,height,b}));
  await page.locator('#mapBtn').click();
  const sheet=await page.locator('#mapPanel .sheet').boundingBox();
  assert.ok(sheet.y>=0&&sheet.y+sheet.height<=layout.fieldBottom,'map stays above the reachable menu');
  await page.locator('#soundBtn').click();
  assert.ok(await page.locator('#mapPanel').isHidden());assert.ok(await page.locator('#musicPanel').isVisible());
  await page.locator('#sfxVolumeRange').scrollIntoViewIfNeeded();
  const soundSheet=await page.locator('#musicPanel .sheet').boundingBox();
  const slider=await page.locator('#sfxVolumeRange').boundingBox();
  assert.ok(soundSheet.y>=0&&soundSheet.y+soundSheet.height<=layout.fieldBottom,'sound controls stay above the menu');
  assert.ok(slider.y>=soundSheet.y&&slider.y+slider.height<=soundSheet.y+soundSheet.height,'foley volume remains reachable');
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'soundBtn','closing a sheet restores focus to its tool');
 }
 // Issue #51: use the normal atlas and arrival dialogue, with no teleport hook.
 await page.setViewportSize({width:390,height:844});
 await page.locator('#soundBtn').click();
 if(await page.locator('#sfxToggle').textContent()==='OFF')await page.locator('#sfxToggle').click();
 if(await page.locator('#musicToggle').textContent()==='ON')await page.locator('#musicToggle').click();
 await page.keyboard.press('Escape');
 await walk(5,75,{name:'見送りの練習札',arrival:{x:6,y:77},shot:'journey-curio-port'});
 await page.waitForTimeout(3300);
 const nearNotes=await page.evaluate(()=>window.journeyAudioProbe.notes);
 await page.waitForTimeout(4700);
 assert.ok(await page.evaluate(()=>window.journeyAudioProbe.notes)>nearNotes,'nearby place schedules original ambient tones');
 await walk(19,70);
 const farNotes=await page.evaluate(()=>window.journeyAudioProbe.notes);
 await page.waitForTimeout(4700);
 assert.equal(await page.evaluate(()=>window.journeyAudioProbe.notes),farNotes,'leaving the source stops ambient cues');
 await walk(5,75,{name:'見送りの練習札',arrival:{x:6,y:77}});
 await page.locator('#soundBtn').click();
 if(await page.locator('#sfxToggle').textContent()==='ON')await page.locator('#sfxToggle').click();
 await page.keyboard.press('Escape');
 const mutedNotes=await page.evaluate(()=>window.journeyAudioProbe.notes);
 await page.waitForTimeout(4700);
 assert.equal(await page.evaluate(()=>window.journeyAudioProbe.notes),mutedNotes,'SFX OFF suppresses nearby sound');
 assert.ok(await page.locator('#dialogue').isHidden(),'proximity never opens a dialogue');
 console.log('Journey browser passed: real-time loop, modes, camera, curios, proximity approach/departure/re-entry, SFX OFF and persistent settings.');
}
