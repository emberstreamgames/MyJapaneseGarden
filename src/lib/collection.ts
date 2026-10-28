import { BLOOMS, bloomName } from './blooms'
import { SPECIES, type Species } from './garden'

// Pure rules for the pressed-flower collection. Every species/variant pair is one entry: it is
// discovered the first time a plant of it blooms, and completed once one is preserved (grown,
// groomed PRESERVE_GROOMS times, then dried and pressed).

export interface Found {
  at: number // when it first bloomed
  pressed: number // times preserved; 1+ means completed
}

export type Collection = Record<string, Found>

export const flowerKey = (s: Species, variant: number) => `${s}:${variant}`

export const flowerName = (s: Species, variant: number) => bloomName(s, variant) || 'Classic'

// Every entry in display order: species as listed in SPECIES, original colours first.
export const FLOWERS = (Object.keys(SPECIES) as Species[]).flatMap((species) =>
  Array.from({ length: BLOOMS[species].length + 1 }, (_, variant) => ({ species, variant, key: flowerKey(species, variant) })),
)

export const discover = (c: Collection, s: Species, variant: number, now: number): Collection => {
  const key = flowerKey(s, variant)
  return c[key] ? c : { ...c, [key]: { at: now, pressed: 0 } }
}

export const press = (c: Collection, s: Species, variant: number, now: number): Collection => {
  const key = flowerKey(s, variant)
  const f = c[key] ?? { at: now, pressed: 0 }
  return { ...c, [key]: { ...f, pressed: f.pressed + 1 } }
}

export function normalizeCollection(raw: unknown): Collection {
  const out: Collection = {}
  if (!raw || typeof raw !== 'object') return out
  const known = new Set(FLOWERS.map((f) => f.key))
  for (const [key, v] of Object.entries(raw as Record<string, unknown>)) {
    const f = v as Partial<Found> | null
    if (!known.has(key) || !f || typeof f !== 'object') continue
    const at = typeof f.at === 'number' && Number.isFinite(f.at) ? f.at : 0
    const pressed = typeof f.pressed === 'number' && Number.isFinite(f.pressed) && f.pressed > 0 ? Math.floor(f.pressed) : 0
    out[key] = { at, pressed }
  }
  return out
}
