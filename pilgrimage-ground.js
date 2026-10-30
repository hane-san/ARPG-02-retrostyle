// Visual/material identity only. Never changes walkability or pathfinding.
export function pilgrimMaterial(world,x,y){
 const tile=world.tileAt(x,y),theme=world.zoneAt(x,y).theme;
 if(tile==='+'||world.siteAt?.(x,y)?.form?.startsWith('forest-'))return 'wood';
 if(['garden','ridge','monolith','threshold','sealed','capital','citadel'].includes(theme))return 'stone';
 if(['dry','salt','canyon'].includes(theme))return 'sand';
 if(['forest','harbour'].includes(theme)&&tile!=='=')return 'grass';
 return 'earth';
}
export const pilgrimStepTile=(world,x,y)=>({wood:'+',stone:'h',sand:'S',grass:'g',earth:'='}[pilgrimMaterial(world,x,y)]);
export function createPilgrimTrails(){
 const marks=[];let distance=0,side=1;
 return {
  step(world,hero,travel,time){
   if(!(travel>0&&travel<1))return;
   distance+=travel;if(distance<2)return;distance%=2;
   const material=pilgrimMaterial(world,Math.round(hero.px),Math.round(hero.py));
   if(['stone','wood'].includes(material))return;
   side=-side;marks.push({x:hero.px,y:hero.py,side,face:hero.face,material,born:time,life:material==='sand'?2600:material==='grass'?900:1700});
   if(marks.length>48)marks.shift();
  },
  visible(time){while(marks.length&&time-marks[0].born>3000)marks.shift();return marks.filter(m=>time>=m.born&&time-m.born<m.life);}
 };
}
export function drawPilgrimTrails(c,marks,time){
 c.save();
 for(const m of marks){const a=Math.max(0,1-(time-m.born)/m.life),horizontal=['left','right'].includes(m.face);c.globalAlpha=a*.25;c.fillStyle=m.material==='grass'?'#56755d':'#88765e';
  c.fillRect(Math.round((m.x+.5)*32+(horizontal?0:m.side*3)),Math.round((m.y+.8)*32+(horizontal?m.side*2:0)),horizontal?4:2,horizontal?2:4);
 }c.restore();
}
export function drawRegionalGrain(c,x,y,theme,p,q){
 const px=x*32,py=y*32;c.save();c.strokeStyle=p[3]+'66';c.fillStyle=p[1]+'99';c.lineWidth=1;
 if(theme==='forest'&&q>.55){for(let i=0;i<3;i++){c.fillStyle=['#b8a17a88','#d6bb8b88','#74956b88'][i];c.fillRect(px+5+i*8,py+10+(i%2)*9,4,2);}}
 else if(theme==='canyon'){for(let i=0;i<3;i++){c.beginPath();c.moveTo(px,py+8+i*7);c.lineTo(px+32,py+5+i*7);c.stroke();}}
 else if(theme==='ridge'&&q>.55){c.fillRect(px+5,py+8,17,1);c.fillRect(px+12,py+4,1,9);c.fillRect(px+9,py+5,7,1);}
 else if(theme==='salt'&&q>.45){c.beginPath();c.ellipse(px+16,py+17,11,5,0,0,Math.PI*2);c.stroke();}
 else if(theme==='dry'&&q>.55){c.beginPath();c.moveTo(px+3,py+27);c.lineTo(px+15,py+13);c.lineTo(px+26,py+17);c.moveTo(px+15,py+13);c.lineTo(px+13,py+3);c.stroke();}
 else if(['capital','citadel','sealed'].includes(theme)){c.strokeRect(px+2,py+3,28,24);if(q>.7){c.fillRect(px+8,py+9,9,1);c.fillRect(px+8,py+9,1,7);}}
 else if(theme==='garden'&&q>.6){c.fillRect(px+4,py+4,4,4);c.fillRect(px+22,py+23,4,4);}
 c.restore();
}
