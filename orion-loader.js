/* Shared asset gate for the portal, standalone games and iframe navigation. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.OrionLoader = api.install(root);
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const INTRO_KEY = 'orion.intro.v1';
  const delay = (w, ms) => new Promise(resolve => w.setTimeout(resolve, ms));
  function event(target, name) {
    return new Promise(resolve => target.addEventListener(name, resolve, { once: true }));
  }
  function firstVisit(storage) {
    try { return storage.getItem(INTRO_KEY) !== 'seen'; } catch (_) { return false; }
  }
  function markVisited(storage) {
    try { storage.setItem(INTRO_KEY, 'seen'); } catch (_) { /* Private storage is optional. */ }
  }
  async function waitForAssets(w, progress = () => {}) {
    const d = w.document;
    if (d.readyState === 'loading') await event(d, 'DOMContentLoaded');
    progress(12);
    const load = d.readyState === 'complete' ? Promise.resolve() : event(w, 'load');
    // The stylesheet may still be loading when this script runs. Read FontFaceSet
    // after window.load, then explicitly warm the icon font used by every game.
    await load;
    progress(35);
    const images = Array.from(d.images || []).filter(img => img.loading !== 'lazy');
    let complete = 0;
    const pictures = Promise.allSettled(images.map(async img => {
      if (!img.complete) await new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
      try { if (img.decode) await img.decode(); } catch (_) { /* Use the image's fallback. */ }
      complete++;
      progress(35 + Math.round(30 * complete / Math.max(images.length, 1)));
    }));
    const fonts = (async () => {
      if (d.fonts) {
        try { await d.fonts.load('900 16px "Font Awesome 6 Free"', '\uf11b'); } catch (_) {}
        await d.fonts.ready;
      }
    })();
    await Promise.allSettled([pictures, fonts]);
    progress(96);
    // Give layout and decoded images two frames to settle behind the cover.
    await new Promise(resolve => w.requestAnimationFrame(() => w.requestAnimationFrame(resolve)));
    progress(100);
  }
  function navigationGate() {
    let current = null, serial = 0;
    return {
      begin(source) { current = { source, token: String(++serial), done: false }; return current; },
      accepts(source, token) { return !!current && !current.done && current.source === source && current.token === token; },
      finish(source, token) { if (!this.accepts(source, token)) return false; current.done = true; return true; },
      cancel() { serial++; current = null; },
    };
  }
  function install(w) {
    const d = w.document, html = d.documentElement;
    const embedded = w.parent !== w && new URLSearchParams(w.location.search).has('orion_load');
    const childToken = new URLSearchParams(w.location.search).get('orion_load');
    const isPortal = !!d.getElementById('frame');
    const extended = isPortal && firstVisit(w.localStorage);
    const reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gate = navigationGate();
    let cover, frameCleanup = () => {}, lock = false, visibleAt = 0, slowTimer, coverSerial = 0;
    const inertBefore = new Map();
    let sound = true, activeTitle = '', busy = true, introDone = false;
    try { sound = w.localStorage.getItem('orion.intro.sound') !== 'off'; } catch (_) {}
    const en = () => d.documentElement.lang === 'en';
    function tr(ru, english) { return en() ? english : ru; }
    function post(type, value) {
      if (embedded) w.parent.postMessage({ svo: 1, type, token: childToken, progress: value }, w.location.origin === 'null' ? '*' : w.location.origin);
    }
    function unlock() {
      html.classList.remove('orion-pending');
      if (lock) { inertBefore.forEach((value, node) => { node.inert = value; }); inertBefore.clear(); lock = false; }
    }
    function mount() {
      if (cover) return;
      const css = d.createElement('style');
      css.textContent = `
        #orionLoad{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;background:#101012;color:#f2eee4;font:12px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace;isolation:isolate;transition:opacity .22s;user-select:none;visibility:visible}
        #orionLoad *{box-sizing:border-box}#orionLoad[hidden]{display:none!important}
        #orionLoad::before{content:'';position:absolute;inset:0;z-index:-1;background:radial-gradient(ellipse at 50% 45%,#29262866,transparent 55%),repeating-linear-gradient(0deg,transparent 0 3px,#0002 3px 4px);pointer-events:none}
        #orionLoad .or-content{width:min(420px,80vw);text-align:center;display:flex;flex-direction:column;align-items:center;gap:24px}
        #orionLoad .or-orbit{position:relative;width:96px;height:96px;display:grid;place-items:center;margin-bottom:8px}
        #orionLoad .or-orbit::before,#orionLoad .or-orbit::after{content:'';position:absolute;width:6px;height:6px;background:#e6b85c;box-shadow:0 0 20px #e6b85c44;animation:or-orbit 1.8s steps(8,end) infinite}
        #orionLoad .or-orbit::after{animation-delay:-.9s;background:#9caebd}
        #orionLoad .or-pixels{display:grid;grid-template-columns:repeat(5,8px);grid-template-rows:repeat(7,8px);gap:2px}
        #orionLoad .or-pixels i{background:#eee9dc;animation:or-pixel 1.2s steps(2,end) infinite;animation-delay:calc(var(--i)*-35ms)}
        #orionLoad .or-pixels i.or-empty{background:transparent;animation:none}
        #orionLoad .or-brand{font:700 clamp(64px,10vw,104px)/.9 'Tiny5 Duo',monospace;letter-spacing:.025em;margin:0;display:none;text-shadow:4px 4px 0 #080808}
        #orionLoad .or-kicker{font-size:10px;letter-spacing:.24em;color:#a4a2a6;text-transform:uppercase;margin:0}
        #orionLoad .or-label{font:inherit;letter-spacing:.08em;text-transform:uppercase;margin:0;min-height:1.4em;color:#ece6d9}
        #orionLoad .or-track{width:100%;height:9px;border:1px solid #55515a;padding:2px;overflow:hidden}
        #orionLoad .or-fill{height:100%;width:0;background:repeating-linear-gradient(90deg,#e8c16d 0 7px,transparent 7px 10px);transition:width .16s steps(10,end)}
        #orionLoad .or-progress{width:100%;display:flex;flex-direction:column;gap:12px}
        #orionLoad .or-foot{display:flex;justify-content:space-between;color:#8e8996;font-size:10px;letter-spacing:.1em}
        #orionLoad .or-actions{display:flex;flex-direction:column;align-items:center;gap:17px;min-height:92px;visibility:hidden}
        #orionLoad button{border:1px solid #c5a661;background:#e9c16f;color:#191610;padding:13px 30px;font:700 12px ui-monospace,monospace;letter-spacing:.15em;cursor:pointer;box-shadow:4px 4px 0 #624b25;transition:transform .1s,box-shadow .1s}
        #orionLoad button:hover{background:#f3d799}#orionLoad button:active{transform:translate(3px,3px);box-shadow:1px 1px 0 #624b25}#orionLoad button:focus-visible{outline:2px solid #fff;outline-offset:5px}
        #orionLoad .or-sound,#orionLoad .or-slow{border:0;padding:3px;background:none;box-shadow:none;color:#a8a2ad;font:10px ui-monospace,monospace;letter-spacing:.06em}
        #orionLoad .or-sound:hover,#orionLoad .or-slow:hover{color:#fff;background:none}
        #orionLoad .or-slow{display:none;position:absolute;bottom:8vh;max-width:80vw;line-height:1.7}
        #orionLoad.or-intro .or-content{gap:18px}#orionLoad.or-intro .or-orbit{animation:or-intro-orbit .5s both}
        #orionLoad.or-logo .or-orbit{display:none}#orionLoad.or-logo .or-brand{display:block;animation:or-logo .55s steps(6,end) both}
        #orionLoad.or-logo .or-track{border-color:#80704b}#orionLoad.or-logo .or-actions{visibility:visible;animation:or-logo .45s .15s both}
        #orionLoad.or-exit .or-progress,#orionLoad.or-exit .or-actions,#orionLoad.or-exit .or-kicker,#orionLoad.or-exit .or-label{opacity:0;transition:opacity .12s}
        @keyframes or-pixel{0%,70%,100%{opacity:1}75%,95%{opacity:.2}}
        @keyframes or-orbit{0%{transform:translate(0,-46px)}12.5%{transform:translate(34px,-34px)}25%{transform:translate(46px,0)}37.5%{transform:translate(34px,34px)}50%{transform:translate(0,46px)}62.5%{transform:translate(-34px,34px)}75%{transform:translate(-46px,0)}87.5%{transform:translate(-34px,-34px)}100%{transform:translate(0,-46px)}}
        @keyframes or-logo{from{opacity:0;transform:translateY(8px);clip-path:inset(0 100% 0 0)}to{opacity:1;transform:none;clip-path:inset(0)}}
        @keyframes or-intro-orbit{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}
        @media(prefers-reduced-motion:reduce){#orionLoad *,#orionLoad *::before,#orionLoad *::after{animation:none!important;transition:none!important}}
      `;
      d.head.append(css);
      cover = d.createElement('div');
      cover.id = 'orionLoad';
      cover.hidden = true;
      cover.setAttribute('role', 'dialog'); cover.setAttribute('aria-modal', 'true');
      cover.setAttribute('aria-label', tr('Загрузка ORION', 'Loading ORION'));
      const pixels = ['01110','11011','11011','11011','11011','11011','01110'].join('');
      cover.innerHTML = `<div class="or-content"><p class="or-kicker">ORION / PLAY TOGETHER</p><div class="or-orbit" aria-hidden="true"><div class="or-pixels">${[...pixels].map((v,i)=>`<i class="${v==='0'?'or-empty':''}" style="--i:${i}"></i>`).join('')}</div></div><p class="or-brand" aria-hidden="true">ORION</p><p class="or-label" role="status" aria-live="polite"></p><div class="or-progress"><div class="or-track" role="progressbar" aria-label="Loading" aria-valuemin="0" aria-valuemax="100"><div class="or-fill"></div></div><div class="or-foot"><span class="or-phase"></span><span class="or-percent">0%</span></div></div><div class="or-actions"><button type="button" class="or-enter"></button><button type="button" class="or-sound" aria-pressed="true"></button></div></div><button class="or-slow" type="button"></button>`;
      d.body.append(cover);
      html.classList.add('orion-mounted');
    }
    function select(s) { return cover.querySelector(s); }
    function setSoundLabel() {
      select('.or-sound').textContent = tr('8-BIT ЗВУК: ', '8-BIT SOUND: ') + (sound ? 'ON' : 'OFF');
      select('.or-sound').setAttribute('aria-pressed', String(sound));
    }
    function progress(n) {
      if (!cover || cover.hidden) return;
      const bar = select('.or-track');
      n = Math.max(Number(bar.getAttribute('aria-valuenow')) || 0, Math.min(100, n));
      bar.setAttribute('aria-valuenow', String(n));
      select('.or-fill').style.width = n + '%'; select('.or-percent').textContent = n + '%';
      select('.or-phase').textContent = n < 35 ? tr('ПОДКЛЮЧЕНИЕ', 'CONNECTING') : n < 96 ? tr('ШРИФТЫ / АССЕТЫ', 'FONTS / ASSETS') : tr('ГОТОВО К ИГРЕ', 'READY TO PLAY');
    }
    function show(title, intro) {
      mount(); coverSerial++; busy = true; introDone = false; activeTitle = title;
      cover.className = intro ? 'or-intro' : ''; cover.hidden = false; cover.style.opacity = '';
      select('.or-brand').style.transform = ''; select('.or-brand').getAnimations().forEach(a => a.cancel());
      select('.or-track').setAttribute('aria-valuenow', '0'); progress(0);
      select('.or-label').textContent = title || tr('ЗАГРУЖАЕМ ВАШУ ОРБИТУ', 'LOADING YOUR ORBIT');
      select('.or-enter').textContent = tr('ВОЙТИ', 'ENTER'); setSoundLabel();
      select('.or-slow').style.display = ''; select('.or-slow').textContent = tr('Загрузка занимает больше времени. Продолжить с уже загруженными ресурсами', 'Loading is taking longer. Continue with the assets already loaded');
      if (!lock) {
        Array.from(d.body.children).forEach(node => { if (node !== cover) { inertBefore.set(node, node.inert); node.inert = true; } });
        lock = true;
      }
      visibleAt = Date.now();
      w.clearTimeout(slowTimer);
      slowTimer = w.setTimeout(() => { if (busy) select('.or-slow').style.display = 'block'; }, 20000);
    }
    async function hide(logo) {
      if (!cover || cover.hidden) return;
      const ticket = coverSerial;
      busy = false; w.clearTimeout(slowTimer); select('.or-slow').style.display = '';
      html.classList.remove('orion-pending');
      if (logo && !reduce) {
        cover.classList.add('or-exit');
        const brand = select('.or-brand'), target = d.getElementById('logo');
        if (target && brand.animate) {
          const a = brand.getBoundingClientRect(), b = target.getBoundingClientRect();
          brand.animate([{ transform: 'none' }, { transform: `translate(${b.left+b.width/2-a.left-a.width/2}px,${b.top+b.height/2-a.top-a.height/2}px) scale(${b.width/a.width})` }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
          await delay(w, 340);
          if (ticket !== coverSerial) return;
        }
      }
      cover.style.opacity = '0';
      await delay(w, reduce ? 0 : 220);
      if (ticket !== coverSerial) return;
      cover.hidden = true; unlock();
    }
    function chime() {
      if (!sound) return;
      try {
        const Audio = w.AudioContext || w.webkitAudioContext; if (!Audio) return;
        const ctx = new Audio(); ctx.resume();
        [523.25,659.25,783.99,1046.5].forEach((frequency,i) => {
          const oscillator = ctx.createOscillator(), gain = ctx.createGain(), t = ctx.currentTime+i*.07;
          oscillator.type = 'square'; oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0,t); gain.gain.linearRampToValueAtTime(.022,t+.006); gain.gain.exponentialRampToValueAtTime(.001,t+.16);
          oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(t); oscillator.stop(t+.17);
        });
        w.setTimeout(() => { ctx.close().catch(() => {}); }, 900);
      } catch (_) { /* Sound is decorative; entry must always work. */ }
    }
    async function logoReady() {
      if (introDone) return; introDone = true; busy = false;
      w.clearTimeout(slowTimer); select('.or-slow').style.display = '';
      progress(100); cover.classList.add('or-logo');
      select('.or-label').textContent = tr('ВАША ОРБИТА ИГР', 'YOUR ORBIT OF GAMES');
      select('.or-enter').focus();
      await new Promise(resolve => {
        select('.or-enter').onclick = () => {
          select('.or-enter').disabled = true; markVisited(w.localStorage); chime(); resolve();
        };
        select('.or-sound').onclick = () => {
          sound = !sound; setSoundLabel();
          try { w.localStorage.setItem('orion.intro.sound', sound ? 'on' : 'off'); } catch (_) {}
        };
      });
      await hide(true);
    }
    function unsupported() { return w.matchMedia('(max-width: 700px)').matches; }
    const startup = (async () => {
      if (!embedded) show('', extended && !unsupported());
      const ticket = coverSerial;
      await waitForAssets(w, n => { progress(n); post('assets-progress', n); });
      if (embedded) { unlock(); post('assets-ready', 100); return; }
      await delay(w, Math.max(0, (extended ? 2400 : 360) - (Date.now()-visibleAt)));
      if (ticket !== coverSerial || cover.hidden || !busy) return;
      if (extended && !unsupported()) await logoReady(); else await hide(false);
    })();
    if (!embedded) {
      select('.or-slow').onclick = () => { if (extended && !introDone) logoReady(); else hide(false); };
    }
    async function loadFrame(frame, options) {
      frameCleanup(); gate.cancel();
      const nav = gate.begin(frame.contentWindow);
      const url = new URL(options.url, w.location.href); url.searchParams.set('orion_load', nav.token);
      frame.style.visibility = 'hidden'; show(options.title || '', false);
      let canceled = false, finishing = false;
      const valid = () => !canceled && gate.accepts(frame.contentWindow, nav.token);
      async function finish(force = false) {
        if (!valid() || finishing) return; finishing = true;
        if (force) {
          try { frame.contentDocument.documentElement.classList.remove('orion-pending'); } catch (_) {}
        }
        progress(100);
        await delay(w, Math.max(0, 360-(Date.now()-visibleAt)));
        if (!valid()) return;
        gate.finish(frame.contentWindow, nav.token);
        frame.style.visibility = ''; cleanup(); await hide(false);
        try { frame.focus(); } catch (_) {}
      }
      function message(e) {
        const m = e.data;
        if (e.origin !== url.origin || !m || m.svo !== 1 || !gate.accepts(e.source, m.token)) return;
        if (m.type === 'assets-progress') progress(Number(m.progress) || 0);
        if (m.type === 'assets-ready') finish();
      }
      async function loaded() {
        if (!valid()) return;
        try {
          const child = frame.contentWindow;
          if (new URL(child.location.href).searchParams.get('orion_load') !== nav.token) return;
          if (child.OrionLoader) await child.OrionLoader.ready;
          else await waitForAssets(child, n => { if (valid()) progress(n); });
          finish();
        } catch (_) {
          if (valid()) select('.or-label').textContent = tr('НЕ УДАЛОСЬ ЗАГРУЗИТЬ ИГРУ', 'COULD NOT LOAD THE GAME');
        }
      }
      function cleanup() { w.removeEventListener('message',message); frame.removeEventListener('load',loaded); }
      frameCleanup = () => { canceled = true; cleanup(); };
      w.addEventListener('message',message); frame.addEventListener('load',loaded);
      select('.or-slow').onclick = () => { if (valid()) finish(true); };
      frame.src = url.href;
    }
    function cancelFrame() { coverSerial++; frameCleanup(); gate.cancel(); if (cover) { cover.hidden = true; busy = false; w.clearTimeout(slowTimer); } unlock(); }
    // Reveal a page restored from the browser back/forward cache immediately.
    w.addEventListener('pageshow', e => { if (e.persisted) { cancelFrame(); html.classList.remove('orion-pending'); } });
    return { ready: startup, loadFrame, cancelFrame };
  }
  return { waitForAssets, navigationGate, firstVisit, markVisited, install };
});
