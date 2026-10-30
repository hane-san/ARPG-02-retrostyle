import {pilgrimCameraScene} from './pilgrimage-world.js';
import {IMPERIAL_ZONES} from './journey-imperial.js';
import {limitCamera} from './camera-limits.js';
import {journeyScenicScene,JOURNEY_SCENIC_BEATS} from './journey-scenic.js';

// A steady field of view is more comfortable for long walks (Issue #70).
// Only a real interior (not yet present in this map) or an explicitly authored
// extraordinary panorama may change the magnification.
export const JOURNEY_DEFAULT_ZOOM=.8;
export const JOURNEY_INTERIOR_ZOOM=1.35;
export const JOURNEY_SPECIAL_WIDE_ZOOM=.6;
export const JOURNEY_ZOOM_STAGES=Object.freeze([JOURNEY_INTERIOR_ZOOM,JOURNEY_DEFAULT_ZOOM,JOURNEY_SPECIAL_WIDE_ZOOM,.46,.38]);
export const JOURNEY_CAMERA_PROFILES=Object.freeze({
 ...Object.fromEntries(IMPERIAL_ZONES.map(z=>[z.id,JOURNEY_DEFAULT_ZOOM])),
 'journey-reveal':.46,'journey-monument':.38,
 'journey-interior':JOURNEY_INTERIOR_ZOOM,
 'journey-scenic-wide':JOURNEY_SPECIAL_WIDE_ZOOM,
 // All outdoor regions, buildings, ruins and ordinary scenic beats are steady.
 'journey-detail':JOURNEY_DEFAULT_ZOOM,
 'journey-port':JOURNEY_DEFAULT_ZOOM,'journey-tea':JOURNEY_DEFAULT_ZOOM,'journey-hut':JOURNEY_DEFAULT_ZOOM,
 'journey-road':JOURNEY_DEFAULT_ZOOM,'journey-pass':JOURNEY_DEFAULT_ZOOM,
 'journey-steppe':JOURNEY_DEFAULT_ZOOM,'journey-lake':JOURNEY_DEFAULT_ZOOM,
 'journey-salt':JOURNEY_DEFAULT_ZOOM,'journey-sunset':JOURNEY_DEFAULT_ZOOM,
 'journey-canyon':JOURNEY_DEFAULT_ZOOM,'journey-highland':JOURNEY_DEFAULT_ZOOM,
 'journey-sky-edge':JOURNEY_DEFAULT_ZOOM,'journey-river':JOURNEY_DEFAULT_ZOOM,
 'journey-glass':JOURNEY_DEFAULT_ZOOM,'journey-wetlands':JOURNEY_DEFAULT_ZOOM,
 'journey-whitebasin':JOURNEY_DEFAULT_ZOOM,
 'journey-ancient':JOURNEY_DEFAULT_ZOOM,'journey-void':JOURNEY_DEFAULT_ZOOM,
 'journey-drowned':JOURNEY_DEFAULT_ZOOM,'journey-sky-ruins':JOURNEY_DEFAULT_ZOOM,
 'journey-scenic-detail':JOURNEY_DEFAULT_ZOOM,
 'journey-scenic-near':JOURNEY_DEFAULT_ZOOM
});
export function journeyCameraScene(world,hero,acceptedScene=null){
 if(world.pilgrimage)return pilgrimCameraScene(world,hero,acceptedScene);
 // The narrow glass arcade is an opt-in-to-approach example of the closest frame.
 const ruinCore=world.sites.find(site=>site.id==='journey-ruins-monolith-core');
 if(ruinCore&&Math.hypot(hero.px-ruinCore.entrance.x,hero.py-ruinCore.entrance.y)<=3)return 'journey-detail';
 const arcade=world.sites.find(site=>site.id==='journey-glass-promenade');
 if(arcade&&Math.hypot(hero.px-arcade.entrance.x,hero.py-arcade.entrance.y)<=5)return 'journey-detail';
 for(const [id,radius] of [['journey-hut',7],['journey-chaikhana',7]]){
  const site=world.sites.find(site=>site.id===id);
  if(site&&Math.hypot(hero.px-site.entrance.x,hero.py-site.entrance.y)<=radius)
   return id==='journey-hut'?'journey-hut':'journey-tea';
 }
 const scenic=journeyScenicScene(hero,acceptedScene);
 if(scenic)return scenic;
 const scene=world.zoneAt(hero.px,hero.py).id;
 if(scene==='journey-tea')return 'journey-road';
 // Only the open centre is panoramic. Ordinary approach roads retain stage 4.
 if(scene==='journey-steppe'&&Math.hypot(hero.px-36,hero.py-38)>18)return 'journey-road';
 return scene;
}
// Only a special wide vantage or an actual indoor scene starts a transition.
// Changes of district or proximity are immediately accepted when the zoom is
// unchanged: they must not create a backlog of false camera transitions.
const isCinematic=scene=>['journey-interior','journey-scenic-wide','journey-reveal','journey-monument'].includes(scene);
export function createJourneyCamera({regional=false}={}){
 let scene='journey-port',target=JOURNEY_DEFAULT_ZOOM,candidate=null,since=0,acceptedAt=0;
 return {
  update(next,now){
   if(!Number.isFinite(now)||!Object.hasOwn(JOURNEY_CAMERA_PROFILES,next))return target;
   if(next===scene){candidate=null;return target;}
   const nextTarget=JOURNEY_CAMERA_PROFILES[next];
   if(nextTarget===target){scene=next;candidate=null;return target;}
   if(candidate!==next){candidate=next;since=now;}
   const cinematicIn=isCinematic(next),cinematicOut=isCinematic(scene);
   const dwell=regional?(cinematicIn?1600:2400):(cinematicIn?800:1200);
   const hold=regional?5000:(cinematicOut?2400:cinematicIn?1600:5000);
   if(now-since>=dwell&&now-acceptedAt>=hold){
    scene=next;target=nextTarget;candidate=null;acceptedAt=now;
   }
   return target;
  },
  get target(){return target;},get scene(){return scene;}
 };
}
export function easeJourneyCamera(current,hero,target,dt,viewport,world){
 const difference=target-current.zoom;
 // Large reveals take several seconds rather than spending the whole change
 // in the first few frames. Ordinary/legacy zoom retains its established rate.
 const response=target<.6||current.zoom<.66?.65:1.8;
 const zoom=Math.abs(difference)<.001?target:current.zoom+difference*(1-Math.exp(-Math.max(0,Math.min(.07,dt))*response));
 const hx=(hero.x+.5)*world.tile,hy=(hero.y+.5)*world.tile;
 // Keep the traveller at the same screen position as the field expands.
 const anchor={x:hx-(hx-current.x)*current.zoom/zoom,y:hy-(hy-current.y)*current.zoom/zoom};
 return {...limitCamera(anchor,hero,{...viewport,zoom},world,.08),zoom};
}

