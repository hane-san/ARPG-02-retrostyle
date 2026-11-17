import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';

export async function checkFixedObjectShapes(browser,origin){
 const p=await browser.newPage({viewport:{width:390,height:844}});await p.goto(origin);await p.locator('#fixedCanvas').waitFor();await p.clock.install();await p.clock.pauseAt(await p.evaluate(()=>Date.now()+100));
 const report=await p.evaluate(async()=>{
  const {makeFixedRooms,fixedLayout}=await import('./fixed-screens.js'),{drawFixedRoom}=await import('./fixed-screen-art.js'),{journeySite}=await import('./fixed-journey-art.js'),{drawFinished}=await import('./fixed-sprite-finish.js'),{fixedObjectPadding,fixedObjectNeedsContactShadow}=await import('./fixed-object-art.js'),rooms=makeFixedRooms(),get=id=>rooms.find(r=>r.id===id);
  const canvas=()=>{const c=document.createElement('canvas');c.width=768;c.height=1280;const g=c.getContext('2d',{willReadFrequently:true});g.translate(128,700);return {c,g};};
  // A real cast shadow must not turn into an opaque rectangular plinth.
  const a=canvas(),b=canvas(),paint=g=>{g.fillStyle='rgba(60,80,70,.15)';g.fillRect(5,30,50,8);g.fillStyle='#8b9c7c';g.fillRect(20,10,18,23);};
  paint(a.g);drawFinished(b.g,{}, {x:0,y:0,w:64,h:48},paint,0,{shadow:false,finish:'stone'});
  const shadow=[a.g.getImageData(138,735,1,1).data[3],b.g.getImageData(138,735,1,1).data[3]];
  const bowl=get('empty-basin').props.find(s=>s.form==='bowl')||get('empty-basin').site,rawBowl=canvas(),finishedBowl=canvas(),bowlBox={x:bowl.x*32,y:bowl.y*32,w:bowl.w*32,h:bowl.h*32};journeySite(rawBowl.g,bowl,0);drawFinished(finishedBowl.g,bowl,bowlBox,(g,t)=>journeySite(g,bowl,t),0,{finish:'stone',padding:fixedObjectPadding(bowl),shadow:fixedObjectNeedsContactShadow(bowl)});
  const sx=Math.round(128+bowlBox.x+10),sy=Math.round(700+bowlBox.y+bowlBox.h+2),sourceShadow=[rawBowl.g.getImageData(sx,sy,1,1).data[3],finishedBowl.g.getImageData(sx,sy,1,1).data[3]];
  const padding=[];
  for(const id of ['windmill-hill','flour-bags','gold-windmill','night-distribution'])for(const angle of [0,Math.PI/4,Math.PI/2,Math.PI,Math.PI*1.5]){
   const s=get(id).site,box={x:s.x*32,y:s.y*32,w:s.w*32,h:s.h*32},pad=fixedObjectPadding(s),{c,g}=canvas();journeySite(g,s,angle*16000);const data=g.getImageData(0,0,768,1280).data;let outside=0;
   for(let i=3;i<data.length;i+=4)if(data[i]>6){const n=(i-3)/4,x=n%768-128,y=Math.floor(n/768)-700;if(x<box.x-pad.left||x>=box.x+box.w+pad.right||y<box.y-pad.top||y>=box.y+box.h+pad.bottom)outside++;}
   padding.push({id,angle,outside});c.width=1;
  }
  const tall=canvas(),s=get('night-distribution').site,box={x:s.x*32,y:s.y*32,w:s.w*32,h:s.h*32};drawFinished(tall.g,s,box,(g,t)=>journeySite(g,s,t),0,{padding:fixedObjectPadding(s),finish:'stone'});
  const highContour=tall.g.getImageData(128+box.x-1,700+box.y-500,1,1).data[3];
  // Elevated sails may overhang a board while staying inside a wide viewport.
  const front=document.createElement('canvas');front.width=844;front.height=316;const fc=front.getContext('2d'),image=fc.drawImage,l=fixedLayout(844,316);let overhang=0;
  fc.drawImage=function(source,...args){if(source.id==='fixedTerrainCanvas'){const d=source.getContext('2d').getImageData(0,0,source.width,source.height).data;for(let y=0;y<l.y;y++)for(let x=0;x<l.x;x++)if(d[(y*source.width+x)*4+3]>5)overhang++;}return image.call(this,source,...args);};
  drawFixedRoom(fc,get('windmill-hill'),{px:7,py:11,stride:0},{w:844,h:316,dpr:1},0,{rooms});
  const connected=(data,start,end)=>{
   const W=768,H=1280,at=([x,y])=>Math.floor(y)*W+Math.floor(x),first=at(start),goal=at(end),seen=new Uint8Array(W*H),q=new Uint32Array(W*H);let head=0,tail=0;
   if(data[first*4+3]<80||data[goal*4+3]<80)return false;q[tail++]=first;seen[first]=1;
   while(head<tail){const k=q[head++];if(k===goal)return true;const x=k%W,y=Math.floor(k/W);for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]]){const xx=x+dx,yy=y+dy,n=yy*W+xx;if(xx>=0&&yy>=0&&xx<W&&yy<H&&!seen[n]&&data[n*4+3]>=80){seen[n]=1;q[tail++]=n;}}}return false;
  };
  const joints=[];
  for(const id of ['reed-walk','fog-coast','terraced-fields','lily-rest','river-mill'])for(const time of id==='river-mill'?[0,9000,17000,31000]:[0]){
   const s=get(id).site,{c,g}=canvas(),w=s.sourceW*32,h=s.sourceH*32,point=([x,y])=>[128+s.x*32+x*s.scale,700+s.y*32+y*s.scale];journeySite(g,s,time);let from,to;
   if(s.form==='se-shelter'){from=[w/2,-20];to=[s.solid[0].w*16,s.solid[0].y*32+16];}
   else if(s.form==='west-terrace'){from=[32,h-120];to=[32,h-32];}
   else if(s.form==='shore-bench'){from=[w/2,h-38];to=[12,h-9];}
   else{from=[w+40,20];to=[w/2,h*.48];}
   joints.push({id,time,connected:connected(g.getImageData(0,0,768,1280).data,point(from),point(to))});c.width=1;
  }
  const people=[];
  for(const [w,h]of [[320,477],[390,753]])for(const id of ['wet-temple','dry-temple'])for(const [x,y]of [[7,4],[7,6]]){
   const room=get(id),layout=fixedLayout(w,h),render=hero=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');drawFixedRoom(g,room,hero,{w,h,dpr:1},1500,{rooms});return g.getImageData(Math.round(layout.x+x*32*layout.scale),Math.round(layout.y+y*32*layout.scale),Math.floor(32*layout.scale),Math.floor(32*layout.scale)).data;};
   const a=render(null),b=render({x,y,px:x,py:y,stride:0});let visible=0;for(let i=0;i<a.length;i+=4)if(Math.max(...[0,1,2].map(k=>Math.abs(a[i+k]-b[i+k])))>3)visible++;people.push({w,h,id,x,y,visible});
  }
  return {shadow,sourceShadow,padding,highContour,overhang,joints,people};
 });
 mkdirSync('test-results/fixed-object-shapes',{recursive:true});writeFileSync('test-results/fixed-object-shapes/report.json',JSON.stringify(report,null,2));
 assert.ok(Math.abs(report.shadow[0]-report.shadow[1])<=1,'a faint cast shadow keeps its alpha: '+report.shadow);
 assert.ok(report.sourceShadow[0]>0&&Math.abs(report.sourceShadow[0]-report.sourceShadow[1])<=1,'a real prop retains one original shadow: '+report.sourceShadow);
 assert.ok(report.padding.every(r=>r.outside===0),'all rotating sails and the tall beam fit their effect padding: '+JSON.stringify(report.padding.filter(r=>r.outside)));
 assert.ok(report.highContour>20,'the high pier receives its contour above the former crop');assert.ok(report.overhang>20,'a visible sail is not cut at the board edge');
 for(const j of report.joints)assert.equal(j.connected,true,'connected structural pieces: '+JSON.stringify(j));
 for(const p of report.people)assert.ok(p.visible>100,'the traveller remains visible on the courtyard floor: '+JSON.stringify(p));
 await p.close();console.log('Atlas object shapes: cast shadows, animated extents, sail overhang, structural joints and courtyard people passed.');
}
