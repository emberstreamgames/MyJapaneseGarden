<script lang="ts">
  import { WEED_COINS } from './garden'
  import { WEED_SPOTS, weedBox } from './meadow'
  import WeedSprite from './WeedSprite.svelte'

  // Played on the garden after a weed's question: the weed is gripped, wiggled, and yanked out
  // with a spray of soil. `onPop` fires as it comes free, `onDone` when the animation is over.
  let { spot, kind, onPop, onDone }: { spot: number; kind: number; onPop: () => void; onDone: () => void } = $props()

  const POP = 500 // ms, matches the 45% point of the 1.1s pluck keyframes
  const CRUMBS = Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI * (1.1 + (i / 5) * 0.8) // fan upward
    const d = 14 + Math.random() * 12
    return { dx: Math.cos(a) * d, dy: Math.sin(a) * d }
  })

  function run(_: HTMLDivElement) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onPop()
      const t = setTimeout(onDone, 900) // still show the reward
      return () => clearTimeout(t)
    }
    const pop = setTimeout(onPop, POP)
    const done = setTimeout(onDone, 1300)
    return () => {
      clearTimeout(pop)
      clearTimeout(done)
    }
  }
</script>

<div class="weed-tile plucking" style={weedBox(WEED_SPOTS[spot])} aria-hidden="true" {@attach run}>
  <div class="pull"><WeedSprite {kind} /></div>
  {#each CRUMBS as c}<i class="crumb" style="--dx:{c.dx}px;--dy:{c.dy}px"></i>{/each}
  <b class="weed-gain">+{WEED_COINS} 🪙</b>
</div>
