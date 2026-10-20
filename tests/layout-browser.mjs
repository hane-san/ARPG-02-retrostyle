import assert from 'node:assert/strict';

// Display checks beyond the portrait phone (Issue #37): 44px controls at tablet and
// desktop sizes, panels inside narrow screens, notices beside the location card,
// and a 自分へ return that glides instead of jumping a screen in one frame.
const SIZES={phone:{width:320,height:568},landscape:{width:844,height:390},
 tablet:{width:768,height:1024},desktop:{width:1280,height:800}};

// Measure the tappable span through each control's centre, so an invisible tap margin
// counts and a neighbour's margin that steals taps does not.
function smallTargets(page,selector){
 return page.evaluate(selector=>[...document.querySelectorAll(selector)].filter(e=>e.getClientRects().length).flatMap(e=>{
  e.scrollIntoView({block:'center',inline:'center'});
  const r=e.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  const hits=(x,y)=>{const t=document.elementFromPoint(x,y);return !!t&&(t===e||e.contains(t));};
  const span=at=>{let low=0,high=0;while(low<40&&at(-low-1))low++;while(high<40&&at(high+1))high++;return low+high+1;};
  const tall=span(d=>hits(cx,cy+d)),wide=span(d=>hits(cx+d,cy));
  return tall>=43&&wide>=43?[]:[(e.id||e.className)+' '+wide+'x'+tall];
 }),selector);
}

export async function checkLayout(browser,origin){
 for(const [query,names] of [['?mode=classic',['phone','tablet','desktop']],['',['phone','landscape','tablet']]]){
  for(const name of names){
   const size=SIZES[name],tag=(query||'default')+' '+name;
   const page=await browser.newPage({viewport:size,isMobile:name!=='desktop',hasTouch:true}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   // Test-only probe: the translate right after the zoom is the painted camera centre.
   await page.addInitScript(()=>{
    window.cameraTrail=[];let next=false;
    const scale=CanvasRenderingContext2D.prototype.scale,translate=CanvasRenderingContext2D.prototype.translate;
    CanvasRenderingContext2D.prototype.scale=function(x,y){if(this.canvas.id==='worldCanvas')next=true;return scale.call(this,x,y);};
    CanvasRenderingContext2D.prototype.translate=function(x,y){
     if(next&&this.canvas.id==='worldCanvas'){next=false;window.cameraTrail.push({x:-x,y:-y});}
     return translate.call(this,x,y);
    };
   });
   await page.goto(origin+'/'+query);await page.waitForSelector('#worldCanvas');await page.waitForTimeout(300);
   assert.deepEqual(await smallTargets(page,'.nav-btn,.dock button'),[],'header/dock controls reach 44px: '+tag);
   await page.locator('#soundBtn').click();await page.waitForTimeout(150);
   const sheet=await page.locator('#musicPanel .sheet').boundingBox();
   assert.ok(sheet.x>=0&&sheet.x+sheet.width<=size.width+.5,'panel stays inside the screen: '+tag+' '+JSON.stringify(sheet));
   if(query)assert.ok(Math.abs(sheet.x-(size.width-sheet.x-sheet.width))<1.5,'panel gutters are symmetric: '+tag);
   assert.deepEqual(await smallTargets(page,'#musicPanel .close,#musicToggle,#sfxToggle'),[],'panel close and switches reach 44px: '+tag);
   await page.keyboard.press('Escape');await page.waitForTimeout(150);
   if(query&&name==='phone'){
    // Drag away from the explorer, then 自分へ must pass through several painted frames.
    const box=await page.locator('#worldCanvas').boundingBox(),cx=box.x+box.width/2,cy=box.y+box.height/2;
    await page.mouse.move(cx,cy);await page.mouse.down();
    for(let step=1;step<=8;step++)await page.mouse.move(cx-step*35,cy-step*30);
    await page.mouse.up();await page.waitForTimeout(700);
    await page.evaluate(()=>{window.cameraTrail=[];});
    await page.locator('#homeBtn').click();await page.waitForTimeout(1200);
    const trail=await page.evaluate(()=>window.cameraTrail);
    const start=trail[0],end=trail.at(-1),distance=p=>Math.hypot(p.x-end.x,p.y-end.y),total=distance(start);
    assert.ok(total>40,'the drag moved the camera away first: '+total);
    const between=trail.filter(p=>distance(p)>1&&distance(p)<total-1).length;
    assert.ok(between>=3,'自分へ glides over several frames instead of jumping: '+between);
    assert.ok(distance(trail.at(-2))<1,'the glide settles within a second');
   }
   if(query&&name==='tablet'){
    // The world-switch notice is long; it must sit below the location card, not over it.
    const box=await page.locator('#worldCanvas').boundingBox();
    await page.mouse.click(box.x+box.width/2+4*32*1.25,box.y+box.height/2);
    await page.waitForFunction(()=>document.querySelector('#worldTitle')?.textContent==='星風回廊',null,{timeout:12000});
    const overlap=await page.evaluate(()=>{
     const a=document.querySelector('.zone-label').getBoundingClientRect(),b=document.querySelector('#toast').getBoundingClientRect();
     return a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom;
    });
    assert.equal(overlap,false,'the arrival notice leaves the location card readable: '+tag);
   }
   assert.deepEqual(errors,[],'no page errors: '+tag);
   await page.close();
  }
 }
 console.log('Layout passed: 44px controls and panels at phone/landscape/tablet/desktop, gliding 自分へ, readable notices.');
}
