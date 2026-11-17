// 2026-11-17: the producer's ten screenshot favourites are the atlas field
// palette. Each existing area holds one representative piece; the full 110
// scores remain intact in the sound room and in the other modes.
export const FIXED_FIELD_CUES=Object.freeze(['0:1','0:2','5:2','6:2','8:2','16:2','19:2','22:2','28:1','40:2']);
// Adjacent areas contrast by lead instrument or metre, not only by title.
// Several distant places may share a piece and recall the same atmosphere.
export const FIXED_AREAS=[
 {id:'sky-hamlet',name:'空の麓の集落',boards:[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1],[0,2],[1,2]],
  playlist:['6:2']},
 {id:'terrace-heights',name:'段畑と遠原の高み',boards:[[3,0],[4,0],[5,0],[3,1]],
  playlist:['40:2']},
 {id:'imperial-rim',name:'帝都の外郭',boards:[[6,0],[7,0],[8,0],[9,0]],
  playlist:['5:2']},
 {id:'shade-market',name:'木陰の森市',boards:[[4,1],[5,1],[6,1]],
  playlist:['0:2']},
 {id:'snow-ridge',name:'雪嶺の山道',boards:[[7,1],[8,1],[9,1]],
  playlist:['8:2']},
 {id:'wind-window',name:'風の草原と赤い風窓',boards:[[7,2],[8,2],[9,2]],
  playlist:['40:2']},
 {id:'water-gardens',name:'水を受ける庭',boards:[[2,2],[3,2],[2,3],[3,3],[2,4],[3,4],[2,5],[3,5]],
  playlist:['0:1']},
 {id:'dry-steps',name:'乾いた七段と白い舟',boards:[[4,2],[5,2],[4,3],[4,4],[5,4]],
  playlist:['16:2']},
 {id:'river-inn',name:'宿と河港',boards:[[6,2],[5,3],[6,3]],
  playlist:['0:1']},
 {id:'red-plateau',name:'赤い裂け目と白い高原',boards:[[6,4],[7,4],[8,4],[6,5],[7,5]],
  playlist:['19:2']},
 {id:'tide-coast',name:'潮の海岸',boards:[[7,3],[8,3],[9,3],[9,4],[8,5],[9,5],[9,6]],
  playlist:['22:2']},
 {id:'orchard-woods',name:'果樹と茶棚の森',boards:[[0,3],[1,3],[0,4],[1,4],[0,5],[1,5]],
  playlist:['40:2']},
 {id:'dusk-pines',name:'暮れの針葉樹',boards:[[0,6],[1,6],[0,7],[0,8],[0,9],[1,9]],
  playlist:['0:2']},
 {id:'lamp-village',name:'灯の集落',boards:[[2,6],[1,7],[2,7],[1,8],[2,8],[2,9]],
  playlist:['16:2']},
 {id:'travel-hub',name:'旅支度の分水庭',boards:[[4,5],[5,5]],
  playlist:['6:2']},
 {id:'windmill-fields',name:'風車と花の野',boards:[[3,6],[4,6],[5,6],[3,7],[4,7],[5,7],[3,8],[4,8]],
  playlist:['28:1']},
 {id:'cairn-ridge',name:'風見の尾根',boards:[[6,6],[7,6],[8,6]],
  playlist:['6:2']},
 {id:'starlit-stones',name:'星明かりの配水',boards:[[6,7],[7,7],[5,8],[6,8],[6,9]],
  playlist:['22:2']},
 {id:'night-harbour',name:'夜の河港と葦',boards:[[8,7],[9,7],[7,8],[8,8],[9,8],[7,9],[8,9],[9,9]],
  playlist:['0:2']},
 {id:'willow-water',name:'柳と点描の水辺',boards:[[3,9],[4,9],[5,9]],
  playlist:['0:1']}
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
// The existing playlist cadence is retained for compatibility. With one
// representative cue, advancing after this interval keeps the same piece.
export const FIXED_AREA_HOLD_SECONDS=150;
export function areaPieceSeconds(loopSeconds){return Math.max(FIXED_AREA_HOLD_SECONDS,loopSeconds*2);}
// The existing playlist API is retained. A one-piece area never changes
// cue when advanced, so prolonged listening keeps its regional identity.
// Nothing is saved; the library and other modes are unaffected.
export function createAreaPlaylists(){
 const index=new Map();
 return {
  cue(area){const list=FIXED_AREAS.find(a=>a.id===area)?.playlist;if(!list)return null;return list[(index.get(area)||0)%list.length];},
  advance(area){const list=FIXED_AREAS.find(a=>a.id===area)?.playlist;if(!list)return null;index.set(area,((index.get(area)||0)+1)%list.length);return this.cue(area);},
  reset(){index.clear();}
 };
}
