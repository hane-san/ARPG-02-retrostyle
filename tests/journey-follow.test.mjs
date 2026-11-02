import test from 'node:test';
import assert from 'node:assert/strict';
import {easeJourneyFollowCamera,easePilgrimageFollowCamera,createPilgrimageFollower,pilgrimageForwardLead} from '../journey-camera.js';
import {heroVisible} from '../camera-limits.js';

const tile=32;
const world={width:176*tile,height:136*tile,tile};
const viewport={width:390,height:740,zoom:1};
const here=(x,y)=>({x,y});
const centered=hero=>({x:(hero.x+.5)*tile,y:(hero.y+.5)*tile});
function settle(hero,path,view=viewport,hz=60,seconds=1.5){
 let camera=centered(hero);
 for(let frame=0;frame<hz*seconds;frame++)
  camera=easeJourneyFollowCamera(camera,hero,path,1/hz,view,world);
 return camera;
}

test('both nearby taps and atlas-length routes place extra space ahead of travel',()=>{
 const hero=here(60,60),start=centered(hero);
 const eastShort=settle(hero,[here(61,60)]);
 const eastLong=settle(hero,Array.from({length:18},(_,i)=>here(61+i,60)));
 const west=settle(hero,[here(59,60),here(58,60)]);
 const north=settle(hero,[here(60,59),here(60,58),here(60,57)]);
 assert.ok(eastShort.x>start.x+20,'a one-step tap already starts forward framing');
 assert.ok(eastLong.x>eastShort.x,'longer routes see farther ahead');
 assert.ok(west.x<start.x-20,'reversing the route reverses the composition');
 assert.ok(north.y<start.y-20,'northward travel leaves more visible room above');
 for(const c of [eastShort,eastLong,west,north])
  assert.ok(heroVisible(c,hero,viewport,world));
});

test('route bends ease rather than snapping to a new centre',()=>{
 const hero=here(80,70),path=Array.from({length:9},(_,i)=>here(81+i,70));
 let camera=settle(hero,path),previous={...camera};
 const turn=[here(80,69),here(80,68),here(80,67),here(80,66),here(80,65)];
 camera=easeJourneyFollowCamera(camera,hero,turn,1/60,viewport,world);
 assert.ok(Math.hypot(camera.x-previous.x,camera.y-previous.y)<25,'no hard cut');
 for(let i=0;i<90;i++)camera=easeJourneyFollowCamera(camera,hero,turn,1/60,viewport,world);
 assert.ok(camera.y<centered(hero).y-20,'camera eventually looks into the turn');
 assert.ok(heroVisible(camera,hero,viewport,world));
});

test('fixed-time pursuit is frame-rate independent and never follows a missing path',()=>{
 const hero=here(88,50),path=[here(89,50),here(90,50),here(91,50),here(92,50)];
 const a=settle(hero,path,viewport,30,2),b=settle(hero,path,viewport,120,2);
 assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<1e-6);
 assert.deepEqual(easeJourneyFollowCamera(a,hero,[],.016,viewport,world),a);
});

test('close zoom and world corners always keep the traveller visible',()=>{
 for(const zoom of [.6,.8,1,1.35,1.8]){
  const view={...viewport,zoom};
  for(const [hero,path] of [
   [here(0,0),[here(1,0),here(2,0)]],
   [here(175,135),[here(174,135),here(173,135)]],
   [here(0,75),[here(0,74),here(0,73)]],
   [here(175,70),[here(175,71),here(175,72)]]
  ]){
   const camera=settle(hero,path,view);
   assert.ok(heroVisible(camera,hero,view,world),`zoom ${zoom}, tile ${hero.x},${hero.y}`);
   assert.ok(Number.isFinite(camera.x)&&Number.isFinite(camera.y));
   const halfX=view.width/(2*zoom),halfY=view.height/(2*zoom);
   assert.ok(camera.x>=halfX-1e-6&&camera.x<=world.width-halfX+1e-6);
   assert.ok(camera.y>=halfY-1e-6&&camera.y<=world.height-halfY+1e-6);
  }
 }
});

test('pilgrimage holds a forward pan until the traveller catches up, then follows without recoil',()=>{
 const view={...viewport,zoom:.8};
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const hero=here(80,70),initial=centered(hero),half=(dx?view.width:view.height)/(2*view.zoom);
  let c={x:initial.x+dx*(half-24),y:initial.y+dy*(half-24)};
  const panned={...c};
  for(let i=0;i<60;i++)c=easePilgrimageFollowCamera(c,hero,[here(hero.x+dx,hero.y+dy)],1/60,view,world);
  assert.deepEqual(c,panned,'tap must retain manually panned composition');
  const frames=Math.ceil(((half-24)+half*.45+180)/(tile*.12));
  for(let i=0;i<frames;i++){
   hero.x+=dx*.12;hero.y+=dy*.12;
   const before={...c};
   c=easePilgrimageFollowCamera(c,hero,[here(hero.x+dx,hero.y+dy)],1/60,view,world);
   assert.ok((c.x-before.x)*dx>=-1e-8&&(c.y-before.y)*dy>=-1e-8,'never follows against the occupied edge');
   assert.ok(heroVisible(c,hero,view,world));
  }
  assert.ok((c.x-panned.x)*dx+(c.y-panned.y)*dy>100,'catch-up eventually resumes following');
 }
});
test('pilgrimage bends, stopped paths and world borders preserve visibility',()=>{
 for(const zoom of [.38,.46,.6,.8])for(const hero of [here(0,0),here(175,135),here(80,70)]){
  const view={...viewport,zoom};let c=centered(hero);
  for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){
   c=easePilgrimageFollowCamera(c,hero,[here(hero.x+dx,hero.y+dy)],.016,view,world);
   assert.ok(heroVisible(c,hero,view,world));
  }
  assert.deepEqual(easePilgrimageFollowCamera(c,hero,[],.016,view,world),c);
 }
});

