// #84: a warm, inhabited clearing within the existing pilgrimage.
const place=(id,name,form,x,y,w,h,ex,ey,desc,aside,sound)=>({
 id:'forest-'+id,kind:'pilgrimage',form,name,x,y,w,h,chapter:1,artTop:2,
 blocking:false,solid:[{x:0,y:0,w,h:2},{x:0,y:2,w:1,h:h-2},{x:w-1,y:2,w:1,h:h-2}],
 entrance:{x:ex,y:ey},desc,aside,sound
});
export const FOREST_SITES=[
 place('tea','木洩れ日の茶棚','forest-tea',150,33,7,5,153,39,
  '木彫りの軒に、青緑の布。低い座卓には、よく冷めた一杯と、いま注いだ一杯が並ぶ。',
  '広場を通る人が一口ずつ飲んでいくので、店の人は自分の茶を飲む暇がない。','kettle'),
 place('cloth','風を量る布店','forest-cloth',127,32,7,5,130,38,
  '茜、蜂蜜、青緑の色布が、木の梁から下がっている。布の裾の向こうに、隣の家の台所が見える。',
  '長さを測るひもにも房飾り。「これは売り物じゃないよ」と、いちばん立派な房を隠された。','wood'),
 place('carver','枝窓の木彫り屋','forest-carver',150,25,5,4,152,30,
  '大きな木を避けて、窓が少し斜めに付いている。棚には鳥の笛、匙、まだ何にもなっていない木片。',
  '鳥の笛は、吹く人によって別の鳥になる。どれが正しいかは、作った人にも分からない。','wood')
];
FOREST_SITES[0].solid.push({x:1,y:3,w:1,h:1},{x:5,y:3,w:1,h:1});
FOREST_SITES[2].solid.push({x:1,y:2,w:3,h:1});
export const FOREST_NPCS=[
 {id:'forest-baker',name:'木の実パンを焼く人',role:'森市のパン屋',x:153,y:42,color:'#a77e68',lines:[
  '焼けたよ！ 丸いのは木の実入り。曲がってるのも木の実入り。',
  '形をそろえるより、熱いうちに食べてもらいたくてね。お茶の棚は、あっち。']},
 {id:'forest-seller',name:'布をたたむ人',role:'森市の布屋',x:132,y:42,color:'#6e9c95',lines:[
  'この布、木陰では青くて、日に出すと緑に見えるの。決められなくて両方の名前を付けたわ。',
  '森じゅうに看板を掛けようとしたら、鳥に怒られちゃった。いまは家の軒だけ。']}
];
export function plantForestMarket(occupied,width,walkable,sites,npcs){
 const trees=[];
 for(let gy=25;gy<=49;gy+=4)for(let gx=115;gx<=161;gx+=4){
  const x=gx+((gx+gy)%3)-1,y=gy+((gx*3+gy)%3)-1;
  // The market's cross-streets remain broad; leaves never acquire collision.
  if(Math.abs(y-38)<4||Math.abs(x-143)<4&&y<42)continue;
  if(!walkable(x,y)||![[1,0],[-1,0],[0,1],[0,-1]].every(([dx,dy])=>walkable(x+dx,y+dy)))continue;
  if(sites.some(s=>x>=s.x-2&&x<s.x+s.w+2&&y>=s.y-2&&y<s.y+s.h+2||Math.hypot(x-s.entrance.x,y-s.entrance.y)<3))continue;
  if(npcs.some(p=>Math.hypot(x-p.x,y-p.y)<3))continue;
  occupied[y*width+x]=1;
  trees.push({x,y,chapter:1,variant:12,solid:true,seed:((x*7+y*3)%19)/19});
 }
 return trees;
}
