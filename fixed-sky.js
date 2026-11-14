// Original sky compositions for the hundred-screen atlas. A tone is chosen
// when a board is authored; walking never cycles its light or its zoom.
export const FIXED_SKIES={
 blue:{colors:['#5b97c5','#93c5da','#c9dce2','#eee4d1','#f5d9b5'],cloud:'#fff1da',shade:'#afbdce'},
 mint:{colors:['#459daf','#93cbd1','#cce7df','#edf1d2','#f5e4b5'],cloud:'#fff7dc',shade:'#9dbdb9'},
 amber:{colors:['#333b76','#866a91','#d59495','#f4bd87','#ffe3a6'],cloud:'#ffe3ae',shade:'#a2768a',sun:'#fff0b6',light:'#d59676',strength:.09},
 coral:{colors:['#4c5585','#9b84a6','#e3a0b0','#ffc4a1','#fff0c0'],cloud:'#ffe8c0',shade:'#a483a3',sun:'#fff4c9',light:'#d68b91',strength:.08},
 rose:{colors:['#6d7da3','#aaa9c4','#e0beca','#f3d0bb','#fae7c8'],cloud:'#fce5d1',shade:'#af9bb6',sun:'#fff0d4',light:'#bd91a3',strength:.055},
 violet:{colors:['#343f77','#756e9e','#afa5c2','#dcc2c8','#efdbc4'],cloud:'#ddd0df',shade:'#8c8bab',stars:true,light:'#737ca0',strength:.12},
 indigo:{colors:['#172b52','#344c70','#68829d','#a9bcc6','#d4d9cc'],cloud:'#aebecf',shade:'#617e9e',stars:true,moon:true,light:'#324c71',strength:.23},
 mist:{colors:['#8da9b1','#b7cbd0','#d9e4de','#e6e8d9','#f1e8ce'],cloud:'#edf0e4',shade:'#bbcecc',fog:true,light:'#c8d7d2',strength:.08},
 haze:{colors:['#a09fae','#c0bac0','#d9cbb8','#e8dabd','#f5e7c8'],cloud:'#efe4cd',shade:'#c5b7af',fog:true,light:'#c9b69a',strength:.08},
 glacier:{colors:['#315c8e','#6ba6c6','#b1d7df','#d6e5dc','#e9ece0'],cloud:'#f2f3df',shade:'#96b7cc',snow:true,light:'#a0bdd0',strength:.07},
 copper:{colors:['#443b65','#8e687d','#ca8e82','#e9b288','#f3d2a2'],cloud:'#f2c39c',shade:'#9b778b',sun:'#ffe9b8',light:'#ba7f69',strength:.10}
};
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
const P=(c,points,col)=>{c.fillStyle=col;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
function cloud(c,x,y,w,h){
 c.beginPath();c.moveTo(x,y+h*.6);c.bezierCurveTo(x+w*.04,y+h*.1,x+w*.19,y+h*.15,x+w*.25,y+h*.28);c.bezierCurveTo(x+w*.28,y-h*.4,x+w*.52,y-h*.45,x+w*.61,y+h*.15);c.bezierCurveTo(x+w*.71,y-h*.08,x+w*.87,y+h*.04,x+w*.9,y+h*.36);c.bezierCurveTo(x+w*1.05,y+h*.38,x+w,y+h*.8,x+w*.83,y+h*.84);c.lineTo(x+w*.14,y+h);c.closePath();
}
export function drawFixedSky(c,room,w,h,l,time){
 const p=FIXED_SKIES[room.sky];if(!p)return false;const col=room.skyAnchor?.x??room.col,row=room.skyAnchor?.y??room.row,s=l.scale,horizon=l.y+32*s*2.6,vis=skyFloor(l),gradient=c.createLinearGradient(0,0,0,vis+14*s);
 p.colors.forEach((col,i)=>gradient.addColorStop([0,.27,.58,.82,1][i],col));R(c,0,0,w,h,gradient);
 if(p.stars)for(let i=0;i<44;i++){const x=((i*131+Math.floor(col)*37)%997)/997*w,y=((i*67+Math.floor(row)*29)%277)/277*horizon*.69;R(c,x,y,i%9===0?2:1,i%9===0?2:1,p.moon?'#e5e6db99':'#f5e7d75c');}
 const sunX=w*(room.skyline?.28+col*.045:p.moon?.77:col%2>.5?.29:.68),sunY=p.sun&&!p.moon?vis*.84:horizon*(p.moon?.29:.34),radius=(p.moon?11:p.sun?19:10)*s;
 const glow=c.createRadialGradient(sunX,sunY,radius,sunX,sunY,Math.max(60,w*.37));glow.addColorStop(0,(p.sun||'#f6efd5')+(p.moon?'19':'66'));glow.addColorStop(1,p.colors[3]+'00');R(c,sunX-w*.4,sunY-w*.4,w*.8,w*.8,glow);
 if(!p.fog){c.fillStyle=p.sun||'#f2efdc';c.beginPath();c.arc(sunX,sunY,radius,0,Math.PI*2);c.fill();}
 for(let layer=0;layer<3;layer++)for(let i=0;i<4;i++){
  const seed=(i*17+layer*13+Math.floor(row)*5)%19/19,ww=w*(.22+seed*.15),x=((i*.31+layer*.13+col*.025+Math.sin(time/125000+seed*6)*.015)%1.45-.2)*w,y=horizon*(.18+layer*.22+seed*.05),hh=(7+seed*15)*s;
  c.save();c.globalAlpha*=layer===0?.28:layer===1?.56:.76;cloud(c,x,y,ww,hh);const shade=c.createLinearGradient(0,y-hh,0,y+hh);shade.addColorStop(0,p.cloud);shade.addColorStop(.55,p.cloud);shade.addColorStop(1,p.shade);c.fillStyle=shade;c.fill();c.restore();
 }
 if(p.snow||room.sourceIndex===4){
  for(let layer=0;layer<3;layer++){
   const peaks=[];for(let i=-1;i<=9;i++){const x=i*w/8,crest=(45+(Math.sin(i*2.3+layer*.7+col*.09)+1)*40)*s;peaks.push([x,horizon-crest+layer*20*s]);}P(c,[[0,h],...peaks,[w,h]],['#a9c6d1','#8baebf','#789cae'][layer]);
   if(layer===0)for(let i=1;i<peaks.length-1;i++){const [x,y]=peaks[i];P(c,[[x-w/22,y+21*s],[x,y],[x+w/24,y+24*s],[x+4*s,y+15*s]],'#edf0df');}
  }
 }
 if(room.skyline){
  // A shared northern range and long wind-torn cloud bands. Features use
  // atlas bearings so the same peaks recur, rather than a pasted scenic card.
  for(let layer=0;layer<2;layer++){
   const points=[[0,horizon+18*s]];
   for(let i=-1;i<=70;i++){const x=i*w/68,bearing=col+x/w,peak=Math.pow(Math.max(0,Math.cos(bearing*1.21+.7)+Math.sin(bearing*3.7)*.32),2),height=(30+peak*61+Math.sin(bearing*8.7)*9)*s;points.push([x,horizon-height+layer*23*s]);}
   points.push([w,horizon+28*s]);P(c,points,layer===0?'#a6bfce88':'#759aa58c');
   c.save();c.strokeStyle=layer===0?'#eef0df99':'#c9dad580';c.lineWidth=1.4*s;c.beginPath();points.slice(1,-1).forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.restore();
  }
  for(let i=0;i<3;i++){
   const y=horizon*(.11+i*.105),drift=Math.sin(time/170000+i)*w*.018;c.save();c.globalAlpha=.25-i*.045;c.fillStyle=p.cloud;c.beginPath();c.moveTo(-w*.12+drift,y);c.bezierCurveTo(w*.17,y-10*s,w*.41,y+19*s,w*.73,y+5*s);c.bezierCurveTo(w*.91,y+1*s,w*1.03,y+5*s,w*1.12,y+10*s);c.bezierCurveTo(w*.73,y+17*s,w*.39,y+8*s,-w*.12+drift,y+4*s);c.fill();c.restore();
  }
  // Tiny distant gliders establish scale without filling the quiet sky.
  c.save();c.strokeStyle=p.shade+'99';c.lineWidth=Math.max(.6,s);for(let i=0;i<3;i++){const x=w*(.22+i*.047)+Math.sin(time/45000)*5,y=horizon*.46+i*3*s;c.beginPath();c.moveTo(x-3*s,y);c.quadraticCurveTo(x,y-3*s,x+2*s,y);c.quadraticCurveTo(x+4*s,y-2*s,x+6*s,y);c.stroke();}c.restore();
 }
 drawSkyAir(c,p,w,vis,s,time,col,row);
 if(p.fog)for(let i=0;i<3;i++){const yy=horizon*(.6+i*.16),fog=c.createLinearGradient(0,yy-17,0,yy+26);fog.addColorStop(0,p.cloud+'00');fog.addColorStop(.5,p.cloud+'66');fog.addColorStop(1,p.cloud+'00');R(c,0,yy-17,w,43,fog);}
 return true;
}

// 2026-11-14: the sky carries the colour while the land stays quiet. A clear
// band of light lies along the horizon, dusk skies keep a wide afterglow and
// long lit cloud streaks, and night skies get a slow twinkle and a faint
// river of stars. Everything is translucent, so each palette shows through.
// The visible floor of the open sky: where the distant panorama begins.
export const skyFloor=l=>Math.max(24*l.scale,(l.y-128*l.scale)*.58);
export const CLEAR_SKY={colors:['#5f9cc4','#9bcbdc','#d3e7e6','#f1ead6','#f8e2c0'],cloud:'#fff6e4',shade:'#b3c4d2'};
const dusk=p=>!!p.sun&&!p.moon;
export function drawSkyAir(c,p,w,horizon,s,time,col=0,row=0){
 c.save();
 // A luminous horizon: lighter, slightly warmer air just above the land.
 const band=c.createLinearGradient(0,horizon-120*s,0,horizon+24*s);band.addColorStop(0,p.colors[4]+'00');band.addColorStop(.62,p.colors[4]+(p.stars?'40':'6b'));band.addColorStop(1,p.colors[4]+(p.stars?'66':'a6'));
 c.globalCompositeOperation='screen';R(c,0,horizon-120*s,w,144*s,band);
 if(dusk(p)){
  // Afterglow: the low sky burns softly from one side to the other.
  const side=col%2>.5?.29:.68,glow=c.createRadialGradient(w*side,horizon,8*s,w*side,horizon,w*.95);glow.addColorStop(0,(p.sun||p.colors[4])+'99');glow.addColorStop(.4,(p.light||p.colors[3])+'55');glow.addColorStop(1,p.colors[2]+'00');
  R(c,0,0,w,horizon+24*s,glow);
  c.globalCompositeOperation='source-over';
  for(let i=0;i<4;i++){const seed=((i*7+Math.floor(col)*3+Math.floor(row))%11)/11,y=horizon*(.38+i*.12+seed*.04),x=w*(-.15+seed*.4)+Math.sin(time/160000+i)*w*.01,len=w*(.55+seed*.4),th=(2.2+seed*2.6)*s;
   const g=c.createLinearGradient(0,y-th,0,y+th);g.addColorStop(0,p.shade);g.addColorStop(.55,p.colors[2]);g.addColorStop(1,p.sun||p.colors[4]);
   c.globalAlpha=.78-i*.1;c.fillStyle=g;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+len*.3,y-th*1.6,x+len*.7,y-th*.6,x+len,y+th*.2);c.bezierCurveTo(x+len*.7,y+th*1.4,x+len*.3,y+th*1.5,x,y);c.fill();}
 }
 if(p.stars){
  c.globalCompositeOperation='screen';
  // A faint diagonal river of stars.
  c.save();c.translate(w*.5,horizon*.36);c.rotate(-.42+((col*.13)%.2));const river=c.createLinearGradient(0,-26*s,0,26*s);river.addColorStop(0,'#c9c8e000');river.addColorStop(.5,'#c9c8e02e');river.addColorStop(1,'#c9c8e000');R(c,-w,-26*s,w*2,52*s,river);c.restore();
  c.globalCompositeOperation='source-over';
  for(let i=0;i<26;i++){const x=((i*211+Math.floor(col)*53)%991)/991*w,y=((i*83+Math.floor(row)*41)%263)/263*horizon*.62,tw=.45+.55*Math.max(0,Math.sin(time/(900+i*37)+i*2.1));c.globalAlpha=tw*(i%5===0?.95:.6);const r=i%5===0?1.6*s:.9*s;R(c,x-r/2,y-r/2,r,r,'#fbf3dd');if(i%5===0){c.globalAlpha*=.35;R(c,x-r*2,y-.25*s,r*4,.5*s,'#fbf3dd');R(c,x-.25*s,y-r*2,.5*s,r*4,'#fbf3dd');}}
 }
 c.restore();
}
// Lights of far homes along the distant land on star-lit boards, in front of
// the panorama. They breathe slowly; nothing about them is walkable.
export function drawNightLights(c,room,w,h,l,time,alpha=1){
 const p=FIXED_SKIES[room.sky];if(!p?.stars||alpha<=0)return;
 const s=l.scale,top=l.y-128*s,horizon=skyFloor(l),col=Math.floor(room.col||0),row=Math.floor(room.row||0);
 c.save();
 for(let i=0;i<18;i++){const seed=((i*37+col*11+row*7)%23)/23,x=((i*.137+seed*.31+col*.07)%1)*w,y=horizon+(4+seed*Math.max(8,(top-horizon)*.55))*1,tw=.65+.35*Math.sin(time/(1400+i*61)+i);
  const glow=c.createRadialGradient(x,y,0,x,y,6*s);glow.addColorStop(0,'#ffd99a99');glow.addColorStop(1,'#ffd99a00');c.globalAlpha=alpha*tw*.8;R(c,x-6*s,y-6*s,12*s,12*s,glow);c.globalAlpha=alpha*tw;R(c,x-.8*s,y-.8*s,1.6*s,1.6*s,'#ffe7b8');}
 c.restore();
}
// The land is graded quietly so that the sky can be the colourful part: a
// soft grey-green wash from the distant land down, a little of the sky's own
// haze on the far edge of the board, and the sky's light (warm at dusk) on the
// land. The open sky above the far land is left untouched.
export function gradeLand(g,room,w,h,l,weight=1){
 if(weight<=0)return;
 const p=FIXED_SKIES[room.sky]||CLEAR_SKY,s=l.scale,horizon=skyFloor(l),feather=18*s,near=l.y+l.height*.2;
 g.save();
 const wash=g.createLinearGradient(0,horizon-feather,0,horizon+feather),tone=p.stars?'#8e93a8':'#a8ad9f';wash.addColorStop(0,tone+'00');wash.addColorStop(1,tone);
 g.globalAlpha=.2*weight;R(g,0,horizon-feather,w,h-horizon+feather,wash);
 const air=g.createLinearGradient(0,l.y-150*s,0,near);air.addColorStop(0,p.colors[3]+'00');air.addColorStop(.35,p.colors[3]+'30');air.addColorStop(1,p.colors[3]+'00');g.globalAlpha=weight;R(g,0,l.y-150*s,w,near-l.y+150*s,air);
 if(dusk(p)){const warm=g.createLinearGradient(0,horizon-feather,0,h);warm.addColorStop(0,(p.light||p.colors[3])+'00');warm.addColorStop(.08,(p.light||p.colors[3])+'2a');warm.addColorStop(1,(p.light||p.colors[3])+'0a');g.globalAlpha=weight;R(g,0,horizon-feather,w,h-horizon+feather,warm);}
 // A soft frame in the sky's deepest colour, like the edge of an old screen.
 const v=g.createRadialGradient(w/2,h*.48,Math.min(w,h)*.42,w/2,h*.48,Math.hypot(w,h)*.62);v.addColorStop(0,p.colors[0]+'00');v.addColorStop(1,p.colors[0]+(p.stars?'5c':'40'));g.globalAlpha=weight;R(g,0,0,w,h,v);
 g.restore();
}
