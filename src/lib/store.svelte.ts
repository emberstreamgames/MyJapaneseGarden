import { untrack } from 'svelte'
import type { Lesson } from '../data/build'
import { ITEMS, deckReady, type Deck, type Item } from '../data/items'
import {
  ANT_COINS, BLOOMED, COMPLETE_COINS, COOLDOWN_MS, GROW_COINS, PERFECT_COINS, PLOT_COUNT, PRESERVE_COINS, PRESERVE_GROOMS, QUIZ_LENGTH,
  SEEDED, SKIP_COST, SPECIES, WEED_BONUS_XP, WEED_COINS, WEED_EVERY_MS,
  advance, antCoinDue, canPreserve, completeQuiz, completionBonus, normalizeGarden, normalizeWeeds, plantSeed, skipRest, sproutWeeds,
  VISITOR_COINS, visitorDue, type Plot, type Species, type Weed,
} from './garden'
import { rollVariant } from './blooms'
import { discover, flowerKey, normalizeCollection, press, type Collection } from './collection'
import { DECOR_BY_ID, buy, move, newDecor, normalizeDecor, place, unplace, type DecorState } from './decor'
import { DECOR_SPOTS, WEED_SPOTS } from './meadow'
import { dayNumber, newStreak, normalizeStreak, studyOn, type Streak, type StudyResult } from './streak'

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
  visitorAt: number // when the last butterfly or bird was thanked
  seenAt: number // last time the garden was on screen, for the welcome-back card
  streak: Streak
  collection: Collection // pressed flowers, keyed by collection.ts flowerKey
  decor: DecorState // lawn decorations bought in the shop
  debug: boolean // hidden debug tools unlocked in Settings
  lessons: Lesson[] // enabled chips: Genki lessons and/or 'n5'
  stats: Record<string, Stat>
  xp: number
  best: number // best combo ever
  muted: boolean
  mode: Mode
}

const KEY = 'genki-study-v1'

const SAVE_VERSION = 5 // 3: coins, weeds and ants. 4: streak, collection, visitors. 5: decorations

const defaults = (): Saved => ({
  version: SAVE_VERSION,
  garden: normalizeGarden(null),
  weeds: [],
  // Start one interval back so a new (or pre-weed) save gets its first weed straight away.
  weedAt: Date.now() - WEED_EVERY_MS,
  coins: 0,
  antCoinAt: 0, // the first ant brings one
  visitorAt: 0, // and the first visitor too
  seenAt: 0,
  streak: newStreak(),
  collection: {},
  decor: newDecor(DECOR_SPOTS.length),
  debug: false,
  lessons: [1, 2],
  stats: {},
  xp: 0,
  best: 0,
  muted: false,
  mode: 'mix',
})

const time = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
const count = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0)

