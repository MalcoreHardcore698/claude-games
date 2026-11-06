const {test}=require('node:test'),assert=require('node:assert/strict');
const T=require('../tetris-core.js'),W=require('../codewords-core.js');
test('shared tetris expands for 1–6 players and every live figure has a separate legal spawn',()=>{
 for(let n=1;n<=6;n++){const s=T.create('h','Host');s.host='h';for(let i=1;i<n;i++)s.players.push({l:'p'+i,n:'P'+i});assert.equal(T.action(s,'outsider',{type:'start'}),false);assert.equal(T.action(s,'h',{type:'start'},0),true);assert.equal(s.width,10+4*(n-1));assert.equal(Object.keys(s.pieces).length,n);for(const p of Object.values(s.pieces))assert.ok(T.fits(s,p));}
});
test('tetris hard drops join the same locked board and hold preserves the next queue',()=>{
 const s=T.create('h','H');s.host='h';s.players.push({l:'g',n:'G'});T.start(s,0);
 const next=s.next.h;T.action(s,'h',{type:'hold'},0);assert.equal(s.pieces.h.type,next);const held=s.holds.h;
 T.action(s,'h',{type:'drop'},0);const queue=s.next.h;T.action(s,'h',{type:'hold'},0);assert.equal(s.pieces.h.type,held);assert.equal(s.next.h,queue);
 T.action(s,'g',{type:'drop'},0);const owners=new Set(s.board.flat().filter(Boolean).map(v=>T.decodeCell(v).owner));assert.ok(owners.has(0)&&owners.has(1));assert.equal(T.action(s,'g',{type:'pause'}),false);
});
test('piece colors survive locking and are independent of player colors',()=>{
 const types=Object.keys(T.SHAPES);assert.equal(new Set(types.map(T.pieceColor)).size,7);
 for(const type of types)for(let owner=0;owner<6;owner++){const cell=T.decodeCell(T.encodeCell(type,owner));assert.equal(cell.type,type);assert.equal(cell.owner,owner);assert.equal(T.pieceColor(cell.type),T.PIECE_COLORS[type]);}
 const s=T.create('h','H');s.host='h';T.start(s,0);const type=s.pieces.h.type;T.action(s,'h',{type:'drop'},0);assert.ok(s.board.flat().filter(Boolean).every(v=>T.decodeCell(v).type===type));
});
test('Cipher deals 25 unique words and only captains receive unrevealed colors',()=>{
 const s=W.create('h','H','teams');s.host='h';s.players.push({l:'r',n:'R',team:'red'},{l:'b',n:'B',team:'blue'});assert.ok(W.action(s,'h',{type:'start'},0));assert.equal(s.board.length,25);assert.equal(new Set(s.board.map(c=>c.word)).size,25);assert.equal(W.remaining(s,'red'),9);assert.equal(W.remaining(s,'blue'),8);assert.equal(s.board.filter(c=>c.type==='black').length,1);
 assert.ok(W.view(s,'h').board.every(c=>c.type));assert.ok(W.view(s,'r').board.every(c=>c.type===null));assert.ok(W.view(s,'b').board.every(c=>c.type===null));
 assert.equal(W.action(s,'h',{type:'clue',word:'Секрет',count:2},0),true);assert.equal(W.action(s,'h',{type:'guess',index:0},0),false);assert.equal(W.action(s,'b',{type:'guess',index:0},0),false);
 const black=s.board.findIndex(c=>c.type==='black');assert.equal(W.action(s,'r',{type:'guess',index:black},0),true);assert.equal(s.phase,'over');assert.equal(s.winner,'blue');
});
test('solo and duel get real AI clues, and outsiders cannot guess or publish a clue',()=>{
 for(const mode of ['coop','duel']){const s=W.create('h','H',mode);s.host='h';if(mode==='duel')s.players.push({l:'g',n:'G',team:'blue'});W.start(s,0);assert.ok(W.step(s,1000));assert.equal(s.stage,'guess');assert.ok(s.clue.count>0&&s.clue.word[0]);assert.equal(W.action(s,'outsider',{type:'guess',index:0}),false);const i=s.board.findIndex(c=>c.type==='red');assert.ok(W.action(s,'h',{type:'guess',index:i},1000));assert.ok(W.view(s,'h').board[i].type==='red');}
});

test('two room clients receive the same guesses without receiving the hidden key',()=>{
 const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),clients={},contexts={};
 for(const id of ['h','g']){let handler;const parent={__gameShell:true,postMessage:m=>{if(m.type==='emit'){const recipient=contexts[m.to];recipient.handler({source:recipient.parent,data:{svo:1,type:'ev',k:'g',from:id,d:{game:'codewords',m:JSON.parse(JSON.stringify(m.d))}}});}}};
  const context={window:{},parent,addEventListener:(k,fn)=>{if(k==='message')handler=fn;},setInterval(){},Date,Math,JSON};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../orion-party.js'),'utf8'),context);
  const p=new context.window.OrionParty({game:'codewords',limit:8,create:W.create,action:W.action,step:W.step,view:W.view,changed(){}});clients[id]=p;contexts[id]={parent,handler};handler({source:parent,data:{svo:1,type:'hello',me:id,name:id,inLobby:true,peers:[{label:'h',w:'codewords'},{label:'g',w:'codewords'}]}});
 }
 clients.h.create('coop');clients.g.join('h');assert.equal(clients.g.state.players.length,2);clients.h.act({type:'start'});clients.h.step(Date.now()+1000);
 assert.ok(clients.g.state.board.every(c=>c.type===null));const i=clients.h.server.board.findIndex(c=>c.type==='red');clients.g.act({type:'guess',index:i});assert.equal(clients.g.state.board[i].revealed,true);assert.equal(clients.g.state.board[i].type,'red');assert.equal(clients.h.state.seq,clients.g.state.seq);
});
