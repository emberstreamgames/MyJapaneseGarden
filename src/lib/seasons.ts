// Pure calendar rules for the garden's real-world seasons, read from the device's local date and
// hour. Japan's calendar on purpose, wherever the player is: it's part of what the app teaches.

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type Hours = 'day' | 'dusk' | 'night'
export type FestivalId = 'hanami' | 'tanabata' | 'tsukimi' | 'shogatsu'

export interface Word {
  ja: string
  reading: string
  gloss: string
}

export const SEASONS: Record<Season, Word & { sky: string }> = {
  spring: { ja: '春', reading: 'haru', gloss: 'spring', sky: 'petals' },
  summer: { ja: '夏', reading: 'natsu', gloss: 'summer', sky: 'fireflies' },
  autumn: { ja: '秋', reading: 'aki', gloss: 'autumn', sky: 'leaves' },
  winter: { ja: '冬', reading: 'fuyu', gloss: 'winter', sky: 'snowfall' },
}

// `from` and `to` are inclusive [month, day] pairs. Tsukimi really follows the moon, so its window
// covers the usual dates of the harvest moon rather than one night.
export const FESTIVALS: Record<FestivalId, Word & { from: [number, number]; to: [number, number]; line: string }> = {
  shogatsu: { ja: 'お正月', reading: 'oshōgatsu', gloss: 'New Year', from: [1, 1], to: [1, 7], line: 'A straw rope hangs over the garden to welcome the year.' },
  hanami: { ja: '花見', reading: 'hanami', gloss: 'flower viewing', from: [3, 25], to: [4, 15], line: 'Lanterns are up for the cherry blossoms.' },
  tanabata: { ja: '七夕', reading: 'tanabata', gloss: 'star festival', from: [7, 1], to: [7, 7], line: 'Wishes hang from the bamboo.' },
  tsukimi: { ja: '月見', reading: 'tsukimi', gloss: 'moon viewing', from: [9, 12], to: [10, 4], line: 'The harvest moon is rising over the garden.' },
}

export function seasonOf(month: number): Season {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

export function hoursOf(hour: number): Hours {
  if (hour >= 6 && hour < 17) return 'day'
  if (hour >= 17 && hour < 19) return 'dusk'
  return 'night'
}

export function festivalOn(month: number, day: number): FestivalId | null {
  const at = month * 100 + day
  for (const id of Object.keys(FESTIVALS) as FestivalId[]) {
    const { from, to } = FESTIVALS[id]
    if (at >= from[0] * 100 + from[1] && at <= to[0] * 100 + to[1]) return id
  }
  return null
}

// The free seasonal drift. Fireflies only come out once it's dark.
export const ambientSky = (season: Season, hours: Hours) => (season === 'summer' && hours === 'day' ? 'clear' : SEASONS[season].sky)
