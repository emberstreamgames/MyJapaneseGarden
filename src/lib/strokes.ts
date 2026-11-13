// Pure rules for drawn-character questions: does a drawing match a known character's strokes?
// This is verification, not recognition: the quiz already knows which character it wants.
// Stroke data comes from KanjiVG (scripts/build-strokes.mjs), in its 109-unit box.

export type Pt = [number, number]

// One character: KanjiVG's path for each stroke (for display) and 16 evenly spaced points (for matching).
export interface CharStrokes {
  d: string[]
  p: number[][] // [x0, y0, x1, y1, ...] per stroke
}

export const BOX = 109 // KanjiVG's viewBox
const POINTS = 16

// Thresholds in units of the character's size, after both are scaled to the same box.
// Tuned in strokes.test.ts against jittered drawings and look-alike characters (め/ぬ, ソ/ン, シ/ツ...).
// Kept loose for real, wobbly hands: judge's check against the rest of the deck is what tells
// look-alikes apart, so these only need to turn away scribbles.
export const STROKE_MAX = 0.3 // the worst single stroke
export const MEAN_MAX = 0.16 // all strokes on average

// Why one stroke failed, so the card can say more than "wrong".
export type Why = 'backwards' | 'place' | 'long' | 'short' | 'shape'
export interface Fault {
  stroke: number // the reference stroke (its number in the replay, from 0)
  drawn: number // the player's stroke paired with it
  why: Why
}

export interface Verdict {
  ok: boolean
  order: boolean // the right strokes, drawn in the wrong order (still counts as right)
  reason?: 'count' | 'shape' | 'like'
  char?: string // the accepted character it was judged against (from judge)
  like?: string // the look-alike it was closer to (reason 'like')
  score: number // mean stroke cost of the best pairing: lower is closer
  drawn: number
  want: number
  costs: number[] // per reference stroke, for the dev page
  faults?: Fault[] // reason 'shape': the strokes that failed, worst first
  messy?: boolean // reason 'shape': no stroke stands out, the whole drawing is just too far off
}

const toPts = (flat: number[]): Pt[] => Array.from({ length: flat.length / 2 }, (_, i) => [flat[2 * i], flat[2 * i + 1]])

// Evenly spaced along the stroke, so a slow curve and a quick flick compare fairly.
export function resample(pts: Pt[], count = POINTS): Pt[] {
  if (pts.length === 0) return []
  if (pts.length === 1) return Array.from({ length: count }, () => [pts[0][0], pts[0][1]])
  const lens = [0]
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  const total = lens[lens.length - 1]
  const out: Pt[] = []
  let j = 1
  for (let k = 0; k < count; k++) {
    const at = (total * k) / (count - 1)
    while (j < pts.length - 1 && lens[j] < at) j++
    const span = lens[j] - lens[j - 1] || 1
    const t = Math.min(1, Math.max(0, (at - lens[j - 1]) / span))
    out.push([pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * t, pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * t])
  }
  return out
}

// Centre on the bounding box and scale its longer side to 1, so a small or off-centre drawing still
// compares fairly. One scale for both axes: squashing 一 to a square would make it anything.
function normalize(strokes: Pt[][]): Pt[][] {
  const all = strokes.flat()
  const xs = all.map((p) => p[0])
  const ys = all.map((p) => p[1])
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const size = Math.max(x1 - x0, y1 - y0) || 1
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  return strokes.map((s) => s.map(([x, y]) => [(x - cx) / size, (y - cy) / size]))
}

// Mean distance between matching points. Direction counts: ソ and ン differ mostly in which way a
// stroke goes, so a stroke drawn backwards is a different stroke.
function cost(a: Pt[], b: Pt[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += Math.hypot(a[i][0] - b[i][0], a[i][1] - b[i][1])
  return sum / a.length
}

// The cheapest one-to-one pairing of drawn strokes to reference strokes (Hungarian algorithm).
// Returns, for each reference stroke, the drawn stroke paired with it.
function assign(c: number[][]): number[] {
  const n = c.length
  const u = new Array(n + 1).fill(0)
  const v = new Array(n + 1).fill(0)
  const p = new Array(n + 1).fill(0) // p[j] = row matched to column j
  const way = new Array(n + 1).fill(0)
  for (let i = 1; i <= n; i++) {
    p[0] = i
    let j0 = 0
    const minv = new Array(n + 1).fill(Infinity)
    const used = new Array(n + 1).fill(false)
    do {
      used[j0] = true
      const i0 = p[j0]
      let delta = Infinity
      let j1 = 0
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue
        const cur = c[i0 - 1][j - 1] - u[i0] - v[j]
        if (cur < minv[j]) {
          minv[j] = cur
          way[j] = j0
        }
        if (minv[j] < delta) {
          delta = minv[j]
          j1 = j
        }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta
          v[j] -= delta
        } else minv[j] -= delta
      }
      j0 = j1
    } while (p[j0] !== 0)
    do {
      const j1 = way[j0]
      p[j0] = p[j1]
      j0 = j1
    } while (j0)
  }
  // rows are reference strokes, columns drawn strokes
  const forRef = new Array(n).fill(0)
  for (let j = 1; j <= n; j++) forRef[p[j] - 1] = j - 1
  return forRef
}

