// Six deliberate vista compositions, distinct from the existing water-level relics.
export const EXPANSION_VISTA_KINDS=new Set(['scarlet','cloud','flood','glass-city','reeds','white']);
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const polygon=(c,pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const shade=(n)=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0');
export function drawExpansionVista(canvas,kind,time=0){
 const W=480,H=252;if(canvas.width!==W)canvas.width=W;if(canvas.height!==H)canvas.height=H;
 const c=canvas.getContext('2d');c.save();c.imageSmoothingEnabled=false;
 const skies={
  scarlet:['#8d9fad','#d1b6a9','#f4dbb7'],cloud:['#7b9dac','#bed0d0','#e9e7d8'],
  flood:['#789ca9','#c5d7c7','#eee0b9'],'glass-city':['#8193b4','#b9c4d2','#e6dbd2'],
  reeds:['#89a9a9','#c8d1b6','#e8d8b0'],white:['#8ea8b9','#d2d2c8','#f1dfbb']
 };
 const [dark,middle,bright]=skies[kind]||skies.white;
 for(let y=0;y<170;y+=4){
  const t=y/170;const col=t<.5?dark:t<.82?middle:bright;
  rect(c,0,y,W,4,col);
  if(y%24===0)rect(c,0,y+3,W,1,t<.5?'#d4d8d30d':'#ffefcf24');
 }
 // Mid-distance shapes have broad readable silhouettes, not busy repeated tiles.
 if(kind==='scarlet'){
  polygon(c,[[0,154],[47,122],[79,131],[124,73],[161,91],[198,67],[231,110],[266,107],[318,72],[373,109],[413,87],[480,120],[480,252],[0,252]],'#b48379');
  polygon(c,[[0,178],[78,163],[126,115],[167,122],[218,148],[246,132],[286,136],[346,118],[398,148],[480,138],[480,252],[0,252]],'#996f6b');
  polygon(c,[[190,252],[216,203],[239,183],[259,173],[272,165],[288,168],[270,185],[264,199],[251,220],[254,252]],'#e3bb9b');
  for(let i=0;i<5;i++){rect(c,35+i*93,152+i%2*14,42,3,'#d5aa91');rect(c,42+i*93,157+i%2*14,3,18,'#c29481');}
  rect(c,371,130,12,54,'#738992');rect(c,361,124,32,8,'#d8c1a8');
 }else if(kind==='cloud'){
  polygon(c,[[0,159],[64,128],[121,113],[166,84],[201,105],[245,61],[274,88],[327,93],[384,57],[421,96],[480,118],[480,252],[0,252]],'#839ea4');
  polygon(c,[[0,188],[84,168],[155,150],[209,175],[263,144],[306,151],[367,133],[426,165],[480,157],[480,252],[0,252]],'#6d8c99');
  polygon(c,[[0,170],[131,169],[185,164],[268,170],[334,168],[480,177],[480,191],[0,192]],'#dae0d3aa');
  for(let i=0;i<6;i++){let xx=87+i*54, yy=167-i%3*15;rect(c,xx,yy,31,5,'#d4d3bd');rect(c,xx+6,yy-11,6,12,'#b0b8b5');}
  rect(c,270,92,12,80,'#526d7c');polygon(c,[[262,95],[277,75],[290,95]],'#d2d5c8');
 }else if(kind==='flood'){
  polygon(c,[[0,173],[47,153],[99,155],[137,149],[197,162],[278,150],[329,169],[390,158],[480,164],[480,252],[0,252]],'#8eac9d');
  rect(c,0,189,W,63,'#7eacb2');polygon(c,[[0,224],[90,208],[156,212],[220,197],[304,207],[382,194],[480,203],[480,252],[0,252]],'#add1c0');
  for(let i=0;i<9;i++){const x=17+i*56,y=182+i%3*6;rect(c,x,y,4,35,'#688f84');rect(c,x-10,y-13,24,22,'#8fac90');rect(c,x-4,y-22,13,18,'#bad0aa');}
  // Fishing stilts and the river crossing, not a city skyline.
  polygon(c,[[210,186],[293,185],[299,202],[203,203]],'#c6b5a1');
  for(let i=0;i<6;i++)rect(c,216+i*14,196,4,45,'#766f6c');
  rect(c,237,153,34,32,'#b0baad');polygon(c,[[233,153],[254,137],[274,153]],'#a18d88');
 }else if(kind==='glass-city'){
  polygon(c,[[0,182],[75,170],[144,185],[206,165],[294,168],[358,177],[480,166],[480,252],[0,252]],'#acc3b8');
  for(let i=0;i<7;i++){
   const x=23+i*67,h=65+(i%4)*17;rect(c,x,181-h,42,h,'#91b1bf');
   rect(c,x+5,184-h,26,3,'#e2e6d9');rect(c,x+13,191-h,4,h-23,'#d2dfd8');
   polygon(c,[[x+3,181-h],[x+22,159-h],[x+44,181-h]],'#c5d6d4');
  }
  polygon(c,[[0,212],[91,200],[200,214],[320,197],[480,207],[480,252],[0,252]],'#8eafa7');
  for(let i=0;i<13;i++){const x=i*38+5;rect(c,x,216+i%3*5,3,29,'#668b7e');rect(c,x-5,207+i%3*5,17,18,i%2?'#a7c5a1':'#b9d3b4');}
  rect(c,318,194,4,35,'#ccbbac');rect(c,321,198,19,3,'#f0e1c1');
 }else if(kind==='reeds'){
  polygon(c,[[0,178],[75,170],[147,179],[237,158],[317,166],[393,173],[480,161],[480,252],[0,252]],'#a0b9a7');
  rect(c,0,200,W,52,'#7faeb1');
  polygon(c,[[0,220],[43,207],[115,212],[187,199],[277,209],[351,195],[480,200],[480,252],[0,252]],'#abcbaa');
  for(let i=0;i<19;i++){const x=i*28+6,h=15+i%5*7;rect(c,x,213-h,3,h+17,'#698f7f');rect(c,x-2,207-h,7,7,'#d3c39c');}
  for(let i=0;i<3;i++){const x=66+i*127,y=178+i%2*10;
   rect(c,x,y,72,29,'#c6c8b4');polygon(c,[[x-7,y],[x+32,y-27],[x+79,y]],'#8aa79f');
   for(let j=0;j<5;j++)rect(c,x+11+j*12,y+22,4,38,'#728d83');
  }
 }else{
  polygon(c,[[0,180],[80,167],[139,174],[219,158],[304,166],[391,160],[480,174],[480,252],[0,252]],'#d8d4c7');
  for(let i=0;i<11;i++){const x=i*49,y=189+(i%3)*6;rect(c,x,y,34,2,'#f1ebe0');rect(c,x+8,y+4,25,1,'#bcbeb9');}
  for(let i=0;i<8;i++){const x=54+i*51,h=65+i%3*14;rect(c,x,179-h,12,h,'#8ba1a8');rect(c,x,179-h,5,h,'#c7ccbe');}
  polygon(c,[[0,252],[116,229],[204,221],[279,227],[319,252]],'#e8d9bb');
  rect(c,370,213,49,24,'#c3b4a4');polygon(c,[[363,214],[391,196],[426,214]],'#998d85');
 }
 // tiny traveller to establish the monument's human scale
 rect(c,429,212,4,6,'#f1d8bb');rect(c,427,218,9,15,'#536f78');
 rect(c,428,232,3,8,'#495a61');rect(c,433,232,3,8,'#495a61');
 c.restore();
}
