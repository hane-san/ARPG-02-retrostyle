// Issue #99: original code-drawn art for the three walks. Visual only: walkability,
// routes and collision come from pilgrimage-world.js and never change here.
// Twilight hills = warm slopes, wind-leaning grass and long shadows; small climb =
// stone steps, terrace ledges and outcrops; lakeside = boardwalk, rails and dusk glints.
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
const open=t=>t!=='X'&&t!=='L'&&t!=='~';
export const DETOUR_FORMS=Object.freeze(['dusk-tree','summit-cairn','shore-bench']);

// Walkable ground of a walk. Returns true when it drew the tile's details.
export function drawDetourGround(c,x,y,t,world,z,q){
 if(!z.detour)return false;
 const px=x*32,py=y*32,[ground,light,water,shade]=z.palette;
 if(z.theme==='dusk'){
  // A local sunset: warm at the top of each tile, violet toward its foot.
  rect(c,px,py,32,10,'#f3b47a2a');rect(c,px,py+22,32,10,'#8e78a82a');
  for(let i=0;i<3;i++){const gx=px+4+((x*7+y*3+i*11)%24),gy=py+8+((x*5+y*9+i*7)%18);
   c.strokeStyle=i%2?'#a2716a':'#e7b98a';c.lineWidth=1;c.beginPath();c.moveTo(gx,gy+6);c.lineTo(gx+3,gy);c.stroke();}
  if(t==='=')rect(c,px+3,py+14,26,3,'#f1d0a255');
  if(q>.82)rect(c,px+8,py+24,16,2,'#6f557055');// a long shadow of a grass tuft
  return true;
 }
 if(z.theme==='climb'){
  if(t==='='){for(let k=0;k<4;k++){rect(c,px+2,py+k*8+1,28,6,k%2?light:'#e8e3d0');rect(c,px+2,py+k*8+7,28,1,shade);}}
  else if(q>.6){rect(c,px+6,py+18,9,6,shade);rect(c,px+7,py+18,6,2,light);}
  // A ledge lip wherever the path drops toward impassable ground below.
  if(!open(world.tileAt(x,y+1))){rect(c,px,py+28,32,4,'#58605a');rect(c,px,py+27,32,1,'#eceadb');}
  return true;
 }
 if(z.theme==='shore'){
  const water=dx=>world.tileAt(x+dx[0],y+dx[1])==='L';
  if(t==='='||[[0,-1],[0,1],[-1,0],[1,0]].some(water)){
   // Boardwalk planks across the walking direction; a rail post on the water side.
   for(let k=0;k<4;k++){rect(c,px+1+k*8,py+2,7,28,k%2?'#b29676':'#c4a985');rect(c,px+k*8+8,py+2,1,28,'#7d6650');}
   if(water([0,-1])){rect(c,px,py,32,3,'#6d5b4c');for(const dx of [3,19])rect(c,px+dx,py-2,3,7,'#5b4b3f');}
  }
  rect(c,px,py,32,32,'#f4b88a14');
  return true;
 }
 return false;
}

// Impassable ground beside a walk. Returns true when it drew the tile.
export function drawDetourEdge(c,x,y,world,z,q){
 if(!z.detour)return false;
 const px=x*32,py=y*32,below=open(world.tileAt(x,y+1));
 if(z.theme==='dusk'){
  // Rounded grassy slopes: lit crest, violet flank.
  rect(c,px,py,32,32,'#a98a86');
  const sx=px+10+q*12,sw=12+q*8;
  c.fillStyle='#c79c7f';c.beginPath();c.ellipse(sx,py+22-q*4,sw,12,0,Math.PI,Math.PI*2);c.fill();
  if(q>.35){c.fillStyle='#e4b98d';c.beginPath();c.ellipse(sx-4,py+14-q*3,sw*.55,4,0,Math.PI,Math.PI*2);c.fill();}
  if(below){rect(c,px,py+26,32,6,'#7e6680');}
  if(q>.7){c.strokeStyle='#efc794';c.lineWidth=1;c.beginPath();c.moveTo(px+20,py+16);c.lineTo(px+24,py+9);c.stroke();}
  return true;
 }
 if(z.theme==='climb'){
  // Terrace rock: flat lit top, stepped grey face toward the walk below.
  rect(c,px,py,32,32,'#8f978c');rect(c,px+2,py+2,28,14,'#b3b8a8');rect(c,px+2,py+2,28,2,'#e2e1d0');
  if(below){rect(c,px,py+16,32,16,'#6d756d');for(const yy of [20,25,29])rect(c,px,py+yy,32,1,'#545b55');}
  else if(q>.55){rect(c,px+8,py+18,12,8,'#7b8379');rect(c,px+9,py+18,8,2,'#c7c9b8');}
  return true;
 }
 // shore: reeds and wet stones between path and water
 rect(c,px,py,32,32,'#8d8a83');
 for(let i=0;i<4;i++){const rx=px+3+i*7+(q*5|0)%4;rect(c,rx,py+10+(i%2)*4,1,16,'#5f6b5d');rect(c,rx-1,py+9+(i%2)*4,3,3,'#a77f5e');}
 if(q>.5){rect(c,px+16,py+22,9,5,'#b6b3a6');rect(c,px+17,py+22,6,1,'#e2ddcb');}
 return true;
}

