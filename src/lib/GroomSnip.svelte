<script lang="ts">
  import Celebration from './Celebration.svelte'
  import { PLANT_SCALE, SPOTS, VIEW } from './meadow'
  import { STEM_TOP } from './plants'

  // Played on the garden after grooming: scissors snip twice at the flower and clippings fall.
  // `last` is the starter plant's send-off, with a burst of petals as it goes.
  let { index, stage, last = false, onSnip, onDone }: { index: number; stage: number; last?: boolean; onSnip: () => void; onDone: () => void } = $props()

  const SNIPS = [420, 760] // ms, matching the snip keyframes
  const DUR = 1700

  const clippings = Array.from({ length: 7 }, (_, i) => ({ dx: (i - 3) * 9 + Math.random() * 6, delay: 0.42 + (i % 2) * 0.34 + Math.random() * 0.1, petal: i % 3 === 0 }))
  const pct = (n: number, of: number) => `${((n / of) * 100).toFixed(3)}%`
  const at = $derived(`left:${pct(SPOTS[index].x, VIEW.w)};top:${pct(SPOTS[index].y - (86 - STEM_TOP[stage]) * PLANT_SCALE, VIEW.h)}`)

  function run() {
    // Without motion, keep the sound cue and skip the show.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onSnip()
      const t = setTimeout(onDone, last ? 500 : 0)
      return () => clearTimeout(t)
    }
    const timers = [...SNIPS.map((ms) => setTimeout(onSnip, ms)), setTimeout(onDone, DUR)]
    return () => timers.forEach(clearTimeout)
  }
</script>

<div class="gsnip" style={at} aria-hidden="true" {@attach run}>
  <span class="gsnip-tool">✂️</span>
  {#each clippings as c}
    <i class:petal={c.petal} style="--dx:{c.dx.toFixed(1)}px;animation-delay:{c.delay.toFixed(2)}s"></i>
  {/each}
  {#if last}<div class="gsnip-burst"><Celebration kind="bloom" color="#ffe9a8" /></div>{/if}
</div>
