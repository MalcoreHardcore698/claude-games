const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// Exercise the real inline engine without a browser or third-party dependencies.
function engine() {
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      hidden: true, innerHTML: '', textContent: '', checked: false, disabled: false,
      clientHeight: 286, scrollTop: 0, scrollHeight: 286, offsetWidth: 100,
      style: { setProperty() {} }, classList: { add() {}, remove() {}, toggle() {} },
      setAttribute() {}, addEventListener() {}, focus() {},
      querySelectorAll() { return []; },
      getBoundingClientRect() { return { x: 0, y: 0, left: 0, top: 0, width: 100, height: 100 }; },
    });
    return elements.get(id);
  }
  let now = 0;
  const context = {
    document: { querySelector: element, querySelectorAll: () => [], documentElement: {} },
    navigator: { language: 'ru' }, localStorage: { getItem: () => null, setItem() {} },
    performance: { now: () => now }, requestAnimationFrame() {}, addEventListener() {},
    setInterval() {}, setTimeout: () => 0, clearTimeout() {}, console,
  };
  context.window = context;
  context.parent = context;
  vm.createContext(context);
  let script = readFileSync(path.join(__dirname, '..', 'runes.html'), 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
  script = script.replace("applyLang();show('sMenu');shellPost('ready');", '');
  script = script.replace('window.__runes={', `
    renderDeck=renderAll=renderFoe=()=>{};
    foeXY=()=>({x:0,y:0,r:20});
    burst=snd=popHero=()=>{};
    banner=async()=>{};
    let walks=0,ending=null;
    walk=async()=>{walks++;};
    endRun=why=>{ending=why;G.over=true;};
    window.testAPI={newRun,cfgNow,activeSyn,scoreGrid,swap,validSwap,drawReels,reelGeom,
      winFight,showLoot,giveRune,logEvent,cellHTML,cellAt,positionMarks,RUNES,SYN,SYM,ENEMY,canPlace,
      get G(){return G},get walks(){return walks},get ending(){return ending},
      setLoot:items=>{rollLoot=()=>items;}};
    window.__runes={`);
  vm.runInContext(script, context);
  return { api: context.testAPI, element, setNow: value => { now = value; } };
}

test('each rune has one to three legal, distinct positions and every hero starts legally', () => {
  const { api } = engine();
  for (const rune of Object.values(api.RUNES)) {
    assert.ok(rune.positions.length >= 1 && rune.positions.length <= 3);
    assert.equal(new Set(rune.positions.map(p => p.slot)).size, rune.positions.length);
    for (const position of rune.positions) {
      assert.ok(position.slot >= 1 && position.slot <= 6);
      assert.ok(position.d[0] && position.d[1]);
    }
  }
  for (const hero of ['knight', 'rogue', 'mage']) {
    api.newRun('camp', hero);
    assert.equal(api.G.sock.filter(Boolean).length, 3);
    api.G.sock.forEach((r, i) => assert.ok(api.canPlace(r, 'sock', i)));
  }
});

test('the same rune changes power and reel weights when moved to another position', () => {
  const { api } = engine();
  api.newRun('endless', 'knight');
  api.G.sock.fill(null);
  api.G.sock[1] = 'teiwaz';
  const before = api.cfgNow();
  api.swap('sock', 1, 'sock', 3);
  const after = api.cfgNow();
  assert.equal(after.sw, before.sw + 1);
  assert.equal(after.w.sword, before.w.sword - 4);
  assert.ok(api.G.logs.some(e => e.key === 'log_equip'));
});

test('invalid placement and a swap invalid for the displaced rune leave both slots intact', () => {
  const { api } = engine();
  api.newRun('endless', 'knight');
  const initial = Array.from(api.G.sock);
  api.swap('sock', 1, 'sock', 0);
  assert.deepEqual(Array.from(api.G.sock), initial);
  api.G.sock[2] = 'berkana'; // Raido fits 3, but Berkana cannot return to slot 1.
  const withTarget = Array.from(api.G.sock);
  api.swap('sock', 0, 'sock', 2);
  assert.deepEqual(Array.from(api.G.sock), withTarget);
  api.swap('inv', 999, 'sock', 3);
  assert.equal(api.G.inv.length, 35);
});

