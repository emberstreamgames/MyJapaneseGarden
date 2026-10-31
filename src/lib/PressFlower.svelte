<script lang="ts" module>
  // Each step starts at this many ms: the plant grows from the start, then the scissors come in,
  // snip, the book rises, the flower settles on its page, and the cover shuts.
  const SCISSORS = 1350
  const SNIP = 1750
  const BOOK = 2300
  const SETTLE = 2650
  const SHUT = 3350
  const THUMP = 3880 // the cover lands: matches the 0.55s .pf-leaf transition
  const END = 4700
</script>

<script lang="ts">
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import FlowerHead from './FlowerHead.svelte'
  import { BLOOMED, type Species } from './garden'
  import PlantSprite from './PlantSprite.svelte'
  import * as sfx from './sfx'
  import { app } from './store.svelte'

  // Played between the garden and the Collection when a flower is preserved: it grows once more, is
  // snipped from its stem, and is shut in a book. The reward is already saved, so a tap just skips it.
  let { species, variant, onDone }: { species: Species; variant: number; onDone: () => void } = $props()

  const STEP_MS = 180
  let stage = $state(1)
  let step = $state(0) // how far along the steps above

  const play = (cue: () => void) => !app.muted && cue()

  onMount(() => {
    play(sfx.grow)
    const timers = Array.from({ length: BLOOMED - 1 }, (_, i) => setTimeout(() => (stage = i + 2), (i + 1) * STEP_MS))
    const at = (ms: number, run: () => void) => timers.push(setTimeout(run, ms))
    ;[SCISSORS, SNIP, BOOK, SETTLE, SHUT, THUMP].forEach((ms, i) => at(ms, () => (step = i + 1)))
    at(SNIP, () => play(sfx.snip))
    at(THUMP, () => play(sfx.thump))
    at(END, onDone)
    return () => timers.forEach(clearTimeout)
  })

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') onDone()
  }
</script>

<svelte:window onkeydown={onKey} />

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="pf" role="dialog" tabindex="-1" aria-modal="true" aria-label="Pressing your flower. Tap to skip." onclick={onDone} transition:fade|global={{ duration: 300 }}>
  <div class="pf-stage" class:scissors={step >= 1} class:snipped={step >= 2} class:book={step >= 3} class:settled={step >= 4} class:shut={step >= 5} class:thump={step >= 6}>
    <svg class="pf-soil" viewBox="0 0 100 100" aria-hidden="true">
      <ellipse cx="50" cy="90" rx="34" ry="9" fill="#3b2a1b" />
      <ellipse cx="50" cy="87" rx="30" ry="8" fill="#5a3d28" />
      <ellipse cx="46" cy="85" rx="14" ry="3" fill="#6d4a31" />
    </svg>
    <div class="pf-bk pf-under"><i></i></div>
    <div class="pf-bk pf-page"></div>
    <!-- The same plant twice, split at the snip: the stem falls away and the flower goes on. -->
    <div class="pf-cut pf-stem"><PlantSprite {species} {stage} {variant} soil={false} /></div>
    <div class="pf-cut pf-flower"><PlantSprite {species} {stage} {variant} soil={false} /></div>
    <!-- Takes over from the plant, in the same spot, so what's pressed is the head alone. -->
    <div class="pf-head"><FlowerHead {species} {variant} /></div>
    <svg class="pf-scissors" viewBox="-44 -22 88 44" aria-hidden="true">
      <g class="pf-blade a">
        <path d="M18 0L-40 -5L-40 -1Z" fill="#dfe3ee" stroke="#8a90a8" stroke-width="0.8" />
        <circle cx="30" cy="11" r="7" fill="none" stroke="#d6324a" stroke-width="4" />
      </g>
      <g class="pf-blade b">
        <path d="M18 0L-40 5L-40 1Z" fill="#c9cede" stroke="#8a90a8" stroke-width="0.8" />
        <circle cx="30" cy="-11" r="7" fill="none" stroke="#d6324a" stroke-width="4" />
      </g>
      <circle cx="18" r="2" fill="#6a708c" />
    </svg>
    <div class="pf-bk pf-leaf">
      <div class="pf-face inside"></div>
      <div class="pf-face cover"><b lang="ja">押し花</b></div>
    </div>
    {#if step >= 6}
      <div class="pf-dust" aria-hidden="true">{#each Array(8) as _, i}<i style="--a:{i * 45 + 22}deg"></i>{/each}</div>
    {/if}
  </div>
  <p class="dim">Tap to skip</p>
</div>
