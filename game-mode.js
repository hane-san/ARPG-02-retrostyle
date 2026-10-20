// The grassland journey is the current entrance; older worlds stay addressable.
export function resolveGameMode(search=''){
 const params=new URLSearchParams(search);
 if(params.get('journey')==='1')return 'journey';
 if(params.get('prototype')==='1')return 'prototype';
 if(params.get('mode')==='classic'||params.get('journey')==='0')return 'classic';
 return 'journey';
}
