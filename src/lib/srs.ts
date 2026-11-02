import { Rating, createEmptyCard, fsrs, type Card } from 'ts-fsrs'

// Spaced repetition: each card's memory estimate and when it's next due, worked out by FSRS. Pure,
// like garden.ts: pass `now` in. Right and wrong map to FSRS's Good and Again, with no rating buttons.

const DAY_MS = 24 * 60 * 60 * 1000

export const NEW_PER_DAY = 10 // new cards a day, across every deck
export const MASTERY_DAYS = 21 // stability that counts as mastered, and unlocks a card's harder versions
export const KNOWN_DAYS = 7 // stability that counts as a word the player can read
const REVIEW = 2 // FSRS's State.Review
const STATES = [0, 1, 2, 3]

// No learning steps in minutes: quizzes come daily, so a missed card simply comes back tomorrow.
const scheduler = fsrs({ enable_short_term: false, enable_fuzz: false, request_retention: 0.9 })

export interface Srs {
  due: number // timestamp
  s: number // stability: days until recall falls to 90%
  d: number // difficulty, 1-10
  reps: number
  lapses: number
  state: number
}

// What the rules need from a saved Stat.
export interface Reviewed {
  last: number // timestamp of the last review
  srs?: Srs
}

const round = (n: number) => Math.round(n * 1000) / 1000

function toCard(c: Srs, last: number): Card {
  return {
    due: new Date(c.due),
    stability: c.s,
    difficulty: c.d,
    scheduled_days: Math.max(0, Math.round((c.due - last) / DAY_MS)),
    reps: c.reps,
    lapses: c.lapses,
    learning_steps: 0,
    state: c.state as Card['state'],
    last_review: new Date(last),
  }
}

export function review(prev: Srs | undefined, last: number, ok: boolean, now: number): Srs {
  // A clock that moved back reviews at the last known time.
  const at = new Date(Math.max(now, last))
  const card = scheduler.next(prev ? toCard(prev, last) : createEmptyCard(at), at, ok ? Rating.Good : Rating.Again).card
  return { due: card.due.getTime(), s: round(card.stability), d: round(card.difficulty), reps: card.reps, lapses: card.lapses, state: card.state }
}

// Saves from before version 10 have only right/wrong counts. A run of right answers stands in for
// memory strength: 5 in a row (the old mastery) lands at 32 days, so mastered cards stay mastered.
export function seedSrs(stat: { c: number; w: number; streak: number; last: number }): Srs | undefined {
  const reps = stat.c + stat.w
  if (!reps || !stat.last) return undefined
  const s = stat.streak ? Math.min(2 ** stat.streak, 60) : 1
  return { due: stat.last + s * DAY_MS, s, d: round(3 + 6 * (stat.w / reps)), reps, lapses: stat.w, state: REVIEW }
}

export function normalizeSrs(raw: unknown): Srs | undefined {
  const r = raw as Partial<Srs> | null
  if (!r || typeof r !== 'object') return undefined
  const { due, s, d, reps, lapses, state } = r
  const num = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
  if (!num(due) || !num(s) || !num(d) || s <= 0 || !num(reps) || !num(lapses) || !STATES.includes(state as number)) return undefined
  return { due, s, d: Math.min(10, Math.max(1, d)), reps: Math.max(0, reps), lapses: Math.max(0, lapses), state: state as number }
}

export const isMastered = (c: Reviewed | undefined) => (c?.srs?.s ?? 0) >= MASTERY_DAYS
export const isKnown = (c: Reviewed | undefined) => (c?.srs?.s ?? 0) >= KNOWN_DAYS

type Log = Record<string, Reviewed>

// How far past its interval a card is: 1 is exactly due, higher is further gone.
const overdue = (c: Reviewed, now: number) => (now - c.last) / (c.srs!.s * DAY_MS)

export function mostOverdue<T extends { id: string }>(items: T[], log: Log, now: number): T | null {
  const due = items.filter((i) => log[i.id]?.srs && log[i.id].srs!.due <= now)
  if (!due.length) return null
  return due.reduce((a, b) => (overdue(log[b.id], now) > overdue(log[a.id], now) ? b : a))
}

// The next card for a quiz, skipping those already `asked`: due cards first, then new ones up to the
// day's cap, in pool order. Failing those it keeps the quiz going with the cards closest to due, and
// past the cap only when nothing else is left, so a plant can always be watered.
export function pickCard<T extends { id: string }>(pool: T[], log: Log, asked: Set<string>, newLeft: number, now: number): T | null {
  const fresh = pool.filter((i) => !asked.has(i.id))
  const seen = fresh.filter((i) => log[i.id]?.srs)
  const unseen = fresh.filter((i) => !log[i.id]?.srs)
  const due = mostOverdue(seen, log, now)
  if (due) return due
  if (newLeft > 0 && unseen.length) return unseen[0]
  if (seen.length) return seen.reduce((a, b) => (log[b.id].srs!.due < log[a.id].srs!.due ? b : a))
  return unseen[0] ?? null
}

// The shakiest cards seen so far: most lapses, then least stable. Mastered ones don't need the help.
export function weakest<T extends { id: string }>(items: T[], log: Log, n: number): T[] {
  return items
    .filter((i) => log[i.id]?.srs && !isMastered(log[i.id]))
    .sort((a, b) => log[b.id].srs!.lapses - log[a.id].srs!.lapses || log[a.id].srs!.s - log[b.id].srs!.s)
    .slice(0, n)
}
