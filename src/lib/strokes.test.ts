import { describe, expect, it } from 'vitest'
import { ITEMS, canDraw, drawAnswers, drawRivals, type Deck } from '../data/items'
import raw from '../data/strokes.json'
import { judge, match, type CharStrokes, type Pt } from './strokes'

const data = raw as Record<string, CharStrokes>
const chars = Object.keys(data)
const pts = (c: CharStrokes): Pt[][] => c.p.map((f) => Array.from({ length: f.length / 2 }, (_, i) => [f[2 * i], f[2 * i + 1]] as Pt))
const deckOf = (ch: string): Deck => ITEMS.find((i) => canDraw(i) && i.front === ch)?.type ?? 'kanji'
const rivals = (deck: Deck) => Object.fromEntries(drawRivals(deck).map((c) => [c, data[c]]))

// A seeded hand: off-size, off-centre, slightly rotated and sheared, each stroke shifted and bowed.
let seed = 7
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const r = (a: number) => (rnd() * 2 - 1) * a
function hand(c: CharStrokes, k = 1): Pt[][] {
  const s = 3 * (1 + r(0.3)), ax = 1 + r(0.12 * k), rot = r(0.12 * k), sh = r(0.1 * k), tx = r(15), ty = r(15)
  return c.p.map((flat) => {
    const ox = r(4 * k), oy = r(4 * k), bend = r(4 * k), bx = r(1), by = r(1)
    return Array.from({ length: flat.length / 2 }, (_, i): Pt => {
      const t = Math.sin((Math.PI * i) / (flat.length / 2 - 1))
      let x = flat[2 * i] - 54.5 + ox + bx * bend * t + r(1.5 * k)
      const y = flat[2 * i + 1] - 54.5 + oy + by * bend * t + r(1.5 * k)
      x = x * ax + y * sh
      return [(x * Math.cos(rot) - y * Math.sin(rot)) * s + 200 + tx, (x * Math.sin(rot) + y * Math.cos(rot)) * s + 200 + ty]
    })
  })
}

describe('stroke data', () => {
  it('covers every drawable card', () => {
    const missing = ITEMS.filter(canDraw).filter((i) => !data[i.front]).map((i) => i.front)
    expect(missing).toEqual([])
  })

  it('leaves out combos and harder versions', () => {
    expect(ITEMS.some((i) => i.front === 'きゃ' && canDraw(i))).toBe(false)
  })
})

describe('drawAnswers', () => {
  const item = (deck: Deck, front: string) => ITEMS.find((i) => i.type === deck && i.front === front)!
  it('accepts any kana with the same romaji', () => {
    expect(drawAnswers(item('hiragana', 'じ')).sort()).toEqual(['ぢ', 'じ'].sort())
    expect(drawAnswers(item('katakana', 'ヅ')).sort()).toEqual(['ズ', 'ヅ'].sort())
  })
  it("doesn't let o take を or e take へ", () => {
    expect(drawAnswers(item('hiragana', 'お'))).toEqual(['お'])
    expect(drawAnswers(item('hiragana', 'を'))).toEqual(['を'])
    expect(drawAnswers(item('hiragana', 'え'))).toEqual(['え'])
    expect(drawAnswers(item('hiragana', 'へ'))).toEqual(['へ'])
  })
})

describe('match', () => {
  it('accepts the character itself at any size and place', () => {
    for (const ch of chars) {
      const big = pts(data[ch]).map((s) => s.map(([x, y]): Pt => [x * 3 + 40, y * 3 + 10]))
      expect(match(big, data[ch]), ch).toMatchObject({ ok: true, order: false })
    }
  })

  it('accepts almost every hand-drawn copy', () => {
    let ok = 0
    let n = 0
    for (const ch of chars) for (let i = 0; i < 10; i++, n++) if (judge(hand(data[ch]), { [ch]: data[ch] }, rivals(deckOf(ch))).ok) ok++
    expect(ok / n).toBeGreaterThan(0.98)
  })

  it('never takes a look-alike from the same deck', () => {
    const fooled: string[] = []
    for (const a of chars) for (const b of chars) {
      if (a === b || deckOf(a) !== deckOf(b) || data[a].p.length !== data[b].p.length) continue
      if (judge(hand(data[a], 0.5), { [b]: data[b] }, rivals(deckOf(b))).ok) fooled.push(`${a} as ${b}`)
    }
    expect(fooled).toEqual([])
  })

  it('names the look-alike a drawing was closer to', () => {
    expect(judge(pts(data['れ']), { わ: data['わ'] }, rivals('hiragana'))).toMatchObject({ ok: false, reason: 'like', like: 'れ' })
  })

  it('passes the right strokes in the wrong order, flagged', () => {
    const s = pts(data['か'])
    expect(match([s[2], s[0], s[1]], data['か'])).toMatchObject({ ok: true, order: true })
  })

  it('fails a stroke drawn backwards', () => {
    const s = pts(data['ソ'])
    expect(match([s[0], [...s[1]].reverse()], data['ソ']).ok).toBe(false)
  })

  it('fails the wrong number of strokes', () => {
    expect(match(pts(data['か']).slice(0, 2), data['か'])).toMatchObject({ ok: false, reason: 'count', drawn: 2, want: 3 })
  })

  it('treats a tap as a dot', () => {
    const s = pts(data['ぷ'])
    const ring = s[s.length - 1]
    const dotted = [...s.slice(0, -1), [ring[0]]]
    expect(match(dotted, data['ぷ']).drawn).toBe(s.length)
  })
})

describe('judge', () => {
  it('takes either kana read the same way, and says which', () => {
    const v = judge(pts(data['ぢ']), { じ: data['じ'], ぢ: data['ぢ'] }, rivals('hiragana'))
    expect(v).toMatchObject({ ok: true, char: 'ぢ' })
  })
})