test('two-step pilgrimage taps remain inside the static composition at phone and landscape sizes',()=>{
 for(const [width,height] of [[320,568],[390,755],[844,390]]){
  const view={width,height,zoom:.8},hero=here(80,70),initial=centered(hero);
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const moved={x:hero.x+dx*2,y:hero.y+dy*2};
   const camera=easePilgrimageFollowCamera(initial,moved,[here(moved.x+dx,moved.y+dy)],1/30,view,world);
   assert.deepEqual(camera,initial,'two tiles should not start a camera pursuit');
  }
 }
});

test('forward lead uses screen proportions: horizontal portrait travel has more lookahead than vertical',()=>{
 for(const view of [{width:390,height:740,zoom:.8},{width:320,height:568,zoom:.8},{width:844,height:390,zoom:.8},{width:390,height:740,zoom:.38}]){
  const portrait=view.height>view.width;
  const x=pilgrimageForwardLead(view,'x')*view.zoom/view.width;
  const y=pilgrimageForwardLead(view,'y')*view.zoom/view.height;
  assert.ok(Math.abs(x-(portrait?.34:.265))<1e-10,'horizontal fraction');
  assert.ok(Math.abs(y-(portrait?.18:.16))<1e-10,'vertical fraction');
  assert.ok(x>y,'horizontal roads get a stronger composition offset');
 }
});

// Simulate real tile-speed walking, not simply a stationary hero and a static path.
function simulatePilgrimageFollow({dx=1,dy=0,width=390,height=740,zoom=.8,hz=60,speed=5.7,steps=14}={}){
 const view={width,height,zoom},hero=here(80,70),follow=createPilgrimageFollower();
 let c=centered(hero),maxStep=0,visible=true;
 for(let i=0;i<Math.ceil(steps/speed*hz);i++){
  hero.x+=dx*speed/hz;hero.y+=dy*speed/hz;
  const before={...c},future=[here(hero.x+dx,hero.y+dy)];
  c=follow.update(c,hero,future,1/hz,view,world);
  maxStep=Math.max(maxStep,Math.hypot(c.x-before.x,c.y-before.y)*zoom);
  visible&&=heroVisible(c,hero,view,world);
 }
 return {camera:c,hero,view,visible,maxStep,
  screen:{x:width/2+((hero.x+.5)*tile-c.x)*zoom,y:height/2+((hero.y+.5)*tile-c.y)*zoom}};
}
test('long taps frame roads ahead on all four axes, with portrait and landscape-specific balance',()=>{
 for(const [width,height] of [[390,740],[320,568],[844,390]]){
  const portrait=height>width;
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const r=simulatePilgrimageFollow({dx,dy,width,height});
   assert.ok(r.visible,'hero remains visible across long route');
   assert.ok(r.maxStep<6.5,'camera advances at a comfortably bounded per-frame speed');
   const px=r.screen.x/width,py=r.screen.y/height;
   if(dx>0)assert.ok(px>(portrait?.12:.19)&&px<(portrait?.31:.38),'right-going hero is on left: '+JSON.stringify({width,height,px}));
   if(dx<0)assert.ok(px<(portrait?.88:.81)&&px>(portrait?.69:.62),'left-going hero is on right: '+JSON.stringify({width,height,px}));
   if(dy>0)assert.ok(py>.27&&py<.46,'down-going hero leaves road below: '+JSON.stringify({width,height,py}));
   if(dy<0)assert.ok(py>.54&&py<.73,'up-going hero leaves road above: '+JSON.stringify({width,height,py}));
  }
 }
});
test('forward bias is speed independent in screen space and handles grand-vantage zoom',()=>{
 for(const zoom of [.8,.46,.38]){
  const fast=simulatePilgrimageFollow({zoom,speed:7.35,steps:16});
  const normal=simulatePilgrimageFollow({zoom,speed:5.7,steps:16});
  for(const sample of [fast,normal]){
   assert.ok(sample.visible,'large vista still keeps player on-screen');
   const fraction=sample.screen.x/sample.view.width;
   assert.ok(fraction>.13&&fraction<.31,'viewport-based lead stays readable: '+JSON.stringify({zoom,fraction}));
  }
  assert.ok(Math.abs(fast.screen.x-normal.screen.x)<16,'atlas and field travel should settle at comparable compositions');
 }
});
test('steady tracking has minimal frame-rate drift and short taps do not recenter',()=>{
 const a=simulatePilgrimageFollow({hz:30,steps:12}),b=simulatePilgrimageFollow({hz:120,steps:12});
 assert.ok(Math.abs(a.screen.x-b.screen.x)<7,'different frame rates settle near the same screen anchor');
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const hero=here(80,70),view={width:390,height:740,zoom:.8};
  const follow=createPilgrimageFollower(),start=centered(hero);
  let camera={...start};
  for(let i=0;i<20;i++){
   hero.x+=dx*.1;hero.y+=dy*.1;
   camera=follow.update(camera,hero,[here(hero.x+dx,hero.y+dy)],.1/5.7,view,world);
  }
  assert.deepEqual(camera,start,'two tiles do not steal an existing field composition');
 }
});
test('manual forward pan never recoils, even as the forward lead grows; turns remain gradual',()=>{
 const view={width:390,height:740,zoom:.8},hero=here(80,70),follow=createPilgrimageFollower();
 const start=centered(hero),pan={x:start.x+170,y:start.y};let camera={...pan};
 for(let i=0;i<130;i++){
  const before=camera;
  hero.x+=5.7/60;
  camera=follow.update(camera,hero,[here(hero.x+1,hero.y)],1/60,view,world);
  assert.ok(camera.x>=before.x-1e-8,'forward pan does not move backwards before catch-up');
  assert.ok(heroVisible(camera,hero,view,world));
 }
 assert.ok(camera.x>pan.x+60,'long walking eventually advances beyond initial pan');
 let turnStep=0;
 for(let i=0;i<100;i++){
  const before=camera;
  hero.y-=5.7/60;turnStep++;
  camera=follow.update(camera,hero,[here(hero.x,hero.y-1)],1/60,view,world);
  assert.ok(Math.hypot(camera.x-before.x,camera.y-before.y)*view.zoom<20,'bend never jumps');
  assert.ok(heroVisible(camera,hero,view,world),'bend keeps player visible');
 }
 assert.ok(turnStep>0);
});

