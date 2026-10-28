<script lang="ts">
  import { DECK_LABEL, deckReady, type Deck } from '../data/items'
  import { BLOOMED, GROW_COINS, PRESERVE_GROOMS, SKIP_COST, SPECIES, STAGE_NAMES, canPreserve, formatWait, msUntilReady, phaseOf, speciesFor, type Species } from './garden'
  import Celebration from './Celebration.svelte'
  import { flyCoinsFrom } from './coinfly.svelte'
  import PlantSprite from './PlantSprite.svelte'
  import { ART } from './plants'
  import { bloomName } from './blooms'
  import * as sfx from './sfx'
  import { app, growPlot, plantAt, poolFor, preservePlant, removePlant, skipWait, tourDid, type Preserved } from './store.svelte'

  let {
    index,
    now,
    onClose,
    onStart,
    onPreserved,
  }: { index: number; now: number; onClose: () => void; onStart: (i: number) => void; onPreserved: (p: Preserved) => void } = $props()

  const DECKS: Deck[] = ['hiragana', 'katakana', 'kanji', 'vocab', 'grammar']
  // A deck can be planted once it has enough quiz content.
  const playable = deckReady

  const plot = $derived(app.garden[index])
  const phase = $derived(plot ? phaseOf(plot, now) : null)
  const bloomed = $derived(plot?.stage === BLOOMED)
  const emptyPool = $derived(plot ? poolFor(plot.deck).length === 0 : false)

  let fx = $state<{ id: number; kind: 'grow' | 'bloom'; found: boolean } | null>(null)
  let fxId = 0
  let hero = $state<HTMLElement>()

  function grow() {
    const grown = growPlot(index)
    if (!grown) return
    const kind = app.garden[index]?.stage === BLOOMED ? 'bloom' : 'grow'
    fx = { id: ++fxId, kind, found: grown.found }
    flyCoinsFrom(hero, GROW_COINS)
    if (!app.muted) {
      ;(kind === 'bloom' ? sfx.bloom : sfx.grow)()
      if (grown.found) setTimeout(sfx.fanfare, 1300)
    }
  }

  function plant(s: Species) {
    if (!plantAt(index, s) || app.tour !== 'plant') return
    // The tutorial visits the shop before the first watering, so it doesn't offer the quiz yet.
    tourDid('plant')
    onClose()
  }

  function preserve() {
    if (!confirm('Dry this flower and press it into your collection? Its plot will be free to plant again.')) return
    const p = preservePlant(index)
    if (p) onPreserved(p)
  }

  // Checked against the `now` the sheet shows, so the plant is ready for it straight after.
  function skip() {
    if (skipWait(index, now) && !app.muted) sfx.coin()
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
      {#if app.tour === 'plant'}<p class="tour-tip">Pick any flower. Cherry blossom and Tulip grow from hiragana, a gentle place to start.</p>{/if}
      {#each DECKS as d (d)}
        <div class="group">
          <h3>{DECK_LABEL[d]}{#if !playable(d)} <span class="dim">· coming soon</span>{/if}</h3>
          <div class="picks">
            {#each speciesFor(d) as s (s)}
              <button class="pick" disabled={!playable(d)} onclick={() => plant(s)}>
                <PlantSprite species={s} stage={BLOOMED} icon />
                <span>{SPECIES[s].label}</span>
              </button>
            {/each}
          </div>
        </div>
      {/each}
    {:else}
      <div class="hero" bind:this={hero}>
        <PlantSprite species={plot.species} stage={plot.stage} variant={plot.variant} />
        {#if fx}{#key fx.id}<Celebration kind={fx.kind} color={ART[plot.species].bud} /><b class="coin-gain" aria-hidden="true">+{GROW_COINS} 🪙</b>{/key}{/if}
      </div>
      {#if fx?.found}<p class="discovery">✨ New discovery! Added to your collection</p>{/if}
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
        <button class="big-btn" disabled={app.coins < SKIP_COST} onclick={skip}>🪙 {SKIP_COST} · Skip the wait</button>
        {#if app.coins < SKIP_COST}<p class="dim">You have {app.coins} coins. Grow plants and pull weeds to earn more.</p>{/if}
      {:else}
        <button class="hit big-btn" onclick={grow}>✨ Grow to next stage</button>
      {/if}

      {#if bloomed}
        {#if canPreserve(plot)}
          <button class="preserve big-btn" onclick={preserve}>🌸 Preserve · dry and press it</button>
        {:else}
          <p class="dim pgroom">Groom {PRESERVE_GROOMS - plot.grooms} more {PRESERVE_GROOMS - plot.grooms === 1 ? 'time' : 'times'} to preserve this flower for your collection.</p>
        {/if}
      {/if}

      <button class="danger remove" onclick={remove}>Remove plant</button>
    {/if}
  </div>
</div>
