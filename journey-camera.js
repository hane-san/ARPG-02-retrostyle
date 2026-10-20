import {limitCamera} from './camera-limits.js';

// Stage 1 is closest; stage 5 is the new widest landscape framing.
// Stages 1/2 are reserved for future close views / actual interiors.
export const JOURNEY_ZOOM_STAGES=Object.freeze([1.8,1.35,1,.8,.6]);
export const JOURNEY_CAMERA_PROFILES=Object.freeze({
 'journey-detail':1.8,'journey-interior':1.35,
 'journey-port':1,'journey-tea':1,'journey-hut':1,
 'journey-road':.8,'journey-pass':.8,
 'journey-steppe':.6,'journey-lake':.6,'journey-salt':.6,'journey-sunset':.6
});
export function journeyCameraScene(world,hero){
 for(const [id,radius] of [['journey-hut',7],['journey-chaikhana',7]]){
  const site=world.sites.find(site=>site.id===id);
  if(site&&Math.hypot(hero.px-site.entrance.x,hero.py-site.entrance.y)<=radius)
   return id==='journey-hut'?'journey-hut':'journey-tea';
 }
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
