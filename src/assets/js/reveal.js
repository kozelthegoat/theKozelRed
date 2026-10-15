// Reveal `.reveal` elements as they enter the viewport (staggered via a
// per-element transition-delay). Falls back to showing everything.
if (typeof document !== 'undefined') {
  const els = Array.from(document.querySelectorAll('.reveal'));

  if (els.length) {
    const show = (el) => el.classList.add('in');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              show(entry.target);
              io.unobserve(entry.target);
            }
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );
      els.forEach((el) => io.observe(el));
    } else {
      els.forEach(show);
    }
  }
}
