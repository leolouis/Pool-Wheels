// Data layer. Everything the UI needs goes through here, so swapping the
// in-memory mock for Supabase/Firebase/your own API only touches this file.
// Prices are empty until real dealer bids exist: never show invented numbers.

const POOL_SIZE = 20

let pools = [
  { id: 'creta-mum', hex: '#E4572E', body: 'suv', model: 'Hyundai Creta', variant: 'SX IVT', color: 'Any colour', city: 'Mumbai', type: 'SUV', window: 'This month', joined: 0 },
  { id: 'nexon-blr', hex: '#8A949E', body: 'suv', model: 'Tata Nexon', variant: 'Fearless+', color: 'Daytona Grey', city: 'Bengaluru', type: 'SUV', window: 'Next month', joined: 0 },
  { id: 'brezza-del', hex: '#5FA8D3', body: 'suv', model: 'Maruti Brezza', variant: 'ZXi+', color: 'Any colour', city: 'Delhi NCR', type: 'SUV', window: 'This month', joined: 0 },
  { id: 'seltos-pun', hex: '#6B7A4B', body: 'suv', model: 'Kia Seltos', variant: 'HTX', color: 'Pewter Olive', city: 'Pune', type: 'SUV', window: 'Flexible', joined: 0 },
  { id: 'xuv700-hyd', hex: '#F4F6F8', body: 'suv', model: 'Mahindra XUV700', variant: 'AX7', color: 'Everest White', city: 'Hyderabad', type: 'SUV', window: 'Next month', joined: 0 },
  { id: 'swift-che', hex: '#FF7A1A', body: 'hatch', model: 'Maruti Swift', variant: 'ZXi', color: 'Any colour', city: 'Chennai', type: 'Hatchback', window: 'Flexible', joined: 0 },
]
// dealer quotes per pool id: [{ dealer, exShowroom, insurance, registration, accessories }] in rupees
const quotes = {}

export const api = {
  POOL_SIZE,
  async listPools() { return structuredClone(pools) },
  async joinPool(id) {
    pools = pools.map((p) => (p.id === id && p.joined < POOL_SIZE ? { ...p, joined: p.joined + 1 } : p))
    return structuredClone(pools.find((p) => p.id === id))
  },
  async getQuotes(id) { return structuredClone(quotes[id] || []) },
}
