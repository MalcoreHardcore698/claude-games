(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./codewords-words.js'));else root.OrionCodewords=factory(root.OrionWords);})(typeof window==='object'?window:globalThis,bank=>{
'use strict';const copy=x=>JSON.parse(JSON.stringify(x));const other=t=>t==='red'?'blue':'red';const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function create(id,name,mode='coop'){return{phase:'lobby',mode,players:[{l:id,n:name,team:'red'}],board:[],turn:'red',stage:'hint',clue:null,guesses:0,round:1,logs:[],winner:null,reason:null,nextAt:0};}
function captain(s,team){if(s.mode==='coop')return null;const teamPlayers=s.players.filter(p=>p.team===team);return teamPlayers.length>=2?teamPlayers[0].l:null;}
function remaining(s,team){return s.board.filter(c=>c.type===team&&!c.revealed).length;}
function log(s,key,x={}){s.logs.push({key,...x});s.logs=s.logs.slice(-12);}
function start(s,now){if(s.mode!=='coop'&&(!s.players.some(p=>p.team==='red')||!s.players.some(p=>p.team==='blue')))return false;
 const types=shuffle([...Array(9).fill('red'),...Array(8).fill('blue'),...Array(7).fill('neutral'),'black']);s.board=shuffle(bank.words.map((_,i)=>i)).slice(0,25).map((word,i)=>({word,type:types[i],revealed:false}));s.phase='play';s.turn='red';s.round=0;s.winner=null;s.reason=null;s.logs=[];newTurn(s,'red',now);return true;}
function newTurn(s,team,now){s.turn=team;s.stage='hint';s.clue=null;s.guesses=0;s.round++;s.nextAt=captain(s,team)?0:now+900;log(s,'turn',{team});}
function finish(s,winner,reason){s.phase='over';s.winner=winner;s.reason=reason;s.nextAt=0;log(s,'winner',{team:winner});}
function reveal(s,i,now){const card=s.board[i];if(!card||card.revealed)return false;card.revealed=true;s.guesses--;log(s,'card',{word:card.word,team:card.type});if(card.type==='black'){finish(s,other(s.turn),'black');return true;}
 for(const team of ['red','blue'])if(!remaining(s,team)){finish(s,team,'agents');return true;}
 if(card.type!==s.turn||s.guesses<=0)newTurn(s,other(s.turn),now);else if(s.mode==='coop'&&s.turn==='blue')s.nextAt=now+1400;return true;}
function action(s,id,a,now=Date.now()){if(!a||typeof a!=='object')return false;const player=s.players.find(p=>p.l===id);if(!player)return false;
 if(a.type==='start'&&id===s.host&&s.phase==='lobby')return start(s,now);
 if(a.type==='team'&&id===s.host&&s.phase==='lobby'&&s.mode!=='coop'){const p=s.players.find(p=>p.l===a.player);if(!p)return false;p.team=other(p.team);return true;}
 if(a.type==='again'&&id===s.host&&s.phase==='over'){s.phase='lobby';s.board=[];return true;}
 if(s.phase!=='play'||player.team!==s.turn)return false;
 if(a.type==='clue'&&s.stage==='hint'&&captain(s,s.turn)===id){const word=String(a.word||'').trim(),count=Number(a.count);if(!/^[\p{L}][\p{L}-]{1,23}$/u.test(word)||!Number.isInteger(count)||count<1||count>9||s.board.some(c=>bank.words[c.word].n.some(n=>n.toLowerCase()===word.toLowerCase())))return false;s.clue={word,count};s.guesses=count+1;s.stage='guess';log(s,'clue',{word,count,team:s.turn});return true;}
 if(s.stage!=='guess'||captain(s,s.turn)===id)return false;
 if(a.type==='guess'&&Number.isInteger(a.index))return reveal(s,a.index,now);
 if(a.type==='end'){newTurn(s,other(s.turn),now);return true;}return false;
}
function aiClue(s){let best=null;for(const category of shuffle(bank.categories.slice())){const cards=s.board.filter(c=>!c.revealed&&bank.words[c.word].tags.includes(category.id));const own=cards.filter(c=>c.type===s.turn).length,risk=cards.reduce((n,c)=>n+(c.type==='black'?30:c.type!==s.turn?4:0),0);const score=Math.min(3,own)*3-risk;if(own&&(!best||score>best.score))best={category,score,count:Math.min(3,own)};}
 const c=best||{category:bank.categories[0],count:1};const words=s.board.map(c=>bank.words[c.word].n).flat().map(n=>n.toLowerCase());const ru=[c.category.n[0],c.category.alias[0]].find(w=>!words.includes(w.toLowerCase()))||'Ассоциация';const en=[c.category.n[1],c.category.alias[1]].find(w=>!words.includes(w.toLowerCase()))||'Association';return{word:[ru,en],count:c.count,group:c.category.id};}
function step(s,now){if(s.phase!=='play'||!s.nextAt||now<s.nextAt)return false;s.nextAt=0;
 if(s.stage==='hint'&&!captain(s,s.turn)){s.clue=aiClue(s);s.guesses=s.clue.count+1;s.stage='guess';log(s,'clue',{word:s.clue.word,count:s.clue.count,team:s.turn});if(s.mode==='coop'&&s.turn==='blue')s.nextAt=now+1600;return true;}
 if(s.mode==='coop'&&s.turn==='blue'&&s.stage==='guess'){if(s.guesses<2){newTurn(s,'red',now);return true;}const matching=s.board.map((c,i)=>({c,i})).filter(x=>!x.c.revealed&&bank.words[x.c.word].tags.includes(s.clue.group));const pool=Math.random()<.82&&matching.length?matching:s.board.map((c,i)=>({c,i})).filter(x=>!x.c.revealed);const selected=pool[Math.floor(Math.random()*pool.length)];if(selected)reveal(s,selected.i,now);if(s.phase==='play'&&s.turn==='blue'&&s.stage==='guess')s.nextAt=now+1600;return true;}return false;}
function view(s,id){const v=copy(s);v.remaining={red:remaining(s,'red'),blue:remaining(s,'blue')};const p=s.players.find(p=>p.l===id),key=s.phase==='over'||p&&captain(s,p.team)===id;for(const c of v.board)if(!key&&!c.revealed)c.type=null;return v;}
return{create,start,action,step,view,captain,remaining,bank};});
