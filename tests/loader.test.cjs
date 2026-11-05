const { test } = require('node:test');
const assert = require('node:assert/strict');
const { waitForAssets, navigationGate, firstVisit, markVisited } = require('../orion-loader.js');

function deferred() { let resolve, reject; const promise = new Promise((yes,no) => { resolve=yes; reject=no; }); return { promise, resolve, reject }; }
const turn = () => new Promise(resolve => setImmediate(resolve));
function environment({ state = 'complete', image, fonts } = {}) {
  const w = new EventTarget();
  const d = new EventTarget(); d.readyState = state; d.images = image ? [image] : [];
  d.fonts = fonts || { load: async () => [], ready: Promise.resolve() };
  w.document = d; w.requestAnimationFrame = fn => setImmediate(fn);
  return w;
}

test('the cover cannot finish until fonts and decoded images are both ready', async () => {
  const font = deferred(), decode = deferred(); let finished = false;
  const image = { complete: true, decode: () => decode.promise };
  const w = environment({ image, fonts: { load: () => font.promise, ready: Promise.resolve() } });
  const values = [];
  const ready = waitForAssets(w, n => values.push(n)).then(() => { finished=true; });
  await turn(); assert.equal(finished,false);
  font.resolve([]); await turn(); assert.equal(finished,false);
  decode.resolve(); await ready;
  assert.equal(finished,true); assert.equal(values.at(-1),100);
  assert.ok(values.indexOf(96) < values.indexOf(100));
});

test('font readiness is sampled after stylesheets and window load, including late font requests', async () => {
  const parsedFonts = deferred(), actualFonts = deferred();
  let warmed = false, finished = false;
  const w = environment({ state: 'loading', fonts: { load: () => { warmed=true; return actualFonts.promise; }, ready: parsedFonts.promise } });
  const ready = waitForAssets(w).then(() => { finished=true; });
  parsedFonts.resolve(); await turn();
  assert.equal(warmed,false);
  w.document.readyState='interactive'; w.document.dispatchEvent(new Event('DOMContentLoaded')); await turn();
  assert.equal(warmed,false); assert.equal(finished,false);
  w.document.readyState='complete'; w.dispatchEvent(new Event('load')); await turn();
  assert.equal(warmed,true); assert.equal(finished,false);
  actualFonts.resolve([]); await ready; assert.equal(finished,true);
});

test('a failed image or icon font still allows the fallback interface to open', async () => {
  const image = new EventTarget(); image.complete=false; image.decode=async()=>{throw new Error('broken picture');};
  const w = environment({ image, fonts: { load: async()=>{throw new Error('blocked CDN');}, ready: Promise.resolve() } });
  let finished = false;
  const ready = waitForAssets(w).then(()=>{finished=true;});
  await turn(); assert.equal(finished,false);
  image.dispatchEvent(new Event('error')); await ready; assert.equal(finished,true);
});

test('lazy images do not block the current screen', async () => {
  const w = environment({ image: { loading:'lazy',complete:false } });
  await waitForAssets(w);
});

test('the long introduction is marked seen only when entry is confirmed', () => {
  const data = new Map(), storage = { getItem: k=>data.get(k), setItem:(k,v)=>data.set(k,v) };
  assert.equal(firstVisit(storage),true);
  assert.equal(firstVisit(storage),true); // Reload before ENTER still shows the intro.
  markVisited(storage);
  assert.equal(firstVisit(storage),false);
  const denied = { getItem(){throw new Error('denied');}, setItem(){throw new Error('denied');} };
  assert.equal(firstVisit(denied),false); assert.doesNotThrow(()=>markVisited(denied));
});

test('stale, canceled and unrelated iframe readiness messages cannot reveal another game', () => {
  const gate = navigationGate(), frameWindow = {}, otherWindow = {};
  const old = gate.begin(frameWindow);
  const current = gate.begin(frameWindow); // WindowProxy stays the same across navigation.
  assert.equal(gate.finish(frameWindow,old.token),false);
  assert.equal(gate.finish(otherWindow,current.token),false);
  assert.equal(gate.accepts(frameWindow,current.token),true);
  gate.cancel(); assert.equal(gate.finish(frameWindow,current.token),false);
  const last = gate.begin(frameWindow);
  assert.equal(gate.finish(frameWindow,last.token),true);
  assert.equal(gate.finish(frameWindow,last.token),false);
});