const passes = (costs: number[]) => Math.max(...costs) <= STROKE_MAX && costs.reduce((a, b) => a + b, 0) / costs.length <= MEAN_MAX

// Check a drawing (strokes of points, any coordinate space) against one character.
export function match(drawn: Pt[][], ref: CharStrokes): Verdict {
  const want = ref.p.length
  const base = { drawn: drawn.length, want, order: false }
  if (drawn.length !== want) return { ...base, ok: false, reason: 'count', costs: [], score: Infinity }
  const d = normalize(drawn.map((s) => resample(s)))
  const r = normalize(ref.p.map(toPts))
  const inOrder = r.map((s, i) => cost(d[i], s))
  if (passes(inOrder)) return { ...base, ok: true, costs: inOrder, score: mean(inOrder) }
  const matrix = r.map((s) => d.map((t) => cost(t, s)))
  const pick = assign(matrix)
  const costs = pick.map((j, i) => matrix[i][j])
  if (passes(costs)) return { ...base, ok: true, order: pick.some((j, i) => j !== i), costs, score: mean(costs) }
  return { ...base, ok: false, reason: 'shape', costs: inOrder, score: mean(costs), ...explain(d, r, pick) }
}

const centroid = (s: Pt[]): Pt => [mean(s.map((p) => p[0])), mean(s.map((p) => p[1]))]
const shift = (s: Pt[], [x, y]: Pt): Pt[] => s.map((p) => [p[0] - x, p[1] - y])
const length = (s: Pt[]) => s.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - s[i][0], p[1] - s[i][1]), 0)
const FIXED = STROKE_MAX * 0.6 // close enough, once the one thing wrong with a stroke is undone

// The scale and shift that best lay the drawn strokes over the reference (least squares), using only
// the strokes in `use`. One stroke in the wrong place shouldn't drag the others off with it.
function fit(d: Pt[][], r: Pt[][], use: number[]): (s: Pt[]) => Pt[] {
  const P = use.flatMap((i) => d[i])
  const Q = use.flatMap((i) => r[i])
  const [pc, qc] = [centroid(P), centroid(Q)]
  let num = 0
  let den = 0
  P.forEach((p, k) => {
    num += (p[0] - pc[0]) * (Q[k][0] - qc[0]) + (p[1] - pc[1]) * (Q[k][1] - qc[1])
    den += (p[0] - pc[0]) ** 2 + (p[1] - pc[1]) ** 2
  })
  // Both sides are already normalized, so the scale stays near 1. Unbounded, it could shrink a
  // scribble to a speck that "fits" any short stroke.
  const k = den > 1e-9 && num > 0 ? Math.min(4, Math.max(0.5, num / den)) : 1
  return (s) => s.map(([x, y]) => [(x - pc[0]) * k + qc[0], (y - pc[1]) * k + qc[1]])
}

// Try both the order the player drew in and the cheapest pairing: a stroke far out of place can
// pull the pairing askew (か's dot paired with its long stroke), and then nothing would fit.
function explain(d: Pt[][], r: Pt[][], pick: number[]): { faults: Fault[]; messy: boolean } {
  const drawnOrder = diagnose(d, r, r.map((_, i) => i))
  if (pick.every((j, i) => j === i)) return drawnOrder
  const paired = diagnose(d, r, pick)
  const rank = (x: { faults: Fault[]; messy: boolean }) => (x.messy ? Infinity : x.faults.length)
  return rank(paired) < rank(drawnOrder) ? paired : drawnOrder
}

