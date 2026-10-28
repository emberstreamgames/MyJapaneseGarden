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
