/* Geometry shared by wheel rendering and its size animation. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.OrionWheel=api;
})(typeof window==='object'?window:globalThis,function(){
  'use strict';
  const point=(angle,radius)=>{const a=(angle-90)*Math.PI/180;return[210+Math.cos(a)*radius,210+Math.sin(a)*radius];};
  function path(sector){
    const p=point(sector.start,199),m=point((sector.start+sector.end)/2,199),q=point(sector.end,199);
    // Two arcs also represent a full circle and keep the same path structure
    // while a single enabled game expands to 360 degrees.
    return `M210 210L${p.join(' ')}A199 199 0 0 1 ${m.join(' ')}A199 199 0 0 1 ${q.join(' ')}Z`;
  }
  function interpolate(from,to,progress){
    const t=Math.max(0,Math.min(1,progress)),old=new Map(from.map(s=>[s.id,s]));
    return to.map(s=>{const p=old.get(s.id)||{start:s.start,end:s.start};const start=p.start+(s.start-p.start)*t,end=p.end+(s.end-p.end)*t;return{...s,start,end,mid:(start+end)/2};});
  }
  return{point,path,interpolate};
});
