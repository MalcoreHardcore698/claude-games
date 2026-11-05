/* Horizontal, keyboard and pointer accessible campaign/mode shelves. */
(function (root) {
  'use strict';
  class OrionCarousel {
    constructor(root) {
      this.root = root; this.track = root.querySelector('[data-carousel-track]'); this.index = 0;
      this.prev = root.querySelector('[data-carousel-prev]'); this.next = root.querySelector('[data-carousel-next]');
      this.count = root.querySelector('[data-carousel-count]'); this.drag = null; this.suppressClick = false;
      this.prev.onclick = () => this.go(this.index - 1);
      this.next.onclick = () => this.go(this.index + 1);
      this.track.addEventListener('scroll', () => {
        if (this.drag) return;
        if (this.targetLeft == null || Math.abs(this.track.scrollLeft-this.targetLeft) < 2) {
          this.targetLeft = null; this.index = this.nearest(); this.update();
        }
        clearTimeout(this.settleTimer);
        this.settleTimer = setTimeout(() => { if (!this.drag) { this.targetLeft = null; this.index = this.nearest(); this.update(); } }, 140);
      }, { passive: true });
      this.track.addEventListener('keydown', e => {
        if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key) || e.target.closest('button')) return;
        e.preventDefault(); this.go(e.key === 'Home' ? 0 : e.key === 'End' ? this.slides.length-1 : this.index+(e.key==='ArrowRight'?1:-1));
      });
      this.track.addEventListener('pointerdown', e => {
        if (e.button !== 0 || e.target.closest('button,a,input,select')) return;
        this.targetLeft = null;
        this.suppressClick = false;
        this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, scroll: this.track.scrollLeft, moved: false };
      });
      this.track.addEventListener('pointermove', e => {
        const drag = this.drag; if (!drag || e.pointerId !== drag.id) return;
        const dx = e.clientX-drag.x;
        if (!drag.moved && Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(e.clientY-drag.y)) {
          drag.moved = true; this.track.setPointerCapture(e.pointerId); this.track.classList.add('dragging');
        }
        if (drag.moved) { e.preventDefault(); this.track.scrollLeft = drag.scroll-dx; }
      });
      const release = e => {
        const drag = this.drag; if (!drag || e.pointerId !== drag.id) return;
        this.drag = null; this.track.classList.remove('dragging');
        if (this.track.hasPointerCapture(e.pointerId)) this.track.releasePointerCapture(e.pointerId);
        if (drag.moved) {
          this.suppressClick = true;
          setTimeout(() => { this.suppressClick = false; }, 0);
          const distance = this.track.scrollLeft-drag.scroll;
          const start = this.nearest(drag.scroll);
          const target = Math.abs(distance) > 38 ? start + Math.sign(distance) : this.nearest();
          this.go(target);
        }
      };
      this.track.addEventListener('pointerup', release); this.track.addEventListener('pointercancel', release);
      this.track.addEventListener('lostpointercapture', release);
      this.track.addEventListener('click', e => { if (this.suppressClick) { e.preventDefault(); e.stopPropagation(); this.suppressClick = false; } }, true);
      if (typeof ResizeObserver === 'function') { this.observer = new ResizeObserver(() => this.refresh()); this.observer.observe(this.track); }
      this.refresh();
    }
    get slides() { return Array.from(this.track.children); }
    position(slide) { return Math.max(0,Math.min(slide.offsetLeft-this.track.offsetLeft,this.track.scrollWidth-this.track.clientWidth)); }
    nearest(scroll = this.track.scrollLeft) {
      let best = 0, delta = Infinity;
      this.slides.forEach((s,i) => { const v = Math.abs(this.position(s)-scroll); if (v < delta) { delta=v; best=i; } });
      return best;
    }
    refresh() { this.go(this.index, false); }
    go(index, smooth = true) {
      const slides = this.slides; if (!slides.length) return;
      this.index = Math.max(0, Math.min(slides.length-1, index));
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.targetLeft = this.position(slides[this.index]);
      this.track.scrollTo({ left: this.targetLeft, behavior: smooth && !reduce ? 'smooth' : 'instant' });
      this.update();
    }
    update() {
      const slides = this.slides;
      this.prev.disabled = this.index <= 0; this.next.disabled = this.index >= slides.length-1;
      this.count.textContent = String(this.index+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');
      slides.forEach((slide,i) => {
        slide.classList.toggle('is-current', i===this.index);
        slide.setAttribute('aria-label', (i+1)+' / '+slides.length);
        // Only the current card enters the keyboard sequence; adjacent cards can
        // still be opened with the mouse without an extra selection step.
        slide.querySelectorAll('button').forEach(b => { b.tabIndex = i===this.index ? 0 : -1; });
      });
    }
  }
  root.OrionCarousel = OrionCarousel;
})(window);
