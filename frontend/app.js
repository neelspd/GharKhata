// ============================================================
// APP — rendering + event wiring. Talks only to data.js functions,
// never touches the DOM from inside data.js. That separation is
// the bit worth preserving when this becomes Angular/Vue: data.js
// becomes services, this file becomes components.
// ============================================================

function dailyCategories() { return CATEGORIES.filter(c => c.type !== 'FIXED_MONTHLY'); }
function fixedCategories() { return CATEGORIES.filter(c => c.type === 'FIXED_MONTHLY'); }

function fmt(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function rupees(n) { return 'Rs ' + Math.round(n || 0).toLocaleString(); }

const today = new Date();
let viewYear = today.getFullYear();
let viewMonth = today.getMonth();
let selectedDate = fmt(today);

// ---------------- NAV ----------------
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => showScreen(btn.dataset.screen));
});

function showScreen(name) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.screen === name));
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + name));
  if (name === 'diary') renderEntryDrawer();
  if (name === 'dashboard') renderDashboard();
  if (name === 'close') renderClose();
  if (name === 'categories') { renderCategories(); renderUnits(); }
}

// ---------------- DIARY ----------------
function renderCalendar() {
  const dow = document.getElementById('cal-dow');
  if (!dow.childElementCount) {
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(d => {
      const el = document.createElement('div'); el.className = 'dow'; el.textContent = d; dow.appendChild(el);
    });
  }

  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';
  const first = new Date(viewYear, viewMonth, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(viewYear, viewMonth + 1, 0).getDate();
  document.getElementById('cal-title').textContent = first.toLocaleString('default', { month: 'long', year: 'numeric' });

  for (let i = 0; i < offset; i++) grid.appendChild(document.createElement('div'));

  for (let day = 1; day <= days; day++) {
    const d = new Date(viewYear, viewMonth, day);
    const key = fmt(d);
    const cell = document.createElement('div');
    cell.className = 'daycell';
    if (key === fmt(today)) cell.classList.add('today');
    if (key === selectedDate) cell.classList.add('selected');
    cell.addEventListener('click', () => { selectedDate = key; renderCalendar(); renderEntryDrawer(); });

    const num = document.createElement('div'); num.textContent = day;
    cell.appendChild(num);

    if (entries[key] && Object.keys(entries[key]).length) {
      const dot = document.createElement('div'); dot.className = 'dot';
      cell.appendChild(dot);
    }
    grid.appendChild(cell);
  }
}

function renderEntryDrawer() {
  const d = new Date(selectedDate + 'T00:00:00');
  document.getElementById('entry-date').textContent = d.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const rowsEl = document.getElementById('entry-rows');
  rowsEl.innerHTML = '';
  dailyCategories().forEach(cat => {
    const row = document.createElement('div');
    row.className = 'entry-row';
    row.id = 'row-' + cat.code;
    rowsEl.appendChild(row);
    renderEntryRow(cat.code);
  });

  // fixed bills, read-only
  const fb = document.getElementById('fixed-bills-mount');
  fb.innerHTML = fixedCategories().map(c =>
    `<div class="row-between" style="padding:4px 0;"><span style="font-size:13px;">${c.name}</span><span class="num">${rupees(c.fixedAmount)} / month</span></div>`
  ).join('');
}

function renderEntryRow(catCode) {
  const cat = categoryByCode(catCode);
  const row = document.getElementById('row-' + catCode);

  if (!cat.units.length) {
    row.innerHTML = `<span class="cat-name">${cat.name}</span><span style="font-size:11px;color:var(--muted);">no units assigned yet — add one in Categories</span>`;
    return;
  }

  const existing = (entries[selectedDate] || {})[catCode];
  const selectedUnit = existing ? existing.unitCode : (cat.units.find(u => u.isDefault) || cat.units[0]).unitCode;
  const cu = categoryUnit(catCode, selectedUnit);
  const hasRate = cu && cu.rate != null;
  const computed = existing ? existing.amount : 0;

  const unitOptions = cat.units.map(u =>
    `<option value="${u.unitCode}" ${u.unitCode === selectedUnit ? 'selected' : ''}>${unitName(u.unitCode)}</option>`
  ).join('');

  row.innerHTML = `
    <span class="cat-name">${cat.name}</span>
    <select class="unit-select" data-cat="${catCode}">${unitOptions}</select>
    <input type="number" min="0" step="0.5" class="qty-input" data-cat="${catCode}"
      value="${existing ? (existing.quantity ?? '') : ''}" placeholder="qty">
    ${hasRate
      ? `<span style="font-size:11px;color:var(--muted);">&times; Rs ${cu.rate}</span>`
      : `<input type="number" min="0" class="amt-input" data-cat="${catCode}" value="${existing ? (existing.amount || '') : ''}" placeholder="amount">`
    }
    <span class="entry-amt num" id="amt-${catCode}">${rupees(computed)}</span>
  `;

  if (existing) {
    const note = document.createElement('div');
    note.className = 'entry-note';
    note.textContent = `Logged ${existing.quantity ?? ''} ${existing.quantity ? unitName(existing.unitCode).toLowerCase() : ''} — editing posts a correction.`;
    row.appendChild(note);
  }

  row.querySelector('.unit-select').addEventListener('change', () => renderEntryRow(catCode));
  row.querySelectorAll('.qty-input, .amt-input').forEach(inp => {
    inp.addEventListener('input', () => updateLivePreview(catCode));
  });
}

function updateLivePreview(catCode) {
  const row = document.getElementById('row-' + catCode);
  const unit = row.querySelector('.unit-select').value;
  const qty = row.querySelector('.qty-input').value;
  const amtInput = row.querySelector('.amt-input');
  const amt = amtInput ? amtInput.value : null;
  const computed = computeAmount(catCode, unit, qty, amt);
  document.getElementById('amt-' + catCode).textContent = rupees(computed);
}

document.getElementById('save-entries').addEventListener('click', () => {
  dailyCategories().forEach(cat => {
    if (!cat.units.length) return;
    const row = document.getElementById('row-' + cat.code);
    const unit = row.querySelector('.unit-select').value;
    const qty = row.querySelector('.qty-input').value;
    const amtInput = row.querySelector('.amt-input');
    const amt = amtInput ? amtInput.value : null;
    if (!qty && !amt) return; // nothing entered for this category today
    recordOrCorrectEntry({ categoryCode: cat.code, date: selectedDate, unitCode: unit, quantity: qty, amount: amt });
  });
  renderCalendar();
  renderEntryDrawer();
});

document.getElementById('cal-prev').addEventListener('click', () => {
  viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } renderCalendar();
});
document.getElementById('cal-next').addEventListener('click', () => {
  viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } renderCalendar();
});

