const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const C = require('../tamada-core.js');
const W = require('../orion-wheel.js');
const games = [
  { id:'a', r:'rare', tags:['online','two'], icon:'fa-dice', cover:'gw' },
  { id:'b', r:'legendary', tags:['solo','rpg'], icon:'fa-dice', cover:'runesc' },
  { id:'c', r:'legendary', tags:['online','rpg'], icon:'fa-dice', cover:'svo' },
];
const make = mode => C.create(games, { id:'session', host:'host', mode });
function cast(s, player, values) { return C.vote(s,player,{revision:s.revision,round:s.round,...values},['host','guest'],games); }

test('wheel allocations enforce a total budget of ten and reject unknown or negative votes', () => {
  let s = make('wheel');
  assert.equal(cast(s,'host',{allocation:{a:11}}),null);
  assert.equal(cast(s,'host',{allocation:{a:8,b:3}}),null);
  assert.equal(cast(s,'host',{allocation:{a:-1}}),null);
  assert.equal(cast(s,'host',{allocation:{unknown:1}}),null);
  assert.equal(C.vote(s,'outsider',{revision:0,allocation:{a:10}},['host'],games),null);
  s=cast(s,'host',{allocation:{a:9},ready:true});
  assert.equal(s.ready.host,false);
  s=cast(s,'host',{allocation:{a:7,b:3},ready:true});
  assert.equal(s.ready.host,true);
  assert.equal(C.canAdvance(s,['host','guest']),false);
});

test('displayed wheel sectors and winner selection use exactly the same frozen weights', () => {
  let s=make('wheel');
  s=cast(s,'host',{allocation:{a:10},ready:true});
  s=cast(s,'guest',{allocation:{b:10},ready:true});
  const weights=C.wheelWeights(s,['host','guest']);
  assert.deepEqual(weights,{a:11,b:11,c:1});
  const sectors=C.sectors(weights);
  assert.equal(sectors.at(-1).end,360);
  assert.ok(sectors[0].end-sectors[0].start>sectors[2].end-sectors[2].start);
  const next=C.advance(s,['host','guest'],games,()=>0,1000);
  assert.equal(next.result,'a');assert.equal(next.phase,'spin');
  assert.deepEqual(next.spinWeights,weights);
});

test('host exclusions reset ballots and reject delayed votes from the previous revision', () => {
  let s=make('wheel');s=cast(s,'host',{allocation:{a:10},ready:true});
  s=C.include(s,'a',games);
  assert.ok(!s.enabled.includes('a'));assert.deepEqual(s.ballots,{});assert.equal(s.revision,1);
  assert.equal(C.vote(s,'host',{revision:0,allocation:{b:10}},['host'],games),null);
  s=C.include(s,'b',games);
  assert.equal(C.include(s,'c',games),null);
});

test('tiles proceed through rarity, tag and a revealed game, filtering each round', () => {
  let s=make('tiles');
  s=cast(s,'host',{choice:'legendary'});s=cast(s,'guest',{choice:'legendary'});
  s=C.advance(s,['host','guest'],games,()=>0,1000);
  assert.equal(s.round,'tag');assert.equal(s.rarity,'legendary');
  assert.deepEqual(C.candidates(s,games).map(g=>g.id),['b','c']);
  s=cast(s,'host',{choice:'online'});s=cast(s,'guest',{choice:'online'});
  s=C.advance(s,['host','guest'],games,()=>0,1000);
  assert.equal(s.round,'game');assert.deepEqual(C.options(s,games),['c']);
  assert.equal(cast(s,'guest',{choice:'b'}),null);
  s=cast(s,'host',{choice:'c'});s=cast(s,'guest',{choice:'c'});
  s=C.advance(s,['host','guest'],games,()=>0,1000);
  assert.equal(s.phase,'spin');assert.equal(s.result,'c');
});

test('a tie advances to one valid option instead of mixing incompatible filters', () => {
  let s=make('tiles');s=cast(s,'host',{choice:'rare'});s=cast(s,'guest',{choice:'legendary'});
  s=C.advance(s,['host','guest'],games,()=>.99,1000);
  assert.equal(s.rarity,'legendary');assert.equal(s.tied.length,2);
  assert.deepEqual(s.ready,{});assert.deepEqual(s.ballots,{});
});

