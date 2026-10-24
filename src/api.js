// Data layer. Mock today; swap each function body for Supabase, Firebase or REST.
// The UI only talks to these functions, so nothing else changes.

export const POOL_TARGET = 20;
export const CITIES = ['All cities', 'Bengaluru', 'Chennai', 'Delhi NCR', 'Hyderabad', 'Mumbai', 'Pune'];
export const TYPES = ['All', 'Hatchback', 'Sedan', 'SUV', 'EV'];

const POOLS = [
  { id: 'p0', car: 'Tata Nexon', variant: 'Creative 1.2 Turbo', type: 'SUV', city: 'Bengaluru', base: 20, daysLeft: 0, hasBids: true },
  { id: 'p1', car: 'Hyundai Creta', variant: 'SX 1.5 Petrol', type: 'SUV', city: 'Bengaluru', base: 14, daysLeft: 9 },
  { id: 'p2', car: 'Maruti Swift', variant: 'ZXi', type: 'Hatchback', city: 'Mumbai', base: 17, daysLeft: 5 },
  { id: 'p3', car: 'Honda City', variant: 'VX CVT', type: 'Sedan', city: 'Delhi NCR', base: 9, daysLeft: 16 },
  { id: 'p4', car: 'Tata Punch EV', variant: 'Smart+ 25 kWh', type: 'EV', city: 'Hyderabad', base: 19, daysLeft: 3 },
  { id: 'p5', car: 'Mahindra XUV700', variant: 'AX5 Diesel', type: 'SUV', city: 'Pune', base: 11, daysLeft: 12 },
  { id: 'p6', car: 'Hyundai i20', variant: 'Sportz', type: 'Hatchback', city: 'Chennai', base: 6, daysLeft: 20 },
  { id: 'p7', car: 'Skoda Slavia', variant: 'Style 1.0 TSI', type: 'Sedan', city: 'Bengaluru', base: 12, daysLeft: 8 },
];

// Sample bids for pool p0 only. Replace with real dealer bids from your backend.
const LIST_ON_ROAD = 1395000;
const SAMPLE_QUOTES = [
  { id: 'q1', dealer: 'Cauvery Auto', exShowroom: 1120000, insurance: 38500, registration: 145000, accessories: 12000 },
  { id: 'q2', dealer: 'Metro Wheels', exShowroom: 1105000, insurance: 41000, registration: 145000, accessories: 28000, note: 'Includes ₹28,000 of accessories' },
  { id: 'q3', dealer: 'Sunrise Motors', exShowroom: 1130000, insurance: 36000, registration: 145000, accessories: 0 },
];

const KEY = 'poolwheels:v1';
const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
};
const write = (s) => {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage unavailable */ }
};
const joinedIds = () => new Set(read().joined || []);

const withState = (p, joined) => ({
  ...p,
  joined: joined.has(p.id),
  count: p.base + (joined.has(p.id) ? 1 : 0),
});

export async function listPools({ city = 'All cities', type = 'All', joinedOnly = false } = {}) {
  const joined = joinedIds();
  return POOLS
    .filter((p) => (city === 'All cities' || p.city === city) && (type === 'All' || p.type === type))
    .map((p) => withState(p, joined))
    .filter((p) => !joinedOnly || p.joined);
}

export async function joinPool(id) {
  const s = read();
  const joined = new Set(s.joined || []);
  joined.add(id);
  write({ ...s, joined: [...joined] });
  return withState(POOLS.find((p) => p.id === id), joined);
}

export async function leavePool(id) {
  const s = read();
  const joined = new Set(s.joined || []);
  joined.delete(id);
  write({ ...s, joined: [...joined] });
}

// Quotes stay empty for pools without real bids. Totals are computed here, lowest first.
export async function getQuotes(poolId) {
  if (poolId !== 'p0') return { listOnRoad: null, quotes: [] };
  const quotes = SAMPLE_QUOTES
    .map((q) => ({ ...q, total: q.exShowroom + q.insurance + q.registration + q.accessories }))
    .sort((a, b) => a.total - b.total);
  return { listOnRoad: LIST_ON_ROAD, quotes };
}

export async function getDecisions() {
  return read().decisions || {};
}

export async function setDecision(quoteId, decision) {
  const s = read();
  const decisions = { ...(s.decisions || {}) };
  if (decision) decisions[quoteId] = decision; else delete decisions[quoteId];
  write({ ...s, decisions });
  return decisions;
}
