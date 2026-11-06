const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Session}=require('../tamada-session.js');
const {readFileSync}=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
function lobby(){
  let leader='host';const clients={},stores={},events=[],notices=[];
  for(const id of ['host','guest'])stores[id]=new Map();
  function connect(id){
    const storage={getItem:k=>stores[id].get(k),setItem:(k,v)=>stores[id].set(k,v),removeItem:k=>stores[id].delete(k)};
    const instance=new Session({me:()=>id,host:()=>leader,room:()=> 'room',storage,id:()=> 'visit-'+id,
      change:(next,old)=>events.push([id,next?.phase,old?.phase]),notice:()=>notices.push(id),
      send:control=>{for(const [name,client]of Object.entries(clients))if(name!==id)client.receive(id,control);}});
    clients[id]=instance;return instance;
  }
  connect('host');connect('guest');return{clients,connect,events,notices,setLeader:x=>leader=x};
}
test('host selection notifies guests once, and only the host can open the mode picker',()=>{
  const x=lobby();x.clients.host.select();assert.deepEqual(x.notices,['guest']);
  assert.equal(x.clients.guest.canOpen(),false);assert.equal(x.clients.guest.locked(),false);
  x.clients.guest.observe({label:'host',p:{tgc:x.clients.host.control}});assert.equal(x.notices.length,1);
  assert.equal(x.clients.guest.select(),false);
});
test('choosing a mode locks guests and a reload restores the active snapshot',()=>{
  const x=lobby();x.clients.host.select();const state={id:'s1',host:'host',seq:1,mode:'wheel'};
  x.clients.host.activate(state);x.clients.guest.remember(state);
  assert.equal(x.clients.guest.locked(),true);assert.equal(x.clients.host.locked(),false);
  const restored=x.connect('guest');assert.equal(restored.locked(),true);assert.equal(restored.snapshot.id,'s1');
  x.clients.host.end('runes');assert.equal(restored.locked(),false);assert.equal(restored.control.game,'runes');
  assert.equal(restored.active(state),false);
});
test('non-host controls and delayed controls cannot replace the authoritative session',()=>{
  const x=lobby();x.clients.host.select();x.clients.host.activate({id:'s',host:'host',seq:1});
  const control={...x.clients.host.control};
  assert.equal(x.clients.guest.receive('guest',{...control,host:'guest',seq:control.seq+100,phase:'idle'}),false);
  assert.equal(x.clients.guest.receive('host',{...control,seq:control.seq-1,phase:'idle'}),false);
  assert.equal(x.clients.guest.locked(),true);
});
test('host takeover retains the active session and transfers navigation authority',()=>{
  const x=lobby();x.clients.host.select();x.clients.host.activate({id:'s',host:'host',seq:1});
  x.setLeader('guest');x.clients.guest.observe({label:'guest',p:{}});
  assert.equal(x.clients.guest.control.host,'guest');assert.equal(x.clients.guest.control.session,'s');
  assert.equal(x.clients.guest.locked(),false);assert.equal(x.clients.host.locked(),true);
  x.clients.guest.end();assert.equal(x.clients.host.locked(),false);
});

test('portal navigation locks without retriggering select observers, then restores controls',()=>{
  const html=readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const source=html.match(/function updateTamadaNavigation\(\)\{[\s\S]*?\n\}/)[0];
  let locked=true,mutations=0;
  function control(inside=false){const attrs=new Map();let disabled=false,tabIndex=0;return{
    closest:()=>inside?{}:null,getAttribute:k=>attrs.get(k)??null,
    setAttribute:(k,v)=>{mutations++;attrs.set(k,v);},removeAttribute:k=>{mutations++;attrs.delete(k);},
    get disabled(){return disabled;},set disabled(v){mutations++;disabled=v;},
    get tabIndex(){return tabIndex;},set tabIndex(v){mutations++;tabIndex=v;},
  };}
  const select=control(),button=control(),tamButton=control(),vote=control(true),root={inert:false};
  const context={document:{body:{classList:{toggle(){}}},querySelectorAll:()=>[select,button,tamButton,vote]},
    blockedNavigation:new Map(),tamadaSession:{locked:()=>locked,canOpen:()=>false},tamadaUI:{},LB:{code:'room',connected:true},
    $:id=>id==='#bTamada'?tamButton:root};
  vm.createContext(context);vm.runInContext(source,context);
  context.updateTamadaNavigation();assert.ok(select.disabled&&button.disabled&&tamButton.disabled);assert.equal(vote.disabled,false);
  const initial=mutations;context.updateTamadaNavigation();assert.equal(mutations,initial);
  locked=false;context.updateTamadaNavigation();assert.equal(select.disabled,false);assert.equal(button.disabled,false);assert.equal(select.tabIndex,0);assert.equal(tamButton.disabled,true);
});
