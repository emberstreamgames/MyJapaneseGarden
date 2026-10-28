import type { Deck } from '../data/items'
import { BLOOMS } from './blooms'

// Pure garden rules. No store or DOM access, so every function here is easy to check and to time-travel.

export const PLOT_COUNT = 16
export const COOLDOWN_MS = 20 * 60 * 60 * 1000

// Stage 0 (empty plot) is represented by a null slot, so a Plot's stage is 1..7.
export const STAGE_NAMES = ['Empty plot', 'Seeded plot', 'Bud', 'Sprout 1', 'Sprout 2', 'Sprout 3', 'Unbloomed flower', 'Bloomed flower']
export const SEEDED = 1
export const BLOOMED = STAGE_NAMES.length - 1

export const QUIZ_LENGTH = 10
export const WATER_BONUS_XP = 50
export const GROOM_BONUS_XP = 30

// Coins: earned by growing plants and pulling weeds, spent to skip a cooldown.
export const GROW_COINS = 10
export const WEED_COINS = 5
export const WEED_BONUS_XP = 5
export const SKIP_COST = 100

// Once this long after the last one was collected, the next ant to cross the lawn carries a coin.
export const ANT_COIN_EVERY_MS = 60 * 60 * 1000
export const ANT_COINS = 5

export const WEED_EVERY_MS = 2 * 60 * 60 * 1000
export const MAX_WEEDS = 6
export const WEED_KINDS = 3

export interface SpeciesInfo {
  label: string
  deck: Deck
}

// Two species per quiz type; the player picks one when planting.
export const SPECIES = {
  sakura: { label: 'Cherry blossom', deck: 'hiragana' },
  tulip: { label: 'Tulip', deck: 'hiragana' },
  sunflower: { label: 'Sunflower', deck: 'katakana' },
  marigold: { label: 'Marigold', deck: 'katakana' },
  lotus: { label: 'Lotus', deck: 'kanji' },
  iris: { label: 'Iris', deck: 'kanji' },
  daisy: { label: 'Daisy', deck: 'vocab' },
  poppy: { label: 'Poppy', deck: 'vocab' },
  lavender: { label: 'Lavender', deck: 'grammar' },
  hydrangea: { label: 'Hydrangea', deck: 'grammar' },
} as const satisfies Record<string, SpeciesInfo>

export type Species = keyof typeof SPECIES

export const speciesFor = (deck: Deck): Species[] =>
  (Object.keys(SPECIES) as Species[]).filter((s) => SPECIES[s].deck === deck)

export interface Plot {
  species: Species
  deck: Deck
  stage: number // 1..BLOOMED
  doneAt: number | null // when the last quiz was finished; null until the first one of this stage
  waters: number // times watered (any stage before bloom)
  grooms: number // times groomed (once bloomed)
  variant: number // bloom colour, rolled at planting: 0 = original, 1.. = BLOOMS[species] (blooms.ts)
}

export type Phase =
  | 'thirsty' // needs a quiz: water, or groom once bloomed
  | 'resting' // quiz done, cooldown running
  | 'ready' // cooldown over, tap to grow to the next stage

export function phaseOf(plot: Plot, now: number): Phase {
  if (plot.doneAt === null) return 'thirsty'
  const elapsed = now - plot.doneAt
  // A negative elapsed means the device clock moved back; never lock the player out.
  if (elapsed < 0 || elapsed >= COOLDOWN_MS) return plot.stage === BLOOMED ? 'thirsty' : 'ready'
  return 'resting'
}

export const msUntilReady = (plot: Plot, now: number): number =>
  plot.doneAt === null ? 0 : Math.max(0, plot.doneAt + COOLDOWN_MS - now)

export function formatWait(ms: number): string {
  const mins = Math.ceil(ms / 60000)
  if (mins <= 1) return 'under a minute'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h ? `${h}h ${m}m` : `${m}m`
}

// The actions below return the updated plot, or null when the action isn't allowed right now.

