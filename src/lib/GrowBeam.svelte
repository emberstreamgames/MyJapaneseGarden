<script lang="ts" module>
  // Starts with the tap; the plant changes at PEAK ms, as the last twinkle lands.
  const PEAK = 1400
  const DONE = 2300 // the beam has gone and the plant can be tapped again
  const END = 4100 // the stage text and any discovery line have been read
</script>

<script lang="ts">
  import { untrack } from 'svelte'
  import Celebration from './Celebration.svelte'
  import { flyCoinsFrom } from './coinfly.svelte'
  import { GROW_COINS, STAGE_NAMES, type Species } from './garden'
  import { BLEED, PLANT_SCALE, SPOTS, VIEW } from './meadow'
  import { ART, STEM_TOP } from './plants'

  // Played on the garden when a ready plant is tapped: a sunbeam falls on plot `index`, stars at its
  // top shed twinkles down to the plant, and `onGrow` changes the stage as they land. It returns
  // null if the plant couldn't grow, otherwise whether it bloomed and opened a new flower.
  let {
    index,
    species,
    stage,
    onStart,
    onGrow,
    onFree,
    onDone,
  }: {
    index: number
    species: Species
    stage: number
    onStart: () => void
    onGrow: () => { bloom: boolean; found: boolean } | null
    onFree: () => void
    onDone: () => void
  } = $props()

  const STAR = 'M0-6L1.3-1.3L6 0L1.3 1.3L0 6L-1.3 1.3L-6 0L-1.3-1.3Z'
  const STARS = 5
  const FALLS = 16
  const rand = (a: number, b: number) => a + Math.random() * (b - a)

  // Everything here keeps the props it started with: the beam stays on the plant as it was tapped.
  const start = (() => ({ index, stage }))()
  const spot = SPOTS[start.index]
  const top = spot.y - (86 - STEM_TOP[start.stage]) * PLANT_SCALE // the plant's tip, in bed units
  // The sun sits up and towards the middle, so beams lean in rather than all falling straight.
  const sun = { x: spot.x + (VIEW.w / 2 - spot.x) * 0.45, y: -12 }
  const length = Math.hypot(spot.x - sun.x, spot.y - sun.y)
  const angle = (Math.atan2(sun.x - spot.x, spot.y - sun.y) * 180) / Math.PI

  const stars = Array.from({ length: STARS }, (_, i) => {
    const t = i / (STARS - 1)
    return { x: sun.x - 44 + t * 88, y: 16 + Math.sin(t * Math.PI) * -6 + rand(0, 16), size: rand(0.7, 1.15), delay: 120 + rand(0, 240) }
  })
  const falls = Array.from({ length: FALLS }, (_, i) => {
    const from = stars[i % STARS]
    const dur = rand(520, 760)
    return {
      x: from.x,
      y: from.y,
      dx: spot.x + rand(-12, 12) - from.x,
      dy: (top + spot.y) / 2 + rand(-16, 10) - from.y,
      size: rand(0.35, 0.7),
      dur,
      // Spread over the charge, the last ones landing right on PEAK.
      delay: 300 + (i / (FALLS - 1)) * (PEAK - 300 - dur),
    }
  })

  const pct = (n: number, of: number) => `${((n / of) * 100).toFixed(3)}%`
  const at = `left:${pct(spot.x, VIEW.w)};top:${pct(top, VIEW.h)}`
  // Above the grown plant's tip. The CSS keeps it inside the bed on the outer plots and the top row.
  const tip = spot.y - (86 - STEM_TOP[start.stage + 1]) * PLANT_SCALE
  const stageAt = `--x:${pct(spot.x, VIEW.w)};--y:${pct(tip - 14, VIEW.h)}`

  let grown = $state<{ bloom: boolean; found: boolean } | null>(null)

  let timer: ReturnType<typeof setTimeout>
  let freeTimer: ReturnType<typeof setTimeout>

  const peak = (el: HTMLElement) => {
    grown = onGrow()
    if (grown) flyCoinsFrom(el, GROW_COINS)
    freeTimer = setTimeout(onFree, DONE - PEAK)
    timer = setTimeout(onDone, END - PEAK)
  }

  // Untracked: the callbacks read the store, and a change there mustn't restart the timers.
  const run = (el: HTMLElement) =>
    untrack(() => {
      // Without motion, keep the reward and the sound and skip the show.
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) peak(el)
      else {
        onStart()
        timer = setTimeout(() => peak(el), PEAK)
      }
      return () => {
        clearTimeout(timer)
        clearTimeout(freeTimer)
      }
    })
