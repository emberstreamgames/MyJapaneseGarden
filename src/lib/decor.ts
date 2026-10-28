// Pure rules for lawn decorations: the shop catalog, what the player owns, and what stands on each
// decoration spot (meadow.ts DECOR_SPOTS). No store or DOM, like garden.ts.

export interface DecorKind {
  id: string
  label: string
  ja: string // Japanese name, shown with its reading so the shop teaches a word too
  reading: string
  price: number
}

export const DECOR: DecorKind[] = [
  { id: 'frog', label: 'Stone frog', ja: 'かえる', reading: 'kaeru', price: 40 },
  { id: 'daruma', label: 'Daruma doll', ja: 'だるま', reading: 'daruma', price: 60 },
  { id: 'bamboo', label: 'Bamboo', ja: '竹', reading: 'take', price: 80 },
  { id: 'chime', label: 'Wind chime', ja: '風鈴', reading: 'fūrin', price: 100 },
  { id: 'cat', label: 'Lucky cat', ja: '招き猫', reading: 'maneki neko', price: 150 },
  { id: 'bonsai', label: 'Bonsai', ja: '盆栽', reading: 'bonsai', price: 180 },
  { id: 'lantern', label: 'Stone lantern', ja: '石灯籠', reading: 'ishidōrō', price: 250 },
  { id: 'torii', label: 'Torii gate', ja: '鳥居', reading: 'torii', price: 400 },
]

export const DECOR_BY_ID: Record<string, DecorKind> = Object.fromEntries(DECOR.map((d) => [d.id, d]))

export interface DecorState {
  owned: Record<string, number> // bought, placed or not
  placed: (string | null)[] // one per decoration spot
}

export const newDecor = (spots: number): DecorState => ({ owned: {}, placed: Array(spots).fill(null) })

// How many of a kind are in the inventory, not standing on the lawn.
export const available = (s: DecorState, id: string) => (s.owned[id] ?? 0) - s.placed.filter((p) => p === id).length

export function buy(s: DecorState, id: string): DecorState | null {
  if (!DECOR_BY_ID[id]) return null
  return { ...s, owned: { ...s.owned, [id]: (s.owned[id] ?? 0) + 1 } }
}

export function place(s: DecorState, spot: number, id: string): DecorState | null {
  if (!(spot in s.placed) || s.placed[spot] || available(s, id) < 1) return null
  return { ...s, placed: s.placed.map((p, i) => (i === spot ? id : p)) }
}

// Back to the inventory.
export function unplace(s: DecorState, spot: number): DecorState | null {
  if (!s.placed[spot]) return null
  return { ...s, placed: s.placed.map((p, i) => (i === spot ? null : p)) }
}

// Move a decoration to another spot, swapping with whatever stands there.
export function move(s: DecorState, from: number, to: number): DecorState | null {
  if (from === to || !s.placed[from] || !(to in s.placed)) return null
  const placed = [...s.placed]
  ;[placed[from], placed[to]] = [placed[to], placed[from]]
  return { ...s, placed }
}

// Make loaded data safe: known kinds only, whole counts, and never more placed than owned.
export function normalizeDecor(raw: unknown, spots: number): DecorState {
  const r = (raw ?? {}) as Partial<DecorState>
  const owned: Record<string, number> = {}
  for (const d of DECOR) {
    const n = r.owned?.[d.id]
    if (typeof n === 'number' && Number.isFinite(n) && n >= 1) owned[d.id] = Math.floor(n)
  }
  const placed = Array.from({ length: spots }, (_, i) => {
    const id = Array.isArray(r.placed) ? r.placed[i] : null
    return typeof id === 'string' && DECOR_BY_ID[id] ? id : null
  })
  for (const id of placed) if (id) owned[id] = Math.max(owned[id] ?? 0, placed.filter((p) => p === id).length)
  return { owned, placed }
}
