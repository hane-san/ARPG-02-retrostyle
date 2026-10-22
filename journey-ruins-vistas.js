// Four original 480x252 landscapes; the castle remains a distant vista, not a portal.
export const RUINS_VISTA_KINDS=new Set(['ruins-ancient','ruins-void','ruins-drowned','ruins-castle']);
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const poly=(c,pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
function sky(c,kind){
 const strips=kind==='ruins-castle'?['#758ea6','#a4b8c7','#d5dbd7','#f1e8d0']:
 kind==='ruins-void'?['#455267','#6d7382','#9fa0a1','#c1b9ac']:
 kind==='ruins-drowned'?['#678e9f','#a2bdbe','#d5d6c6','#eee1c5']:
 ['#8696a4','#b9b8b4','#dfd4bb','#f3e0bc'];
 for(let y=0;y<252;y+=5)rect(c,0,y,480,5,strips[Math.min(3,Math.floor(y/63))]);
}
function cloud(c,x,y,w,color='#e7e9e1'){
 rect(c,x,y,w,7,color);rect(c,x+15,y-8,w*.58,8,color);
 rect(c,x+38,y-14,w*.25,7,color);rect(c,x+7,y+7,w*.75,4,'#a0bac43b');
}
function castle(c,x,y,scale=1,shade='#5e7e91'){
 c.save();c.translate(x,y);c.scale(scale,scale);
 // A bridge-shaped bottom suspended above clouds.
 poly(c,[[0,78],[18,58],[142,58],[159,77],[137,92],[89,111],[53,92]],shade);
 rect(c,26,28,112,37,shade);
 for(const [xx,hh,ww] of [[24,65,19],[57,93,14],[85,76,23],[121,110,15]]){
  rect(c,xx,65-hh,ww,hh,shade);
  poly(c,[[xx-5,65-hh],[xx+ww/2,52-hh],[xx+ww+5,65-hh]],'#c7d0cf');
  rect(c,xx+ww/2-2,66-hh,4,11,'#dfe4df');
 }
 for(let i=0;i<6;i++)rect(c,31+i*17,41,7,3,'#c6dadd');
 c.restore();
}
function traveller(c,x=410,y=217){rect(c,x,y,5,6,'#e6cfb3');rect(c,x-1,y+6,7,12,'#586e77');rect(c,x,y+18,2,7,'#404f5b');rect(c,x+5,y+18,2,7,'#404f5b');}
export function drawRuinsVista(canvas,kind,time=0){
 if(canvas.width!==480)canvas.width=480;if(canvas.height!==252)canvas.height=252;
 const c=canvas.getContext('2d');c.save();c.imageSmoothingEnabled=false;
 sky(c,kind);
 if(kind==='ruins-castle'){
  // Sky occupies most of the frame: the tiny traveller earned this scale shift.
  cloud(c,20,104,132,'#ecede8');cloud(c,305,108,145,'#dce4e2');
  castle(c,105,60,.48,'#90acb9');
  castle(c,222,49,.95,'#607f93');
  castle(c,360,79,.48,'#7896a7');
  poly(c,[[0,193],[52,180],[99,196],[133,180],[168,192],[193,170],[250,185],[307,168],[375,195],[480,177],[480,252],[0,252]],'#a6b3ad');
  poly(c,[[0,223],[93,212],[164,234],[254,207],[335,224],[399,204],[480,214],[480,252],[0,252]],'#707f82');
  // Broken lookout parapet and winding approach steps.
  for(let i=0;i<7;i++){rect(c,12+i*43,205-(i%3)*5,28,7,'#e0dac3');rect(c,17+i*43,212-(i%3)*5,3,13,'#7a8e8c');}
  for(let i=0;i<4;i++)rect(c,340+i*18,231-i*4,58,5,'#b9bbae');
  traveller(c,412,211);
  const drift=Math.sin(time/9000)*2;
  rect(c,253+drift,66,61,2,'#c6dfe3');
 }else if(kind==='ruins-void'){
  poly(c,[[0,167],[80,150],[140,161],[216,145],[296,157],[368,140],[480,153],[480,252],[0,252]],'#747b84');
  for(const [x,w,h] of [[22,29,167],[109,25,193],[182,45,218],[284,32,200],[361,24,178],[434,33,220]]){
   rect(c,x,241-h,w,h,'#353949');rect(c,x+3,244-h,4,h-7,'#687183');
   rect(c,x+w-5,241-h,2,h,'#282e40');
   rect(c,x+w/2,222-h*.4,2,26,'#8278a2');
  }
  poly(c,[[155,252],[214,207],[247,199],[262,203],[316,252]],'#a5a3a3');
  traveller(c,234,202);
 }else if(kind==='ruins-drowned'){
  poly(c,[[0,158],[70,143],[133,159],[200,140],[283,152],[350,132],[480,161],[480,252],[0,252]],'#94a7a7');
  rect(c,0,191,480,61,'#729ba5');
  for(const [x,h] of [[25,87],[90,112],[166,66],[260,99],[337,128],[418,73]]){
   rect(c,x,202-h,10,h,'#a8b5b1');rect(c,x+16,207-h,9,h-5,'#b5bbae');
   rect(c,x-5,201-h,36,7,'#d0d0bd');rect(c,x+6,206-h,3,h-20,'#829b9c');
  }
  c.strokeStyle='#cfdfd7';c.lineWidth=6;c.beginPath();c.ellipse(243,218,77,21,0,0,Math.PI*2);c.stroke();
  for(let i=0;i<12;i++)rect(c,9+i*40,217+(i%4)*7,23,1,'#cae1dc');
  traveller(c,384,210);
 }else{
  poly(c,[[0,147],[63,126],[125,142],[198,129],[284,149],[376,118],[480,139],[480,252],[0,252]],'#b8ad9b');
  for(let i=0;i<10;i++){
   const x=9+i*51,h=57+(i%4)*23;rect(c,x,220-h,13,h,'#a99f8f');
   rect(c,x-6,214-h,26,9,'#d9c8a7');
   if(i%3===0)rect(c,x+16,181,35,4,'#b7ab9a');
  }
  poly(c,[[0,247],[59,216],[125,227],[167,207],[214,230],[280,209],[356,234],[480,212],[480,252]],'#948d7e');
  for(let i=0;i<9;i++)rect(c,105+i*21,221-i%3*7,22,4,'#e4d2ad');
  traveller(c,417,211);
 }
 c.restore();
}
