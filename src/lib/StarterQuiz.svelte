<script lang="ts">
  import PlantSprite from './PlantSprite.svelte'
  import { BLOOMED, STARTER } from './garden'
  import * as sfx from './sfx'
  import { app } from './store.svelte'

  // The tutorial's first question, walked through step by step: always あ, always multiple choice.
  // The answer is given away, so it isn't recorded against the card: あ still comes up as new later.
  let { onDone }: { onDone: () => void } = $props()

  const OPTIONS = ['ka', 'a', 'su', 'mi']

  let picked = $state('')
  let misses = $state(0)
  const right = $derived(picked === 'a')

  function choose(o: string) {
    if (right) return
    picked = o
    if (o === 'a') {
      if (!app.muted) sfx.good(1)
    } else {
      misses++
      if (!app.muted) sfx.pad()
    }
  }
</script>

<section class="deck">
  <div class="hud">
    <div class="lvl">Watering</div>
    <div class="dots" aria-hidden="true"><i class:done={right} class:now={!right}></i></div>
  </div>

  <div class="quiz-plant" aria-hidden="true"><PlantSprite species={STARTER} stage={BLOOMED - 1} /></div>

  <div class="stage">
    {#key misses}
      <div class="card" class:shake={misses > 0 && !right} class:right>
        <div class="tagline">Hiragana · <span class="new-tag">New</span></div>
        <div class="big" lang="ja">あ</div>
        <p class="tour-tip" aria-live="polite">
          {#if right}
            That's it! You just read your first hiragana.
          {:else if misses}
            Not that one. Look for the glowing <b>a</b>.
          {:else}
            This is <span lang="ja">あ</span>. It sounds like the “a” in “father”. Tap <b>a</b>.
          {/if}
        </p>
        <div class="choices">
          {#each OPTIONS as o (o)}
            <button class="choice" class:ok={right && o === 'a'} class:guide={!right && o === 'a'} class:no={!right && picked === o} disabled={right} onclick={() => choose(o)}>{o}</button>
          {/each}
        </div>
      </div>
    {/key}
  </div>

  {#if right}
    <div class="row">
      <div class="verdict right">Correct!<b class="gain" aria-hidden="true">+12 XP</b></div>
      <button class="primary" onclick={onDone}>Water it 💧</button>
    </div>
  {/if}
</section>
