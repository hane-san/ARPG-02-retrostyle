// Issue #93 (B05/B06): two page-local toys in the lived-in forest market. They only
// change what the shop looks like and says; no terrain, collision, route or storage.
const kinds=Object.freeze({'forest-cloth':'cloth','forest-carver':'scale'});
const phases=new Map();
export const NUT_CAPACITY=4;
export const pilgrimToyKind=site=>site?.kind==='pilgrimage'?kinds[site.id]||null:null;
export const pilgrimToyPhase=site=>pilgrimToyKind(site)?phases.get(site.id)??0:0;
export function resetPilgrimToys(){phases.clear();}

// Inspecting turns the toy one step and returns the line shown in the reading card.
export function turnPilgrimToy(site){
 const kind=pilgrimToyKind(site);if(!kind)return null;
 if(kind==='cloth'){
  const phase=(pilgrimToyPhase(site)+1)%3;phases.set(site.id,phase);
  return ['布の枠を戻すと、色布がまっすぐ垂れる。向こうの台所は見えない。',
   '枠をひとつ回すと、布が斜めに風を受ける。すき間から、隣の家の鍋の湯気がのぞく。',
   'もうひとつ回すと、布は横に流れて窓が開く。台所の人が、こちらに手を振った。'][phase]+' もう一度調べると、枠が次の向きへ回る。';
 }
 const nuts=pilgrimToyPhase(site);
 if(nuts>=NUT_CAPACITY){phases.set(site.id,0);return '皿がいっぱいになると、木の実はみんな転がって元の籠へ戻った。誰も数えていないのに、店の人が「ちょうど」と言う。';}
 phases.set(site.id,nuts+1);
 return ['木の実がひと粒、量りの皿へ転がる。天秤が少しだけ傾く。','もうひと粒。反対側の木の匙の重さと、まだ釣り合わない。','三粒目で、天秤がほとんど水平になる。','四粒目で、天秤は木の実の側へ傾いた。次は、どうなるだろう。'][nuts];
}

export function drawPilgrimToy(c,site){
 const kind=pilgrimToyKind(site);if(!kind)return;
 const x=site.x*32,y=site.y*32,w=site.w*32,h=site.h*32,base=y+h,phase=pilgrimToyPhase(site);
 const rect=(px,py,pw,ph,color)=>{c.fillStyle=color;c.fillRect(Math.round(px),Math.round(py),Math.round(pw),Math.round(ph));};
 c.save();
 if(kind==='cloth'){
  // A turning wooden frame in front of the shop; the kitchen window shows through as it opens.
  const fx=x+w/2-22,fy=y+86,open=[0,.5,1][phase];
  rect(fx-3,fy-3,50,46,'#665b49');rect(fx,fy,44,40,'#3f3a33');
  rect(fx+6,fy+6,32*open+1,26,'#f0b866');rect(fx+6,fy+6,32*open+1,3,'#ffd896');
  for(let i=0;i<4;i++){
   const tilt=[0,6,14][phase],cx=fx+4+i*10+open*14;
   c.fillStyle=['#699f96','#e3c48d','#be8975','#8ea3b4'][i];
   c.beginPath();c.moveTo(cx,fy);c.lineTo(cx+8,fy);c.lineTo(cx+8+tilt,fy+36);c.lineTo(cx+tilt,fy+36);c.closePath();c.fill();
  }
  rect(fx+18,fy-9,8,8,'#95745b');rect(fx+20,fy-7,4,4,'#e3c48d');
 }else{
  // A small balance on the veranda: nuts on one pan, a wooden spoon on the other.
  const bx=x+w/2,by=base-34,nuts=phase,tilt=(nuts-3)*2.2;
  rect(bx-2,by-2,4,26,'#665b49');rect(bx-10,by+22,20,4,'#665b49');
  c.strokeStyle='#95745b';c.lineWidth=3;c.beginPath();c.moveTo(bx-24,by+tilt);c.lineTo(bx+24,by-tilt);c.stroke();
  for(const [side,dy] of [[-1,tilt],[1,-tilt]]){
   const px=bx+side*24;c.strokeStyle='#665b49';c.lineWidth=1;c.beginPath();c.moveTo(px,by+dy);c.lineTo(px,by+dy+9);c.stroke();
   rect(px-9,by+dy+9,18,3,'#e3c48d');
  }
  rect(bx+18,by-tilt+3,12,3,'#c9a46c');// the spoon
  for(let i=0;i<nuts;i++){c.fillStyle='#7a5236';c.beginPath();c.arc(bx-29+i*4,by+tilt+7-(i%2)*2,2.4,0,Math.PI*2);c.fill();}
 }
 c.restore();
}
