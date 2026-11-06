(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./casino-core.js'));else root.OrionCasinoWallet=factory(root.OrionCasino);})(typeof window==='object'?window:globalThis,C=>{
'use strict';
function settle(wallet,raw,rng=Math.random,now=Date.now()){
 if(!raw||typeof raw.id!=='string'||!/^[-\w]{8,80}$/.test(raw.id))return{ok:false,error:'request'};
 const input=C.request(raw);if(!input)return{ok:false,error:'request'};const signature=JSON.stringify(input),ledger=Array.isArray(wallet.casinoLedger)?wallet.casinoLedger:[],old=ledger.find(x=>x.id===raw.id);
 if(old)return old.signature===signature?{ok:true,replayed:true,round:old.round,balance:wallet.chips,stats:wallet.casinoStats||{}}:{ok:false,error:'collision'};
 if(!Number.isFinite(raw.at)||raw.at>now+60000||now-raw.at>600000)return{ok:false,error:'expired'};
 if(!Number.isSafeInteger(wallet.chips)||wallet.chips<input.cost)return{ok:false,error:'balance',balance:wallet.chips};
 const round=C.play(raw,rng);round.id=raw.id;round.at=now;wallet.chips+=round.net;
 const stats=wallet.casinoStats||={rounds:0,machines:[],profitRounds:0};stats.rounds++;stats.profitRounds+=round.net>0?1:0;if(!stats.machines.includes(round.machine))stats.machines.push(round.machine);
 wallet.casinoLedger=[{id:raw.id,signature,round},...ledger].slice(0,64);
 return{ok:true,replayed:false,round,balance:wallet.chips,stats};
}
return{settle};
});
