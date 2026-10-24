import {limitCamera} from './camera-limits.js';
import {journeyScenicScene,JOURNEY_SCENIC_BEATS} from './journey-scenic.js';

// Stage 1 is closest; stage 5 is the new widest landscape framing.
// Stages 1/2 are reserved for future close views / actual interiors.
export const JOURNEY_ZOOM_STAGES=Object.freeze([1.8,1.35,1,.8,.6]);
export const JOURNEY_CAMERA_PROFILES=Object.freeze({
 'journey-detail':1.8,'journey-interior':1.35,
 'journey-port':1,'journey-tea':1,'journey-hut':1,
 'journey-road':.8,'journey-pass':.8,
 'journey-steppe':.6,'journey-lake':.6,'journey-salt':.6,'journey-sunset':.6,
 // Escarpments stay broad; narrow inhabited streets invite closer inspection.
 'journey-canyon':.8,'journey-highland':.6,'journey-sky-edge':.6,'journey-river':1,
 'journey-glass':1.35,'journey-wetlands':.8,'journey-whitebasin':.6,
 // A tight dark corridor opens into the widest sky frame at the lookout.
 'journey-ancient':.8,'journey-void':1.35,'journey-drowned':.8,'journey-sky-ruins':.6,
 'journey-scenic-detail':1.8,'journey-scenic-near':1.35,'journey-scenic-wide':.6
});
export function journeyCameraScene(world,hero){
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
 const scenic=journeyScenicScene(hero);
 if(scenic)return scenic;
 const scene=world.zoneAt(hero.px,hero.py).id;
 if(scene==='journey-tea')return 'journey-road';
 // Only the open centre is panoramic. Ordinary approach roads retain stage 4.
 if(scene==='journey-steppe'&&Math.hypot(hero.px-36,hero.py-38)>18)return 'journey-road';
 return scene;
}
export function createJourneyCamera(){
 let scene='journey-port',target=JOURNEY_CAMERA_PROFILES[scene],candidate=null,since=0,acceptedAt=0;
 return {
  update(next,now){
   if(!Number.isFinite(now)||!Object.hasOwn(JOURNEY_CAMERA_PROFILES,next))return target;
   if(next===scene){candidate=null;return target;}
   if(candidate!==next){candidate=next;since=now;}
   if(now-since>=1200&&now-acceptedAt>=5000){
    scene=next;target=JOURNEY_CAMERA_PROFILES[scene];candidate=null;acceptedAt=now;
   }
   return target;
  },
  get target(){return target;},get scene(){return scene;}
 };
}
export function easeJourneyCamera(current,hero,target,dt,viewport,world){
 const difference=target-current.zoom;
 const zoom=Math.abs(difference)<.001?target:current.zoom+difference*(1-Math.exp(-Math.max(0,Math.min(.12,dt))*1.8));
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
 for(const beat of JOURNEY_SCENIC_BEATS){
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
