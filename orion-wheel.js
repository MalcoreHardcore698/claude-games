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
  const colors=['#ef947e','#65c7bc','#bda0ef','#edca72','#7cace8','#da8bc3','#a7c56d','#ed9e5e','#7cd4df'];
  const color=index=>colors[index]||`hsl(${Math.round(index*137.508)%360} 65% 68%)`;
  function visibleLabel(sector,label){const span=sector.end-sector.start;const room=2*137*Math.sin(Math.min(180,span)*Math.PI/360)-14;return span>=22&&String(label).length*6<=room;}
  return{point,path,interpolate,color,visibleLabel};
});
