// Pure rules for lawn decorations: the shop catalog, what the player owns, and what stands on each
// decoration spot (meadow.ts DECOR_SPOTS). No store or DOM, like garden.ts.

export interface DecorKind {
  id: string
  label: string
  ja: string // Japanese name, shown with its reading so the shop teaches a word too
  reading: string
  price: number
  gift?: boolean // given, never sold: left out of the shop
}

export const DECOR: DecorKind[] = [
  { id: 'mushroom', label: 'Mushrooms', ja: 'きのこ', reading: 'kinoko', price: 30 },
  { id: 'frog', label: 'Stone frog', ja: 'かえる', reading: 'kaeru', price: 40 },
  { id: 'teru', label: 'Weather charm', ja: 'てるてる坊主', reading: 'teru teru bōzu', price: 50 },
  { id: 'daruma', label: 'Daruma doll', ja: 'だるま', reading: 'daruma', price: 60 },
  { id: 'kokeshi', label: 'Kokeshi doll', ja: 'こけし', reading: 'kokeshi', price: 70 },
  { id: 'bamboo', label: 'Bamboo', ja: '竹', reading: 'take', price: 80 },
  { id: 'chime', label: 'Wind chime', ja: '風鈴', reading: 'fūrin', price: 100 },
  { id: 'koinobori', label: 'Carp streamers', ja: '鯉のぼり', reading: 'koinobori', price: 120 },
  { id: 'wagasa', label: 'Paper parasol', ja: '和傘', reading: 'wagasa', price: 130 },
  { id: 'cat', label: 'Lucky cat', ja: '招き猫', reading: 'maneki neko', price: 150 },
  { id: 'tanuki', label: 'Tanuki statue', ja: '狸', reading: 'tanuki', price: 160 },
  { id: 'bonsai', label: 'Bonsai', ja: '盆栽', reading: 'bonsai', price: 180 },
  { id: 'kitsune', label: 'Fox statue', ja: '狐', reading: 'kitsune', price: 200 },
  { id: 'lantern', label: 'Stone lantern', ja: '石灯籠', reading: 'ishidōrō', price: 250 },
  { id: 'shishi', label: 'Bamboo fountain', ja: '鹿威し', reading: 'shishi-odoshi', price: 280 },
  { id: 'pond', label: 'Koi pond', ja: '池', reading: 'ike', price: 320 },
  { id: 'torii', label: 'Torii gate', ja: '鳥居', reading: 'torii', price: 400 },
  { id: 'bridge', label: 'Arched bridge', ja: '太鼓橋', reading: 'taikobashi', price: 450 },
  { id: 'sakura', label: 'Cherry tree', ja: '桜', reading: 'sakura', price: 500 },
  { id: 'pagoda', label: 'Pagoda', ja: '五重塔', reading: 'gojūnotō', price: 800 },
  // The tutorial's welcome gift (store.svelte.ts giftRock).
  { id: 'rock', label: 'Shiny rock', ja: 'ぴかぴかの石', reading: 'pikapika no ishi', price: 0, gift: true },
]

export const SHOP_DECOR = DECOR.filter((d) => !d.gift)

export const DECOR_BY_ID: Record<string, DecorKind> = Object.fromEntries(DECOR.map((d) => [d.id, d]))

export interface DecorState {
  owned: Record<string, number> // bought, placed or not
  placed: (string | null)[] // one per decoration spot, open or not
  tiers: Record<string, number> // upgrades per kind, so every copy of a kind looks the same
  open: number // spots in use, counted from the first; the rest are bought in the shop
}

export const newDecor = (spots: number): DecorState => ({ owned: {}, placed: Array(spots).fill(null), tiers: {}, open: BASE_SPOTS })

// Lawn spots open from the start. Each later one costs the next price here.
export const BASE_SPOTS = 6
export const SPOT_PRICES = [150, 250, 400, 600, 800, 1000]

