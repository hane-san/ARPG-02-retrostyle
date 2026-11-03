// Issue #99: original code-drawn art for the three walks. Visual only: walkability,
// routes and collision come from pilgrimage-world.js and never change here.
// Twilight hills = warm slopes, wind-leaning grass and long shadows; small climb =
// stone steps, terrace ledges and outcrops; lakeside = boardwalk, rails and dusk glints.
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
const open=t=>t!=='X'&&t!=='L'&&t!=='~';
export const DETOUR_FORMS=Object.freeze(['dusk-tree','summit-cairn','shore-bench','salt-pillar','fallen-cedar','buried-gate']);
// Issue #99 P1: dry white plateau = cracked salt crust and weathered pillars; misty
// conifers = needle litter, tall dark trunks and local mist wisps (no screen-wide fog);
// windy grassland = leaning blades, old paving under the grass and low stone stubs.
const crack=(c,px,py,seed,color)=>{
 c.strokeStyle=color;c.lineWidth=1;c.beginPath();
 const a=seed%7,b=(seed>>3)%9;c.moveTo(px+2+a,py+4+b);c.lineTo(px+12+b,py+14-a);c.lineTo(px+28-a,py+10+b);
 c.moveTo(px+12+b,py+14-a);c.lineTo(px+10+a,py+29);c.stroke();
};

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
 const seed=(x*73856093^y*19349663)>>>0;
 if(z.theme==='plateau'){
  // Salt crust in polygons; the walked line is a slightly darker, trodden strip.
  rect(c,px,py,32,32,'#f7f4ea30');crack(c,px,py,seed,'#bfb7a6');
  if(q>.7){rect(c,px+18,py+20,8,2,'#ffffff');rect(c,px+18,py+22,8,1,'#c9c1ae');}
  if(t==='=')rect(c,px+4,py+13,24,6,'#cfc6b355');
  return true;
 }
 if(z.theme==='conifer'){
  // Needle litter and roots; a soft mist wisp only on some tiles.
  for(let i=0;i<5;i++){const nx=px+2+((seed>>i)%26),ny=py+3+((seed>>(i+4))%26);rect(c,nx,ny,4,1,i%2?'#5d4f3d':'#87745a');}
  if(t==='='){rect(c,px+2,py+12,28,8,'#8c7a5e88');if(q>.5)rect(c,px+6+(seed%14),py+11,10,2,'#5b4a38');}
  if(q>.78){c.fillStyle='#e3ebe755';c.beginPath();c.ellipse(px+16,py+12,15,4,0,0,Math.PI*2);c.fill();}
  return true;
 }
 if(z.theme==='windruin'){
  // Every blade leans the same way downwind; old paving shows through the road line.
  for(let i=0;i<4;i++){const gx=px+3+((seed>>(i*2))%24),gy=py+10+((seed>>(i+3))%16);
   c.strokeStyle=i%2?'#8f9d6c':'#c8d29e';c.lineWidth=1;c.beginPath();c.moveTo(gx,gy+7);c.quadraticCurveTo(gx+2,gy+2,gx+6,gy);c.stroke();}
  if(t==='='){for(const [ox,oy] of [[3,10],[17,9],[9,19],[22,20]])if((seed>>ox)%3){rect(c,px+ox,py+oy,9,6,'#c4c0a6');rect(c,px+ox,py+oy+5,9,1,'#8d8a74');}}
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
 if(z.theme==='plateau'){
  // A raised white shelf: crusted top, banded flank, and now and then a wind-cut pillar.
  // The shelf is a calm, slightly darker plane; only its lip toward the walk is banded.
  rect(c,px,py,32,32,'#d6cfbe');if(q>.6)crack(c,px,py,(x*31+y*17)>>>0,'#c4bba8');
  if(below){rect(c,px,py+20,32,12,'#b8ae9a');rect(c,px,py+20,32,1,'#f1ece0');rect(c,px,py+26,32,1,'#9d937f');}
  if(q>.8){rect(c,px+11,py+4,9,14,'#ddd6c4');rect(c,px+11,py+4,9,2,'#f8f5ec');rect(c,px+18,py+5,2,13,'#b3a994');}
  return true;
 }
 if(z.theme==='conifer'){
  // Dense forest floor under the canopy; tall trees themselves are props (drawDetourProp).
  rect(c,px,py,32,32,'#3c5049');
  for(let i=0;i<3;i++){const tx=px+5+i*11,h=10+((x*3+y*5+i*7)%8);c.fillStyle=i%2?'#46645a':'#557567';c.beginPath();c.moveTo(tx,py+28-h);c.lineTo(tx-5,py+28);c.lineTo(tx+5,py+28);c.closePath();c.fill();}
  if(below)rect(c,px,py+28,32,4,'#2f3f39');
  return true;
 }
 if(z.theme==='windruin'){
  // Tall grass waves; a low stone stub of the old road shows through here and there.
  rect(c,px,py,32,32,'#9fae84');
  for(let i=0;i<6;i++){const gx=px+2+i*5,h=12+((x*5+y*3+i*7)%9);c.strokeStyle=i%2?'#7f8f62':'#c4cf98';c.lineWidth=2;c.beginPath();c.moveTo(gx,py+30);c.quadraticCurveTo(gx+2,py+30-h/2,gx+6,py+30-h);c.stroke();}
  if(q>.84){rect(c,px+10,py+14,10,14,'#a9a690');rect(c,px+10,py+14,10,2,'#d8d5bf');rect(c,px+18,py+16,2,12,'#7f7d6a');}
  if(below)rect(c,px,py+29,32,3,'#6f7d58');
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

// Tall props beside the newer walks. Drawn with the decor pass, so they are never
// clipped by terrain chunk edges. The first three walks keep their existing props.
export function drawDetourProp(c,d){
 const x=d.x*32,y=d.y*32,v=d.variant;
 if(d.detour==='plateau'){
  if(v%3){rect(c,x+6,y+22,20,4,'#ffffff');rect(c,x+6,y+26,20,2,'#cfc6b3');return true;}// a salt rim
  const h=40+v*4;rect(c,x+9,y+28-h,14,h,'#ddd5c1');rect(c,x+9,y+28-h,14,3,'#f8f5ec');rect(c,x+19,y+30-h,4,h-2,'#b9af99');
  for(let k=1;k<4;k++)rect(c,x+9,y+28-h*k/4,14,1,'#c2b8a2');return true;
 }
 if(d.detour==='conifer'){
  const tx=x+16,h=70+v*5,top=y+26-h;
  rect(c,tx-2,y+4,4,24,'#4a3a2e');
  for(let k=0;k<4;k++){const w=8+k*4,yy=top+k*h/5;c.fillStyle=k%2?'#46645a':'#557567';c.beginPath();c.moveTo(tx,yy);c.lineTo(tx-w,yy+h/4);c.lineTo(tx+w,yy+h/4);c.closePath();c.fill();}
  rect(c,tx-1,top,2,8,'#8fae9c');
  if(v%4===0){c.fillStyle='#e3ebe744';c.beginPath();c.ellipse(tx,y+6,22,5,0,0,Math.PI*2);c.fill();}// a low mist wisp
  return true;
 }
 if(d.detour==='windruin'){
  if(v%4===0){rect(c,x+9,y+8,14,20,'#aeab95');rect(c,x+9,y+8,14,3,'#dedbc5');rect(c,x+19,y+10,4,18,'#85836f');}// an old road stub
  for(let i=0;i<4;i++){const gx=x+4+i*7,h=18+((v+i*5)%10);c.strokeStyle=i%2?'#7f8f62':'#c4cf98';c.lineWidth=2;c.beginPath();c.moveTo(gx,y+30);c.quadraticCurveTo(gx+2,y+30-h/2,gx+8,y+30-h);c.stroke();}
  return true;
 }
 return false;
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
 }else if(s.form==='salt-pillar'){
  // A tall wind-cut pillar, narrower at its waist, with a white rim at its foot.
  c.fillStyle='#ddd5c1';c.beginPath();c.moveTo(cx-14,base-8);c.lineTo(cx-8,base-60);c.lineTo(cx-12,base-96);c.lineTo(cx+12,base-100);c.lineTo(cx+9,base-60);c.lineTo(cx+15,base-8);c.closePath();c.fill();
  rect(c,cx+6,base-96,4,88,'#b9af99');rect(c,cx-12,base-100,24,4,'#f8f5ec');
  for(const yy of [-80,-62,-40,-22])rect(c,cx-11,base+yy,22,1,'#c2b8a2');
  rect(c,cx-22,base-10,44,4,'#ffffff');rect(c,cx-22,base-6,44,2,'#cfc6b3');
 }else if(s.form==='fallen-cedar'){
  // A huge fallen trunk wrapped in moss; the cut end shows pale rings.
  rect(c,x+6,base-30,w-24,20,'#5e4a3a');rect(c,x+6,base-30,w-24,5,'#7d9a6a');rect(c,x+10,base-16,w-32,3,'#4a3a2e');
  c.fillStyle='#c9b28c';c.beginPath();c.ellipse(x+w-18,base-20,10,11,0,0,Math.PI*2);c.fill();
  c.strokeStyle='#9e8562';c.lineWidth=1;for(const r of [3,6,9]){c.beginPath();c.ellipse(x+w-18,base-20,r,r+1,0,0,Math.PI*2);c.stroke();}
  for(const dx of [14,34,62])rect(c,x+dx,base-34,8,4,'#94b07c');
 }else if(s.form==='buried-gate'){
  // Two half-buried gateposts; the grass between them is short where the old road ran.
  for(const gx of [x+4,x+w-24]){rect(c,gx,base-58,20,52,'#aeab95');rect(c,gx,base-58,20,4,'#dedbc5');rect(c,gx+16,base-54,4,48,'#85836f');rect(c,gx+4,base-40,12,2,'#8f8c78');}
  rect(c,x+24,base-14,w-48,8,'#c9c6ac');rect(c,x+24,base-14,w-48,1,'#e8e5cf');
  for(const gx of [x+2,x+w-6])for(let i=0;i<3;i++){c.strokeStyle='#8f9d6c';c.lineWidth=2;c.beginPath();c.moveTo(gx+i*3,base-4);c.quadraticCurveTo(gx+i*3+2,base-16,gx+i*3+7,base-22);c.stroke();}
 }else{
  // A worn bench facing the water; one end re-cut many times.
  rect(c,x+6,base-26,w-12,6,'#a58468');rect(c,x+6,base-26,w-12,2,'#d2b18e');rect(c,x+6,base-26,8,6,'#c9a27e');
  rect(c,x+10,base-20,4,14,'#6d5644');rect(c,x+w-14,base-20,4,14,'#6d5644');
  rect(c,x+6,base-40,w-12,4,'#8c6f58');
 }
 c.restore();
}
