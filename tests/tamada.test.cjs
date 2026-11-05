const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const C = require('../tamada-core.js');
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
  const apis={},roots={},snapshots={},launches=[],timers=new Map();let timerId=0;
  const people=()=>['host','guest'].map(label=>({label,p:{n:label,tm:snapshots[label]}}));
  const context={window:{OrionTamadaCore:C},document:{activeElement:null},CSS:{escape:s=>s},
    setTimeout:fn=>{const id=++timerId;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id)};
  vm.createContext(context);vm.runInContext(readFileSync(path.join(__dirname,'../tamada.js'),'utf8'),context);
  for(const label of ['host','guest']) {
    let click;
    const root={innerHTML:'',contains:e=>!!e?.isButton,querySelector:()=>null,addEventListener:(type,fn)=>{if(type==='click')click=fn;}};
    roots[label]={click:(action,data={})=>{const button={isButton:true,disabled:false,dataset:{tmAction:action,...data}};click({target:{closest:()=>button}});}};
    apis[label]=context.window.createOrionTamada({root,games,me:()=>label,host:()=>leader,members:people,
      name:id=>id,tag:id=>id,color:()=> '#f2a33a',cover:()=>'',lang:()=> 'en',id:()=> 'session',visible:()=>true,
      emit:data=>{for(const api of Object.values(apis))api.receive(label,JSON.parse(JSON.stringify(data)));},
      changed:s=>snapshots[label]=s,join:()=>{},invite:()=>{},notice:()=>{},started:()=>{},launch:id=>launches.push([label,id])});
  }
  return {apis,roots,snapshots,launches,timers,setLeader:x=>leader=x};
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
