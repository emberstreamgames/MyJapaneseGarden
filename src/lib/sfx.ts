let ctx: AudioContext | null = null

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.12) {
  if (!ctx) return
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.value = freq
  const t = ctx.currentTime + start
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(ctx.destination)
  o.start(t)
  o.stop(t + dur)
}

function ready(): boolean {
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return true
  } catch {
    return false
  }
}

// Rising pitch with combo so streaks feel good.
export function good(combo: number) {
  if (!ready()) return
  const base = 523 * Math.pow(1.06, Math.min(combo, 12))
  tone(base, 0, 0.12, 'triangle')
  tone(base * 1.5, 0.07, 0.18, 'triangle')
}

export function bad() {
  if (!ready()) return
  tone(180, 0, 0.18, 'sawtooth', 0.08)
  tone(140, 0.1, 0.22, 'sawtooth', 0.08)
}

export function levelUp() {
  if (!ready()) return
  ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.2, 'square', 0.07))
}

// Garden cues. Callers check the mute setting first, like the quiz does.

// Soft falling droplets.
export function water() {
  if (!ready()) return
  ;[880, 740, 990, 660, 820].forEach((f, i) => tone(f, i * 0.11, 0.16, 'sine', 0.1))
  tone(330, 0.6, 0.35, 'sine', 0.07)
}

// One soft plop as water soaks into the soil.
export function splash() {
  if (!ready() || !ctx) return
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  const t = ctx.currentTime
  o.type = 'sine'
  o.frequency.setValueAtTime(1100, t)
  o.frequency.exponentialRampToValueAtTime(260, t + 0.18)
  g.gain.setValueAtTime(0.14, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
  o.connect(g).connect(ctx.destination)
  o.start(t)
  o.stop(t + 0.3)
}

// A light sparkle for grooming.
export function groom() {
  if (!ready()) return
  ;[1319, 1568, 1760, 2093].forEach((f, i) => tone(f, i * 0.07, 0.14, 'triangle', 0.06))
}

// A rising chime when a plant moves to its next stage.
export function grow() {
  if (!ready()) return
  ;[392, 494, 587, 784].forEach((f, i) => tone(f, i * 0.1, 0.25, 'triangle', 0.09))
}

// A fuller arpeggio and chord for a flower opening.
export function bloom() {
  if (!ready()) return
  ;[523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.1, 0.3, 'triangle', 0.08))
  ;[523, 659, 784, 1047].forEach((f) => tone(f, 0.6, 0.8, 'sine', 0.06))
}

// A quick upward pop as a weed comes out of the ground, then a coin chime.
export function pluck() {
  if (!ready() || !ctx) return
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  const t = ctx.currentTime
  o.type = 'triangle'
  o.frequency.setValueAtTime(220, t)
  o.frequency.exponentialRampToValueAtTime(880, t + 0.09)
  g.gain.setValueAtTime(0.16, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14)
  o.connect(g).connect(ctx.destination)
  o.start(t)
  o.stop(t + 0.14)
  coinAt(0.18)
}

// Two bright notes, for gaining or spending coins.
export function coin() {
  if (!ready()) return
  coinAt(0)
}

function coinAt(start: number) {
  tone(988, start, 0.08, 'square', 0.05)
  tone(1319, start + 0.07, 0.25, 'square', 0.05)
}

// A pitch sweep, for chirps and swishes.
function sweep(from: number, to: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.08) {
  if (!ctx) return
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  const t = ctx.currentTime + start
  o.type = type
  o.frequency.setValueAtTime(from, t)
  o.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(ctx.destination)
  o.start(t)
  o.stop(t + dur)
}

// Two quick bird chirps.
export function chirp() {
  if (!ready()) return
  sweep(2400, 3600, 0, 0.07)
  sweep(2600, 3900, 0.1, 0.07)
  sweep(3000, 2200, 0.2, 0.09)
}

// A soft, airy shimmer for a butterfly.
export function flutter() {
  if (!ready()) return
  ;[1568, 1976, 2349, 1976, 2637].forEach((f, i) => tone(f, i * 0.06, 0.12, 'sine', 0.04))
}

// A paper swish, then a warm chord as the flower is pressed.
export function preserve() {
  if (!ready()) return
  sweep(900, 300, 0, 0.25, 'triangle', 0.05)
  ;[392, 494, 587].forEach((f, i) => tone(f, 0.3 + i * 0.12, 0.5, 'sine', 0.07))
  tone(784, 0.7, 0.9, 'sine', 0.05)
}

// A short hello when coming back to the garden.
export function welcome() {
  if (!ready()) return
  ;[659, 784, 988].forEach((f, i) => tone(f, i * 0.12, 0.22, 'triangle', 0.07))
}

// Little fanfare for a perfect quiz or a streak milestone.
export function fanfare() {
  if (!ready()) return
  ;[784, 784, 988, 1175].forEach((f, i) => tone(f, i * 0.1 + (i === 3 ? 0.05 : 0), i === 3 ? 0.45 : 0.1, 'square', 0.05))
}

// A soft tick as flying coins reach the counter.
export function coinLand() {
  if (!ready()) return
  tone(1568, 0, 0.06, 'square', 0.03)
}

// A rising hum that swells over `dur` seconds, for energy gathering before a level-up.
export function charge(dur = 1.5) {
  if (!ready() || !ctx) return
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  const t = ctx.currentTime
  o.type = 'triangle'
  o.frequency.setValueAtTime(180, t)
  o.frequency.exponentialRampToValueAtTime(880, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.07, t + dur * 0.9)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(ctx.destination)
  o.start(t)
  o.stop(t + dur)
}
