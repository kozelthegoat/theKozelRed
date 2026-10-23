// The one destructive action on /me asks first. A bundled listener rather than an inline handler:
// the CSP allows same-origin scripts only.
document.querySelectorAll('form[data-confirm]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    if (!window.confirm(form.dataset.confirm)) event.preventDefault();
  });
});
