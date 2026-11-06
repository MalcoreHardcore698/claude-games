/* The game header returns through the portal's view history. */
(()=>{
  function update(){const link=document.querySelector('#hubLink');if(!link)return;link.hidden=false;link.classList.add('gameHeadTitle');link.removeAttribute('data-t');const span=link.querySelector('span');if(span){span.removeAttribute('data-t');span.textContent=document.documentElement.lang==='en'?'Back':'Назад';}const icon=link.querySelector('i');if(icon)icon.className='fa-solid fa-arrow-left';link.setAttribute('aria-label',document.documentElement.lang==='en'?'Back':'Назад');}
  update();new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  document.querySelector('#hubLink')?.addEventListener('click',e=>{if(window.parent===window&&!e.currentTarget.hasAttribute('data-internal-back')){e.preventDefault();if(history.length>1)history.back();else location.href='index.html';}},true);
})();
