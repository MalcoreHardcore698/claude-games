const {test}=require('node:test'),assert=require('node:assert/strict');
const Chess=require('../chess-core.js'),Sea=require('../battleship-core.js'),Land=require('../carcassonne-core.js');
function chess(){const s=Chess.create('h','Host','bot',true);s.host='h';Chess.action(s,'h',{type:'start'},0);return s;}
test('chess rejects illegal turns and detects a real checkmate',()=>{
 const s=chess();assert.equal(Chess.action(s,'@ai',{type:'move',from:'e7',to:'e5'},0),false);assert.equal(Chess.action(s,'h',{type:'move',from:'e2',to:'e5'},0),false);
 for(const [id,from,to]of [['h','f2','f3'],['@ai','e7','e5'],['h','g2','g4'],['@ai','d8','h4']])assert.ok(Chess.action(s,id,{type:'move',from,to},0));
 assert.equal(s.phase,'over');assert.equal(s.reason,'checkmate');assert.equal(s.winner,'@ai');
});
test('chess preserves castling, en passant and underpromotion',()=>{
 const castle=chess();castle.initialFen='r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';castle.fen=castle.initialFen;
 assert.ok(Chess.action(castle,'h',{type:'move',from:'e1',to:'g1'},0));assert.equal(Chess.game(castle).get('f1').type,'r');assert.equal(Chess.game(castle).get('g1').type,'k');
 const ep=chess();for(const [id,from,to]of [['h','e2','e4'],['@ai','a7','a6'],['h','e4','e5'],['@ai','d7','d5'],['h','e5','d6']])assert.ok(Chess.action(ep,id,{type:'move',from,to},0));assert.equal(Chess.game(ep).get('d5'),undefined);assert.equal(Chess.game(ep).get('d6').type,'p');
 const promote=chess();promote.initialFen='7k/P7/8/8/8/8/8/7K w - - 0 1';promote.fen=promote.initialFen;assert.ok(Chess.action(promote,'h',{type:'move',from:'a7',to:'a8',promotion:'n'},0));assert.equal(Chess.game(promote).get('a8').type,'n');
});
test('every naval fleet has the configured lengths and no touching ships',()=>{
 for(const size of [8,10,12])for(const fleet of Object.keys(Sea.FLEETS)){if(size===8&&fleet==='ocean')continue;const s=Sea.create('h','H');s.settings.size=size;s.settings.fleet=fleet;const b=Sea.arrange(s);assert.ok(b);assert.deepEqual(b.ships.map(x=>x.len),Sea.FLEETS[fleet]);for(let i=0;i<b.ships.length;i++)for(let j=i+1;j<b.ships.length;j++)for(const a of Sea.shipCells(b.ships[i]))for(const c of Sea.shipCells(b.ships[j]))assert.ok(Math.abs(a.x-c.x)>1||Math.abs(a.y-c.y)>1);}
});
test('enemy naval coordinates stay hidden and repeated shots are rejected',()=>{
 const s=Sea.create('h','H','bot',true);s.host='h';Sea.action(s,'h',{type:'start'},0);Sea.action(s,'h',{type:'random'},0);assert.ok(Sea.action(s,'h',{type:'ready'},0));const hidden=Sea.view(s,'h').boards['@ai'];assert.ok(hidden.ships.every(ship=>ship.x===undefined&&ship.y===undefined));
 const cell=Sea.shipCells(s.boards['@ai'].ships[0])[0],index=cell.y*s.settings.size+cell.x;assert.ok(Sea.action(s,'h',{type:'shoot',index},0));assert.equal(Sea.action(s,'h',{type:'shoot',index},0),false);assert.ok(s.boards['@ai'].shots[index]>=2);
});
function land(){const s=Land.create('h','H','bot',true);s.host='h';s.settings.bots=0;Land.start(s,0);s.tiles={};s.seats[0].meeples=6;return s;}
const tile=(k,x,y,rot=0,meeple=null,shield=false)=>({k,x,y,rot,shield,forest:false,...(meeple?{meeple:{player:'h',feature:meeple}}:{})});
test('completed roads score once and return their meeples',()=>{
 const s=land();s.tiles['0,0']=tile('end',0,0,0,'r0');s.tiles['0,-1']=tile('end',0,-1,2);Land.score(s);assert.equal(s.seats[0].score,2);assert.equal(s.seats[0].meeples,7);assert.equal(s.tiles['0,0'].meeple,undefined);Land.score(s);assert.equal(s.seats[0].score,2);
});
test('city shields, completed monasteries and adjacent-city farms score correctly',()=>{
 const city=land();city.tiles['0,0']=tile('cap',0,0,0,'c0',true);city.tiles['0,-1']=tile('cap',0,-1,2);Land.score(city);assert.equal(city.seats[0].score,6);
 const abbey=land();for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)abbey.tiles[Land.key(x,y)]=tile(x===0&&y===0?'abbey':'field',x,y,0,x===0&&y===0?'m0':null);Land.score(abbey);assert.equal(abbey.seats[0].score,9);
 const farm=land();const f=Land.layout('cap').features.find(f=>f.kind==='field'&&f.touches.includes('c0'));farm.tiles['0,0']=tile('cap',0,0,0,f.id);farm.tiles['0,-1']=tile('cap',0,-1,2);Land.score(farm,false);assert.equal(farm.seats[0].score,0);Land.score(farm,true);assert.equal(farm.seats[0].score,3);
});
test('connected occupied features cannot receive a second meeple',()=>{
 const s=land();s.tiles['0,0']=tile('end',0,0,0,'r0');s.tiles['0,-1']=tile('end',0,-1,2);s.lastTile='0,-1';s.stage='meeple';assert.ok(!Land.options(s).some(f=>f.id==='r0'));
});
test('Carcassonne respects landscape choices, hides the deck and finishes for 1–8 players',()=>{
 for(const count of [1,8]){const s=Land.create('h','H','friends',false);s.host='h';for(let i=1;i<count;i++)s.players.push({l:'p'+i,n:'P'+i});s.settings.tiles=24;s.settings.bots=0;s.settings.cities=s.settings.fields=s.settings.monasteries=s.settings.rivers=0;s.settings.roads=5;assert.ok(Land.action(s,'h',{type:'start'},0));assert.equal(s.seats.length,count);assert.ok(s.deck.every(t=>Land.BY[t.k].cat==='roads'));assert.equal(Land.view(s).deck,undefined);
 let moves=0;while(s.phase==='play'&&moves++<100){const id=s.seats[s.turn].l;if(s.stage==='place'){const m=Land.legal(s)[0];assert.ok(m);assert.ok(Land.action(s,id,{type:'place',...m},0));}else assert.ok(Land.action(s,id,{type:'meeple'},0));}assert.equal(s.phase,'over');assert.equal(s.placed+s.discarded,24);assert.ok(s.winners.length);}
});

