// Issue #93 first batch: impassable ground reads differently in each region. Art only;
// tiles stay 'X' (blocked) and nothing here changes walkability, routes or collision.
// Forest = roots and two crown shapes, canyon = flat red shelves over a striped face,
// salt plain = white crust split by blue cracks, capital = identical planned blocks.
const fill=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
const stroke=(c,points,color,width=1)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
const open=t=>t!=='X'&&t!=='L'&&t!=='~';

export const EDGE_THEMES=Object.freeze(['forest','canyon','salt','capital']);

// Returns true when the regional grammar painted the tile; otherwise the caller keeps its default.
export function drawRegionalEdge(c,x,y,world,theme,palette,q){
 if(!EDGE_THEMES.includes(theme))return false;
 const px=x*32,py=y*32,below=open(world.tileAt(x,y+1)),above=open(world.tileAt(x,y-1));
 const left=open(world.tileAt(x-1,y)),right=open(world.tileAt(x+1,y));
 const [ground,light,water,shade]=palette;
 if(theme==='forest'){
  // Dense canopy: round crowns and tall narrow crowns alternate; roots only where a path passes.
  fill(c,px,py,32,32,'#5f7f60');
  const tall=q>.55;
  if(tall){fill(c,px+9,py+2,14,26,'#4c6d50');fill(c,px+12,py+4,6,18,'#6f9469');fill(c,px+14,py+1,4,4,'#86a97b');}
  else{c.fillStyle='#4f7253';c.beginPath();c.arc(px+16,py+15,13,0,Math.PI*2);c.fill();c.fillStyle='#759b6c';c.beginPath();c.arc(px+12,py+11,6,0,Math.PI*2);c.fill();}
  if(below){
   // A trunk foot and spreading roots tell the walker this edge is solid.
   fill(c,px+13,py+20,6,12,'#6b5240');
   stroke(c,[[px+13,py+30],[px+5,py+32]],'#5a4436',2);stroke(c,[[px+19,py+30],[px+27,py+32]],'#5a4436',2);
  }
  return true;
 }
 if(theme==='canyon'){
  // Flat shelf top; a striped face shows wherever the walker stands below it.
  fill(c,px,py,32,32,'#b48a76');
  if(below){
   fill(c,px,py,32,12,'#d1a993');fill(c,px,py+12,32,20,'#9a6d5d');
   for(let i=0;i<3;i++)stroke(c,[[px,py+17+i*5],[px+32,py+16+i*5+(q>.5?1:0)]],'#7f5749',1);
   fill(c,px,py+11,32,1,'#ecc7ad');
  }else{
   fill(c,px+2,py+2,28,28,'#c09682');
   if(q>.6)stroke(c,[[px+10,py+4],[px+13,py+15],[px+11,py+27]],'#8f6253',1);
  }
  if(left)fill(c,px,py,2,32,'#e3bca4');if(right)fill(c,px+30,py,2,32,'#87594b');
  if(above)fill(c,px,py,32,2,'#ecc7ad');
  return true;
 }
 if(theme==='salt'){
  // White crust split by blue cracks: the crack is the reason you cannot cross.
  fill(c,px,py,32,32,'#e6e8dc');
  const a=8+Math.round(q*12);
  stroke(c,[[px,py+a],[px+11,py+a+5],[px+18,py+a+1],[px+32,py+a+7]],'#5f93a6',3);
  stroke(c,[[px,py+a],[px+11,py+a+5],[px+18,py+a+1],[px+32,py+a+7]],'#a6cfd8',1);
  if(q>.5)stroke(c,[[px+11,py+a+5],[px+9,py+31]],'#6f9fb0',2);
  // A darker lip where crust meets walkable ground, not only a brightness change.
  if(below)fill(c,px,py+29,32,3,'#9aa69c');if(above)fill(c,px,py,32,2,'#c8ccbe');
  if(left)fill(c,px,py,2,32,'#c8ccbe');if(right)fill(c,px+30,py,2,32,'#9aa69c');
  return true;
 }
 // capital: every block is the same size, spacing and orientation.
 fill(c,px,py,32,32,shade);
 fill(c,px+3,py+3,26,26,ground);fill(c,px+3,py+3,26,5,light);
 for(const wx of [8,15,22])fill(c,px+wx,py+13,3,5,'#6f7d74');
 fill(c,px+3,py+27,26,2,'#6f7d74');
 if(below)fill(c,px,py+30,32,2,'#5f6b62');
 return true;
}
