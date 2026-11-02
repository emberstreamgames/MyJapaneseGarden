import { EXTRA_CARDS, ITEMS, type Deck, type Item } from '../data/items'
import { REVIEW_MAX, TEND_XP } from './garden'
import { app, buyHint, inChapters, newLeft, record, save, studyPool } from './store.svelte'
import { pickCard } from './srs'
import * as sfx from './sfx'

export type Kind = 'choice' | 'type'

// Said after a wrong answer, with any Japanese glossed so it can be read at any level.
export const CHEERS = [
  { en: 'Hang in there!', ja: 'がんばって', gloss: 'ganbatte: “hang in there”' },
  { en: 'Not quite.', ja: 'ドンマイ', gloss: 'donmai: “don’t worry about it”' },
  { en: 'That’s okay!', ja: 'だいじょうぶ', gloss: 'daijōbu: “it’s okay”' },
  { en: 'Keep going!', ja: 'もういちど', gloss: 'mō ichido: “one more time”' },
  { en: 'Nice try!', ja: 'ファイト', gloss: 'faito: “you can do it”' },
]

// Only for a typed answer that really was nearly right (nearMiss).
export const NEAR_MISS = { en: 'So close!', ja: 'おしい', gloss: 'oshii: “so close”' }

// Said after a right answer: a plain word, or something bigger on a combo milestone.
const PLAIN_PRAISE = ['Correct!', 'Nice!', 'Yes!', 'That’s it!', 'Got it!']
const COMBO_PRAISE: Record<number, { ja: string; gloss: string }> = {
  3: { ja: 'いいね!', gloss: 'ii ne: “nice”' },
  5: { ja: 'すごい!', gloss: 'sugoi: “amazing”' },
  7: { ja: 'さすが!', gloss: 'sasuga: “just what I’d expect from you”' },
  10: { ja: 'かんぺき!', gloss: 'kanpeki: “perfect”' },
}

// "to wear (on the body)" also passes as "to wear" or "wear". This lives here, not in the data rows,
// because rows sharing an answer never appear as each other's choices (docs/CONTENT.md).
export function accepted(it: Item, typed: string): boolean {
  if (it.answers.includes(typed)) return true
  if (it.type !== 'vocab' && it.type !== 'kanji') return false
  return it.answers.some((a) => {
    const bare = a.replace(/\s*\([^)]*\)/g, '').trim()
    return !!bare && (bare === typed || bare.replace(/^to /, '') === typed)
  })
}

// How many edits turn `a` into `b`.
function editDistance(a: string, b: string): number {
  let row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const next = [i]
    for (let j = 1; j <= b.length; j++) next[j] = Math.min(row[j] + 1, next[j - 1] + 1, row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    row = next
  }
  return row[b.length]
}

// A typo's distance from a right answer. Short answers don't count: "ka" and "ki" are different kana,
// not a slip, and one letter is a much bigger share of a four-letter word than of a long one.
export function nearMiss(it: Item, typed: string): boolean {
  const forms = it.answers.flatMap((a) => {
    const bare = a.replace(/\s*\([^)]*\)/g, '').trim()
    return [a, bare, bare.replace(/^to /, '')]
  })
  return forms.some((a) => a.length >= 4 && editDistance(a, typed) <= (a.length >= 9 ? 2 : 1))
}

