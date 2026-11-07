/* Handcrafted WebGL miniature; all pick targets come from legal engine actions. */
(()=>{'use strict';
window.createCatanScene=function(host,onPick,onHover,buttons){
if(!window.THREE){host.innerHTML='<p class="sceneError">3D недоступно / 3D unavailable. Проверьте загрузку файлов игры.</p>';return{update(){},select(){},highlightIncome(){}};}
const T=THREE,scene=new T.Scene(),background=0x8dbec0;scene.background=new T.Color(background);scene.fog=new T.Fog(background,20,45);let renderer;
try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch(_){renderer=new CatanSoftware3D();}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputEncoding=T.sRGBEncoding;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.setClearColor(background);host.appendChild(renderer.domElement);
const camera=new T.OrthographicCamera(-8,8,6,-6,.1,100),look=new T.Vector3(0,0,0),ray=new T.Raycaster(),pointer=new T.Vector2(),boardGroup=new T.Group(),pieces=new T.Group(),ghosts=new T.Group(),flora=[],bounces=[],boats=[];scene.add(boardGroup,pieces,ghosts);pieces.userData.softwareLayer=1;ghosts.userData.softwareLayer=2;
// The palette is authored in sRGB. Three r128 lights in linear space, while
// the Canvas fallback uses the palette directly.
function palette(color){
 const value=new T.Color(color);
 return renderer.isSoftware?value:value.convertSRGBToLinear();
}
const sky=new T.HemisphereLight(palette(0xfbfdff),palette(0xbacbcd),.58);
const sun=new T.DirectionalLight(palette(0xfff5e5),.48);
sun.position.set(-7,13,8);
sun.castShadow=true;
sun.shadow.mapSize.set(1024,1024);
Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:.5,far:35});
sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;sun.shadow.radius=4;
const fill=new T.DirectionalLight(palette(0xd8ecf4),.14);
fill.position.set(8,5,-5);
scene.add(sky,sun,fill);
const flat=(color,options)=>new T.MeshBasicMaterial({color:palette(color),...options});
const mat=(color,roughness=.85)=>new T.MeshStandardMaterial({color:palette(color),roughness,flatShading:true}),mats={wood:mat(0x8bb48a),brick:mat(0xc9947b),sheep:mat(0xb8ca8c),wheat:mat(0xdec78b),ore:mat(0xa6a7b3),desert:mat(0xe5d1ad),soil:mat(0xae9477),pine:mat(0x588d76),pine2:mat(0x74a18a),trunk:mat(0x8c7157),wool:mat(0xfff5df),sheepFace:mat(0x78766e),roof:mat(0xad7360),cream:mat(0xffe7b3),road:mat(0x836a52),stone:mat(0xa4a0b2),gold:mat(0xe5bc6c),clay:mat(0xba7a61),water:mat(0x7dbbbd,.4)};
function mesh(g,m,parent=boardGroup,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(parent,x,y,z,w,h,d,m){return mesh(new T.BoxGeometry(w,h,d),m,parent,x,y,z);}
function cone(parent,x,y,z,r,h,m,n=7){return mesh(new T.ConeGeometry(r,h,n),m,parent,x,y,z);}
function sphere(parent,x,y,z,r,m,sx=1,sy=1,sz=1){const o=mesh(new T.SphereGeometry(r,9,6),m,parent,x,y,z);o.scale.set(sx,sy,sz);return o;}
function texture(text,bg='#f7ead0',color='#5c6156',size=128){const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,size,size);x.beginPath();x.arc(size/2,size/2,size*.48,0,Math.PI*2);x.fill();x.fillStyle=color;x.textAlign='center';x.textBaseline='middle';x.font=`700 ${size*.46}px Comfortaa,sans-serif`;x.fillText(String(text),size/2,size*.48);const tex=new T.CanvasTexture(c);tex.encoding=T.sRGBEncoding;return tex;}
function tree(parent,x,z,rnd){const g=new T.Group();g.position.set(x,.15,z);parent.add(g);mesh(new T.CylinderGeometry(.035,.05,.28,6),mats.trunk,g,0,.15,0);cone(g,0,.4,0,.22,.44,rnd>.5?mats.pine:mats.pine2);cone(g,0,.57,0,.15,.34,mats.pine);flora.push({o:g,phase:rnd*20,amp:.025});}
function sheep(parent,x,z,angle){const g=new T.Group();g.position.set(x,.25,z);g.rotation.y=angle;parent.add(g);sphere(g,0,.06,0,.13,mats.wool,1.3,.9,.8);sphere(g,.16,.09,0,.066,mats.sheepFace,.8,1.1,.9);for(const a of [-1,1])for(const b of [-1,1])box(g,a*.075,-.055,b*.06,.025,.09,.025,mats.sheepFace);flora.push({o:g,phase:angle*10,amp:.012});}
function house(parent,color,city=false){const g=new T.Group(),body=mat(color),roof=mat(new T.Color(color).multiplyScalar(.63));box(g,0,.19,0,.3,.28,.26,body);const r=cone(g,0,.4,0,.27,.23,roof,4);r.rotation.y=Math.PI/4;box(g,0,.17,.133,.065,.13,.012,mats.trunk);box(g,-.09,.25,.134,.05,.055,.012,mats.cream);box(g,.09,.25,.134,.05,.055,.012,mats.cream);box(g,.08,.41,-.05,.045,.18,.045,roof);if(city){const tower=box(g,.2,.29,-.08,.2,.5,.2,body);cone(g,.2,.62,-.08,.17,.2,roof,4).rotation.y=Math.PI/4;}parent.add(g);return g;}
const weatherTime={value:0};for(const material of Object.values(mats)){if(material===mats.water)continue;material.onBeforeCompile=shader=>{shader.uniforms.catanTime=weatherTime;shader.vertexShader='varying vec3 vCatanWorld;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCatanWorld=(modelMatrix*vec4(position,1.0)).xyz;');shader.fragmentShader='uniform float catanTime; varying vec3 vCatanWorld;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>','float cloud=sin(vCatanWorld.x*.43+catanTime*.055)*cos(vCatanWorld.z*.37+catanTime*.033)+.35*sin(vCatanWorld.x*.71+vCatanWorld.z*.29-catanTime*.04); gl_FragColor.rgb*=1.0-.22*smoothstep(.12,.8,cloud);\n#include <dithering_fragment>');};}
const weatherGroup=new T.Group(),foam=[],wind=[];scene.add(weatherGroup);let islandRadius=5.8,homeZoom=7.1;
const water=mesh(new T.PlaneGeometry(70,70,renderer.isSoftware?24:80,renderer.isSoftware?24:80),renderer.isSoftware?flat(0x7dbbbd):mats.water,scene,0,-.65,0);water.userData.softwareLayer=-3;water.rotation.x=-Math.PI/2;water.castShadow=false;const waterBase=water.geometry.attributes.position.array.slice();
const sand=mesh(new T.CylinderGeometry(5.8,6.15,.28,72),mat(0xdac9a5),scene,0,-.48,0);sand.userData.softwareLayer=-2;sand.receiveShadow=true;const islandBase=mesh(new T.CylinderGeometry(5.55,5.8,.32,72),mat(0xb3b895),scene,0,-.27,0);islandBase.userData.softwareLayer=-1;
const homeAngle=.72;
let state=null,boardID='',pieceSignature='',selection={kind:'',ids:[]},targetAngle=homeAngle,angle=homeAngle,zoom=7.1,targetZoom=7.1,hover=-1,drag=null;
const tileMeshes=[],incomeHighlights=new T.Group(),dice=[];
let incomeStart=0,rollKey=null,diceStart=0,diceDuration=0;
let viewportWidth=1,viewportHeight=1,outpostLayout='';
scene.add(incomeHighlights);

