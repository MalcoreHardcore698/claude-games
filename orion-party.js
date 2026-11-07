/* Shared game-room protocol over the portal's existing lobby transport. */
(()=>{'use strict';const copy=x=>JSON.parse(JSON.stringify(x));
class Party{
 constructor(ctx){this.ctx=ctx;this.me='local';this.name='Игрок';this.peers=[];this.inLobby=false;this.state=null;this.server=null;this.host=null;this.seq=0;this.pending=null;this.solo=false;this.peerSignature='';this.lastInvites=new Map();this.embedded=parent!==window&&!!parent.__gameShell;
  addEventListener('message',e=>{if(!this.embedded||e.source!==parent||e.data?.svo!==1)return;const m=e.data;
   if(m.type==='hello'||m.type==='peers'){if(m.me)this.me=m.me;if(m.name)this.name=m.name;const restored=!this.inLobby&&!!m.inLobby;this.inLobby=!!m.inLobby;if(restored&&this.state&&!this.isHost())this.send(this.host,{a:'resync',id:this.state.id});this.peers=Array.isArray(m.peers)?m.peers:[];const signature=JSON.stringify([this.me,this.name,this.inLobby,this.peers.map(p=>[p.label,p.name,p.w,p.ig,p.gp?.host,p.gp?.cnt,p.gp?.busy,p.gp?.gid])]);if(m.lang&&m.lang!==this.language){this.language=m.lang;ctx.language?.(m.lang);}if(m.type==='hello'&&this.pending){const id=this.pending;this.pending=null;this.join(id);}if(signature!==this.peerSignature){this.peerSignature=signature;ctx.lobby?.();}}
   else if(m.type==='ev'&&m.k==='g'&&m.d?.game===ctx.game)this.receive(m.from,m.d.m);
   else if(m.type==='accept'){if(this.me==='local')this.pending=m.from;else this.join(m.from);}
   else if(m.type==='lang')ctx.language?.(m.lang);
  });
  this.post('ready');setInterval(()=>this.presence(),700);addEventListener('pagehide',()=>this.leave(false));
 }
 post(type,args={}){if(type==='end'&&args.gid===this.milestones?.id&&args.sum){args={...args,sum:{...args.sum,g:[...new Set([...(args.sum.g||[]),...this.milestones.groups])]}};}if(type==='gp'){const sig=JSON.stringify(args.d);if(sig===this.presenceSig&&Date.now()-(this.presenceAt||0)<3000)return;this.presenceSig=sig;this.presenceAt=Date.now();}if(this.embedded)parent.postMessage({svo:1,type,...args},'*');}
 send(to,d){this.post('emit',{to,d});}
 capacity(s=this.server||this.state){return s?.mode==='duel'?2:this.ctx.limit;}
 occupancy(s=this.server||this.state){return (s?.players?.length||0)+Math.max(0,s?.settings?.bots||0);}
 validRoom(s){return s.players.length>0&&new Set(s.players.map(p=>p.l)).size===s.players.length&&this.occupancy(s)<=this.capacity(s);}
 isHost(){return !!this.server&&this.host===this.me;}
 presence(){this.post('gp',{d:{n:this.name,host:!this.solo&&this.isHost()&&this.server.phase==='lobby'?1:0,table:this.server?.id||null,cnt:this.occupancy(),max:this.capacity(),busy:!!this.state,gid:this.state?.phase!=='lobby'?this.state?.id:null}});}
 create(mode,solo=false){this.leave(false);this.solo=solo;this.host=this.me;this.seq=0;this.server=this.ctx.create(this.me,this.name,mode,solo);this.server.id=Date.now().toString(36)+Math.random().toString(36).slice(2,8);this.server.host=this.me;this.server.roomLimit=this.capacity();this.publish();this.presence();}
 invite(id){if(!this.isHost()||this.solo||this.server.phase!=='lobby'||!this.peers.some(p=>p.label===id&&!p.ig)||this.server.players.some(p=>p.l===id)||Date.now()-(this.lastInvites.get(id)||0)<4000)return false;this.lastInvites.set(id,Date.now());this.post('invite',{to:id});return true;}
 join(id){if(this.state)return;this.host=id;this.solo=false;this.send(id,{a:'join',name:this.name});this.ctx.notice?.('Подключаемся…');}
 publish(){if(!this.isHost())return;this.server.seq=++this.seq;const s=this.server;this.milestones=window.OrionMilestones?.observe(this.ctx.game,s);if(this.milestones)for(const e of this.milestones.events)this.post('event',{gid:s.id,ev:e.id,sub:e.sub,x:e.x||{}});const view=label=>copy(this.ctx.view?this.ctx.view(s,label):s);this.state=view(this.me);this.ctx.changed(this.state);
  if(!this.solo){if(s.phase==='play'&&typeof document==='object'){if(!this.flushTimer)this.flushTimer=setTimeout(()=>{this.flushTimer=null;this.broadcast();},50);}else this.broadcast();}this.presence();
  if(s.phase==='over'&&!s.reported){s.reported=true;this.ctx.finished?.(s);}
 }
 broadcast(){if(!this.isHost()||this.solo)return;const s=this.server;for(const p of s.players)if(p.l!==this.me)this.send(p.l,{a:'state',s:copy(this.ctx.view?this.ctx.view(s,p.l):s)});}
 receive(from,m){if(!m||typeof m!=='object')return;
  if(m.a==='state'){if(from!==this.host||m.s?.host!==from||!Array.isArray(m.s.players)||!m.s.players.some(p=>p.l===this.me)||this.state?.id===m.s.id&&m.s.seq<=this.state.seq)return;this.state=m.s;this.ctx.changed(this.state);this.presence();return;}
  if(m.a==='reject'&&from===this.host){if(!this.state){this.host=null;this.ctx.notice?.(m.reason==='full'?'Комната заполнена / Room full':'Игра уже началась / Game already started');}return;}
  if(m.a==='resync'&&this.isHost()&&this.server.players.some(p=>p.l===from)){this.send(from,{a:'state',s:copy(this.ctx.view?this.ctx.view(this.server,from):this.server)});return;}
  if(m.a==='closed'&&from===this.host){this.server=null;this.state=null;this.host=null;this.ctx.changed(null);this.ctx.notice?.('Хост закрыл стол');return;}
  if(!this.isHost()||this.solo)return;
  if(m.a==='join'){if(!this.peers.some(p=>p.label===from))return;if(this.server.players.some(p=>p.l===from)){this.publish();return;}if(this.server.phase!=='lobby'||this.occupancy()>=this.capacity()){this.send(from,{a:'reject',reason:this.server.phase==='lobby'?'full':'started'});return;}
   this.server.players.push({l:from,n:String(m.name||'Игрок').slice(0,24),team:this.ctx.game==='codewords'&&this.server.mode!=='coop'?(this.server.players.length%2?'blue':'red'):'red'});this.publish();return;}
  if(m.id!==this.server.id||!this.server.players.some(p=>p.l===from))return;
  if(m.a==='leave'){if(this.server.phase==='lobby')this.server.players=this.server.players.filter(p=>p.l!==from);else this.ctx.depart?.(this.server,from);this.publish();return;}
  if(m.a==='act'&&!(m.action?.type==='start'&&!this.validRoom(this.server))&&this.ctx.action(this.server,from,m.action)!==false)this.publish();
 }
 act(action){if(!this.state)return;if(this.isHost()){if(!(action?.type==='start'&&!this.validRoom(this.server))&&this.ctx.action(this.server,this.me,action)!==false)this.publish();}else this.send(this.host,{a:'act',id:this.state.id,action});}
 step(now){if(this.isHost()&&this.ctx.step?.(this.server,now))this.publish();}
 started(){this.post('start',{gid:this.server.id,players:this.server.players.map(p=>p.l)});}
 leave(render=true){if(this.isHost()){if(!this.solo)for(const p of this.server.players)if(p.l!==this.me)this.send(p.l,{a:'closed'});if(this.server.phase!=='lobby'&&this.server.phase!=='over')this.post('abort',{gid:this.server.id});}
  else if(this.host&&this.state)this.send(this.host,{a:'leave',id:this.state.id});this.server=null;this.state=null;this.host=null;if(render)this.ctx.changed(null);this.presence();}
}
window.OrionParty=Party;window.orionEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
})();
