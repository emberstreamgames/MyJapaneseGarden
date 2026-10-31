<script lang="ts">
  // The garden's atmosphere (look.ts): a light tint and drifting specks over everything, drawn
  // only with CSS. Nothing here takes taps. With reduced motion only the tint stays.
  let { sky }: { sky: string } = $props()

  const COUNT: Record<string, number> = { petals: 14, leaves: 12, snowfall: 26, fireflies: 12 }

  // Spread evenly but not in step: golden-ratio steps look random and never change between renders.
  const at = (i: number, k: number) => ((i + 1) * k) % 1
  const specks = $derived(
    Array.from({ length: COUNT[sky] ?? 0 }, (_, i) => {
      const left = (at(i, 0.618) * 100).toFixed(1)
      const rise = (10 + at(i, 0.381) * 70).toFixed(1)
      const drift = (24 - at(i, 0.27) * 60).toFixed(0)
      const time = (7 + at(i, 0.73) * 8).toFixed(1)
      const delay = (-at(i, 0.91) * 15).toFixed(1)
      return `left:${left}%;--rise:${rise}%;--drift:${drift}px;animation-duration:${time}s;animation-delay:${delay}s`
    }),
  )
</script>

{#if sky !== 'clear'}
  <div class="sky {sky}" aria-hidden="true">
    {#each specks as style}
      <i {style}></i>
    {/each}
  </div>
{/if}