function outpost(action,button){
 const group=new T.Group();
 group.userData.action=action;
 group.rotation.y=homeAngle;
 group.visible=false;
 scene.add(group);
 const coast=mesh(new T.RingGeometry(1.48,1.55,24),flat(0xd4efdf,{side:T.DoubleSide,transparent:true,opacity:.36,depthWrite:false}),group,0,-.45,0);
 coast.rotation.x=-Math.PI/2;
 coast.castShadow=false;
 coast.userData.softwareLayer=-2.5;
 const beach=mesh(new T.CylinderGeometry(1.32,1.51,.32,20),sand.material,group,0,-.46,0);
 beach.userData.softwareLayer=-2;
 const bluff=mesh(new T.CylinderGeometry(1.12,1.32,.38,20),mats.soil,group,0,-.23,0);
 bluff.userData.softwareLayer=-1;
 const clearing=mesh(new T.CylinderGeometry(1.1,1.14,.12,20),mats.desert,group,0,0,0);
 clearing.userData.softwareLayer=-1;
 return {group,button,coast};
}
const diceOutpost=outpost('roll',buttons.roll);
const tradeOutpost=outpost('trade',buttons.trade);
const outposts=[diceOutpost,tradeOutpost],diceIsland=diceOutpost.group,tradeIsland=tradeOutpost.group;
const canvasPoint=new T.Vector3();