export function plantSeed(species: Species, variant = 0): Plot {
  return { species, deck: SPECIES[species].deck, stage: SEEDED, doneAt: null, waters: 0, grooms: 0, variant }
}

export const completionBonus = (plot: Plot): number => (plot.stage === BLOOMED ? GROOM_BONUS_XP : WATER_BONUS_XP)

export function completeQuiz(plot: Plot, now: number): Plot | null {
  if (phaseOf(plot, now) !== 'thirsty') return null
  const bloomed = plot.stage === BLOOMED
  return {
    ...plot,
    doneAt: now,
    waters: plot.waters + (bloomed ? 0 : 1),
    grooms: plot.grooms + (bloomed ? 1 : 0),
  }
}

export function advance(plot: Plot, now: number): Plot | null {
  if (phaseOf(plot, now) !== 'ready') return null
  return { ...plot, stage: plot.stage + 1, doneAt: null }
}

// Paid with coins: end the cooldown now, as if it had run out.
export function skipRest(plot: Plot, now: number): Plot | null {
  if (phaseOf(plot, now) !== 'resting') return null
  return { ...plot, doneAt: now - COOLDOWN_MS }
}

// A clock that moved back counts as due, like a cooldown.
export const antCoinDue = (lastAt: number, now: number): boolean => now < lastAt || now - lastAt >= ANT_COIN_EVERY_MS

// Weeds grow on the lawn around the bed, one per WEED_EVERY_MS, at a free spot (meadow.ts WEED_SPOTS).
export interface Weed {
  spot: number
  kind: number // 0..WEED_KINDS-1, which weed art to draw
}

// Catch up on every weed due since `lastAt`. The clock keeps ticking while the lawn is full,
// so pulling a weed doesn't make the next one appear at once.
export function sproutWeeds(weeds: Weed[], lastAt: number, now: number, spots: number, rand: () => number) {
  // A clock that moved back restarts the timer instead of stalling it.
  if (now < lastAt) return { weeds, lastAt: now }
  const due = Math.floor((now - lastAt) / WEED_EVERY_MS)
  if (!due) return { weeds, lastAt }
  const next = [...weeds]
  for (let k = 0; k < due && next.length < Math.min(MAX_WEEDS, spots); k++) {
    const free = Array.from({ length: spots }, (_, i) => i).filter((i) => !next.some((w) => w.spot === i))
    next.push({ spot: free[Math.floor(rand() * free.length)], kind: Math.floor(rand() * WEED_KINDS) })
  }
  return { weeds: next, lastAt: lastAt + due * WEED_EVERY_MS }
}

export function normalizeWeeds(raw: unknown, spots: number): Weed[] {
  const out: Weed[] = []
  for (const w of Array.isArray(raw) ? raw : []) {
    const spot = w?.spot, kind = w?.kind
    if (!Number.isInteger(spot) || spot < 0 || spot >= spots || out.some((o) => o.spot === spot)) continue
    out.push({ spot, kind: Number.isInteger(kind) && kind >= 0 && kind < WEED_KINDS ? kind : 0 })
    if (out.length === MAX_WEEDS) break
  }
  return out
}

// Make loaded or imported data safe: right length, known species, sane numbers.
export function normalizeGarden(raw: unknown): (Plot | null)[] {
  const src = Array.isArray(raw) ? raw : []
  return Array.from({ length: PLOT_COUNT }, (_, i) => {
    const p = src[i]
    if (!p || typeof p !== 'object' || !(p.species in SPECIES)) return null
    const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0)
    const species = p.species as Species
    return {
      species,
      deck: SPECIES[species].deck,
      stage: Math.min(BLOOMED, Math.max(SEEDED, num(p.stage))),
      doneAt: typeof p.doneAt === 'number' && Number.isFinite(p.doneAt) ? p.doneAt : null,
      waters: num(p.waters),
      grooms: num(p.grooms),
      variant: Math.min(BLOOMS[species].length, num(p.variant)), // older saves have none: original colours
    }
  })
}
