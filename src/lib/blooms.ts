import { ART, HYDRANGEA_BLOOMS, LAVENDER_BUDS, type Layer } from './plants'
import type { Species } from './garden'

// Colour variants for open flowers. Each plot rolls one when planted (0 = the species' original colours), and it
// stays hidden until the plant blooms. Variants only repaint the shapes from plants.ts; they never change them.
// A "fill" is a colour or url(#…), or a list of them cycled per petal/bud/floret.

type Fill = string | string[]

interface Paint {
  fill: Fill
  over?: Fill // texture drawn on top of the fill (patterns with transparent backgrounds)
  stroke?: string
  sw?: number
}

interface Look {
  // Petal species: one per layer. Tulip: [main, light, shade]. Lavender: [buds]. Hydrangea: [florets].
  paints: (Paint | Fill)[]
  center?: string
  centerOver?: string
  sparkle?: string
  glow?: string // colour of a soft halo round the head
}

export interface Bloom {
  name: string
  look: (d: Defs) => Look
}

const pick = (f: Fill | undefined, i: number) => (Array.isArray(f) ? f[i % f.length] : f)
const asPaint = (p: Paint | Fill | undefined): Paint => (p && typeof p === 'object' && !Array.isArray(p) ? p : { fill: p ?? 'none' })

const PEARL = ['#ffe3f1', '#e0f7ff', '#efe3ff', '#fff6dc', '#ffe3f1']

// Collects <defs> for one sprite; ids carry the sprite's uid because every sprite shares the page's id space.
class Defs {
  out: string[] = []
  n = 0
  constructor(private uid: string) {}

  private add(body: (id: string) => string) {
    const id = `${this.uid}-${this.n++}`
    this.out.push(body(id))
    return `url(#${id})`
  }

  private stops(cs: string[]) {
    return cs.map((c, i) => `<stop offset="${cs.length === 1 ? 0 : i / (cs.length - 1)}" stop-color="${c}"/>`).join('')
  }

  // Tip to base on every petal (petals point "up" in their own space).
  lin(cs: string[]) {
    return this.add((id) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${this.stops(cs)}</linearGradient>`)
  }
  rad(cs: string[], cx = 0.4, cy = 0.35) {
    return this.add((id) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="0.75">${this.stops(cs)}</radialGradient>`)
  }
  metal(cs: string[]) {
    return this.add((id) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${this.stops(cs)}</linearGradient>`)
  }
  pearl() {
    return this.add((id) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0.6">${this.stops(PEARL)}</linearGradient>`)
  }
  // angle 0 runs along each petal (veins); 90 runs across it (bands).
  stripes(c: string, w = 1.2, gap = 2.6, angle = 0) {
    const s = w + gap
    return this.add((id) => `<pattern id="${id}" width="${s}" height="${s}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})"><rect width="${w}" height="${s}" fill="${c}"/></pattern>`)
  }
  dots(c: string, r = 1, gap = 4.5) {
    const a = gap / 4, b = (gap * 3) / 4
    return this.add((id) => `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse"><circle cx="${a}" cy="${a}" r="${r}" fill="${c}"/><circle cx="${b}" cy="${b}" r="${r}" fill="${c}"/></pattern>`)
  }
  stars(c = '#fff') {
    return this.add((id) => `<pattern id="${id}" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="2" r="0.35" fill="${c}"/><circle cx="6" cy="1" r="0.25" fill="${c}"/><circle cx="4" cy="6.5" r="0.3" fill="${c}"/><circle cx="8" cy="5" r="0.2" fill="${c}"/><path d="M6.5 6.5 L6.8 7.4 L7.7 7.7 L6.8 8 L6.5 8.9 L6.2 8 L5.3 7.7 L6.2 7.4Z" fill="${c}"/></pattern>`)
  }
  galaxy() {
    return this.rad(['#7b4bd6', '#3a1c71', '#141038'], 0.5, 0.3)
  }
  halo(c: string) {
    return this.add((id) => `<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="0" stdDeviation="1.8" flood-color="${c}" flood-opacity="0.9"/></filter>`)
  }
}

// Variant 0: the species' original colours from plants.ts.
function baseLook(s: Species): Look {
  const a = ART[s]
  if (a.custom === 'tulip') return { paints: ['#e8435a', '#f4677b', '#c92f48'] }
  if (a.custom === 'lavender') return { paints: [['#a98cf2', '#8e6ee8']] }
  if (a.custom === 'hydrangea') return { paints: [HYDRANGEA_BLOOMS.map((b) => b.c)] }
  return { paints: a.layers.map((l) => l.color), center: a.center?.color }
}

