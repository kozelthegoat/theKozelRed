import { slideState } from '../../lib/recommendations.js';

// The pinned crossfade, as a layer over the plain list. If this script never runs — no JS, an
// error, motion reduced — the list underneath is the page and a reader loses nothing.
const section = document.querySelector('[data-slides]');
const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

if (section && !reduced) {
  const slides = Array.from(section.querySelectorAll('.slide'));
  const rail = section.querySelector('[data-rail]');
  const counter = section.querySelector('[data-counter]');
  const pad = (n) => String(n).padStart(2, '0');

  let top = 0;
  let stickLength = 1;
  let queued = false;

  // Measured, not computed per frame: reading layout inside a scroll handler is what makes a
  // scroll feel heavy. Re-measured on resize, which is the only thing that moves it.
  const measure = () => {
    top = section.getBoundingClientRect().top + window.scrollY;
    stickLength = Math.max(1, section.offsetHeight - window.innerHeight);
  };

  const draw = () => {
    queued = false;
    const { index, progress } = slideState({
      scrollY: window.scrollY,
      top,
      stickLength,
      count: slides.length
    });
    slides.forEach((el, i) => el.classList.toggle('is-active', i === index));
    if (rail) rail.style.transform = `scaleY(${progress})`;
    if (counter) counter.textContent = `[${pad(index + 1)} / ${pad(slides.length)}]`;
  };

  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(draw);
  };

  const onResize = () => {
    measure();
    draw();
  };

  const start = () => {
    measure();
    section.setAttribute('data-ready', '');
    draw();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}
