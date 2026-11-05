const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function carousel() {
  const handlers = new Map(), calls = [], timers = [];
  const classes = () => ({ add(){},remove(){},toggle(){} });
  const slides = [0,820,1640].map(offsetLeft=>({offsetLeft,classList:classes(),setAttribute(){},querySelectorAll(){return[];}}));
  let captured = false;
  const track = {
    children:slides,offsetLeft:0,scrollLeft:0,scrollWidth:2440,clientWidth:1000,classList:classes(),
    addEventListener:(type,fn)=>handlers.set(type,fn),
    setPointerCapture(){captured=true;},hasPointerCapture(){return captured;},releasePointerCapture(){captured=false;},
    scrollTo(o){calls.push(o);this.scrollLeft=Math.min(o.left,this.scrollWidth-this.clientWidth);},
  };
  const prev={},next={},count={};
  const root={querySelector:s=>({'[data-carousel-track]':track,'[data-carousel-prev]':prev,'[data-carousel-next]':next,'[data-carousel-count]':count}[s])};
  const context={window:{matchMedia:()=>({matches:false})},clearTimeout(){},setTimeout:fn=>{timers.push(fn);return timers.length;}};
  vm.createContext(context);vm.runInContext(readFileSync(path.join(__dirname,'../orion-carousel.js'),'utf8'),context);
  const api=new context.window.OrionCarousel(root);
  const target={closest:()=>null};
  const fire=(type,props={})=>handlers.get(type)?.({button:0,pointerId:1,clientX:0,clientY:0,target,preventDefault(){},stopPropagation(){},...props});
  return {api,track,prev,next,count,fire,calls,timers};
}

test('arrows and keyboard reach every card and clamp to the real end without an empty tail', () => {
  const c=carousel();assert.equal(c.prev.disabled,true);assert.equal(c.count.textContent,'01 / 03');
  c.next.onclick();assert.equal(c.api.index,1);assert.equal(c.track.scrollLeft,820);
  c.fire('keydown',{key:'End'});assert.equal(c.api.index,2);assert.equal(c.track.scrollLeft,1440);
  assert.equal(c.next.disabled,true);assert.equal(c.api.nearest(),2);
  c.fire('keydown',{key:'Home'});assert.equal(c.api.index,0);assert.equal(c.prev.disabled,true);
});

test('horizontal pointer dragging advances the shelf, while a tap or vertical motion does not', () => {
  const c=carousel();
  c.fire('pointerdown',{clientX:500,clientY:50});c.fire('pointermove',{clientX:501,clientY:90});c.fire('pointerup');
  assert.equal(c.api.index,0);
  c.fire('pointerdown',{clientX:500,clientY:50});c.fire('pointermove',{clientX:370,clientY:52});c.fire('pointerup');
  assert.equal(c.api.index,1);assert.equal(c.track.scrollLeft,820);
  let prevented=false;c.fire('click',{preventDefault(){prevented=true;}});assert.equal(prevented,true);
  prevented=false;c.fire('click',{preventDefault(){prevented=true;}});assert.equal(prevented,false);
});

test('dragging from PLAY does not intercept the game action and refresh preserves the chosen card', () => {
  const c=carousel();c.api.go(2,false);c.api.refresh();assert.equal(c.api.index,2);
  c.fire('pointerdown',{target:{closest:()=>({tagName:'BUTTON'})}});assert.equal(c.api.drag,null);
  c.fire('pointermove',{clientX:-200});c.fire('pointerup');assert.equal(c.api.index,2);
});
