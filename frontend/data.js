// ============================================================
// DATA LAYER
// Mirrors the backend domain model (events, categories, units,
// statements) using plain in-memory JS instead of HTTP calls.
// When this becomes Angular/Vue, this file maps to services:
// CategoryService, EntryService, StatementService.
// ============================================================

const UNITS = [
  { code: 'L',   name: 'Liters' },
  { code: 'KG',  name: 'Kilograms' },
  { code: 'PKT', name: 'Packets' },
  { code: 'DZ',  name: 'Dozen' },
  { code: 'PCS', name: 'Pieces' },
];

const CATEGORIES = [
  {
    code: 'MILK', name: 'Milk', type: 'QUANTITY_RATE', fixedAmount: null,
    units: [
      { unitCode: 'L', rate: 32, isDefault: true },
      { unitCode: 'PKT', rate: 25, isDefault: false },
    ],
  },
  {
    code: 'LAUNDRY', name: 'Laundry', type: 'QUANTITY_RATE', fixedAmount: null,
    units: [
      { unitCode: 'PCS', rate: 10, isDefault: true },
    ],
  },
  {
    code: 'VEGGIES', name: 'Veggies & fruit', type: 'VARIABLE_AMOUNT', fixedAmount: null,
    units: [
      { unitCode: 'KG', rate: null, isDefault: true },
      { unitCode: 'DZ', rate: null, isDefault: false },
      { unitCode: 'PCS', rate: null, isDefault: false },
    ],
  },
  { code: 'NEWSPAPER', name: 'Newspaper', type: 'FIXED_MONTHLY', fixedAmount: 300, units: [] },
  { code: 'HOUSE_HELP', name: 'House help salary', type: 'FIXED_MONTHLY', fixedAmount: 6000, units: [] },
];

let nextSeq = 1;
const events = [];          // append-only audit log
const entries = {};         // date -> { categoryCode -> {eventId, aggregateId, unitCode, quantity, amount} }
const statements = {};      // "month|categoryCode" -> {status, totalAmount, totalQuantity}

function uid() { return 'id-' + Math.random().toString(36).slice(2, 10); }

function categoryByCode(code) { return CATEGORIES.find(c => c.code === code); }
function unitName(code) { const u = UNITS.find(u => u.code === code); return u ? u.name : code; }
function categoryUnit(catCode, unitCode) {
  const cat = categoryByCode(catCode);
  return cat ? cat.units.find(u => u.unitCode === unitCode) : null;
}

function computeAmount(catCode, unitCode, quantity, amountOverride) {
  const cu = categoryUnit(catCode, unitCode);
  if (cu && cu.rate != null) return (Number(quantity) || 0) * cu.rate;
  return Number(amountOverride) || 0;
}

function recordOrCorrectEntry({ categoryCode, date, unitCode, quantity, amount, note }) {
  const existing = entries[date] && entries[date][categoryCode];
  const computed = computeAmount(categoryCode, unitCode, quantity, amount);
  const aggregateId = existing ? existing.aggregateId : uid();
  const eventId = uid();

  events.push({
    eventId, seq: nextSeq++, aggregateId,
    type: existing ? 'EntryCorrected' : 'EntryRecorded',
    categoryCode, date, unitCode, quantity: Number(quantity) || null, amount: computed, note,
    correctionOf: existing ? existing.eventId : null,
    recordedAt: new Date().toISOString(),
  });

  entries[date] = entries[date] || {};
  entries[date][categoryCode] = { eventId, aggregateId, unitCode, quantity: Number(quantity) || null, amount: computed };
  return entries[date][categoryCode];
}

function monthKey(dateStr) { return dateStr.slice(0, 7); }

function monthTotals(month, throughDate) {
  const totals = {};
  CATEGORIES.forEach(c => { totals[c.code] = { quantity: 0, amount: 0 }; });

  Object.keys(entries).forEach(date => {
    if (monthKey(date) !== month) return;
    if (throughDate && date > throughDate) return;
    Object.entries(entries[date]).forEach(([catCode, e]) => {
      totals[catCode].quantity += (e.quantity || 0);
      totals[catCode].amount += (e.amount || 0);
    });
  });

  CATEGORIES.filter(c => c.type === 'FIXED_MONTHLY').forEach(c => {
    totals[c.code].amount = c.fixedAmount;
  });

  return totals;
}

function slugCode(name) {
  return name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// Households differ — some track Eggs or Bread daily, most don't.
// New categories are a data insert, same as the seeded ones.
function addCategory({ name, type, fixedAmount, unitCode, rate }) {
  const code = slugCode(name);
  if (categoryByCode(code)) throw new Error('A category with that name already exists');

  const units = [];
  if (type !== 'FIXED_MONTHLY' && unitCode) {
    units.push({
      unitCode,
      rate: type === 'QUANTITY_RATE' && rate !== '' && rate != null ? Number(rate) : null,
      isDefault: true,
    });
  }

  const cat = {
    code, name, type,
    fixedAmount: type === 'FIXED_MONTHLY' ? (Number(fixedAmount) || 0) : null,
    units,
  };
  CATEGORIES.push(cat);
  return cat;
}

function addUnitToCategory(catCode, unitCode, rate) {
  const cat = categoryByCode(catCode);
  if (!cat) throw new Error('Unknown category');
  if (cat.units.some(u => u.unitCode === unitCode)) throw new Error('That unit is already assigned to this category');
  const finalRate = cat.type === 'QUANTITY_RATE' && rate !== '' && rate != null ? Number(rate) : null;
  cat.units.push({ unitCode, rate: finalRate, isDefault: cat.units.length === 0 });
  return cat;
}

const STATEMENT_FLOW = { DRAFT: 'REVIEWED', REVIEWED: 'CLOSED', CLOSED: 'PAID', PAID: null };

function getStatement(month, catCode) {
  const key = month + '|' + catCode;
  if (!statements[key]) {
    const t = monthTotals(month)[catCode];
    statements[key] = { month, categoryCode: catCode, status: 'DRAFT', totalAmount: t.amount, totalQuantity: t.quantity };
  }
  return statements[key];
}

function advanceStatement(month, catCode) {
  const s = getStatement(month, catCode);
  const next = STATEMENT_FLOW[s.status];
  if (!next) return s;
  if (s.status === 'DRAFT') {
    const t = monthTotals(month)[catCode];
    s.totalAmount = t.amount;
    s.totalQuantity = t.quantity;
  }
  s.status = next;
  events.push({ eventId: uid(), seq: nextSeq++, type: 'Statement' + next, categoryCode: catCode, month, recordedAt: new Date().toISOString() });
  return s;
}

function recentCorrections(limit) {
  return events.filter(e => e.type === 'EntryCorrected').slice(-limit).reverse();
}
