<script lang="ts">
  import { DECK_LABEL, deckReady, type Deck } from '../data/items'
  import { BLOOMED, PRESERVE_GROOMS, SKIP_COST, SPECIES, STAGE_NAMES, canPreserve, formatWait, msUntilReady, phaseOf, speciesFor, type Species } from './garden'
  import ConfirmSheet from './ConfirmSheet.svelte'
  import FlowerHead from './FlowerHead.svelte'
  import PlantSprite from './PlantSprite.svelte'
  import { BLOOMS, bloomName } from './blooms'
  import { flowerName } from './collection'
  import * as sfx from './sfx'
  import { app, chapterSheet, plantAt, poolFor, preservePlant, removePlant, seedPackets, skipWait, tourDid, type Preserved } from './store.svelte'

  let {
    index,
    now,
    onClose,
    onStart,
    onGrow,
    onPreserved,
  }: {
    index: number
    now: number
    onClose: () => void
    onStart: (i: number) => void
    onGrow: (i: number) => void
    onPreserved: (p: Preserved) => void
  } = $props()

  const DECKS: Deck[] = ['hiragana', 'katakana', 'kanji', 'vocab', 'grammar']
  // A deck can be planted once it has enough quiz content.
  const playable = deckReady

  const plot = $derived(app.garden[index])
  const phase = $derived(plot ? phaseOf(plot, now) : null)
  const bloomed = $derived(plot?.stage === BLOOMED)
  const emptyPool = $derived(plot ? poolFor(plot.deck).length === 0 : false)

  let choosing = $state<Species | null>(null) // species picked, with a seed packet to spend on its bloom

  // With a seed packet in hand, the player can pick the bloom first.
  function pick(s: Species) {
    if (seedPackets() > 0 && !app.tour) choosing = s
    else plant(s)
  }

  function plant(s: Species, variant?: number) {
    choosing = null
    if (!plantAt(index, s, variant) || app.tour !== 'plant') return
    // The tutorial visits the shop before the first watering, so it doesn't offer the quiz yet.
    tourDid('plant')
    onClose()
  }

  let asking = $state<'preserve' | 'remove' | null>(null) // which confirmation is open

  function preserve() {
    asking = null
    const p = preservePlant(index)
    if (p) onPreserved(p)
  }

  // Checked against the `now` the sheet shows, so the plant is ready for it straight after.
  // A paid skip goes straight on to growing; a bloom just goes back to needing a groom.
  function skip() {
    if (!skipWait(index, now)) return
    if (!app.muted) sfx.coin()
    if (!bloomed) onGrow(index)
  }

  function remove() {
    asking = null
    removePlant(index)
    onClose()
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

    {#if !plot && choosing}
      {@const s = choosing}
      <h2>Choose a bloom</h2>
      <p class="dim">Spend a seed packet on a {SPECIES[s].label.toLowerCase()} colour ({seedPackets()} left), or keep it for later.</p>
      <div class="bloom-picks">
        {#each Array(BLOOMS[s].length + 1) as _, v (v)}
          <button class="bloom-pick" onclick={() => plant(s, v)}>
            <FlowerHead species={s} variant={v} />
            <span>{flowerName(s, v)}</span>
          </button>
        {/each}
      </div>
      <button class="big-btn" onclick={() => plant(s)}>🎲 Surprise me</button>
    {:else if !plot}
      <h2>Choose a plant</h2>
      <p class="dim">Each plant grows by studying its quiz type.</p>
      {#if app.tour === 'plant'}<p class="tour-tip">Pick any flower. Cherry blossom and Tulip grow from hiragana, a gentle place to start.</p>{/if}
      {#each DECKS as d (d)}
        <div class="group">
          <h3>{DECK_LABEL[d]}{#if !playable(d)} <span class="dim">· coming soon</span>{/if}</h3>
          <div class="picks">
            {#each speciesFor(d) as s (s)}
              <button class="pick" disabled={!playable(d)} onclick={() => pick(s)}>
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
      </div>
      <h2>{SPECIES[plot.species].label}</h2>
      {#if bloomed && plot.variant}<p class="variant">✨ {bloomName(plot.species, plot.variant)}</p>{/if}
      <p class="dim">{DECK_LABEL[plot.deck]} · {STAGE_NAMES[plot.stage]} ({plot.stage} of {BLOOMED})</p>
      <p class="dim">Watered {plot.waters}×{#if plot.grooms} · Groomed {plot.grooms}×{/if}</p>

      {#if phase === 'thirsty'}
        <button class="primary big-btn" disabled={emptyPool} onclick={() => onStart(index)}>
          {bloomed ? '✂️ Groom' : '💧 Water'} · 10 questions
        </button>
        {#if emptyPool}
          <p class="dim">None of your chapters have {DECK_LABEL[plot.deck]} yet.</p>
          <button class="big-btn" onclick={() => (chapterSheet.open = true)}>Choose chapters</button>
        {/if}
      {:else if phase === 'resting'}
        <p class="note">{bloomed ? 'Groomed' : 'Watered'}. {bloomed ? 'Ready to groom again' : 'Ready to grow'} in {formatWait(msUntilReady(plot, now))}.</p>
        <button class="big-btn" disabled={app.coins < SKIP_COST} onclick={skip}>🪙 {SKIP_COST} · Skip the wait</button>
        {#if app.coins < SKIP_COST}<p class="dim">You have {app.coins} coins. Grow plants and pull weeds to earn more.</p>{/if}
      {:else}
        <!-- Only when the rest ran out with the sheet already open: a ready plant skips the sheet. -->
        <button class="hit big-btn" onclick={() => onGrow(index)}>✨ Grow to next stage</button>
      {/if}

      {#if bloomed}
        {#if canPreserve(plot)}
          <button class="preserve big-btn" onclick={() => (asking = 'preserve')}>🌸 Preserve · dry and press it</button>
        {:else}
          <p class="dim pgroom">Groom {PRESERVE_GROOMS - plot.grooms} more {PRESERVE_GROOMS - plot.grooms === 1 ? 'time' : 'times'} to preserve this flower for your collection.</p>
        {/if}
      {/if}

      <button class="danger remove" onclick={() => (asking = 'remove')}>Remove plant</button>
    {/if}
  </div>
</div>

{#if asking === 'remove'}
  <ConfirmSheet title="Remove this plant?" yes="Remove plant" no="Keep it" danger onYes={remove} onNo={() => (asking = null)}>
    <p class="dim">This cannot be undone.</p>
  </ConfirmSheet>
{:else if asking && plot}
  <ConfirmSheet title="Press this flower?" yes="🌸 Press it" no="Keep growing" onYes={preserve} onNo={() => (asking = null)}>
    <div class="confirm-art"><FlowerHead species={plot.species} variant={plot.variant} /></div>
    <p class="dim">It will be dried and pressed into your collection, and this plot will be free to plant again.</p>
  </ConfirmSheet>
{/if}
