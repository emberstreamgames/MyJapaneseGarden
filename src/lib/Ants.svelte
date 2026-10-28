<script lang="ts">
  import { untrack } from 'svelte'
  import { flyCoinsFrom } from './coinfly.svelte'
  import { ANT_COINS } from './garden'
  import { ANT_LANES, BLEED, VIEW } from './meadow'
  import * as sfx from './sfx'
  import { antCoinReady, app, collectAntCoin, tourDid } from './store.svelte'

  // Ambient ants on the lawn while the garden is open. Now and then a short line of them walks a lane,
  // some carrying a crumb or food. When an ant coin is due (garden.ts antCoinDue) the next lead ant
  // carries it until it's tapped; one that walks off untapped leaves the coin for a later ant.

  type Pt = [number, number]
  type Carry = 'crumb' | 'berry' | 'leaf' | 'coin' | null
  interface Ant {
    id: number
    keys: Keyframe[]
    mid: string // transform halfway along, for reduced motion
    duration: number
    delay: number
    carry: Carry
    paused?: boolean // the tutorial's coin ant, waiting halfway to be tapped
  }

  const SPEED = 26 // bed units per second
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  let ants = $state<Ant[]>([])
  let gain = $state<{ id: number; x: number; y: number } | null>(null)
  let n = 0
  const anims = new Map<number, Animation>()

  const rand = (a: number, b: number) => a + Math.random() * (b - a)

  // Catmull-Rom through the lane's points, plus a small sideways wiggle so the walk looks antsy.
  function walk(lane: Pt[]) {
    const P = [lane[0], ...lane, lane[lane.length - 1]]
    const pts: Pt[] = []
    for (let s = 1; s < P.length - 2; s++)
      for (let k = 0; k < 16; k++) {
        const t = k / 16
        const c = (i: 0 | 1) => {
          const [a, b, c2, d] = [P[s - 1][i], P[s][i], P[s + 1][i], P[s + 2][i]]
          return 0.5 * (2 * b + (c2 - a) * t + (2 * a - 5 * b + 4 * c2 - d) * t * t + (3 * b - a - 3 * c2 + d) * t * t * t)
        }
        pts.push([c(0), c(1)])
      }
    pts.push(lane[lane.length - 1])
    let len = 0, prev = 0
    const raw = pts.map((p, i) => {
      if (i) len += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1])
      const q = pts[Math.min(i + 1, pts.length - 1)], o = pts[Math.max(i - 1, 0)]
      let a = (Math.atan2(q[1] - o[1], q[0] - o[0]) * 180) / Math.PI
      a += Math.round((prev - a) / 360) * 360 // unwrap, so the ant never spins the long way round
      prev = a
      const w = Math.sin(len / 7) * 1.4, r = (a * Math.PI) / 180
      return { x: p[0] - Math.sin(r) * w, y: p[1] + Math.cos(r) * w, a, len }
    })
    return { raw, len }
  }

  function spawn() {
    if (document.hidden) return
    const base = ANT_LANES[Math.floor(Math.random() * ANT_LANES.length)]
    const jittered = base.map(([x, y], i) => (i && i < base.length - 1 ? [x + rand(-4, 4), y + rand(-4, 4)] : [x, y]) as Pt)
    const lane = Math.random() < 0.5 ? jittered : [...jittered].reverse()
    // During the tutorial, coin ants wait for their own step.
    const coin = antCoinReady() && !ants.some((a) => a.carry === 'coin') && (!app.tour || app.tour === 'ant')
    // Without motion, only the coin ant shows up, standing still on the lawn.
    if (reduced && !coin) return
    const { raw, len } = walk(lane)
    const keys = raw.map((p) => ({ offset: p.len / len, transform: `translate(${p.x}px, ${p.y}px) rotate(${p.a}deg)` }))
    const m = raw[Math.floor(raw.length / 2)]
    const count = coin || reduced ? 1 : 1 + Math.floor(Math.random() * 3)
    let delay = 0
    for (let i = 0; i < count; i++) {
      const r = Math.random()
      const carry: Carry = i === 0 && coin ? 'coin' : r < 0.25 ? 'crumb' : r < 0.35 ? 'berry' : r < 0.45 ? 'leaf' : null
      ants.push({ id: ++n, keys, mid: `translate(${m.x}px, ${m.y}px) rotate(${m.a}deg)`, duration: (len / SPEED) * 1000, delay, carry })
      delay += rand(700, 1500)
    }
  }

  $effect(() => {
    let t: ReturnType<typeof setTimeout>
    const loop = (wait: number) => (t = setTimeout(() => (spawn(), loop(rand(15_000, 40_000))), wait))
    loop(rand(2500, 6000))
    return () => clearTimeout(t)
  })

  // The tutorial sends a coin ant out straight away, and another if one walks off untapped.
  // (Its ant stops halfway, so that only happens if the step is left meanwhile.)
  $effect(() => {
    if (app.tour !== 'ant' || !antCoinReady() || ants.some((a) => a.carry === 'coin')) return
    const t = setTimeout(spawn, 800)
    return () => clearTimeout(t)
  })

  // Leaving the ant step (done or skipped) lets a stopped ant walk on.
  $effect(() => {
    if (app.tour === 'ant') return
    for (const ant of untrack(() => ants)) if (ant.paused) resume(ant)
  })

  function resume(ant: Ant) {
    ant.paused = false
    anims.get(ant.id)?.play()
  }

  const drop = (id: number) => {
    anims.delete(id)
    ants = ants.filter((a) => a.id !== id)
  }

  function move(el: SVGGElement, ant: Ant) {
    if (reduced) {
      el.style.transform = ant.mid
      return
    }
    // Plain keyframes: Safari silently ignores a $state proxy, leaving the ant parked at the origin.
    const a = el.animate($state.snapshot(ant.keys), { duration: ant.duration, delay: ant.delay, fill: 'both' })
    anims.set(ant.id, a)
    a.finished.then(() => drop(ant.id), () => {})
    // On the tutorial's ant step, the coin ant stops halfway along its lane (at constant speed, half
    // the time) and waits to be tapped.
    const stop =
      ant.carry === 'coin' && app.tour === 'ant'
        ? setTimeout(() => {
            if (app.tour !== 'ant' || ant.carry !== 'coin') return
            a.pause()
            ant.paused = true
          }, ant.delay + ant.duration / 2)
        : undefined
    return () => {
      clearTimeout(stop)
      a.cancel()
    }
  }

  // Untracked: an attachment reruns when what it reads changes, and that would restart the walk
  // (dropping the coin, or the tutorial moving on).
  const mover = (ant: Ant) => (el: SVGGElement) => untrack(() => move(el, ant))

  function tap(ant: Ant, e: Event) {
    const el = e.currentTarget as SVGGElement
    const bed = el.closest('.ants')!.getBoundingClientRect(), box = el.getBoundingClientRect()
    gain = { id: ++n, x: ((box.left + box.width / 2 - bed.left) / bed.width) * 100, y: ((box.top + box.height / 2 - bed.top) / bed.height) * 100 }
    ant.carry = null
    if (collectAntCoin()) {
      if (!app.muted) sfx.coin()
      flyCoinsFrom(el, ANT_COINS)
      tourDid('ant')
    }
    // Lighter now, it scurries off. Without motion it simply leaves.
    const a = anims.get(ant.id)
    if (a) {
      a.playbackRate = 2.5
      resume(ant)
    } else drop(ant.id)
  }
