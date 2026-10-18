// Static-first camera: hold its position while walking, adjusting only when the
// player would otherwise leave the visible viewport. Manual panning shares the limit.
export function limitCamera(target,hero,viewport,world){
 const {width,height,zoom}=viewport;
 const hw=Math.max(1,width/(2*zoom)),hh=Math.max(1,height/(2*zoom));
 const wx=world.width,wy=world.height,margin=Math.max(1,Math.min(world.tile*0.65,hw-1,hh-1));
 const heroX=(hero.x+.5)*world.tile,heroY=(hero.y+.5)*world.tile;
 function axis(desired,heroPos,half,mapSize){
  const worldLow=half*2>=mapSize?mapSize/2:half;
  const worldHigh=half*2>=mapSize?mapSize/2:mapSize-half;
  const low=Math.max(worldLow,heroPos-half+margin);
  const high=Math.min(worldHigh,heroPos+half-margin);
  if(low>high)return Math.max(worldLow,Math.min(worldHigh,desired));
  return Math.max(low,Math.min(high,desired));
 }
 return {x:axis(target.x,heroX,hw,wx),y:axis(target.y,heroY,hh,wy)};
}
export function heroVisible(camera,hero,viewport,world){
 const posX=(hero.x+.5)*world.tile,posY=(hero.y+.5)*world.tile;
 return Math.abs(posX-camera.x)<=viewport.width/(2*viewport.zoom)-1 &&
        Math.abs(posY-camera.y)<=viewport.height/(2*viewport.zoom)-1;
}
