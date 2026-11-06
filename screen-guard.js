/* Shared by the portal and standalone games: this is a desktop experience. */
(() => {
  'use strict';
  const media = matchMedia('(max-width: 700px), (max-height: 500px) and (pointer: coarse)');
  const style = document.createElement('style');
  style.textContent = `
    *,*::before,*::after{-webkit-user-select:none;user-select:none}
    *:focus,*:focus-visible{outline:none!important}
    ::selection{background:transparent;color:inherit}
    #screenGuard[hidden]{display:none!important}
    #screenGuard{position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;
      padding:28px;background:#0e0f11;color:#ece6d8;text-align:center;overflow:auto;
      font:400 16px/1.6 system-ui,sans-serif;box-sizing:border-box;overscroll-behavior:contain}
    #screenGuard .guardPanel{max-width:380px;outline:none}
    #screenGuard svg{width:64px;height:64px;color:#f2a33a;margin-bottom:18px}
    #screenGuard h2{font:700 28px/1.2 system-ui,sans-serif;margin:0 0 14px}
    #screenGuard p{color:#a6a6ac;font:400 16px/1.6 system-ui,sans-serif;margin:0}
    #screenGuard .guardBrand{font:700 12px/1 system-ui,sans-serif;letter-spacing:.3em;
      color:#f2a33a;margin-bottom:18px}
  `;
  document.head.appendChild(style);
  const overlay = document.createElement('div');
  overlay.id = 'screenGuard';
  overlay.hidden = true;
  overlay.setAttribute('role', 'alertdialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'screenGuardTitle');
  overlay.setAttribute('aria-describedby', 'screenGuardText');
  overlay.tabIndex = -1;
  overlay.innerHTML = `<div class="guardPanel"><div class="guardBrand">ORION</div>
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true">
      <rect x="6" y="9" width="52" height="35" rx="4"/><path d="M23 56h18M32 44v12M17 26h30m-6-6 6 6-6 6m-18-12-6 6 6 6"/>
    </svg><h2 id="screenGuardTitle"></h2><p id="screenGuardText"></p></div>`;
  document.body.appendChild(overlay);
  const previousInert = new Map();
  let active = false, previousFocus = null, previousOverflow = '';

  function translate() {
    const en = document.documentElement.lang.startsWith('en');
    overlay.querySelector('h2').textContent = en ? 'Please use a larger screen' : 'Нужен экран побольше';
    overlay.querySelector('p').textContent = en
      ? 'Phones are not supported yet. Open ORION on a computer and widen your browser window.'
      : 'Сайт и игры пока не поддерживают телефоны. Откройте ORION на компьютере и разверните окно.';
  }
  function blockContent() {
    for (const element of document.body.children) {
      if (element === overlay || /^(SCRIPT|STYLE|LINK)$/.test(element.tagName)) continue;
      if (!previousInert.has(element)) previousInert.set(element, element.inert);
      element.inert = true;
    }
  }
  function update() {
    translate();
    if (media.matches) {
      if (!active) {
        previousFocus = document.activeElement;
        previousOverflow = document.documentElement.style.overflow;
        active = true;
        overlay.hidden = false;
        document.documentElement.style.overflow = 'hidden';
        overlay.focus();
      }
      blockContent();
    } else if (active) {
      active = false;
      overlay.hidden = true;
      document.documentElement.style.overflow = previousOverflow;
      previousInert.forEach((inert, element) => { element.inert = inert; });
      previousInert.clear();
      if (previousFocus?.isConnected) previousFocus.focus();
    }
  }
  if (media.addEventListener) media.addEventListener('change', update);
  else media.addListener(update);
  new MutationObserver(translate).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  new MutationObserver(() => { if (active) blockContent(); }).observe(document.body, { childList: true });
  // Keep keyboard input on the explanation while the underlying site is blocked.
  overlay.addEventListener('keydown', event => {
    event.stopPropagation();
    if (event.key === 'Tab' || event.code === 'Space') event.preventDefault();
    if (event.key === 'Tab') overlay.focus();
  });
  for (const type of ['keyup', 'pointerdown', 'pointerup', 'pointermove', 'mousedown', 'mouseup', 'mousemove', 'click', 'touchstart', 'touchend']) {
    overlay.addEventListener(type, event => event.stopPropagation());
  }
  update();
})();
