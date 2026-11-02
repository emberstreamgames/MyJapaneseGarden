<script lang="ts">
  import { DECK_LABEL, DECK_PROMPT, SIDE_LABEL } from '../data/items'
  import { HINT_COST } from './garden'
  import { CHEERS, NEAR_MISS, type Quiz } from './quiz.svelte'
  import { app } from './store.svelte'

  const AUTO_NEXT_MS = 800
  const MILESTONE_MS = 1500 // long enough to read a combo callout's gloss

  let {
    quiz,
    onNext,
    nextLabel = 'Next ▶',
    auto = true,
  }: { quiz: Quiz; onNext: () => void; nextLabel?: string; auto?: boolean } = $props()

  let input = $state<HTMLInputElement>()

  // Paying for a hint shouldn't take the cursor (or a phone's keyboard) away from the answer box.
  function reveal() {
    quiz.revealHint()
    input?.focus()
  }

  // A right answer moves on by itself, unless there's something new to read: a kanji's readings
  // only appear now, so that card waits (unless they were already bought). So does a card just mastered.
  $effect(() => {
    const c = quiz.current
    if (!auto || quiz.result !== 'right' || quiz.justMastered || (c?.type === 'kanji' && !c.side && !quiz.revealed)) return
    const t = setTimeout(onNext, quiz.praise.big ? MILESTONE_MS : AUTO_NEXT_MS)
    return () => clearTimeout(t)
  })

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
  {@const reversed = current.side === 'reverse'}
  {#key current.id}
    <div class="stage">
      {#key quiz.shake}
        <div class="card" class:shake={quiz.result === 'wrong' && !quiz.unsure} class:right={quiz.result === 'right'}>
          <div class="tagline">
            {DECK_LABEL[current.type]} · {current.side ? SIDE_LABEL[current.side] : current.tag}
            {#if quiz.isNew}<span class="new-tag">New</span>{/if}
          </div>
          <div class="big" class:mid={!reversed && current.front.length === 4} class:long={reversed || current.front.length > 4} lang={reversed ? 'en' : 'ja'}>{current.front}</div>
          {#if quiz.hintLocked}
            <div class="hint-buy">
              <button disabled={app.coins < HINT_COST} onclick={reveal}>🪙 {HINT_COST} · Show readings</button>
              <span class="dim">You have {app.coins}</span>
            </div>
          {:else if current.hint}
            <div class="hint">{current.hint}</div>
          {/if}

          {#if quiz.kind === 'type'}
            {#if !quiz.result}
              <form onsubmit={(e) => quiz.submitTyped(e)}>
                <!-- svelte-ignore a11y_autofocus -->
                <input bind:this={input} bind:value={quiz.typed} autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder={DECK_PROMPT[current.type]} autofocus />
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
                  lang={current.side ? 'ja' : undefined}
                  class:ok={quiz.result && o === current.back}
                  class:no={quiz.result && o === quiz.picked && o !== current.back}
                  disabled={!!quiz.result}
                  onclick={() => quiz.choose(o)}>{o}</button
                >
              {/each}
            </div>
          {/if}

          {#if !quiz.result}
            <button class="linkish idk" onclick={() => quiz.dontKnow()}>I don't know</button>
          {/if}

          {#if quiz.result === 'wrong'}
            <p class="explain">
              {#if current.type === 'grammar'}
                The missing word is <b>{current.back}</b>
              {:else if current.side === 'reverse'}
                “{current.front}” is <b lang="ja">{current.back}</b>
              {:else}
                <span lang="ja">{current.front}</span>
                {current.type === 'hiragana' || current.type === 'katakana' || current.side === 'reading' ? 'is read' : 'means'}
                <b>“{current.back}”</b>
              {/if}
              {#if quiz.kind === 'type' && quiz.typed.trim()}<span class="dim">You typed “{quiz.typed.trim()}”.</span>{/if}
            </p>
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
    </div>

    {#if quiz.result}
      <div class="row">
        {#if quiz.result === 'right'}
          <div class="verdict right" class:big={quiz.praise.big || quiz.justMastered}>
            {#if quiz.justMastered}🌸 Mastered!{:else}{quiz.praise.en} {#if quiz.praise.ja}<span lang="ja">{quiz.praise.ja}</span>{/if}{/if}
            {#if quiz.gain}{#key quiz.gain.id}<b class="gain" aria-hidden="true">+{quiz.gain.amount} XP</b>{/key}{/if}
            {#if quiz.praise.gloss && !quiz.justMastered}<small>({quiz.praise.gloss})</small>{/if}
          </div>
        {:else if quiz.unsure}
          <div class="verdict unsure">Now you know it.<small>It'll come back soon.</small></div>
        {:else}
          {@const c = quiz.near ? NEAR_MISS : CHEERS[quiz.cheer]}
          <div class="verdict wrong">{c.en} <span lang="ja">{c.ja}</span><small>({c.gloss})</small></div>
        {/if}
        <button class="primary" onclick={onNext}>{nextLabel}</button>
      </div>
    {/if}
  {/key}
{/if}
