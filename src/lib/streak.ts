// Pure daily-streak rules. A study day is a day with at least one finished watering or grooming quiz.
// Missed days never punish: a rain day (earned every STREAK_RAIN_EVERY days) covers one missed day,
// and a streak too broken to cover simply starts fresh.

const DAY_MS = 24 * 60 * 60 * 1000

export const STREAK_RAIN_EVERY = 7
export const MAX_RAIN_DAYS = 2

export interface Streak {
  count: number // study days in a row
  best: number
  day: number // local day number of the last study day; -1 = never studied
  rain: number // rain days held, each covers one missed day
}

export const newStreak = (): Streak => ({ count: 0, best: 0, day: -1, rain: 0 })

// Days since the epoch in the device's time zone, so a streak day starts at local midnight.
export const dayNumber = (t: number) => Math.floor((t - new Date(t).getTimezoneOffset() * 60_000) / DAY_MS)

// Coins for reaching a streak length: a few early milestones, then every 30 days.
export function streakBonus(count: number): number {
  const early: Record<number, number> = { 3: 15, 7: 30, 14: 50 }
  if (early[count]) return early[count]
  return count >= 30 && count % 30 === 0 ? 100 : 0
}

// Days missed since the last study day that rain days can't cover; 0 means the streak is alive.
const uncovered = (s: Streak, today: number) => (s.day < 0 ? Infinity : Math.max(0, today - s.day - 1 - s.rain))

// The streak as it stands today (0 once it can no longer be saved).
export const liveStreak = (s: Streak, today: number) => (s.count && !uncovered(s, today) ? s.count : 0)

// Missed days that rain days are covering right now, for the welcome-back card.
export const rainedDays = (s: Streak, today: number) => (liveStreak(s, today) ? Math.max(0, today - s.day - 1) : 0)

export type StreakEvent =
  | 'same' // already studied today
  | 'next' // the streak grew by a day
  | 'rain' // grew, with rain days covering the gap
  | 'fresh' // a new streak started at day 1

export interface StudyResult {
  streak: Streak
  event: StreakEvent
  bonus: number // milestone coins
  rainEarned: boolean
}

export function studyOn(s: Streak, today: number): StudyResult {
  // Same day, or a clock that moved back: nothing changes.
  if (s.day >= today) return { streak: s, event: 'same', bonus: 0, rainEarned: false }
  const missed = s.day < 0 ? Infinity : today - s.day - 1
  const keep = s.count > 0 && missed <= s.rain
  const count = keep ? s.count + 1 : 1
  // Rain days are a gift: a streak too broken to save keeps the ones it didn't use.
  let rain = keep ? s.rain - missed : s.rain
  const rainEarned = count % STREAK_RAIN_EVERY === 0 && rain < MAX_RAIN_DAYS
  if (rainEarned) rain++
  return {
    streak: { count, best: Math.max(s.best, count), day: today, rain },
    event: keep ? (missed ? 'rain' : 'next') : 'fresh',
    bonus: streakBonus(count),
    rainEarned,
  }
}

export function normalizeStreak(raw: unknown): Streak {
  const r = (raw ?? {}) as Partial<Record<keyof Streak, unknown>>
  const int = (v: unknown, min = 0) => (typeof v === 'number' && Number.isFinite(v) && v >= min ? Math.floor(v) : null)
  const count = int(r.count) ?? 0
  return {
    count,
    best: Math.max(count, int(r.best) ?? 0),
    day: int(r.day) ?? -1,
    rain: Math.min(MAX_RAIN_DAYS, int(r.rain) ?? 0),
  }
}
