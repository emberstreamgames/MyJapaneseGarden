import type { Lesson } from '../data/build'
import { ITEMS, deckReady, type Deck, type Item } from '../data/items'
import {
  ANT_COINS, BLOOMED, COOLDOWN_MS, GROW_COINS, PLOT_COUNT, SEEDED, SKIP_COST, SPECIES, WEED_BONUS_XP, WEED_COINS, WEED_EVERY_MS,
  advance, antCoinDue, completeQuiz, completionBonus, normalizeGarden, normalizeWeeds, plantSeed, skipRest, sproutWeeds,
  type Plot, type Species, type Weed,
} from './garden'
import { rollVariant } from './blooms'
import { WEED_SPOTS } from './meadow'

export type Mode = 'mix' | 'choice' | 'type'

const MODES: Mode[] = ['mix', 'choice', 'type']

// Older saves may hold the removed 'flip' mode (or junk): fall back to mix.
const normalizeMode = (m: unknown): Mode => (MODES.includes(m as Mode) ? (m as Mode) : 'mix')

export interface Stat {
  c: number // times correct
  w: number // times wrong
  streak: number // current correct-in-a-row
  last: number // timestamp of last review
}

interface Saved {
  version: number // save format version, for future migrations
  garden: (Plot | null)[] // PLOT_COUNT slots; null is an empty plot
  weeds: Weed[]
  weedAt: number // when the weed timer last ticked
  coins: number
  antCoinAt: number // when the last ant's coin was collected
  debug: boolean // hidden debug tools unlocked in Settings
  lessons: Lesson[] // enabled chips: Genki lessons and/or 'n5'
  stats: Record<string, Stat>
  xp: number
  best: number // best combo ever
  muted: boolean
  mode: Mode
}

const KEY = 'genki-study-v1'

const SAVE_VERSION = 3 // 3: coins, weeds and ants

const defaults = (): Saved => ({
  version: SAVE_VERSION,
  garden: normalizeGarden(null),
  weeds: [],
  // Start one interval back so a new (or pre-weed) save gets its first weed straight away.
  weedAt: Date.now() - WEED_EVERY_MS,
  coins: 0,
  antCoinAt: 0, // the first ant brings one
  debug: false,
  lessons: [1, 2],
  stats: {},
  xp: 0,
  best: 0,
  muted: false,
  mode: 'mix',
})

const count = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0)

// Make loaded or imported data safe. Fields missing from older saves already hold defaults.
function repair(data: Saved): Saved {
  data.garden = normalizeGarden(data.garden)
  data.weeds = normalizeWeeds(data.weeds, WEED_SPOTS.length)
  data.weedAt = typeof data.weedAt === 'number' && Number.isFinite(data.weedAt) ? data.weedAt : Date.now() - WEED_EVERY_MS
  data.coins = count(data.coins)
  data.antCoinAt = typeof data.antCoinAt === 'number' && Number.isFinite(data.antCoinAt) ? data.antCoinAt : 0
  data.mode = normalizeMode(data.mode)
  data.version = SAVE_VERSION
  return data
}

function load(): Saved {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      return repair({ ...defaults(), ...JSON.parse(raw) })
    }
  } catch {
    // storage unavailable or corrupt: start fresh
  }
  return defaults()
}

export const app = $state<Saved>(load())

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify($state.snapshot(app)))
  } catch {
    // ignore: app still works for this session
  }
}

export function toggleLesson(n: Lesson) {
  const i = app.lessons.indexOf(n)
  if (i >= 0) app.lessons.splice(i, 1)
  else app.lessons.push(n)
  save()
}

export const poolFor = (deck: Deck): Item[] =>
  ITEMS.filter((i) => i.type === deck && app.lessons.includes(i.lesson))

export function record(id: string, correct: boolean) {
  const s = (app.stats[id] ??= { c: 0, w: 0, streak: 0, last: 0 })
  if (correct) {
    s.c++
    s.streak++
  } else {
    s.w++
    s.streak = 0
  }
  s.last = Date.now()
  save()
}

export const level = () => Math.floor(app.xp / 100) + 1

export function exportData(): string {
  return JSON.stringify($state.snapshot(app), null, 2)
}