</script>

<!-- One SVG in bed units, so the keyframes' px are bed units at any size. It covers the scene's bleed too. -->
<div class="ants">
  <svg viewBox="{-BLEED} 0 {VIEW.w + BLEED * 2} {VIEW.h}" preserveAspectRatio="xMidYMid slice" aria-hidden={!ants.some((a) => a.carry === 'coin')}>
    {#each ants as ant (ant.id)}
      {@const coin = ant.carry === 'coin'}
      <!-- One element for the whole walk: dropping the coin must not restart the animation. -->
      <!-- svelte-ignore a11y_no_static_element_interactions, a11y_no_noninteractive_tabindex -->
      <g
        class="ant"
        class:coin
        class:paused={ant.paused}
        role={coin ? 'button' : undefined}
        tabindex={coin ? 0 : undefined}
        aria-label={coin ? 'Ant carrying a coin, tap to take it' : undefined}
        onclick={(e) => coin && tap(ant, e)}
        onkeydown={(e) => coin && (e.key === 'Enter' || e.key === ' ') && tap(ant, e)}
        {@attach mover(ant)}
      >
        {#if coin}<circle class="ant-hit" cx="4" r="16" />{/if}
        {@render body(ant.carry)}
      </g>
    {/each}
  </svg>
  {#if gain}
    {#key gain.id}<b class="ant-gain" style="left:{gain.x}%;top:{gain.y}%">+{ANT_COINS} 🪙</b>{/key}
  {/if}
</div>

{#snippet body(carry: Carry)}
  {#if carry === 'coin'}<circle class="ant-glow" cx="9" r="7" />{/if}
  <g class="legs-a"><path d="M2.5-1L4.6-4.4M0.4 1L-2.3 4.4M1.4-1.1L1.2-4.8" /></g>
  <g class="legs-b"><path d="M2.5 1L4.6 4.4M0.4-1L-2.3-4.4M1.4 1.1L1.2 4.8" /></g>
  <path class="feelers" d="M5.8-1Q7.5-3.6 9-3.2M5.8 1Q7.5 3.6 9 3.2" />
  <ellipse cx="-4" rx="3.4" ry="2.6" fill="#2b1b14" />
  <ellipse cx="-4.8" cy="-0.9" rx="1.4" ry="0.8" fill="#5a3a2a" />
  <circle cx="-0.5" r="0.9" fill="#2b1b14" />
  <ellipse cx="1.5" rx="1.9" ry="1.3" fill="#2b1b14" />
  <circle cx="4.6" r="1.9" fill="#2b1b14" />
  {#if carry === 'crumb'}
    <path d="M6.4-1.4L8.6-2 10-0.6 9.6 1.6 7.2 1.9 6.2 0.4Z" fill="#e9cf98" stroke="#b8935a" stroke-width="0.4" />
  {:else if carry === 'berry'}
    <circle cx="8.4" r="2.2" fill="#d6324a" /><circle cx="7.8" cy="-0.7" r="0.6" fill="#ffb3bf" />
  {:else if carry === 'leaf'}
    <path d="M6.2 0Q8.5-3.5 12-1.5Q9 2.5 6.2 0Z" fill="#6cbf4a" stroke="#3f8a32" stroke-width="0.3" />
  {:else if carry === 'coin'}
    <!-- The same 🪙 as the coin counter, so it reads as a coin on every device. -->
    <text class="ant-coin" x="9">🪙</text>
  {/if}
{/snippet}
