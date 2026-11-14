// 2026-11-14 (producer: "make the buildings' shapes and people's clothes a
// little more like each region; this is a test of what worlds we can draw, so
// experiment"). An experiment in regional material culture for the
// screen-switching journey only. Every land belongs to one of nine fictional
// cultures, each with its own way of building and dressing. They take only
// landscape and craft inspiration from many places; none copies a real people,
// costume, faith or building. The connected world and older modes are untouched.
//
//  forest    timber-framed houses, steep mossy shingle roofs, carved barge
//            boards; hooded leaf-green cloaks
//  steppe    round felt tents with a painted band and crown, lattice fences,
//            pennants; long quilted coats, bright sashes, tall felt hats
//  hamlet    whitewashed cottages, terracotta roofs, blue shutters, window
//            flowers; aprons and headscarves
//  canal     narrow two-storey canal rows with stepped gables over an arcade,
//            striped awnings; short jackets, wide flat straw hats
//  marsh     reed-thatched round huts on stilts; reed capes and cone hats
//  shore     blue plank fishers' houses with nets and floats; striped shirts,
//            knitted caps
//  oasis     sun-dried brick with parapets, a small dome and a wind tower,
//            tiled arches; long pale robes and head wraps
//  citadel   sandstone with a turquoise ribbed dome and a tiled portal; long
//            embroidered coats and small patterned caps
//  highland  dry-stone walls under heavy slab roofs weighted with stones and
//            strings of pennants; fur-trimmed coats and ear-flap hats
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
const E=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);c.fill();};
const P=(c,pts,col)=>{c.fillStyle=col;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const L=(c,x0,y0,x1,y1,col,w=1)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();};
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a,b,t)=>'#'+hex(a).map((v,i)=>Math.round(v+(hex(b)[i]-v)*t).toString(16).padStart(2,'0')).join('');
const hash=s=>{let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);return (h>>>0)/4294967296;};
const ARCH=(c,x,y,w,h,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(x,y+h);c.lineTo(x,y+w/2);c.arc(x+w/2,y+w/2,w/2,Math.PI,0);c.lineTo(x+w,y+h);c.closePath();c.fill();};
const POINTED=(c,x,y,w,h,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(x,y+h);c.lineTo(x,y+w*.55);c.quadraticCurveTo(x,y,x+w/2,y-w*.15);c.quadraticCurveTo(x+w,y,x+w,y+w*.55);c.lineTo(x+w,y+h);c.closePath();c.fill();};

export const CULTURES={
 forest:{name:'森の木組み',wall:'#eadcbf',frame:'#5b4632',roof:'#5d6b46',roofDark:'#3f4c31',trim:'#a5643f',accent:'#c9a24e'},
 steppe:{name:'草原の天幕',wall:'#efe6d2',frame:'#8b6b45',roof:'#e4d8bd',roofDark:'#b9a582',trim:'#b8483b',accent:'#2f7f8a'},
 hamlet:{name:'白壁の里',wall:'#f3efe4',frame:'#c9bfa8',roof:'#c56b4b',roofDark:'#94473a',trim:'#4f7fa8',accent:'#d94f5c'},
 canal:{name:'水路の町',wall:'#d9b98a',frame:'#7f5a3c',roof:'#55606b',roofDark:'#3c4550',trim:'#2f6f7a',accent:'#e0a63c'},
 marsh:{name:'葦の高床',wall:'#c9b07c',frame:'#6d5434',roof:'#d4b468',roofDark:'#a5853e',trim:'#6f8f55',accent:'#b9572f'},
 shore:{name:'網の浜',wall:'#5f8fb0',frame:'#f1ede2',roof:'#7a8b98',roofDark:'#55636f',trim:'#f1ede2',accent:'#e0703a'},
 oasis:{name:'日干し煉瓦',wall:'#dbbb8b',frame:'#b08d5f',roof:'#e9d3aa',roofDark:'#c2a172',trim:'#3a9aa0',accent:'#c4573c'},
 citadel:{name:'青い丸屋根',wall:'#dac69c',frame:'#a88c5c',roof:'#3aa0a8',roofDark:'#25747c',trim:'#2c5f9e',accent:'#e2b94c'},
 highland:{name:'石積みの峰',wall:'#a3a39a',frame:'#6c6c64',roof:'#5d6062',roofDark:'#3e4143',trim:'#8b5e3c',accent:'#c4473c'}
};
const LAND={forest:'forest',meadow:'steppe',terrace:'steppe',village:'hamlet',canal:'canal',river:'canal',pond:'canal',marsh:'marsh',shore:'shore',salt:'oasis',dry:'oasis',stone:'citadel',ridge:'highland'};
export function cultureOf(room){return LAND[room?.land]||'hamlet';}