// Name the strokes that spoil a drawing. Each round leaves out the stroke whose absence lets the rest
// fit best, until the rest fit; needing to leave out more than a couple reads as messy.
function diagnose(d: Pt[][], r: Pt[][], pick: number[]): { faults: Fault[]; messy: boolean } {
  const n = r.length
  if (n < 2) return single(d[0], r[0])
  const mine = r.map((_, i) => d[pick[i]]) // drawn strokes in reference order
  const limit = Math.max(1, Math.min(2, Math.floor(n / 2)))
  const costsWith = (out: number[]) => {
    const keep = r.map((_, i) => i).filter((i) => !out.includes(i))
    const f = fit(mine, r, keep)
    return { f, costs: r.map((s, i) => cost(f(mine[i]), s)) }
  }
  // The rest fit when they're clearly closer than the limits that failed the drawing.
  const fits = (costs: number[], out: number[]) => {
    const rest = costs.filter((_, i) => !out.includes(i))
    return mean(rest) <= MEAN_MAX * 0.6 && Math.max(...rest) <= STROKE_MAX * 0.7
  }
  let out: number[] = []
  let cur = costsWith(out)
  while (!fits(cur.costs, out)) {
    if (out.length >= limit) return { faults: [], messy: true }
    const tries = r
      .map((_, i) => i)
      .filter((i) => !out.includes(i))
      .map((i) => ({ i, t: costsWith([...out, i]) }))
      .map((x) => ({ ...x, rest: mean(x.t.costs.filter((_, j) => j !== x.i && !out.includes(j))) }))
    // On a near tie (二: either stroke alone fits itself), blame the one that fits worse with all in.
    const near = (a: number, b: number) => Math.abs(a - b) < 0.01
    const best = tries.reduce((a, b) => (near(a.rest, b.rest) ? (cur.costs[b.i] > cur.costs[a.i] ? b : a) : b.rest < a.rest ? b : a))
    out = [...out, best.i]
    cur = best.t
  }
  // A stroke only takes the blame if it's clearly off once the rest are laid over the reference.
  if (!out.length || out.some((i) => cur.costs[i] <= FIXED)) return { faults: [], messy: true }
  const faults = out
    .map((i) => ({ i, c: cur.costs[i] }))
    .sort((a, b) => b.c - a.c)
    .map(({ i }): Fault => ({ stroke: i, drawn: pick[i], why: name(cur.f(mine[i]), r[i]) }))
  return { faults, messy: false }
}

// A one-stroke character (し, 一) has nothing to line it up against: judge it as normalized.
function single(t: Pt[], s: Pt[]): { faults: Fault[]; messy: boolean } {
  return { faults: [{ stroke: 0, drawn: 0, why: name(t, s) }], messy: false }
}

// What one undone thing makes the stroke fit: its direction, its place, or its length.
function name(t: Pt[], s: Pt[]): Why {
  if (cost([...t].reverse(), s) <= FIXED) return 'backwards'
  const ct = shift(t, centroid(t))
  const cs = shift(s, centroid(s))
  if (cost(ct, cs) <= FIXED) return 'place'
  const lt = length(t) || 1
  const ls = length(s) || 1
  if (cost(ct.map(([x, y]): Pt => [(x * ls) / lt, (y * ls) / lt]), cs) <= FIXED) return lt > ls ? 'long' : 'short'
  return 'shape'
}

const mean = (c: number[]) => c.reduce((a, b) => a + b, 0) / c.length

// Judge a drawing against the accepted characters (じ or ぢ for "ji"), keeping the best verdict.
// `rivals` are the deck's other characters: れ and わ are close enough to pass each other's
// thresholds, so a drawing that's closer to a rival than to every accepted character is wrong.
export function judge(drawn: Pt[][], accepted: Record<string, CharStrokes>, rivals: Record<string, CharStrokes> = {}): Verdict {
  const rank = (v: Verdict) => (v.ok ? (v.order ? 1 : 2) : v.reason === 'shape' ? 0 : -1)
  const best = Object.entries(accepted)
    .map(([char, r]) => ({ ...match(drawn, r), char }))
    .reduce((a, v) => (rank(v) > rank(a) || (rank(v) === rank(a) && v.score < a.score) ? v : a))
  if (!best.ok) return best
  for (const [ch, r] of Object.entries(rivals)) {
    if (ch in accepted || r.p.length !== drawn.length) continue
    const v = match(drawn, r)
    if (v.ok && v.score < best.score) return { ...best, ok: false, order: false, reason: 'like', like: ch }
  }
  return best
}

// The stroke data is ~60 KB gzipped, so it loads only once a drawing question might come up.
let data: Record<string, CharStrokes> | null = null
let loading: Promise<Record<string, CharStrokes>> | null = null
export function loadStrokes(): Promise<Record<string, CharStrokes>> {
  // Offline before it was ever cached: no drawing questions for now, and the next quiz tries again.
  loading ??= import('../data/strokes.json')
    .then((m) => (data = m.default as Record<string, CharStrokes>))
    .catch(() => {
      loading = null
      return {}
    })
  return loading
}
export const strokesFor = (ch: string): CharStrokes | undefined => data?.[ch]
export const strokesReady = () => data !== null