test('positional synergies require the named positions; free synergies still work', () => {
  const { api } = engine();
  api.newRun('endless', 'knight');
  api.G.sock.fill(null);
  api.G.sock[1] = 'teiwaz'; api.G.sock[3] = 'thurs';
  assert.ok(api.activeSyn().some(s => s.id === 'storm'));
  api.swap('sock', 3, 'sock', 5);
  assert.ok(!api.activeSyn().some(s => s.id === 'storm'));
  api.G.sock[3] = 'thurs';
  assert.ok(api.activeSyn().some(s => s.id === 'chain'));
  for (const synergy of api.SYN.filter(s => s.at)) {
    for (const [r, positions] of Object.entries(synergy.at)) {
      for (const p of positions) assert.ok(api.canPlace(r, 'sock', p - 1));
    }
  }
});

test('drawn drums keep neighboring symbols outside scored rows and side columns blank', () => {
  const { api, element } = engine();
  api.newRun('endless', 'knight');
  const grid = [['sword', 'shield', 'heart'], ['bolt', 'coin', 'clover']];
  const box = element('#reels');
  api.drawReels(box, api.SYM, grid, 2, 3, api.reelGeom(box, 2));
  assert.equal((box.innerHTML.match(/data-row=/g) || []).length, 6);
  assert.equal((box.innerHTML.match(/rcol locked/g) || []).length, 2);
  assert.equal((box.innerHTML.match(/class="cell neighbor/g) || []).length, 10);
  const result = api.scoreGrid(grid, api.cfgNow(), 1);
  assert.equal(result.phys, api.cfgNow().sw);
  assert.equal(result.mag, api.cfgNow().bo);
  assert.equal(result.spins, 1);
});

test('victory waits for COLLECT before rewards, next enemy and AUTO can proceed', async () => {
  const { api, element } = engine();
  api.newRun('camp', 'knight');
  api.G.enemy = { ...api.ENEMY.wolf, hp: 0, max: 15 };
  api.G.rolling = true;
  api.setLoot([{ t: 'rune', k: 'jera' }]);
  api.G.auto = true;
  const fight = api.winFight();
  await Promise.resolve();
  assert.equal(api.G.awaitingLoot, true);
  assert.equal(element('#mLoot').hidden, false);
  assert.equal(api.G.gold, 0);
  assert.equal(api.G.spins, 18);
  assert.ok(!api.G.inv.includes('jera'));
  assert.equal(api.walks, 0);
  api.swap('sock', 1, 'sock', 3);
  assert.equal(api.G.sock[3], 'teiwaz');
  assert.equal(api.G.awaitingLoot, true);
  element('#lootTake').onclick();
  await fight;
  assert.equal(api.G.awaitingLoot, false);
  assert.equal(element('#mLoot').hidden, true);
  assert.equal(api.G.gold, 10);
  assert.equal(api.G.spins, 21);
  assert.ok(api.G.inv.includes('jera'));
  assert.equal(api.walks, 1);
  assert.equal(element('#lootTake').onclick, null);
});

test('final boss gold also waits for confirmation and time attack pauses during loot', async () => {
  const { api, element, setNow } = engine();
  api.newRun('time', 'knight');
  api.G.enemy = { ...api.ENEMY.dragon, hp: 0, max: 110 };
  api.G.path = ['dragon'];
  api.G.rolling = true;
  const endAt = api.G.timeEnd;
  const fight = api.winFight();
  setNow(5000);
  assert.equal(api.ending, null);
  element('#lootTake').onclick();
  await fight;
  assert.equal(api.G.gold, 40);
  assert.equal(api.G.timeEnd, endAt + 5000);
  assert.equal(api.ending, 'win');
  assert.equal(api.walks, 0);
});

test('runes always show three position circles, including empty and inactive positions', () => {
  const { api } = engine();
  const marks = api.positionMarks('isa', 3);
  assert.equal((marks.match(/class="positionBadge/g) || []).length, 3);
  assert.equal((marks.match(/exists active/g) || []).length, 1);
  assert.ok(marks.includes('>3</span>'));
  assert.ok(marks.includes('>6</span>'));
  assert.ok(marks.includes('class="positionBadge"></span>'));
});

test('full bags record the actual converted spins and never exceed the cap', () => {
  const { api } = engine();
  api.newRun('endless', 'knight');
  api.G.inv.fill('raido'); api.G.spins = 99;
  assert.equal(api.giveRune('jera'), false);
  assert.equal(api.G.spins, 100);
  assert.equal(api.G.logs.at(-1).key, 'log_rune_full');
  assert.equal(api.G.logs.at(-1).values.n, 1);
});