// ---------------------------------------------------------------- people
// A villager in a 32 x 32 cell. `tint` is the person's own colour, kept as the
// main garment so people stay distinguishable; the cut and the hat are regional.
export function drawRegionalVillager(c,x,y,person,culture){
 const k=CULTURES[culture]||CULTURES.hamlet,tint=person.color||'#7f9a9a',h=hash(person.name||tint),skin=['#e9c7a4','#d9ad86','#c89470','#f0d2b4'][Math.floor(h*4)];
 const ink='#263437',dark=mix(tint,'#1f2b2e',.4),light=mix(tint,'#ffffff',.35);
 E(c,x+16,y+28,8,2.4,'#19363855');
 const body=(top,bottom,w,col)=>{R(c,x+16-w/2,y+top,w,bottom-top,ink);R(c,x+17-w/2,y+top+1,w-2,bottom-top-1,col);};
 const legs=(col,top=23)=>{R(c,x+11,y+top,4,28-top,ink);R(c,x+17,y+top,4,28-top,ink);R(c,x+12,y+top,2,27-top,col);R(c,x+18,y+top,2,27-top,col);};
 const arms=(col,len=9)=>{R(c,x+8,y+14,3,len,ink);R(c,x+21,y+14,3,len,ink);R(c,x+9,y+15,2,len-2,col);R(c,x+22,y+15,2,len-2,col);R(c,x+9,y+13+len,2,2,skin);R(c,x+22,y+13+len,2,2,skin);};
 const head=(hair='#3f3433')=>{R(c,x+11,y+4,10,10,ink);R(c,x+12,y+6,8,7,skin);R(c,x+12,y+5,8,2,hair);R(c,x+14,y+9,1.6,1.6,'#2e3a41');R(c,x+17.4,y+9,1.6,1.6,'#2e3a41');};
 switch(culture){
  case 'forest':legs('#5b4632');arms(dark);body(13,24,13,mix(tint,'#6b8a4a',.45));R(c,x+11,y+19,11,2,'#6d4b2d');head();
   P(c,[[x+9,y+8],[x+16,y+1],[x+23,y+8],[x+23,y+15],[x+9,y+15]],ink);P(c,[[x+10,y+8],[x+16,y+2.5],[x+22,y+8],[x+22,y+14],[x+20,y+14],[x+20,y+7],[x+12,y+7],[x+12,y+14],[x+10,y+14]],mix('#4f7a46',tint,.25));
   P(c,[[x+9,y+14],[x+23,y+14],[x+25,y+25],[x+7,y+25]],mix('#4f7a46',tint,.2)+'cc');R(c,x+15,y+15,2,2,k.accent);break;
  case 'steppe':R(c,x+11,y+25,4,3,'#3b2a20');R(c,x+17,y+25,4,3,'#3b2a20');arms(tint,8);P(c,[[x+10,y+13],[x+22,y+13],[x+24,y+26],[x+8,y+26]],ink);P(c,[[x+11,y+14],[x+21,y+14],[x+23,y+25],[x+9,y+25]],tint);
   L(c,x+12,y+14,x+20,y+24,light,1.2);R(c,x+9,y+19,14,3,[k.trim,k.accent,'#d9a53c'][Math.floor(h*3)]);R(c,x+9,y+24,14,1,light);head();
   P(c,[[x+11,y+6],[x+12,y-1],[x+20,y-1],[x+21,y+6]],'#f2ede0');R(c,x+9,y+5,14,3,ink);R(c,x+10,y+5,12,2,'#3b3634');R(c,x+12,y+1,8,1,k.trim);break;
  case 'hamlet':legs('#4f4a48',24);arms(light,8);body(13,25,13,tint);P(c,[[x+12,y+16],[x+20,y+16],[x+21,y+25],[x+11,y+25]],'#f6f2e6');R(c,x+12,y+16,8,1,'#d8d0bd');head();
   P(c,[[x+10,y+9],[x+11,y+4],[x+16,y+2.5],[x+21,y+4],[x+22,y+9],[x+20,y+7],[x+12,y+7]],[k.accent,k.trim,'#d9a53c'][Math.floor(h*3)]);R(c,x+21,y+8,2,4,mix(k.accent,'#000000',.15));break;
  case 'canal':legs('#34485e');arms(dark,7);body(13,21,13,mix(tint,'#3f5f86',.45));R(c,x+12,y+20,8,1,light);R(c,x+15,y+14,2,7,light);head();
   E(c,x+16,y+5,12,3.6,ink);E(c,x+16,y+4.6,11,2.9,'#e3cf8c');E(c,x+16,y+3,4.5,2.4,'#d6bf78');L(c,x+11,y+5,x+21,y+5,'#b89a52',1);break;
  case 'marsh':legs('#4e5a3c');arms(dark,8);body(13,23,12,tint);head();
   for(let i=0;i<7;i++)L(c,x+9+i*2.3,y+12,x+8+i*2.6,y+25,i%2?'#b8994f':'#a1823e',1.6);
   P(c,[[x+6,y+7],[x+16,y-1],[x+26,y+7]],ink);P(c,[[x+7.5,y+6.5],[x+16,y+.5],[x+24.5,y+6.5]],'#d8bd6e');L(c,x+10,y+5,x+22,y+5,'#a88a45',1);break;
  case 'shore':legs('#3e5873',24);R(c,x+11,y+22,10,3,'#3e5873');arms('#f1ede2',8);body(13,23,13,'#f1ede2');for(let i=0;i<4;i++)R(c,x+12,y+15+i*2.5,8,1.2,mix(tint,'#24508a',.5));head();
   R(c,x+11,y+3,10,4,ink);R(c,x+12,y+3.5,8,3,[k.accent,'#c44a4a','#3f6f9a'][Math.floor(h*3)]);R(c,x+15,y+1.5,2,2,'#f1ede2');break;
  case 'oasis':R(c,x+11,y+26,4,2,'#8a6a45');R(c,x+17,y+26,4,2,'#8a6a45');arms('#f1e6cf',9);P(c,[[x+10,y+13],[x+22,y+13],[x+24,y+27],[x+8,y+27]],ink);P(c,[[x+11,y+14],[x+21,y+14],[x+23,y+26],[x+9,y+26]],'#f1e6cf');
   R(c,x+9,y+23,14,2,tint);R(c,x+15,y+14,2,9,mix(tint,'#ffffff',.2));head();
   P(c,[[x+10,y+9],[x+10,y+4],[x+16,y+2],[x+22,y+4],[x+22,y+9],[x+20,y+6],[x+12,y+6]],ink);P(c,[[x+11,y+8],[x+11,y+4.5],[x+16,y+3],[x+21,y+4.5],[x+21,y+8],[x+20,y+6],[x+12,y+6]],mix(tint,'#f5ecd8',.55));P(c,[[x+21,y+7],[x+24,y+15],[x+22,y+16],[x+20,y+9]],mix(tint,'#f5ecd8',.4));break;
  case 'citadel':legs('#2c3446',25);arms('#273d6b',9);P(c,[[x+10,y+13],[x+22,y+13],[x+23,y+27],[x+9,y+27]],ink);P(c,[[x+11,y+14],[x+21,y+14],[x+22,y+26],[x+10,y+26]],mix(tint,'#2c4b86',.55));
   L(c,x+16,y+14,x+16,y+26,k.accent,1.4);R(c,x+10,y+25,12,1.4,k.accent);for(let i=0;i<3;i++)R(c,x+12+i*3,y+17+i*2,1.5,1.5,k.accent);R(c,x+10,y+19,12,1.6,mix(tint,'#c94f4f',.4));head('#2f2826');
   R(c,x+11,y+2,10,4,ink);R(c,x+12,y+2.6,8,3,'#2d2a3d');for(let i=0;i<4;i++)R(c,x+12.5+i*2,y+3.4,1,1,i%2?'#f1ede2':k.accent);break;
  case 'highland':legs('#3b2f27',24);arms(dark,8);P(c,[[x+8,y+13],[x+24,y+13],[x+25,y+25],[x+7,y+25]],ink);P(c,[[x+9,y+14],[x+23,y+14],[x+24,y+24],[x+8,y+24]],mix(tint,'#7a4f35',.45));
   R(c,x+8,y+22,16,3,'#e9e1cf');R(c,x+14,y+14,4,10,'#e9e1cf');head();
   E(c,x+16,y+5,7,4,ink);E(c,x+16,y+4.6,6,3.3,'#7a5a40');R(c,x+9,y+5,3,7,'#7a5a40');R(c,x+20,y+5,3,7,'#7a5a40');R(c,x+11,y+2,10,2,'#efe7d4');break;
  default:legs('#3f4a50');arms(dark);body(13,24,13,tint);head();
 }
}

