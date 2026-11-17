// A small atlas-only material pass (#142). Existing footprints, bowls, columns,
// steps and building roles stay in place; no new symbols or collision data.
import {fixedSource} from './fixed-journey-data.js';
import {drawPilgrimPlay} from './pilgrimage-play.js';
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
const L=(c,x,y,X,Y,col,w=1)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.stroke();};
const P=(c,p,col)=>{c.fillStyle=col;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const STONE=Object.freeze({finish:'stone',kind:'court'}),WHEEL=Object.freeze({finish:'stone',kind:'wheel'});
const HOUSE=(palette,ink)=>Object.freeze({finish:'timber',building:Object.freeze({palette:Object.freeze(palette),ink})});
const styles=Object.freeze({
 'watershed-wheel':WHEEL,'wet-temple':STONE,'dry-temple':STONE,
 'lantern-inn':HOUSE({wall:'#e5e0d0',frame:'#b5ad97',roof:'#87958e',roofDark:'#626f6b',trim:'#6b8990',accent:'#b49c72'},'#54605b'),
 'orchard-window':HOUSE({wall:'#e7e2d0',frame:'#b7ac93',roof:'#a47f69',roofDark:'#79695c',trim:'#758f91',accent:'#bd9a83'},'#625f50'),
 'river-port':HOUSE({wall:'#c8b795',frame:'#827561',trim:'#708d86',accent:'#b39b6f'},'#56655f')
});
export const sceneryRetouch=room=>styles[room.id]||null;
function basin(c,x,y,w,h,wet){
 const rim=wet?'#82958b':'#999a84',light='#d2d2b9',dark='#708176';
 P(c,[[x+2,y],[x+w-3,y],[x+w,y+3],[x+w-1,y+h],[x+2,y+h],[x,y+3]],rim);
 R(c,x+4,y+4,w-8,h-8,wet?'#8fb5ad':'#c5baa0');
 L(c,x+3,y+1,x+w-4,y+1,light,1.4);L(c,x+w-2,y+4,x+w-2,y+h-1,dark,1);
 L(c,x+4,y+h-3,x+w-3,y+h-3,dark,1.2);
 for(let i=0;i<3;i++)R(c,x+w*.3+i*w*.18,y+1,Math.max(1,w*.035),2,'#798b7d');
 if(wet){L(c,x+7,y+7,x+w-9,y+7,'#d6e6d5',1);L(c,x+w*.35,y+h-7,x+w*.64,y+h-7,'#bfd4c1',.8);}
 else{L(c,x+7,y+6,x+w-8,y+6,'#e2d7b9',1);L(c,x+w*.6,y+7,x+w*.56,y+h-5,'#a7a48a',.8);}
}
function pier(c,x,y,h,w,wet){
 R(c,x,y,w,h,wet?'#a2b19e':'#b5b39b');R(c,x+w-3,y,3,h,'#819282');
 for(let yy=13;yy<h-5;yy+=15){L(c,x+2,y+yy,x+w-2,y+yy,'#899b87',.7);R(c,x+3+(yy%2)*3,y+yy-7,2,1,'#cbd0b7');}
 P(c,[[x-3,y-4],[x+w+2,y-4],[x+w+4,y-2],[x+w+3,y+3],[x-4,y+3]],'#bec5ad');
 L(c,x-2,y-3,x+w+1,y-3,'#e1ddc5',1);R(c,x-4,y+h-5,w+8,7,'#8d9f89');
 L(c,x-3,y+h-5,x+w+2,y+h-5,'#c7ceb4',1);
}
export function drawRetouchedSite(c,s,style,{columns=true}={}){
 if(style?.kind!=='court'&&style?.kind!=='wheel')return false;
 const p=fixedSource(s.chapter).palette,w=s.w*32,h=s.h*32,cx=w/2,wet=s.chapter===2;
 c.save();
 if(style.kind==='court'){
  // This is the old low courtyard surface, not a vertical wall. Broken joints
  // and a gently worn lip leave the open lane and the equipment readable.
  P(c,[[0,h],[17,20],[w-17,20],[w,h]],wet?'#b4c0ab':'#c0bda4');
  L(c,18,21,w-18,21,'#d5d7be',2);
  for(let row=0;row<7;row++){
   const yy=43+row*31,inset=16*(1-yy/h);
   for(const [a,b] of [[inset+17,cx-50],[cx+50,w-inset-17]])if(b>a){L(c,a,yy,b,yy,wet?'#98aa94':'#a9aa90',.7);L(c,a+12+(row%2)*23,yy-17,a+12+(row%2)*23,yy,wet?'#a5b39b':'#b0b098',.7);}
  }
  // The source's exact bowl/column positions and stepped approach survive.
  for(const side of [-1,1])for(let i=0;i<4;i++){
   const xx=side<0?13:w-32,yy=21+i*(h-56)/4;
   basin(c,xx+(side<0?25:-42),yy+37,44,27,wet);if(columns)pier(c,xx,yy,58,15,wet);
  }
  basin(c,cx-38,34,76,34,wet);
  L(c,cx,68,cx,h-11,wet?'#819e91':'#a29f85',8);
  L(c,cx-2,70,cx-2,h-14,wet?'#b8d1bd':'#d0c5a5',1.4);
  for(const side of [-1,1])for(let i=0;i<3;i++)basin(c,cx+side*(48+i*22)-9,h-28,18,14,wet);
  for(let i=0;i<5;i++){R(c,cx-28-i*3,h-7+i*18/5,56+i*6,18/5+1,i%2?'#b2bba2':'#cbd0b5');L(c,cx-28-i*3,h-7+(i+1)*18/5,cx+28+i*3,h-7+(i+1)*18/5,'#81927e',1);}
 }else if(style.kind==='wheel'){
  const x=37,y=h-40,W=w-74;R(c,x,y,W,39,'#abb6a0');R(c,x+W-4,y,4,39,'#839681');
  L(c,x+2,y+1,x+W-3,y+1,'#d3d6ba',2);
  for(let row=1;row<3;row++){L(c,x+3,y+row*13,x+W-4,y+row*13,'#8d9e87',.8);for(let j=0;j<7;j++)L(c,x+14+j*43+(row%2)*19,y+(row-1)*13+3,x+14+j*43+(row%2)*19,y+row*13,'#98a68d',.8);}
  c.strokeStyle='#7d9080';c.lineWidth=8;c.beginPath();c.ellipse(cx,h-46,w*.24,15,0,0,Math.PI*2);c.stroke();
  for(let i=0;i<6;i++){const a=i*Math.PI/3;L(c,cx,h-46,cx+Math.cos(a)*w*.23,h-46+Math.sin(a)*14,'#c7cdb0',3);}
  for(let i=0;i<3;i++)basin(c,cx-55+i*40,h-19,29,19,true);
 }
 drawPilgrimPlay(c,s,p);c.restore();return true;
}

const courtColumns=new WeakMap();
export function retouchedCourtColumns(site){
 if(courtColumns.has(site))return courtColumns.get(site);
 const out=[],w=site.sourceW*32,h=site.sourceH*32,s=site.scale;
 for(const side of [-1,1])for(let i=0;i<4;i++)out.push({x:site.x*32+(side<0?13:w-32)*s,y:site.y*32+(21+i*(h-56)/4)*s,w:15*s,h:58*s,scale:s,wet:site.chapter===2});
 courtColumns.set(site,out);return out;
}
export function drawRetouchedCourtGround(c,site){
 c.save();c.translate(site.x*32,site.y*32);c.scale(site.scale,site.scale);
 drawRetouchedSite(c,{...site,x:0,y:0,w:site.sourceW,h:site.sourceH},STONE,{columns:false});c.restore();
}
export function drawRetouchedCourtColumn(c,col){
 c.save();c.translate(col.x,col.y);c.scale(col.scale,col.scale);pier(c,0,0,58,15,col.wet);c.restore();
}
