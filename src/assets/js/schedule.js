// 1:1 scheduling: type → month calendar → time → request.
// Times are shown in the visitor's timezone; every session is anchored to Minsk.

const cfgEl = document.querySelector('[data-schedule-config]');
const root = document.querySelector('[data-schedule]');

if (cfgEl && root) {
  const cfg = JSON.parse(cfgEl.textContent);
  const $ = (sel) => root.querySelector(sel);
  const pad = (n) => String(n).padStart(2, '0');

  const typesEl = $('[data-schedule-types]');
  const daysEl = $('[data-days]');
  const monthLabel = $('[data-month-label]');
  const timesWrap = $('[data-times-wrap]');
  const timesEl = $('[data-times]');
  const timesLabel = $('[data-times-label]');
  const stepSlots = $('[data-step="slots"]');
  const stepForm = $('[data-step="form"]');
  const stepDone = $('[data-step="done"]');
  const formError = $('[data-form-error]');
  const form = $('[data-step="form"]');
  const tzSelect = $('[data-tz]');
  const tzNote = $('[data-tz-note]');
  const layoutSwitch = $('[data-layout-switch]');
  const monthNav = $('[data-month-nav]');
  const monthView = $('[data-view="month"]');
  const listView = $('[data-view="list"]');
  const listEl = $('[data-list]');

  const isValidZone = (tz) => {
    if (!tz) return false;
    try {
      new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
      return true;
    } catch {
      return false;
    }
  };
  const detectedRaw = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const detected = isValidZone(detectedRaw) ? detectedRaw : cfg.timezone;
  const zones = ((typeof Intl.supportedValuesOf === 'function' && Intl.supportedValuesOf('timeZone')) || []).filter(isValidZone);
  if (zones.length && !zones.includes(detected)) zones.unshift(detected);
  tzSelect.innerHTML = (zones.length ? zones : [detected])
    .map((z) => `<option value="${z}">${z.replace(/_/g, ' ')}</option>`)
    .join('');
  tzSelect.value = detected;

  const dateInTz = (tz, at) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(at);
  const shortTz = () => state.tz.replace(/_/g, ' ');
  const monthName = (y, m) => new Date(y, m - 1, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });
  const dayName = (y, m, d) =>
    new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  const addDays = (ymd, n) => {
    const [y, m, d] = ymd.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() + n);
    return dt.toISOString().slice(0, 10);
  };

  const start = dateInTz(detected, new Date()).split('-').map(Number);
  const state = {
    type: null,
    tz: detected,
    layout: 'month',
    year: start[0],
    month: start[1],
    byDate: new Map(),
    days: 0,
    localDate: null,
    slot: null
  };

  layoutSwitch.querySelectorAll('[data-layout]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.layout === state.layout ? 'true' : 'false'));

  function typeById(id) {
    return cfg.types.find((t) => t.id === id);
  }
  function updateSummary() {
    tzNote.textContent = `· ${cfg.label}`;
  }
  function hideTimes() {
    state.localDate = null;
    state.slot = null;
    timesWrap.hidden = true;
    timesEl.innerHTML = '';
  }
  function selectType(id) {
    state.type = id;
    typesEl.querySelectorAll('[data-type]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.type === id ? 'true' : 'false'));
  }
  function goToCurrentMonth(tz) {
    const [y, m] = dateInTz(tz, new Date()).split('-').map(Number);
    state.year = y;
    state.month = m;
  }

  typesEl.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-type]');
    if (!btn) return;
    selectType(btn.dataset.type);
    load();
  });

  tzSelect.addEventListener('change', () => {
    if (!isValidZone(tzSelect.value)) {
      tzSelect.value = state.tz;
      return;
    }
    state.tz = tzSelect.value;
    goToCurrentMonth(state.tz);
    load();
  });

  $('[data-month-prev]').addEventListener('click', () => shift(-1));
  $('[data-month-next]').addEventListener('click', () => shift(1));

  function shift(delta) {
    if (state.layout === 'month') {
      shiftMonth(delta);
    } else {
      const step = state.layout === 'list' ? 14 : 7;
      state.days = Math.max(0, state.days + delta * step);
      render();
    }
  }

  function shiftMonth(delta) {
    let m = state.month + delta;
    let y = state.year;
    while (m < 1) {
      m += 12;
      y -= 1;
    }
    while (m > 12) {
      m -= 12;
      y += 1;
    }
    state.year = y;
    state.month = m;
    renderMonth();
  }

  async function load() {
    if (!state.type) return;
    hideTimes();
    updateSummary();
    monthLabel.textContent = monthName(state.year, state.month);
    daysEl.innerHTML = '<span class="mono col-span-7 py-8 text-center text-muted">Loading…</span>';
    const from = dateInTz(cfg.timezone, new Date());
    const to = addDays(from, 180);
    try {
      const res = await fetch(`/api/slots?type=${encodeURIComponent(state.type)}&from=${from}&to=${to}`);
      const body = await res.json();
      state.byDate = new Map();
      for (const slot of body.data?.slots || []) {
        const local = dateInTz(state.tz, new Date(slot.at));
        if (!state.byDate.has(local)) state.byDate.set(local, []);
        state.byDate.get(local).push(slot);
      }
      render();
    } catch (e) {
      console.error('schedule: failed to load slots', e);
      daysEl.innerHTML = '<span class="mono col-span-7 py-8 text-center text-muted">Couldn’t load times — try again.</span>';
    }
  }

  function renderMonth() {
    monthLabel.textContent = monthName(state.year, state.month);
    const first = new Date(Date.UTC(state.year, state.month - 1, 1));
    const daysInMonth = new Date(Date.UTC(state.year, state.month, 0)).getUTCDate();
    const lead = (first.getUTCDay() + 6) % 7;
    const today = dateInTz(state.tz, new Date());
    let html = '';
    for (let i = 0; i < lead; i++) html += '<span></span>';
    for (let day = 1; day <= daysInMonth; day++) {
      const local = `${state.year}-${pad(state.month)}-${pad(day)}`;
      const slots = state.byDate.get(local) || [];
      const dot =
        local === today
          ? '<span class="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand"></span>'
          : '';
      if (slots.length) {
        const pressed = local === state.localDate ? 'true' : 'false';
        html += `<button type="button" class="pick-btn relative py-2 text-sm" data-day="${local}" aria-pressed="${pressed}">${day}${dot}</button>`;
      } else {
        const dim = local === today ? '' : ' opacity-40';
        html += `<span class="relative pointer-events-none py-2 text-sm text-muted${dim}">${day}${dot}</span>`;
      }
    }
    daysEl.innerHTML = html;
  }

  function render() {
    monthView.classList.toggle('hidden', state.layout !== 'month');
    listView.classList.toggle('hidden', state.layout === 'month');
    monthNav.classList.remove('hidden');
    if (state.layout === 'month') {
      renderMonth();
    } else {
      renderList();
    }
  }

  function renderList() {
    listEl.className = state.layout === 'week' ? 'grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7' : 'grid gap-5';
    const from = addDays(dateInTz(state.tz, new Date()), state.days);
    const days = [...state.byDate.keys()]
      .filter((d) => d >= from)
      .sort()
      .slice(0, state.layout === 'week' ? 7 : 14);
    listEl.innerHTML = days.map(dayBlock).join('') || '<p class="mono text-muted">No times yet.</p>';
    monthLabel.textContent = days.length ? rangeLabel(days) : 'No times yet';
  }

  function rangeLabel(list) {
    const fmt = (ymd) => {
      const [y, m, d] = ymd.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    };
    if (list.length === 1) return fmt(list[0]);
    return `${fmt(list[0])} – ${fmt(list[list.length - 1])}`;
  }

  function dayBlock(local) {
    const slots = state.byDate.get(local) || [];
    const [y, m, d] = local.split('-').map(Number);
    const label = new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
    return `<div class="grid content-start gap-2"><p class="mono text-muted">${label}</p><div class="flex flex-wrap gap-2">${slots.map(timeChip).join('')}</div></div>`;
  }

  function timeChip(s) {
    const label = new Intl.DateTimeFormat(undefined, { timeZone: state.tz, hour: '2-digit', minute: '2-digit' }).format(new Date(s.at));
    return `<button type="button" class="hair px-2.5 py-1.5 text-sm whitespace-nowrap tabular-nums transition hover:border-brand" data-time="${s.time}" data-date="${s.date}" data-at="${s.at}">${label}</button>`;
  }

  function onTimeClick(event) {
    const btn = event.target.closest('[data-time]');
    if (!btn) return;
    state.slot = { date: btn.dataset.date, time: btn.dataset.time, at: btn.dataset.at };
    showForm();
  }

  layoutSwitch.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-layout]');
    if (!btn) return;
    state.layout = btn.dataset.layout;
    state.days = 0;
    layoutSwitch.querySelectorAll('[data-layout]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.layout === state.layout ? 'true' : 'false'));
    render();
  });

  daysEl.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-day]');
    if (!btn) return;
    state.localDate = btn.dataset.day;
    daysEl.querySelectorAll('[data-day]').forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
    showTimes(state.localDate);
  });

  function showTimes(local) {
    const slots = state.byDate.get(local) || [];
    const [y, m, d] = local.split('-').map(Number);
    timesLabel.textContent = `${dayName(y, m, d)} — ${shortTz()}`;
    timesEl.innerHTML = slots
      .map(
        (s) =>
          `<button type="button" class="btn px-4 py-2" data-time="${s.time}" data-date="${s.date}" data-at="${s.at}">${new Intl.DateTimeFormat(undefined, { timeZone: state.tz, hour: '2-digit', minute: '2-digit' }).format(new Date(s.at))}</button>`
      )
      .join('');
    timesWrap.hidden = false;
  }

  timesEl.addEventListener('click', onTimeClick);
  listEl.addEventListener('click', onTimeClick);

  function whenLabel(withWeekday) {
    const at = new Date(state.slot.at);
    const local = new Intl.DateTimeFormat(undefined, {
      timeZone: state.tz,
      weekday: withWeekday ? 'short' : undefined,
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(at);
    const minsk = new Intl.DateTimeFormat(undefined, {
      timeZone: cfg.timezone,
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(at);
    return `${local} (${shortTz()}) — ${cfg.label}: ${minsk}`;
  }

  function showForm() {
    const t = typeById(state.type);
    form.querySelector('[data-form-when]')?.remove();
    const when = document.createElement('p');
    when.dataset.formWhen = '';
    when.className = 'mono text-muted';
    when.textContent = `${t.name} · ${whenLabel(true)}`;
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
      date: state.slot.date,
      time: state.slot.time,
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
      $('[data-done-summary]').textContent = `${typeById(state.type).name} · ${whenLabel(true)}`;
      stepForm.classList.add('hidden');
      stepDone.classList.remove('hidden');
    } catch (err) {
      formError.textContent = err.message;
      formError.hidden = false;
      submit.disabled = false;
      submit.textContent = 'Send request';
    }
  });

  const firstType = typesEl.querySelector('[data-type]');
  if (firstType) {
    selectType(firstType.dataset.type);
    load();
  }
}