const sailCloth=mat(0xd38c71),marketWood=mat(0xb78a59);
for(const x of [-.63,.63]){
 for(const z of [-.3,.27])box(tradeIsland,x,.39,z,.065,.66,.065,mats.trunk);
}
for(let i=0;i<7;i++){
 const awning=box(tradeIsland,(i-3)*.205,.73,-.03,.21,.045,.83,i%2?sailCloth:mats.wool);
 awning.rotation.x=-.17;
}
box(tradeIsland,0,.3,.13,1.19,.075,.46,marketWood);
box(tradeIsland,0,.16,.13,1.07,.22,.36,mats.trunk);
for(const [x,z] of [[-.72,.44],[.72,.44],[-.51,.57]]){
 box(tradeIsland,x,.155,z,.24,.19,.22,marketWood);
 box(tradeIsland,x,.255,z,.19,.025,.18,mats.road);
}
for(let i=0;i<4;i++)box(tradeIsland,0,-.065,.72+i*.13,.42,.06,.12,mats.trunk);

function layoutOutposts(){
 for(const {group,button,coast} of outposts)coast.material.opacity=button.disabled?.28:.62;
 const key=[angle,zoom,viewportWidth,viewportHeight,boardID].join('|');
 if(key===outpostLayout)return;
 outpostLayout=key;
 for(const {group,button} of outposts){
  canvasPoint.copy(group.position).project(camera);
  const x=(canvasPoint.x+1)*50,y=(1-canvasPoint.y)*50+62/zoom;
  button.hidden=!group.visible||x<6||x>94||y>97;
  button.style.left=x+'%';
  button.style.top=y+'%';
 }
}
sphere(diceIsland,-.8,.06,-.47,.16,mats.stone,1,.5,.85);
sphere(diceIsland,-.65,.065,-.57,.095,mats.stone,1,.6,.9);
sphere(diceIsland,.83,.06,.48,.12,mats.stone,1.1,.58,.8);

