<script lang="ts">
  // One weed, drawn with its ground point at (0, 0). Kinds: 0 dandelion, 1 clover, 2 thistle.
  // Darker and duller than the lawn, with a bright flower, so it reads as "doesn't belong".
  let { kind }: { kind: number } = $props()

  const DANDELION_LEAF = 'M0 0C-3-3-4-6-2-8L-4-9-1-11-3-13 0-17 3-13 1-11 4-9 2-8C4-6 3-3 0 0Z'
  const THISTLE_LEAF = 'M0 0L-2-4-5-4-3-7-6-9-2-10-3-14 0-12 3-14 2-10 6-9 3-7 5-4 2-4Z'
  const trefoil = (x: number, y: number) => [[x, y - 2.4], [x - 2.2, y + 1], [x + 2.2, y + 1]]
</script>

<svg class="weed-art" viewBox="-15 -25 30 30" aria-hidden="true">
  <ellipse cy="1" rx="11" ry="3" fill="#1f3d16" opacity="0.45" />
  <g class="weed-body">
    {#if kind === 1}
      {#each [[-6, -7], [6, -9], [0, -4]] as [x, y]}
        <path d="M0 0Q{x * 0.4} {y * 0.5} {x} {y}" stroke="#2f6b28" stroke-width="1.2" fill="none" />
        {#each trefoil(x, y) as [cx, cy]}<circle {cx} {cy} r="2.6" fill="#357d33" stroke="#24561f" stroke-width="0.5" />{/each}
        <circle cx={x - 0.6} cy={y - 2.8} r="0.9" fill="#7cc26a" opacity="0.7" />
      {/each}
      <path d="M0 0Q3-9 2-17" stroke="#2f6b28" stroke-width="1.2" fill="none" />
      {#each [[0, -1], [-1.8, 0.4], [1.8, 0.4], [-1, 1.8], [1, 1.8], [0, -2.4]] as [dx, dy]}
        <circle cx={2 + dx} cy={-19 + dy} r="1.5" fill={dy > 1 ? '#f2c6d8' : '#fbf4f6'} />
      {/each}
    {:else if kind === 2}
      {#each [-60, -25, 25, 60] as a}<path d={THISTLE_LEAF} transform="rotate({a})" fill="#5a8a3a" stroke="#2f4f22" stroke-width="0.6" />{/each}
      <path d="M0 0Q-1-9 0-16" stroke="#4f7a39" stroke-width="1.6" fill="none" />
      <ellipse cy="-17.5" rx="3.2" ry="3.4" fill="#6b8f3c" stroke="#4a6a2a" stroke-width="0.6" />
      {#each [-50, -30, -12, 0, 12, 30, 50] as a}
        <path d="M0-20L0-25.5" transform="rotate({a} 0 -20)" stroke="#b25bd8" stroke-width="1.5" stroke-linecap="round" />
      {/each}
    {:else}
      {#each [-60, -22, 22, 60] as a}<path d={DANDELION_LEAF} transform="rotate({a})" fill="#3f7d2c" stroke="#2a5a1e" stroke-width="0.6" />{/each}
      <path d="M0 0Q2-10-1-19" stroke="#5c8f2e" stroke-width="1.3" fill="none" />
      {#each Array(10) as _, i}
        <ellipse cx="-1" cy="-24.5" rx="1.1" ry="2.6" transform="rotate({i * 36} -1 -21)" fill="#f7c21b" />
      {/each}
      <circle cx="-1" cy="-21" r="2" fill="#e29a0c" />
    {/if}
  </g>
</svg>