const SILVER = ['#6f7782', '#f4f7fa', '#a3abb5', '#ffffff', '#7f8792']
const ROSE_GOLD = ['#9c5a55', '#ffd6cc', '#c98476', '#ffe9e2', '#a8655d']

export const BLOOMS: Record<Species, Bloom[]> = {
  sakura: [
    { name: 'Snow Blush', look: (d) => ({ paints: [d.lin(['#ffffff', '#fff4f8', '#ffb3cc'])], center: '#ff4f87' }) },
  ],
  tulip: [
    { name: 'Sunny', look: () => ({ paints: ['#ffcc1f', '#ffe266', '#d18e00'] }) },
    { name: 'Queen of Night', look: () => ({ paints: ['#3a1f5c', '#5a3a8a', '#12061f'] }) },
    { name: 'Silver Frost', look: (d) => ({ paints: [d.metal(SILVER), '#ffffff99', '#4f5864'], sparkle: '#ffffff' }) },
    { name: 'Bubblegum Dots', look: (d) => ({ paints: [{ fill: '#ff6fa3', over: d.dots('#fff', 1.2, 5.5) }, '#ff9cc2', '#d6407a'] }) },
    { name: 'Sunset', look: (d) => ({ paints: [d.lin(['#ff3d6e', '#ff8a3d', '#ffd23f']), d.lin(['#ff7096', '#ffae6b', '#ffe480']), '#b8284e'] }) },
    { name: 'Rose Gold', look: (d) => ({ paints: [d.metal(ROSE_GOLD), '#ffe9e2aa', '#7a4440'], sparkle: '#fff0ea' }) },
  ],
  sunflower: [
    { name: 'Ring of Fire', look: (d) => ({ paints: [d.lin(['#ffd23f', '#ff8a00', '#b22222']), d.lin(['#ffe480', '#ffa040', '#cf3a2a'])], center: '#3a1e0c' }) },
    { name: 'Pinwheel', look: () => ({ paints: [['#ffb800', '#ff6b35'], ['#ffd23f', '#ff9a5c']], center: '#6b3f1d' }) },
  ],
  marigold: [
    { name: 'Lemon Drop', look: () => ({ paints: ['#ffd400', '#ffe866'], center: '#e0b000' }) },
    { name: 'Vanilla', look: () => ({ paints: ['#fff0c0', '#fffbe6'], center: '#f0d27a' }) },
    { name: 'Ruby', look: () => ({ paints: ['#c21f3a', '#e5486a'], center: '#7a0f22' }) },
    { name: 'Electric', look: () => ({ paints: ['#ff2bd6', '#ff8aec'], center: '#fffa65', glow: '#ff5ce6' }) },
    { name: 'Peach Fizz', look: (d) => ({ paints: [d.lin(['#ffd8c2', '#ff8a65']), d.lin(['#ffeee4', '#ffab91'])], center: '#ff7043' }) },
  ],
  lotus: [
    { name: 'Snow Lotus', look: (d) => ({ paints: [d.lin(['#ff8fb8', '#ffe1ec', '#ffffff']), d.lin(['#ffa3c6', '#fff0f5', '#ffffff']), d.lin(['#ffb8d2', '#ffffff'])] }) },
    { name: 'Blue Lotus', look: (d) => ({ paints: [d.lin(['#3d6bd6', '#8fb0f5']), d.lin(['#5a86e8', '#b6ccff']), d.lin(['#8fb0f5', '#e6eeff'])] }) },
    { name: 'Moonpearl', look: (d) => ({ paints: [{ fill: d.pearl(), stroke: '#ffffff', sw: 0.7 }], sparkle: '#ffffff' }) },
    { name: 'Crimson Flame', look: (d) => ({ paints: [d.lin(['#ffd23f', '#ff5a36', '#a0122e']), d.lin(['#ffe066', '#ff7043', '#c21f3a']), d.lin(['#fff0a0', '#ff8a5c'])] }) },
    { name: 'Nebula', look: (d) => ({ paints: [{ fill: d.galaxy(), over: d.stars(), stroke: '#c9a6ff', sw: 0.7 }], glow: '#9d6bff' }) },
    { name: 'Crystal', look: () => ({ paints: [{ fill: '#a8eaff55', stroke: '#ffffff', sw: 0.8 }, { fill: '#c8f2ff66', stroke: '#ffffff', sw: 0.8 }, { fill: '#e8fbff88', stroke: '#ffffff', sw: 0.8 }], sparkle: '#ffffff', glow: '#bff4ff' }) },
  ],
  iris: [
    { name: 'Snow Veil', look: (d) => ({ paints: [{ fill: '#ffffff', over: d.stripes('#7a5af0aa', 0.45, 1.6) }, '#efeafc'], center: '#ffc61a' }) },
    { name: 'Inkwork', look: (d) => ({ paints: [{ fill: '#c8b6ff', over: d.stripes('#3a1c8a', 0.55, 1.5) }, '#6a4ce0'], center: '#ffd23f' }) },
    { name: 'Sunset', look: (d) => ({ paints: [d.lin(['#ffb3c6', '#ff7a45']), d.lin(['#ff8fa3', '#c9184a'])], center: '#ffd23f' }) },
    { name: 'Black Velvet', look: () => ({ paints: [{ fill: '#2b1840', stroke: '#8a64c8', sw: 0.8 }, { fill: '#140a24', stroke: '#6a4c9c', sw: 0.8 }], center: '#ffd23f' }) },
  ],
  daisy: [
    { name: 'Gerbera', look: (d) => ({ paints: ['#e63946'], center: '#3b2a1b', centerOver: d.dots('#ffb703', 0.45, 2) }) },
    { name: 'Starry Night', look: (d) => ({ paints: [{ fill: '#1d2a5c', over: d.stars('#fff6c9'), stroke: '#9ab0ff', sw: 0.5 }], center: '#ffd23f', sparkle: '#fff6c9' }) },
  ],
  poppy: [
    { name: 'California', look: () => ({ paints: ['#ff7b00', '#ffa630'], center: '#3a2a0a' }) },
    { name: 'Black Blotch', look: (d) => ({ paints: [d.lin(['#d62839', '#d62839', '#c01f30', '#1a1a2e']), d.lin(['#ef476f', '#e03358', '#1a1a2e'])], center: '#0d0d18' }) },
    { name: 'Iceland', look: () => ({ paints: ['#ffe14d', '#fff3a3'], center: '#6a8a1f' }) },
  ],
  lavender: [
    { name: 'White', look: () => ({ paints: [['#f4f0ff', '#ffffff']] }) },
    { name: 'Pink', look: () => ({ paints: [['#ff8fc7', '#ffb3d9']] }) },
    // One colour per bud in LAVENDER_BUDS order, pale at the top.
    { name: 'Dusk Ombre', look: () => ({ paints: [['#efe6ff', '#d9c8ff', '#d9c8ff', '#b79cff', '#b79cff', '#9370f0', '#9370f0', '#6a3fd0', '#6a3fd0', '#5a2ea6']] }) },
  ],
  hydrangea: [
    { name: 'Limelight', look: () => ({ paints: [['#f1f7e6', '#e3f0cf', '#ffffff', '#d6eabb']] }) },
    // One colour per floret in HYDRANGEA_BLOOMS order, blue at the top.
    { name: 'Sky Ombre', look: () => ({ paints: [['#8fd0ff', '#9fb8ff', '#9fb8ff', '#b39cff', '#b39cff', '#a8b0ff', '#c08cf5', '#c08cf5', '#a46be8']] }) },
    { name: 'Galaxy', look: (d) => ({ paints: [{ fill: d.galaxy(), over: d.stars() }], glow: '#9d6bff' }) },
  ],
}

