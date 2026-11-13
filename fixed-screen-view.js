import {createFixedJourney,fixedLayout,gatePoint,fixedExitTarget,fixedChartSize} from './fixed-screens.js';
import {drawFixedRoom,releaseFixedArt} from './fixed-screen-art.js';
import {fixedSource} from './fixed-journey-data.js';
import {pickJourneyTap} from './journey-tap.js';
import {createAmbienceDirector} from './journey-ambience.js';
import {createAreaPlaylists,areaPieceSeconds} from './fixed-areas.js';
import {buildTrack} from './music.js';
import {featureAt} from './fixed-features.js';

// Own canvas and room-local state: the original world stays intact and paused.
export function createFixedScreenView({stage,paused,audible,onAmbient,onPlace,onTalk,onReturn,onStep,onRead,onCue,onPrepare=()=>{},onRotate=()=>{},listening=()=>false}){
 const canvas=document.createElement('canvas');canvas.id='fixedCanvas';canvas.width=canvas.height=1;canvas.hidden=true;canvas.tabIndex=0;canvas.setAttribute('aria-label','画面切替の旅');canvas.setAttribute('aria-busy','false');stage.append(canvas);
 const c=canvas.getContext('2d',{alpha:false});let screen={w:1,h:1,dpr:1},last=null,paintAt=-Infinity,enteredAt=-Infinity,contact=null,multiple=false,lastCue=null,lastQuiet=false;
 const contacts=new Set(),held=new Set(),latched=new Set(),cancelled=new Set();
 const dirs={ArrowUp:[0,-1],ArrowRight:[1,0],ArrowDown:[0,1],ArrowLeft:[-1,0],w:[0,-1],d:[1,0],s:[0,1],a:[-1,0]};
 // The most recently pressed, still-held direction queues its next tile just
 // before the current one is reached, so walking stays continuous.
 function steer(){
  if(state.transition||paused()||state.hero.arrival)return;const key=[...held].reverse().find(k=>dirs[k]&&!latched.has(k));if(!key)return;
  const hero=state.hero,base=hero.path.length?hero.path[0]:hero,d=dirs[key];if(hero.path.length>1)return;
  if(hero.path.length===1&&Math.hypot(base.x-hero.px,base.y-hero.py)>.45)return;
  const next={x:base.x+d[0],y:base.y+d[1]};if(!state.room.walkable(next.x,next.y)||state.room.gateAt(base.x,base.y))return;
  // Append rather than re-route, so a turn never doubles back mid-tile.
  if(hero.path.length){hero.path.push(next);hero.moving=true;}else state.walkTo(next);
 }
 // The next board's music is asked for as the slide begins, so its loop is
 // prepared and crossfaded while the screen moves rather than after it.
 // While walking out through an exit, the destination's loop is prepared.
 let prepared=null;
 // Music belongs to an area of neighbouring boards. Inside one area, board
 // changes never change the piece; after two loops of actual listening the
 // area's playlist moves on with an ordinary, unhurried crossfade.
 const playlists=createAreaPlaylists(),loopSeconds=new Map();let lastArea=null,areaClock=0;
 const areaCue=r=>playlists.cue(r.area)||r.cue;
 const pieceSeconds=cue=>{if(!loopSeconds.has(cue)){const [id,phase]=cue.split(':').map(Number);loopSeconds.set(cue,buildTrack(id,phase).seconds);}return loopSeconds.get(cue);};
 function prepareExit(){const end=state.hero.path.at(-1),gate=end&&state.room.gateAt(end.x,end.y);if(!gate)return;const to=state.rooms.find(r=>r.id===gate.to);if(!to||areaCue(to)===lastCue&&!!to.quiet===lastQuiet||prepared===to.id)return;prepared=to.id;onPrepare(areaCue(to),!!to.quiet);}
 const cue=r=>{prepared=null;if(r.area!==lastArea){lastArea=r.area;areaClock=0;}const next=areaCue(r);if(next!==lastCue||!!r.quiet!==lastQuiet){lastCue=next;lastQuiet=!!r.quiet;onCue(next,lastQuiet);}};
 function rotate(dt){
  if(!state.active||state.transition||paused()||lastQuiet||!listening()||!lastArea)return;
  areaClock+=dt;if(areaClock<areaPieceSeconds(pieceSeconds(lastCue)))return;
  areaClock=0;const next=playlists.advance(lastArea);if(next&&next!==lastCue){lastCue=next;onRotate(next);}
 }
 const state=createFixedJourney({onRoom:r=>{enteredAt=performance.now();canvas.setAttribute('aria-label','画面切替の旅：'+r.name);onPlace(r);cue(r);paintAt=-Infinity;},onTalk,onReturn,
  onStep:(d,t)=>onStep(d,t==='b'?'+':t==='s'||state.room.land==='stone'||state.room.land==='ridge'?'study-stone':state.room.land==='salt'||state.room.land==='shore'||state.room.dry?'study-silt':t==='g'?'g':'='),onTransition:()=>{held.forEach(k=>latched.add(k));cancel();if(state.transition)cue(state.transition.to);}});
 const water=createAmbienceDirector(state.rooms.flatMap(r=>{const kind=r.dry?'stone':r.quiet?'echo':r.land==='forest'?'wood':r.land==='ridge'?'wind':r.water?'drip':null;return kind?[{id:'fixed-ambient-'+r.id,kind,x:r.col*15+9,y:r.row*15+7}]:[];}));
 const layout=()=>fixedLayout(screen.w,screen.h),project=p=>{const l=layout();return {x:l.x+(p.x+.5)*32*l.scale,y:l.y+(p.y+.5)*32*l.scale};};
 function inspect(item,kind){const p=item.entrance||item;state.walkTo(p,{kind,name:item.name,lines:item.lines});}
 function npc(n){const steps=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:n.x+dx,y:n.y+dy})).filter(p=>state.room.walkable(p.x,p.y)).sort((a,b)=>Math.hypot(a.x-state.hero.x,a.y-state.hero.y)-Math.hypot(b.x-state.hero.x,b.y-state.hero.y));for(const p of steps)if(state.walkTo(p,{kind:'talk',name:n.name,lines:n.lines}))break;}
 function tap(x,y){
  if(paused()){onRead();return;}if(state.transition)return;
  const l=layout(),room=state.room,hero=state.hero;
  const pick=pickJourneyTap({tap:{x,y},toScreen:(x,y)=>project({x,y}),npcs:room.npcs,hero:{px:hero.px,py:hero.py,walking:hero.path.length>0},zoom:l.scale,tile:32});
  if(pick?.kind==='stop'){state.stop();return;}if(pick?.kind==='npc'){npc(pick.item);return;}
  if(room.returnStone){const p=project(room.returnStone),h=project({x:hero.px,y:hero.py}),d=Math.hypot(x-p.x,y-p.y),onStone=hero.x===room.returnStone.x&&hero.y===room.returnStone.y;if(d<=22&&(onStone||d+1<Math.hypot(x-h.x,y-h.y))){inspect(room.returnStone,'return');return;}}
  const self=project({x:hero.px,y:hero.py});if(!hero.path.length&&Math.hypot(x-self.x,y-self.y)<Math.min(14,32*l.scale*.45))return;
  const p={x:Math.floor((x-l.x)/(32*l.scale)),y:Math.floor((y-l.y)/(32*l.scale))};
  // A signpost is read from a neighbouring cell; a glint is stepped onto.
  const found=featureAt(room,p.x,p.y);
  if(found){const arrival={kind:'talk',name:found.name,lines:found.lines};if(found.kind==='glint'){if(state.walkTo({x:found.x,y:found.y},arrival))return;}else{const [fx,fy]=found.cells[0],steps=[[0,1],[1,0],[-1,0],[0,-1]].map(([dx,dy])=>({x:fx+dx,y:fy+dy})).filter(q=>room.walkable(q.x,q.y)).sort((a,b)=>Math.hypot(a.x-hero.x,a.y-hero.y)-Math.hypot(b.x-hero.x,b.y-hero.y));for(const q of steps)if(state.walkTo(q,arrival))return;}}
  if(room.tileAt(p.x,p.y)==='h'){const site=[room.site,...room.props||[]].filter(Boolean).filter(s=>p.x>=s.x&&p.x<s.x+s.w&&p.y>=s.y&&p.y<s.y+s.h).sort((a,b)=>a.w-b.w)[0];if(site){inspect(site,'talk');return;}}
  const house=room.house;
  if(house&&p.x>=house.x&&p.x<house.x+house.w&&p.y>=house.y&&p.y<house.y+house.h){inspect({...house,name:house.landmark?'青い屋根の家':'窓の開いた家',lines:[house.landmark?'下から見ていた屋根の下に、洗った器が並んでいる。窓の向こうを、風が通り抜ける。':'軒下には、干したばかりの布が揺れている。']},'talk');return;}
  const exit=fixedExitTarget(room,x,y,l);if(exit){state.walkTo(exit);return;}
  if(state.walkTo(p))return;
  // A tap on a bush, a rock, water or the surrounding land walks up to the
  // nearest open ground beside it, like stepping up to an obstacle. The outer
  // edge cells stay inert, so a blocked edge never becomes an exit.
  if(p.x<1||p.y<1||p.x>13||p.y>13)return;
  const near=[];for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const q={x:p.x+dx,y:p.y+dy};if((dx||dy)&&room.walkable(q.x,q.y)&&!room.gateAt(q.x,q.y))near.push(q);}
  near.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)||Math.hypot(a.x-hero.x,a.y-hero.y)-Math.hypot(b.x-hero.x,b.y-hero.y));
  for(const q of near)if(state.walkTo(q))return;
 }
 function cancel(){const ids=[...contacts];contact=null;contacts.clear();multiple=false;for(const id of ids){cancelled.add(id);if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);}while(cancelled.size>32)cancelled.delete(cancelled.values().next().value);}
 document.addEventListener('pointerdown',e=>cancelled.delete(e.pointerId),true);
 window.addEventListener('click',e=>{if(cancelled.delete(e.pointerId)){e.preventDefault();e.stopImmediatePropagation();}},true);
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);contacts.add(e.pointerId);if(contacts.size>1){multiple=true;contact=null;return;}if(!state.transition){const r=canvas.getBoundingClientRect();contact={id:e.pointerId,x:e.clientX-r.left,y:e.clientY-r.top,generation:state.generation};}});
 canvas.addEventListener('pointerup',e=>{const a=contact,r=canvas.getBoundingClientRect();contacts.delete(e.pointerId);contact=null;if(a&&!multiple&&a.id===e.pointerId&&a.generation===state.generation&&Math.hypot(e.clientX-r.left-a.x,e.clientY-r.top-a.y)<=9)tap(e.clientX-r.left,e.clientY-r.top);if(!contacts.size)multiple=false;});
 canvas.addEventListener('pointercancel',cancel);canvas.addEventListener('lostpointercapture',e=>{if(contacts.has(e.pointerId))cancel();});canvas.addEventListener('contextmenu',e=>e.preventDefault());
 window.addEventListener('blur',()=>{cancel();held.clear();latched.clear();});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancel();held.clear();latched.clear();}});
 window.addEventListener('keyup',e=>{held.delete(e.key);latched.delete(e.key);});
 const view={
  get active(){return state.active;},get areaCue(){return lastCue;},get room(){return state.room;},get transitioning(){return !!state.transition;},canvas,
  enter(){cancel();held.clear();latched.clear();lastCue=null;lastQuiet=false;lastArea=null;areaClock=0;state.enter();canvas.hidden=false;document.body.classList.add('fixed-sample');const r=stage.getBoundingClientRect();view.resize({...screen,w:r.width,h:r.height});last=null;paintAt=-Infinity;canvas.focus({preventScroll:true});},
  leave(){releaseFixedArt(c);state.leave();water.update({x:0,y:0},performance.now(),false);onAmbient([],[]);cancel();held.clear();latched.clear();canvas.hidden=true;canvas.setAttribute('aria-busy','false');canvas.width=canvas.height=1;document.body.classList.remove('fixed-sample');},
  resize(value){screen={...value};cancel();if(state.active){canvas.width=Math.max(1,Math.round(screen.w*screen.dpr));canvas.height=Math.max(1,Math.round(screen.h*screen.dpr));state.finishTransition();}paintAt=-Infinity;},
  projectHero(){return project({x:state.hero.px,y:state.hero.py});},
  key(e){
   if(e.key==='Enter'&&state.room.returnStone&&Math.hypot(state.hero.x-state.room.returnStone.x,state.hero.y-state.room.returnStone.y)<1.6){e.preventDefault();inspect(state.room.returnStone,'return');return;}
   const d=dirs[e.key];if(!d)return;e.preventDefault();if(state.transition){held.add(e.key);latched.add(e.key);return;}
   // Auto-repeat is ignored: a held key is continued in frame() without the
   // stop-start of waiting for the next repeat event at every tile.
   if(e.repeat)return;held.delete(e.key);held.add(e.key);
   // Mid-step, finish the current tile and turn from there (or turn straight
   // back), instead of snapping back to the last tile to re-route.
   const hero=state.hero,base=hero.path[0];
   if(base&&!state.room.gateAt(base.x,base.y)){const next={x:base.x+d[0],y:base.y+d[1]};hero.arrival=null;if(next.x===hero.x&&next.y===hero.y)hero.path=[{x:hero.x,y:hero.y}];else hero.path=state.room.walkable(next.x,next.y)?[base,next]:[base];hero.moving=true;return;}
   state.walkTo({x:hero.x+d[0],y:hero.y+d[1]});
  },
  frame(now,reduced){
   const dt=last===null?0:(now-last)/1000;last=now;if(state.active){steer();prepareExit();rotate(Math.min(dt,.25));}state.update(dt,{paused:paused(),reduced});
   if(!state.active)return;
   const sound=water.update({x:state.room.col*15+state.hero.px,y:state.room.row*15+state.hero.py},now,!paused()&&!state.transition&&audible());onAmbient(sound.levels,sound.events);
   canvas.setAttribute('aria-busy',String(!!state.transition||state.hero.path.length>0));
   const frame=state.transition?1000/60:state.hero.moving?1000/45:1000/24;if(now-paintAt<frame)return;paintAt=now;
   c.setTransform(screen.dpr,0,0,screen.dpr,0,0);c.fillStyle='#b6d5d7';c.fillRect(0,0,screen.w,screen.h);
   // Exit names rise on arrival and near their exit, then settle away.
   const since=now-enteredAt,end=state.hero.path.at(-1),gate=end&&state.room.gateAt(end.x,end.y),stone=state.hero.arrival?.kind==='return';
   const labels={arrival:reduced?(since<2600?1:0):Math.max(0,Math.min(1,1-(since-1800)/900)),target:gate?gate.direction:stone?'stone':null};
   drawFixedRoom(c,state.room,state.hero,screen,reduced?0:now,{rooms:state.rooms,transition:state.transition,destination:state.hero.path.at(-1),labels});
  },
  drawMap(mini,zoneList){
   const chart=fixedChartSize();mini.width=810;mini.height=mini.width*chart.h/chart.w;mini.style.aspectRatio=String(chart.w/chart.h);mini.style.setProperty('--atlas-aspect',chart.w/chart.h);const g=mini.getContext('2d'),s=mini.width/chart.w;g.clearRect(0,0,mini.width,mini.height);g.fillStyle='#c9dce0';g.fillRect(0,0,mini.width,mini.height);
   const mapWidth=Math.max(1,mini.getBoundingClientRect().width),fontScale=mini.width/mapWidth,font=Math.min(11,Math.max(8,(mapWidth/10-3)/2));
   // Terrain first, then a light veil over boards that are not one walk away,
   // so the current board and its exits read before the other 95 names.
   const near=new Set([state.room.id,...Object.values(state.room.connections)]);
   for(const r of state.rooms){const palette=fixedSource(r.sourceIndex??23).palette;for(let y=0;y<15;y++)for(let x=0;x<15;x++){const t=r.tileAt(x,y);if(t===' ')continue;g.fillStyle=t==='r'?'#496875':t==='w'?palette[2]:['h','t','d','o'].includes(t)?palette[3]:['=','s','b'].includes(t)?palette[1]:palette[0];g.fillRect((r.col*15+x)*s,(r.row*15+y)*s,s+.3,s+.3);}if(!near.has(r.id)){g.fillStyle='#e9eee666';g.fillRect(r.col*15*s,r.row*15*s,15*s,15*s);}}
   for(const id of near){const r=state.rooms.find(a=>a.id===id),current=id===state.room.id;g.lineWidth=(current?3:1.5)*fontScale;g.strokeStyle=current?'#2f5a62':'#6f938cbb';const inset=g.lineWidth/2;g.strokeRect(r.col*15*s+inset,r.row*15*s+inset,15*s-inset*2,15*s-inset*2);}
   for(const r of state.rooms){if(mapWidth<220&&r.id!==state.room.id)continue;const strong=near.has(r.id),size=font*fontScale;g.font=`${strong?'700 ':''}${size}px system-ui`;g.textAlign='center';g.textBaseline='top';g.lineWidth=2.5*fontScale;g.strokeStyle='#edf0e1';const label=r.chartName.slice(0,2),half=g.measureText(label).width/2+2*fontScale,labelX=Math.max(half,Math.min(mini.width-half,(r.col*15+7.5)*s)),labelY=r.row*15*s+2*fontScale;g.strokeText(label,labelX,labelY);g.fillStyle=strong?'#24474e':'#3d646ccc';g.fillText(label,labelX,labelY);}
   g.textBaseline='alphabetic';
   const hx=(state.room.col*15+state.hero.px+.5)*s,hy=(state.room.row*15+state.hero.py+.5)*s;g.fillStyle='#fae5a1';g.strokeStyle='#395f6b';g.lineWidth=2*fontScale;g.beginPath();g.arc(hx,hy,5*fontScale,0,Math.PI*2);g.fill();g.stroke();g.fillStyle='#395f6b';g.beginPath();g.arc(hx,hy,1.6*fontScale,0,Math.PI*2);g.fill();
   // Exits in compass order, with an arrow; the room name is never split from it.
   const arrows={N:'↑',E:'→',S:'↓',W:'←'};zoneList.replaceChildren();for(const d of ['N','E','S','W'].filter(d=>state.room.connections[d])){const id=state.room.connections[d],b=document.createElement('button');b.dataset.fixedExit=d;b.textContent=arrows[d]+' '+state.rooms.find(r=>r.id===id).name;b.setAttribute('aria-label',{N:'北',E:'東',S:'南',W:'西'}[d]+'、'+state.rooms.find(r=>r.id===id).name+'へ歩く');b.addEventListener('click',()=>{state.walkTo(gatePoint(d,state.room));document.querySelector('#mapPanel [data-close]').click();});zoneList.append(b);}
  },
  mapTap(x,y,mini){const r=mini.getBoundingClientRect(),chart=fixedChartSize(),wx=(x-r.left)/r.width*chart.w,wy=(y-r.top)/r.height*chart.h,col=Math.floor(wx/15),row=Math.floor(wy/15),target=state.rooms.find(a=>a.col===col&&a.row===row);if(!target)return;if(target===state.room)state.walkTo({x:Math.floor(wx)%15,y:Math.floor(wy)%15});else{const d=Object.keys(state.room.connections).find(d=>state.room.connections[d]===target.id);if(d)state.walkTo(gatePoint(d,state.room));}}
 };
 return view;
}
