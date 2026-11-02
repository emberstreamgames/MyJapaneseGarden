<script lang="ts">
  import { BLEED, VIEW } from './meadow'
  import type { FestivalId } from './seasons'

  // A festival's decorations along the top of the lawn. Garden draws them under the plants, so they
  // never cover a badge, and the moon over them, where the night tint can't dull it.
  let { festival }: { festival: FestivalId } = $props()

  const LANTERNS = [40, 110, 200, 290, 360]
  const CARDS = [['#ff7a9a', 54], ['#ffd76a', 120], ['#7fd0ff', 180], ['#b6f09a', 244], ['#d7a6ff', 306], ['#ff9f5a', 352]] as const
  const PAPERS = [70, 150, 250, 330]
</script>

<svg class="festival" viewBox="{-BLEED} 0 {VIEW.w + BLEED * 2} {VIEW.h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  {#if festival === 'hanami'}
    <path d="M0 6Q100 30 200 12T400 6" fill="none" stroke="#5a3d28" stroke-width="1.6" />
    {#each LANTERNS as x, i}
      <g transform="translate({x} {i % 2 ? 19 : 17})">
        <path d="M0-4V1" stroke="#5a3d28" stroke-width="1.2" />
        <ellipse cy="10" rx="8" ry="10" fill={i % 2 ? '#fff4e0' : '#e8435a'} />
        <path d="M-6 3H6M-8 10H8M-6 17H6" stroke="#0003" stroke-width="1" />
      </g>
    {/each}
  {:else if festival === 'tanabata'}
    <path d="M0 8Q200 2 400 10" fill="none" stroke="#4f9a44" stroke-width="4" stroke-linecap="round" />
    {#each CARDS as [fill, x], i}
      <g transform="translate({x} 7) rotate({i % 2 ? 4 : -4})">
        <path d="M0 0V6" stroke="#fff" stroke-width="0.8" />
        <rect x="-4" y="6" width="8" height="24" rx="1" {fill} />
      </g>
    {/each}
  {:else if festival === 'tsukimi'}
    <circle cx="346" cy="34" r="34" fill="#fff3b0" opacity="0.18" />
    <circle cx="346" cy="34" r="23" fill="#ffefae" />
    <circle cx="338" cy="28" r="4" fill="#e9d48a" /><circle cx="354" cy="40" r="5" fill="#e9d48a" /><circle cx="351" cy="24" r="2.4" fill="#e9d48a" />
  {:else}
    <path d="M0 6Q100 22 200 10T400 6" fill="none" stroke="#c9a66b" stroke-width="4" stroke-linecap="round" />
    {#each PAPERS as x}
      <path d="M{x - 4} 14h8l-4 7h6l-4 7h6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round" />
    {/each}
    <circle cx="200" cy="0" r="16" fill="#e8435a" />
  {/if}
</svg>
