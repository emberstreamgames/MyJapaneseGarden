<script lang="ts">
  import { DECK_LABEL, DECK_PROMPT } from '../data/items'
  import type { Quiz } from './quiz.svelte'

  let { quiz, onNext, nextLabel = 'Next ▶' }: { quiz: Quiz; onNext: () => void; nextLabel?: string } = $props()

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && quiz.result) {
      e.preventDefault()
      onNext()
    }
  }
</script>

<svelte:window onkeydown={onKey} />

{#if quiz.current}
  {@const current = quiz.current}
  {#key current.id}
    <div class="stage">
      {#key quiz.shake}
        <div class="card" class:shake={quiz.result === 'wrong'} class:right={quiz.result === 'right'}>
          <div class="tagline">{DECK_LABEL[quiz.deck]} · {current.tag}</div>
          <div class="big" class:long={current.front.length > 4} lang="ja">{current.front}</div>
          {#if current.hint}<div class="hint">{current.hint}</div>{/if}

          {#if quiz.kind === 'type'}
            {#if !quiz.result}
              <form onsubmit={(e) => quiz.submitTyped(e)}>
                <!-- svelte-ignore a11y_autofocus -->
                <input bind:value={quiz.typed} autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder={DECK_PROMPT[quiz.deck]} autofocus />
                <button class="primary" type="submit">Check</button>
              </form>
            {:else}
              <div class="answer">{current.back}</div>
            {/if}
          {:else}
            <div class="choices">
              {#each quiz.options as o (o)}
                <button
                  class="choice"
                  class:ok={quiz.result && o === current.back}
                  class:no={quiz.result && o === quiz.picked && o !== current.back}
                  disabled={!!quiz.result}
                  onclick={() => quiz.choose(o)}>{o}</button
                >
              {/each}
            </div>
          {/if}
        </div>
      {/key}

      {#if quiz.burst}
        {#key quiz.burst.id}
          <div class="burst" aria-hidden="true">
            {#each quiz.burst.parts as p}
              <i style="--dx:{p.dx}px;--dy:{p.dy}px;--h:{p.hue}"></i>
            {/each}
          </div>
        {/key}
      {/if}
      {#if quiz.gain && quiz.result === 'right'}
        {#key quiz.gain.id}<div class="gain" aria-hidden="true">+{quiz.gain.amount} XP</div>{/key}
      {/if}
    </div>

    {#if quiz.result}
      <div class="row">
        <div class="verdict {quiz.result}">{quiz.result === 'right' ? 'Correct!' : 'Not quite'}</div>
        <button class="primary" onclick={onNext}>{nextLabel}</button>
      </div>
    {/if}
  {/key}
{/if}