// Make loaded or imported data safe. Fields missing from older saves already hold defaults.
function repair(data: Saved): Saved {
  data.garden = normalizeGarden(data.garden)
  data.weeds = normalizeWeeds(data.weeds, WEED_SPOTS.length)
  data.weedAt = typeof data.weedAt === 'number' && Number.isFinite(data.weedAt) ? data.weedAt : Date.now() - WEED_EVERY_MS
  data.coins = count(data.coins)
  data.antCoinAt = time(data.antCoinAt)
  data.visitorAt = time(data.visitorAt)
  data.seenAt = time(data.seenAt)
  data.streak = normalizeStreak(data.streak)
  // Saves from before the collection already have flowers in bloom: count them as discovered.
  let found = normalizeCollection(data.collection)
  for (const p of data.garden) if (p?.stage === BLOOMED) found = discover(found, p.species, p.variant, Date.now())
  data.collection = found
  data.decor = normalizeDecor(data.decor, DECOR_SPOTS.length)
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

// Kana aren't taught chapter by chapter here: those decks are always whole. The chips pick
// which chapters' vocab, kanji and grammar are in.
const KANA: Deck[] = ['hiragana', 'katakana']

export const poolFor = (deck: Deck): Item[] =>
  ITEMS.filter((i) => i.type === deck && (KANA.includes(deck) || app.lessons.includes(i.lesson)))

// A card is mastered once it has been answered right this many times in a row.
export const MASTERY_STREAK = 5

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

export const XP_PER_LEVEL = 400

export const level = () => Math.floor(app.xp / XP_PER_LEVEL) + 1
// Percent of the way to the next level.
export const levelProgress = () => ((app.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100

// While a quiz holds this, the level-up popup waits (App.svelte). Call from an $effect: the
// returned function lets go.
export const levelHold = $state({ n: 0 })
// Untracked, so the calling effect doesn't rerun on its own change.
export function holdLevelUps() {
  untrack(() => levelHold.n++)
  return () => {
    untrack(() => levelHold.n--)
  }
}

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

export interface QuizReward {
  xp: number
  coins: number // perfect-quiz and streak milestone coins
  perfect: boolean
  study: StudyResult
}

// Call once a 10-question watering/grooming quiz is finished, with how many answers were right.
export function finishQuiz(i: number, right: number, now = Date.now()): QuizReward | null {
  const plot = validSlot(i) ? app.garden[i] : null
  const next = plot && completeQuiz(plot, now)
  if (!next) return null
  app.garden[i] = next
  const xp = completionBonus(next)
  const perfect = right >= QUIZ_LENGTH
  const study = studyOn(app.streak, dayNumber(now))
  app.streak = study.streak
  const coins = (perfect ? PERFECT_COINS : 0) + study.bonus
  app.xp += xp
  app.coins += coins
  save()
  return { xp, coins, perfect, study }
}

// `found` is true when this growth opened a flower the collection hadn't seen.
export function growPlot(i: number, now = Date.now()): { found: boolean } | null {
  const plot = validSlot(i) ? app.garden[i] : null
  const next = plot && advance(plot, now)
  if (!next) return null
  app.garden[i] = next
  app.coins += GROW_COINS
  let found = false
  if (next.stage === BLOOMED) {
    found = !app.collection[flowerKey(next.species, next.variant)]
    app.collection = discover(app.collection, next.species, next.variant, now)
  }
  save()
  return { found }
}

export interface Preserved {
  species: Species
  variant: number
  coins: number
  first: boolean // completed this flower for the first time
}

// Dry a well-groomed bloom into the collection and free its plot.
export function preservePlant(i: number, now = Date.now()): Preserved | null {
  const plot = validSlot(i) ? app.garden[i] : null
  if (!plot || !canPreserve(plot)) return null
  const { species, variant } = plot
  const first = !app.collection[flowerKey(species, variant)]?.pressed
  const coins = PRESERVE_COINS + (first ? COMPLETE_COINS : 0)
  app.collection = press(app.collection, species, variant, now)
  app.garden[i] = null
  app.coins += coins
  save()
  return { species, variant, coins, first }
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

export const visitorReady = (now = Date.now()) => visitorDue(app.visitorAt, now)

// Thank a visitor for the coins it brought (rolled with garden.ts visitorCoins). False when none was due.
export function collectVisitor(coins: number, now = Date.now()): boolean {
  if (!visitorDue(app.visitorAt, now)) return false
  app.coins += Math.min(VISITOR_COINS[1], Math.max(VISITOR_COINS[0], Math.floor(coins)))
  app.visitorAt = now
  save()
  return true
}

// A word for a visitor to bring: vocab from the enabled chapters, leaning on words already met and
// often missed, so it works as a reminder. Falls back to kanji, then to any vocab.
export function reminderItem(): Item | null {
  const pool = [poolFor('vocab'), poolFor('kanji'), ITEMS.filter((i) => i.type === 'vocab')].find((p) => p.length) ?? []
  const seen = pool.filter((i) => app.stats[i.id])
  const from = seen.length >= 5 ? seen : pool
  if (!from.length) return null
  const weight = (i: Item) => 1 + (app.stats[i.id]?.w ?? 0)
  let r = Math.random() * from.reduce((a, i) => a + weight(i), 0)
  for (const it of from) if ((r -= weight(it)) <= 0) return it
  return from[from.length - 1]
}

// Note that the garden is on screen. Called often, so it only saves when the time moved on a bit.
export function markSeen(now = Date.now()) {
  if (Math.abs(now - app.seenAt) < 60_000) return
  app.seenAt = now
  save()
}

export function removePlant(i: number): boolean {
  if (!validSlot(i) || !app.garden[i]) return false
  app.garden[i] = null
  save()
  return true
}

// Decorations: bought in the shop, then placed on, moved between and taken off the lawn's spots.

export function buyDecor(id: string): boolean {
  const kind = DECOR_BY_ID[id]
  const next = kind && app.coins >= kind.price && buy(app.decor, id)
  if (!next) return false
  app.coins -= kind.price
  app.decor = next
  save()
  return true
}

function setDecor(next: DecorState | null): boolean {
  if (!next) return false
  app.decor = next
  save()
  return true
}

export const placeDecor = (spot: number, id: string) => setDecor(place(app.decor, spot, id))
export const storeDecor = (spot: number) => setDecor(unplace(app.decor, spot))
export const moveDecor = (from: number, to: number) => setDecor(move(app.decor, from, to))

// Debug tools, unlocked from Settings. They bypass the normal rules on purpose.

// Pretend time has passed by moving every finished quiz back.
export function debugSkipTime(ms = COOLDOWN_MS) {
  app.garden.forEach((p) => {
    if (p?.doneAt != null) p.doneAt -= ms
  })
  app.weedAt -= ms
  app.seenAt -= ms
  save()
}

// Pretend the last study day was a day earlier, to try streaks and rain days.
export function debugStreakDay() {
  if (app.streak.day >= 0) app.streak.day--
  save()
}

export function debugVisitor() {
  app.visitorAt = 0
  save()
}

// Bloom a plot (if planted) and groom it enough to preserve.
export function debugPreservable(i: number) {
  const p = validSlot(i) ? app.garden[i] : null
  if (!p) return
  p.stage = BLOOMED
  p.grooms = Math.max(p.grooms, PRESERVE_GROOMS)
  app.collection = discover(app.collection, p.species, p.variant, Date.now())
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
  if (p.stage === BLOOMED) app.collection = discover(app.collection, p.species, p.variant, Date.now())
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
  for (const p of app.garden) if (p?.stage === BLOOMED) app.collection = discover(app.collection, p.species, p.variant, Date.now())
  save()
}

export function resetGarden() {
  app.garden = normalizeGarden(null)
  save()
}
