// A finite, page-local toy. Never changes terrain, progression or storage.
const kinds=Object.freeze({'pilgrim-place-1':'toy','journey-wonder-wheel':'water','pilgrim-place-6':'dry'});
const phases=new Map();
export const pilgrimPlayKind=site=>site?.kind==='pilgrimage'?kinds[site.id]||null:null;
export const pilgrimPlayPhase=site=>pilgrimPlayKind(site)?phases.get(site.id)??-1:-1;
export function turnPilgrimPlay(site){
 const kind=pilgrimPlayKind(site);if(!kind)return null;
 const phase=(pilgrimPlayPhase(site)+1)%3;phases.set(site.id,phase);
 const which=['左','真ん中','右'][phase];
 return (kind==='toy'?which+'の溝へ、小舟がすべる。輪を回した子が、舟の行き先を指さして笑う。':kind==='water'?which+'の溝へ、水が細く分かれる。升から落ちた水で、小舟が一つ先の器へ進む。':which+'の乾いた溝へ、手すりの布目印が動く。水は来ない。舟の擦れた跡だけが、その先へ続く。')+' もう一度輪を調べると、次の溝を選べる。';
}
export function drawPilgrimPlay(c,site,p){
 const kind=pilgrimPlayKind(site);if(!kind)return;
 const phase=pilgrimPlayPhase(site),cx=(site.x+site.w/2)*32,y=(site.y+site.h)*32-20;
 c.save();c.lineWidth=3;
 // Shallow grooves and bowls are floor markings, not new collision.
 for(let i=0;i<3;i++){
  const x=cx-56+i*56,selected=i===phase;
  c.strokeStyle=selected?(kind==='dry'?'#b58978':'#e2eee0'):p[3];
  c.beginPath();c.moveTo(cx,y-73);c.lineTo(x,y-28);c.lineTo(x,y);c.stroke();
  c.fillStyle=p[3];c.fillRect(x-17,y-4,34,17);
  c.fillStyle=kind==='dry'?p[1]:selected?p[2]:p[0];c.fillRect(x-13,y-1,26,9);
  if(selected){
   // A boat in wet places; a dry cloth marker has a deliberately different shape.
   c.fillStyle=kind==='dry'?'#b58978':'#f2d7a4';c.beginPath();
   if(kind==='dry'){c.moveTo(x,y-20);c.lineTo(x+13,y-15);c.lineTo(x,y-10);}
   else{c.moveTo(x-10,y);c.lineTo(x+11,y);c.lineTo(x+5,y+6);c.lineTo(x-5,y+6);}
   c.closePath();c.fill();
  }
 }
 // A human-sized handle invites inspection even before the first turn.
 c.strokeStyle=p[1];c.lineWidth=3;c.beginPath();c.arc(cx,y-77,9,0,Math.PI*2);c.stroke();
 c.fillStyle=p[3];c.fillRect(cx-2,y-80,4,7);c.restore();
}