// Variant ids run 0 (original) to BLOOMS[s].length, each equally likely. `r` is a random number in [0, 1).
export const rollVariant = (s: Species, r: number) => Math.min(BLOOMS[s].length, Math.floor(r * (BLOOMS[s].length + 1)))
export const bloomName = (s: Species, v: number) => BLOOMS[s][v - 1]?.name ?? ''

const ang = (l: Layer, k: number) => l.rot + (k * 360) / l.n

function petal(l: Layer, k: number, fill: string, stroke = l.shape === 'point' ? '#0002' : 'none', sw = 0.6) {
  const t = `transform="rotate(${ang(l, k)})"`
  const st = stroke === 'none' ? '' : `stroke="${stroke}" stroke-width="${sw}"`
  if (l.shape === 'oval') return `<ellipse cx="0" cy="${-(l.off ?? 10)}" rx="${l.rx}" ry="${l.ry}" fill="${fill}" ${st} ${t}/>`
  const w = l.w ?? 0, h = l.h ?? 20
  return `<path d="M0 0 C${w} ${-h * 0.3} ${w} ${-h * 0.7} 0 ${-h} C${-w} ${-h * 0.7} ${-w} ${-h * 0.3} 0 0Z" fill="${fill}" ${st} ${t}/>`
}

function sparkles(c: string, tall: boolean) {
  const star = (x: number, y: number, s: number) =>
    `<path d="M0 -3 L0.7 -0.7 L3 0 L0.7 0.7 L0 3 L-0.7 0.7 L-3 0 L-0.7 -0.7Z" fill="${c}" transform="translate(${x} ${y}) scale(${s})"/>`
  // The lavender spike rises above the head centre, so its sparkles sit higher and closer in.
  const at = tall ? [[-11, -22, 0.8], [10, -12, 0.65], [-9, 2, 0.5], [9, 4, 0.45]] : [[-17, -16, 0.9], [17, -8, 0.7], [12, 15, 0.55], [-14, 10, 0.45]]
  return `<g class="twinkle">${at.map(([x, y, s]) => star(x, y, s)).join('')}</g>`
}

