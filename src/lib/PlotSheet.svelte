<script lang="ts">
  import { DECK_LABEL, deckReady, type Deck } from '../data/items'
  import { BLOOMED, SPECIES, STAGE_NAMES, formatWait, msUntilReady, phaseOf, speciesFor } from './garden'
  import Celebration from './Celebration.svelte'
  import PlantSprite from './PlantSprite.svelte'
  import { ART } from './plants'
  import { bloomName } from './blooms'
  import * as sfx from './sfx'
  import { app, growPlot, plantAt, poolFor, removePlant } from './store.svelte'

  let { index, now, onClose, onStart }: { index: number; now: number; onClose: () => void; onStart: (i: number) => void } = $props()

  const DECKS: Deck[] = ['hiragana', 'katakana', 'kanji', 'vocab', 'grammar']
  // A deck can be planted once it has enough quiz content.
  const playable = deckReady

  const plot = $derived(app.garden[index])
  const phase = $derived(plot ? phaseOf(plot, now) : null)
  const bloomed = $derived(plot?.stage === BLOOMED)
  const emptyPool = $derived(plot ? poolFor(plot.deck).length === 0 : false)

  let fx = $state<{ id: number; kind: 'grow' | 'bloom' } | null>(null)
  let fxId = 0

  function grow() {
    if (!growPlot(index)) return
    const kind = app.garden[index]?.stage === BLOOMED ? 'bloom' : 'grow'
    fx = { id: ++fxId, kind }
    if (!app.muted) (kind === 'bloom' ? sfx.bloom : sfx.grow)()
  }

  function remove() {
    if (confirm('Remove this plant? This cannot be undone.')) {
      removePlant(index)
      onClose()
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }
</script>

<svelte:window onkeydown={onKey} />

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="backdrop" onclick={(e) => e.target === e.currentTarget && onClose()}>
  <div class="sheet" role="dialog" aria-modal="true" aria-label={plot ? SPECIES[plot.species].label : 'Choose a plant'}>
    <button class="x" aria-label="Close" onclick={onClose}>✕</button>

    {#if !plot}
      <h2>Choose a plant</h2>
      <p class="dim">Each plant grows by studying its quiz type.</p>
      {#each DECKS as d (d)}
        <div class="group">
          <h3>{DECK_LABEL[d]}{#if !playable(d)} <span class="dim">· coming soon</span>{/if}</h3>
          <div class="picks">
            {#each speciesFor(d) as s (s)}
              <button class="pick" disabled={!playable(d)} onclick={() => plantAt(index, s)}>
                <PlantSprite species={s} stage={BLOOMED} icon />
                <span>{SPECIES[s].label}</span>
              </button>
            {/each}
          </div>
        </div>
      {/each}
    {:else}
      <div class="hero">
        <PlantSprite species={plot.species} stage={plot.stage} variant={plot.variant} />
        {#if fx}{#key fx.id}<Celebration kind={fx.kind} color={ART[plot.species].bud} />{/key}{/if}
      </div>
      <h2>{SPECIES[plot.species].label}</h2>
      {#if bloomed && plot.variant}<p class="variant">✨ {bloomName(plot.species, plot.variant)}</p>{/if}
      <p class="dim">{DECK_LABEL[plot.deck]} · {STAGE_NAMES[plot.stage]} ({plot.stage} of {BLOOMED})</p>
      <p class="dim">Watered {plot.waters}×{#if plot.grooms} · Groomed {plot.grooms}×{/if}</p>

      {#if phase === 'thirsty'}
        <button class="primary big-btn" disabled={emptyPool} onclick={() => onStart(index)}>
          {bloomed ? '✂️ Groom' : '💧 Water'} · 10 questions
        </button>
        {#if emptyPool}<p class="dim">No {DECK_LABEL[plot.deck]} in your pool. Turn on a chapter above.</p>{/if}
      {:else if phase === 'resting'}
        <p class="note">{bloomed ? 'Groomed' : 'Watered'}. {bloomed ? 'Ready to groom again' : 'Ready to grow'} in {formatWait(msUntilReady(plot, now))}.</p>
      {:else}
        <button class="hit big-btn" onclick={grow}>✨ Grow to next stage</button>
      {/if}

      <button class="danger remove" onclick={remove}>Remove plant</button>
    {/if}
  </div>
</div>
