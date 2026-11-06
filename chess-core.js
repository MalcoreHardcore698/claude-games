(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./vendor/chess-rules.js').Chess);else root.OrionChess=factory(root.OrionChessRules.Chess);})(typeof window==='object'?window:globalThis,Chess=>{
'use strict';const value={p:100,n:320,b:335,r:500,q:900,k:0};
function create(id,name,mode='bot',solo=false){return{phase:'lobby',mode,solo,players:[{l:id,n:name}],settings:{level:2,side:'w',minutes:0,increment:0},history:[],fen:new Chess().fen(),seats:{},clocks:{w:0,b:0},lastAt:0,lastMove:null,drawOffer:null,winner:null,reason:null,nextAt:0};}
function game(s){const g=new Chess(s.initialFen);for(const san of s.history)g.move(san);return g;}
function finish(s,winner,reason){s.phase='over';s.winner=winner;s.reason=reason;s.nextAt=0;}
function clock(s,now){if(s.phase!=='play'||!s.settings.minutes)return false;const color=s.fen.split(' ')[1];s.clocks[color]=Math.max(0,s.clocks[color]-(now-s.lastAt));s.lastAt=now;if(!s.clocks[color]){finish(s,s.seats[color==='w'?'b':'w'],'timeout');return true;}return false;}
function start(s,now){if(!s.solo&&s.players.length!==2)return false;const g=new Chess();s.phase='play';s.history=[];s.fen=g.fen();delete s.initialFen;const side=s.settings.side;s.seats={[side]:s.players[0].l,[side==='w'?'b':'w']:s.solo?'@ai':s.players[1].l};s.clocks={w:s.settings.minutes*60000,b:s.settings.minutes*60000};s.lastAt=now;s.lastMove=null;s.drawOffer=null;s.winner=null;s.reason=null;s.nextAt=now+650;return true;}
function action(s,id,a,now=Date.now()){if(!a||typeof a!=='object')return false;
 if(a.type==='setting'&&id===s.host&&s.phase==='lobby'){const allowed={level:[1,2,3],side:['w','b'],minutes:[0,5,10,15,30],increment:[0,2,5]};if(!allowed[a.key]?.includes(a.value))return false;s.settings[a.key]=a.value;return true;}
 if(a.type==='start'&&id===s.host&&s.phase==='lobby')return start(s,now);
 if(s.phase!=='play'||!Object.values(s.seats).includes(id))return false;if(clock(s,now))return true;const g=game(s),color=Object.keys(s.seats).find(k=>s.seats[k]===id);
 if(a.type==='resign'){finish(s,s.seats[color==='w'?'b':'w'],'resign');return true;}
 if(a.type==='draw'){if(s.solo)return false;if(s.drawOffer&&s.drawOffer!==id){finish(s,null,'agreement');return true;}s.drawOffer=id;return true;}
 if(a.type==='decline'){if(s.drawOffer===id||!s.drawOffer)return false;s.drawOffer=null;return true;}
 if(a.type==='undo'&&s.solo&&s.history.length){const count=g.turn()===color?Math.min(2,s.history.length):1;s.history.splice(-count);s.fen=game(s).fen();s.lastMove=null;s.lastAt=now;s.nextAt=now+650;return true;}
 if(a.type!=='move'||g.turn()!==color||s.seats[g.turn()]!==id)return false;
 let move;try{move=g.move({from:String(a.from),to:String(a.to),promotion:['q','r','b','n'].includes(a.promotion)?a.promotion:'q'});}catch(_){return false;}if(!move)return false;
 s.history.push(move.san);s.fen=g.fen();s.lastMove={from:move.from,to:move.to,san:move.san,captured:move.captured||null,piece:move.piece,color:move.color};s.drawOffer=null;if(s.settings.minutes)s.clocks[color]+=s.settings.increment*1000;s.lastAt=now;s.nextAt=now+650;
 if(g.isCheckmate())finish(s,id,'checkmate');else if(g.isStalemate())finish(s,null,'stalemate');else if(g.isThreefoldRepetition())finish(s,null,'repetition');else if(g.isInsufficientMaterial())finish(s,null,'material');else if(g.isDraw())finish(s,null,'fifty');return true;
}
function evaluate(g){let total=0;for(const row of g.board())for(const p of row)if(p){const x=p.square.charCodeAt(0)-97,y=+p.square[1]-1,center=3.5-(Math.abs(x-3.5)+Math.abs(y-3.5))/2,advance=p.color==='w'?y:7-y;let v=value[p.type]+(p.type==='p'?advance*8:0)+(['n','b'].includes(p.type)?center*12:0);total+=(p.color==='w'?1:-1)*v;}return total*(g.turn()==='w'?1:-1);}
function aiMove(s){const g=game(s),deadline=Date.now()+[0,70,170,450][s.settings.level],maxDepth=s.settings.level;let nodes=0;
 const ordered=()=>g.moves({verbose:true}).sort((a,b)=>(value[b.captured]||0)-(value[a.captured]||0)+(b.promotion?800:0)-(a.promotion?800:0));
 function search(depth,alpha,beta){if(++nodes%128===0&&Date.now()>deadline)return evaluate(g);if(g.isCheckmate())return-100000-depth;if(g.isDraw())return 0;if(!depth)return evaluate(g);let best=-Infinity;for(const m of ordered()){g.move(m.san);const score=-search(depth-1,-beta,-alpha);g.undo();if(score>best)best=score;if(score>alpha)alpha=score;if(alpha>=beta||Date.now()>deadline)break;}return best===-Infinity?evaluate(g):best;}
 let best=null,bestScore=-Infinity;for(const m of ordered()){g.move(m.san);let score=-search(maxDepth-1,-Infinity,Infinity);g.undo();if(s.settings.level===1)score+=Math.random()*70;if(score>bestScore){bestScore=score;best=m;}if(Date.now()>deadline&&best)break;}return best&&{type:'move',from:best.from,to:best.to,promotion:best.promotion};}
function step(s,now){if(s.phase!=='play')return false;if(clock(s,now))return true;if(s.solo&&s.seats[s.fen.split(' ')[1]]==='@ai'&&now>=s.nextAt){const a=aiMove(s);return a?action(s,'@ai',a,now):false;}return !!s.settings.minutes;}
function depart(s,id){if(s.phase==='play')finish(s,Object.values(s.seats).find(x=>x!==id),'left');}
return{Chess,create,game,action,step,depart,aiMove};});