function head(s: Species, look: Look) {
  const a = ART[s]
  const ps = look.paints.map(asPaint)
  let g = ''

  if (a.custom === 'tulip') {
    const [m, lt, sh] = [ps[0], ps[1] ?? ps[0], ps[2] ?? ps[0]]
    const main = 'M-12 -2 C-13 14 13 14 12 -2 L7 -14 L0 -6 L-7 -14 Z'
    const light = 'M0 -6 L-7 -14 L-12 -2 C-12 8 -4 13 0 13Z'
    const shade = 'M-3 12 Q0 -2 3 -12 L7 -14 L12 -2 C12 8 5 13 3 12Z'
    const st = m.stroke ? `stroke="${m.stroke}" stroke-width="${m.sw ?? 1}" stroke-linejoin="round"` : ''
    g += `<path d="${main}" fill="${pick(m.fill, 0)}" ${st}/>`
    if (m.over) g += `<path d="${main}" fill="${pick(m.over, 0)}"/>`
    g += `<path d="${light}" fill="${pick(lt.fill, 0)}"/>`
    if (lt.over ?? m.over) g += `<path d="${light}" fill="${pick(lt.over ?? m.over, 0)}"/>`
    g += `<path d="${shade}" fill="${pick(sh.fill, 0)}" opacity="0.55"/>`
  } else if (a.custom === 'lavender') {
    const p = ps[0]
    LAVENDER_BUDS.forEach(([x, y], i) => {
      const e = (f: string, extra = '') => `<ellipse cx="${x}" cy="${y + 2}" rx="3.2" ry="4.2" fill="${f}" ${extra}/>`
      g += e(pick(p.fill, i)!, p.stroke ? `stroke="${p.stroke}" stroke-width="${p.sw ?? 0.6}"` : '')
      if (p.over) g += e(pick(p.over, i)!)
    })
  } else if (a.custom === 'hydrangea') {
    const p = ps[0]
    HYDRANGEA_BLOOMS.forEach((b, i) => {
      const st = p.stroke ? `stroke="${p.stroke}" stroke-width="${p.sw ?? 0.6}"` : ''
      g += `<circle cx="${b.x}" cy="${b.y}" r="${b.r}" fill="${pick(p.fill, i)}" ${st}/>`
      if (p.over) g += `<circle cx="${b.x}" cy="${b.y}" r="${b.r}" fill="${pick(p.over, i)}"/>`
      g += `<circle cx="${b.x - b.r * 0.25}" cy="${b.y - b.r * 0.25}" r="${b.r * 0.35}" fill="#fff" opacity="0.35"/>`
    })
  } else {
    a.layers.forEach((l, li) => {
      const p = ps[li] ?? ps[ps.length - 1]
      for (let k = 0; k < l.n; k++) {
        g += petal(l, k, pick(p.fill, k)!, p.stroke, p.sw)
        if (p.over) g += petal(l, k, pick(p.over, k)!, 'none')
      }
    })
    const c = look.center ?? a.center?.color
    if (a.center && c) {
      const r = a.center.r
      g += `<circle r="${r}" fill="${c}"/>`
      if (look.centerOver) g += `<circle r="${r}" fill="${look.centerOver}"/>`
      g += `<circle cx="${-r * 0.3}" cy="${-r * 0.3}" r="${r * 0.3}" fill="#fff" opacity="0.2"/>`
    }
  }
  return g
}

// SVG markup for an open flower head centred on (0, 0). `uid` must be unique among sprites on the page.
export function bloomMarkup(s: Species, variant: number, uid: string) {
  const d = new Defs(uid)
  const b = BLOOMS[s][variant - 1]
  const look = b ? b.look(d) : baseLook(s)
  const glow = look.glow ? `filter="${d.halo(look.glow)}"` : ''
  return `<defs>${d.out.join('')}</defs><g ${glow}>${head(s, look)}</g>${look.sparkle ? sparkles(look.sparkle, s === 'lavender') : ''}`
}

let uids = 0
export const nextUid = () => `bl${uids++}`