// ---------------- DASHBOARD ----------------
function currentMonthStr() { return viewYear + '-' + String(viewMonth + 1).padStart(2, '0'); }

function renderDashboard() {
  const month = currentMonthStr();
  const throughDate = monthKey(fmt(today)) === month ? fmt(today) : null; // month-to-date only if viewing current month
  const totals = monthTotals(month, throughDate);

  document.getElementById('dash-month-note').textContent =
    new Date(viewYear, viewMonth, 1).toLocaleString('default', { month: 'long', year: 'numeric' }) +
    (throughDate ? ' — month to date' : ' — full month');

  const grandTotal = Object.values(totals).reduce((s, t) => s + t.amount, 0);
  const metricGrid = document.getElementById('metric-grid');
  const headline = [{ label: 'Total spend', value: grandTotal }];
  CATEGORIES.forEach(c => headline.push({ label: c.name, value: totals[c.code].amount }));
  metricGrid.innerHTML = headline.map(m =>
    `<div class="panel metric"><div class="label">${m.label}</div><div class="value num">${rupees(m.value)}</div></div>`
  ).join('');

  const maxAmt = Math.max(1, ...CATEGORIES.map(c => totals[c.code].amount));
  document.getElementById('breakdown-list').innerHTML = CATEGORIES.map(c => {
    const amt = totals[c.code].amount;
    const pct = Math.round((amt / maxAmt) * 100);
    return `<div class="breakdown-row">
      <span style="width:120px;">${c.name}</span>
      <div class="bar"><div class="bar-fill" style="width:${pct}%;"></div></div>
      <span class="num" style="width:70px;text-align:right;">${rupees(amt)}</span>
    </div>`;
  }).join('');

  const corrections = recentCorrections(5);
  document.getElementById('corrections-feed').innerHTML = corrections.length
    ? corrections.map(e => `<div class="feed-item">${e.date} — ${categoryByCode(e.categoryCode).name} corrected to ${rupees(e.amount)}</div>`).join('')
    : '<div class="feed-item">No corrections logged yet</div>';
}

// ---------------- CLOSE & PAY ----------------
function renderClose() {
  const month = currentMonthStr();
  const wrap = document.getElementById('close-rows');
  wrap.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const s = getStatement(month, cat.code);
    const next = STATEMENT_FLOW[s.status];
    const row = document.createElement('div');
    row.className = 'close-row';
    row.innerHTML = `
      <span class="cat-name">${cat.name}</span>
      <span class="num" style="width:80px;text-align:right;">${rupees(s.totalAmount)}</span>
      <span class="badge ${s.status === 'PAID' ? 'accent' : ''}">${s.status.toLowerCase()}</span>
      ${next ? `<button data-cat="${cat.code}">Mark ${next.toLowerCase()}</button>` : '<span style="font-size:11px;color:var(--muted);width:90px;">settled</span>'}
    `;
    wrap.appendChild(row);
  });
  wrap.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => { advanceStatement(month, btn.dataset.cat); renderClose(); });
  });
}

