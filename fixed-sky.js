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
 const p=FIXED_SKIES[room.sky];if(!p)return false;const col=room.skyAnchor?.x??room.col,row=room.skyAnchor?.y??room.row,s=l.scale,horizon=l.y+32*s*2.6,gradient=c.createLinearGradient(0,0,0,horizon+25*s);
 p.colors.forEach((col,i)=>gradient.addColorStop([0,.27,.58,.82,1][i],col));R(c,0,0,w,h,gradient);
 if(p.stars)for(let i=0;i<44;i++){const x=((i*131+Math.floor(col)*37)%997)/997*w,y=((i*67+Math.floor(row)*29)%277)/277*horizon*.69;R(c,x,y,i%9===0?2:1,i%9===0?2:1,p.moon?'#e5e6db99':'#f5e7d75c');}
 const sunX=w*(p.moon?.77:col%2>.5?.29:.68),sunY=horizon*(p.moon?.29:p.sun?.78:.34),radius=(p.moon?11:p.sun?19:10)*s;
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
 if(p.fog)for(let i=0;i<3;i++){const yy=horizon*(.6+i*.16),fog=c.createLinearGradient(0,yy-17,0,yy+26);fog.addColorStop(0,p.cloud+'00');fog.addColorStop(.5,p.cloud+'66');fog.addColorStop(1,p.cloud+'00');R(c,0,yy-17,w,43,fog);}
 return true;
}
