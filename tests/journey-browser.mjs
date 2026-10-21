// Real-time UI walks, with no teleport, frame acceleration, or production debug
// hook. The visible atlas marker provides the final position for assertions.
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {JOURNEY_PLAYLISTS} from '../journey-music.js';

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
 await page.waitForFunction(()=>document.querySelector('#discovered')?.textContent==='0 / 34');
 assert.equal(await page.locator('#worldTitle').textContent(),'小さく壮大な旅');
 assert.equal(await page.title(),'潮環群島 × 星風回廊 — TIDAL ATLAS');
 assert.equal(await page.locator('#zoneName').textContent(),'白い船着場');
 assert.ok(await page.locator('.topbar').isHidden());
 assert.ok(await page.locator('.map-hint').isHidden());
 assert.ok(await page.locator('.discover').isHidden());
 assert.ok(await page.locator('#vistaBtn').isVisible(),'a distant view is available at departure');
 await page.waitForFunction(()=>Math.abs(window.journeyRenderZoom-1)<.002);
 await page.screenshot({path:'test-results/journey-port.png'});

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
  await page.mouse.click(box.x+(x+.5)/176*box.width,box.y+(y+.5)/136*box.height);
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
  assert.ok(Math.hypot(actual.x-target.x,actual.y-target.y)<1,'atlas position '+JSON.stringify({target,actual}));
  await page.locator('#mapPanel [data-close]').click();
  await returnHome();
  if(shot)await page.screenshot({path:'test-results/'+shot+'.png'});
  console.log('Journey walked to',name||`${x},${y}`);
 }

 await page.locator('#mapBtn').click();
 assert.equal(await page.locator('#zoneList button').count(),13);
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
 assert.equal(await page.locator('#trackSelect option').count(),68);
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
 await page.locator('#mapBtn').click();
 assert.ok(await page.locator('#dialogue').isHidden(),'reading never captures the bottom menu');
 assert.ok(await page.locator('#mapPanel').isVisible());
 await page.locator('#mapBtn').click();
 assert.ok(await page.locator('#mapPanel').isHidden(),'the same menu button closes its sheet');
 await tapNPC();await page.waitForTimeout(220);
 await page.keyboard.press('ArrowLeft');
 assert.ok(await page.locator('#dialogue').isHidden(),'walking keys dismiss the reading card');
 await page.waitForFunction(()=>document.querySelector('#worldCanvas').getAttribute('aria-busy')==='false');
 await walk(12,71,{name:'白い連絡舎',arrival:{x:12,y:75}});
 assert.equal(await page.locator('#discovered').textContent(),'1 / 34');

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
 assert.equal(await page.locator('#discovered').textContent(),'6 / 34');
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
 assert.equal(await page.locator('#discovered').textContent(),'0 / 34','mode flags have explicit precedence, with no game-save added');
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
 console.log('Journey browser passed: real-time loop, six original sites plus sixteen optional relic sites, NPC, redirection, music, three vistas, mode links and persistent settings.');
}
