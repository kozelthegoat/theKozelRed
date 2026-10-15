// 1:1 scheduling: type → month calendar → time → request.

const cfgEl = document.querySelector('[data-schedule-config]');
const root = document.querySelector('[data-schedule]');

if (cfgEl && root) {
  const cfg = JSON.parse(cfgEl.textContent);
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const monthName = (d) => d.toLocaleString('en', { month: 'long', year: 'numeric' });

  const $ = (sel) => root.querySelector(sel);
  const typesEl = $('[data-schedule-types]');
  const daysEl = $('[data-days]');
  const monthLabel = $('[data-month-label]');
  const timesWrap = $('[data-times-wrap]');
  const timesEl = $('[data-times]');
  const timesLabel = $('[data-times-label]');
  const summary = $('[data-schedule-summary]');
  const stepSlots = $('[data-step="slots"]');
  const stepForm = $('[data-step="form"]');
  const stepDone = $('[data-step="done"]');
  const formError = $('[data-form-error]');
  const form = $('[data-step="form"]');

  const state = { type: null, month: new Date(new Date().getFullYear(), new Date().getMonth(), 1), date: null, time: null, byDate: new Map() };

  function typeById(id) {
    return cfg.types.find((t) => t.id === id);
  }
  function updateSummary() {
    const t = typeById(state.type);
    summary.textContent = t ? `${t.name} · ${t.minutes} min · times in ${cfg.label}` : '';
  }
  function hideTimes() {
    state.date = null;
    state.time = null;
    timesWrap.hidden = true;
    timesEl.innerHTML = '';
  }

  typesEl.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-type]');
    if (!btn) return;
    state.type = btn.dataset.type;
    typesEl.querySelectorAll('[data-type]').forEach((b) => b.classList.toggle('border-brand', b === btn));
    loadMonth();
  });

  $('[data-month-prev]').addEventListener('click', () => {
    state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1);
    loadMonth();
  });
  $('[data-month-next]').addEventListener('click', () => {
    state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1);
    loadMonth();
  });

  async function loadMonth() {
    if (!state.type) return;
    const first = state.month;
    const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
    monthLabel.textContent = monthName(first);
    hideTimes();
    updateSummary();
    daysEl.innerHTML = '<span class="mono col-span-7 py-8 text-center text-muted">Loading…</span>';
    try {
      const res = await fetch(`/api/slots?type=${encodeURIComponent(state.type)}&from=${iso(first)}&to=${iso(last)}`);
      const body = await res.json();
      state.byDate = new Map();
      for (const slot of body.data?.slots || []) {
        if (!state.byDate.has(slot.date)) state.byDate.set(slot.date, []);
        state.byDate.get(slot.date).push(slot.time);
      }
      renderDays();
    } catch {
      daysEl.innerHTML = '<span class="mono col-span-7 py-8 text-center text-muted">Couldn’t load times — try again.</span>';
    }
  }

  function renderDays() {
    const first = state.month;
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const lead = (first.getDay() + 6) % 7; // Mon-first
    const today = iso(new Date());
    let html = '';
    for (let i = 0; i < lead; i++) html += '<span></span>';
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(day)}`;
      const times = state.byDate.get(date) || [];
      if (times.length) {
        const isToday = date === today ? ' text-brand' : '';
        html += `<button type="button" class="hair rounded-lg py-2 text-sm transition hover:border-brand${isToday}" data-day="${date}">${day}</button>`;
      } else {
        html += `<span class="pointer-events-none rounded-lg py-2 text-sm text-muted opacity-40">${day}</span>`;
      }
    }
    daysEl.innerHTML = html;
  }

  daysEl.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-day]');
    if (!btn) return;
    state.date = btn.dataset.day;
    daysEl.querySelectorAll('[data-day]').forEach((b) => b.classList.toggle('border-brand', b === btn));
    showTimes(state.date);
  });

  function showTimes(date) {
    const times = state.byDate.get(date) || [];
    const [y, m, d] = date.split('-').map(Number);
    const label = new Date(y, m - 1, d).toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' });
    timesLabel.textContent = `${label} — ${cfg.label}`;
    timesEl.innerHTML = times
      .map((t) => `<button type="button" class="btn px-4 py-2" data-time="${t}">${t}</button>`)
      .join('');
    timesWrap.hidden = false;
  }

  timesEl.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-time]');
    if (!btn) return;
    state.time = btn.dataset.time;
    showForm();
  });

  function showForm() {
    const t = typeById(state.type);
    const [y, m, d] = state.date.split('-').map(Number);
    const label = new Date(y, m - 1, d).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' });
    form.querySelector('[data-form-when]')?.remove();
    const when = document.createElement('p');
    when.dataset.formWhen = '';
    when.className = 'mono text-muted';
    when.textContent = `${t.name} · ${label} · ${state.time} (${cfg.label})`;
    form.prepend(when);
    formError.hidden = true;
    stepSlots.hidden = true;
    stepForm.classList.remove('hidden');
  }

  $('[data-form-back]').addEventListener('click', () => {
    stepForm.classList.add('hidden');
    stepSlots.hidden = false;
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    formError.hidden = true;
    const data = new FormData(form);
    const payload = {
      type: state.type,
      date: state.date,
      time: state.time,
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      note: String(data.get('note') || '').trim()
    };
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    submit.textContent = 'Sending…';
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message || 'Something went wrong.');
      const t = typeById(state.type);
      const [y, m, d] = state.date.split('-').map(Number);
      const label = new Date(y, m - 1, d).toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' });
      $('[data-done-summary]').textContent = `${t.name} · ${label} · ${state.time} (${cfg.label})`;
      stepForm.classList.add('hidden');
      stepDone.classList.remove('hidden');
    } catch (err) {
      formError.textContent = err.message;
      formError.hidden = false;
      submit.disabled = false;
      submit.textContent = 'Send request';
    }
  });
}
