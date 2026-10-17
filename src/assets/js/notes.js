// Notes are clamped to two lines in the table. Reveal the whole note on demand, and only
// offer the control when there is actually more to read — no dead "…" on short notes.
//
// The control is the same ellipsis in both directions: what it did is visible (the note
// opens, the row grows), so the label stays put and the accessible name carries the action.
for (const wrap of document.querySelectorAll('[data-note]')) {
  const text = wrap.querySelector('[data-note-text]');
  const toggle = wrap.querySelector('[data-note-toggle]');
  if (!text || !toggle) continue;
  // scrollHeight > clientHeight means the clamp is hiding something
  if (text.scrollHeight <= text.clientHeight + 1) continue;

  const setState = (open) => {
    const label = open ? 'Collapse the note' : 'Show the whole note';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
  };
  setState(false);
  toggle.hidden = false;

  toggle.addEventListener('click', () => {
    const collapsed = text.classList.toggle('line-clamp-2');
    setState(!collapsed);
  });
}
