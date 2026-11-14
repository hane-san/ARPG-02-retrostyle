// 2026-11-14 (producer: "update the buildings' art too"). The screen-switching
// journey reuses the pilgrimage's building drawings at a closer, steadier
// scale, where they read as flat pastel boxes. This finishing pass gives every
// building, house, piece of equipment and villager on a board what a
// hand-made 16-bit tile set has: a soft shadow where it meets the ground, a
// dark one-pixel contour around its silhouette, and light from the upper left
// (a lit top, a shaded foot and right side). Plain painted walls also gain
// faint weatherboards.
//
// The drawing itself is still painted straight onto the board, exactly as
// before (some drawings blend with the ground beneath them), so the contour is
// laid under it and the light over it. The source drawings are unchanged, and
// the connected world and older modes look as they did.
//
// Still drawings are measured once and cached (trimmed to what they cover); a
// drawing that moves (a windmill's sails, a turning wheel) is measured again
// each frame.
const RES=2,PAD_X=96,PAD_UP=420,PAD_DOWN=40,LIMIT=48;
const cache=new Map();
let scratch=null;
function canvasOf(w,h){const c=document.createElement('canvas');c.width=Math.max(1,w);c.height=Math.max(1,h);return c;}
function silhouette(box,draw,time){
 const W=Math.ceil((box.w+PAD_X*2)*RES),H=Math.ceil((box.h+PAD_UP+PAD_DOWN)*RES);
 if(!scratch||scratch.width<W||scratch.height<H)scratch=canvasOf(Math.max(W,scratch?.width||0),Math.max(H,scratch?.height||0));
 const g=scratch.getContext('2d',{willReadFrequently:true});g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,scratch.width,scratch.height);
 g.setTransform(RES,0,0,RES,-(box.x-PAD_X)*RES,-(box.y-PAD_UP)*RES);draw(g,time);g.setTransform(1,0,0,1,0,0);
 return {g,W,H};
}
function bounds(g,W,H){
 const d=g.getImageData(0,0,W,H).data;let x0=W,y0=H,x1=-1,y1=-1;
 for(let y=0;y<H;y+=2)for(let x=0;x<W;x+=2)if(d[(y*W+x)*4+3]>6){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 if(x1<0)return null;const m=6;return {sx:Math.max(0,x0-m),sy:Math.max(0,y0-m),sw:Math.min(W,x1+m+2)-Math.max(0,x0-m),sh:Math.min(H,y1+m+2)-Math.max(0,y0-m)};
}
function layers(e,draw,time){
 const {box}=e,{g,W,H}=silhouette(box,draw,time);
 const t=e.trim||(e.trim=e.animated?{sx:0,sy:0,sw:W,sh:H}:bounds(g,W,H));if(!t){e.under=e.over=null;return;}
 const {sx,sy,sw,sh}=t;
 // Under: the silhouette in deep ink, spread by about one board pixel.
 const ink=canvasOf(sw,sh),k=ink.getContext('2d');k.drawImage(scratch,sx,sy,sw,sh,0,0,sw,sh);k.globalCompositeOperation='source-in';k.fillStyle='rgba(32,44,46,.6)';k.fillRect(0,0,sw,sh);
 const under=e.under&&e.under.width===sw&&e.under.height===sh?e.under:canvasOf(sw,sh),u=under.getContext('2d');u.clearRect(0,0,sw,sh);
 for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]])u.drawImage(ink,dx*RES*.9,dy*RES*.9);
 // Over: the light, kept inside the silhouette.
 const over=e.over&&e.over.width===sw&&e.over.height===sh?e.over:canvasOf(sw,sh),o=over.getContext('2d');o.clearRect(0,0,sw,sh);
 o.save();o.translate(-sx,-sy);
 const foot=(PAD_UP+box.h)*RES,top=Math.max(0,PAD_UP*RES-box.h*RES*1.6);
 const v=o.createLinearGradient(0,top,0,foot);v.addColorStop(0,'rgba(255,250,232,.16)');v.addColorStop(.55,'rgba(255,250,232,0)');v.addColorStop(.82,'rgba(30,42,44,.06)');v.addColorStop(1,'rgba(30,42,44,.2)');o.fillStyle=v;o.fillRect(sx,sy,sw,sh);
 const left=PAD_X*RES,right=(PAD_X+box.w)*RES,s=o.createLinearGradient(left,0,right,0);s.addColorStop(0,'rgba(255,250,232,.06)');s.addColorStop(.6,'rgba(30,42,44,0)');s.addColorStop(1,'rgba(30,42,44,.12)');o.fillStyle=s;o.fillRect(sx,sy,sw,sh);
 // Plain painted walls gain weatherboards: faint courses across the wall only.
 if(e.texture==='boards')for(let y=5;y<box.h-4;y+=6){o.fillStyle='rgba(40,56,58,.08)';o.fillRect(PAD_X*RES,(PAD_UP+y)*RES,box.w*RES,RES*.8);o.fillStyle='rgba(255,252,238,.08)';o.fillRect(PAD_X*RES,(PAD_UP+y+1)*RES,box.w*RES,RES*.6);}
 o.restore();o.globalCompositeOperation='destination-in';o.drawImage(scratch,sx,sy,sw,sh,0,0,sw,sh);o.globalCompositeOperation='source-over';
 e.under=under;e.over=over;
}
function moves(box,draw){
 // Compare two moments once: a drawing that changes with time stays live.
 const a=silhouette(box,draw,0),da=a.g.getImageData(0,0,a.W,a.H).data.slice();
 const b=silhouette(box,draw,2345),db=b.g.getImageData(0,0,b.W,b.H).data;
 for(let i=3;i<da.length;i+=16)if(Math.abs(da[i]-db[i])>8||Math.abs(da[i-3]-db[i-3])>12)return true;
 return false;
}
// box: the object's footprint on the board in board pixels {x,y,w,h}.
export function drawFinished(c,key,box,draw,time,{texture=null,shadow=true}={}){
 if(typeof document==='undefined'){draw(c,time);return;}
 let e=cache.get(key);
 if(!e||e.box.w!==box.w||e.box.h!==box.h||e.box.x!==box.x||e.box.y!==box.y){e={box:{...box},texture,animated:moves(box,draw),trim:null,under:null,over:null,ready:false};}
 cache.delete(key);cache.set(key,e);
 while(cache.size>LIMIT)cache.delete(cache.keys().next().value);
 if(e.animated){layers(e,draw,time);}else if(!e.ready){layers(e,draw,time);e.ready=true;}
 const place=img=>{if(img)c.drawImage(img,box.x-PAD_X+e.trim.sx/RES,box.y-PAD_UP+e.trim.sy/RES,img.width/RES,img.height/RES);};
 // A soft contact shadow, a little to the lower right of the footprint.
 if(shadow){c.save();c.fillStyle='rgba(28,40,38,.2)';c.beginPath();c.ellipse(box.x+box.w/2+5,box.y+box.h-3,box.w/2+9,Math.min(16,6+box.h*.12),0,0,Math.PI*2);c.fill();c.restore();}
 place(e.under);draw(c,time);place(e.over);
}
