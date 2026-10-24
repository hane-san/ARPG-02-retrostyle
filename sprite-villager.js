// Issue #59: townsfolk share the explorer's 32px proportions (sprite-srpg.js sword unit):
// head 10px, torso 13px, feet resting 4px above the tile edge, same ground shadow.
// Costume colour keeps each speaker recognisable; only the silhouette scale is shared.
export const VILLAGER_SKIN='#f0d5a9';

export function drawVillager(c,x,y,color){
 const rect=(dx,dy,w,h,fill)=>{c.fillStyle=fill;c.fillRect(x+dx,y+dy,w,h);};
 rect(7,26,21,3,'#19363866');
 rect(11,24,4,4,'#2b3944');rect(19,24,4,4,'#2b3944');
 rect(8,14,3,9,'#baaa91');rect(22,14,3,9,'#baaa91');
 rect(10,13,13,11,'#273944');rect(12,13,9,10,color);rect(12,14,3,8,'#ffffff50');
 rect(11,4,10,10,'#344349');rect(12,6,8,7,VILLAGER_SKIN);
 rect(10,3,12,4,'#51494b');
 rect(14,9,2,2,'#2e3a41');rect(18,9,2,2,'#2e3a41');
}