const dieFaces=[3,4,1,6,2,5];
const dieNormals=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].map(n=>new T.Vector3(...n));
const dieUp=new T.Vector3(0,1,0),tumble=new T.Quaternion(),tumbleAngles=new T.Euler();
const pipLayouts=[[],[4],[0,8],[0,4,8],[0,2,6,8],[0,2,4,6,8],[0,2,3,5,6,8]];
function dieMaterial(face,color){
 const c=document.createElement('canvas');c.width=c.height=96;
 const ctx=c.getContext('2d');
 ctx.fillStyle=color;ctx.fillRect(0,0,96,96);
 ctx.strokeStyle='#ac9371';ctx.lineWidth=3;
 ctx.beginPath();ctx.roundRect(4,4,88,88,13);ctx.stroke();
 ctx.fillStyle='#5d4d3c';
 for(const pip of pipLayouts[face]){
  ctx.beginPath();ctx.arc(26+pip%3*22,26+Math.floor(pip/3)*22,5.3,0,Math.PI*2);ctx.fill();
 }
 const map=new T.CanvasTexture(c);map.encoding=T.sRGBEncoding;
 return new T.MeshStandardMaterial({map,roughness:.7});
}
const dieSize=.5,dieRestY=.06+dieSize/2;
for(let i=0;i<2;i++){
 const x=i===0?-.46:.46;
 const die=box(diceIsland,x,dieRestY,0,dieSize,dieSize,dieSize,dieFaces.map(face=>dieMaterial(face,i===0?'#fff4d9':'#f4e7c5')));
 die.userData.softwareLayer=1;
 dice.push({die,x,rest:new T.Quaternion()});
}
function settleDice(values){
 for(const [index,{rest}] of dice.entries()){
  const normal=dieNormals[dieFaces.indexOf(values[index])];
  rest.setFromUnitVectors(normal,dieUp);
  rest.premultiply(new T.Quaternion().setFromAxisAngle(dieUp,index===0?-.24:.34));
 }
}
function animateDice(now,reduce){
 const progress=diceDuration&&!reduce?Math.min(1,(now-diceStart)/diceDuration):1;
 const spin=1-progress;
 const jump=progress<.75?.92*Math.sin(Math.PI*progress/.75):.12*Math.sin(Math.PI*(progress-.75)/.25);
 for(const [i,{die,x,rest}] of dice.entries()){
  const direction=i===0?1:-1;
  die.position.set(x*(1-.32*spin),dieRestY+jump,spin*direction*.2);
  tumbleAngles.set(spin*Math.PI*4,spin*direction*Math.PI*3,spin*direction*Math.PI*2);
  die.quaternion.copy(rest).multiply(tumble.setFromEuler(tumbleAngles));
 }
 if(progress===1)diceDuration=0;
}
function rng(seed){let a=seed|0;return()=>{a=(Math.imul(a,1664525)+1013904223)|0;return(a>>>0)/4294967296;};}
function clearGroup(group){for(const child of [...group.children]){child.traverse(o=>{o.geometry?.dispose();const list=Array.isArray(o.material)?o.material:[o.material];for(const m of list)if(m&&!Object.values(mats).includes(m)){m.map?.dispose();m.dispose();}});group.remove(child);}}
function portLabel(parent,text,x,z){const c=document.createElement('canvas');c.width=256;c.height=80;const ctx=c.getContext('2d');ctx.fillStyle='#faf0d6';ctx.beginPath();ctx.roundRect(2,2,252,76,20);ctx.fill();ctx.fillStyle='#58755f';ctx.font='600 34px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,128,42);const tex=new T.CanvasTexture(c);tex.encoding=T.sRGBEncoding;const label=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthTest:false}));label.position.set(x,.48,z);label.scale.set(.85,.27,1);parent.add(label);}
function buildBoard(s){clearGroup(weatherGroup);foam.length=0;wind.length=0;islandRadius=Math.max(...s.board.nodes.map(n=>Math.hypot(n.x,n.z)))+.8;const scale=islandRadius/5.8;sand.scale.set(scale,1,scale);islandBase.scale.set(scale,1,scale);const distance=islandRadius+1.86;
for(const [index,{group}] of outposts.entries()){
 const side=index===0?1:-1,depth=index===0?1.15:-1.5;
 group.position.set(Math.cos(homeAngle)*distance*side+Math.sin(homeAngle)*depth,0,-Math.sin(homeAngle)*distance*side+Math.cos(homeAngle)*depth);
 group.visible=true;
}
const aspect=Math.max(1,host.clientWidth)/Math.max(1,host.clientHeight);
homeZoom=Math.max(7.1*scale,(distance+1.8)/aspect);
angle=targetAngle=homeAngle;
zoom=targetZoom=homeZoom;
outpostLayout='';
resize();
const weatherRand=rng(9301);for(let i=0;i<70;i++){const a=weatherRand()*Math.PI*2,r=islandRadius+.6+weatherRand()*9,m=flat(i%3?0xd2efdf:0xf8f6dd,{transparent:true,opacity:.2,side:T.DoubleSide,depthWrite:false}),o=mesh(new T.RingGeometry(.3,.32,12,1,0,Math.PI*(.3+weatherRand()*.35)),m,weatherGroup,Math.cos(a)*r,-.52,Math.sin(a)*r);o.rotation.x=-Math.PI/2;o.rotation.z=a;const len=.7+weatherRand()*1.4;o.scale.set(len,.5,1);o.castShadow=false;o.userData.softwareLayer=-2.5;foam.push({o,x:o.position.x,z:o.position.z,phase:weatherRand()*7});}
for(const edge of s.board.edges.filter(e=>e.tiles.length===1)){const a=s.board.nodes[edge.a],b=s.board.nodes[edge.b],mx=(a.x+b.x)/2,mz=(a.z+b.z)/2,len=Math.hypot(mx,mz),o=mesh(new T.RingGeometry(.27,.3,8,1,0,Math.PI),flat(0xfff5dd,{transparent:true,opacity:.38,side:T.DoubleSide,depthWrite:false}),weatherGroup,mx/len*(islandRadius+.12),-.48,mz/len*(islandRadius+.12));o.rotation.x=-Math.PI/2;o.rotation.z=-Math.atan2(mz,mx);o.scale.set(1.7,.55,1);o.castShadow=false;o.userData.softwareLayer=-2.5;foam.push({o,x:o.position.x,z:o.position.z,phase:weatherRand()*7});}
for(let i=0;i<14;i++){const o=mesh(new T.SphereGeometry(.025,6,4),flat(0xfff7d8,{transparent:true,opacity:.25,depthWrite:false}),weatherGroup,0,0,0);o.scale.set(9,.3,.5);o.castShadow=false;wind.push({o,phase:weatherRand(),z:(weatherRand()-.5)*islandRadius*2,y:.5+weatherRand()*1.6});}
clearGroup(boardGroup);for(const b of boats){scene.remove(b);b.traverse(o=>o.geometry?.dispose());}flora.length=0;boats.length=0;tileMeshes.length=0;const rnd=rng(8371);for(const t of s.board.tiles){const parent=new T.Group();parent.position.set(t.x,0,t.z);boardGroup.add(parent);const tile=mesh(new T.CylinderGeometry(.965,1,.25,6),mats[t.type],parent,0,0,0);tile.userData.tile=t.id;tileMeshes.push(tile);mesh(new T.CylinderGeometry(.97,.97,.035,6),mats.soil,parent,0,-.145,0);
 const spots=Array.from({length:9},(_,i)=>{const a=i*.8+1.3,r=.4+rnd()*.24;return{x:Math.cos(a)*r,z:Math.sin(a)*r};});
 if(t.type==='wood')spots.slice(0,renderer.isSoftware?5:7).forEach(p=>tree(parent,p.x,p.z,rnd()));
 if(t.type==='sheep'){spots.slice(0,renderer.isSoftware?2:4).forEach((p,i)=>sheep(parent,p.x,p.z,i*1.5));for(const p of spots.slice(4))sphere(parent,p.x,.16,p.z,.035,mat(0xe6d3a2));}
 if(t.type==='wheat')for(const p of spots.slice(0,renderer.isSoftware?5:9)){const g=new T.Group();g.position.set(p.x,.13,p.z);parent.add(g);for(let k=0;k<3;k++){box(g,k*.045-.045,.12,0,.014,.24,.014,mats.gold);sphere(g,k*.045-.045,.25,0,.025,mats.cream,.7,1.9,.7);}flora.push({o:g,phase:rnd()*9,amp:.07});}
 if(t.type==='ore')for(const [i,p]of spots.slice(0,3).entries()){const m=cone(parent,p.x,.31+i*.08,p.z,.29,.58+i*.15,i===1?mats.stone:mat(0x8d96a5),5);m.rotation.y=rnd()*3;sphere(parent,p.x,.5+i*.09,p.z,.09,mats.cream,1,.5,1);}
 if(t.type==='brick')for(const p of spots.slice(0,6)){const m=mesh(new T.DodecahedronGeometry(.16+rnd()*.07),mats.clay,parent,p.x,.21,p.z);m.scale.y=.7;m.rotation.set(rnd(),rnd(),rnd());}
 if(t.type==='desert'){for(const p of spots.slice(0,4))sphere(parent,p.x,.15,p.z,.19,mat(0xebd9b5),1,.3,1);box(parent,-.45,.28,.1,.045,.28,.045,mats.pine2);box(parent,-.36,.31,.1,.16,.035,.035,mats.pine2);}
 if(t.number){const token=mesh(new T.CylinderGeometry(.26,.27,.055,32),mats.cream,parent,0,.17,0),disc=mesh(new T.CircleGeometry(.245,32),new T.MeshBasicMaterial({map:texture(t.number,'#f8edcf',[6,8].includes(t.number)?'#b86f55':'#59624f'),transparent:true}),parent,0,.2,0);disc.rotation.x=-Math.PI/2;token.castShadow=false;}
 }
 for(const port of s.board.ports){const e=s.board.edges[port.edge],a=s.board.nodes[e.a],b=s.board.nodes[e.b],x=(a.x+b.x)/2,z=(a.z+b.z)/2,l=Math.hypot(x,z),ox=x/l,oz=z/l,g=new T.Group();g.position.set(x+ox*.25,-.12,z+oz*.25);g.rotation.y=Math.atan2(ox,oz);boardGroup.add(g);for(let i=0;i<5;i++)box(g,0,0,i*.1,.32,.045,.07,mats.trunk);for(const p of [-.11,.11])for(const dz of [0,.4])box(g,p,-.08,dz,.04,.2,.04,mats.trunk);const boat=new T.Group();boat.position.set(x+ox*.85,-.4,z+oz*.85);boat.rotation.y=g.rotation.y+.5;scene.add(boat);sphere(boat,0,0,0,.22,mats.trunk,.65,.3,1.4);box(boat,0,.25,0,.025,.5,.025,mats.gold);const sail=mesh(new T.ConeGeometry(.2,.36,3),mats.cream,boat,.05,.3,0);sail.scale.z=.08;boats.push(boat);portLabel(boardGroup,(port.resource?{wood:'🌲',brick:'🧱',sheep:'🐑',wheat:'🌾',ore:'🪨'}[port.resource]+' 2:1':'⚓ 3:1'),x+ox*.95,z+oz*.95);}
}
function updatePieces(s){clearGroup(pieces);bounces.length=0;for(const e of s.board.edges)if(e.owner){const p=s.seats.find(p=>p.l===e.owner),a=s.board.nodes[e.a],b=s.board.nodes[e.b],g=new T.Group();g.position.set((a.x+b.x)/2,.19,(a.z+b.z)/2);g.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);pieces.add(g);box(g,0,0,0,.12,.12,.8,mat(OrionCatan.COLORS[p.color]));for(let i=-2;i<=2;i++)box(g,0,.05,i*.13,.15,.035,.035,mat(OrionCatan.COLORS[p.color]));}
 for(const n of s.board.nodes)if(n.owner){const p=s.seats.find(p=>p.l===n.owner),h=house(pieces,OrionCatan.COLORS[p.color],n.city);h.position.set(n.x,.14,n.z);h.rotation.y=(n.id%3)*Math.PI/3;bounces.push({o:h,t:performance.now()});}
 const rt=s.board.tiles[s.robber],robber=new T.Group();robber.position.set(rt.x+.28,.26,rt.z+.05);pieces.add(robber);robber.visible=s.settings.robber!==false;cone(robber,0,.15,0,.12,.3,mat(0x62647c));sphere(robber,0,.35,0,.09,mat(0x62647c));sphere(robber,-.1,.12,.05,.07,mats.trunk);
}
function select(next){selection=next||{kind:'',ids:[]};clearGroup(ghosts);if(!state?.board)return;for(const id of selection.ids){let o;if(selection.kind==='road'){const e=state.board.edges[id],a=state.board.nodes[e.a],b=state.board.nodes[e.b];o=mesh(new T.BoxGeometry(.18,.1,.8),flat(0xfbf0b6,{transparent:true,opacity:.8}),ghosts,(a.x+b.x)/2,.26,(a.z+b.z)/2);o.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);}else{const n=selection.kind==='robber'?state.board.tiles[id]:state.board.nodes[id];o=mesh(new T.CylinderGeometry(selection.kind==='robber'?.36:.18,selection.kind==='robber'?.36:.18,.045,24),flat(0xfbf0b6,{transparent:true,opacity:.85}),ghosts,n.x,.3,n.z);}o.userData.pick=id;o.userData.kind=selection.kind;o.castShadow=false;}}
function highlightIncome(ids){
 clearGroup(incomeHighlights);
 incomeStart=performance.now();
 for(const id of ids){
  const tile=state.board.tiles[id];
  const glaze=mesh(new T.CylinderGeometry(.96,.96,.012,6),flat(0xffe9a0,{transparent:true,opacity:.46,depthWrite:false}),incomeHighlights,tile.x,.14,tile.z);
  const rim=mesh(new T.RingGeometry(.89,.96,6,1,Math.PI/6),flat(0xffed9a,{side:T.DoubleSide,transparent:true,opacity:.95,depthWrite:false}),incomeHighlights,tile.x,.152,tile.z);
  rim.rotation.x=-Math.PI/2;
  for(const [o,opacity] of [[glaze,.46],[rim,.95]]){
   o.castShadow=false;
   o.receiveShadow=false;
   o.userData.opacity=opacity;
   o.renderOrder=2;
  }
 }
}
function animateIncome(now,reduce){
 if(!incomeHighlights.children.length)return;
 const progress=Math.min(1,(now-incomeStart)/680);
 if(progress===1){clearGroup(incomeHighlights);return;}
 const pulse=reduce?1:Math.min(1,progress*12,(1-progress)*4);
 for(const o of incomeHighlights.children)o.material.opacity=o.userData.opacity*pulse;
}
function update(s,roll,tossDuration){
 state=s;
 if(!s?.board)return;
 if(boardID!==s.id){
  boardID=s.id;
  buildBoard(s);
  pieceSignature='';
  rollKey=null;
  diceDuration=0;
  clearGroup(incomeHighlights);
  settleDice([1,1]);
  animateDice(performance.now(),true);
 }
 const signature=JSON.stringify([s.board.edges.map(e=>e.owner),s.board.nodes.map(n=>[n.owner,n.city]),s.robber]);
 if(signature!==pieceSignature){
  pieceSignature=signature;
  updatePieces(s);
  select(selection);
 }
 if(roll&&roll.serial!==rollKey){
  rollKey=roll.serial;
  diceStart=performance.now();
  diceDuration=tossDuration;
  settleDice(roll.dice);
  if(!diceDuration)animateDice(diceStart,true);
 }
}
function resize(){
 viewportWidth=Math.max(1,host.clientWidth);
 viewportHeight=Math.max(1,host.clientHeight);
 renderer.setSize(viewportWidth,viewportHeight,false);
 const halfWidth=zoom*viewportWidth/viewportHeight;
 camera.left=-halfWidth;camera.right=halfWidth;camera.top=zoom;camera.bottom=-zoom;
 camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);
