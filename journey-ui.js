// Reuse the existing controls and their listeners, but give this walking country
// a quiet sky and a single, reachable set of tools along the bottom edge.
const ICONS={
 mapBtn:['M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2Z','M9 3v16M15 5v16'],
 soundBtn:['M9 18V5l11-2v13','M9 8l11-2','M9 18c0 2-6 4-6 0s6-4 6 0M20 16c0 2-6 4-6 0s6-4 6 0'],
 homeBtn:['M12 3v4M12 17v4M3 12h4M17 12h4','M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0'],
 helpBtn:['M5 12h.01M12 12h.01M19 12h.01']
};
function icon(id){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 for(const [key,value] of Object.entries({viewBox:'0 0 24 24',width:'21',height:'21',fill:'none',stroke:'currentColor','stroke-width':'1.4','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true'}))svg.setAttribute(key,value);
 for(const d of ICONS[id]){const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',d);svg.append(path);}
 return svg;
}
export function installJourneyUI(){
 const dock=document.querySelector('.dock');
 document.querySelector('meta[name="theme-color"]').content='#eee9da';
 for(const panel of document.querySelectorAll('.overlay'))panel.setAttribute('aria-modal','false');
 document.querySelector('.topbar').hidden=true;
 document.querySelector('.compass').hidden=true;
 document.querySelector('.map-hint').hidden=true;
 dock.querySelector('.discover').hidden=true;
 const placebar=document.createElement('div');placebar.className='journey-placebar';
 placebar.append(document.querySelector('.zone-label'),document.getElementById('vistaBtn'));
 const menu=document.createElement('nav');menu.className='journey-menu';menu.setAttribute('aria-label','旅の道具');
 for(const [id,label] of [['mapBtn','地図'],['soundBtn','音楽'],['homeBtn','自分へ'],['helpBtn','手引き']]){
  const button=document.getElementById(id);button.classList.add('journey-tool');
  if(label){const text=document.createElement('span');text.textContent=label;button.replaceChildren(icon(id),text);}
  const panel={mapBtn:'mapPanel',soundBtn:'musicPanel',helpBtn:'helpPanel'}[id];
  if(panel){button.setAttribute('aria-controls',panel);button.setAttribute('aria-expanded','false');}
  menu.append(button);
 }
 dock.querySelector('.dock-tools').hidden=true;dock.append(placebar,menu);
 const musicPanel=document.getElementById('musicPanel');
 musicPanel.querySelector('label[for="volumeRange"]').firstChild.textContent='音楽の音量 ';
 const soundLabel=document.createElement('label');soundLabel.className='field-label';soundLabel.htmlFor='sfxVolumeRange';
 soundLabel.append('足音・操作音の音量 ');
 const value=document.createElement('span');value.id='sfxVolumeLabel';soundLabel.append(value);
 const range=document.createElement('input');range.id='sfxVolumeRange';range.type='range';range.min='0';range.max='100';range.step='1';
 document.getElementById('sfxToggle').closest('.toggle-row').after(soundLabel,range);
 // Position non-modal cards above the actual dock, including Safari's safe area.
 const resize=()=>document.body.style.setProperty('--journey-dock-height',dock.getBoundingClientRect().height+'px');
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(resize).observe(dock);
 window.addEventListener('resize',resize);resize();
}
