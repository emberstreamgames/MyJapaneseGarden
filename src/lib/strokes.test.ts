import { describe, expect, it } from 'vitest'
import { ITEMS, canDraw, drawAnswers, drawRivals, type Deck } from '../data/items'
import raw from '../data/strokes.json'
import { judge, match, type CharStrokes, type Pt } from './strokes'

const data = raw as Record<string, CharStrokes>
const chars = Object.keys(data)
const pts = (c: CharStrokes): Pt[][] => c.p.map((f) => Array.from({ length: f.length / 2 }, (_, i) => [f[2 * i], f[2 * i + 1]] as Pt))
const deckOf = (ch: string): Deck => ITEMS.find((i) => canDraw(i) && i.front === ch)?.type ?? 'kanji'
const asked = new Set(ITEMS.filter(canDraw).map((i) => i.front))
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

  it('accepts most copies from a messier hand', () => {
    let ok = 0
    let n = 0
    for (const ch of chars) for (let i = 0; i < 10; i++, n++) if (judge(hand(data[ch], 2), { [ch]: data[ch] }, rivals(deckOf(ch))).ok) ok++
    expect(ok / n).toBeGreaterThan(0.9)
  })

  it('never takes a look-alike from the same deck', () => {
    const fooled: string[] = []
    for (const a of chars) for (const b of chars) {
      // ヰ and ヱ have stroke data but are never asked, so they have no deck to be confused within
      if (a === b || !asked.has(a) || deckOf(a) !== deckOf(b) || data[a].p.length !== data[b].p.length) continue
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

describe('faults', () => {
  const move = (s: Pt[], dx: number, dy: number) => s.map(([x, y]): Pt => [x + dx, y + dy])
  const grow = (s: Pt[], k: number) => {
    const [cx, cy] = [s.reduce((a, p) => a + p[0], 0) / s.length, s.reduce((a, p) => a + p[1], 0) / s.length]
    return s.map(([x, y]): Pt => [cx + (x - cx) * k, cy + (y - cy) * k])
  }
  const with_ = (ch: string, i: number, f: (s: Pt[]) => Pt[]) => {
    const s = pts(data[ch])
    s[i] = f(s[i])
    return s
  }

  it('names a stroke drawn backwards', () => {
    expect(match(with_('木', 1, (s) => [...s].reverse()), data['木'])).toMatchObject({ ok: false, reason: 'shape', messy: false, faults: [{ stroke: 1, drawn: 1, why: 'backwards' }] })
    expect(match(with_('し', 0, (s) => [...s].reverse()), data['し']).faults).toEqual([{ stroke: 0, drawn: 0, why: 'backwards' }])
  })

  it('names a stroke in the wrong place', () => {
    expect(match(with_('木', 3, (s) => move(s, 45, 0)), data['木']).faults).toEqual([{ stroke: 3, drawn: 3, why: 'place' }])
  })

  it("names a stroke in the wrong place even when it's paired with another", () => {
    expect(match(with_('か', 2, (s) => move(s, -50, 50)), data['か']).faults).toEqual([{ stroke: 2, drawn: 2, why: 'place' }])
  })

  it('names a stroke too long or too short', () => {
    expect(match(with_('日', 3, (s) => grow(s, 3)), data['日']).faults).toEqual([{ stroke: 3, drawn: 3, why: 'long' }])
    expect(match(with_('二', 1, (s) => grow(s, 0.3)), data['二']).faults).toEqual([{ stroke: 1, drawn: 1, why: 'short' }])
  })

  it('pairs the fault with the stroke the player drew, in any order', () => {
    const s = with_('木', 3, (s) => move(s, 45, 0))
    expect(match([s[3], s[0], s[1], s[2]], data['木']).faults).toEqual([{ stroke: 3, drawn: 0, why: 'place' }])
  })

  it('calls a drawing messy when most strokes are off', () => {
    expect(match(hand(data['書'], 5), data['書'])).toMatchObject({ ok: false, messy: true, faults: [] })
    const scribble = pts(data['う']).map((s, j) => s.map(([x, y], k): Pt => [x + Math.sin(j * 2 + k * 0.7) * 30, y + Math.cos(j * 3 + k) * 30]))
    expect(match(scribble, data['う'])).toMatchObject({ ok: false, messy: true, faults: [] })
  })
})

describe('judge', () => {
  it('takes either kana read the same way, and says which', () => {
    const v = judge(pts(data['ぢ']), { じ: data['じ'], ぢ: data['ぢ'] }, rivals('hiragana'))
    expect(v).toMatchObject({ ok: true, char: 'ぢ' })
  })
})
