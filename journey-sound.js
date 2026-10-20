// Preserve the instantaneous level when a browser lacks cancelAndHoldAtTime.
// AudioParam.value can be stale while a scheduled ramp is running.
export function gainDuringFade(elapsed,seconds){
 if(seconds<=0)return elapsed<0?0:1;
 return Math.max(0,Math.min(1,elapsed/seconds));
}
export function holdFadeAt(param,now,startedAt,seconds){
 const level=gainDuringFade(now-startedAt,seconds);
 if(typeof param.cancelAndHoldAtTime==='function'){
  try{param.cancelAndHoldAtTime(now);return level;}catch{/* Older implementations may throw. */}
 }
 param.cancelScheduledValues(now);
 param.setValueAtTime(level,now);
 return level;
}
