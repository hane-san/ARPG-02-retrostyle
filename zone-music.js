// Each original or newly added zone has a curated subset of 68 original tracks.
// Changes happen on entry, not on each frame or a timer.
export const ZONE_PLAYLISTS={
 garden:['0:1','4:1','6:1','9:1','13:1','14:1','17:1','21:1','23:1','19:1'],
 future:['2:1','5:1','10:1','16:1','19:2','22:1','23:2','24:1','14:2','15:2'],
 harbour:['3:1','0:1','8:1','13:1','15:1','18:1','20:1','21:2','14:1','17:2'],
 neon:['5:1','11:1','12:1','16:2','19:1','22:2','24:2','23:2','20:2','18:2'],
 'silk-steppe':['25:1','25:2','26:1','31:1','33:2','27:2','29:2','32:2'],
 'silk-future':['26:1','26:2','25:1','29:2','33:2','16:1','22:1','24:1'],
 'silk-aral':['27:1','27:2','29:2','28:2','33:1','23:1','17:2'],
 'silk-mountain':['28:1','28:2','25:2','33:2','32:2','26:2','22:2'],
 'silk-lake':['29:1','29:2','25:1','26:1','31:2','33:1','23:1'],
 'silk-tea':['30:1','30:2','31:1','32:1','29:1','21:1','18:1'],
 'silk-farms':['31:1','31:2','30:1','25:1','29:1','13:1','20:1'],
 'silk-oasis':['32:1','32:2','30:1','31:1','28:1','18:1','22:1'],
 'silk-canyon':['33:1','33:2','28:1','28:2','29:2','25:2','24:2']
};
export function pickZoneTrack(zoneId,previous=null,random=Math.random){
 const pool=ZONE_PLAYLISTS[zoneId];
 if(!pool)throw new Error('Unknown zone '+zoneId);
 const options=pool.filter(k=>k!==previous);
 return options[Math.min(options.length-1,Math.floor(Math.max(0,Math.min(.99999999,random()))*options.length))];
}
