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
export const STROKE_MAX = 0.19 // the worst single stroke
export const MEAN_MAX = 0.11 // all strokes on average

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
  return { ...base, ok: false, reason: 'shape', costs: inOrder, score: mean(costs) }
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
