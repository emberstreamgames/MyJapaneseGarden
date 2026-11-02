import { describe, expect, it } from 'vitest'
import { ambientSky, festivalOn, hoursOf, seasonOf } from './seasons'

describe('seasons', () => {
  it('follows the months', () => {
    expect([1, 3, 5, 6, 8, 9, 11, 12].map(seasonOf)).toEqual(['winter', 'spring', 'spring', 'summer', 'summer', 'autumn', 'autumn', 'winter'])
  })

  it('splits the day at dusk and night', () => {
    expect([5, 6, 16, 17, 18, 19, 23].map(hoursOf)).toEqual(['night', 'day', 'day', 'dusk', 'dusk', 'night', 'night'])
  })

  it('includes both ends of a festival', () => {
    expect(festivalOn(3, 24)).toBeNull()
    expect(festivalOn(3, 25)).toBe('hanami')
    expect(festivalOn(4, 15)).toBe('hanami')
    expect(festivalOn(4, 16)).toBeNull()
    expect(festivalOn(7, 7)).toBe('tanabata')
    expect(festivalOn(9, 30)).toBe('tsukimi')
    expect(festivalOn(1, 1)).toBe('shogatsu')
    expect(festivalOn(11, 1)).toBeNull()
  })

  it('keeps fireflies out of the daytime', () => {
    expect(ambientSky('summer', 'day')).toBe('clear')
    expect(ambientSky('summer', 'night')).toBe('fireflies')
    expect(ambientSky('winter', 'day')).toBe('snowfall')
  })
})
