import { describe, expect, it } from 'vitest'
import { BLOOMS, rollVariant } from './blooms'
import { creatureKey, rollCreature } from './creatures'
import { BLOOMED, COOLDOWN_MS, PLOT_COUNT, advance, canPreserve, completeQuiz, msUntilReady, normalizeGarden, phaseOf, plantSeed, skipRest } from './garden'
import { FAVOUR_NEW, pickWeighted } from './roll'

const T0 = 1_800_000_000_000

describe('phases', () => {
  it('runs thirsty, resting, ready, then thirsty a stage higher', () => {
    const seed = plantSeed('daisy')
    expect(phaseOf(seed, T0)).toBe('thirsty')
    const watered = completeQuiz(seed, T0)!
    expect(phaseOf(watered, T0 + 1)).toBe('resting')
    expect(phaseOf(watered, T0 + COOLDOWN_MS - 1)).toBe('resting')
    expect(phaseOf(watered, T0 + COOLDOWN_MS)).toBe('ready')
    const grown = advance(watered, T0 + COOLDOWN_MS)!
    expect(grown.stage).toBe(2)
    expect(phaseOf(grown, T0 + COOLDOWN_MS)).toBe('thirsty')
  })

  it('refuses out-of-turn actions', () => {
    const seed = plantSeed('daisy')
    expect(advance(seed, T0)).toBeNull()
    const watered = completeQuiz(seed, T0)!
    expect(completeQuiz(watered, T0 + 1)).toBeNull()
    expect(advance(watered, T0 + 1)).toBeNull()
  })

  it('never locks the player out when the clock moves back', () => {
    const watered = completeQuiz(plantSeed('daisy'), T0)!
    expect(phaseOf(watered, T0 - 1000)).toBe('ready')
  })

  it('sends a bloom back to thirsty after each cooldown', () => {
    const bloom = { ...plantSeed('daisy'), stage: BLOOMED }
    const groomed = completeQuiz(bloom, T0)!
    expect(groomed.grooms).toBe(1)
    expect(phaseOf(groomed, T0 + COOLDOWN_MS)).toBe('thirsty')
    expect(canPreserve({ ...groomed, grooms: 3 })).toBe(true)
  })

  it('skips a rest only while resting', () => {
    const watered = completeQuiz(plantSeed('daisy'), T0)!
    const skipped = skipRest(watered, T0 + 1000)!
    expect(phaseOf(skipped, T0 + 1000)).toBe('ready')
    expect(msUntilReady(skipped, T0 + 1000)).toBe(0)
    expect(skipRest(plantSeed('daisy'), T0)).toBeNull()
  })
})

describe('normalizeGarden', () => {
  it('fills to length and drops unknown species', () => {
    const g = normalizeGarden([{ species: 'nope' }, plantSeed('tulip')])
    expect(g).toHaveLength(PLOT_COUNT)
    expect(g[0]).toBeNull()
    expect(g[1]?.species).toBe('tulip')
  })

  it('clamps numbers and takes the deck from the species', () => {
    const [p] = normalizeGarden([{ species: 'daisy', deck: 'kanji', stage: 99, waters: -4, variant: 999, doneAt: 'x' }])
    expect(p).toMatchObject({ deck: 'vocab', stage: BLOOMED, waters: 0, doneAt: null, variant: BLOOMS.daisy.length })
  })

  it('survives junk', () => {
    expect(normalizeGarden('junk').every((p) => p === null)).toBe(true)
  })
})

describe('rolls favouring what is new', () => {
  it('weighs picks by share', () => {
    expect(pickWeighted([1, 2], 0.3)).toBe(0)
    expect(pickWeighted([1, 2], 0.4)).toBe(1)
    expect(pickWeighted([1, 2], 0.999)).toBe(1)
  })

  it('makes an unfound bloom twice as likely as a found one', () => {
    const n = BLOOMS.daisy.length + 1
    const steps = 30000
    const hits = Array(n).fill(0)
    for (let i = 0; i < steps; i++) hits[rollVariant('daisy', i / steps, (v) => v !== 0)]++
    // Variant 0 is the only unfound one.
    expect(hits[0] / hits[1]).toBeCloseTo(FAVOUR_NEW, 1)
  })

  it('rolls evenly when nothing has been found', () => {
    expect(rollVariant('daisy', 0)).toBe(0)
    expect(rollVariant('daisy', 0.9999)).toBe(BLOOMS.daisy.length)
  })

  it('favours an unseen look of a creature', () => {
    let unseen = 0
    const steps = 500
    for (let i = 0; i < steps; i++) {
      const { creature, look } = rollCreature(0, i / steps, (key) => key !== creatureKey('butterfly', 'cabbage-white'))
      if (creature === 'butterfly' && look === 'cabbage-white') unseen++
    }
    // One unseen look at weight 2 among 9 at weight 1.
    expect(unseen / steps).toBeCloseTo(2 / 11, 1)
  })
})