test('the prize reel is reproducible and the declared winner stops beneath the center pointer', () => {
  const s=C.advance(make('prize'),['host'],games,()=>.5,1000);
  assert.equal(s.phase,'spin');
  const a=C.prizeStrip(s),b=C.prizeStrip(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(a,b);assert.equal(a.items[a.winnerIndex],s.result);
  assert.equal(a.offset,-a.winnerIndex*190);
});

test('only included games can be revealed, and results cannot be re-voted during animation', () => {
  const s=C.advance(make('prize'),['host'],games,()=>0,1000);
  assert.equal(C.vote(s,'host',{revision:0,allocation:{a:10}},['host'],games),null);
  assert.equal(C.include(s,'a',games),null);
  assert.equal(C.normalise({...s,result:'outsider'},games),null);
});

function lobby() {
  let leader='host';
  let holdGuest=false;const queued=[];
  const apis={},roots={},snapshots={},launches=[],timers=new Map();let timerId=0;
  const people=()=>['host','guest'].map(label=>({label,p:{n:label,tm:snapshots[label]}}));
  const context={window:{OrionTamadaCore:C,OrionWheel:W},document:{activeElement:null},CSS:{escape:s=>s},
    setTimeout:fn=>{const id=++timerId;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id)};
  vm.createContext(context);vm.runInContext(readFileSync(path.join(__dirname,'../tamada.js'),'utf8'),context);
  for(const label of ['host','guest']) {
    let click;
    const handlers={};
    const root={innerHTML:'',contains:e=>!!e?.isButton,querySelector:()=>null,addEventListener:(type,fn)=>{handlers[type]=fn;if(type==='click')click=fn;}};
    const target=(action,data={})=>({isButton:true,disabled:false,dataset:{tmAction:action,...data}});
    roots[label]={
      html:()=>root.innerHTML,
      click:(action,data={},event={})=>{const button=target(action,data);click({target:{closest:()=>button},...event});},
      gesture:(type,game,event={})=>{const button=target('sector',{game});handlers[type]({target:{closest:()=>button},preventDefault(){},...event});},
    };
    apis[label]=context.window.createOrionTamada({root,games,me:()=>label,host:()=>leader,members:people,
      name:id=>id,tag:id=>id,color:()=> '#f2a33a',cover:()=>'',lang:()=> 'en',id:()=> 'session',visible:()=>true,
      emit:data=>{for(const [recipient,api] of Object.entries(apis)){const message=JSON.parse(JSON.stringify(data));if(holdGuest&&recipient==='guest'&&data.a==='state')queued.push(()=>api.receive(label,message));else api.receive(label,message);}},
      changed:s=>snapshots[label]=s,join:()=>{},invite:()=>{},notice:()=>{},started:()=>{},launch:id=>launches.push([label,id])});
  }
  return {apis,roots,snapshots,launches,timers,setLeader:x=>leader=x,holdGuest:x=>holdGuest=x,flushGuest:()=>{while(queued.length)queued.shift()();}};
}

test('two clients share allocations, readiness, winner and explicit game launch', () => {
  const {apis,roots,snapshots,timers,launches}=lobby();
  roots.host.click('mode',{mode:'wheel'});
  for(let i=0;i<10;i++){roots.host.click('plus',{game:'a'});roots.guest.click('plus',{game:'b'});}
  roots.host.click('ready');roots.guest.click('ready');
  assert.equal(snapshots.host.ready.guest,true);
  assert.equal(JSON.stringify(snapshots.host),JSON.stringify(snapshots.guest));
  roots.host.click('advance');
  assert.equal(snapshots.host.phase,'spin');assert.equal(snapshots.host.result,snapshots.guest.result);
  for(const fn of [...timers.values()])fn();
  assert.equal(snapshots.host.phase,'done');
  roots.guest.click('launch');assert.equal(launches.length,0);
  roots.host.click('launch');assert.equal(launches.length,2);
  assert.equal(apis.host.getSnapshot().result,launches[0][1]);
});

test('non-hosts cannot change included games, publish state or advance the vote', () => {
  const {apis,roots,snapshots}=lobby();roots.host.click('mode',{mode:'prize'});
  const seq=snapshots.host.seq;
  roots.guest.click('include',{game:'a'});roots.guest.click('advance');
  apis.host.receive('guest',{a:'include',id:'session',game:'a'});
  apis.host.receive('guest',{a:'state',state:{...snapshots.host,seq:999,enabled:['a']}});
  assert.equal(snapshots.host.seq,seq);assert.deepEqual(Array.from(snapshots.host.enabled),['a','b','c']);
});

test('a newly elected lobby host can continue an existing session', () => {
  const {apis,roots,snapshots,setLeader}=lobby();roots.host.click('mode',{mode:'prize'});
  setLeader('guest');apis.guest.tick();
  assert.equal(snapshots.guest.host,'guest');
  roots.guest.click('advance');assert.equal(snapshots.guest.phase,'spin');
});

test('sector clicks, Shift-click, right-click and keyboard allocate the same synchronized ballot', () => {
  const {roots,snapshots}=lobby();roots.host.click('mode',{mode:'wheel'});
  assert.ok(roots.host.html().includes('data-tm-action="sector"'));
  assert.ok(!roots.host.html().includes('tmVoteRows'));
  roots.host.click('sector',{game:'a'});roots.host.click('sector',{game:'a'});
  roots.host.click('sector',{game:'a'},{shiftKey:true});
  assert.equal(snapshots.host.ballots.host.a,1);
  roots.host.gesture('contextmenu','a');assert.equal(snapshots.host.ballots.host.a,0);
  roots.host.gesture('keydown','b',{key:'Enter'});assert.equal(snapshots.guest.ballots.host.b,1);
  roots.host.gesture('keydown','b',{key:'Delete'});assert.equal(snapshots.guest.ballots.host.b,0);
  for(let i=0;i<10;i++)roots.host.click('sector',{game:'c'});
  const seq=snapshots.host.seq;roots.host.click('sector',{game:'a'});
  assert.equal(snapshots.host.seq,seq);assert.equal(C.sum(snapshots.host.ballots.host),10);
  roots.host.click('ready');roots.host.click('sector',{game:'c'},{shiftKey:true});
  assert.equal(snapshots.host.ballots.host.c,10);
  roots.host.click('ready');roots.host.click('reset');assert.equal(C.sum(snapshots.host.ballots.host),0);
});

test('wheel interpolation remains continuous during a rapid second vote and ends at the actual weighted sectors', () => {
  const initial=C.sectors({a:1,b:1,c:1}),first=C.sectors({a:8,b:1,c:1}),next=C.sectors({a:8,b:5,c:1});
  const visible=W.interpolate(initial,first,.4);
  assert.deepEqual(W.interpolate(visible,next,0).map(s=>[s.start,s.end]),visible.map(s=>[s.start,s.end]));
  const final=W.interpolate(visible,next,1);
  final.forEach((s,i)=>{assert.ok(Math.abs(s.start-next[i].start)<1e-9);assert.ok(Math.abs(s.end-next[i].end)<1e-9);assert.ok(Number.isFinite(s.mid));});
  assert.ok(!W.path(C.sectors({a:1})[0]).includes('NaN'));
  assert.equal((W.path(C.sectors({a:1})[0]).match(/A199 199/g)||[]).length,2);
});

test('rapid guest clicks are accumulated by the host even while acknowledgements are delayed', () => {
  const x=lobby();x.roots.host.click('mode',{mode:'wheel'});x.holdGuest(true);
  for(let i=0;i<10;i++)x.roots.guest.click('sector',{game:'a'});
  assert.equal(x.snapshots.host.ballots.guest.a,10);
  assert.equal(C.sum(x.snapshots.guest.ballots.guest||{}),0);
  x.roots.guest.click('sector',{game:'a'});assert.equal(x.snapshots.host.ballots.guest.a,10);
  x.holdGuest(false);x.flushGuest();
  assert.equal(x.snapshots.guest.ballots.guest.a,10);
  x.roots.guest.click('ready');assert.equal(x.snapshots.host.ready.guest,true);
});

test('both wheel clients display shared totals, with personal votes separately in the game list',()=>{
 const {roots}=lobby();roots.host.click('mode',{mode:'wheel'});for(let i=0;i<2;i++)roots.host.click('plus',{game:'a'});for(let i=0;i<3;i++)roots.guest.click('plus',{game:'a'});
 for(const who of ['host','guest']){assert.match(roots[who].html(),/class="tmSectorVotes">5<\/text>/);assert.match(roots[who].html(),/class="tmGameTotal">5<\/b>/);}
 assert.match(roots.host.html(),/yours: 2/);assert.match(roots.guest.html(),/yours: 3/);
});
