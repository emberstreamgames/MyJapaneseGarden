import { describe, expect, it } from 'vitest'
import { EXTRA_CARDS, type Item } from '../data/items'
import { accepted, acceptedJapanese, nearMiss } from './quiz.svelte'

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

describe('answers typed in Japanese', () => {
  const word = (front: string, hint?: string): Item => ({ id: 'x', type: 'vocab', lesson: 1, front, back: 'x', answers: ['x'], tag: '', hint })

  it('takes the word as written or in kana', () => {
    expect(acceptedJapanese(word('映画', 'えいが'), 'えいが')).toBe(true)
    expect(acceptedJapanese(word('映画', 'えいが'), '映画')).toBe(true)
    expect(acceptedJapanese(word('映画', 'えいが'), 'えいか')).toBe(false)
  })

  it('takes katakana words in hiragana, and leaves out affix marks', () => {
    expect(acceptedJapanese(word('テレビ'), 'てれび')).toBe(true)
    expect(acceptedJapanese(word('Tシャツ'), 'Tしゃつ')).toBe(true)
    expect(acceptedJapanese(word('～さん'), 'さん')).toBe(true)
    expect(acceptedJapanese(word('（～を）ください'), 'ください')).toBe(true)
    expect(acceptedJapanese(word('なん／なに'), 'なに')).toBe(true)
    expect(acceptedJapanese(word('なん／なに'), ' なん ')).toBe(true)
  })

  it('gives a harder version the reading of the card it was made from', () => {
    const card = EXTRA_CARDS.find((c) => c.side === 'reverse' && c.back === '映画')!
    expect(acceptedJapanese(card, 'えいが')).toBe(true)
  })
})
