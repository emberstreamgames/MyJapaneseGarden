// Static artwork for the garden: a lawn with a sunken bed of four tilled rows. Built once from a
// fixed seed so it looks the same on every visit. Plants, holes and status live in PlotTile,
// which places itself on SPOTS. Coordinates are in the 400x440 view (the lawn extends BLEED past it).

export const VIEW = { w: 400, h: 440 }
// Extra lawn drawn past each side of the view. The bed box stays VIEW-sized so plots and weeds keep
// their positions; the CSS lets the wider picture bleed out (offscreen on phones).
export const BLEED = 100

// The bed has four rows of 3, 2, 3 and 2 plots, so each plant stands between the two in front of it
// rather than behind one. That lets the rows sit close and the plants draw GROW times the size they
// had in the old 4x4 bed.
const ROWS = [3, 2, 3, 2]
export const GROW = 1.2
export const PLANT_SCALE = 0.9 * GROW // of the 100-unit plant sprite
const COL = 100, ROW_GAP = 80, FIRST_Y = 105
const ROW_Y = ROWS.map((_, r) => FIRST_Y + r * ROW_GAP)
// Ground point of each plot (row by row), where a plant's stem meets the soil.
export const SPOTS = ROWS.flatMap((n, r) => Array.from({ length: n }, (_, c) => ({ x: 200 + (c - (n - 1) / 2) * COL, y: ROW_Y[r] })))
// Size of one plot's box, and how far it reaches above its ground point.
export const CELL = { w: COL, h: 103, above: 79 }
// The tap pad over a plot's soil: an ellipse just below the ground point. Pads sit above every
// plant, so a tap on the soil picks that plot even where a plant from the row in front reaches up.
export const PAD = { rx: 42, ry: 17 * GROW, dy: 2 * GROW }
// The soil: a superellipse (n = 6) centred in the scene.
const BED = { cx: 200, cy: 222, rx: 166, ry: 182 }

type Rand = () => number
type Pt = [number, number]

const STONES = [[16, 140, 9], [384, 296, 10], [374, 316, 6], [62, 424, 8]]

// Ground points where decorations stand: the lawn's corners and the middle of each side, all inside
// VIEW so they show on phones.
export const DECOR_SPOTS = [{ x: 22, y: 70 }, { x: 378, y: 70 }, { x: 20, y: 236 }, { x: 380, y: 236 }, { x: 40, y: 434 }, { x: 360, y: 434 }]

// Ground points where weeds can grow: on the lawn, off the soil, and clear of every plot's plant
// (even empty ones, which may be planted later), the decoration spots, the stones and each other.
// Fixed, like the scene.
export const WEED_SPOTS = (() => {
  const r = rng(11)
  const out: { x: number; y: number }[] = []
  const offBed = (x: number, y: number) => ((x - BED.cx) / (BED.rx + 12)) ** 6 + ((y - BED.cy) / (BED.ry + 12)) ** 6 >= 1
  const clearOfPlants = (x: number, y: number) => SPOTS.every((s) => Math.abs(x - s.x) > 34 * GROW || y - 24 > s.y + 12 || y < s.y - 80 * GROW)
  for (let k = 0; k < 4000 && out.length < 18; k++) {
    const x = 14 + r() * 372, y = 26 + r() * 406
    if (!offBed(x, y) || !clearOfPlants(x, y)) continue
    if (STONES.some(([sx, sy]) => Math.hypot(x - sx, y - sy) < 20)) continue
    if (DECOR_SPOTS.some((d) => Math.abs(x - d.x) < 34 && y > d.y - 50 && y < d.y + 32)) continue
    if (out.some((p) => Math.hypot(x - p.x, y - p.y) < 30)) continue
    out.push({ x: Math.round(x), y: Math.round(y) })
  }
  return out
})()