// Keep the next reachable part of the path visible rather than waiting for the
// traveller to approach the screen edge. The camera never changes the route.
export function easeJourneyFollowCamera(current,hero,path,dt,viewport,world){
 if(!path?.length)return {x:current.x,y:current.y};
 const tile=world.tile,hx=(hero.x+.5)*tile,hy=(hero.y+.5)*tile;
 // A few upcoming path cells predict bends, for both field and atlas travel.
 const ahead=path[Math.min(path.length-1,4)];
 const vx=ahead.x-hero.x,vy=ahead.y-hero.y,length=Math.hypot(vx,vy);
 if(length<.0001)return {x:current.x,y:current.y};
 const zoom=viewport.zoom||1;
 const halfX=viewport.width/(2*zoom*tile),halfY=viewport.height/(2*zoom*tile);
 const distance=Math.min(2.8,1.15+.32*Math.min(path.length,5));
 // The traveller stays well inside the viewport even in close 1.8x scenes.
 const maxX=Math.min(distance,Math.max(0,(halfX-1.2)*.7));
 const maxY=Math.min(distance,Math.max(0,(halfY-1.2)*.7));
 let leadX=vx/length*maxX,leadY=vy/length*maxY;
 // Existing authored scenic thresholds lightly draw the eye forward.
 // Behind-the-traveller landmarks must never pull the view backwards.
 for(const beat of world.pilgrimage?[]:JOURNEY_SCENIC_BEATS){
  const bx=beat.x-hero.x,by=beat.y-hero.y,proximity=Math.hypot(bx,by);
  if(proximity<.25||proximity>beat.r+5||bx*vx+by*vy<=0)continue;
  const influence=.24*Math.min(1,(beat.r+5-proximity)/3);
  leadX=leadX*(1-influence)+bx/proximity*maxX*influence;
  leadY=leadY*(1-influence)+by/proximity*maxY*influence;
  break;
 }
 const target={x:hx+leadX*tile,y:hy+leadY*tile};
 const factor=1-Math.exp(-Math.min(.12,Math.max(0,dt))*7);
 return limitCamera({
  x:current.x+(target.x-current.x)*factor,
  y:current.y+(target.y-current.y)*factor
 },hero,viewport,world,.6);
}

