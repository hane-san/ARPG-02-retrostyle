// Preserve the exact scheduled envelope before a future release, including
// browsers where cancelAndHoldAtTime is absent or throws.
export function envelopeAt(points,time){
 let previous=points[0];
 if(time<=previous.time)return {value:previous.value,curve:'set'};
 for(const next of points.slice(1)){
  if(time<=next.time){
   const fraction=(time-previous.time)/(next.time-previous.time);
   const value=next.curve==='exponential'?previous.value*(next.value/previous.value)**fraction:
    previous.value+(next.value-previous.value)*fraction;
   return {value,curve:next.curve};
  }
  previous=next;
 }
 return {value:previous.value,curve:'set'};
}

export function holdEnvelopeAt(param,points,time){
 const held=envelopeAt(points,time);
 if(typeof param.cancelAndHoldAtTime==='function')try{param.cancelAndHoldAtTime(time);return held.value;}catch{}
 param.cancelScheduledValues(time);
 if(held.curve==='set')param.setValueAtTime(held.value,time);
 else param[held.curve+'RampToValueAtTime'](held.value,time);
 return held.value;
}
