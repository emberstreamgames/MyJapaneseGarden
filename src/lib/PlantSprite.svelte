<script lang="ts">
  import { ART, GROUND, HYDRANGEA_BLOOMS, LAVENDER_BUDS, LEAF_PAIRS, STEM_TOP } from './plants'
  import { bloomMarkup, nextUid } from './blooms'
  import { BLOOMED, type Species } from './garden'

  // icon: show just the bloom (for pickers) with no soil or sway.
  // soil: draw the little mound of earth; the garden bed turns it off because it draws its own ground.
  // variant: the plot's colour variant (see blooms.ts); only shows once bloomed, so buds keep the surprise.
  let {
    species,
    stage,
    variant = 0,
    icon = false,
    soil = true,
  }: { species: Species; stage: number; variant?: number; icon?: boolean; soil?: boolean } = $props()

  const art = $derived(ART[species])
  const top = $derived(STEM_TOP[stage])
  const pairs = $derived(LEAF_PAIRS[stage])
  const bloomed = $derived(stage === BLOOMED)
  const unbloomed = $derived(stage === BLOOMED - 1)
  const leafScale = $derived(stage === 3 ? 0.7 : stage === 4 ? 0.85 : 1)
  const delay = -Math.random() * 5 // desynchronise the sway of neighbouring plants
  const uid = nextUid() // keeps gradient/pattern ids unique per sprite

  const leaves = $derived(
    Array.from({ length: pairs }, (_, p) => {
      const y = GROUND - 3 - ((p + 1) * (GROUND - top)) / (pairs + 1)
      return { y, s: leafScale * (1 - p * 0.1) }
    }),
  )
</script>

<svg class="sprite" class:icon viewBox={icon ? '22 8 56 52' : '0 0 100 100'} aria-hidden="true">
  {#if !icon && soil}
    <ellipse cx="50" cy="90" rx="34" ry="9" fill="#3b2a1b" />
    <ellipse cx="50" cy="87" rx="30" ry="8" fill="#5a3d28" />
    <ellipse cx="46" cy="85" rx="14" ry="3" fill="#6d4a31" />
  {/if}

  {#key stage}
    <g class="plant" class:still={icon} style="animation-delay:{delay}s">
      {#if stage === 1}
        <ellipse cx="50" cy="81" rx="5" ry="3.6" fill="#8a5a2b" transform="rotate(-15 50 81)" />
        <ellipse cx="48.8" cy="80" rx="1.8" ry="1" fill="#b98448" />
      {:else}
        <path d="M50 {GROUND} Q{stage === 2 ? 50 : 47} {(GROUND + top) / 2} 50 {top}" fill="none" stroke="#3f9b4f" stroke-width={stage === 2 ? 2.4 : 3} stroke-linecap="round" />

        {#each leaves as lf}
          <path d="M0 0 Q8 -7 18 -1 Q8 6 0 0Z" fill="#4fb862" transform="translate(50 {lf.y}) rotate(-22) scale({lf.s})" />
          <path d="M0 0 Q8 -7 18 -1 Q8 6 0 0Z" fill="#3f9f52" transform="translate(50 {lf.y - 5}) scale(-1 1) rotate(-22) scale({lf.s})" />
        {/each}

        {#if stage === 2}
          <path d="M0 3 C-6 0 -5 -9 0 -13 C5 -9 6 0 0 3Z" fill="#5cc86e" transform="translate(50 {top + 1})" />
        {/if}

        {#if unbloomed || bloomed}
          <g transform="translate(50 {top})">
            {#if bloomed}
              {@html bloomMarkup(species, variant, uid)}
            {:else if art.custom === 'lavender'}
              {#each LAVENDER_BUDS.slice(0, 6) as [x, y]}
                <ellipse cx={x * 0.7} cy={y * 0.8 + 2} rx="2.6" ry="3.4" fill="#7fa56b" />
              {/each}
            {:else if art.custom === 'hydrangea'}
              {#each HYDRANGEA_BLOOMS.slice(0, 6) as b}
                <circle cx={b.x * 0.7} cy={b.y * 0.7} r={b.r * 0.7} fill="#8fbf7a" />
              {/each}
            {:else}
              <path d="M0 4 C-9 0 -8 -13 0 -20 C8 -13 9 0 0 4Z" fill={art.bud} />
              <path d="M0 4 C-5 1 -5 -9 0 -14" fill="none" stroke="#fff" stroke-width="1.2" opacity="0.3" stroke-linecap="round" />
              <path d="M-7 3 Q0 -4 7 3 Q0 9 -7 3Z" fill="#3f9b4f" />
            {/if}
          </g>
        {/if}
      {/if}
    </g>
  {/key}
</svg>
