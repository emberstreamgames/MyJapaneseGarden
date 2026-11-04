import { describe, expect, it } from 'vitest'
import { MASTERY_DAYS, isMastered, mostOverdue, normalizeSrs, pickCard, review, seedSrs, weakest, type Reviewed, type Srs } from './srs'

const DAY = 86_400_000
const T0 = Date.UTC(2026, 0, 1)
const card = (id: string) => ({ id })
const srs = (over: Partial<Srs> = {}): Srs => ({ due: T0, s: 3, d: 5, reps: 1, lapses: 0, state: 2, ...over })
const seen = (over: Partial<Srs> = {}, last = T0 - 3 * DAY): Reviewed => ({ last, srs: srs(over) })

describe('review', () => {
  it('brings a right answer back later than a wrong one', () => {
    expect(review(undefined, 0, true, T0).due).toBeGreaterThan(review(undefined, 0, false, T0).due)
  })

  it('stretches the interval with each right answer on time', () => {
    let c = review(undefined, 0, true, T0)
    let last = T0
    for (let i = 0; i < 3; i++) {
      const next = review(c, last, true, c.due)
      expect(next.due - c.due).toBeGreaterThan(c.due - last)
      last = c.due
      c = next
    }
  })

  it('reaches mastery in a few spaced right answers', () => {
    let c = review(undefined, 0, true, T0)
    let last = T0
    let n = 1
    while (c.s < MASTERY_DAYS && n < 10) {
      const next = review(c, last, true, c.due)
      last = c.due
      c = next
      n++
    }
    expect(n).toBeLessThanOrEqual(4)
  })

  it('drops stability and counts a lapse on a miss', () => {
    const c = srs({ due: T0, s: 30, state: 2 })
    const missed = review(c, T0 - 30 * DAY, false, T0)
    expect(missed.s).toBeLessThan(30)
    expect(missed.lapses).toBe(1)
  })

  it('survives a clock that moved back', () => {
    const c = review(undefined, 0, true, T0)
    expect(Number.isFinite(review(c, T0, true, T0 - 5 * DAY).due)).toBe(true)
  })
})

describe('seedSrs', () => {
  it('skips cards never answered', () => {
    expect(seedSrs({ c: 0, w: 0, streak: 0, last: 0 })).toBeUndefined()
  })

  it('keeps old mastery: five in a row stays mastered, four does not', () => {
    expect(isMastered({ last: T0, srs: seedSrs({ c: 5, w: 0, streak: 5, last: T0 }) })).toBe(true)
    expect(isMastered({ last: T0, srs: seedSrs({ c: 4, w: 0, streak: 4, last: T0 }) })).toBe(false)
  })

  it('makes a card with a broken streak due soon, and harder the more it was missed', () => {
    const a = seedSrs({ c: 1, w: 9, streak: 0, last: T0 })!
    const b = seedSrs({ c: 9, w: 1, streak: 0, last: T0 })!
    expect(a.due).toBe(T0 + DAY)
    expect(a.d).toBeGreaterThan(b.d)
  })
})

describe('normalizeSrs', () => {
  it('keeps good data and clamps difficulty', () => {
    expect(normalizeSrs(srs({ d: 99 }))?.d).toBe(10)
  })

  it('drops junk', () => {
    for (const bad of [null, 'x', {}, { ...srs(), s: 0 }, { ...srs(), due: NaN }, { ...srs(), state: 9 }]) expect(normalizeSrs(bad)).toBeUndefined()
  })
})

describe('pickCard', () => {
  const pool = ['a', 'b', 'c'].map(card)

  it('asks due cards before new ones, most overdue first', () => {
    const log = { b: seen({ due: T0 - DAY, s: 10 }, T0 - 11 * DAY), c: seen({ due: T0 - DAY, s: 1 }, T0 - 2 * DAY) }
    expect(pickCard(pool, log, new Set(), 10, T0)?.id).toBe('c')
  })

  it('takes new cards in pool order while under the cap', () => {
    const log = { a: seen({ due: T0 + 5 * DAY }) }
    expect(pickCard(pool, log, new Set(), 1, T0)?.id).toBe('b')
  })

  it('prefers the closest-to-due card once the cap is used', () => {
    const log = { a: seen({ due: T0 + 9 * DAY }), b: seen({ due: T0 + DAY }) }
    expect(pickCard(pool, log, new Set(), 0, T0)?.id).toBe('b')
  })

  // "Today" is the local day, so these run at local noon to pass in any time zone.
  const noon = new Date(2026, 0, 1, 12).getTime()

  it('goes past the cap before repeating a card answered today', () => {
    const log = { a: seen({ due: noon + DAY }, noon - 60_000) }
    expect(pickCard(pool, log, new Set(), 0, noon)?.id).toBe('b')
  })

  it('asks a card answered today once nothing else is left', () => {
    const log = { a: seen({ due: noon + DAY }, noon - 60_000) }
    expect(pickCard(pool, log, new Set(['b', 'c']), 0, noon)?.id).toBe('a')
  })

  it('goes past the cap rather than leave a quiz with nothing to ask', () => {
    expect(pickCard(pool, {}, new Set(), 0, T0)?.id).toBe('a')
  })

  it('never repeats a card already asked, and ends when none are left', () => {
    expect(pickCard(pool, {}, new Set(['a']), 10, T0)?.id).toBe('b')
    expect(pickCard(pool, {}, new Set(['a', 'b', 'c']), 10, T0)).toBeNull()
  })
})

describe('mostOverdue', () => {
  it('ignores cards not yet due', () => {
    expect(mostOverdue([card('a')], { a: seen({ due: T0 + DAY }) }, T0)).toBeNull()
  })
})

describe('weakest', () => {
  it('ranks by lapses, then stability, and leaves out mastered and unseen cards', () => {
    const log = {
      a: seen({ lapses: 1, s: 5 }),
      b: seen({ lapses: 3, s: 5 }),
      c: seen({ lapses: 1, s: 2 }),
      d: seen({ lapses: 9, s: MASTERY_DAYS }),
    }
    expect(weakest(['a', 'b', 'c', 'd', 'e'].map(card), log, 2).map((c) => c.id)).toEqual(['b', 'c'])
  })
})
