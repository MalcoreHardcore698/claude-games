(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrionTetris=api;})(typeof window==='object'?window:globalThis,()=>{
'use strict';const SHAPES={I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],O:[[1,1],[1,1]],T:[[0,1,0],[1,1,1],[0,0,0]],S:[[0,1,1],[1,1,0],[0,0,0]],Z:[[1,1,0],[0,1,1],[0,0,0]],J:[[1,0,0],[1,1,1],[0,0,0]],L:[[0,0,1],[1,1,1],[0,0,0]]};
const COLORS=['#63d8cd','#bf89fa','#ffcb69','#7ebaff','#f98eac','#a6df70'];
const TYPES=Object.keys(SHAPES),PIECE_COLORS={I:'#62d9e8',O:'#f4d16c',T:'#b888e9',S:'#82cf8a',Z:'#ed7d91',J:'#729cf1',L:'#f5a167'};
const pieceColor=type=>PIECE_COLORS[type]||PIECE_COLORS.I;
const encodeCell=(type,owner)=>owner*8+TYPES.indexOf(type)+1;
const decodeCell=value=>({type:TYPES[(value-1)%8],owner:Math.floor((value-1)/8)});
function random(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
function matrix(type,rotation=0){let a=SHAPES[type].map(r=>r.slice());for(let i=0;i<rotation;i++)a=a[0].map((_,x)=>a.map(r=>r[x]).reverse());return a;}
function cells(p){const out=[];matrix(p.type,p.rot).forEach((row,y)=>row.forEach((v,x)=>{if(v)out.push([p.x+x,p.y+y]);}));return out;}
function fits(s,p,ignoreOthers=false){for(const [x,y]of cells(p)){if(x<0||x>=s.width||y>=s.height||y>=0&&s.board[y][x])return false;if(!ignoreOthers)for(const [id,o]of Object.entries(s.pieces))if(id!==p.id&&cells(o).some(c=>c[0]===x&&c[1]===y))return false;}return true;}
function take(s,id){const bag=s.bags[id]??=[];if(!bag.length){bag.push(...Object.keys(SHAPES));for(let i=bag.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}}return bag.pop();}
function spawn(s,id,type){const i=s.players.findIndex(p=>p.l===id),x=Math.round((i+.5)*s.width/s.players.length)-2;const p={id,type:type||s.next[id]||take(s,id),rot:0,x,y:0,lockAt:0};s.next[id]=take(s,id);s.holdUsed[id]=false;
 if(!fits(s,p)){s.phase='over';s.reason='top';return false;}s.pieces[id]=p;return true;}
function create(id,name){return{phase:'lobby',players:[{l:id,n:name}],width:10,height:22,lines:0,score:0,level:1,seed:Date.now()>>>0,pieces:{},board:[],next:{},holds:{},holdUsed:{},bags:{},fallAt:{},drops:{}};}
function start(s,now=Date.now()){s.phase='play';s.width=10+4*(s.players.length-1);s.board=Array.from({length:s.height},()=>Array(s.width).fill(0));s.lines=0;s.score=0;s.level=1;s.pieces={};s.next={};s.holds={};s.holdUsed={};s.bags={};s.fallAt={};s.drops={};s.startedAt=now;s.lastClear=null;for(const p of s.players){spawn(s,p.l);s.fallAt[p.l]=now+800;}}
function move(s,id,dx,dy){const p=s.pieces[id];if(!p)return false;const q={...p,x:p.x+dx,y:p.y+dy};if(!fits(s,q))return false;q.lockAt=0;s.pieces[id]=q;return true;}
function lock(s,id,now){const p=s.pieces[id];if(!p)return;const color=encodeCell(p.type,s.players.findIndex(x=>x.l===id));const occupied=cells(p);if(occupied.some(c=>c[1]<0)){s.phase='over';return;}
 for(const [x,y]of occupied)s.board[y][x]=color;delete s.pieces[id];s.drops[id]=(s.drops[id]||0)+1;
 const full=[];s.board.forEach((row,y)=>{if(row.every(Boolean))full.push(y);});if(full.length){s.board=s.board.filter((_,y)=>!full.includes(y));while(s.board.length<s.height)s.board.unshift(Array(s.width).fill(0));s.lines+=full.length;s.score+=([0,100,300,500,800][Math.min(4,full.length)]||800)*s.level;s.level=1+Math.floor(s.lines/10);s.clearAt=now;s.cleared=full;s.lastClear={by:id,n:full.length};
  for(const q of Object.values(s.pieces)){q.y+=full.filter(y=>y>Math.max(...cells(q).map(c=>c[1]))).length;let attempts=0;while(!fits(s,q,true)&&attempts++<s.height)q.y--;if(q.y<-4){s.phase='over';return;}q.lockAt=0;}
 }
 spawn(s,id);s.fallAt[id]=now+Math.max(90,800-(s.level-1)*55);
}
function action(s,id,a,now=Date.now()){if(!a||typeof a!=='object')return false;
 if(a.type==='start'&&id===s.host&&s.phase==='lobby'){start(s,now);return true;}
 if(a.type==='pause'&&id===s.host&&['play','pause'].includes(s.phase)){if(s.phase==='pause'){for(const key in s.fallAt)s.fallAt[key]=now+500;s.phase='play';}else{s.phase='pause';}return true;}
 if(s.phase!=='play'||!s.pieces[id])return false;const p=s.pieces[id];
 if(a.type==='move')return move(s,id,a.dx===-1?-1:1,0);
 if(a.type==='soft'){if(move(s,id,0,1)){s.score++;return true;}return false;}
 if(a.type==='rotate'){const rot=(p.rot+(a.dir===-1?3:1))%4;for(const dx of [0,-1,1,-2,2]){const q={...p,rot,x:p.x+dx,lockAt:0};if(fits(s,q)){s.pieces[id]=q;return true;}}return false;}
 if(a.type==='drop'){let n=0;while(move(s,id,0,1))n++;s.score+=n*2;lock(s,id,now);return true;}
 if(a.type==='hold'&&!s.holdUsed[id]){const old=s.holds[id],next=s.next[id];s.holds[id]=p.type;delete s.pieces[id];spawn(s,id,old);if(old)s.next[id]=next;s.holdUsed[id]=true;s.fallAt[id]=now+650;return true;}return false;
}
function step(s,now){if(s.phase!=='play')return false;let changed=false;for(const player of s.players){const id=player.l,p=s.pieces[id];if(!p)continue;
 if(now>=(s.fallAt[id]||0)){s.fallAt[id]=now+Math.max(90,800-(s.level-1)*55);if(move(s,id,0,1))changed=true;}
 const current=s.pieces[id];if(!current)continue;const below={...current,y:current.y+1};if(!fits(s,below)){if(fits(s,below,true)){current.lockAt=0;continue;}if(!current.lockAt)current.lockAt=now+350;if(now>=current.lockAt){lock(s,id,now);changed=true;}}else current.lockAt=0;
 if(s.phase==='over')break;
 }return changed;}
function ghost(s,p){const q={...p};while(fits(s,{...q,y:q.y+1}))q.y++;return q;}
return{SHAPES,COLORS,PIECE_COLORS,pieceColor,encodeCell,decodeCell,matrix,cells,fits,create,start,action,step,ghost};});
