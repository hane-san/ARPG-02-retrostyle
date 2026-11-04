// The grassland journey is the current entrance; older worlds stay addressable.
export function resolveGameMode(search=''){
 const params=new URLSearchParams(search);
 if(params.get('journey')==='1')return 'journey';
 if(params.get('prototype')==='1')return 'prototype';
 if(params.get('mode')==='classic'||params.get('journey')==='0')return 'classic';
 return 'journey';
}

// #108: the producer selected the composed/dead-zone follower for the current
// pilgrimage. Historical maps keep their own camera; the old follower is still
// available for comparison without persisting a preference or changing saves.
export function useComposedCamera(search=''){
 const p=new URLSearchParams(search);
 return resolveGameMode(search)==='journey'&&p.get('atlas')!=='previous'&&p.get('maze')!=='turns'&&p.get('camera')!=='directional';
}