</script>

<div class="growbeam" aria-hidden="true" style="--peak:{PEAK}ms;--done:{DONE}ms">
  <svg viewBox="{-BLEED} 0 {VIEW.w + BLEED * 2} {VIEW.h}" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="gb-dim-{start.index}" gradientUnits="userSpaceOnUse" cx={spot.x} cy={(top + spot.y) / 2} r="240">
        <stop offset="0.2" stop-color="#080c2a" stop-opacity="0" />
        <stop offset="0.5" stop-color="#080c2a" stop-opacity="0.5" />
        <stop offset="1" stop-color="#080c2a" stop-opacity="0.68" />
      </radialGradient>
      <linearGradient id="gb-ray-{start.index}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={length}>
        <stop offset="0" stop-color="#fff8d6" stop-opacity="0.75" />
        <stop offset="0.7" stop-color="#ffe9a0" stop-opacity="0.45" />
        <stop offset="1" stop-color="#ffe9a0" stop-opacity="0" />
      </linearGradient>
      <radialGradient id="gb-pool-{start.index}">
        <stop offset="0.35" stop-color="#fff0b8" stop-opacity="1" />
        <stop offset="1" stop-color="#fff0b8" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect class="gb-dim" x={-BLEED} width={VIEW.w + BLEED * 2} height={VIEW.h} fill="url(#gb-dim-{start.index})" />
    <!-- Three nested shafts make a soft edge without a blur filter, which is slow on phones. -->
    <g transform="translate({sun.x.toFixed(1)} {sun.y}) rotate({angle.toFixed(2)})">
      <g class="gb-shaft" fill="url(#gb-ray-{start.index})">
        <path d="M-22 0L22 0L62 {length}L-62 {length}Z" opacity="0.3" />
        <path d="M-16 0L16 0L50 {length}L-50 {length}Z" opacity="0.45" />
        <path d="M-9 0L9 0L34 {length}L-34 {length}Z" opacity="0.7" />
      </g>
    </g>
    <ellipse class="gb-pool" cx={spot.x} cy={spot.y + 1} rx="58" ry="21" fill="url(#gb-pool-{start.index})" />
    {#each stars as s}
      <g transform="translate({s.x.toFixed(1)} {s.y.toFixed(1)})">
        <path class="gb-star" d={STAR} style="--sz:{s.size.toFixed(2)};animation-delay:{s.delay.toFixed(0)}ms" />
      </g>
    {/each}
    {#each falls as f}
      <g transform="translate({f.x.toFixed(1)} {f.y.toFixed(1)})">
        <path class="gb-fall" d={STAR} style="--dx:{f.dx.toFixed(1)}px;--dy:{f.dy.toFixed(1)}px;--sz:{f.size.toFixed(2)};animation-duration:{f.dur.toFixed(0)}ms;animation-delay:{f.delay.toFixed(0)}ms" />
      </g>
    {/each}
    <circle class="gb-flash" cx={spot.x} cy={(top + spot.y) / 2} r="60" fill="url(#gb-pool-{start.index})" />
  </svg>
  <div class="gb-plant" style={at} {@attach run}>
    {#if grown}
      <div class="gb-burst"><Celebration kind={grown.bloom ? 'bloom' : 'grow'} color={ART[species].bud} /></div>
      <b class="weed-gain">+{GROW_COINS} 🪙</b>
    {/if}
  </div>
  {#if grown}<b class="gb-stage" style={stageAt}><span>{STAGE_NAMES[start.stage]}</span> → {STAGE_NAMES[start.stage + 1]}</b>{/if}
  {#if grown?.found}<p class="discovery">✨ New discovery! Added to your collection</p>{/if}
</div>
