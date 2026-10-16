// Notes are clamped to two lines in the table. Reveal the whole note on demand, and only
// offer the control when there is actually more to read — no dead "More" on short notes.
for (const wrap of document.querySelectorAll('[data-note]')) {
  const text = wrap.querySelector('[data-note-text]');
  const toggle = wrap.querySelector('[data-note-toggle]');
  if (!text || !toggle) continue;
  // scrollHeight > clientHeight means the clamp is hiding something
  if (text.scrollHeight <= text.clientHeight + 1) continue;

  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const collapsed = text.classList.toggle('line-clamp-2');
    toggle.textContent = collapsed ? 'More' : 'Less';
    toggle.setAttribute('aria-expanded', String(!collapsed));
  });
}
