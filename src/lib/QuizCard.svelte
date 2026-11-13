<script lang="ts">
  import { DECK_LABEL, DECK_PROMPT, DRAW_PROMPT, SIDE_LABEL } from '../data/items'
  import DrawPad from './DrawPad.svelte'
  import { HINT_COST } from './garden'
  import Mochi from './Mochi.svelte'
  import { CHEERS, NEAR_MISS, readingOf, type Quiz } from './quiz.svelte'
  import { app } from './store.svelte'
  import { strokesFor, type Fault } from './strokes'

  const AUTO_NEXT_MS = 800
  const MILESTONE_MS = 1500 // long enough to read a combo callout's gloss

  let {
    quiz,
    onNext,
    nextLabel = 'Next ▶',
    auto = true,
  }: { quiz: Quiz; onNext: () => void; nextLabel?: string; auto?: boolean } = $props()

  let input = $state<HTMLInputElement>()
  let row = $state<HTMLDivElement>()

  // A drawing card is tall: bring the verdict and Next up from under the dock once it's answered.
  $effect(() => {
    if (!quiz.result || quiz.kind !== 'draw' || !row) return
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    row.scrollIntoView({ block: 'nearest', behavior: still ? 'auto' : 'smooth' })
  })

  // Paying for a hint shouldn't take the cursor (or a phone's keyboard) away from the answer box.
  function reveal() {
    quiz.revealHint()
    input?.focus()
  }

  // A right answer moves on by itself, unless there's something new to read: a kanji's readings
  // only appear now, so that card waits (unless they were already bought). So does a card just mastered,
  // and a drawing in the wrong stroke order, so the right order can be watched.
  $effect(() => {
    const c = quiz.current
    if (!auto || quiz.result !== 'right' || quiz.justMastered || quiz.verdict?.order) return
    if (c?.type === 'kanji' && !c.side && quiz.kind !== 'draw' && !quiz.revealed) return
    const t = setTimeout(onNext, quiz.praise.big ? MILESTONE_MS : AUTO_NEXT_MS)
    return () => clearTimeout(t)
  })

  // What went wrong with a stroke, by its number in the replay.
  const FAULT: Record<Fault['why'], string> = {
    backwards: 'goes the other way',
    place: 'is in the wrong spot',
    long: 'is too long',
    short: 'is too short',
    shape: "isn't the right shape",
  }
  const faultText = (faults: Fault[]) =>
    faults
      .slice(0, 2)
      .map((f, i) => `${i ? 'stroke' : 'Stroke'} ${f.stroke + 1} ${FAULT[f.why]}`)
      .join(', and ') + '.'

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
  {@const drawing = quiz.kind === 'draw'}
  {@const reversed = current.side === 'reverse' || drawing || quiz.flipped}
  <!-- A turned-around vocab card shows the meaning and takes the word. -->
  {@const front = quiz.flipped ? current.back : current.front}
  {@const back = quiz.flipped ? current.front : current.back}
  {@const reading = reversed && !drawing ? readingOf(current) : ''}
  {@const prompt = drawing ? current.back : current.front}
  <!-- The character to show: the one matched or nearly matched (ぢ for a ji question), else the card's own. -->
  {@const drawn = ((quiz.verdict?.ok || quiz.verdict?.reason === 'shape') && quiz.verdict.char) || current.front}
  {@const faults = (quiz.result === 'wrong' && quiz.verdict?.faults) || []}
  {#key current.id}
    <div class="stage">
      {#key quiz.shake}
        <div class="card" class:drawing class:shake={quiz.result === 'wrong' && !quiz.unsure} class:right={quiz.result === 'right'}>
          <div class="tagline">
            {DECK_LABEL[current.type]} · {current.side ? SIDE_LABEL[current.side] : quiz.flipped ? SIDE_LABEL.reverse : current.tag}
            {#if quiz.isNew}<span class="new-tag">New</span>{/if}
          </div>
          {#if drawing}
            <div class="big draw-prompt" lang="en">{prompt}</div>
            <div class="dim draw-ask">{DRAW_PROMPT[current.type]}</div>
          {:else}
            <div class="big" class:mid={!reversed && front.length === 4} class:long={reversed || front.length > 4} lang={reversed ? 'en' : 'ja'}>{front}</div>
          {/if}
          {#if quiz.hintLocked}
            <div class="hint-buy">
              <button disabled={app.coins < HINT_COST} onclick={reveal}>🪙 {HINT_COST} · Show readings</button>
              <span class="dim">You have {app.coins}</span>
            </div>
          {:else if current.hint && !quiz.flipped}
            <div class="hint">{current.hint}</div>
          {/if}

          {#if drawing}
            <DrawPad
              bind:strokes={quiz.ink}
              onCheck={(s) => quiz.submitDrawing(s)}
              done={!!quiz.result}
              ok={quiz.result === 'right'}
              show={quiz.result === 'wrong' || quiz.verdict?.order ? (strokesFor(drawn) ?? null) : null}
              {faults}
              label="{prompt} · {DRAW_PROMPT[current.type]}"
            />
          {:else if quiz.kind === 'type'}
            {#if !quiz.result}
              <form onsubmit={(e) => quiz.submitTyped(e)}>
                <!-- svelte-ignore a11y_autofocus -->
                <input bind:this={input} bind:value={quiz.typed} autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang={quiz.typesJapanese ? 'ja' : undefined} placeholder={quiz.typesJapanese ? 'type it in Japanese' : DECK_PROMPT[current.type]} autofocus />
                <button class="primary" type="submit">Check</button>
              </form>
            {:else}
              <div class="answer" lang={reversed ? 'ja' : undefined}>{back}{#if reading}<small> ({reading})</small>{/if}</div>
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

          {#if drawing && quiz.result === 'right' && quiz.verdict?.order}
            <p class="explain order-flag" role="status">
              <b>Check the stroke order.</b> Right character, but the strokes went in a different order. Watch how <span lang="ja">{drawn}</span> is written.
            </p>
          {/if}

          {#if quiz.result === 'wrong'}
            <p class="explain">
              {#if drawing}
                {@const v = quiz.verdict}
                {#if v?.reason === 'count'}
                  <b lang="ja">{current.front}</b> has {v.want} strokes; you drew {v.drawn}.
                {:else if v?.reason === 'like'}
                  That looks more like <b lang="ja">{v.like}</b>. “{current.back}” is written <b lang="ja">{current.front}</b>.
                {:else if v?.messy}
                  A bit too messy to read: take it a little slower. “{current.back}” is written <b lang="ja">{drawn}</b>.
                {:else if faults.length}
                  {faultText(faults)} <span class="dim">Yours is marked in gold.</span> “{current.back}” is written <b lang="ja">{drawn}</b>.
                {:else}
                  “{current.back}” is written <b lang="ja">{current.front}</b>.
                {/if}
              {:else if current.type === 'grammar'}
                The missing word is <b>{current.back}</b>
              {:else if reversed}
                “{front}” is <b lang="ja">{back}</b>{#if reading}<span lang="ja"> ({reading})</span>{/if}
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
      <div class="row" bind:this={row}>
        <!-- Mochi dances for a right answer and droops a little for a miss. -->
        <span class="react {quiz.result}" aria-hidden="true"><Mochi size={46} mood={quiz.result === 'right' ? 'glad' : quiz.unsure ? 'happy' : 'shy'} /></span>
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
