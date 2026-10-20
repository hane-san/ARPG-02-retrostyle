// Existing scores only. Each region has a small, intentional set of colours.
export const JOURNEY_PLAYLISTS={
 'journey-port':['13:1','14:1','20:1'],
 'journey-steppe':['25:1','31:1','26:1'],
 'journey-tea':['30:1','30:2','31:1'],
 'journey-lake':['29:1','29:2','23:1'],
 'journey-salt':['27:1','27:2','30:2'],
 'journey-pass':['28:1','33:1','28:2'],
 'journey-sunset':['31:2','29:1','27:1']
};
export function pickJourneyTrack(zone,previous,random=Math.random){
 const pool=JOURNEY_PLAYLISTS[zone];
 if(!pool)throw new Error('Unknown journey music region '+zone);
 const choices=pool.filter(key=>key!==previous);
 return choices[Math.floor(Math.max(0,Math.min(.999999,random()))*choices.length)];
}

// Location text changes immediately. Music requires 2.2s continuously inside
// the new region AND at least 12s since the last accepted region. Update while
// standing still as well as walking; no extra audio nodes or timers are created.
export function createJourneyMusicDirector({settleMs=2200,minHoldMs=12000}={}){
 let current=null,candidate=null,since=0,changed=-Infinity;
 return {
  update(zone,now){
   if(!JOURNEY_PLAYLISTS[zone])throw new Error('Unknown journey music region '+zone);
   if(current===null){current=zone;changed=now;return zone;}
   if(zone===current){candidate=null;return null;}
   if(zone!==candidate){candidate=zone;since=now;}
   if(now-since<settleMs||now-changed<minHoldMs)return null;
   current=candidate;candidate=null;changed=now;return current;
  }
 };
}
