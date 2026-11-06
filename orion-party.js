/* Shared game-room protocol over the portal's existing lobby transport. */
(()=>{'use strict';const copy=x=>JSON.parse(JSON.stringify(x));
class Party{
 constructor(ctx){this.ctx=ctx;this.me='local';this.name='Игрок';this.peers=[];this.inLobby=false;this.state=null;this.server=null;this.host=null;this.seq=0;this.pending=null;this.solo=false;this.embedded=parent!==window&&!!parent.__gameShell;
  addEventListener('message',e=>{if(!this.embedded||e.source!==parent||e.data?.svo!==1)return;const m=e.data;
   if(m.type==='hello'||m.type==='peers'){if(m.me)this.me=m.me;if(m.name)this.name=m.name;this.inLobby=!!m.inLobby;this.peers=Array.isArray(m.peers)?m.peers:[];if(m.lang)ctx.language?.(m.lang);if(m.type==='hello'&&this.pending){const id=this.pending;this.pending=null;this.join(id);}ctx.lobby?.();}
   else if(m.type==='ev'&&m.k==='g'&&m.d?.game===ctx.game)this.receive(m.from,m.d.m);
   else if(m.type==='accept'){if(this.me==='local')this.pending=m.from;else this.join(m.from);}
   else if(m.type==='lang')ctx.language?.(m.lang);
  });
  this.post('ready');setInterval(()=>this.presence(),700);addEventListener('pagehide',()=>this.leave(false));
 }
 post(type,args={}){if(this.embedded)parent.postMessage({svo:1,type,...args},'*');}
 send(to,d){this.post('emit',{to,d});}
 isHost(){return !!this.server&&this.host===this.me;}
 presence(){this.post('gp',{d:{n:this.name,host:this.isHost()&&this.server.phase==='lobby'?1:0,cnt:this.state?.players?.length||0,busy:!!this.state,gid:this.state?.phase!=='lobby'?this.state?.id:null}});}
 create(mode,solo=false){this.leave(false);this.solo=solo;this.host=this.me;this.seq=0;this.server=this.ctx.create(this.me,this.name,mode,solo);this.server.id=Date.now().toString(36)+Math.random().toString(36).slice(2,8);this.server.host=this.me;this.publish();this.presence();}
 join(id){if(this.state)return;this.host=id;this.solo=false;this.send(id,{a:'join',name:this.name});this.ctx.notice?.('Подключаемся…');}
 publish(){if(!this.isHost())return;this.server.seq=++this.seq;const s=this.server;const view=label=>copy(this.ctx.view?this.ctx.view(s,label):s);this.state=view(this.me);this.ctx.changed(this.state);
  if(!this.solo)for(const p of s.players)if(p.l!==this.me)this.send(p.l,{a:'state',s:view(p.l)});this.presence();
  if(s.phase==='over'&&!s.reported){s.reported=true;this.ctx.finished?.(s);}
 }
 receive(from,m){if(!m||typeof m!=='object')return;
  if(m.a==='state'){if(from!==this.host||m.s?.host!==from||!Array.isArray(m.s.players)||!m.s.players.some(p=>p.l===this.me)||this.state?.id===m.s.id&&m.s.seq<=this.state.seq)return;this.state=m.s;this.ctx.changed(this.state);this.presence();return;}
  if(m.a==='closed'&&from===this.host){this.server=null;this.state=null;this.host=null;this.ctx.changed(null);this.ctx.notice?.('Хост закрыл стол');return;}
  if(!this.isHost()||this.solo)return;
  if(m.a==='join'){if(this.server.phase!=='lobby'||this.server.players.length>=(this.server.mode==='duel'?2:this.ctx.limit)){this.send(from,{a:'closed'});return;}if(!this.peers.some(p=>p.label===from&&p.w===this.ctx.game))return;
   if(!this.server.players.some(p=>p.l===from))this.server.players.push({l:from,n:String(m.name||'Игрок').slice(0,24),team:this.ctx.game==='codewords'&&this.server.mode!=='coop'?(this.server.players.length%2?'blue':'red'):'red'});this.publish();return;}
  if(m.id!==this.server.id||!this.server.players.some(p=>p.l===from))return;
  if(m.a==='leave'){if(this.server.phase==='lobby')this.server.players=this.server.players.filter(p=>p.l!==from);else this.ctx.depart?.(this.server,from);this.publish();return;}
  if(m.a==='act'&&this.ctx.action(this.server,from,m.action)!==false)this.publish();
 }
 act(action){if(!this.state)return;if(this.isHost()){if(this.ctx.action(this.server,this.me,action)!==false)this.publish();}else this.send(this.host,{a:'act',id:this.state.id,action});}
 step(now){if(this.isHost()&&this.ctx.step?.(this.server,now))this.publish();}
 started(){this.post('start',{gid:this.server.id,players:this.server.players.map(p=>p.l)});}
 leave(render=true){if(this.isHost()){if(!this.solo)for(const p of this.server.players)if(p.l!==this.me)this.send(p.l,{a:'closed'});if(this.server.phase!=='lobby'&&this.server.phase!=='over')this.post('abort',{gid:this.server.id});}
  else if(this.host&&this.state)this.send(this.host,{a:'leave',id:this.state.id});this.server=null;this.state=null;this.host=null;if(render)this.ctx.changed(null);this.presence();}
}
window.OrionParty=Party;window.orionEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
})();
