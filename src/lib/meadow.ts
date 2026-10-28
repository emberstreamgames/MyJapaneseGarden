// Static artwork for the garden: a lawn with a sunken bed of four tilled rows. Built once from a
// fixed seed so it looks the same on every visit. Plants, holes and status live in PlotTile,
// which places itself on SPOTS. Coordinates are in the 400x440 viewBox.

export const VIEW = { w: 400, h: 440 }

// Ground point of each plot (row-major, 4 per row), where a plant's stem meets the soil.
export const SPOTS = Array.from({ length: 16 }, (_, i) => ({ x: 87.5 + (i % 4) * 75, y: 90 + Math.floor(i / 4) * 84 }))
// Size of one plot's box, and how far it reaches above its ground point.
export const CELL = { w: 75, h: 84, above: 66 }
// The soil: a superellipse (n = 6) centred in the scene.
const BED = { cx: 200, cy: 222, rx: 166, ry: 182 }
// The drawn outline wobbles by up to 3 units, so taps stop a little inside it.
const inSoil = (x: number, y: number) => ((x - BED.cx) / (BED.rx - 5)) ** 6 + ((y - BED.cy) / (BED.ry - 5)) ** 6 < 1

// CSS clip-path that trims plot i's box to the soil, so taps on the lawn don't count. Both shapes
// are convex, so a ray from the box centre stays inside until it leaves: binary-search where.
export function hitClip(i: number) {
  const s = SPOTS[i], hw = CELL.w / 2, hh = CELL.h / 2
  const cx = s.x, cy = s.y - CELL.above + hh
  const corners = [Math.atan2(hh, hw), Math.atan2(hh, -hw), Math.atan2(-hh, -hw), Math.atan2(-hh, hw)]
  const angles = Array.from({ length: 48 }, (_, k) => (k / 48) * 2 * Math.PI - Math.PI).concat(corners).sort((a, b) => a - b)
  const pts = angles.map((a) => {
    const dx = Math.cos(a), dy = Math.sin(a)
    let lo = 0, hi = Math.min(Math.abs(dx) > 1e-9 ? hw / Math.abs(dx) : Infinity, Math.abs(dy) > 1e-9 ? hh / Math.abs(dy) : Infinity)
    if (inSoil(cx + dx * hi, cy + dy * hi)) lo = hi
    else
      for (let k = 0; k < 20; k++) {
        const m = (lo + hi) / 2
        if (inSoil(cx + dx * m, cy + dy * m)) lo = m
        else hi = m
      }
    return `${(((dx * lo + hw) / CELL.w) * 100).toFixed(2)}% ${(((dy * lo + hh) / CELL.h) * 100).toFixed(2)}%`
  })
  return `polygon(${pts.join(',')})`
}

type Rand = () => number
type Pt = [number, number]

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

  let s = `<svg class="scene" viewBox="0 0 ${VIEW.w} ${VIEW.h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
  <rect width="${VIEW.w}" height="${VIEW.h}" fill="url(#bed-grass)"/>`

  // Lawn: broad light/dark patches, then blades.
  for (let i = 0; i < 22; i++)
    s += `<ellipse cx="${f(r() * 400)}" cy="${f(r() * 440)}" rx="${f(30 + r() * 50)}" ry="${f(14 + r() * 24)}" fill="${r() < 0.5 ? '#3c8230' : '#8ad065'}" opacity="0.2"/>`
  const greens = ['#3f8a32', '#4c9a3b', '#5aab45', '#6cbb4f', '#7fcb5e', '#93d86f']
  const blades: [number, string][] = []
  for (let i = 0; i < 1500; i++) {
    const x = r() * 404 - 2, y = r() * 450
    if (!inBed(x, y, -6)) blades.push([y, blade(x, y, 4 + r() * 6, (r() - 0.5) * 6, 0.8 + r() * 0.7, pick(r, greens))])
  }
  s += byDepth(blades)

  // Clusters of tiny wildflowers and a few stones.
  const petals = ['#ffffff', '#fff3a8', '#ffd0e4', '#cfe0ff']
  for (let k = 0; k < 8; k++) {
    let cx: number, cy: number
    do {
      cx = 10 + r() * 380
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
  for (const [x, y, w] of [[16, 140, 9], [384, 296, 10], [374, 316, 6], [62, 424, 8]])
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

  // Four tilled rows with grooves and clods. Holes and plants come from PlotTile.
  for (let i = 0; i < 4; i++) {
    const y0 = SPOTS[i * 4].y - 30, cy = y0 + 29
    s += `<path d="${blob(r, CX, cy + 7, 152, 27, 7, 1.5)}" fill="#20140b" opacity="0.6"/>`
    s += `<path d="${blob(r, CX, cy, 150, 28, 7, 1.5)}" fill="url(#bed-mound)"/>`
    for (const [dy, op] of [[10, 0.55], [22, 0.3], [35, 0.3], [47, 0.4]]) {
      let d = `M${CX - 138} ${y0 + dy}`
      for (let x = CX - 115; x <= CX + 138; x += 23) d += `Q${f(x - 11.5)} ${f(y0 + dy + (r() - 0.5) * 3)} ${x} ${f(y0 + dy + (r() - 0.5) * 1.5)}`
      s += `<path d="${d}" fill="none" stroke="${dy === 10 ? '#b6875c' : '#462c1a'}" stroke-width="${dy === 10 ? 2.2 : 1.2}" stroke-linecap="round" opacity="${op}"/>`
    }
    for (let k = 0; k < 48; k++) {
      const light = r() < 0.55, rr = 0.8 + r() * 2
      s += `<ellipse cx="${f(CX - 140 + r() * 280)}" cy="${f(y0 + 6 + r() * 46)}" rx="${f(rr * 1.3)}" ry="${f(rr)}" fill="${light ? '#a87a50' : '#4a301d'}" opacity="${light ? 0.8 : 0.6}"/>`
    }
  }

  return s + `<rect width="${VIEW.w}" height="${VIEW.h}" fill="url(#bed-light)" pointer-events="none"/></svg>`
}

export const SCENE = build()