// ---------------- CATEGORIES & UNITS ----------------
const TYPE_LABEL = { QUANTITY_RATE: 'quantity + rate', FIXED_MONTHLY: 'fixed monthly', VARIABLE_AMOUNT: 'variable amount' };

function renderCategories() {
  const wrap = document.getElementById('categories-list');
  wrap.innerHTML = CATEGORIES.map(cat => {
    const unitsHtml = cat.units.length
      ? cat.units.map(u => `<span class="unit-pill">${unitName(u.unitCode)}${u.rate != null ? ' &middot; ' + rupees(u.rate) : ' &middot; direct amount'}</span>`).join('')
      : (cat.fixedAmount != null ? `<span class="unit-pill">${rupees(cat.fixedAmount)} / month</span>` : '<span style="font-size:11px;color:var(--muted);">no units assigned yet</span>');

    const availableUnits = cat.type !== 'FIXED_MONTHLY' ? UNITS.filter(u => !cat.units.some(cu => cu.unitCode === u.code)) : [];
    const assignForm = availableUnits.length ? `
      <div class="add-form" style="margin-top:6px;">
        <select class="assign-unit-select" data-cat="${cat.code}">
          ${availableUnits.map(u => `<option value="${u.code}">${u.name}</option>`).join('')}
        </select>
        ${cat.type === 'QUANTITY_RATE' ? `<input type="number" class="assign-unit-rate" data-cat="${cat.code}" placeholder="rate" style="width:70px;">` : ''}
        <button class="ghost assign-unit-btn" data-cat="${cat.code}">+ Add unit</button>
      </div>` : '';

    return `<div class="cat-block">
      <div class="row-between">
        <span style="font-size:13px;">${cat.name}</span>
        <span class="badge">${TYPE_LABEL[cat.type]}</span>
      </div>
      <div class="unit-list">${unitsHtml}</div>
      ${assignForm}
    </div>`;
  }).join('');

  wrap.querySelectorAll('.assign-unit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const catCode = btn.dataset.cat;
      const select = wrap.querySelector(`.assign-unit-select[data-cat="${catCode}"]`);
      const rateInput = wrap.querySelector(`.assign-unit-rate[data-cat="${catCode}"]`);
      try {
        addUnitToCategory(catCode, select.value, rateInput ? rateInput.value : null);
      } catch (err) { alert(err.message); return; }
      renderCategories();
      renderEntryDrawer();
    });
  });
}

function renderUnits() {
  const wrap = document.getElementById('units-list');
  wrap.innerHTML = UNITS.map(u => `<div class="unit-row"><span style="flex:1;">${u.name}</span><span class="badge">${u.code}</span></div>`).join('');
  refreshNewCategoryUnitOptions();
}

function refreshNewCategoryUnitOptions() {
  document.getElementById('new-cat-unit').innerHTML = UNITS.map(u => `<option value="${u.code}">${u.name}</option>`).join('');
}

document.getElementById('add-unit-btn').addEventListener('click', () => {
  const codeInput = document.getElementById('new-unit-code');
  const nameInput = document.getElementById('new-unit-name');
  const code = codeInput.value.trim().toUpperCase();
  const name = nameInput.value.trim();
  if (!code || !name) return;
  if (UNITS.some(u => u.code === code)) { alert('Unit code already exists'); return; }
  UNITS.push({ code, name });
  codeInput.value = ''; nameInput.value = '';
  renderUnits();
});

document.getElementById('new-cat-type').addEventListener('change', (e) => {
  const isFixed = e.target.value === 'FIXED_MONTHLY';
  document.getElementById('new-cat-unit-wrap').style.display = isFixed ? 'none' : 'inline-flex';
  document.getElementById('new-cat-fixed-wrap').style.display = isFixed ? 'inline-flex' : 'none';
});

document.getElementById('add-category-btn').addEventListener('click', () => {
  const name = document.getElementById('new-cat-name').value.trim();
  const type = document.getElementById('new-cat-type').value;
  if (!name) { alert('Enter a category name — e.g. Eggs, Bread'); return; }

  try {
    if (type === 'FIXED_MONTHLY') {
      addCategory({ name, type, fixedAmount: document.getElementById('new-cat-fixed-amount').value });
    } else {
      addCategory({
        name, type,
        unitCode: document.getElementById('new-cat-unit').value,
        rate: document.getElementById('new-cat-rate').value,
      });
    }
  } catch (err) { alert(err.message); return; }

  document.getElementById('new-cat-name').value = '';
  document.getElementById('new-cat-rate').value = '';
  document.getElementById('new-cat-fixed-amount').value = '';
  renderCategories();
  renderEntryDrawer();
});

// ---------------- INIT ----------------
renderCalendar();
renderEntryDrawer();