function pointerTarget(e){
 const rect=renderer.domElement.getBoundingClientRect();
 pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
 ray.setFromCamera(pointer,camera);
 const build=ray.intersectObjects(ghosts.children)[0];
 const islands=outposts.filter(({group,button})=>group.visible&&!button.disabled).map(({group})=>group);
 const hit=ray.intersectObjects(islands,true)[0];
 if(hit&&(!build||hit.distance<build.distance)){
  const land=ray.intersectObjects([sand,...tileMeshes])[0];
  if(!land||hit.distance<land.distance){
   let group=hit.object;
   while(!group.userData.action)group=group.parent;
   return {kind:group.userData.action};
  }
 }
 return build?.object.userData;
}
renderer.domElement.addEventListener('pointerdown',e=>{
 drag={x:e.clientX,y:e.clientY,angle:targetAngle,moved:false};
 renderer.domElement.setPointerCapture(e.pointerId);
});
renderer.domElement.addEventListener('pointermove',e=>{
 if(drag){
  if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>5)drag.moved=true;
  if(drag.moved)targetAngle=drag.angle-(e.clientX-drag.x)*.006;
  return;
 }
 const target=pointerTarget(e);
 renderer.domElement.style.cursor=target?'pointer':'grab';
 const tile=target?.pick===undefined&&target?undefined:ray.intersectObjects(tileMeshes)[0];
 const next=tile?.object.userData.tile??-1;
 if(next!==hover){hover=next;onHover?.(hover);}
});
renderer.domElement.addEventListener('pointerup',e=>{
 if(drag&&!drag.moved){
  const target=pointerTarget(e);
  if(target)onPick(target.kind,target.pick);
 }
 drag=null;
});
renderer.domElement.addEventListener('pointercancel',()=>drag=null);
renderer.domElement.addEventListener('pointerleave',()=>{hover=-1;onHover?.(hover);});
renderer.domElement.addEventListener('wheel',e=>{
 e.preventDefault();
 targetZoom=T.MathUtils.clamp(targetZoom+e.deltaY*.006,4.6,homeZoom*1.45);
},{passive:false});
renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
function frame(now){requestAnimationFrame(frame);if(!host.getClientRects().length)return;angle+=(targetAngle-angle)*.07;const oldZoom=zoom;zoom+=(targetZoom-zoom)*.09;if(Math.abs(oldZoom-zoom)>.001)resize();camera.position.set(Math.sin(angle)*11,12,Math.cos(angle)*11);camera.lookAt(look);camera.updateMatrixWorld();layoutOutposts();const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,time=now*.001;weatherTime.value=reduce?0:time;scene.userData.catanWeatherTime=weatherTime.value;for(const f of foam){const t=reduce?0:time*.65+f.phase;f.o.position.x=f.x+Math.sin(t)*.08;f.o.position.z=f.z+Math.cos(t)*.06;f.o.material.opacity=.12+(Math.sin(t)+1)*.12;}for(const f of wind){const t=(time*.035+f.phase)%1;f.o.visible=!reduce;f.o.position.set((t-.5)*(islandRadius*3),f.y+Math.sin(time+f.phase)*.08,f.z+Math.sin(t*Math.PI*2)*.3);f.o.material.opacity=Math.sin(t*Math.PI)*.18;}for(const f of flora)f.o.rotation.z=reduce?0:(Math.sin(time*1.4+f.phase)+Math.sin(time*.43)*.7)*f.amp;for(const [i,b]of boats.entries()){b.position.y=-.4+(reduce?0:Math.sin(time*1.2+i)*.05);b.rotation.z=reduce?0:Math.sin(time*.8+i)*.025;}for(const g of ghosts.children)g.material.opacity=.65+(reduce?0:Math.sin(time*3)*.18);for(let i=bounces.length-1;i>=0;i--){const b=bounces[i],t=Math.min(1,(now-b.t)/500),v=reduce?1:1+Math.sin(t*Math.PI)*.12;b.o.scale.set(1,v,1);if(t===1)bounces.splice(i,1);}animateIncome(now,reduce);if(diceDuration)animateDice(now,reduce);const pos=water.geometry.attributes.position;for(let i=0;i<pos.count;i++)pos.array[i*3+2]=reduce?0:Math.sin(waterBase[i*3]*.8+time*.95)*.09+Math.cos(waterBase[i*3+1]*.65+time*.8)*.055;pos.needsUpdate=true;if(!renderer.isSoftware)water.geometry.computeVertexNormals();renderer.render(scene,camera);}
resize();requestAnimationFrame(frame);return{update,select,highlightIncome};
};})();
