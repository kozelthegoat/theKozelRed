// Notes are clamped to two lines in the table. The clamp's own ellipsis is the visible
// affordance: clicking the note reveals the rest, clicking again puts it back.
//
// A note may contain links, so the note itself is not a button — the toggle is a separate,
// visually hidden button (keyboard and screen readers get a real control) and clicks that land
// on a link are left alone.
for (const note of document.querySelectorAll('[data-note]')) {
  const toggle = note.parentElement?.querySelector('[data-note-toggle]') ?? null;

  const setState = (open) => {
    const label = open ? 'Collapse the note' : 'Show the whole note';
    note.title = label;
    if (toggle) {
      toggle.textContent = label;
      toggle.setAttribute('aria-expanded', String(open));
    }
  };

  if (note.scrollHeight <= note.clientHeight + 1) {
    // nothing hidden: no pointer, no tooltip, no control
    note.removeAttribute('title');
    note.classList.remove('cursor-pointer');
    if (toggle) toggle.hidden = true;
    continue;
  }

  setState(false);
  if (toggle) toggle.hidden = false;

  const flip = () => {
    const collapsed = note.classList.toggle('line-clamp-2');
    setState(!collapsed);
  };

  note.addEventListener('click', (event) => {
    if (event.target.closest('a')) return;
    flip();
  });
  toggle?.addEventListener('click', flip);
}