test('two room clients synchronize chess moves, hidden fleets and tile turns',()=>{
 const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
 for(const [game,core]of [['chess',Chess],['battleship',Sea],['carcassonne',Land]]){const clients={},links={};for(const id of ['h','g']){let handler;const parent={__gameShell:true,postMessage:m=>{if(m.type==='emit'){const r=links[m.to];r.handler({source:r.parent,data:{svo:1,type:'ev',k:'g',from:id,d:{game,m:JSON.parse(JSON.stringify(m.d))}}});}}};const context={window:{},parent,addEventListener:(key,fn)=>{if(key==='message')handler=fn;},setInterval(){},Date,Math,JSON};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../orion-party.js'),'utf8'),context);clients[id]=new context.window.OrionParty({game,limit:game==='carcassonne'?8:2,create:core.create,view:core.view,action:core.action,changed(){}});links[id]={parent,handler};handler({source:parent,data:{svo:1,type:'hello',me:id,name:id,inLobby:true,peers:[{label:'h',w:game},{label:'g',w:game}]}});}
 clients.h.create('friends');clients.g.join('h');clients.h.act({type:'start'});assert.equal(clients.g.state.players.length,2);
 if(game==='chess'){clients.h.act({type:'move',from:'e2',to:'e4'});clients.g.act({type:'move',from:'e7',to:'e5'});assert.equal(clients.g.state.history.length,2);assert.equal(clients.h.state.fen,clients.g.state.fen);}
 if(game==='battleship'){clients.h.act({type:'random'});clients.g.act({type:'random'});clients.h.act({type:'ready'});clients.g.act({type:'ready'});assert.equal(clients.g.state.phase,'play');assert.ok(clients.g.state.boards.h.ships.every(s=>s.x===undefined));}
 if(game==='carcassonne'){let m=Land.legal(clients.h.server)[0];clients.h.act({type:'place',...m});clients.h.act({type:'meeple'});assert.equal(clients.g.state.seats[clients.g.state.turn].l,'g');m=Land.legal(clients.g.state)[0];clients.g.act({type:'place',...m});clients.g.act({type:'meeple'});assert.equal(clients.g.state.placed,3);assert.equal(clients.g.state.deck,undefined);}
 }
});