// null once every spot is open.
export const nextSpotPrice = (s: DecorState) => SPOT_PRICES[s.open - BASE_SPOTS] ?? null

export function openSpot(s: DecorState): DecorState | null {
  return s.open < s.placed.length ? { ...s, open: s.open + 1 } : null
}

// Upgrade names by tier: 0 is as bought, 1 adds a touch of its own (DecorSprite), 2 turns it to gold.
export const TIER_NAMES = ['Plain', 'Adorned', 'Golden']
export const MAX_TIER = TIER_NAMES.length - 1
// Each step's cost as a multiple of the kind's price. The gift rock has no price, so it uses GIFT_BASE.
const TIER_COST = [2, 4]
const GIFT_BASE = 50

export const tierOf = (s: DecorState, id: string) => s.tiers[id] ?? 0

// null once it can't go any higher.
export function upgradeCost(s: DecorState, id: string): number | null {
  const mult = TIER_COST[tierOf(s, id)], kind = DECOR_BY_ID[id]
  return mult && kind ? mult * (kind.price || GIFT_BASE) : null
}

export function upgrade(s: DecorState, id: string): DecorState | null {
  if (!s.owned[id] || upgradeCost(s, id) === null) return null
  return { ...s, tiers: { ...s.tiers, [id]: tierOf(s, id) + 1 } }
}

// How many of a kind are in the inventory, not standing on the lawn.
export const available = (s: DecorState, id: string) => (s.owned[id] ?? 0) - s.placed.filter((p) => p === id).length

export function buy(s: DecorState, id: string): DecorState | null {
  if (!DECOR_BY_ID[id]) return null
  return { ...s, owned: { ...s.owned, [id]: (s.owned[id] ?? 0) + 1 } }
}

export function place(s: DecorState, spot: number, id: string): DecorState | null {
  if (spot < 0 || spot >= s.open || s.placed[spot] || available(s, id) < 1) return null
  return { ...s, placed: s.placed.map((p, i) => (i === spot ? id : p)) }
}

// Back to the inventory.
export function unplace(s: DecorState, spot: number): DecorState | null {
  if (!s.placed[spot]) return null
  return { ...s, placed: s.placed.map((p, i) => (i === spot ? null : p)) }
}

// Move a decoration to another spot, swapping with whatever stands there.
export function move(s: DecorState, from: number, to: number): DecorState | null {
  if (from === to || !s.placed[from] || to < 0 || to >= s.open) return null
  const placed = [...s.placed]
  ;[placed[from], placed[to]] = [placed[to], placed[from]]
  return { ...s, placed }
}

// Make loaded data safe: known kinds only, whole counts, never more placed than owned, and nothing
// standing on a spot that isn't open.
export function normalizeDecor(raw: unknown, spots: number): DecorState {
  const r = (raw ?? {}) as Partial<DecorState>
  const owned: Record<string, number> = {}
  for (const d of DECOR) {
    const n = r.owned?.[d.id]
    if (typeof n === 'number' && Number.isFinite(n) && n >= 1) owned[d.id] = Math.floor(n)
  }
  const opened = Number.isFinite(r.open) ? Math.floor(r.open as number) : BASE_SPOTS
  const open = Math.min(spots, Math.max(BASE_SPOTS, opened))
  const placed = Array.from({ length: spots }, (_, i) => {
    const id = Array.isArray(r.placed) && i < open ? r.placed[i] : null
    return typeof id === 'string' && DECOR_BY_ID[id] ? id : null
  })
  for (const id of placed) if (id) owned[id] = Math.max(owned[id] ?? 0, placed.filter((p) => p === id).length)
  const tiers: Record<string, number> = {}
  for (const id of Object.keys(owned)) {
    const t = r.tiers?.[id]
    if (typeof t === 'number' && Number.isFinite(t) && t >= 1) tiers[id] = Math.min(MAX_TIER, Math.floor(t))
  }
  return { owned, placed, tiers, open }
}
