import { untrack } from 'svelte'
import type { Lesson } from '../data/build'
import { EXTRA_CARDS, ITEMS, deckReady, type Deck, type Item } from '../data/items'
import {
  ANT_COINS, BLOOMED, COMPLETE_COINS, COOLDOWN_MS, GROW_COINS, GROWABLE, HINT_COST, PERFECT_COINS, PLOT_COUNT, PRESERVE_COINS, PRESERVE_GROOMS, QUIZ_LENGTH,
  QUIZ_VISITORS, SEEDED, SKIP_COST, SPECIES, STARTER, TEND_LENGTH, TEND_PER_DAY, WEED_BONUS_XP, WEED_COINS, WEED_EVERY_MS,
  advance, antCoinDue, canPreserve, completeQuiz, completionBonus, normalizeGarden, normalizeWeeds, plantSeed, plantStarter, shrinkGarden, skipRest, sproutWeeds,
  VISITOR_COINS, visitorDue, waterStarter, type Plot, type Species, type Weed,
} from './garden'
import { rollVariant } from './blooms'
import { discover, flowerKey, normalizeCollection, press, type Collection } from './collection'
import { meet, normalizeCreatures, type CreatureLog } from './creatures'
import { DECOR_BY_ID, buy, move, newDecor, nextSpotPrice, normalizeDecor, openSpot, place, unplace, upgrade, upgradeCost, type DecorState } from './decor'
import { LOOK_BY_ID, newLook, normalizeLook, type LookState } from './look'
import { DECOR_SPOTS, WEED_SPOTS } from './meadow'
import { dayNumber, newStreak, normalizeStreak, studyOn, type Streak, type StudyResult } from './streak'
import { NEW_PER_DAY, isKnown, isMastered, mostOverdue, normalizeSrs, review, seedSrs, weakest, type Srs } from './srs'
import { hasStarter, nextStep, normalizeTour, type TourStep } from './tour'
import type { FestivalId, Hours, Season } from './seasons'

export type Mode = 'mix' | 'choice' | 'type'

const MODES: Mode[] = ['mix', 'choice', 'type']

// Older saves may hold the removed 'flip' mode (or junk): fall back to mix.
const normalizeMode = (m: unknown): Mode => (MODES.includes(m as Mode) ? (m as Mode) : 'mix')

export interface Stat {
  c: number // times correct
  w: number // times wrong
  streak: number // current correct-in-a-row
  last: number // timestamp of last review
  srs?: Srs // memory estimate and next due date (srs.ts)
}

// Counts that start over each local day.
interface Daily {
  day: number
  newCards: number
  tends: number // Tend weak words sessions started
  visitors: number // visitors brought by finished quizzes
}

interface Saved {
  version: number // save format version, for future migrations
  garden: (Plot | null)[] // PLOT_COUNT slots; null is an empty plot
  weeds: Weed[]
  weedAt: number // when the weed timer last ticked
  coins: number
  antCoinAt: number // when the last ant's coin was collected
  visitorAt: number // when the last visitor was thanked
  seenAt: number // last time the garden was on screen, for the welcome-back card
  streak: Streak
  collection: Collection // pressed flowers, keyed by collection.ts flowerKey
  creatures: CreatureLog // visitors tapped, keyed by creatures.ts creatureKey
  decor: DecorState // lawn decorations bought in the shop
  look: LookState // lawn, soil, bed edging and atmosphere bought in the shop
  tour: TourStep | null // tutorial step, null once finished or skipped
  debug: boolean // hidden debug tools unlocked in Settings
  lessons: Lesson[] // enabled chips: Genki lessons and/or 'n5'
  stats: Record<string, Stat>
  daily: Daily
  seedsUsed: number // seed packets spent; one is earned per level
  xp: number
  best: number // best combo ever
  muted: boolean
  mode: Mode
}

const KEY = 'genki-study-v1'

const SAVE_VERSION = 10 // 3: coins, weeds and ants. 4: streak, collection, visitors. 5: decorations. 6: tutorial. 7: 10 plots. 8: upgrades, lawn spots, garden looks. 9: creature collection. 10: spaced repetition, seed packets

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
  creatures: {},
  decor: newDecor(DECOR_SPOTS.length),
  look: newLook(),
  tour: 'hello',
  debug: false,
  lessons: [1, 2],
  stats: {},
  daily: { day: -1, newCards: 0, tends: 0, visitors: 0 },
  seedsUsed: 0,
  xp: 0,
  best: 0,
  muted: false,
  mode: 'mix',
})

const time = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
const count = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0)

