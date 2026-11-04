import { describe, expect, it } from 'vitest'
import { N5_KANJI } from './build'
import { ITEMS } from './items'
import { N5_KANJI_LIST } from './kanji'

describe('ITEMS', () => {
  it('never asks a kanji card in the vocab deck', () => {
    const kanji = new Set(ITEMS.filter((i) => i.type === 'kanji').map((i) => i.front))
    expect(ITEMS.filter((i) => i.type === 'vocab' && kanji.has(i.front)).map((i) => i.front)).toEqual([])
  })
})

describe('N5 Kanji', () => {
  const kanji = ITEMS.filter((i) => i.type === 'kanji')

  it('puts every listed N5 kanji on the chip, each as a single card', () => {
    const onChip = kanji.filter((i) => i.also === N5_KANJI).map((i) => i.front)
    expect(onChip.sort()).toEqual([...N5_KANJI_LIST].sort())
    expect(new Set(kanji.map((i) => i.front)).size).toBe(kanji.length)
  })
})
