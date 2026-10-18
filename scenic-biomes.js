// Overlapping small districts create visible changes while traversing each island.
// Cosmetic-only variants: every patch tile stays walkable; main roads overwrite patches.
export const SCENIC_PATCHES=[
 {zone:'garden',x:22,y:30,rx:12,ry:12,tile:'M',name:'野花の草原'},
 {zone:'garden',x:51,y:36,rx:12,ry:11,tile:'A',name:'琥珀の林'},
 {zone:'garden',x:41,y:16,rx:12,ry:8,tile:'R',name:'苔むす遺構'},
 {zone:'garden',x:61,y:44,rx:10,ry:10,tile:'F',name:'深緑の木立'},
 {zone:'future',x:99,y:35,rx:12,ry:10,tile:'G',name:'ガラス庭園'},
 {zone:'future',x:137,y:38,rx:13,ry:12,tile:'P',name:'白い広場'},
 {zone:'future',x:125,y:15,rx:12,ry:10,tile:'C',name:'水鏡の回廊'},
 {zone:'future',x:146,y:18,rx:9,ry:11,tile:'G',name:'海辺の温室'},
 {zone:'harbour',x:20,y:94,rx:11,ry:10,tile:'D',name:'砂色の船渠'},
 {zone:'harbour',x:54,y:76,rx:12,ry:9,tile:'T',name:'赤瓦の街区'},
 {zone:'harbour',x:38,y:108,rx:13,ry:10,tile:'Q',name:'古い運河沿い'},
 {zone:'harbour',x:59,y:104,rx:10,ry:9,tile:'D',name:'黄昏の交易路'},
 {zone:'neon',x:106,y:101,rx:13,ry:10,tile:'B',name:'発光する植物園'},
 {zone:'neon',x:145,y:75,rx:11,ry:9,tile:'K',name:'夜光の街路'},
 {zone:'neon',x:119,y:72,rx:12,ry:9,tile:'E',name:'蒼いプラザ'},
 {zone:'neon',x:145,y:107,rx:10,ry:9,tile:'B',name:'光苔の海岸'}
];
function hash(x,y){
 let h=Math.imul(x+241,374761393)^Math.imul(y+59,668265263);
 h=Math.imul(h^(h>>>13),1274126177);return (h>>>16>>>0)/65535;
}
export const VARIANT_TILES=new Set(SCENIC_PATCHES.map(p=>p.tile));
export function scenicTile(zone,x,y){
 let best=-Infinity,choice=null;
 const perturb=(hash(Math.floor(x/3),Math.floor(y/3))-.5)*.15;
 for(const p of SCENIC_PATCHES){
  if(p.zone!==zone)continue;
  const dx=(x-p.x)/p.rx,dy=(y-p.y)/p.ry;
  const q=1-dx*dx-dy*dy+perturb;
  if(q>.08&&q>best){best=q;choice=p.tile;}
 }
 return choice;
}
