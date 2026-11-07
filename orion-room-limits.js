(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrionRoomLimits=api;})(typeof window==='object'?window:globalThis,()=>{'use strict';
const limits={gw:2,chess:2,battleship:2,tetris:6,codewords:8,quiz:8,carcassonne:8,catan:6,ration:8,svo:8,runes:1,casino:1};
const capacity=(game,s={})=>s.mode==='duel'?2:limits[game]||8;
const bots=s=>Math.max(0,Number.isInteger(s.settings?.bots)?s.settings.bots:0);
function valid(game,s,fallback){const ps=s.players||[],max=fallback?Math.min(fallback,capacity(game,s)):capacity(game,s);return ps.length>0&&new Set(ps.map(p=>p.l)).size===ps.length&&ps.length+bots(s)<=max;}
return{limits,capacity,bots,valid};});
