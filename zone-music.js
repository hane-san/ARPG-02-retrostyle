// Every zone has its own curated subset of the 50 original scores.
// Changes happen on entry, not on each frame or a timer.
export const ZONE_PLAYLISTS={
 garden:['0:1','4:1','6:1','9:1','13:1','14:1','17:1','21:1','23:1','19:1'],
 future:['2:1','5:1','10:1','16:1','19:2','22:1','23:2','24:1','14:2','15:2'],
 harbour:['3:1','0:1','8:1','13:1','15:1','18:1','20:1','21:2','14:1','17:2'],
 neon:['5:1','11:1','12:1','16:2','19:1','22:2','24:2','23:2','20:2','18:2']
};
export function pickZoneTrack(zoneId,previous=null,random=Math.random){
 const pool=ZONE_PLAYLISTS[zoneId];
 if(!pool)throw new Error('Unknown zone '+zoneId);
 const options=pool.filter(k=>k!==previous);
 return options[Math.min(options.length-1,Math.floor(Math.max(0,Math.min(.99999999,random()))*options.length))];
}
