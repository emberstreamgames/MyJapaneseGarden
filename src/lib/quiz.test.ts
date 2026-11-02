import { describe, expect, it } from 'vitest'
import type { Item } from '../data/items'
import { accepted, nearMiss } from './quiz.svelte'

const item = (answers: string[], type: Item['type'] = 'vocab'): Item => ({ id: 'x', type, lesson: 1, front: 'x', back: answers[0], answers, tag: '' })

describe('near misses', () => {
  it('catches a slip in a word', () => {
    expect(nearMiss(item(['water']), 'wather')).toBe(true)
    expect(nearMiss(item(['to wear (on the body)']), 'wera')).toBe(false)
    expect(nearMiss(item(['to wear (on the body)']), 'wearr')).toBe(true)
    expect(nearMiss(item(['international student']), 'internatonal studnt')).toBe(true)
  })

  it('leaves real mistakes and short answers alone', () => {
    expect(nearMiss(item(['water']), 'fire')).toBe(false)
    expect(nearMiss(item(['ka'], 'hiragana'), 'ki')).toBe(false)
    expect(nearMiss(item(['kya'], 'hiragana'), 'kyu')).toBe(false)
  })

  it('never overlaps a right answer that loses its brackets', () => {
    expect(accepted(item(['to wear (on the body)']), 'wear')).toBe(true)
  })
})
