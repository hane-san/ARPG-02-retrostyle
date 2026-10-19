import {drawJourneyPanorama} from './journey-art.js';

export function createJourneyView(stage,world){
 const button=document.createElement('button');button.id='vistaBtn';button.className='vista-button';button.hidden=true;
 button.textContent='遠くを眺める';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','vistaCard');
 const card=document.createElement('section');card.id='vistaCard';card.className='vista-card';card.hidden=true;
 card.setAttribute('aria-label','遠くの風景');
 const head=document.createElement('div');head.className='vista-heading';
 const title=document.createElement('strong');title.id='vistaTitle';
 const close=document.createElement('button');close.id='vistaClose';close.type='button';close.textContent='×';close.setAttribute('aria-label','風景を閉じて歩行へ戻る');
 head.append(title,close);
 const canvas=document.createElement('canvas');canvas.id='vistaCanvas';canvas.setAttribute('role','img');
 const caption=document.createElement('p');
 card.append(head,canvas,caption);stage.append(button,card);
 let nearby=null;
 function hide(restoreFocus=false){
  const wasOpen=!card.hidden;card.hidden=true;button.setAttribute('aria-expanded','false');
  if(wasOpen&&restoreFocus)button.focus();
 }
 button.addEventListener('click',()=>{
  if(!nearby)return;
  title.textContent=nearby.title;caption.textContent=nearby.sub+'　閉じれば、すぐにまた歩けます。';
  canvas.setAttribute('aria-label',nearby.kind==='sunset'?'大きな夕日と遠い山並み、湖の光、小さな旅人。':nearby.title+'。遠い山と草原、名のない石、小さな旅人。');
  drawJourneyPanorama(canvas,nearby.kind);card.hidden=false;button.setAttribute('aria-expanded','true');close.focus();
 });
 close.addEventListener('click',()=>hide(true));
 return {
  close(){hide();},
  update(hero,covered=false){
   const next=!covered&&!hero.path.length?world.vistas.find(v=>Math.hypot(v.x-hero.px,v.y-hero.py)<=v.radius):null;
   if(next!==nearby){nearby=next;hide();}
   button.hidden=!nearby||!card.hidden;
   if(nearby)button.textContent=nearby.kind==='sunset'?'夕空を眺める':'遠くを眺める';
  }
 };
}
