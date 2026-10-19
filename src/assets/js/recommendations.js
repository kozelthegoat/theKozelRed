// Choosing a quote with the bullets. No scrolling to drive and nothing to measure, so this is a
// click handler and a class — and if it never runs, the plain list underneath is still the page.
const section = document.querySelector('[data-slides]');
const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

if (section && !reduced) {
  const slides = Array.from(section.querySelectorAll('.slide'));
  const bullets = Array.from(section.querySelectorAll('[data-bullet]'));

  const show = (index) => {
    slides.forEach((el, i) => el.classList.toggle('is-active', i === index));
    bullets.forEach((el, i) => el.setAttribute('aria-pressed', i === index ? 'true' : 'false'));
  };

  // Each bullet is a real button, so tabbing to it and pressing Enter already works — no keyboard
  // handling to write, and nothing to keep in step with it.
  bullets.forEach((bullet, i) => bullet.addEventListener('click', () => show(i)));

  section.setAttribute('data-ready', '');
  show(0);
}