// The question/answer engine shared by free practice and the garden quizzes.
export class Quiz {
  current = $state<Item | null>(null)
  kind = $state<Kind>('choice')
  options = $state<string[]>([])
  typed = $state('')
  result = $state<null | 'right' | 'wrong'>(null)
  picked = $state('')
  combo = $state(0)
  bestCombo = $state(0) // best combo since this quiz was created
  session = $state({ right: 0, wrong: 0 })
  burst = $state<{ id: number; parts: { dx: number; dy: number; hue: number }[] } | null>(null)
  gain = $state<{ id: number; amount: number } | null>(null)
  shake = $state(0)
  answered = $state(0) // questions answered since this quiz was created
  cheer = $state(0) // index into CHEERS for the last wrong answer
  near = $state(false) // the last wrong answer was a typed near miss
  unsure = $state(false) // the player said they didn't know this one
  isNew = $state(false) // the player has never been asked this card
  praise = $state<{ en: string; ja?: string; gloss?: string; big?: boolean }>({ en: PLAIN_PRAISE[0] })
  xp = $state(0) // XP from answers since this quiz was created
  mastered = $state<{ item: Item; unlocked: boolean }[]>([]) // cards this quiz carried over the mastery line
  justMastered = $state(false) // the last answer did
  revealed = $state(false) // the player paid to see this question's hint
  missed = $state<{ item: Item; fixed: boolean }[]>([]) // cards missed, each once; fixed once right on review
  reviewing = $state(false) // the round after a quiz that asks misses again
  reviewTotal = $state(0)
  reviewDone = $state(0)
  stronger = $state(0) // right answers on cards already met
  met = $state(0) // cards seen for the first time

  private deckOf: () => Deck
  private cards?: () => Item[] | undefined
  private lastId = ''
  private n = 0
  private asked = new Set<string>() // cards asked since the pool last ran out

  // `cards` replaces the deck's pool with a fixed list, which may mix decks (Tend weak words).
  constructor(deckOf: () => Deck, cards?: () => Item[] | undefined) {
    this.deckOf = deckOf
    this.cards = cards
  }

  get deck(): Deck {
    return this.deckOf()
  }

  get pool(): Item[] {
    return this.cards?.() ?? studyPool(this.deck)
  }

  // A kanji's readings give it away, so they cost coins until the question is answered.
  get hintLocked(): boolean {
    return this.current?.type === 'kanji' && !this.current.side && !this.revealed && !this.result
  }

  revealHint() {
    if (!this.hintLocked || !buyHint()) return
    this.revealed = true
    if (!app.muted) sfx.coin()
  }

  get reviewLeft(): number {
    return this.reviewTotal - this.reviewDone
  }

  // Ask the misses once more. Nothing here counts: a retry seconds later isn't evidence of knowing a card.
  beginReview() {
    this.reviewing = true
    this.reviewTotal = Math.min(this.missed.length, REVIEW_MAX)
    this.gain = null
    this.next()
  }

  next() {
    if (this.reviewing) return this.ask(this.missed[this.reviewDone].item)
    const pool = this.pool
    const now = Date.now()
    const pickNext = () => pickCard(pool, app.stats, this.asked, newLeft(now), now)
    let pick = pickNext()
    // Everything's been asked: go round again, without repeating the card just shown.
    if (!pick) {
      this.asked.clear()
      if (pool.length > 1) this.asked.add(this.lastId)
      pick = pickNext()
    }
    if (!pick) {
      this.current = null
      return
    }
    this.asked.add(pick.id)
    this.ask(pick)
  }

  private ask(pick: Item) {
    this.current = pick
    this.lastId = pick.id
    this.typed = ''
    this.result = null
    this.picked = ''
    this.revealed = false
    this.near = false
    this.unsure = false
    this.justMastered = false
    this.isNew = !app.stats[pick.id]
    // Japanese can't be typed on every keyboard, so harder versions are always multiple choice.
    const kinds: Kind[] = pick.side ? ['choice'] : app.mode === 'mix' ? ['choice', 'type'] : [app.mode]
    this.kind = kinds[Math.floor(Math.random() * kinds.length)]
    if (this.kind === 'choice') {
      this.makeOptions(pick)
      // Too few distinct answers to make a real choice: ask for a typed answer instead.
      if (this.options.length < 2 && !pick.side) this.kind = 'type'
    }
  }