// Lawn lanes the ants follow (bed units), entering and leaving past the edge of the scene, bleed
// included. They keep to the side and bottom strips: the top strip is under the first row's flowers.
// The side lanes stay inside VIEW so they show on phones, where the bleed is offscreen.
const L = -BLEED - 14, R = VIEW.w + BLEED + 14
export const ANT_LANES: [number, number][][] = [
  [[L, 421], [90, 415], [200, 425], [310, 417], [R, 422]],
  [[16, -14], [20, 110], [13, 230], [19, 350], [14, 454]],
  [[385, -14], [380, 120], [388, 240], [382, 360], [386, 454]],
  [[16, -14], [18, 200], [22, 370], [60, 418], [200, 424], [R, 419]],
  [[386, -14], [383, 220], [378, 380], [340, 420], [200, 426], [L, 420]],
]

// CSS box (percent of the bed) for a weed on `p`: 40 bed units square, so WeedSprite's 30-unit view
// draws a third larger than the bed, with its ground point at (50%, 83.3%) of the box.
export const weedBox = (p: { x: number; y: number }) =>
  `left:${(((p.x - 20) / VIEW.w) * 100).toFixed(3)}%;top:${(((p.y - 33.3) / VIEW.h) * 100).toFixed(3)}%;width:${((40 / VIEW.w) * 100).toFixed(3)}%;height:${((40 / VIEW.h) * 100).toFixed(3)}%`

// CSS box (percent of the bed) for a decoration on `p`: 52 bed units wide, drawing DecorSprite's
// 40x44 view with its ground point (20, 42) on the spot.
export const DECOR_SCALE = 1.3
export const decorBox = (p: { x: number; y: number }) =>
  `left:${(((p.x - 20 * DECOR_SCALE) / VIEW.w) * 100).toFixed(3)}%;top:${(((p.y - 42 * DECOR_SCALE) / VIEW.h) * 100).toFixed(3)}%;width:${((40 * DECOR_SCALE / VIEW.w) * 100).toFixed(3)}%;height:${((44 * DECOR_SCALE / VIEW.h) * 100).toFixed(3)}%`

function rng(seed: number): Rand {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pick = <T>(r: Rand, a: T[]) => a[Math.floor(r() * a.length)]
const f = (n: number) => Math.round(n * 10) / 10
const fp = (p: Pt) => `${f(p[0])} ${f(p[1])}`

// Superellipse (higher n = squarer) with a low-frequency wobble, as a smooth closed path.
function blob(r: Rand, cx: number, cy: number, rx: number, ry: number, n: number, wob: number) {
  const ph = [r() * 6.28, r() * 6.28, r() * 6.28]
  const p: Pt[] = []
  for (let i = 0; i < 72; i++) {
    const t = (i / 72) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t)
    const w = wob * (Math.sin(t * 3 + ph[0]) * 0.5 + Math.sin(t * 7 + ph[1]) * 0.3 + Math.sin(t * 13 + ph[2]) * 0.2)
    p.push([cx + rx * Math.sign(c) * Math.abs(c) ** (2 / n) + w * c, cy + ry * Math.sign(s) * Math.abs(s) ** (2 / n) + w * s])
  }
  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  let d = `M${fp(mid(p[p.length - 1], p[0]))}`
  for (let i = 0; i < p.length; i++) d += `Q${fp(p[i])} ${fp(mid(p[i], p[(i + 1) % p.length]))}`
  return d + 'Z'
}

function blade(x: number, y: number, len: number, lean: number, w: number, color: string) {
  return `<path d="M${f(x - w)} ${f(y)}Q${f(x + lean * 0.3)} ${f(y - len * 0.6)} ${f(x + lean)} ${f(y - len)}Q${f(x + lean * 0.3 + w * 0.4)} ${f(y - len * 0.5)} ${f(x + w)} ${f(y)}Z" fill="${color}"/>`
}

// Draw back to front so nearer blades overlap farther ones.
const byDepth = (items: [number, string][]) => items.sort((a, b) => a[0] - b[0]).map((b) => b[1]).join('')

