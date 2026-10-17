// Notes are clamped to two lines in the table. The clamp's own ellipsis at the end of line two
// is the affordance: clicking the note reveals the rest, clicking again puts it back. A note
// that fits is left alone — no pointer, no focus stop, no tooltip.
for (const note of document.querySelectorAll('[data-note]')) {
  const setState = (open) => {
    const label = open ? 'Collapse the note' : 'Show the whole note';
    note.setAttribute('aria-expanded', String(open));
    note.title = label;
  };

  if (note.scrollHeight <= note.clientHeight + 1) {
    note.removeAttribute('role');
    note.removeAttribute('tabindex');
    note.removeAttribute('aria-expanded');
    note.removeAttribute('title');
    note.classList.remove('cursor-pointer');
    continue;
  }

  setState(false);
  note.addEventListener('click', () => {
    const collapsed = note.classList.toggle('line-clamp-2');
    setState(!collapsed);
  });
  note.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      note.click();
    }
  });
}
