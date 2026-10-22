// Retro "po-po-po" reading for conversation pages. Pure timing: the caller owns
// the DOM and the sound. Punctuation lingers a little; blips skip silent marks.
export const TYPE_CHARS_PER_SECOND=30;
export const BLIP_EVERY=2,BLIP_MIN_GAP=.06;
const PAUSE={'。':.22,'！':.2,'？':.2,'、':.1,'…':.12,'，':.1,'.':.16,',':.08,'!':.16,'?':.16};
const SILENT=/[\s、。，．,.!?！？…「」『』（）()・ー〜]/;

export function createTyper(text,{cps=TYPE_CHARS_PER_SECOND}={}){
 const chars=[...String(text??'')];
 let shown=0,wait=0,sinceBlip=0,lastBlip=Infinity,voiced=0;
 return {
  get text(){return chars.slice(0,shown).join('');},
  get done(){return shown>=chars.length;},
  // Advance by dt seconds; returns true when this step should sound a blip.
  step(dt){
   if(shown>=chars.length)return false;
   wait-=dt;lastBlip+=dt;let blip=false;
   while(wait<=0&&shown<chars.length){
    const c=chars[shown++];
    wait+=1/cps+(PAUSE[c]||0);
    if(!SILENT.test(c)){
     voiced++;sinceBlip++;
     if((voiced===1||sinceBlip>=BLIP_EVERY)&&lastBlip>=BLIP_MIN_GAP){blip=true;sinceBlip=0;lastBlip=0;}
    }
   }
   return blip;
  },
  finish(){shown=chars.length;wait=0;}
 };
}