  private makeOptions(it: Item) {
    const all = (it.side ? EXTRA_CARDS : ITEMS).filter((i) => i.type === it.type && i.side === it.side)
    // skip rows sharing any accepted answer (家 "home; house" vs うち "home; house; my place"): both would be right
    const distinct = (i: Item) => i.back !== it.back && !i.answers.some((a) => it.answers.includes(a))
    const others = [...new Set(all.filter(distinct).map((i) => i.back))]
    // prefer distractors from the enabled pool so choices stay in scope
    const inScope = [...new Set(all.filter((i) => distinct(i) && inChapters(i)).map((i) => i.back))]
    const source = inScope.length >= 3 ? inScope : others
    const picks = source.sort(() => Math.random() - 0.5).slice(0, 3)
    this.options = [...picks, it.back].sort(() => Math.random() - 0.5)
  }

  answer(ok: boolean, quiet = false) {
    if (!this.current || this.result) return
    this.result = ok ? 'right' : 'wrong'
    const id = this.current.id
    const review = this.reviewing
    if (review) {
      this.reviewDone++
      const m = this.missed.find((m) => m.item.id === id)
      if (ok && m) m.fixed = true
    } else {
      this.answered++
      const seen = !!app.stats[id]
      const crossed = record(id, ok)
      // A harder version reaching mastery unlocks nothing and isn't a new milestone.
      if (crossed.mastered && !this.current.side) {
        this.mastered.push({ item: this.current, unlocked: EXTRA_CARDS.some((e) => e.base === id) })
        this.justMastered = true
      }
      if (!seen) this.met++
      else if (ok) this.stronger++
      if (!ok && !this.missed.some((m) => m.item.id === id)) this.missed.push({ item: this.current, fixed: false })
    }
    if (ok) {
      if (!review) {
        this.combo++
        this.session.right++
        if (this.combo > app.best) app.best = this.combo
        if (this.combo > this.bestCombo) this.bestCombo = this.combo
        const amount = this.cards?.() ? TEND_XP : 10 + Math.min(this.combo, 10) * 2
        app.xp += amount
        this.xp += amount
        this.gain = { id: ++this.n, amount }
      }
      this.praise = this.praiseNow(review)
      const combo = this.combo
      this.burst = {
        id: ++this.n,
        parts: Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2 + Math.random() * 0.4
          const d = 70 + Math.random() * 70
          return { dx: Math.cos(a) * d, dy: Math.sin(a) * d, hue: (200 + i * 25 + combo * 12) % 360 }
        }),
      }
      // A level-up has its own popup and sound (LevelUp.svelte).
      if (!app.muted) {
        sfx.good(this.combo)
        if (this.justMastered) setTimeout(sfx.fanfare, 250)
      }
    } else {
      if (!review) {
        this.combo = 0
        this.session.wrong++
      }
      if (!quiet) this.shake = ++this.n
      // A different one each time.
      this.cheer = (this.cheer + 1 + Math.floor(Math.random() * (CHEERS.length - 1))) % CHEERS.length
      if (!app.muted && !quiet) sfx.bad()
    }
    if (!review) save()
  }

  private praiseNow(review: boolean) {
    const milestone = !review && COMBO_PRAISE[this.combo]
    return milestone ? { en: `${this.combo} in a row!`, ...milestone, big: true } : { en: PLAIN_PRAISE[Math.floor(Math.random() * PLAIN_PRAISE.length)] }
  }

  // Better than typing nonsense or guessing: it counts as a miss, without the buzzer.
  dontKnow() {
    if (!this.current || this.result) return
    this.unsure = true
    this.typed = ''
    this.answer(false, true)
  }

  submitTyped(e: Event) {
    e.preventDefault()
    if (!this.current || this.result) return
    const t = this.typed.trim().toLowerCase()
    if (!t) return
    const ok = accepted(this.current, t)
    this.near = !ok && nearMiss(this.current, t)
    this.answer(ok)
  }

  choose(o: string) {
    if (!this.current || this.result) return
    this.picked = o
    this.answer(o === this.current.back)
  }

  // (Re)start whenever the deck or the enabled chapters change the pool. Call from an $effect.
  sync() {
    const pool = this.pool
    void pool.length
    void this.deck
    if (!this.current || !pool.some((i) => i.id === this.current!.id)) this.next()
  }
}