// Saves from before version 10 have no schedule: each card gets one worked out from its counts.
function repairStats(raw: unknown): Record<string, Stat> {
  const out: Record<string, Stat> = {}
  if (!raw || typeof raw !== 'object') return out
  for (const [id, v] of Object.entries(raw as Record<string, Partial<Stat> | null>)) {
    if (!v || typeof v !== 'object') continue
    const s: Stat = { c: count(v.c), w: count(v.w), streak: count(v.streak), last: time(v.last) }
    const srs = normalizeSrs(v.srs) ?? seedSrs(s)
    out[id] = srs ? { ...s, srs } : s
  }
  return out
}

function repairDaily(raw: unknown): Daily {
  const d = (raw ?? {}) as Partial<Daily>
  return { day: typeof d.day === 'number' ? d.day : -1, newCards: count(d.newCards), tends: count(d.tends), visitors: count(d.visitors) }
}

// Make loaded or imported data safe. Fields missing from older saves already hold defaults.
function repair(data: Saved): Saved {
  // Version 7 cut the garden from 16 plots to 10. The plants that don't fit are settled below.
  const old = data.version < 7 || (Array.isArray(data.garden) && data.garden.length > PLOT_COUNT)
  const shrunk = old ? shrinkGarden(data.garden) : { garden: normalizeGarden(data.garden), extra: [] }
  data.garden = shrunk.garden
  data.weeds = normalizeWeeds(data.weeds, WEED_SPOTS.length)
  data.weedAt = typeof data.weedAt === 'number' && Number.isFinite(data.weedAt) ? data.weedAt : Date.now() - WEED_EVERY_MS
  data.coins = count(data.coins)
  data.antCoinAt = time(data.antCoinAt)
  data.visitorAt = time(data.visitorAt)
  data.seenAt = time(data.seenAt)
  data.streak = normalizeStreak(data.streak)
  // Saves from before the collection already have flowers in bloom: count them as discovered.
  let found = normalizeCollection(data.collection)
  for (const p of data.garden) if (p?.stage === BLOOMED && p.species !== STARTER) found = discover(found, p.species, p.variant, Date.now())
  // A bloom that no longer fits is pressed into the collection; a younger plant pays back its growth coins.
  for (const p of shrunk.extra) {
    if (p.stage === BLOOMED) found = press(found, p.species, p.variant, Date.now())
    else data.coins += GROW_COINS * p.stage
  }
  data.collection = found
  data.creatures = normalizeCreatures(data.creatures)
  data.decor = normalizeDecor(data.decor, DECOR_SPOTS.length)
  data.look = normalizeLook(data.look)
  data.mode = normalizeMode(data.mode)
  data.stats = repairStats(data.stats)
  data.daily = repairDaily(data.daily)
  data.seedsUsed = count(data.seedsUsed)
  // Players from before the tutorial already know their way around.
  data.tour = data.version < 6 ? null : normalizeTour(data.tour)
  if (!hasStarter(data.tour)) data.garden = data.garden.map((p) => (p?.species === STARTER ? null : p))
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

export const inChapters = (i: Item) => KANA.includes(i.type) || app.lessons.includes(i.lesson)

export const poolFor = (deck: Deck): Item[] => ITEMS.filter((i) => i.type === deck && inChapters(i))

// What a quiz can ask: the deck, plus harder versions of its mastered cards. Those come first so
// they aren't pushed back by a long list of new cards.
export const studyPool = (deck: Deck): Item[] => [
  ...EXTRA_CARDS.filter((i) => i.type === deck && inChapters(i) && isMastered(app.stats[i.base!])),
  ...poolFor(deck),
]

const DECKS: Deck[] = ['hiragana', 'katakana', 'kanji', 'vocab', 'grammar']

// This local day's counts, started afresh when the day has changed.
function today(now: number): Daily {
  const day = dayNumber(now)
  if (app.daily.day !== day) app.daily = { day, newCards: 0, tends: 0, visitors: 0 }
  return app.daily
}

const countToday = (key: 'newCards' | 'tends' | 'visitors', now: number) => (app.daily.day === dayNumber(now) ? app.daily[key] : 0)

export const newLeft = (now = Date.now()) => NEW_PER_DAY - countToday('newCards', now)

// `mastered` and `known` are true when this answer carried the card over that line.
export function record(id: string, correct: boolean, now = Date.now()): { mastered: boolean; known: boolean } {
  if (!app.stats[id]) today(now).newCards++
  const s = (app.stats[id] ??= { c: 0, w: 0, streak: 0, last: 0 })
  const before = { mastered: isMastered(s), known: isKnown(s) }
  if (correct) {
    s.c++
    s.streak++
  } else {
    s.w++
    s.streak = 0
  }
  s.srs = review(s.srs, s.last, correct, now)
  s.last = now
  save()
  return { mastered: !before.mastered && isMastered(s), known: !before.known && isKnown(s) }
}

// Words the player has held on to for a while, counting a word in two lists once.
export const knownWords = () => new Set(ITEMS.filter((i) => i.type === 'vocab' && isKnown(app.stats[i.id])).map((i) => i.front)).size

export const tendsLeft = (now = Date.now()) => Math.max(0, TEND_PER_DAY - countToday('tends', now))

export const weakItems = () => weakest(DECKS.flatMap(studyPool), app.stats, TEND_LENGTH)

export function startTend(now = Date.now()): boolean {
  if (!tendsLeft(now)) return false
  today(now).tends++
  save()
  return true
}

// The chapter picker, opened from the garden, Stats, the menu and any "nothing to study" message.
export const chapterSheet = $state({ open: false })

// Dev tools: try a season without waiting for it. Not saved.
export const seasonPreview = $state<{ season: Season | ''; hours: Hours | ''; festival: FestivalId | 'none' | '' }>({ season: '', hours: '', festival: '' })

// Whether a garden quiz is on screen.
export const quizState = $state({ open: false })

export const XP_PER_LEVEL = 1200

export const level = () => Math.floor(app.xp / XP_PER_LEVEL) + 1
// One seed packet per level past the first: it picks the bloom colour of a plant.
export const seedPackets = () => Math.max(0, level() - 1 - app.seedsUsed)
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
  app.seedsUsed = 0
  app.xp = 0
  app.best = 0
  save()
}