// Hold a panned composition until the traveller catches its forward side.
// Only the occupied path edge decides direction; future bends cannot pull back.
export function easePilgrimageFollowCamera(current,hero,path,dt,viewport,world){
 if(!path?.length)return {x:current.x,y:current.y};
 const next=path.find(p=>Math.hypot(p.x-hero.x,p.y-hero.y)>.0001);
 if(!next)return {x:current.x,y:current.y};
 const axis=(value,position,direction,extent)=>{
  const forward=extent/(2*viewport.zoom)*.45;
  return direction>.0001?Math.max(value,position-forward):direction<-.0001?Math.min(value,position+forward):value;
 };
 const x=axis(current.x,(hero.x+.5)*world.tile,next.x-hero.x,viewport.width);
 const y=axis(current.y,(hero.y+.5)*world.tile,next.y-hero.y,viewport.height);
 const factor=1-Math.exp(-Math.max(0,Math.min(.12,dt))*4.5);
 return limitCamera({x:current.x+(x-current.x)*factor,y:current.y+(y-current.y)*factor},hero,viewport,world,.08);
}

// A stopped/panned composition is retained until real walking catches it.
// Then the forward lead grows over four tiles, independent of route length.
export function createPilgrimageFollower(){
 let last=null,heading='',travel=0,leadTravel=0,following=false;
 return {
  reset(){last=null;heading='';travel=leadTravel=0;following=false;},
  update(current,hero,path,dt,viewport,world){
   const next=path?.find(p=>Math.hypot(p.x-hero.x,p.y-hero.y)>.0001);
   if(!next){this.reset();return {x:current.x,y:current.y};}
   const dx=Math.sign(next.x-hero.x),dy=Math.sign(next.y-hero.y),key=dx+','+dy;
   const moved=last?Math.hypot(hero.x-last.x,hero.y-last.y):0;last={...hero};
   if(key!==heading||moved>1){heading=key;travel=leadTravel=0;following=false;}
   travel+=Math.min(1,moved);
   const hx=(hero.x+.5)*world.tile,hy=(hero.y+.5)*world.tile;
   const caught=(hx-current.x)*dx+(hy-current.y)*dy>=-world.tile*.25;
   if(!following&&travel>=2.6&&caught)following=true;
   if(following)leadTravel+=Math.min(1,moved);
   if(!following)return limitCamera(current,hero,viewport,world,.08);
   const lead=Math.min(1,leadTravel/4)*world.tile*3;
   const x=dx>0?Math.max(current.x,hx+lead):dx<0?Math.min(current.x,hx-lead):current.x;
   const y=dy>0?Math.max(current.y,hy+lead):dy<0?Math.min(current.y,hy-lead):current.y;
   const f=1-Math.exp(-Math.min(.07,Math.max(0,dt))*3.5);
   return limitCamera({x:current.x+(x-current.x)*f,y:current.y+(y-current.y)*f},hero,viewport,world,.08);
  }
 };
}
