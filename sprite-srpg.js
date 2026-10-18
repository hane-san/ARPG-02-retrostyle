// Adapted from hane-san/SRPG render.js drawUnit; UI badges and tactical HP markers removed.
// Original unit pixel-art logic is reused, not imitated.
export function drawSrpgUnit(c,u){const x=u.x*32,y=u.y*32,blue=u.team==='ally',spent=blue&&u.acted;
 const ink=spent?'#46504e':'#21323d',col=spent?'#7c8581':blue?'#376ec0':'#bb4352',light=spent?'#b4b8a6':blue?'#9ed6f1':'#ffb09b',skin=spent?'#b6b9a2':'#efd6a4';
 const rect=(dx,dy,w,h,color)=>{c.fillStyle=color;c.fillRect(x+dx,y+dy,w,h);};
 rect(7,26,21,3,'#19363866');
 // Equipment and body shape both encode class; palette only encodes allegiance.
 const metal=spent?'#c0c2b1':'#e0e8d8',wood=spent?'#99988a':'#a57648';
 if(u.type==='shooter'){
  rect(5,20,23,6,ink);rect(7,21,19,3,wood);rect(7,25,5,5,ink);rect(22,25,5,5,ink);rect(8,26,3,3,metal);rect(23,26,3,3,metal);
  rect(13,9,9,12,col);rect(14,4,8,8,ink);rect(15,6,6,5,skin);rect(14,3,9,4,metal);
  rect(3,14,25,3,wood);rect(16,8,3,18,metal);rect(3,11,3,10,ink);rect(26,11,3,10,ink);rect(5,12,2,7,metal);rect(24,12,2,7,metal);
 }else if(u.type==='horse'){
  rect(3,18,24,9,ink);rect(5,19,20,6,wood);rect(23,11,6,12,ink);rect(24,12,5,8,'#d4b17e');rect(26,10,2,4,ink);
  for(const dx of [6,12,22,26])rect(dx,25,2,4,ink);
  rect(11,4,8,7,ink);rect(12,6,6,5,skin);rect(11,3,8,3,metal);rect(10,11,11,9,col);rect(12,12,3,6,light);rect(20,2,2,19,metal);rect(21,2,6,3,col);
 }else if(u.type==='mage'){
  rect(9,12,15,15,ink);rect(11,13,11,13,col);rect(15,13,3,13,spent?'#b4b8a6':'#c2a2d5');
  c.fillStyle=ink;c.beginPath();c.moveTo(x+7,y+10);c.lineTo(x+16,y+1);c.lineTo(x+25,y+10);c.fill();rect(11,8,10,6,skin);rect(8,9,17,3,col);
  rect(21,16,9,10,ink);rect(22,17,7,8,spent?'#b4b8a6':'#d6a4ee');rect(25,17,1,8,'#fff0bb');
 }else if(u.type==='healer'){
  rect(11,3,10,11,ink);rect(12,4,8,9,metal);rect(14,7,5,6,skin);rect(10,14,13,13,metal);rect(14,14,5,11,col);
  rect(25,7,2,20,wood);rect(23,3,6,7,'#f4e6aa');rect(25,1,2,11,'#fff5ce');
 }else if(u.type==='medic'){
  rect(11,4,10,10,ink);rect(12,5,8,8,skin);rect(10,4,12,3,metal);rect(10,14,14,11,col);rect(11,15,3,10,light);
  rect(7,21,19,6,metal);rect(21,15,9,11,ink);rect(22,16,7,9,metal);rect(25,17,2,7,col);rect(23,19,6,2,col);
 }else{
  rect(11,4,10,10,ink);rect(12,6,8,7,skin);rect(11,3,10,4,col);rect(13,3,5,2,light);
  rect(10,13,13,11,ink);rect(12,13,9,10,col);rect(12,14,3,8,light);rect(11,24,4,4,ink);rect(19,24,4,4,ink);
  if(u.type==='shield'){
   rect(10,3,13,4,metal);rect(5,13,12,14,ink);rect(6,14,10,11,metal);rect(9,15,4,10,col);rect(25,5,2,22,wood);rect(24,2,4,6,metal);
  }else if(u.type==='bow'){
   rect(8,11,5,15,wood);rect(8,8,2,7,metal);
   c.strokeStyle=ink;c.lineWidth=5;c.beginPath();c.moveTo(x+24,y+6);c.quadraticCurveTo(x+35,y+16,x+24,y+27);c.stroke();c.strokeStyle='#f0d19a';c.lineWidth=2;c.stroke();
   c.strokeStyle='#f7edc8';c.lineWidth=1;c.beginPath();c.moveTo(x+24,y+6);c.lineTo(x+24,y+27);c.stroke();rect(20,16,9,2,skin);
  }else{rect(25,3,3,18,ink);rect(25,4,2,16,metal);rect(22,20,8,2,'#edc577');rect(25,22,2,5,wood);rect(10,3,4,7,metal);}
 }
}
