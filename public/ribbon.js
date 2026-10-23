// The masthead quote is dismissible in principle; site.ribbonDismissible switches it on.
//
// Runs before paint (it is in the head) so a dismissed ribbon never flashes. It stores exactly one
// local preference — no cookie, no identifier — and does nothing at all while the flag is off,
// including leaving any old preference alone.
(() => {
  const root = document.documentElement;
  if (root.dataset.ribbonDismissible !== 'true') return;

  const KEY = 'kozel:ribbon-dismissed';

  try {
    if (localStorage.getItem(KEY) === '1') root.dataset.ribbon = 'off';
  } catch {
    // storage can be unavailable; the ribbon simply stays visible
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-ribbon-close]');
    if (!button) return;
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      // same: dismissal is best-effort
    }
    root.dataset.ribbon = 'off';
  });
})();
