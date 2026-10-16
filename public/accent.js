// Weekday accent, applied before first paint so there is no colour flash.
// External (not inline) so the CSP needs no script hashes: script-src 'self' covers it.
(() => {
  const hues = (document.documentElement.dataset.hues || '').split(',');
  const day = hues[(new Date().getDay() + 6) % 7];
  document.documentElement.style.setProperty('--brand', day);
  const theme = document.querySelector('meta[name="theme-color"]');
  if (theme) theme.setAttribute('content', day);
  const link = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
  if (link) {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><polygon points="10,4 16,10 10,16 4,10" fill="' +
      day +
      '"/></svg>';
    link.setAttribute('href', 'data:image/svg+xml,' + encodeURIComponent(svg));
  }
})();