test('a long horizontal walk grows the forward composition gradually rather than surging',()=>{
 const view={width:390,height:740,zoom:.8},hero=here(80,70),follow=createPilgrimageFollower();
 let c=centered(hero),maxStep=0,at=new Map();
 const hz=60,speed=5.7,step=speed/hz;
 for(let i=0;i<Math.ceil(18/step);i++){
  const prev=c;hero.x+=step;
  c=follow.update(c,hero,[here(hero.x+1,hero.y)],1/hz,view,world);
  const moved=Math.hypot(c.x-prev.x,c.y-prev.y)*view.zoom;
  maxStep=Math.max(maxStep,moved);
  const steps=hero.x-80;
  for(const milestone of [2,4,6,8,10,12,16]){
   if(steps>=milestone&&!at.has(milestone)){
    at.set(milestone,.5+((hero.x+.5)*tile-c.x)*view.zoom/view.width);
   }
  }
 }
 assert.ok(Math.abs(at.get(2)-.63)<.04,'the first two tiles keep the map nearly still');
 assert.ok(at.get(4)>.55,'at four tiles the camera must not have already surged ahead');
 assert.ok(at.get(6)>.42,'at six tiles it should still be growing its lead');
 assert.ok(at.get(8)<at.get(6),'the explorer gradually moves to the left');
 assert.ok(at.get(10)<.34,'a long right-going route still reveals the way ahead');
 assert.ok(at.get(16)>.19&&at.get(16)<.31,'eventual composition retains the approved lookahead');
 assert.ok(maxStep<6,'per-frame movement is far below the previous sharp catch-up');
});
test('smooth follow bounds the speed on atlas walks without pulling back a manual pan',()=>{
 for(const speed of [5.7,7.35])for(const zoom of [.8,.46,.38]){
  const view={width:390,height:740,zoom},hero=here(80,70),follow=createPilgrimageFollower();
  let c=centered(hero),maxScreenVelocity=0,lastFraction=null;
  const frame=1/60;
  for(let i=0;i<Math.ceil(19/speed*60);i++){
   const prev=c;hero.x+=speed*frame;
   c=follow.update(c,hero,[here(hero.x+1,hero.y)],frame,view,world);
   const travelled=(c.x-prev.x)*zoom/frame;
   maxScreenVelocity=Math.max(maxScreenVelocity,travelled);
   assert.ok(travelled>=-1e-6,'must not move against the occupied edge');
   assert.ok(heroVisible(c,hero,view,world));
   lastFraction=.5+((hero.x+.5)*tile-c.x)*zoom/view.width;
  }
  const pace=Math.max(.7,Math.min(1.6,speed/5.7));
  const speedLimit=tile*(speed+6*pace)*zoom;
  assert.ok(maxScreenVelocity<speedLimit+4,'no camera catch-up sprint: '+JSON.stringify({speed,zoom,maxScreenVelocity,speedLimit}));
  assert.ok(lastFraction>.12&&lastFraction<.32,'long routes eventually reveal the way ahead: '+JSON.stringify({speed,zoom,lastFraction}));
 }
});
