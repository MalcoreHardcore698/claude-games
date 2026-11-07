/* Stable lobby content and the same invitation controls for every recent game. */
(()=>{'use strict';
function paint(el,html){if(!el||el._orionMarkup===html)return false;el._orionMarkup=html;el.innerHTML=html;return true;}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plane='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Zm0 0L11 13"/></svg>';
function invites(party,lang='ru'){
 const roster=document.getElementById('roomPlayers');if(!roster)return;let box=document.getElementById('roomInvites');
 if(!box){box=document.createElement('div');box.id='roomInvites';box.className='roomInvites';roster.after(box);box.onclick=e=>{const b=e.target.closest('[data-room-invite]');if(b&&party.invite(b.dataset.roomInvite)){b.disabled=true;setTimeout(()=>{if(b.isConnected)b.disabled=false;},4000);}};}
 const show=party.occupancy()<party.capacity()&&party.embedded&&party.inLobby&&party.isHost()&&!party.solo&&party.state?.phase==='lobby';box.hidden=!show;if(!show)return;
 const en=lang==='en',seated=new Set(party.state.players.map(p=>p.l)),others=party.peers.filter(p=>p.label!==party.me&&!seated.has(p.label));
 paint(box,`<h3>${en?'Invite to the table':'Позвать за стол'}</h3>`+(others.length?others.map(p=>`<div class="roomRow"><span>${esc(p.name|| (en?'Player':'Игрок'))}<small>${p.ig?(en?'Already playing':'Уже играет'):(en?'In the site lobby':'В лобби сайта')}</small></span><button type="button" data-room-invite="${esc(p.label)}" ${p.ig?'disabled':''}>${plane}<span>${en?'Invite':'Позвать'}</span></button></div>`).join(''):`<p class="hint">${en?'Everyone in the lobby is seated.':'Все участники лобби уже за столом.'}</p>`));
}
function slots(s,max,lang='ru'){const en=lang==='en',ps=s.players||[],bots=Math.max(0,s.settings?.bots||0),count=ps.length+bots;return `<div class="roomSlotHeader">${en?'Room slots':'Слоты комнаты'} <b>${count} / ${max}</b></div><div class="roomSlots">`+Array.from({length:max},(_,i)=>{const p=ps[i],bot=!p&&i<ps.length+bots;return `<div class="roomSlot ${p||bot?'occupied':'vacant'}"><b>${i+1}</b><span>${p?esc(p.n):bot?(en?'Computer':'Компьютер'):(en?'Empty slot':'Свободное место')}</span>${p?.l===s.host?'<small>♛</small>':''}</div>`;}).join('')+'</div>';}
window.OrionRoomUI={paint,invites,slots};
})();
