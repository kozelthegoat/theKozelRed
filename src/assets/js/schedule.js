// 1:1 scheduling: type → month calendar → time → request.
// Times are shown in the visitor's timezone; every session is anchored to Minsk.

import { zonedWallClockToUtc, zoneOffsetLabel, isValidZone } from '../../lib/tz.js';

const cfgEl = document.querySelector('[data-schedule-config]');
const root = document.querySelector('[data-schedule]');

if (cfgEl && root) {
  const cfg = JSON.parse(cfgEl.textContent);
  const $ = (sel) => root.querySelector(sel);
  const pad = (n) => String(n).padStart(2, '0');

  // Document-wide rather than scoped to `root`. The picker moves with the design — it sits in the
  // details form now — and a scoped lookup once silently returned null when it lived elsewhere,
  // taking the whole calendar with it, since the next line attaches a listener to it.
  const typesEl = document.querySelector('[data-schedule-types]');
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
  const tzTrigger = $('[data-tz-trigger]');
  const tzPanel = $('[data-tz-panel]');
  const tzOptionsEl = $('[data-tz-options]');
  const tzSearch = $('[data-tz-search]');
  const tzLabel = $('[data-tz-label]');
  const tzOffsetEl = $('[data-tz-offset]');
  const tzPicker = $('[data-tz-picker]');
  const layoutSwitch = $('[data-layout-switch]');
  const monthNav = $('[data-month-nav]');
  const prevBtn = $('[data-month-prev]');
  const nextBtn = $('[data-month-next]');
  const monthView = $('[data-view="month"]');
  const listView = $('[data-view="list"]');
  const listEl = $('[data-list]');

  const detectedRaw = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const detected = isValidZone(detectedRaw) ? detectedRaw : cfg.timezone;
  const zones = ((typeof Intl.supportedValuesOf === 'function' && Intl.supportedValuesOf('timeZone')) || []).filter(isValidZone);
  if (zones.length && !zones.includes(detected)) zones.unshift(detected);
  if (!zones.length) zones.push(detected);

  const dateFormatters = new Map();
  const dateInTz = (tz, at) => {
    let f = dateFormatters.get(tz);
    if (!f) {
      f = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
      dateFormatters.set(tz, f);
    }
    return f.format(at);
  };
  const shortTz = () => state.tz.replace(/_/g, ' ');
  // Same "UTC+3" notation the server uses, so the picker and /me agree.
  const tzOffset = (tz) => zoneOffsetLabel(tz);
  const setTzDisplay = (tz) => {
    tzLabel.textContent = tz.replace(/_/g, ' ');
    tzOffsetEl.textContent = tzOffset(tz);
  };
  setTzDisplay(detected);
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
    // Defaulted here, not left for the initialiser at the foot of the file: load() returns early
    // without a type, so anything that stops that line running empties the whole calendar — no
    // period, no dates, no times — rather than failing visibly.
    type: cfg.types[0]?.id || null,
    tz: detected,
    layout: 'month',
    year: start[0],
    month: start[1],
    byDate: new Map(),
    slots: [],
    days: 0,
    localDate: null,
    slot: null
  };

  layoutSwitch.querySelectorAll('[data-layout]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.layout === state.layout ? 'true' : 'false'));

  function typeById(id) {
    return cfg.types.find((t) => t.id === id);
  }
  function selectType(id) {
    state.type = id;
    typesEl.querySelectorAll('[data-type]').forEach((input) => {
      input.checked = input.value === id;
    });
  }
  function goToCurrentMonth(tz) {
    const [y, m] = dateInTz(tz, new Date()).split('-').map(Number);
    state.year = y;
    state.month = m;
  }

  // Radios now, so the browser carries the choice and the arrow keys carry it too. The request is
  // still sent by fetch with the type read from the state, so nothing here waits on the form
  // submitting. Every session is 30 minutes, so the choice changes what is sent, never what the
  // calendar can show — which is the other reason the calendar does not wait on it.
  typesEl.addEventListener('change', (event) => {
    const input = event.target.closest('[data-type]');
    if (!input) return;
    selectType(input.value);
    if (!state.slots.length) load();
  });

  const normTz = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  function renderTimezoneOptions(filter = '') {
    const f = normTz(filter);
    const list = f ? zones.filter((z) => normTz(z).includes(f)) : zones;
    tzOptionsEl.innerHTML = list.length
      ? list
          .map(
            (z) =>
              `<li role="option" tabindex="-1" data-tz-value="${z}" class="flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm transition-colors hover:bg-brand/5 ${z === state.tz ? 'bg-brand/10 text-brand' : ''}"><span class="truncate">${z.replace(/_/g, ' ')}</span><span class="shrink-0 text-muted">${tzOffset(z)}</span></li>`
          )
          .join('')
      : '<li class="px-3 py-2 text-sm text-muted">No match.</li>';
  }
  function openPanel() {
    renderTimezoneOptions('');
    tzSearch.value = '';
    tzPanel.classList.remove('hidden');
    tzTrigger.setAttribute('aria-expanded', 'true');
    tzSearch.focus();
  }
  function closePanel() {
    tzPanel.classList.add('hidden');
    tzTrigger.setAttribute('aria-expanded', 'false');
  }
  function pickZone(tz) {
    if (!isValidZone(tz)) return;
    state.tz = tz;
    setTzDisplay(tz);
    closePanel();
    goToCurrentMonth(state.tz);
    groupSlots();
    render();
    if (state.localDate && state.byDate.get(state.localDate)?.length) showTimes(state.localDate);
  }
  tzTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    if (tzPanel.classList.contains('hidden')) openPanel();
    else closePanel();
  });
  tzSearch.addEventListener('input', () => renderTimezoneOptions(tzSearch.value));
  tzOptionsEl.addEventListener('click', (event) => {
    const opt = event.target.closest('[data-tz-value]');
    if (opt) pickZone(opt.dataset.tzValue);
  });
  document.addEventListener('click', (event) => {
    if (!tzPicker.contains(event.target)) closePanel();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePanel();
  });

  prevBtn.addEventListener('click', () => shift(-1));
  nextBtn.addEventListener('click', () => shift(1));

  function atEarliest() {
    if (state.layout === 'month') {
      const [y, m] = dateInTz(state.tz, new Date()).split('-').map(Number);
      return state.year < y || (state.year === y && state.month <= m);
    }
    return state.days <= 0;
  }
  function updateNav() {
    prevBtn.disabled = atEarliest();
  }

  function shift(delta) {
    if (state.layout === 'month') {
      shiftMonth(delta);
    } else {
      const step = 7;
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

  async function fetchWithRetry(url) {
    let lastErr;
    for (let i = 0; i < 3; i++) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (e) {
        lastErr = e;
        if (i < 2) await new Promise((r) => setTimeout(r, 500 * (i + 1)));
      }
    }
    throw lastErr;
  }

  async function load() {
    if (!state.type) return;
    state.slot = null;
    timesWrap.hidden = true;
    timesEl.innerHTML = '';
    monthLabel.textContent = monthName(state.year, state.month);
    daysEl.innerHTML = '<span class="mono col-span-7 py-8 text-center text-muted">Loading…</span>';
    const from = dateInTz(cfg.timezone, new Date());
    const to = addDays(from, 180);
    try {
      const body = await fetchWithRetry(`/api/slots?type=${encodeURIComponent(state.type)}&from=${from}&to=${to}`);
      state.slots = (body.data?.slots || []).map((slot) => ({
        ...slot,
        at: zonedWallClockToUtc(slot.date, slot.time, cfg.timezone).toISOString()
      }));
      groupSlots();
      if (!state.localDate) state.localDate = [...state.byDate.keys()].sort()[0] || null;
      render();
      if (state.localDate && state.byDate.get(state.localDate)?.length) showTimes(state.localDate);
    } catch (e) {
      console.error('schedule: failed to load slots', e);
      daysEl.innerHTML = '<span class="mono col-span-7 py-8 text-center text-muted">Couldn’t load times — try again.</span>';
    }
  }

  function groupSlots() {
    state.byDate = new Map();
    for (const slot of state.slots) {
      const local = dateInTz(state.tz, new Date(slot.at));
      if (!state.byDate.has(local)) state.byDate.set(local, []);
      state.byDate.get(local).push(slot);
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
    updateNav();
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
      .slice(0, 7);
    listEl.innerHTML = days.map(dayBlock).join('') || '<p class="mono text-muted">No times yet.</p>';
    monthLabel.textContent = days.length ? rangeLabel(days) : 'No times yet';
    updateNav();
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
    const pressed = state.slot && state.slot.date === s.date && state.slot.time === s.time;
    return `<button type="button" class="hair px-2.5 py-1.5 text-sm whitespace-nowrap tabular-nums transition hover:border-brand" data-time="${s.time}" data-date="${s.date}" data-at="${s.at}" aria-pressed="${pressed ? 'true' : 'false'}">${label}</button>`;
  }

  function onTimeClick(event) {
    const btn = event.target.closest('[data-time]');
    if (!btn) return;
    state.slot = { date: btn.dataset.date, time: btn.dataset.time, at: btn.dataset.at };
    document
      .querySelectorAll('[data-time]')
      .forEach((chip) => chip.setAttribute('aria-pressed', chip === btn ? 'true' : 'false'));
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
    timesEl.innerHTML = slots.map(timeChip).join('');
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
    return `${local} (${shortTz()})`;
  }

  // Picking a time opens the details form underneath the calendar, which stays put and already
  // shows the chosen day and time. No summary line of its own: stating the slot twice implied a
  // confirmation step that does not exist — the request is the confirmation.
  function showForm() {
    formError.hidden = true;
    stepForm.classList.remove('hidden');
    stepForm.scrollIntoView({ block: 'nearest' });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    formError.hidden = true;
    // The form used to be hidden until a time was picked, so a submit without one was impossible.
    // It is visible from the start now — it sits in its own column — so this has to say so.
    if (!state.slot) {
      formError.textContent = 'Pick a time first.';
      formError.hidden = false;
      return;
    }
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const note = String(data.get('note') || '').trim();
    if (name.length < 2) {
      formError.textContent = 'Please add your name.';
      formError.hidden = false;
      form.querySelector('[name="name"]').focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formError.textContent = 'Please add a valid email.';
      formError.hidden = false;
      form.querySelector('[name="email"]').focus();
      return;
    }
    const payload = {
      type: state.type,
      date: state.slot.date,
      time: state.slot.time,
      name,
      email,
      note,
      // So the confirmation can quote the time back in the clock they booked in.
      tz: state.tz
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
      const chose = typeById(state.type);
      $('[data-done-summary]').textContent = `${chose.audience} · ${whenLabel(true)}`;
      $('[data-done-note]').textContent = chose.confirmation || '';
      stepForm.classList.add('hidden');
      stepSlots.hidden = true;
      openDone();
    } catch (err) {
      formError.textContent = err.message;
      formError.hidden = false;
      submit.disabled = false;
      submit.textContent = 'Send request';
    }
  });

  // The confirmation is a dialog over an untouched page: the calendar behind it never moved,
  // so closing it puts you straight back where you were — which is what makes a second request
  // possible without a reload. Esc, the backdrop and the close button all run the same path.
  function openDone() {
    if (stepDone && typeof stepDone.showModal === 'function') stepDone.showModal();
    else if (stepDone) stepDone.classList.remove('hidden');
  }

  function resetBooking() {
    form.reset();
    formError.hidden = true;
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = false;
    submit.textContent = 'Send request';
    stepForm.classList.add('hidden');
    stepSlots.hidden = false;
    for (const chip of document.querySelectorAll('[data-time]')) {
      chip.setAttribute('aria-pressed', 'false');
    }
  }

  if (stepDone && typeof stepDone.showModal === 'function') {
    // No buttons inside — it says what happened and gets out of the way. Esc, the backdrop and
    // the × all run the same path, and closing re-arms the flow, so a second request is still
    // possible without a reload.
    stepDone.addEventListener('close', resetBooking);
    // A click on the backdrop reports the dialog itself as the target, never its contents.
    stepDone.addEventListener('click', (event) => {
      if (event.target === stepDone) stepDone.close('close');
    });
    $('[data-done-close]')?.addEventListener('click', () => stepDone.close('close'));
  }

  // Ungated on purpose. This was `if (firstType) { ... }`, so a query that came back empty left the
  // whole calendar blank — no period, no dates, no times — without a word about why. The state now
  // carries a default too, so either one alone is enough.
  selectType(typesEl.querySelector('[data-type]:checked')?.value || state.type);
  load();
}
