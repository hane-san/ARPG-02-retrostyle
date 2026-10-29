// Original code-drawn timber, textiles and fruit trees. No external assets.
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const poly=(c,pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const line=(c,x,y,a,b,color,w=1)=>{c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();};
const wood='#95745b',edge='#665b49',honey='#e3c48d',cream='#f1e2b7',teal='#699f96',red='#be8975';
function cloth(c,x,y,w,h,color){
 rect(c,x,y,w,h,color);
 for(let i=4;i<w;i+=12){poly(c,[[x+i,y+5],[x+i+4,y+9],[x+i,y+13],[x+i-4,y+9]],cream);rect(c,x+i-1,y+h-3,2,7,cream);}
 line(c,x,y+2,x+w,y+2,cream,2);
}
export function drawForestTree(c,d,layer='all'){
 const x=d.x*32,y=d.y*32;
 if(layer!=='canopy'){
 poly(c,[[x-17,y+24],[x+25,y+16],[x+49,y+29],[x+8,y+37]],'#5b816b35');
 rect(c,x+9,y-54,14,83,wood);rect(c,x+9,y-53,4,78,honey);
 line(c,x+14,y-24,x-11,y-54,wood,8);line(c,x+17,y-33,x+42,y-65,wood,7);
 }
 if(layer!=='trunk'){
 for(const [dx,dy,w,h,color] of [[-38,-96,78,49,'#658b71'],[-17,-116,77,54,'#739e7b'],[15,-93,60,52,'#7fa983'],[-35,-85,54,35,'#83af86'],[-12,-112,43,28,'#a3c393']]){
  poly(c,[[x+dx,y+dy+12],[x+dx+w*.25,y+dy],[x+dx+w*.76,y+dy+3],[x+dx+w,y+dy+h*.43],[x+dx+w*.87,y+dy+h],[x+dx+7,y+dy+h-2]],color);
 }
 for(let i=0;i<7;i++){
  const xx=x-24+(i*19)%75,yy=y-92+(i*13)%34;
  rect(c,xx,yy,7,4,i%3===0?'#d7ab72':'#b6d09b');
 }
 }
 // The foot is legible at exactly the solid ground tile.
 if(layer!=='canopy')poly(c,[[x+9,y+20],[x+23,y+20],[x+29,y+31],[x+4,y+31]],wood);
}
export function drawForestSite(c,s){
 const x=s.x*32,y=s.y*32,w=s.w*32,h=s.h*32,base=y+h;
 if(s.form==='forest-wheel'){
  rect(c,x+32,base-64,w-64,64,wood);rect(c,x+35,base-62,5,59,honey);
  c.strokeStyle=honey;c.lineWidth=7;c.beginPath();c.ellipse(x+w/2,base-68,w*.31,18,0,0,Math.PI*2);c.stroke();
  for(let i=0;i<6;i++){const a=i*Math.PI/3;line(c,x+w/2,base-68,x+w/2+Math.cos(a)*w*.28,base-68+Math.sin(a)*16,cream,3);}
  for(let i=0;i<3;i++){rect(c,x+48+i*42,base-30,30,18,teal);rect(c,x+50+i*42,base-28,26,3,cream);}
  line(c,x-12,y+15,x+w+12,y+15,edge,2);for(let i=0;i<7;i++)poly(c,[[x+i*32,y+15],[x+20+i*32,y+15],[x+10+i*32,y+31]],[red,teal,honey][i%3]);
  return;
 }
 const textile=s.form==='forest-cloth'?red:s.form==='forest-carver'?honey:teal;
 // Solid northern wall and two side posts, matching the world's rectangles.
 rect(c,x,y,w,64,wood);rect(c,x+5,y+5,w-10,51,'#c5aa7b');
 for(let xx=x+12;xx<x+w;xx+=23){rect(c,xx,y+8,3,47,wood);rect(c,xx+6,y+19,11,15,teal);}
 poly(c,[[x-13,y+4],[x+w*.5,y-38],[x+w+13,y+4],[x+w+5,y+19],[x-6,y+19]],'#7a8865');
 for(let xx=x+3;xx<x+w;xx+=20)line(c,xx,y+8,xx+12,y-12,'#bbbc89',2);
 // The veranda is open ground; no opaque rectangle covers its walkway.
 rect(c,x,base-7,w,7,'#a38d68');
 for(const xx of [x,x+w-32]){
  rect(c,xx,y+56,32,h-56,wood);rect(c,xx+5,y+58,5,h-63,honey);
  for(let yy=y+72;yy<base-10;yy+=22)poly(c,[[xx+19,yy],[xx+25,yy+6],[xx+19,yy+12],[xx+13,yy+6]],cream);
 }
 cloth(c,x+24,y+56,w-48,28,textile);
 if(s.form==='forest-tea'){
  for(const side of [0,1]){
   const xx=x+36+side*(w-98);rect(c,xx,base-35,26,19,'#bfa47e');
   rect(c,xx-2,base-38,30,5,honey);rect(c,xx+5,base-43,8,5,teal);rect(c,xx+17,base-43,7,5,cream);
   rect(c,xx-2,base-10,30,6,red);
  }
  rect(c,x+w-53,base-48,14,10,edge);rect(c,x+w-51,base-51,10,4,honey);
 }else if(s.form==='forest-cloth'){
  for(let i=0;i<4;i++)cloth(c,x+38+i*(w-95)/4,y+87,24,Math.min(43,h-94),[teal,honey,red,'#8ea3b4'][i]);
 }else{
  rect(c,x+38,base-40,w-76,6,wood);
  for(let i=0;i<5;i++){
   const xx=x+45+i*(w-101)/5;
   rect(c,xx,base-58,9,17,i%2?cream:honey);rect(c,xx+7,base-56,5,4,wood);
  }
 }
 // Bunting ties the separate houses into one lived-in market.
 line(c,x-15,y+38,x+w+15,y+43,edge,2);
 for(let i=0;i<8;i++)poly(c,[[x-9+i*(w+15)/8,y+39],[x+1+i*(w+15)/8,y+40],[x-3+i*(w+15)/8,y+51]],[teal,red,honey][i%3]);
}

// Keep the existing solid prop feet, but give working market objects their own
// material and use instead of dressing the inhabited clearing in ruin markers.
export function drawForestProp(c,d){
 const x=d.x*32,y=d.y*32,v=d.variant;
 if(v===2||v===7){
  rect(c,x+11,y-28,10,58,wood);rect(c,x+12,y-27,3,55,honey);
  rect(c,x+5,y-30,24,5,teal);rect(c,x+7,y-24,20,18,honey);
  for(let i=0;i<3;i++)rect(c,x+10+i*5,y-23,2,16,cream);
  rect(c,x+9,y-6,16,3,wood);line(c,x+16,y-3,x+16,y+4,red,2);
 }else if(v===4){
  for(let i=0;i<3;i++)rect(c,x+2+i*12,y+3,4,28,wood);
  line(c,x,y+13,x+31,y+9,honey,4);line(c,x,y+23,x+31,y+19,wood,3);
 }else if(v===9){
  rect(c,x+3,y+13,26,17,wood);rect(c,x+2,y+10,28,6,honey);
  for(let i=0;i<3;i++){rect(c,x+5+i*8,y+3,7,8,'#d9aa6f');rect(c,x+7+i*8,y+4,2,3,cream);}
  cloth(c,x+4,y+19,24,9,red);
 }else if(v===6||v===10){
  for(let i=0;i<3;i++)rect(c,x+4,y+10+i*5,25-i*3,4,[teal,red,honey][i]);
  rect(c,x+9,y+7,15,2,cream);
 }else if(v===8){
  rect(c,x+4,y+14,25,15,wood);line(c,x+3,y+14,x+29,y+14,honey,3);
  for(let i=0;i<4;i++)rect(c,x+6+i*5,y+10+(i%2)*3,5,6,i%2?red:honey);
 }else return false;
 return true;
}


export function drawForestCanopies(c,world,bounds,hero){
 const people=[{x:hero.px,y:hero.py},...world.npcs];
 for(const d of world.decor){
  if(d.variant!==12||d.x<bounds.left-3||d.x>bounds.right+3||d.y<bounds.top-1||d.y>bounds.bottom+5)continue;
  const covered=people.some(p=>p.x>=d.x-1.5&&p.x<=d.x+2.5&&p.y>=d.y-3.8&&p.y<=d.y-1);
  c.save();c.globalAlpha=covered?.22:1;drawForestTree(c,d,'canopy');c.restore();
 }
}
