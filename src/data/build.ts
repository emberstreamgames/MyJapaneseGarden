import type { Deck, Item } from './items'

// Helpers that turn compact hand-written rows into Items. See docs/CONTENT.md.

export const norm = (s: string) => s.trim().toLowerCase()

// N5 Prep is a study group outside the Genki chapters; it has its own chip. N5 Kanji is a chip too,
// but its cards stay in their Genki lessons and are brought in through `also`, so they're never copied.
export const N5 = 'n5' as const
export const N5_KANJI = 'n5k' as const
export type Lesson = number | typeof N5 | typeof N5_KANJI
export const lessonTag = (n: Lesson) => (n === N5 ? 'N5 Prep' : n === N5_KANJI ? 'N5 Kanji' : n === 0 ? 'Intro' : `Lesson ${n}`)
// Genki lessons in order, then the N5 groups.
export const lessonOrder = (n: Lesson) => (typeof n === 'number' ? n : n === N5 ? 100 : 101)

// Rows are grouped by Genki lesson (0 = Greetings/Numbers, 1-12).
export type ByLesson<R> = Record<number, R[]>

export function fromLessons<R>(byLesson: ByLesson<R>, make: (row: R, lesson: number) => Omit<Item, 'lesson' | 'tag'>): Item[] {
  return Object.entries(byLesson).flatMap(([n, rows]) =>
    rows.map((row) => ({ ...make(row, +n), lesson: +n, tag: lessonTag(+n) })),
  )
}

export const withType = (type: Deck, id: string, front: string, back: string, answers: string[], hint?: string) => ({
  id,
  type,
  front,
  back,
  answers: [...new Set(answers.map(norm).filter(Boolean))],
  ...(hint ? { hint } : {}),
})
