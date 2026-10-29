// Original, finite pixel compositions: the feet match journey-wonders.js.
const box=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const line=(c,x,y,a,b,color,width=1)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();};
const ellipse=(c,x,y,rx,ry,color,width)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.stroke();};
function pier(c,x,y,h,p){box(c,x,y,32,h,p[3]);box(c,x,y,7,h,p[1]);for(let j=18;j<h;j+=28){line(c,x,y+j,x+31,y+j,p[0],2);box(c,x+11,y+j-14,9,5,p[0]);}}
function human(c,x,y,p){box(c,x+1,y-9,3,3,p[1]);box(c,x,y-6,5,6,p[3]);box(c,x,y,2,3,p[3]);box(c,x+4,y,1,3,p[3]);}
function letters(c,x,y,w,p){for(let i=0;i<7;i++){const xx=x+9+i*(w-20)/7;box(c,xx,y,19,13,p[1]);box(c,xx+3,y+3,12,1,p[3]);box(c,xx+3,y+6,7,1,p[0]);if(i%3===0)line(c,xx+3,y+10,xx+14,y+10,'#ae827b');}}
function wheel(c,x,y,r,p,angle=0){ellipse(c,x,y,r,r,p[3],9);ellipse(c,x,y,r-10,r-10,p[1],3);for(let i=0;i<12;i++){const a=i*Math.PI/6+angle,xx=Math.cos(a),yy=Math.sin(a);line(c,x,y,x+xx*r,y+yy*r,p[0],4);box(c,x+xx*(r-2)-6,y+yy*(r-2)-4,12,8,p[1]);}box(c,x-5,y-5,10,10,p[3]);}
export function drawJourneyWonder(c,s,p,time=0){
 const x=s.x*32,y=s.y*32,w=s.w*32,h=s.h*32,cx=x+w/2,base=y+h,form=s.form.slice(7);
 c.save();
 if(form==='letters'||form==='return')box(c,x+3,y+28,w-6,8,'#485f5b25');
 else{box(c,x,base-3,32,8,'#485f5b25');box(c,x+w-32,base-3,32,8,'#485f5b25');}
 if(form==='letters'||form==='return'){
  const rise=form==='return'?152:38;
  box(c,x,y-rise,w,rise+32,p[3]);box(c,x+5,y-rise+7,w-10,rise+17,p[0]);
  for(let row=0;row<(form==='return'?5:2);row++)letters(c,x,y-rise+15+row*29,w,p);
  box(c,x-5,y-rise-8,w+10,12,p[1]);
  // Small folded parcels and a boat drawing are on the shelf, never the floor.
  for(let i=0;i<3;i++){box(c,x+17+i*55,y+16,31,10,['#bf997b','#a1b69d','#b59caa'][i]);line(c,x+31+i*55,y+16,x+31+i*55,y+25,p[1]);}
  line(c,cx-12,y-6,cx+12,y-6,p[1],2);line(c,cx-12,y-6,cx-5,y+1,p[1],2);line(c,cx-5,y+1,cx+7,y+1,p[1],2);line(c,cx+7,y+1,cx+12,y-6,p[1],2);
 }else if(form==='wheel'){
  pier(c,x,y-108,h+108,p);pier(c,x+w-32,y-108,h+108,p);
  // Different depths in the same water circuit: lift, spill, foot bath.
  wheel(c,cx,y-30,58,p,Math.sin(time/24000)*.12);
  for(let i=0;i<3;i++){const yy=y-97+i*63;box(c,x+33,yy,w-66,13,p[3]);box(c,x+36,yy+3,w-72,5,p[2]);line(c,cx+22,yy+11,cx+22,yy+46,p[2],3);}
 }else if(form==='ribs'){
  pier(c,x,y-30,h+30,p);pier(c,x+w-32,y-30,h+30,p);
  for(let i=0;i<6;i++){const yy=y-70+i*27;ellipse(c,cx,yy,w*.38,28,p[3],6);line(c,cx,yy-27,cx,yy+21,p[1],3);}
  box(c,cx-5,y-135,10,123,p[3]);
  for(let i=0;i<5;i++)line(c,cx+9,y-127+i*5,cx+65,y-127+i*5,'#d3bca0',3);
 }else{
  const rise=form==='distribution'?475:form==='ring'?330:245;
  pier(c,x,y-rise,h+rise,p);pier(c,x+w-32,y-rise,h+rise,p);
  if(form==='ring'){
   ellipse(c,cx,y-175,w/2-20,147,p[3],20);ellipse(c,cx-3,y-180,w/2-20,147,p[1],5);
   for(let i=0;i<7;i++)line(c,x+3,base-13-i*14,x+26,base-13-i*14,p[1],2);
  }else{
   box(c,x,y-rise-20,w,36,p[3]);box(c,x+6,y-rise-17,w-12,8,p[1]);box(c,x+9,y-rise-5,w-18,6,p[2]);
   const count=form==='distribution'?4:5;
   for(let i=0;i<count;i++){
    const xx=x+42+i*(w-80)/(count-1);
    if(form==='distribution'){wheel(c,xx,y-rise+56,18,p);line(c,xx,y-rise+78,xx,y-rise+126,p[1],3);}
    else{box(c,xx,y-rise+20,12,25,p[0]);box(c,xx+3,y-rise+23,4,17,p[1]);}
   }
   // Water level marks recall the small garden. Lower space stays transparent.
   for(let j=0;j<7;j++)line(c,x+3,y+12+j*13,x+22,y+12+j*13,p[1],2);
   if(form==='distribution'){box(c,x+36,base-14,27,12,p[3]);box(c,x+39,base-12,21,4,p[2]);}
  }
 }
 c.restore();
}
export function drawWonderVista(canvas,kind){
 canvas.width=480;canvas.height=252;const c=canvas.getContext('2d');
 const p=kind==='wonder-aqueduct'?['#bca895','#e9d4b3','#95b4b6','#7a7f87']:kind==='wonder-ring'?['#b5c8d0','#eee4cf','#92adbf','#788b9d']:['#b4bdad','#e8ddbd','#9bada1','#758a81'];
 box(c,0,0,480,252,p[0]);
 for(let i=0;i<9;i++)box(c,0,18+i*18,480,18,i%2?p[0]:p[1]+'24');
 for(let i=0;i<5;i++){const yy=133+i*17;box(c,0,yy,480,16,[p[2],p[0],p[3],p[0],p[3]][i]);for(let j=0;j<7;j++)box(c,(j*91+i*23)%480,yy-4-j%3*3,40+j*5,7,p[0]);}
 if(kind==='wonder-ring'){
  // The ellipse continues beyond the frame; clouds obscure its far support.
  ellipse(c,262,52,198,166,p[3],26);ellipse(c,255,48,198,166,p[1],4);
  pier(c,82,85,167,p);pier(c,415,85,167,p);
  for(let i=0;i<7;i++)box(c,0,116+i*8,480,3,p[1]+'50');
 }else{
  // Recurrence, occlusion and one human-sized repair platform carry the scale.
  for(let layer=0;layer<3;layer++){
   const yy=61+layer*43,spacing=85-layer*17;
   box(c,-20,yy,520,14,p[3]);box(c,-20,yy+1,520,3,p[1]);box(c,-20,yy+5,520,3,p[2]);
   for(let xx=-35+layer*19;xx<500;xx+=spacing){box(c,xx,yy+14,13,154-layer*36,p[3]);box(c,xx+2,yy+14,3,154-layer*36,p[1]);if(kind==='wonder-distribution')wheel(c,xx+spacing/2,yy+22,9,p);}
  }
  // A ridge interrupts the lower works, so the eye supplies their continuation.
  c.fillStyle=p[0];c.beginPath();c.moveTo(280,252);c.lineTo(337,163);c.lineTo(384,140);c.lineTo(480,162);c.lineTo(480,252);c.fill();
 }
 box(c,0,232,480,20,p[3]);box(c,39,222,79,6,p[1]);box(c,42,228,3,16,p[0]);box(c,111,228,3,16,p[0]);human(c,68,220,p);human(c,85,220,p);
 // Foreground water gauge, rope and three familiar bowls.
 for(let i=0;i<7;i++)box(c,20,204+i*4,7,1,p[1]);box(c,19,200,2,37,p[1]);
 for(let i=0;i<3;i++){box(c,130+i*14,230,11,7,p[0]);box(c,132+i*14,230,7,2,p[2]);}
}
