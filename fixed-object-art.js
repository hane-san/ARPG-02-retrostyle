// Repairs to disconnected pieces in the atlas rendition. Original forms,
// source coordinates, occupied feet and animation clocks stay unchanged.
import {fixedSource} from './fixed-journey-data.js';
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
const L=(c,x,y,X,Y,col,w=1)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.stroke();};
const E=(c,x,y,r,col)=>{c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};

export function fixedObjectPadding(site){
 const s=site.scale||1,p={left:96,right:96,top:420,bottom:40};
 // The whole sail rectangle turns, not just its 108px centre line.
 if(site.form==='west-windmill')p.left=Math.max(p.left,Math.ceil((Math.hypot(108,26)-30)*s+4));
 if(site.form==='wonder-distribution')p.top=Math.max(p.top,Math.ceil(495*s+4));
 return p;
}

export function fixedObjectNeedsContactShadow(site,{role=null,retouch=null}={}){
 if(role||retouch)return true;
 if(site.form.startsWith('west-'))return !['west-lane','west-impression','west-dots'].includes(site.form);
 // Southeast drawings have no ground shadow; other original props and
 // wonders already paint one. Do not add a second, displaced footprint.
 return site.form.startsWith('se-');
}

export function drawConnectedAtlasObject(c,s,time,drawSource){
 if(!['se-shelter','west-terrace','shore-bench','se-waterwheel'].includes(s.form))return false;
 const x=s.x*32,y=s.y*32,w=s.w*32,h=s.h*32,base=y+h,p=fixedSource(s.chapter).palette;
 c.save();
 if(s.form==='se-shelter')for(const foot of s.solid){
  const px=x+(foot.x+foot.w/2)*32,top=y+20,bottom=y+foot.y*32;
  R(c,px-5,top,10,bottom-top,'#7d8264');R(c,px-4,top,2,bottom-top,'#c4bd94');
  L(c,px,top+35,px+(px<x+w/2?21:-21),top+1,'#7d8264',5);
 }
 if(s.form==='west-terrace')for(const px of [x,x+w-64]){
  // Soil and risers join the existing five planted ledges to their foot.
  R(c,px,base-124,64,60,p[3]);R(c,px+4,base-122,5,58,p[0]);
 }
 if(s.form==='shore-bench')for(const px of [x+10,x+w-14])R(c,px,base-40,4,34,'#8c6f58');
 if(s.form==='se-waterwheel'){
  const cy=y+h*.48,posts=s.solid.map(f=>({x:x+(f.x+f.w/2)*32,top:y+f.y*32}));
  for(const post of posts){R(c,post.x-5,cy-7,10,post.top-cy+7,'#788a7e');R(c,post.x-4,cy-6,2,post.top-cy+6,'#c6c5a2');}
  L(c,posts[0].x,cy,posts.at(-1).x,cy,'#788a7e',11);
 }
 drawSource(c,s,time,0);
 if(s.form==='se-waterwheel'){
  const cx=x+w*.5,cy=y+h*.48,r=Math.min(w,h)*.46,rx=cx+r*.76,ry=cy-r*Math.sqrt(1-.76**2),join=x+w-25;
  // The existing right-hand trough bends down to the real wheel rim.
  for(const [col,width] of [['#d2c3a4',9],['#89b8b3',4]]){L(c,join,y+20,rx,y+20,col,width);L(c,rx,y+20,rx,ry,col,width);}
  E(c,cx,cy,7,'#6f7969');E(c,cx,cy,3,'#d4bd91');
 }
 c.restore();return true;
}
