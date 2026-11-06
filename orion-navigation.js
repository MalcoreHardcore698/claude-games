/* Shared page header. Portal sub-pages keep their heading; every game gets the portal bar:
   [Back][game title] ... [lobby][info][RU|EN]. Existing buttons are moved, never recreated,
   so the handlers each game already bound keep working. */
(()=>{'use strict';
for(const h of document.querySelectorAll('.pageHead:not(.gamePageHead)')){const b=h.querySelector('[data-back]');if(b){b.className='pageBack pageControl';h.prepend(b);h.classList.add('orionPageHeader');}}
const game=document.body.dataset.orionGame,meta={ration:['Последний паёк','Last Ration','run'],catan:['CATAN · Тихие берега','CATAN · Quiet Shores','castle'],casino:['Неоновое казино','Neon Casino','roulette'],svo:['Escape from SVO','Escape from SVO','run'],guess:['Угадай героя','Guess the Hero','user'],quiz:['Викторина','Quiz Night','quiz'],runes:['Руны удачи','Reels & Runes','rune'],tetris:['Общий тетрис','Orbit Blocks','blocks'],codewords:['Шифр','Cipher','key'],chess:['Шахматы','Chess','chess'],battleship:['Морской бой','Battleship','ship'],carcassonne:['Каркассон','Carcassonne','castle']}[game];if(!meta)return;
const paths={roulette:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v6m0 6v6M3 12h6m6 0h6M6 6l4 4m4 4 4 4m0-12-4 4m-4 4-4 4"/>',run:'<circle cx="14" cy="4" r="2"/><path d="m7 11 4-4 4 3 4 1M11 7l-1 7-5 6m5-6 5 2 1 5"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 3-8 8-8s8 3 8 8M6 6h12"/>',quiz:'<circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 0 1 6 0c0 3-3 2-3 5m0 3h.01"/>',rune:'<path d="m12 2 9 5v10l-9 5-9-5V7Z M3 7l9 5 9-5M12 12v10"/>',blocks:'<path d="M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z"/>',key:'<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9m-3-3 3-3m-6 0 3-3"/>',chess:'<path d="M5 21h14M7 18h10l-1-7 3-3-6-6-3 1-3 6 5 1-3 4-2 4Z M13 6h.01"/>',ship:'<path d="m3 13 9 8 9-8-9-4Zm3-1V6h12v6M9 6V3h6v3M2 22l4-1 3 1 3-1 3 1 3-1 4 1"/>',castle:'<path d="M4 22V6h4v4h3V3h3v7h3V6h3v16M2 22h20M10 22v-6h4v6"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-4 2.8-6.5 6.5-6.5s6.5 2.5 6.5 6.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18 13.8c2.2.8 3.5 3 3.5 6.2"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',back:'<path d="m10 5-7 7 7 7M3 12h18"/>'};
const svg=(path,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const head=document.querySelector('.gamePageHead'),back=document.querySelector('#hubLink');if(!head||!back)return;
const embedded=window.parent!==window,post=(type,args={})=>{if(embedded)try{parent.postMessage({svo:1,type,...args},'*');}catch(_){}};
const info=head.querySelector('#bInfo,#infoBtn,#infoButton'),lang=head.querySelector('.seg,.lang'),context=document.getElementById('topTitle');
const en=()=>document.documentElement.lang.startsWith('en');
/* Back + title (left) */
back.hidden=false;back.className='oBack';back.removeAttribute('data-t');back.innerHTML=svg(paths.back)+'<span></span>';
const identity=document.createElement('div');identity.className='oTitle';identity.innerHTML=svg(paths[meta[2]],'oTitleIcon')+'<span class="oTitleText"></span>';if(context){context.className='oContext';identity.appendChild(context);}
const grow=document.createElement('span');grow.className='oGrow';
/* Lobby chip: mirrors the portal chip; in the portal it opens the shared lobby popover. */
const chip=document.createElement('button');chip.type='button';chip.className='oChip';chip.setAttribute('aria-haspopup','dialog');chip.innerHTML='<i class="oDot"></i>'+svg(paths.users)+'<span class="oChipText"></span>';
let lobby={inLobby:false,code:'',n:0};
chip.addEventListener('click',e=>{e.stopPropagation();if(embedded){const r=chip.getBoundingClientRect();post('lobby',{rect:{top:r.top,right:r.right,bottom:r.bottom,left:r.left}});}else location.href='index.html';});
addEventListener('message',e=>{if(e.source!==parent||e.data?.svo!==1)return;const m=e.data;if(m.type==='hello'||m.type==='peers'){const next={inLobby:!!m.inLobby,code:String(m.code||''),n:Array.isArray(m.peers)?m.peers.length:0};if(next.inLobby!==lobby.inLobby||next.code!==lobby.code||next.n!==lobby.n){lobby=next;update();}}});
/* Any press elsewhere in the game closes the portal popover, which cannot see clicks inside this frame. */
if(embedded)document.addEventListener('pointerdown',e=>{if(!chip.contains(e.target))post('lobbyDismiss');},true);
const actions=document.createElement('div');actions.className='oActions';actions.appendChild(chip);
if(info){info.className='oIb oInfo';info.removeAttribute('style');info.innerHTML=svg(paths.info);actions.appendChild(info);
 /* The shared info dialog takes over when the game registered structured content. */
 head.addEventListener('click',e=>{if(!info.contains(e.target)||!window.OrionInfo?.available())return;e.preventDefault();e.stopImmediatePropagation();window.OrionInfo.open();},true);}
let thumb=null;if(lang){lang.className='oSeg';lang.removeAttribute('style');thumb=document.createElement('i');thumb.className='oThumb';thumb.setAttribute('aria-hidden','true');lang.prepend(thumb);lang.querySelectorAll('button').forEach(b=>{b.type='button';});actions.appendChild(lang);}
head.replaceChildren(back,identity,grow,actions);head.classList.remove('top','pageHead','orionPageHeader');head.classList.add('oBar');document.body.classList.add('hasOrionBar');
function placeThumb(){if(!thumb)return;const on=lang.querySelector('button[aria-pressed="true"]');if(!on||!on.offsetWidth){thumb.style.opacity='0';return;}thumb.style.opacity='1';thumb.style.left=on.offsetLeft+'px';thumb.style.width=on.offsetWidth+'px';}
function update(){const english=en();identity.querySelector('.oTitleText').textContent=meta[english?1:0];back.querySelector('span').textContent=english?'Back':'Назад';back.setAttribute('aria-label',english?'Back':'Назад');
 chip.classList.toggle('on',lobby.inLobby);chip.querySelector('.oChipText').textContent=lobby.inLobby?(lobby.code?lobby.code+' · '+lobby.n:String(lobby.n)):(english?'No lobby':'Без лобби');chip.setAttribute('aria-label',(english?'Lobby: ':'Лобби: ')+chip.querySelector('.oChipText').textContent);chip.title=embedded?(english?'Site lobby':'Лобби сайта'):(english?'Open ORION to join a lobby':'Откройте ORION, чтобы войти в лобби');
 if(info){const t=english?'Game guide':'Об игре';info.setAttribute('aria-label',t);info.title=t;}
 if(lang){lang.setAttribute('role','group');lang.setAttribute('aria-label',english?'Language':'Язык');for(const b of lang.querySelectorAll('button')){b.setAttribute('aria-pressed',String(b.textContent.trim().toLowerCase()===(english?'en':'ru')));}requestAnimationFrame(placeThumb);}}
update();new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});addEventListener('resize',placeThumb);document.fonts?.ready.then(placeThumb);
back.addEventListener('click',e=>{if(window.parent===window&&!back.hasAttribute('data-internal-back')){e.preventDefault();if(history.length>1)history.back();else location.href='index.html';}},true);
/* Tell the portal whether this bar is on screen, so it can hide its floating lobby button. */
let shown=null;const report=()=>{const v=!!head.getClientRects().length&&getComputedStyle(head).visibility!=='hidden';if(v!==shown){shown=v;post('header',{visible:v});}};report();setInterval(report,600);
})();
