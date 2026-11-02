<script lang="ts">
  import Critter from './Critter.svelte'
  import Mochi from './Mochi.svelte'
  import Snail from './Snail.svelte'

  let { v, compact = false }: { v: string; compact?: boolean } = $props()

  const LINES: Record<string, string[]> = {
    mochi: ['A plant is ready to grow! Tap the star.', 'One plant is plenty today.', 'おかえり! That means “welcome home”.'],
    tanuki: ['That sprout looks thirsty, friend.', 'Good soil, good words. Slow and steady.', 'I’ll mind the weeds. You mind your kana.'],
    snail: ['No hurry. The garden will wait.', 'I crossed the lawn this week. Proud of me?', 'Rest is part of growing.'],
    post: ['A plant is ready to grow.', 'One plant is enough today.', 'Next plant wakes in 3h.'],
  }

  let line = $state(0)
  let talk = $state(0)
  const lines = $derived(LINES[v])

  function next() {
    line = (line + 1) % lines.length
    talk++
  }
</script>

<button class="v-voice {v}" class:compact onclick={next} aria-label="Next line: {lines[line]}">
  {#key talk}
    <span class="v-who">
      {#if v === 'mochi'}
        <Mochi size={compact ? 44 : 54} />
      {:else if v === 'tanuki'}
        <Critter creature="tanuki" size={compact ? 50 : 60} />
      {:else if v === 'snail'}
        <Snail size={compact ? 46 : 58} />
      {:else}
        <span class="v-post"></span>
      {/if}
    </span>
    <span class="v-say">{lines[line]}</span>
  {/key}
</button>
