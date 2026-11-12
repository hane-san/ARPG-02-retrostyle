// Producer decision 2026-11-12: in the default screen-switching journey the
// music belongs to an area of several neighbouring boards, not to each board.
// Every area keeps a small playlist, so the existing library is re-placed in
// the field rather than reduced; the sound room still lists every piece.
// Boards are [col,row] on the 10 x 10 atlas. The first cue is the area's
// primary piece; the others follow it while the traveller stays in the area.
export const FIXED_AREAS=[
 {id:'sky-hamlet',name:'空の麓の集落',boards:[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1],[0,2],[1,2]],
  playlist:['47:2','23:1','30:1','24:1','6:1','1:1']},
 {id:'terrace-heights',name:'段畑と遠原の高み',boards:[[3,0],[4,0],[5,0],[3,1]],
  playlist:['48:2','49:2','45:2','48:1','31:1','31:2','25:1']},
 {id:'imperial-rim',name:'帝都の外郭',boards:[[6,0],[7,0],[8,0],[9,0]],
  playlist:['44:1','44:2','5:2','5:1','12:1','39:2','12:2']},
 {id:'shade-market',name:'木陰の森市',boards:[[4,1],[5,1],[6,1]],
  playlist:['18:1','18:2','17:1','4:1','3:2']},
 {id:'snow-ridge',name:'雪嶺の山道',boards:[[7,1],[8,1],[9,1]],
  playlist:['53:1','45:1','41:2','9:1','9:2','28:2']},
 {id:'wind-window',name:'風の草原と赤い風窓',boards:[[7,2],[8,2],[9,2]],
  playlist:['54:2','54:1','51:2','36:1']},
 {id:'water-gardens',name:'水を受ける庭',boards:[[2,2],[3,2],[2,3],[3,3],[2,4],[3,4],[2,5],[3,5]],
  playlist:['42:1','3:1','29:1','29:2','39:1','23:2']},
 {id:'dry-steps',name:'乾いた七段と白い舟',boards:[[4,2],[5,2],[4,3],[4,4],[5,4]],
  playlist:['42:2','27:1','27:2','35:2','34:2','2:2']},
 {id:'river-inn',name:'宿と河港',boards:[[6,2],[5,3],[6,3]],
  playlist:['52:1','30:2','51:1','15:2','13:1']},
 {id:'red-plateau',name:'赤い裂け目と白い高原',boards:[[6,4],[7,4],[8,4],[6,5],[7,5]],
  playlist:['53:2','10:1','10:2','33:1','33:2','36:2']},
 {id:'tide-coast',name:'潮の海岸',boards:[[7,3],[8,3],[9,3],[9,4],[8,5],[9,5],[9,6]],
  playlist:['52:2','46:2','50:2','47:1','14:1','14:2','13:2']},
 {id:'orchard-woods',name:'果樹と茶棚の森',boards:[[0,3],[1,3],[0,4],[1,4],[0,5],[1,5]],
  playlist:['50:1','46:1','25:2','6:2','19:1']},
 {id:'dusk-pines',name:'暮れの針葉樹',boards:[[0,6],[1,6],[0,7],[0,8],[0,9],[1,9]],
  playlist:['32:2','4:2','0:1','0:2','32:1','17:2']},
 {id:'lamp-village',name:'灯の集落',boards:[[2,6],[1,7],[2,7],[1,8],[2,8],[2,9]],
  playlist:['21:1','21:2','8:1','20:1','20:2','16:1','24:2']},
 {id:'travel-hub',name:'旅支度の分水庭',boards:[[4,5],[5,5]],
  playlist:['38:2','38:1','43:1','43:2']},
 {id:'windmill-fields',name:'風車と花の野',boards:[[3,6],[4,6],[5,6],[3,7],[4,7],[5,7],[3,8],[4,8]],
  playlist:['48:1','49:1','40:1','40:2','41:1','26:1','37:1']},
 {id:'cairn-ridge',name:'風見の尾根',boards:[[6,6],[7,6],[8,6]],
  playlist:['28:1','37:2','2:1','11:2','11:1']},
 {id:'starlit-stones',name:'星明かりの配水',boards:[[6,7],[7,7],[5,8],[6,8],[6,9]],
  playlist:['22:1','35:1','34:1','26:2','16:2','7:2','7:1']},
 {id:'night-harbour',name:'夜の河港と葦',boards:[[8,7],[9,7],[7,8],[8,8],[9,8],[7,9],[8,9],[9,9]],
  playlist:['22:2','15:1','19:2','8:2','1:2']},
 {id:'willow-water',name:'柳と点描の水辺',boards:[[3,9],[4,9],[5,9]],
  playlist:['46:2','47:1','3:1','13:1']}
];
const byBoard=new Map();
for(const area of FIXED_AREAS)for(const [x,y] of area.boards)byBoard.set(x+','+y,area);
export function fixedAreaAt(col,row){return byBoard.get(Math.round(col)+','+Math.round(row))||null;}
// Assigns the area and its primary cue. A quiet board stays quiet; its cue is
// only what the area resumes with once the traveller leaves the silence.
export function applyFixedAreas(rooms){
 for(const r of rooms){const area=fixedAreaAt(r.col,r.row);if(!area)throw Error('Board outside any area '+r.id);r.area=area.id;r.areaName=area.name;r.playlist=area.playlist;r.cue=area.playlist[0];}
 return rooms;
}
// How long one piece stays before the area moves to its next piece: two full
// loops, and never under two and a half minutes of actual listening.
export const FIXED_AREA_HOLD_SECONDS=150;
export function areaPieceSeconds(loopSeconds){return Math.max(FIXED_AREA_HOLD_SECONDS,loopSeconds*2);}
// Session-only playlist positions. Nothing is stored: a reload starts every
// area again from its primary piece.
export function createAreaPlaylists(){
 const index=new Map();
 return {
  cue(area){const list=FIXED_AREAS.find(a=>a.id===area)?.playlist;if(!list)return null;return list[(index.get(area)||0)%list.length];},
  advance(area){const list=FIXED_AREAS.find(a=>a.id===area)?.playlist;if(!list)return null;index.set(area,((index.get(area)||0)+1)%list.length);return this.cue(area);},
  reset(){index.clear();}
 };
}