export function importData(text: string): boolean {
  try {
    const data = JSON.parse(text)
    if (typeof data !== 'object' || !data || typeof data.stats !== 'object') return false
    Object.assign(app, repair({ ...defaults(), ...data }))
    save()
    return true
  } catch {
    return false
  }
}

export function resetStats() {
  app.stats = {}
  app.xp = 0
  app.best = 0
  save()
}

// Garden actions. Each one checks the rules in garden.ts and reports whether it changed anything.

const validSlot = (i: number) => Number.isInteger(i) && i >= 0 && i < PLOT_COUNT

export function plantAt(i: number, species: Species): boolean {
  if (!validSlot(i) || app.garden[i]) return false
  app.garden[i] = plantSeed(species, rollVariant(species, Math.random()))
  save()
  return true
}

// Call once a 10-question watering/grooming quiz is finished.
export function finishQuiz(i: number, now = Date.now()): boolean {
  const plot = validSlot(i) ? app.garden[i] : null
  const next = plot && completeQuiz(plot, now)
  if (!next) return false
  app.garden[i] = next
  app.xp += completionBonus(next)
  save()
  return true
}

export function growPlot(i: number, now = Date.now()): boolean {
  const plot = validSlot(i) ? app.garden[i] : null
  const next = plot && advance(plot, now)
  if (!next) return false
  app.garden[i] = next
  app.coins += GROW_COINS
  save()
  return true
}

export function skipWait(i: number, now = Date.now()): boolean {
  const plot = validSlot(i) ? app.garden[i] : null
  const next = app.coins >= SKIP_COST && plot && skipRest(plot, now)
  if (!next) return false
  app.garden[i] = next
  app.coins -= SKIP_COST
  save()
  return true
}

// Grow any weeds that are due. Safe to call often.
export function tendWeeds(now = Date.now()) {
  const { weeds, lastAt } = sproutWeeds(app.weeds, app.weedAt, now, WEED_SPOTS.length, Math.random)
  if (lastAt === app.weedAt) return
  app.weeds = weeds
  app.weedAt = lastAt
  save()
}

// Call once a weed's question is answered.
export function pullWeed(spot: number): boolean {
  const i = app.weeds.findIndex((w) => w.spot === spot)
  if (i < 0) return false
  app.weeds.splice(i, 1)
  app.coins += WEED_COINS
  app.xp += WEED_BONUS_XP
  save()
  return true
}

export const antCoinReady = (now = Date.now()) => antCoinDue(app.antCoinAt, now)

export function collectAntCoin(now = Date.now()): boolean {
  if (!antCoinDue(app.antCoinAt, now)) return false
  app.coins += ANT_COINS
  app.antCoinAt = now
  save()
  return true
}

export function removePlant(i: number): boolean {
  if (!validSlot(i) || !app.garden[i]) return false
  app.garden[i] = null
  save()
  return true
}

// Debug tools, unlocked from Settings. They bypass the normal rules on purpose.

// Pretend time has passed by moving every finished quiz back.
export function debugSkipTime(ms = COOLDOWN_MS) {
  app.garden.forEach((p) => {
    if (p?.doneAt != null) p.doneAt -= ms
  })
  app.weedAt -= ms
  save()
}

export function debugAddCoins(n = SKIP_COST) {
  app.coins += n
  save()
}

export function debugAntCoin() {
  app.antCoinAt = 0
  save()
}

export function debugSproutWeed() {
  app.weedAt = Math.min(app.weedAt, Date.now()) - WEED_EVERY_MS
  tendWeeds()
}

export function debugSetStage(i: number, stage: number) {
  const p = validSlot(i) ? app.garden[i] : null
  if (!p) return
  p.stage = Math.min(BLOOMED, Math.max(SEEDED, stage))
  p.doneAt = null
  save()
}

// Plant every empty plot with a random plantable species at a random stage.
export function debugFill() {
  const species = (Object.keys(SPECIES) as Species[]).filter((s) => deckReady(SPECIES[s].deck))
  if (!species.length) return
  app.garden = app.garden.map((p) => {
    if (p) return p
    const sp = species[Math.floor(Math.random() * species.length)]
    const stage = SEEDED + Math.floor(Math.random() * BLOOMED)
    return { ...plantSeed(sp, rollVariant(sp, Math.random())), stage, waters: stage - SEEDED }
  })
  save()
}

export function resetGarden() {
  app.garden = normalizeGarden(null)
  save()
}