function build() {
  const r = rng(7)
  const { cx: CX, cy: CY, rx: RX, ry: RY } = BED
  const inBed = (x: number, y: number, pad = 0) => ((x - CX) / (RX + pad)) ** 6 + ((y - CY) / (RY + pad)) ** 6 < 1
  const bed = blob(r, CX, CY, RX, RY, 6, 3)

  const X0 = -BLEED, W = VIEW.w + BLEED * 2
  let s = `<svg class="scene" viewBox="${X0} 0 ${W} ${VIEW.h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="bed-grass" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#6cbb4f"/><stop offset="1" stop-color="#4a973a"/></linearGradient>
    <radialGradient id="bed-soil" cx="0.45" cy="0.35" r="0.8"><stop offset="0" stop-color="#5a3b25"/><stop offset="1" stop-color="#3b2618"/></radialGradient>
    <linearGradient id="bed-mound" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a06f46"/><stop offset="0.45" stop-color="#7c5234"/><stop offset="1" stop-color="#553621"/></linearGradient>
    <linearGradient id="bed-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c120a" stop-opacity="0.95"/><stop offset="1" stop-color="#1c120a" stop-opacity="0"/></linearGradient>
    <radialGradient id="bed-light" cx="0.22" cy="0.08" r="1"><stop offset="0" stop-color="#fff6d8" stop-opacity="0.2"/><stop offset="0.55" stop-color="#fff6d8" stop-opacity="0"/><stop offset="1" stop-color="#0b1a08" stop-opacity="0.35"/></radialGradient>
    <radialGradient id="bed-glow"><stop offset="0" stop-color="#ffd76a" stop-opacity="0.9"/><stop offset="1" stop-color="#ffd76a" stop-opacity="0"/></radialGradient>
    <filter id="bed-blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5"/></filter>
    <clipPath id="bed-clip"><path d="${bed}"/></clipPath>
  </defs>
  <rect x="${X0}" width="${W}" height="${VIEW.h}" fill="url(#bed-grass)"/>`

  // Lawn: broad light/dark patches, then blades.
  for (let i = 0; i < 33; i++)
    s += `<ellipse cx="${f(X0 + r() * W)}" cy="${f(r() * 440)}" rx="${f(30 + r() * 50)}" ry="${f(14 + r() * 24)}" fill="${r() < 0.5 ? '#3c8230' : '#8ad065'}" opacity="0.2"/>`
  const greens = ['#3f8a32', '#4c9a3b', '#5aab45', '#6cbb4f', '#7fcb5e', '#93d86f']
  const blades: [number, string][] = []
  for (let i = 0; i < 2250; i++) {
    const x = X0 + r() * (W + 4) - 2, y = r() * 450
    if (!inBed(x, y, -6)) blades.push([y, blade(x, y, 4 + r() * 6, (r() - 0.5) * 6, 0.8 + r() * 0.7, pick(r, greens))])
  }
  s += byDepth(blades)

  // Clusters of tiny wildflowers and a few stones.
  const petals = ['#ffffff', '#fff3a8', '#ffd0e4', '#cfe0ff']
  for (let k = 0; k < 12; k++) {
    let cx: number, cy: number
    do {
      cx = X0 + 10 + r() * (W - 20)
      cy = 10 + r() * 420
    } while (inBed(cx, cy, 16))
    const col = pick(r, petals)
    for (let j = 0; j < 3 + r() * 4; j++) {
      const x = cx + (r() - 0.5) * 26, y = cy + (r() - 0.5) * 18
      if (inBed(x, y, 6)) continue
      for (let a = 0; a < 5; a++) {
        const t = a * 1.2566 + j
        s += `<circle cx="${f(x + Math.cos(t) * 1.7)}" cy="${f(y + Math.sin(t) * 1.7)}" r="1.4" fill="${col}"/>`
      }
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="1" fill="#f2b51c"/>`
    }
  }
  for (const [x, y, w] of STONES)
    s += `<ellipse cx="${x + 1}" cy="${y + 3}" rx="${w}" ry="${f(w * 0.6)}" fill="#1f3d16" opacity="0.45"/><ellipse cx="${x}" cy="${y}" rx="${w}" ry="${f(w * 0.62)}" fill="#a39f92"/><ellipse cx="${f(x - w * 0.3)}" cy="${f(y - w * 0.2)}" rx="${f(w * 0.45)}" ry="${f(w * 0.25)}" fill="#cbc8bc"/>`

  // The bed: cast shadow, soil, a dark band where the far wall faces us, and loose crumbs.
  s += `<path d="${bed}" fill="#1c3312" opacity="0.55" filter="url(#bed-blur)" transform="translate(0 4)"/>`
  s += `<path d="${bed}" fill="url(#bed-soil)"/><g clip-path="url(#bed-clip)"><rect x="0" y="34" width="400" height="32" fill="url(#bed-wall)"/>`
  for (let i = 0; i < 520; i++) {
    const x = CX - RX + r() * RX * 2, y = CY - RY + r() * RY * 2
    if (inBed(x, y)) s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(0.6 + r() * 1.4)}" ry="${f(0.5 + r())}" fill="${pick(r, ['#24170d', '#6e4a2f', '#80583a'])}" opacity="0.7"/>`
  }
  s += '</g>'

  // Turf lip: a dark edge plus blades leaning over the soil, denser along the near edge.
  s += `<path d="${bed}" fill="none" stroke="#3a7f2e" stroke-width="4"/>`
  const fringe: [number, string][] = []
  const edge = (u: number, k: number) => (1 - Math.abs(u) ** 6) ** (1 / 6) * k
  for (let k = 0; k < 330; k++) {
    const side = r()
    let x: number, y: number, lean: number
    if (side < 0.62) {
      const u = (r() * 2 - 1) * 0.97, top = side < 0.24
      x = CX + u * RX
      y = top ? CY - edge(u, RY) + 2 : CY + edge(u, RY) + 4
      lean = (r() - 0.5) * 6
    } else {
      const u = (r() * 2 - 1) * 0.95, left = side < 0.81
      y = CY + u * RY + 3
      x = left ? CX - edge(u, RX) - 2 + r() * 4 : CX + edge(u, RX) + 2 - r() * 4
      lean = (left ? -1 : 1) * r() * 4
    }
    fringe.push([y, blade(x, y, 6 + r() * 7, lean, 1 + r() * 0.8, pick(r, greens))])
  }
  s += byDepth(fringe)

  // A tilled row under each row of plots, with grooves and clods. Holes and plants come from PlotTile.
  for (const y of ROW_Y) {
    const y0 = y - 30 * GROW, cy = y - 1, ry = 28 * GROW
    s += `<path d="${blob(r, CX, cy + 7, 152, ry - 1, 7, 1.5)}" fill="#20140b" opacity="0.6"/>`
    s += `<path d="${blob(r, CX, cy, 150, ry, 7, 1.5)}" fill="url(#bed-mound)"/>`
    for (const [dy, op] of [[10, 0.55], [22, 0.3], [35, 0.3], [47, 0.4]]) {
      const gy = y0 + dy * GROW
      let d = `M${CX - 138} ${f(gy)}`
      for (let x = CX - 115; x <= CX + 138; x += 23) d += `Q${f(x - 11.5)} ${f(gy + (r() - 0.5) * 3)} ${x} ${f(gy + (r() - 0.5) * 1.5)}`
      s += `<path d="${d}" fill="none" stroke="${dy === 10 ? '#b6875c' : '#462c1a'}" stroke-width="${dy === 10 ? 2.2 : 1.2}" stroke-linecap="round" opacity="${op}"/>`
    }
    for (let k = 0; k < 48; k++) {
      const light = r() < 0.55, rr = 0.8 + r() * 2
      s += `<ellipse cx="${f(CX - 140 + r() * 280)}" cy="${f(y0 + (6 + r() * 46) * GROW)}" rx="${f(rr * 1.3)}" ry="${f(rr)}" fill="${light ? '#a87a50' : '#4a301d'}" opacity="${light ? 0.8 : 0.6}"/>`
    }
  }

  return s + `<rect x="${X0}" width="${W}" height="${VIEW.h}" fill="url(#bed-light)" pointer-events="none"/></svg>`
}

export const SCENE = build()
