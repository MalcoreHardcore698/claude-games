/* Shared game guide dialog. A game describes its rules as data (tabs of typed blocks);
   this module renders them with one typographic system that follows the game's theme tokens.

   Content: window.OrionInfoSpec = lang => ({kicker,title,lead,facts:[{v,l}],tabs:[{id,label,icon,blocks}],onClose})
   Blocks: {p} {lead} {h} {steps:[{t,d}]} {list:[]} {keys:[{k:[],d}]} {cards:[{icon|iconHtml,t,d,meta}]}
           {acc:[{t,icon,d|blocks,meta}]} {note,tone:'tip'|'warn'|'info'} {table:{head,rows}} {html}
   Inline text: **bold**, `key` (rendered as a key cap). Everything else is escaped. */
(()=>{'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inline=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/`(.+?)`/g,'<kbd>$1</kbd>').replace(/\n/g,'<br>');
const lang=()=>document.documentElement.lang.startsWith('en')?'en':'ru';
const icons={close:'<path d="m6 6 12 12M18 6 6 18"/>',chev:'<path d="m6 9 6 6 6-6"/>',tip:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z"/>',warn:'<path d="M12 3 2 20h20Z M12 10v4m0 3h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>'};
const svg=(k,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[k]}</svg>`;
const game=()=>document.body.dataset.orionGame||'page';
let root=null,box=null,current=null,activeTab=null,lastFocus=null,uid=0;

function block(b){
 if(b==null)return'';if(typeof b==='string')return`<p class="oiP">${inline(b)}</p>`;
 if(b.html!=null)return`<div class="oiHtml">${b.html}</div>`;
 if(b.lead!=null)return`<p class="oiLead">${inline(b.lead)}</p>`;
 if(b.p!=null)return`<p class="oiP">${inline(b.p)}</p>`;
 if(b.h!=null)return`<h3 class="oiH">${inline(b.h)}</h3>`;
 if(b.note!=null){const tone=b.tone||'tip';return`<aside class="oiNote oiTone-${tone}">${svg(tone==='warn'?'warn':tone==='info'?'info':'tip','oiNoteIcon')}<div>${b.title?`<b class="oiNoteTitle">${inline(b.title)}</b>`:''}${inline(b.note)}</div></aside>`;}
 if(b.steps)return`<ol class="oiSteps">${b.steps.map((s,i)=>`<li><span class="oiStepN">${i+1}</span><div><b class="oiStepT">${inline(s.t)}</b>${s.d?`<p>${inline(s.d)}</p>`:''}</div></li>`).join('')}</ol>`;
 if(b.list)return`<ul class="oiList">${b.list.map(x=>`<li>${inline(x)}</li>`).join('')}</ul>`;
 if(b.keys)return`<dl class="oiKeys">${b.keys.map(k=>`<div><dt>${(Array.isArray(k.k)?k.k:[k.k]).map(x=>`<kbd>${esc(x)}</kbd>`).join('<span class="oiPlus">/</span>')}</dt><dd>${inline(k.d)}</dd></div>`).join('')}</dl>`;
 if(b.cards)return`<div class="oiCards${b.compact?' compact':''}">${b.cards.map(c=>`<div class="oiCard">${c.iconHtml||c.icon?`<span class="oiCardIcon">${c.iconHtml||esc(c.icon)}</span>`:''}<div><b class="oiCardT">${inline(c.t)}</b>${c.meta?`<span class="oiMeta">${inline(c.meta)}</span>`:''}${c.d?`<p>${inline(c.d)}</p>`:''}</div></div>`).join('')}</div>`;
 if(b.acc)return`<div class="oiAccs">${b.acc.map((a,i)=>`<details class="oiAcc"${a.open||(b.open===i)?' open':''}><summary>${a.iconHtml||a.icon?`<span class="oiAccIcon">${a.iconHtml||esc(a.icon)}</span>`:''}<span class="oiAccT">${inline(a.t)}</span>${a.meta?`<span class="oiMeta">${inline(a.meta)}</span>`:''}${svg('chev','oiChev')}</summary><div class="oiAccBody">${a.blocks?a.blocks.map(block).join(''):`<p class="oiP">${inline(a.d)}</p>`}</div></details>`).join('')}</div>`;
 if(b.table){const t=b.table;return`<div class="oiTableWrap"><table class="oiTable"><thead><tr>${t.head.map(h=>`<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(r=>`<tr>${r.map((c,i)=>`<td${i?'':' class="oiFirst"'}>${typeof c==='object'&&c?.html!=null?c.html:inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
 return'';
}
function spec(){const s=window.OrionInfoSpec;try{return typeof s==='function'?s(lang()):s;}catch(e){console.error(e);return null;}}
function build(){root=document.createElement('div');root.className='oiRoot';root.hidden=true;root.innerHTML='<div class="oiScrim" data-oi-close></div><section class="oiBox" role="dialog" aria-modal="true"><div class="oiHead"></div><nav class="oiTabs" role="tablist"></nav><div class="oiBody" tabindex="-1"></div></section>';document.body.appendChild(root);box=root.querySelector('.oiBox');
 root.addEventListener('click',e=>{if(e.target.closest('[data-oi-close]'))close();const tab=e.target.closest('[data-oi-tab]');if(tab)select(tab.dataset.oiTab,true);});
 root.querySelector('.oiTabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=[...root.querySelectorAll('[data-oi-tab]')],i=tabs.findIndex(t=>t.dataset.oiTab===activeTab);const n=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowLeft'?-1:1)+tabs.length)%tabs.length;select(tabs[n].dataset.oiTab,true);tabs[n].focus();});
 addEventListener('resize',placeInk);
}
function render(){const s=current=spec();if(!s)return false;if(!root)build();const id=++uid,head=root.querySelector('.oiHead'),closeLabel=lang()==='en'?'Close':'Закрыть';
 box.setAttribute('aria-labelledby','oiTitle'+id);
 head.innerHTML=`${s.kicker?`<p class="oiKicker">${inline(s.kicker)}</p>`:''}<h2 class="oiTitle" id="oiTitle${id}">${inline(s.title||'')}</h2>${s.lead?`<p class="oiHeadLead">${inline(s.lead)}</p>`:''}${s.facts?.length?`<ul class="oiFacts">${s.facts.map(f=>`<li><b>${inline(f.v)}</b><span>${inline(f.l)}</span></li>`).join('')}</ul>`:''}<button type="button" class="oiClose" data-oi-close aria-label="${closeLabel}" title="${closeLabel}">${svg('close')}</button>`;
 const tabs=s.tabs||[],nav=root.querySelector('.oiTabs');nav.hidden=tabs.length<2;nav.setAttribute('aria-label',lang()==='en'?'Sections':'Разделы');
 nav.innerHTML=tabs.map(t=>`<button type="button" role="tab" id="oiTab${id}-${esc(t.id)}" data-oi-tab="${esc(t.id)}" aria-controls="oiPanel${id}">${t.icon?`<span class="oiTabIcon">${esc(t.icon)}</span>`:''}<span>${inline(t.label)}</span></button>`).join('')+'<i class="oiInk" aria-hidden="true"></i>';
 root.querySelector('.oiBody').id='oiPanel'+id;root.querySelector('.oiBody').setAttribute('role','tabpanel');
 let want=activeTab;if(!tabs.some(t=>t.id===want)){try{want=localStorage.getItem('orion-info-tab:'+game());}catch(_){want=null;}}if(!tabs.some(t=>t.id===want))want=tabs[0]?.id;select(want,false);return true;}
function select(id,remember){if(!current)return;const tabs=current.tabs||[],tab=tabs.find(t=>t.id===id)||tabs[0];if(!tab)return;activeTab=tab.id;if(remember)try{localStorage.setItem('orion-info-tab:'+game(),tab.id);}catch(_){}
 for(const b of root.querySelectorAll('[data-oi-tab]')){const on=b.dataset.oiTab===tab.id;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;}
 const body=root.querySelector('.oiBody');body.setAttribute('aria-labelledby',root.querySelector(`[data-oi-tab="${CSS.escape(tab.id)}"]`)?.id||'');body.innerHTML=`<div class="oiPanel">${(tab.blocks||[]).map(block).join('')}</div>`;body.scrollTop=0;requestAnimationFrame(placeInk);}
function placeInk(){if(!root||root.hidden)return;const ink=root.querySelector('.oiInk'),on=root.querySelector('[data-oi-tab][aria-selected="true"]');if(!ink||!on)return;ink.style.left=on.offsetLeft+'px';ink.style.width=on.offsetWidth+'px';}
function open(tabId){if(tabId)activeTab=tabId;if(!render())return false;lastFocus=document.activeElement;root.hidden=false;root.classList.remove('closing');document.documentElement.classList.add('oiOpen');requestAnimationFrame(()=>{placeInk();root.querySelector('.oiClose')?.focus({preventScroll:true});});return true;}
function close(){if(!root||root.hidden||root.classList.contains('closing'))return;root.classList.add('closing');document.documentElement.classList.remove('oiOpen');setTimeout(()=>{root.hidden=true;root.classList.remove('closing');},160);try{lastFocus?.focus?.({preventScroll:true});}catch(_){}const done=current?.onClose;if(typeof done==='function')try{done();}catch(e){console.error(e);}}
/* Escape and a focus loop; window capture runs before the games' own key handlers. */
addEventListener('keydown',e=>{if(!root||root.hidden)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();return;}if(e.key==='Tab'){const f=[...box.querySelectorAll('button,summary,[tabindex="0"],a[href]')].filter(x=>x.offsetParent);if(!f.length)return;const first=f[0],last=f.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}else e.stopPropagation();},true);
new MutationObserver(()=>{if(root&&!root.hidden)render();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
window.OrionInfo={available:()=>!!window.OrionInfoSpec,open,close,isOpen:()=>!!root&&!root.hidden,render:block};
})();
