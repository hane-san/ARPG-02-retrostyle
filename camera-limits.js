// Static-first camera: hold its position while walking, adjusting only when the
// player would otherwise leave the visible viewport. Manual panning shares the limit.
export function limitCamera(target,hero,viewport,world,marginTiles=.65){
 const {width,height,zoom}=viewport;
 const hw=Math.max(1,width/(2*zoom)),hh=Math.max(1,height/(2*zoom));
 const wx=world.width,wy=world.height,margin=Math.max(1,Math.min(world.tile*marginTiles,hw-1,hh-1));
 const heroX=(hero.x+.5)*world.tile,heroY=(hero.y+.5)*world.tile;
 function axis(desired,heroPos,half,mapSize){
  const worldLow=half*2>=mapSize?mapSize/2:half;
  const worldHigh=half*2>=mapSize?mapSize/2:mapSize-half;
  const low=Math.max(worldLow,heroPos-half+margin);
  const high=Math.min(worldHigh,heroPos+half-margin);
  // At the world border the requested sprite margin cannot coexist with the
  // no-outside-world rule. Anchor nearest to the hero, never to the drag target.
  if(low>high)return Math.max(worldLow,Math.min(worldHigh,heroPos));
  return Math.max(low,Math.min(high,desired));
 }
 return {x:axis(target.x,heroX,hw,wx),y:axis(target.y,heroY,hh,wy)};
}
export function heroVisible(camera,hero,viewport,world){
 const posX=(hero.x+.5)*world.tile,posY=(hero.y+.5)*world.tile;
 return Math.abs(posX-camera.x)<=viewport.width/(2*viewport.zoom)-1 &&
        Math.abs(posY-camera.y)<=viewport.height/(2*viewport.zoom)-1;
}

// Recreates the gentle response of the original camera (approximately 6/s)
// but keeps normal walking static, only easing when the actor nears a screen edge.
export function easeEdgeCamera(current,hero,viewport,world,dt){
 const lead=limitCamera(current,hero,viewport,world,2.15);
 const ease=1-Math.exp(-Math.max(0,Math.min(dt,.12))*6);
 const eased={x:current.x+(lead.x-current.x)*ease,
              y:current.y+(lead.y-current.y)*ease};
 // A loose final safety boundary guarantees the player stays on-screen,
 // including at extreme zoom and map corners.
 return limitCamera(eased,hero,viewport,world,.08);
}
