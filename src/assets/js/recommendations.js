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

// "See original · English" on a translated quote: the button swaps the text in place and flips its
// own label, so the original is one click away. Each quote caches its own rendered translation,
// because the list and the slide dress the same words differently.
document.querySelectorAll('[data-original]').forEach((btn) => {
  const text = btn.closest('blockquote')?.querySelector('[data-quote]');
  if (!text) return;
  const translation = text.textContent.trim();
  const originalLabel = btn.getAttribute('data-original-label') || '';
  const translationLabel = btn.getAttribute('data-translation-label') || '';

  btn.addEventListener('click', () => {
    const showingOriginal = btn.getAttribute('aria-expanded') === 'true';
    text.textContent = showingOriginal ? translation : btn.getAttribute('data-original');
    btn.textContent = showingOriginal ? originalLabel : translationLabel;
    btn.setAttribute('aria-expanded', showingOriginal ? 'false' : 'true');
  });
});
