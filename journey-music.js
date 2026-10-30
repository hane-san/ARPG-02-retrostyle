import {PILGRIM_ZONES} from './pilgrimage-world.js';
import {IMPERIAL_SCORE_START as I} from './music.js';
// Each region has a small, intentional set of colours. Scores 0-33 are the original 68 pieces;
// 34-37 are the melancholic drive tracks, 38-39 the uneasy ones and 40-41 the steppe travel
// tracks added on 2026-10-22 for the open, empty-feeling regions.
export const JOURNEY_PLAYLISTS={
 ...Object.fromEntries(PILGRIM_ZONES.map(z=>[z.id,z.music])),
 'journey-confluence':[`${I}:1`,'23:2','29:2'],
 'journey-blackreach':[`${I+1}:1`,`${I+1}:2`,'7:2'],
 'journey-empty-ridge':[`${I+2}:2`,'27:2','37:1'],
 'journey-imperial-remains':[`${I+2}:1`,`${I+2}:2`,'22:2'],
 'journey-living-water':[`${I}:1`,'23:1','9:1'],
 'journey-dry-water':[`${I}:2`,'27:1','38:2'],
 'journey-return-causeway':[`${I+2}:2`,'35:2','36:2'],
 'journey-port':['13:1','14:1','20:1'],
 'journey-steppe':['25:1','31:1','26:1','40:1','41:1'],
 'journey-tea':['30:1','30:2','31:1'],
 'journey-lake':['29:1','29:2','23:1','34:1','35:1','38:1'],
 'journey-salt':['27:1','27:2','30:2','34:2','36:1','38:2','39:1'],
 'journey-pass':['28:1','33:1','28:2','37:1','39:2','40:2','41:2'],
 'journey-sunset':['31:2','29:1','27:1','35:2','36:2'],
 // Contrasting instrument/tempo pools, drawn from the original 68 pieces.
 'journey-canyon':['19:1','24:1','28:2'],
 'journey-highland':['6:1','21:2','33:1'],
 'journey-sky-edge':['31:2','29:1','27:1'],
 'journey-river':['20:1','23:2','29:2'],
 'journey-glass':['16:1','18:2','32:1'],
 'journey-wetlands':['9:2','12:1','31:2'],
 'journey-whitebasin':['27:1','22:2','33:2'],
 // Ruins reuse the existing 68 scores; silence and harmonic contrast are intentional.
 'journey-ancient':['22:2','27:2','33:1'],
 'journey-void':['7:2','19:2','28:2'],
 'journey-drowned':['9:2','23:2','29:2'],
 'journey-sky-ruins':['6:1','21:2','31:2']
};
export function pickJourneyTrack(zone,previous,random=Math.random){
 const pool=JOURNEY_PLAYLISTS[zone];
 if(!pool)throw new Error('Unknown journey music region '+zone);
 if(zone.startsWith('pilgrim-')&&previous!==pool[0])return pool[0];
 // These seven studies have an authored first colour: the paired water melody,
 // stone, distant return motif, then the city in full. Later choices still vary.
 if(['journey-confluence','journey-blackreach','journey-empty-ridge','journey-imperial-remains',
  'journey-living-water','journey-dry-water','journey-return-causeway'].includes(zone)&&previous!==pool[0])return pool[0];
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

// Every accepted arrival, including a return, restores the authored regional cue.
export function pickJourneyArrivalTrack(zone){if(!JOURNEY_PLAYLISTS[zone])throw new Error("Unknown journey music region "+zone);return JOURNEY_PLAYLISTS[zone][0];}