// -------------------------------------------------------------- buildings
// A regional building on its footprint (board pixels). The roof may rise above
// the footprint, as the old drawings did; nothing is drawn below it. `role`
// keeps each place's identity: an inn's blue lamps, a kitchen's awning and
// steam, a cloth shop's bolts, a glass house's panes, a home's flowers.
export function drawRegionalBuilding(c,box,culture,role='home',time=0){
 const k=CULTURES[culture]||CULTURES.hamlet,{x:X,y:Y,w:W,h:H}=box,base=Y+H,mid=X+W/2,wallTop=Y+H*(culture==='canal'?.18:.4),wallH=base-wallTop;
 const door=(dw,dh,col)=>{ARCH(c,mid-dw/2-1.5,base-dh-1.5,dw+3,dh+1.5,'#2b3437');ARCH(c,mid-dw/2,base-dh,dw,dh,col);R(c,mid+dw*.22,base-dh*.45,2,2,k.accent);R(c,mid-dw/2-6,base-1,dw+12,3,mix(k.frame,'#000000',.15));};
 const win=(wx,wy,ww,wh,shutters=true)=>{R(c,wx-1.5,wy-1.5,ww+3,wh+3,'#2b3437');R(c,wx,wy,ww,wh,role==='glass'?'#bfe2e6':'#3e5b66');R(c,wx+ww/2-.5,wy,1,wh,mix(k.frame,'#ffffff',.2));R(c,wx,wy+wh/2-.5,ww,1,mix(k.frame,'#ffffff',.2));R(c,wx+1,wy+1,ww/2-2,wh/2-2,'#ffffff40');
  if(shutters){R(c,wx-ww*.42-1,wy-1,ww*.42,wh+2,k.trim);R(c,wx+ww+1,wy-1,ww*.42,wh+2,k.trim);}
  if(role==='home'||role==='hut'){R(c,wx-2,wy+wh+1,ww+4,4,'#7a5a3c');for(let i=0;i<4;i++)E(c,wx+1+i*(ww/3),wy+wh+1,2.4,2,['#d94f5c','#f2d65c','#f1ede2','#c86ad0'][i%4]);}};
 const lamps=()=>{for(const lx of [X+W*.18,X+W*.82]){L(c,lx,wallTop+2,lx,wallTop+10,'#2b3437',1.2);E(c,lx,wallTop+15,5,6,'#2b3437');E(c,lx,wallTop+15,4,5,'#7ec3e6');E(c,lx-1,wallTop+13,1.6,2,'#e6f6ff');}
  R(c,mid+W*.12,wallTop+6,22,14,'#2b3437');R(c,mid+W*.12+1.5,wallTop+7.5,19,11,k.accent);R(c,mid+W*.12+5,wallTop+11,11,2,'#2b3437');};
 const awning=()=>{const ay=base-wallH*.55,stripes=Math.round((W-24)/12);for(let i=0;i<stripes;i++)P(c,[[X+12+i*12,ay],[X+24+i*12,ay],[X+26+i*12,ay+11],[X+10+i*12,ay+11]],i%2?'#f1ede2':k.accent);R(c,X+10,ay+10,W-20,2,'#2b3437');
  for(const tx of [X+W*.2,X+W*.8]){R(c,tx-10,base+2,20,3,'#7a5a3c');R(c,tx-8,base+5,2,5,'#5c4330');R(c,tx+6,base+5,2,5,'#5c4330');E(c,tx-3,base+1,3,1.5,'#f1ede2');E(c,tx+4,base+1,3,1.5,'#f1ede2');}
  const t=time/900;for(let i=0;i<3;i++){c.save();c.globalAlpha=.35;E(c,mid+W*.3+Math.sin(t+i)*3,Y-6-i*9-(t*6%9),4+i,3+i*.6,'#ffffff');c.restore();}};
 const cloth=()=>{L(c,X+12,wallTop+wallH*.25,X+W-12,wallTop+wallH*.25,'#4b3b2c',1.4);for(let i=0;i<6;i++){const cx=X+16+i*(W-32)/5;P(c,[[cx-5,wallTop+wallH*.25],[cx+5,wallTop+wallH*.25],[cx+4,wallTop+wallH*.25+18+(i%2)*5],[cx-4,wallTop+wallH*.25+20]],['#c4573c','#3a9aa0','#e2b94c','#7a5aa8','#4f8f5a','#d9708a'][i]);}};
 const laundry=()=>{L(c,X+4,wallTop+4,X-20,wallTop+14,'#4b3b2c',1);for(let i=0;i<3;i++)R(c,X-16+i*6,wallTop+9+i*1.4,4,7,['#f1ede2','#e2b94c','#8fb4d9'][i]);};
 const detail=()=>{if(role==='inn')lamps();else if(role==='kitchen')awning();else if(role==='cloth')cloth();else if(role==='home'&&W>100)laundry();};
 switch(culture){
  case 'forest':{
   R(c,X+6,wallTop,W-12,wallH,k.wall);for(let i=0;i<=6;i++){const px=X+6+i*(W-14)/6;R(c,px,wallTop,3,wallH,k.frame);}R(c,X+6,wallTop+wallH*.5,W-12,3,k.frame);
   for(let i=0;i<6;i+=2){const px=X+9+i*(W-14)/6,bw=(W-14)/6-3;L(c,px,wallTop+wallH*.5,px+bw,wallTop+3,k.frame,2.4);}
   const peak=Y-H*.38;P(c,[[X-4,wallTop+4],[mid,peak],[X+W+4,wallTop+4]],k.roofDark);P(c,[[X+2,wallTop+1],[mid,peak+6],[X+W-2,wallTop+1]],k.roof);
   for(let r=1;r<6;r++){const ry=peak+6+(wallTop-peak-6)*r/6,half=(W/2-2)*r/6;L(c,mid-half,ry,mid+half,ry,k.roofDark,1.2);for(let s=-half;s<half;s+=7)L(c,mid+s,ry,mid+s+2,ry+4,k.roofDark+'99',1);}
   for(let i=0;i<4;i++){c.save();c.globalAlpha=.5;E(c,mid-W*.25+i*W*.17,wallTop-8-i%2*9,7,3,'#7f9a50');c.restore();}
   L(c,X-4,wallTop+4,mid,peak,k.trim,3);L(c,X+W+4,wallTop+4,mid,peak,k.trim,3);for(let i=1;i<6;i++){const t=i/6;E(c,X-4+(mid-X+4)*t,wallTop+4+(peak-wallTop-4)*t+3,1.6,2,k.trim);E(c,X+W+4-(X+W+4-mid)*t,wallTop+4+(peak-wallTop-4)*t+3,1.6,2,k.trim);}
   E(c,mid,peak+(wallTop-peak)*.55,7,7,'#2b3437');E(c,mid,peak+(wallTop-peak)*.55,5.5,5.5,'#e9c870');L(c,mid-5,peak+(wallTop-peak)*.55,mid+5,peak+(wallTop-peak)*.55,k.frame,1);
   win(X+W*.2,wallTop+wallH*.18,14,12);win(X+W*.8-14,wallTop+wallH*.18,14,12);door(16,wallH*.62,'#7a4f2f');detail();break;}
  case 'steppe':{
   const tent=(cx,r,col)=>{const ty=base-r*1.05;R(c,cx-r,ty,r*2,r*1.05,'#2b3437');R(c,cx-r+1.5,ty+1,r*2-3,r*1.05-1,col);for(let i=0;i<5;i++)L(c,cx-r+3+i*(r*2-6)/4,ty+3,cx-r+3+i*(r*2-6)/4,base-3,mix(col,'#8b6b45',.4),.8);
    R(c,cx-r+1.5,ty+r*.3,r*2-3,r*.18,k.trim);for(let i=0;i<Math.floor(r/4);i++)P(c,[[cx-r+4+i*8,ty+r*.3],[cx-r+8+i*8,ty+r*.3+r*.09],[cx-r+4+i*8,ty+r*.48]],k.accent);
    E(c,cx,ty+1,r+2,r*.62,'#2b3437');E(c,cx,ty,r,r*.56,k.roof);E(c,cx-r*.25,ty-r*.15,r*.45,r*.22,'#ffffff66');for(let i=-3;i<=3;i++)L(c,cx,ty-r*.5,cx+i*r*.3,ty+r*.48,k.roofDark,.8);E(c,cx,ty-r*.5,r*.18,r*.1,'#6b4b2d');
    ARCH(c,cx-r*.22,base-r*.62,r*.44,r*.62,'#2b3437');ARCH(c,cx-r*.18,base-r*.58,r*.36,r*.58,k.trim);for(let i=0;i<3;i++)R(c,cx-r*.16,base-r*.5+i*r*.16,r*.32,1.2,k.accent);};
   const big=role==='hut'?Math.min(W*.4,H*.5):Math.min(H*.62,W*.24);tent(mid,big,k.wall);if(W>120){tent(X+W*.16,big*.62,mix(k.wall,'#d8c8a5',.4));tent(X+W*.84,big*.7,mix(k.wall,'#e8dcc5',.3));}
   for(let i=0;i<Math.floor(W/14);i++){const fx=X+4+i*14;if(Math.abs(fx-mid)<big)continue;L(c,fx,base-2,fx+10,base-12,'#8b6b45',1.2);L(c,fx+10,base-2,fx,base-12,'#8b6b45',1.2);}
   L(c,mid+big*.4,base-big*2.3,mid+big*.4,base-big*1.4,'#5c4330',1.4);for(let i=0;i<4;i++)P(c,[[mid+big*.4,base-big*2.3+i*4],[mid+big*.4+9,base-big*2.3+i*4+2],[mid+big*.4,base-big*2.3+i*4+4]],[k.trim,k.accent,'#d9a53c','#f1ede2'][i]);
   if(role==='inn')lamps();if(role==='kitchen')awning();if(role==='cloth')cloth();break;}
  case 'canal':{
   const n=Math.max(2,Math.round(W/62)),bw=(W-8)/n;R(c,X+4,base-wallH*.34,W-8,wallH*.34,'#a9927a');for(let i=0;i<n*2;i++)ARCH(c,X+8+i*(W-16)/(n*2),base-wallH*.3,(W-16)/(n*2)-6,wallH*.3,'#2f3a3d');
   for(let i=0;i<n;i++){const hx=X+4+i*bw,col=[k.wall,'#c97f5f','#8fb0a3','#e2c68a'][i%4],top=wallTop+(i%2)*10;R(c,hx,top,bw,base-wallH*.34-top,col);R(c,hx,base-wallH*.34-4,bw,4,k.frame);
    P(c,[[hx,top+1],[hx+bw*.18,top-14],[hx+bw*.18,top-22],[hx+bw*.36,top-22],[hx+bw*.36,top-30],[hx+bw*.64,top-30],[hx+bw*.64,top-22],[hx+bw*.82,top-22],[hx+bw*.82,top-14],[hx+bw,top+1]],col);L(c,hx,top+1,hx+bw,top+1,'#ffffff66',1);
    R(c,hx+bw*.44,top-26,bw*.12,8,'#2b3437');for(let r=0;r<2;r++)for(let q=0;q<2;q++){const ww=bw*.22,wx=hx+bw*.16+q*bw*.46,wy=top+8+r*((base-wallH*.34-top)/2.2);R(c,wx-1,wy-1,ww+2,14,'#2b3437');R(c,wx,wy,ww,12,role==='glass'?'#bfe2e6':'#3e5b66');R(c,wx,wy+5.5,ww,1,'#ffffff55');}}
   const ay=base-wallH*.34-2;for(let i=0;i<Math.round((W-16)/10);i++)P(c,[[X+8+i*10,ay],[X+18+i*10,ay],[X+19+i*10,ay+8],[X+7+i*10,ay+8]],i%2?'#f1ede2':k.trim);
   door(14,wallH*.28,'#5c4330');if(role==='inn')lamps();if(role==='cloth')cloth();if(role==='kitchen')awning();break;}
  case 'marsh':{
   const r=Math.min(W*.3,H*.55),hy=base-H*.32;for(let i=0;i<5;i++)R(c,mid-r+4+i*(r*2-10)/4,hy,3,base-hy,'#6d5434');R(c,mid-r-4,hy-2,r*2+8,4,'#7a5a3c');
   R(c,mid-r*.8,hy-r*.75,r*1.6,r*.75,k.wall);for(let i=0;i<6;i++)L(c,mid-r*.8+i*r*.32,hy-r*.75,mid-r*.8+i*r*.32,hy,mix(k.wall,'#6d5434',.4),1);
   P(c,[[mid-r*1.2,hy-r*.6],[mid,hy-r*2.1],[mid+r*1.2,hy-r*.6],[mid+r*.9,hy-r*.45],[mid-r*.9,hy-r*.45]],k.roofDark);P(c,[[mid-r*1.1,hy-r*.66],[mid,hy-r*1.98],[mid+r*1.1,hy-r*.66]],k.roof);
   for(let i=0;i<22;i++){const t=i/21,sx=mid-r*1.1+t*r*2.2;L(c,sx,hy-r*.66,mid+(sx-mid)*.35,hy-r*1.7,i%2?k.roofDark:'#e6cd85',1);}
   ARCH(c,mid-7,hy-r*.55,14,r*.55,'#2b3437');for(let i=0;i<4;i++)R(c,mid-5,hy+3+i*6,10,1.4,'#7a5a3c');if(role==='inn')lamps();break;}
  case 'shore':{
   R(c,X+6,wallTop,W-12,wallH,k.wall);for(let i=0;i<W-12;i+=7)R(c,X+6+i,wallTop,1,wallH,mix(k.wall,'#2b3e52',.25));R(c,X+6,wallTop,W-12,3,k.frame);R(c,X+6,base-4,W-12,4,k.frame);
   P(c,[[X-2,wallTop+3],[X+W*.2,Y-H*.12],[X+W*.8,Y-H*.12],[X+W+2,wallTop+3]],k.roofDark);P(c,[[X+3,wallTop+1],[X+W*.22,Y-H*.08],[X+W*.78,Y-H*.08],[X+W-3,wallTop+1]],k.roof);for(let r=1;r<4;r++)L(c,X+W*.1,wallTop-(wallTop-Y+H*.08)*r/4,X+W*.9,wallTop-(wallTop-Y+H*.08)*r/4,k.roofDark,1);
   c.strokeStyle='#e9e1cf99';c.lineWidth=.8;for(let i=0;i<7;i++){c.beginPath();c.moveTo(X+W*.62+i*5,wallTop+4);c.quadraticCurveTo(X+W*.7+i*4,wallTop+wallH*.5,X+W*.62+i*5,base-6);c.stroke();}for(let i=0;i<4;i++){c.beginPath();c.moveTo(X+W*.62,wallTop+8+i*8);c.lineTo(X+W*.9,wallTop+8+i*8);c.stroke();}
   for(let i=0;i<3;i++){E(c,X+W*.65+i*9,base-6,3.6,3.6,'#2b3437');E(c,X+W*.65+i*9,base-6,2.8,2.8,i%2?'#f1ede2':k.accent);}
   win(X+W*.18,wallTop+wallH*.25,14,12,false);door(15,wallH*.62,'#f1ede2');detail();break;}
  case 'oasis':{
   R(c,X+6,wallTop,W-12,wallH,k.wall);for(let i=0;i<14;i++)R(c,X+10+((i*37)%Math.max(1,W-26)),wallTop+6+((i*23)%Math.max(1,wallH-12)),7,3,mix(k.wall,'#a5845a',.35));
   for(let i=0;i<Math.floor((W-12)/12);i++)ARCH(c,X+7+i*12,wallTop-6,10,7,k.wall);R(c,X+6,wallTop-1,W-12,2,mix(k.wall,'#8a6a45',.3));
   const dr=Math.min(W*.16,26);E(c,mid,wallTop-1,dr+2,dr*.95,'#2b3437');E(c,mid,wallTop-2,dr,dr*.9,k.roof);E(c,mid-dr*.35,wallTop-dr*.45,dr*.35,dr*.25,'#ffffff55');R(c,mid-1,wallTop-dr-8,2,8,'#8a6a45');E(c,mid,wallTop-dr-8,2.4,2.4,k.accent);
   const tx=X+W*.8;R(c,tx-9,wallTop-H*.55,18,H*.55,'#2b3437');R(c,tx-7.5,wallTop-H*.55+1.5,15,H*.55,mix(k.wall,'#e9cfa0',.3));for(let i=0;i<3;i++)R(c,tx-5+i*4,wallTop-H*.5,2,10,'#2b3437');R(c,tx-10,wallTop-H*.55-3,20,4,k.frame);
   POINTED(c,mid-12,base-wallH*.7,24,wallH*.7,k.trim);POINTED(c,mid-9,base-wallH*.66,18,wallH*.66,'#5c4330');for(let i=0;i<5;i++)R(c,mid-12+i*5,base-wallH*.72,3,3,i%2?k.accent:'#f1ede2');
   for(const jx of [X+W*.18,X+W*.26]){E(c,jx,base-6,5,7,'#2b3437');E(c,jx,base-6,4,6,'#c4774c');R(c,jx-2,base-14,4,3,'#c4774c');}
   win(X+W*.3,wallTop+wallH*.2,10,10,false);if(role==='inn')lamps();if(role==='kitchen')awning();if(role==='cloth')cloth();break;}
  case 'citadel':{
   R(c,X+6,wallTop,W-12,wallH,k.wall);for(let r=0;r<wallH/8;r++)for(let i=0;i<W/16;i++)R(c,X+6+i*16+(r%2)*8,wallTop+r*8,1,8,mix(k.wall,'#8a6f45',.35));for(let r=1;r<wallH/8;r++)R(c,X+6,wallTop+r*8,W-12,1,mix(k.wall,'#8a6f45',.3));
   R(c,X+6,wallTop,W-12,5,k.trim);for(let i=0;i<(W-12)/6;i++)R(c,X+7+i*6,wallTop+1,3,3,i%2?k.accent:'#f1ede2');
   const dr=Math.min(W*.2,32);E(c,mid,wallTop-2,dr+2,dr*1.05,'#2b3437');E(c,mid,wallTop-3,dr,dr,k.roof);for(let i=-2;i<=2;i++){c.strokeStyle=k.roofDark;c.lineWidth=1;c.beginPath();c.moveTo(mid,wallTop-3-dr);c.quadraticCurveTo(mid+i*dr*.45,wallTop-3-dr*.4,mid+i*dr*.42,wallTop-3);c.stroke();}
   E(c,mid-dr*.35,wallTop-dr*.6,dr*.3,dr*.22,'#ffffff55');R(c,mid-1.5,wallTop-dr-14,3,12,k.accent);E(c,mid,wallTop-dr-15,3,3,k.accent);R(c,mid-dr-3,wallTop-5,dr*2+6,4,k.trim);
   for(const tx of [X+W*.12,X+W*.88]){R(c,tx-6,wallTop-H*.5,12,H*.5+wallH,'#2b3437');R(c,tx-4.5,wallTop-H*.5+1,9,H*.5+wallH-1,mix(k.wall,'#e8d7ae',.3));R(c,tx-4.5,wallTop-H*.3,9,4,k.trim);E(c,tx,wallTop-H*.5-1,6,5,k.roof);}
   const pw=Math.min(W*.3,44);R(c,mid-pw/2-4,base-wallH*.92,pw+8,wallH*.92,k.trim);for(let i=0;i<(pw+8)/5;i++)R(c,mid-pw/2-3+i*5,base-wallH*.92+1,2.5,2.5,i%2?k.accent:'#f1ede2');POINTED(c,mid-pw/2,base-wallH*.78,pw,wallH*.78,'#2b3437');POINTED(c,mid-pw/2+3,base-wallH*.74,pw-6,wallH*.74,'#3e5b66');ARCH(c,mid-8,base-wallH*.42,16,wallH*.42,'#7a4f2f');
   win(X+W*.24,wallTop+wallH*.3,10,14,false);win(X+W*.76-10,wallTop+wallH*.3,10,14,false);if(role==='inn')lamps();if(role==='kitchen')awning();if(role==='cloth')cloth();break;}
  case 'highland':{
   R(c,X+6,wallTop,W-12,wallH,mix(k.wall,'#7a7a72',.3));for(let r=0;r<wallH/7;r++)for(let i=0;i<(W-12)/11;i++){const sx=X+8+i*11+(r%2)*5,sy=wallTop+2+r*7;E(c,sx+4,sy+3,5,3,mix(k.wall,'#ffffff',(i*7+r*3)%5/14));L(c,sx,sy+6,sx+9,sy+6,'#4e4e48',.8);}
   P(c,[[X-4,wallTop+3],[X+4,wallTop-14],[X+W-4,wallTop-14],[X+W+4,wallTop+3]],'#2b3437');P(c,[[X-2,wallTop+1],[X+5,wallTop-12],[X+W-5,wallTop-12],[X+W+2,wallTop+1]],k.roof);R(c,X-2,wallTop,W+4,2,k.roofDark);
   for(let i=0;i<Math.floor(W/22);i++)E(c,X+12+i*22,wallTop-12,5,3.5,['#8d8d84','#a3a39a','#77776f'][i%3]);
   L(c,X+4,wallTop-12,X+W-4,wallTop-30,'#4b3b2c',1);for(let i=0;i<Math.floor(W/10);i++){const t=i/Math.floor(W/10),px=X+4+t*(W-8),py=wallTop-12-t*18;P(c,[[px,py],[px+6,py],[px+3,py+7]],[k.accent,'#f1ede2','#3a9aa0','#e2b94c','#4f8f5a'][i%5]);}
   R(c,X+W*.72,wallTop-H*.36,12,H*.36-12,'#5d6062');R(c,X+W*.72-2,wallTop-H*.36-3,16,4,'#3e4143');
   win(X+W*.22,wallTop+wallH*.3,11,9,false);door(15,wallH*.6,k.trim);detail();break;}
  default:{ // hamlet
   R(c,X+6,wallTop,W-12,wallH,k.wall);R(c,X+6,base-6,W-12,6,mix(k.wall,'#b8ae98',.5));
   P(c,[[X-3,wallTop+4],[X+W*.18,Y-H*.2],[X+W*.82,Y-H*.2],[X+W+3,wallTop+4]],k.roofDark);P(c,[[X+2,wallTop+1],[X+W*.2,Y-H*.16],[X+W*.8,Y-H*.16],[X+W-2,wallTop+1]],k.roof);
   for(let r=1;r<5;r++){const ry=Y-H*.16+(wallTop-Y+H*.16)*r/5,inset=W*.2*(1-r/5);L(c,X+2+inset,ry,X+W-2-inset,ry,k.roofDark,1.2);for(let s=X+6+inset;s<X+W-6-inset;s+=6){c.strokeStyle=k.roofDark+'88';c.lineWidth=.8;c.beginPath();c.arc(s+3,ry,3,0,Math.PI);c.stroke();}}
   R(c,X+W*.7,Y-H*.36,10,H*.26,'#d9d2c2');R(c,X+W*.7-1.5,Y-H*.38,13,3,k.roofDark);
   win(X+W*.18,wallTop+wallH*.2,14,13);win(X+W*.82-14,wallTop+wallH*.2,14,13);if(W>140){win(X+W*.36,wallTop+wallH*.2,12,12);win(X+W*.64-12,wallTop+wallH*.2,12,12);}
   door(16,wallH*.6,k.trim);detail();}
 }
}
// Which building roles keep their identity when re-drawn regionally.
export function dwellingRole(site){
 if(!site)return null;
 return {tea:'inn','se-kitchen':'kitchen','west-home':'home','se-home':/布/.test(site.name||'')?'cloth':'home','west-village':'glass'}[site.form]||null;
}
