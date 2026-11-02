<script lang="ts">
  // Small hand-drawn icons that pick up the palette, in place of emoji.
  let { name, size = 20 }: { name: 'acorn' | 'sprout' | 'drop' | 'star' | 'moon' | 'snip'; size?: number } = $props()
</script>

<svg class="icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
  {#if name === 'acorn'}
    <path d="M5 11h14c0 6-3 9-7 11-4-2-7-5-7-11Z" fill="#d9a15f" />
    <path d="M3.5 11c0-4 4-6.500 8.500-6.500S20.500 7 20.500 11c0 1-1 1.500-2 1.500h-13c-1 0-2-.500-2-1.500Z" fill="#8f6238" />
    <path d="M12 4.500c0-1.500.500-2.500 1.500-3" stroke="#8f6238" stroke-width="2" stroke-linecap="round" fill="none" />
  {:else if name === 'sprout'}
    <path d="M12 22V11" stroke="var(--deep)" stroke-width="2.600" stroke-linecap="round" />
    <path d="M12 13C12 7 7 4 2.500 4 2.500 10 6 13.500 12 13ZM12 11c0-5 4-8 9.500-8C21.500 8.500 18 12 12 11Z" fill="var(--leaf)" stroke="var(--deep)" stroke-width="1.200" />
  {:else if name === 'drop'}
    <path d="M12 2c4 5.500 7.500 9 7.500 13a7.500 7.500 0 0 1-15 0C4.500 11 8 7.500 12 2Z" fill="#9ed4ec" stroke="#5f9fbf" stroke-width="1.400" />
  {:else if name === 'star'}
    <path d="M12 2.500c1.300 4.800 2.500 6.700 8.500 8-6 1.300-7.200 3.200-8.500 11-1.300-7.800-2.500-9.700-8.500-11 6-1.300 7.200-3.200 8.500-8Z" fill="var(--honey)" stroke="#c99a3f" stroke-width="1.400" stroke-linejoin="round" />
  {:else if name === 'moon'}
    <path d="M18.500 15.500A9 9 0 0 1 9 3.500a9.500 9.500 0 1 0 9.500 12Z" fill="#cfc8ea" stroke="#9389b8" stroke-width="1.400" stroke-linejoin="round" />
  {:else}
    <path d="M6 5l13 13M18 5 5 18" stroke="var(--earth)" stroke-width="2.200" stroke-linecap="round" />
    <circle cx="5.500" cy="19" r="3" fill="none" stroke="var(--accent)" stroke-width="2.200" /><circle cx="18.500" cy="19" r="3" fill="none" stroke="var(--accent)" stroke-width="2.200" />
  {/if}
</svg>
