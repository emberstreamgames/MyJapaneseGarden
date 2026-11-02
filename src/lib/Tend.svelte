<script lang="ts">
  import type { Item } from '../data/items'
  import { TEND_PER_DAY } from './garden'
  import GardenQuiz from './GardenQuiz.svelte'
  import { app, startTend, tendsLeft, weakItems } from './store.svelte'

  // A short extra session on the shakiest words, a couple of times a day at most. Spaced practice
  // beats cramming, so this stays small and points the player at a break afterwards.
  let { onDone }: { onDone: () => void } = $props()

  let cards = $state<Item[] | null>(null)
  const left = $derived(tendsLeft())
  const weak = $derived.by(() => (void app.stats, weakItems()))

  function start() {
    if (weak.length && startTend()) cards = weak
  }
</script>

{#if cards}
  <GardenQuiz deck={cards[0].type} mode="tend" {cards} bonus={0} onComplete={() => null} onClose={onDone} />
{:else}
  <section class="tend">
    <h2>🌿 Tend weak words</h2>
    {#if !left}
      <p>That's plenty for today. Words settle while you rest, so give them until tomorrow.</p>
      <button class="primary big-btn" onclick={onDone}>Back to the garden</button>
    {:else if !weak.length}
      <p>No weak words right now. Water a plant, and any words you miss will show up here.</p>
      <button class="primary big-btn" onclick={onDone}>Back to the garden</button>
    {:else}
      <p>A quick go at your {weak.length === 1 ? 'shakiest word' : `${weak.length} shakiest words`}. Short sessions with breaks stick better than long ones.</p>
      <p class="dim">{left} of {TEND_PER_DAY} sessions left today</p>
      <button class="primary big-btn" onclick={start}>Start</button>
    {/if}
  </section>
{/if}
