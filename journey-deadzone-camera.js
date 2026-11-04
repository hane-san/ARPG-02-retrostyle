import {limitCamera} from './camera-limits.js';
import {pilgrimageForwardLead} from './journey-camera.js';

// Issue #104 trial, selected as the current pilgrimage's default in #108.
// A stable dead zone makes each small outdoor scene feel composed without
// breaking the continuous journey. Nothing in this director changes zoom.
export function deadzoneThreshold(viewport,axis,tile=32){
 const span=axis==='x'?viewport.width:viewport.height;
 const zoom=viewport.zoom||1;
 // Roughly two and a half tiles of slack, but never an enormous percentage
 // on small phones. Both axes scale in world units when the zoom changes.
 return Math.min(.205,2.45*tile*zoom/span);
}

export function createDeadzonePilgrimageFollower(){
 let last=null,heading='',engaged=false,leadDistance=0;
 return {
  reset(){last=null;heading='';engaged=false;leadDistance=0;},
  update(current,hero,path,dt,viewport,world){
   const next=path?.find(p=>Math.hypot(p.x-hero.x,p.y-hero.y)>.0001);
   if(!next)return {x:current.x,y:current.y};
   const dx=Math.sign(next.x-hero.x),dy=Math.sign(next.y-hero.y);
   const key=dx+','+dy,axis=dx?'x':'y',direction=dx||dy;
   const moved=last?Math.hypot(hero.x-last.x,hero.y-last.y):0;
   last={...hero};
   // Never teleport the camera after a route discontinuity or a turn.
   if(key!==heading||moved>1){heading=key;engaged=false;leadDistance=0;}
   const hx=(hero.x+.5)*world.tile,hy=(hero.y+.5)*world.tile;
   const span=axis==='x'?viewport.width:viewport.height;
   const heroPos=axis==='x'?hx:hy,eye=axis==='x'?current.x:current.y;
   const forwardFraction=(heroPos-eye)*direction*(viewport.zoom||1)/span;
   if(!engaged&&forwardFraction>deadzoneThreshold(viewport,axis,world.tile))engaged=true;
   if(!engaged)return limitCamera(current,hero,viewport,world,.08);
   leadDistance+=Math.min(1,moved);
   const progress=Math.min(1,leadDistance/5);
   const ramp=progress*progress*(3-2*progress);
   const lead=pilgrimageForwardLead(viewport,axis)*ramp;
   const target=heroPos+direction*lead;
   // Moving along the occupied edge may advance the camera, never drag a
   // manually panned view backwards while the traveller approaches it.
   const forwardTarget=direction>0?Math.max(eye,target):Math.min(eye,target);
   const elapsed=Math.max(0,Math.min(.07,dt));
   const walkingRate=dt>0?Math.min(10,moved/dt):0;
   const pace=Math.max(.7,Math.min(1.6,walkingRate/5.7));
   const factor=1-Math.exp(-elapsed*4.6*pace);
   const cap=world.tile*(walkingRate+5*pace)*elapsed;
   const change=Math.max(-cap,Math.min(cap,(forwardTarget-eye)*factor));
   const framed=axis==='x'?{x:eye+change,y:current.y}:{x:current.x,y:eye+change};
   return limitCamera(framed,hero,viewport,world,.08);
  }
 };
}
