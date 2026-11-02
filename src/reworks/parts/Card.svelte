<script lang="ts">
  import Critter from './Critter.svelte'
  import Icon from './Icon.svelte'

  let { v, word = 'だいがく', tag = 'Lesson 1' }: { v: string; word?: string; tag?: string } = $props()

  let poke = $state(0)
</script>

<button class="c-card c-{v}" onclick={() => poke++} aria-label="Question: {word}">
  {#key poke}
    <span class="c-wrap" class:poked={poke > 0}>
      {#if v === 'packet'}
        <i class="pk-tear"></i>
        <span class="pk-label"><Icon name="sprout" size={18} /> {tag}</span>
        <span class="c-word" lang="ja">{word}</span>
        <i class="pk-seeds"></i>
      {:else if v === 'peg'}
        <i class="pg-line"></i><i class="pg-peg"></i>
        <span class="c-tag">{tag}</span>
        <span class="c-word" lang="ja">{word}</span>
      {:else if v === 'leaf'}
        <i class="lf-rib"></i>
        <span class="c-tag">{tag}</span>
        <span class="c-word" lang="ja">{word}</span>
      {:else if v === 'stake'}
        <span class="sk-board">
          <span class="c-tag">{tag}</span>
          <span class="c-word" lang="ja">{word}</span>
        </span>
        <i class="sk-post"></i><i class="sk-soil"></i>
      {:else if v === 'patch'}
        <span class="pt-inner">
          <span class="c-tag">{tag}</span>
          <span class="c-word" lang="ja">{word}</span>
        </span>
      {:else if v === 'stone'}
        <span class="c-tag">{tag}</span>
        <span class="c-word" lang="ja">{word}</span>
        <i class="st-moss"></i>
      {:else}
        <span class="bd-friend"><Critter creature="rabbit" size={74} /></span>
        <span class="bd-board surface">
          <span class="c-tag">{tag}</span>
          <span class="c-word" lang="ja">{word}</span>
        </span>
        <i class="bd-paw l"></i><i class="bd-paw r"></i>
      {/if}
    </span>
  {/key}
</button>