// Garden actions. Each one checks the rules in garden.ts and reports whether it changed anything.

const validSlot = (i: number) => Number.isInteger(i) && i >= 0 && i < PLOT_COUNT

const foundBloom = (species: Species) => (variant: number) => !!app.collection[flowerKey(species, variant)]

// `variant` picks the bloom with a seed packet; without one, it's a surprise.
export function plantAt(i: number, species: Species, variant?: number): boolean {
  if (!validSlot(i) || app.garden[i]) return false
  const chosen = variant !== undefined && seedPackets() > 0
  app.garden[i] = plantSeed(species, chosen ? variant : rollVariant(species, Math.random(), foundBloom(species)))
  if (chosen) app.seedsUsed++
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
  // Studying brings a visitor to the garden.
  if (countToday('visitors', now) < QUIZ_VISITORS) {
    today(now).visitors++
    app.visitorAt = 0
  }
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
  if (next.stage === BLOOMED && next.species !== STARTER) {
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

export function buyHint(): boolean {
  if (app.coins < HINT_COST) return false
  app.coins -= HINT_COST
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

// Call once for each weed whose question was answered.
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

// Log a visitor in the creature collection. True the first time this one is befriended.
export function meetCreature(key: string, now = Date.now()): boolean {
  const first = !app.creatures[key]
  app.creatures = meet(app.creatures, key, now)
  save()
  return first
}

// A word for a visitor to bring: vocab from the enabled chapters, the most overdue one if any is due,
// else leaning on words already met and often missed. Falls back to kanji, then to any vocab.
export function reminderItem(): Item | null {
  const pool = [poolFor('vocab'), poolFor('kanji'), ITEMS.filter((i) => i.type === 'vocab')].find((p) => p.length) ?? []
  const seen = pool.filter((i) => app.stats[i.id])
  const due = mostOverdue(seen, app.stats, Date.now())
  if (due) return due
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
  const next = kind && !kind.gift && app.coins >= kind.price && buy(app.decor, id)
  if (!next) return false
  app.coins -= kind.price
  app.decor = next
  save()
  return true
}

export function upgradeDecor(id: string): boolean {
  const cost = upgradeCost(app.decor, id)
  const next = cost !== null && app.coins >= cost && upgrade(app.decor, id)
  if (!next) return false
  app.coins -= cost
  app.decor = next
  save()
  return true
}

export function buySpot(): boolean {
  const cost = nextSpotPrice(app.decor)
  const next = cost !== null && app.coins >= cost && openSpot(app.decor)
  if (!next) return false
  app.coins -= cost
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

// The tutorial's welcome gift, placed on the spot the player tapped. Given once, even on a replay.
export function giftRock(spot: number): boolean {
  const owned = buy(app.decor, 'rock')
  return app.tour === 'shop' && !app.decor.owned.rock && !!owned && setDecor(place(owned, spot, 'rock'))
}

export const placeDecor = (spot: number, id: string) => setDecor(place(app.decor, spot, id))
export const storeDecor = (spot: number) => setDecor(unplace(app.decor, spot))
export const moveDecor = (from: number, to: number) => setDecor(move(app.decor, from, to))

// Garden looks: bought once, then worn. Buying one also puts it on.

export function buyLook(id: string): boolean {
  const item = LOOK_BY_ID[id]
  if (!item || app.look.owned.includes(id) || app.coins < item.price) return false
  app.coins -= item.price
  app.look = { owned: [...app.look.owned, id], wearing: { ...app.look.wearing, [item.part]: id } }
  save()
  return true
}

export function wearLook(id: string): boolean {
  const item = LOOK_BY_ID[id]
  if (!item || !(item.price === 0 || app.look.owned.includes(id))) return false
  app.look = { ...app.look, wearing: { ...app.look.wearing, [item.part]: id } }
  save()
  return true
}

// The tutorial. Components report what the player did; it only counts on the step that asked for it.

export function tourDid(step: TourStep) {
  if (app.tour !== step) return
  app.tour = nextStep(step)
  save()
}

const clearStarter = () => {
  const i = app.garden.findIndex((p) => p?.species === STARTER)
  if (i >= 0) app.garden[i] = null
}

export function setTour(step: TourStep | null) {
  app.tour = step
  if (!hasStarter(step)) clearStarter()
  save()
}

// The first question's own XP: what a first right answer pays in a quiz.
const STARTER_XP = 12

// The guided question is answered: the plant is watered and ready to grow straight away.
export function waterStarterPlot(i: number, now = Date.now()) {
  const plot = validSlot(i) ? app.garden[i] : null
  if (plot?.species !== STARTER) return
  app.garden[i] = waterStarter(plot, now)
  app.xp += STARTER_XP
  tourDid('starter-water')
  save()
}

// Groomed, it leaves a seed behind and frees its plot for the player's first real plant.
export function retireStarter() {
  clearStarter()
  tourDid('starter-groom')
  save()
}

// The middle of the third row, the plot the 'plant' step points at next.
const STARTER_PLOT = 6

// Make sure what the current step asks for is there: a visitor or ant coin due, a weed, an empty plot.
export function prepTour(now = Date.now()) {
  const starter = app.garden.findIndex((p) => p?.species === STARTER)
  if (app.tour === 'hello' || app.tour === 'starter-water') {
    const i = starter >= 0 ? starter : app.garden[STARTER_PLOT] ? app.garden.indexOf(null) : STARTER_PLOT
    // A replay with every plot full skips the starter.
    if (i < 0) return app.tour === 'starter-water' ? tourDid('starter-water') : undefined
    if (starter < 0 || app.garden[i]?.stage === BLOOMED || app.garden[i]?.doneAt !== null) app.garden[i] = plantStarter()
  } else if (app.tour === 'starter-grow' && (starter < 0 || app.garden[starter]?.stage === BLOOMED)) return tourDid('starter-grow')
  else if (app.tour === 'starter-groom' && starter < 0) return tourDid('starter-groom')
  else if (app.tour === 'visitor' && !visitorDue(app.visitorAt, now)) app.visitorAt = 0
  else if (app.tour === 'ant' && !antCoinDue(app.antCoinAt, now)) app.antCoinAt = 0
  else if (app.tour === 'weed' && !app.weeds.length) {
    app.weedAt = Math.min(app.weedAt, now) - WEED_EVERY_MS
    tendWeeds(now)
  } else if (app.tour === 'plant' && app.garden.every((p) => p)) return tourDid('plant')
  else return
  save()
}

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

export function debugAddCoins(n: number) {
  app.coins = Math.max(0, app.coins + Math.floor(n || 0))
  save()
}

// Skip the watering and the cooldown: ready to grow (a bloom goes back to thirsty). A long-past
// doneAt, not `now - COOLDOWN_MS`, because the garden's clock can run up to 30 s behind.
export function debugReady(i: number) {
  const p = validSlot(i) ? app.garden[i] : null
  if (!p) return
  p.doneAt = 0
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
  const species = GROWABLE.filter((s) => deckReady(SPECIES[s].deck))
  if (!species.length) return
  app.garden = app.garden.map((p) => {
    if (p) return p
    const sp = species[Math.floor(Math.random() * species.length)]
    const stage = SEEDED + Math.floor(Math.random() * BLOOMED)
    return { ...plantSeed(sp, rollVariant(sp, Math.random(), foundBloom(sp))), stage, waters: stage - SEEDED }
  })
  for (const p of app.garden) if (p?.stage === BLOOMED) app.collection = discover(app.collection, p.species, p.variant, Date.now())
  save()
}

export function resetGarden() {
  app.garden = normalizeGarden(null)
  save()
}
