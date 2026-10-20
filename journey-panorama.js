// A small original landscape painting, revealed only when the traveller stops.
// Two fixed-size cached layers per scene keep animation cheap and bounded.
const WIDTH=480,HEIGHT=252;
const scenes=new Map();
const palettes={
 steppe:{sky:['#779eaf','#a9c1c5','#d7d9c5','#efe2ba'],cloud:'#f5e8ce',cloudShade:'#cad3c6',far:'#b5c3bf',middle:'#90aaa9',near:'#759695',grass:'#c2c49e',light:'#ded3a8',shadow:'#94ad8b'},
 highland:{sky:['#7899b0','#a5bdc8','#d7daca','#ede2bd'],cloud:'#eee7d4',cloudShade:'#c9d3d2',far:'#b8c4c8',middle:'#94a9b4',near:'#738e9d',water:'#91b5b4'},
 sunset:{sky:['#7c8aa9','#b5a2b9','#e3b3bc','#f2d6bc'],cloud:'#f2c8c4',cloudShade:'#baa4ba',far:'#b2a8bc',middle:'#9298af',near:'#788d9e',water:'#8fabae'}
};
const noise=(i,seed=0)=>{let n=Math.imul(i+79,374761393)^Math.imul(seed+31,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function polygon(c,points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();}
function ridge(c,points,color,bottom=HEIGHT){polygon(c,[...points,[WIDTH,bottom],[0,bottom]],color);}
function mix(a,b,t){const aa=a.match(/[\da-f]{2}/gi).map(x=>parseInt(x,16)),bb=b.match(/[\da-f]{2}/gi).map(x=>parseInt(x,16));return`rgb(${aa.map((v,i)=>Math.round(v+(bb[i]-v)*t)).join(',')})`;}
function surface(){const canvas=document.createElement('canvas');canvas.width=WIDTH;canvas.height=HEIGHT;return canvas;}

function paintSky(c,kind,p){
 // Three-pixel paint strokes leave a quiet, slightly stepped colour field.
 for(let y=0;y<HEIGHT;y+=3){const f=Math.min(2.999,y/54),band=Math.floor(f);rect(c,0,y,WIDTH,3,mix(p.sky[band],p.sky[band+1],f-band));}
 if(kind!=='sunset')return;
 // Hand-rastered circles stay crisp at the canvas's native pixel resolution.
 for(const [r,color] of [[65,'#f6d4b20a'],[54,'#ffdcaf0d'],[45,'#ffe1b719'],[35,'#ffe5b540'],[29,'#ffedc2']]){
  for(let dy=-r;dy<=r;dy++){const half=Math.floor(Math.sqrt(r*r-dy*dy));rect(c,331-half,116+dy,half*2+1,1,color);}
 }
 // A little warm air crosses the disk; its lower edge sinks behind the ridge.
 rect(c,303,121,57,1,'#f7d6b68a');rect(c,305,129,54,1,'#edc4b978');
}

function distantRidges(c,kind,p){
 if(kind==='steppe'){
  ridge(c,[[0,153],[17,151],[35,143],[46,144],[65,132],[78,138],[88,130],[102,126],[109,133],[123,139],[142,141],[157,149],[184,146],[202,143],[218,140],[232,145],[252,148],[273,142],[288,140],[307,133],[321,135],[337,126],[346,128],[363,119],[379,129],[388,126],[409,139],[428,140],[444,146],[462,144],[480,150]],p.far);
  polygon(c,[[65,132],[77,137],[89,130],[103,126],[106,130],[98,130],[89,135],[80,140]],'#d6d8c9');
  polygon(c,[[337,126],[346,128],[363,119],[374,126],[364,124],[357,128],[350,131]],'#d6d7c8');
  ridge(c,[[0,160],[28,157],[44,154],[66,157],[89,155],[112,160],[145,157],[170,162],[199,157],[226,160],[251,157],[281,158],[309,153],[341,155],[367,146],[390,149],[417,156],[449,155],[480,161]],p.middle);
  ridge(c,[[0,169],[34,166],[74,167],[106,163],[142,168],[177,167],[217,170],[252,166],[298,169],[336,163],[372,162],[405,166],[440,165],[480,170]],'#a4b6a3');
  rect(c,0,171,WIDTH,2,'#d2d0ab');
 }else if(kind==='highland'){
  ridge(c,[[0,132],[15,128],[29,119],[43,122],[56,108],[67,112],[82,103],[94,93],[105,101],[116,98],[133,110],[151,113],[168,124],[184,121],[202,126],[220,116],[236,111],[251,99],[266,92],[280,83],[290,91],[301,87],[317,102],[328,106],[345,99],[357,106],[371,103],[391,119],[405,114],[425,123],[447,119],[463,130],[480,126]],p.far);
  polygon(c,[[251,99],[266,92],[280,83],[290,91],[301,87],[308,96],[299,92],[293,97],[283,90],[276,91],[272,98],[266,96],[259,103]],'#d8dce0');
  polygon(c,[[82,103],[94,93],[105,101],[116,98],[124,104],[113,102],[107,105],[96,99],[93,102]],'#d8dedb');
  ridge(c,[[0,151],[24,144],[43,145],[63,135],[82,132],[106,141],[121,135],[143,142],[169,134],[194,142],[212,139],[231,145],[250,137],[265,139],[282,128],[299,134],[316,130],[334,145],[352,139],[375,148],[395,143],[418,152],[445,147],[464,149],[480,146]],p.middle);
  polygon(c,[[282,128],[299,134],[316,130],[334,145],[309,141],[292,138]],'#aebdc2');
  ridge(c,[[0,160],[29,154],[51,159],[80,150],[102,156],[130,153],[155,161],[176,157],[198,161],[223,157],[244,163],[269,159],[294,163],[317,159],[341,161],[366,157],[393,162],[418,157],[449,160],[480,158]],p.near);
 }else{
  // Irregular shelves and singular peaks, rather than repeated sine-wave hills.
  ridge(c,[[0,143],[19,140],[34,142],[53,130],[68,134],[80,125],[96,130],[111,119],[126,123],[145,133],[163,127],[179,134],[194,132],[213,140],[233,135],[249,140],[267,137],[286,145],[310,144],[330,151],[351,146],[366,148],[389,140],[408,143],[425,135],[439,139],[459,135],[480,144]],p.far);
  polygon(c,[[80,125],[96,130],[111,119],[126,123],[133,127],[123,126],[114,123],[108,126],[98,133]],'#c9bac7');
  ridge(c,[[0,156],[24,152],[45,155],[67,147],[86,150],[106,144],[125,151],[146,149],[169,157],[191,153],[211,158],[235,154],[259,159],[283,156],[306,163],[330,161],[351,164],[378,157],[401,155],[420,159],[443,153],[461,156],[480,152]],p.middle);
  ridge(c,[[0,164],[24,161],[53,165],[84,159],[113,166],[146,163],[174,168],[207,165],[238,170],[274,167],[304,171],[334,168],[368,171],[398,164],[428,168],[455,163],[480,166]],p.near);
 }
}

function monolith(c,x,y,w,h){
 polygon(c,[[x,y+h],[x-1,y+3],[x+w*.65,y],[x+w,y+3],[x+w-1,y+h-1]],'#617b83');
 polygon(c,[[x,y+h],[x-1,y+3],[x+w*.65,y],[x+w*.59,y+h]],'#849792');
 rect(c,x,y+4,1,h-7,'#bac2a8');
 polygon(c,[[x+w*.65,y],[x+w,y+3],[x+w-1,y+h-1],[x+w*.59,y+h]],'#56717d');
}

function steppeGround(c,p){
 rect(c,0,173,WIDTH,79,p.grass);
 polygon(c,[[0,184],[35,180],[89,180],[140,177],[190,180],[245,176],[304,180],[358,176],[410,179],[480,175],[480,193],[0,199]],'#cbd0a6');
 polygon(c,[[0,201],[57,190],[106,189],[157,196],[214,191],[268,191],[317,185],[365,185],[421,192],[480,188],[480,252],[0,252]],'#b1bf94');
 polygon(c,[[0,230],[50,216],[105,211],[162,213],[205,204],[251,205],[299,208],[350,201],[404,201],[445,205],[480,203],[480,252],[0,252]],'#a5b88f');
 // A narrow road bends into the distance, broadening only near the viewer.
 polygon(c,[[290,173],[292,173],[285,178],[269,183],[263,188],[268,194],[291,202],[301,212],[295,224],[272,237],[254,252],[231,252],[252,231],[279,220],[288,213],[282,207],[259,198],[253,190],[258,183],[277,178]],'#d8cda6');
 polygon(c,[[291,173],[292,173],[285,178],[270,183],[264,188],[270,195],[291,202],[300,211],[294,223],[270,237],[252,252],[248,252],[267,235],[290,222],[296,211],[288,204],[265,196],[260,190],[264,182],[283,178]],'#ebe0b6');
 // Fine receding brushwork never forms a tile grid.
 for(let i=0;i<340;i++){
  const y=175+noise(i,8)*76,x=noise(i,17)*WIDTH,depth=(y-170)/82;
  const road=(y<180&&x>277&&x<296)||(y>=180&&y<200&&x>249&&x<279)||(y>=200&&y<225&&x>275&&x<304)||(y>=225&&x>230&&x<284);
  if(road)continue;
  rect(c,x,y,1+noise(i,22)*11*depth,1,i%4===0?'#d9d4ab':i%3===0?'#9aae88':'#bcc79e');
 }
 monolith(c,334,140,7,29);
 // A far-off pair of yurts gives the empty grassland a measure of scale.
 polygon(c,[[111,177],[115,173],[120,177]],'#ede1bc');rect(c,111,177,9,2,'#c4bd9d');
 polygon(c,[[125,178],[128,175],[132,178]],'#e5dbb7');
}

function lakeGround(c,kind,p){
 const sunset=kind==='sunset',top=sunset?172:166;
 for(let y=top;y<HEIGHT;y+=2){rect(c,0,y,WIDTH,2,mix(sunset?'#b9b4bd':'#b8c9bd',p.water,(y-top)/(HEIGHT-top)));}
 // Receding banks leave a long view through the lake into distant mountain air.
 polygon(c,[[0,top-2],[25,top+2],[49,top+1],[72,top+4],[119,top+6],[144,top+9],[112,top+10],[86,top+8],[53,top+9],[20,top+6],[0,top+7]],sunset?'#83959f':'#819d9b');
 polygon(c,[[480,top-4],[453,top],[429,top+1],[410,top+6],[384,top+7],[399,top+10],[430,top+7],[452,top+8],[480,top+4]],sunset?'#80969b':'#7f9f9c');
 for(let i=0;i<135;i++){
  const y=top+3+noise(i,4)*(HEIGHT-top),x=noise(i,6)*WIDTH;
  rect(c,x,y,2+noise(i,15)*(y-top)*.39,1,i%4===0?(sunset?'#c9bfbb':'#cbd4c1'):(sunset?'#a5b3b3':'#a6c2bc'));
 }
 if(sunset){
  // The reflection widens toward us but remains broken by calm water.
  for(let row=0;row<42;row++){
   const y=174+row*1.6,width=7+row*.95,x=331-width/2+(noise(row,29)-.5)*(5+row*.34);
   rect(c,x,y,width,1,row%4===0?'#f3d4b4':row%3===0?'#e5c4b2':'#d7bdb3');
   if(row%3===0)rect(c,x-width*.5-5,y+1,width*.3,1,'#c9b8b0');
  }
 }else{
  // A nearer escarpment holds the stone; its foot is grounded on the shore.
  polygon(c,[[0,161],[29,156],[52,159],[74,157],[99,161],[123,158],[150,162],[177,160],[204,165],[223,172],[190,173],[152,177],[119,172],[92,175],[65,168],[37,170],[0,167]],'#98a89b');
  polygon(c,[[0,168],[41,170],[73,166],[97,173],[128,172],[157,177],[179,172],[214,172],[187,180],[156,181],[128,178],[102,179],[68,174],[39,176],[0,171]],'#bac0a5');
  polygon(c,[[139,166],[164,165],[195,171],[171,174]],'#7d9690');
  monolith(c,139,101,18,65);
  rect(c,145,164,18,1,'#d4cbb0');
 }
}

function traveller(c,x,y,sunset){
 // An unhurried silhouette. The pale scarf is the same quiet accent as the UI.
 rect(c,x-1,y,3,3,'#ead2b2');rect(c,x-2,y-1,4,1,'#6e6e62');
 rect(c,x-3,y+3,6,6,sunset?'#456875':'#456d73');
 rect(c,x-4,y+4,2,4,'#8e9b80');rect(c,x-3,y+3,6,1,'#c7d7c0');
 rect(c,x-5,y+3,3,1,'#c7d7c0');
 rect(c,x-2,y+9,2,3,'#364e59');rect(c,x+2,y+9,1,3,'#364e59');
}

function foreground(c,kind){
 const sunset=kind==='sunset',high=kind==='highland';
 const dark=sunset?'#536f7b':high?'#718c87':'#79967d';
 polygon(c,[[0,211],[14,211],[30,214],[43,219],[58,220],[77,224],[94,224],[109,230],[128,234],[147,244],[165,252],[0,252]],dark);
 polygon(c,[[0,211],[14,211],[30,214],[43,219],[58,220],[77,224],[94,224],[109,230],[104,231],[92,227],[75,227],[57,223],[42,222],[28,217],[12,215],[0,215]],sunset?'#92a39b':'#acb79a');
 polygon(c,[[379,252],[402,240],[415,231],[430,226],[446,225],[462,220],[480,221],[480,252]],sunset?'#627f86':high?'#849a8d':'#8ca483');
 if(sunset){
  // A few old stone steps catch the last light at the evening overlook.
  polygon(c,[[13,234],[49,231],[81,235],[93,239],[55,238],[18,241]],'#8d9a91');
  polygon(c,[[13,234],[49,231],[81,235],[79,236],[47,234],[18,237]],'#b4b3a1');
  rect(c,20,241,48,2,'#6c8585');
 }
 for(let i=0;i<55;i++){
  const left=i<42,x=left?noise(i,30)*111:417+noise(i,33)*63,y=left?232+noise(i,31)*20:241+noise(i,34)*11;
  rect(c,x,y,1,2+noise(i,32)*4,i%3===0?(sunset?'#a3ada0':'#c0c6a1'):(sunset?'#718d87':'#9db091'));
  if(i%6===0)rect(c,x-1,y,3,1,sunset?'#c4b6a0':'#ddd0a6');
 }
 traveller(c,76,213,sunset);
 // A handful of birds reads as distance, not a particle effect.
 if(!high){rect(c,191,98,2,1,sunset?'#9a91a2':'#a6b8b7');rect(c,194,98,2,1,sunset?'#9a91a2':'#a6b8b7');rect(c,193,99,1,1,sunset?'#9a91a2':'#a6b8b7');}
}

function buildScene(kind){
 const p=palettes[kind],sky=surface(),land=surface();
 paintSky(sky.getContext('2d'),kind,p);
 const c=land.getContext('2d');distantRidges(c,kind,p);
 if(kind==='steppe')steppeGround(c,p);else lakeGround(c,kind,p);
 foreground(c,kind);
 return{sky,land};
}

function clouds(c,kind,time){
 const p=palettes[kind],drift=Math.sin(time/82000)*5;
 // Distinct long cloud banks: a few illuminated broken edges, broad quiet gaps.
 const banks=kind==='sunset'?[[21,51,106,3],[49,55,123,2],[202,31,140,2],[224,35,91,2],[362,71,131,3],[390,76,95,2],[236,95,65,1]]:[[8,41,107,3],[34,46,123,2],[185,62,140,2],[218,66,81,2],[361,27,128,3],[389,32,96,2]];
 for(let i=0;i<banks.length;i++){
  const [x,y,w,h]=banks[i],dx=Math.round(drift*(i%2?1:.6));
  rect(c,x+dx,y,w,h,p.cloud+'45');rect(c,x+dx+13,y-1,w*.61,1,p.cloud+'54');
  if(h>1)rect(c,x+dx+19,y+h,w*.53,1,p.cloudShade+'24');
 }
}

function waterLight(c,kind,time){
 if(kind==='steppe')return;
 const sunset=kind==='sunset',phase=time/9500;
 // Every stroke stays on open water; none passes over the bank or traveller.
 for(let i=0;i<28;i++){
  const y=184+noise(i,43)*47,x=177+noise(i,44)*200+Math.sin(phase+i*1.7)*1.6;
  const length=3+noise(i,45)*(y-177)*.32;
  c.globalAlpha=.17+(.5+.5*Math.sin(phase+i*2.4))*.18;
  rect(c,x,y,length,1,sunset?'#ead3c0':'#dce5ce');
 }
 if(sunset)for(let i=0;i<16;i++){
  const y=178+i*3.5,width=5+i*1.5;
  c.globalAlpha=.12+(.5+.5*Math.sin(phase*.7+i*1.9))*.22;
  rect(c,331-width/2+Math.sin(phase+i)*3,y,width,1,'#fff0c5');
 }
 c.globalAlpha=1;
}

export function drawJourneyPanorama(canvas,kind,time=0){
 kind=Object.hasOwn(palettes,kind)?kind:'steppe';
 if(canvas.width!==WIDTH)canvas.width=WIDTH;
 if(canvas.height!==HEIGHT)canvas.height=HEIGHT;
 const c=canvas.getContext('2d');
 if(!scenes.has(kind))scenes.set(kind,buildScene(kind));
 const scene=scenes.get(kind),moment=Number.isFinite(time)?Math.max(0,time):0;
 c.save();c.imageSmoothingEnabled=false;c.globalAlpha=1;
 c.drawImage(scene.sky,0,0);clouds(c,kind,moment);c.drawImage(scene.land,0,0);waterLight(c,kind,moment);c.restore();
}
