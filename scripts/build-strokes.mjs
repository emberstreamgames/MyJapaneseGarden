// Builds src/data/strokes.json from KanjiVG (https://kanjivg.tagaini.net, CC BY-SA 3.0).
// Usage: node scripts/build-strokes.mjs <path to the unzipped kanjivg "kanji" folder>
// Download kanjivg-<date>-main.zip from https://github.com/KanjiVG/kanjivg/releases.
// The output is a derived work of KanjiVG, so it stays CC BY-SA 3.0 (credited in Stats).
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir || !existsSync(dir)) {
  console.error('Usage: node scripts/build-strokes.mjs <kanjivg kanji folder>')
  process.exit(1)
}

// Points kept per stroke for matching. The display uses KanjiVG's own path.
const POINTS = 16

// Every single kana the decks use (combos like きゃ aren't drawn), and every kanji in kanji.ts.
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => String.fromCharCode(a + i))
const small = new Set([...'ぁぃぅぇぉっゃゅょゎゕゖ'])
const hira = range(0x3041, 0x3093).filter((c) => !small.has(c))
const kata = hira.map((c) => String.fromCharCode(c.charCodeAt(0) + 0x60))
const kanjiSrc = readFileSync(new URL('../src/data/kanji.ts', import.meta.url), 'utf8')
const kanji = [...kanjiSrc.matchAll(/\['([一-鿿])',/g)].map((m) => m[1])
const chars = [...new Set([...hira, ...kata, ...kanji])]

// A tiny SVG path reader: KanjiVG strokes use only M, C, S and L (absolute or relative).
function flatten(d) {
  const out = []
  let x = 0, y = 0, cx = 0, cy = 0, prev = ''
  const cubic = (x1, y1, x2, y2, x3, y3) => {
    for (let t = 1; t <= 12; t++) {
      const s = t / 12, u = 1 - s
      out.push([u * u * u * x + 3 * u * u * s * x1 + 3 * u * s * s * x2 + s * s * s * x3, u * u * u * y + 3 * u * u * s * y1 + 3 * u * s * s * y2 + s * s * s * y3])
    }
    cx = x2; cy = y2; x = x3; y = y3
  }
  for (const [, cmd, args] of d.matchAll(/([MmCcSsLlZz])([^MmCcSsLlZz]*)/g)) {
    const n = (args.match(/-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/gi) ?? []).map(Number)
    const rel = cmd === cmd.toLowerCase()
    const C = cmd.toUpperCase()
    if (C === 'M') { x = n[0] + (rel ? x : 0); y = n[1] + (rel ? y : 0); out.push([x, y]); cx = x; cy = y }
    else if (C === 'L') for (let i = 0; i + 1 < n.length; i += 2) { x = n[i] + (rel ? x : 0); y = n[i + 1] + (rel ? y : 0); out.push([x, y]); cx = x; cy = y }
    else if (C === 'C') for (let i = 0; i + 5 < n.length; i += 6) { const ox = rel ? x : 0, oy = rel ? y : 0; cubic(n[i] + ox, n[i + 1] + oy, n[i + 2] + ox, n[i + 3] + oy, n[i + 4] + ox, n[i + 5] + oy) }
    else if (C === 'S') for (let i = 0; i + 3 < n.length; i += 4) {
      const ox = rel ? x : 0, oy = rel ? y : 0
      const smooth = /[CcSs]/.test(prev)
      cubic(smooth ? 2 * x - cx : x, smooth ? 2 * y - cy : y, n[i] + ox, n[i + 1] + oy, n[i + 2] + ox, n[i + 3] + oy)
      prev = 'S'
    }
    prev = cmd
  }
  return out
}

// Evenly spaced along the stroke, so a slow curve and a quick flick compare fairly.
function resample(pts, count) {
  const lens = [0]
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  const total = lens[lens.length - 1]
  const out = []
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

const data = {}
const missing = []
for (const ch of chars) {
  const file = join(dir, ch.codePointAt(0).toString(16).padStart(5, '0') + '.svg')
  if (!existsSync(file)) { missing.push(ch); continue }
  const svg = readFileSync(file, 'utf8')
  // Stroke paths are numbered -s1, -s2... in drawing order.
  const strokes = [...svg.matchAll(/<path id="kvg:[0-9a-f]+-s(\d+)"[^>]*\sd="([^"]+)"/g)]
    .map((m) => ({ n: Number(m[1]), d: m[2] }))
    .sort((a, b) => a.n - b.n)
  data[ch] = {
    d: strokes.map((s) => s.d),
    p: strokes.map((s) => resample(flatten(s.d), POINTS).flatMap(([px, py]) => [Math.round(px), Math.round(py)])),
  }
}

writeFileSync(new URL('../src/data/strokes.json', import.meta.url), JSON.stringify(data))
console.log(`${Object.keys(data).length} characters written.${missing.length ? ` Missing: ${missing.join(' ')}` : ''}`)
