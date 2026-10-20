import {limitCamera} from './camera-limits.js';

// Five destination framings, not a continuously drifting zoom preference.
export const JOURNEY_ZOOM_STAGES=Object.freeze([.8,1,1.25,1.5,1.8]);
export const JOURNEY_CAMERA_PROFILES=Object.freeze({
 'journey-steppe':.8,'journey-lake':.8,'journey-sunset':.8,
 'journey-salt':1,'journey-pass':1.25,'journey-port':1.5,
 'journey-tea':1.8,'journey-hut':1.5
});
export function nearestJourneyZoom(value){
 return JOURNEY_ZOOM_STAGES.reduce((best,next)=>Math.abs(next-value)<Math.abs(best-value)?next:best);
}
export function stepJourneyZoom(value,direction){
 const index=JOURNEY_ZOOM_STAGES.indexOf(nearestJourneyZoom(value));
 return JOURNEY_ZOOM_STAGES[Math.max(0,Math.min(4,index+Math.sign(direction)))];
}
export function journeyCameraScene(world,hero){
 const hut=world.sites.find(site=>site.id==='journey-hut');
 if(hut&&Math.hypot(hero.px-hut.entrance.x,hero.py-hut.entrance.y)<=7)return 'journey-hut';
 return world.zoneAt(hero.px,hero.py).id;
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
  manual(value){target=nearestJourneyZoom(value);return target;},
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
