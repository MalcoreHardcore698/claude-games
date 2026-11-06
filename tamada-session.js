/* Authoritative lobby navigation, separate from the voting game state. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrionTamadaSession=api;})(typeof window==='object'?window:globalThis,function(){
  'use strict';
  const clone=x=>x?JSON.parse(JSON.stringify(x)):null;
  function valid(c){return c&&['idle','select','session'].includes(c.phase)&&typeof c.host==='string'&&typeof c.visit==='string'&&Number.isSafeInteger(c.seq)&&c.seq>=0&&(c.phase!=='session'||typeof c.session==='string');}
  class Session{
    constructor(ctx){this.ctx=ctx;this.control=null;this.snapshot=null;this.room=ctx.room()||'';this.notified='';this.restore();}
    key(){return 'orion.tamada.session.'+this.room;}
    owner(){return this.ctx.host()||this.control?.host||null;}
    isHost(){return !this.ctx.room()||this.ctx.host()===this.ctx.me();}
    locked(){return !!this.ctx.room()&&this.control?.phase==='session'&&!this.isHost();}
    canOpen(){return this.isHost();}
    active(s){return this.control?.phase==='session'&&s?.id===this.control.session;}
    restore(){try{const saved=JSON.parse(this.ctx.storage.getItem(this.key())||'null');if(this.room&&saved?.room===this.room&&valid(saved.control)){this.control=saved.control;this.snapshot=saved.snapshot||null;}}catch(_){} }
    save(){try{if(this.room)this.ctx.storage.setItem(this.key(),JSON.stringify({room:this.room,control:this.control,snapshot:this.snapshot}));}catch(_){} }
    announce(previous){this.save();this.ctx.change?.(this.control,previous);if(this.control?.phase==='select'&&!this.isHost()&&this.notified!==this.control.visit){this.notified=this.control.visit;this.ctx.notice?.();}}
    publish(phase,extra={}){if(!this.isHost())return false;const previous=this.control;
      this.control={host:this.ctx.me(),visit:phase==='select'?this.ctx.id():previous?.visit||this.ctx.id(),seq:Math.max(Date.now(),(previous?.seq||0)+1),session:previous?.session||null,phase,...extra};
      this.announce(previous);this.ctx.send(clone(this.control));return true;}
    select(){return this.publish('select',{session:null,game:null});}
    activate(snapshot){if(!this.isHost())return;this.snapshot=clone(snapshot);if(!this.active(snapshot))this.publish('session',{session:snapshot.id,game:null});else this.save();}
    remember(snapshot){if(!snapshot||!this.active(snapshot))return;this.snapshot=clone(snapshot);this.save();}
    end(game=null){return this.publish('idle',{game});}
    receive(from,control){const authority=this.ctx.host();if(!authority||from!==authority||!valid(control)||control.host!==from)return false;
      if(this.control&&this.control.host===from&&control.seq<=this.control.seq)return false;
      const previous=this.control;this.control=clone(control);if(control.phase==='select')this.snapshot=null;this.announce(previous);return true;}
    observe(leader){
      const room=this.ctx.room()||'';
      if(room!==this.room){const previous=this.control;this.room=room;this.control=null;this.snapshot=null;this.notified='';this.restore();this.ctx.change?.(this.control,previous);}
      if(!room)return;
      if(this.ctx.host()===this.ctx.me()&&this.control&&this.control.host!==this.ctx.me()){
        const phase=this.control.phase,session=this.control.session,game=this.control.game;this.publish(phase,{session,game});return;
      }
      if(leader&&leader.label===this.ctx.host()){
        if(leader.p?.tgc)this.receive(leader.label,leader.p.tgc);
        else if(this.control&&this.control.host!==this.ctx.me()){const previous=this.control;this.control=null;this.snapshot=null;this.announce(previous);}
      }
    }
    clear(){const previous=this.control;try{this.ctx.storage.removeItem(this.key());}catch(_){}this.control=null;this.snapshot=null;this.room='';this.notified='';this.ctx.change?.(null,previous);}
  }
  return {Session,valid};
});