// A lake tile next to the shore walk catches the sunset.
export function drawDuskGlint(c,x,y,world){
 const near=[[0,-1],[0,1],[-1,0],[1,0],[0,-2],[0,2]].some(([dx,dy])=>{const z=world.zoneAt(x+dx,y+dy);return z.theme==='shore'&&open(world.tileAt(x+dx,y+dy));});
 if(!near)return;
 const px=x*32,py=y*32;rect(c,px+4+(x*13%16),py+10,10,1,'#f6c48d');rect(c,px+10+(y*7%12),py+20,6,1,'#e39aa0aa');
}

export function drawDetourSite(c,s){
 const x=s.x*32,y=s.y*32,w=s.w*32,h=s.h*32,cx=x+w/2,base=y+h;
 c.save();rect(c,x+6,base-6,w-12,10,'#3f394425');
 if(s.form==='dusk-tree'){
  // One wind-bent tree: trunk leaning downwind, a crown pulled to one side.
  c.strokeStyle='#5b4337';c.lineWidth=6;c.beginPath();c.moveTo(cx,base-6);c.quadraticCurveTo(cx-4,base-40,cx+16,base-66);c.stroke();
  c.lineWidth=3;c.beginPath();c.moveTo(cx+4,base-40);c.lineTo(cx+26,base-52);c.stroke();
  for(const [dx,dy,rw,rh,col] of [[10,-80,34,18,'#8a6a73'],[22,-70,30,16,'#a0796f'],[4,-70,24,14,'#c39275'],[18,-86,20,10,'#e6b58a']]){
   c.fillStyle=col;c.beginPath();c.ellipse(cx+dx,base+dy,rw/2,rh/2,-.25,0,Math.PI*2);c.fill();}
  rect(c,cx-40,base-4,64,3,'#6f557066');// its long evening shadow
 }else if(s.form==='summit-cairn'){
  // Stacked stones and a thin stone vane.
  for(const [dx,dy,sw,sh,col] of [[-14,-14,28,12,'#8f978c'],[-10,-25,22,11,'#a9ae9f'],[-7,-35,15,10,'#c3c5b6'],[-4,-43,9,8,'#dcdccc']]){rect(c,cx+dx,base+dy,sw,sh,col);rect(c,cx+dx,base+dy,sw,2,'#ecebdc');}
  rect(c,cx-1,base-70,2,28,'#5c6460');
  c.fillStyle='#d9d4bf';c.beginPath();c.moveTo(cx+1,base-68);c.lineTo(cx+20,base-63);c.lineTo(cx+1,base-58);c.closePath();c.fill();
  rect(c,cx-8,base-74,16,2,'#e8e5d4');
 }else{
  // A worn bench facing the water; one end re-cut many times.
  rect(c,x+6,base-26,w-12,6,'#a58468');rect(c,x+6,base-26,w-12,2,'#d2b18e');rect(c,x+6,base-26,8,6,'#c9a27e');
  rect(c,x+10,base-20,4,14,'#6d5644');rect(c,x+w-14,base-20,4,14,'#6d5644');
  rect(c,x+6,base-40,w-12,4,'#8c6f58');
 }
 c.restore();
}
