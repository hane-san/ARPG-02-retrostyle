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
  const probe=window.journeyAudioProbe={contexts:[],notes:0};
  window.AudioContext=class extends Native{
   constructor(...args){super(...args);probe.contexts.push(this);}
   createOscillator(){const oscillator=super.createOscillator();const start=oscillator.start.bind(oscillator);oscillator.start=(...args)=>{probe.notes++;return start(...args);};return oscillator;}
  };
 });
 const response=await page.goto(origin+'/?journey=1',{waitUntil:'load'});
 assert.ok(response?.ok());
 await page.waitForFunction(()=>document.querySelector('#discovered')?.textContent==='0 / 6');
 assert.equal(await page.locator('#worldTitle').textContent(),'小さく壮大な旅');
 assert.equal(await page.title(),'潮環群島 × 星風回廊 — TIDAL ATLAS');
 assert.equal(await page.locator('#zoneName').textContent(),'白い船着場');
 assert.ok(await page.locator('.topbar').isHidden());
 assert.ok(await page.locator('.map-hint').isHidden());
 assert.ok(await page.locator('.discover').isHidden());
 assert.ok(await page.locator('#vistaBtn').isVisible(),'a distant view is available at departure');
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
   return {x:(minX+maxX)/2/canvas.width*112-.5,y:(minY+maxY)/2/canvas.height*88-.5};
  });
 }
 async function mapClick(x,y){
  await page.locator('#mapBtn').click();
  const box=await page.locator('#miniMap').boundingBox();
  await page.mouse.click(box.x+(x+.5)/112*box.width,box.y+(y+.5)/88*box.height);
 }
 async function walk(x,y,{name=null,arrival=null,shot=null}={}){
  await mapClick(x,y);
  await page.waitForFunction(()=>document.querySelector('#zoomIn').disabled);
  await page.waitForFunction(()=>!document.querySelector('#zoomIn').disabled,null,{timeout:40000});
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
  await page.locator('#homeBtn').click();
  if(shot)await page.screenshot({path:'test-results/'+shot+'.png'});
  console.log('Journey walked to',name||`${x},${y}`);
 }

 await page.locator('#mapBtn').click();
 assert.equal(await page.locator('#zoneList button').count(),7);
 const start=await mapPosition();assert.ok(Math.hypot(start.x-19,start.y-70)<1,'new-world spawn');
 await page.screenshot({path:'test-results/journey-atlas.png'});
 await page.locator('#mapPanel [data-close]').click();
 await page.locator('#vistaBtn').click();
 assert.equal(await page.locator('#vistaTitle').textContent(),'岸の向こう、石の影');
 assert.ok(await page.locator('#vistaCanvas').isVisible());
 await page.keyboard.press('Escape');assert.ok(await page.locator('#vistaCard').isHidden());
 assert.equal(await page.evaluate(()=>document.activeElement.id),'vistaBtn');

 await page.locator('#soundBtn').click();
 assert.equal(await page.locator('#trackSelect option').count(),68);
 assert.equal(await page.locator('#musicToggle').textContent(),'OFF');
 assert.equal(await page.locator('#sfxToggle').textContent(),'ON');
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
   bus.gain.setValueAtTime(0,0);bus.gain.linearRampToValueAtTime(1,fade);
   const param=fallback?{
    cancelScheduledValues:at=>bus.gain.cancelScheduledValues(at),
    setValueAtTime:(v,at)=>bus.gain.setValueAtTime(v,at)
   }:bus.gain;
   holdFadeAt(param,transition,0,fade);
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
 await page.locator('#homeBtn').click();
 const field=await page.locator('#worldCanvas').boundingBox();
 await page.mouse.click(field.x+field.width/2-32*1.25,field.y+field.height/2+6*32*1.25);
 await page.waitForSelector('#dialogue:not(.hidden)',{timeout:10000});
 assert.equal(await page.locator('#dialogueName').textContent(),'灯りをともす人');
 const reading=await page.locator('#dialogue').boundingBox();
 const arrivalY=field.y+field.height/2+5*32*1.25;
 assert.ok(reading.y+reading.height<arrivalY-35||reading.y>arrivalY+12,'reading card leaves the traveller and nearby NPC visible');
 await page.screenshot({path:'test-results/journey-dialogue.png'});
 await page.locator('#dialogueClose').click();
 await page.locator('#homeBtn').click();
 const quay=await page.locator('#worldCanvas').boundingBox();
 const tapNPC=()=>page.touchscreen.tap(quay.x+quay.width/2,quay.y+quay.height/2+40);
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
 await page.waitForFunction(()=>!document.querySelector('#zoomIn').disabled);
 await walk(12,71,{name:'白い連絡舎',arrival:{x:12,y:75}});
 assert.equal(await page.locator('#discovered').textContent(),'1 / 6');

 // Redirect before arrival; wheel and buttons must stay locked throughout.
 await mapClick(36,38);
 await page.waitForFunction(()=>document.querySelector('#zoomOut').disabled);
 await page.mouse.wheel(0,-300);
 assert.ok(await page.locator('#zoomIn').isDisabled());
 await mapClick(36,60);
 await page.waitForFunction(()=>!document.querySelector('#zoomIn').disabled,null,{timeout:30000});
 await walk(36,38,{shot:'journey-steppe'});
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
 await walk(55,13,{name:'名のない石',arrival:{x:55,y:19}});
 await page.locator('#zoomOut').click();await page.locator('#zoomOut').click();
 await page.screenshot({path:'test-results/journey-monolith.png'});
 await page.locator('#zoomIn').click();await page.locator('#zoomIn').click();
 await page.waitForSelector('#vistaBtn:visible');await page.locator('#vistaBtn').click();
 assert.equal(await page.locator('#vistaTitle').textContent(),'石影の向こうに');
 await page.locator('#vistaClose').click();
 await walk(14,38);await walk(36,60);
 await walk(46,65,{name:'水路の茶屋',arrival:{x:46,y:69}});
 assert.equal(await page.locator('#discovered').textContent(),'6 / 6');
 await walk(19,70);
 assert.equal(await page.locator('#zoneName').textContent(),'白い船着場');
 assert.ok(await page.evaluate(()=>window.journeyAudioProbe.contexts.length<=2),'music and SFX contexts are reused for the entire loop');

 await page.locator('#helpBtn').click();
 assert.ok(await page.getByRole('link',{name:'広い世界を遊ぶ（通常版）'}).isVisible());
 assert.ok(await page.getByRole('link',{name:'小さな旅を試す（台場ミニ版）'}).isVisible());
 await page.getByRole('link',{name:'広い世界を遊ぶ（通常版）'}).click();
 await page.waitForFunction(()=>document.querySelector('#worldTitle').textContent==='潮環群島');
 assert.ok(await page.locator('.topbar').isVisible(),'default UI remains intact');
 assert.equal(await page.locator('.journey-menu').count(),0);
 await page.locator('#soundBtn').click();
 assert.equal(await page.locator('#musicToggle').textContent(),'ON');
 assert.equal(await page.locator('#sfxToggle').textContent(),'OFF');
 const keys=await page.evaluate(()=>Object.keys(localStorage));
 assert.ok(keys.length>0&&keys.every(key=>key.startsWith('tidal-atlas:')));
 await page.goto(origin+'/?prototype=1&journey=1');
 await page.waitForFunction(()=>document.querySelector('#worldTitle').textContent==='小さく壮大な旅');
 assert.equal(await page.locator('#discovered').textContent(),'0 / 6','mode flags have explicit precedence, with no game-save added');
 for(const [width,height] of [[320,568],[844,390],[390,844]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(150);
  const layout=await page.evaluate(()=>{
   const field=document.querySelector('#worldCanvas').getBoundingClientRect();
   const buttons=['mapBtn','soundBtn','homeBtn','zoomOut','zoomIn','helpBtn'].map(id=>{
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
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'soundBtn','closing a sheet restores focus to its tool');
 }
 console.log('Journey browser passed: real-time loop, six sites, NPC, redirection, music, three vistas, mode links and persistent settings.');
}
