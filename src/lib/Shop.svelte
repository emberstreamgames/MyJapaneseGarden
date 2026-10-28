<script lang="ts">
  import { DECOR, available } from './decor'
  import DecorSprite from './DecorSprite.svelte'
  import * as sfx from './sfx'
  import { app, buyDecor, placeDecor } from './store.svelte'

  // The garden shop: decorations to buy with coins, then place on the lawn from the garden.
  // `placeAt` is the lawn spot the shop was opened from: the next purchase is placed there.
  let { placeAt, onPlaced, onGarden }: { placeAt: number | null; onPlaced: () => void; onGarden: () => void } = $props()

  let bought = $state<{ id: string; n: number; placed: boolean } | null>(null)
  let n = 0

  function buy(id: string) {
    if (!buyDecor(id)) return
    // If the spot was filled meanwhile, it just waits in the inventory.
    const placed = placeAt !== null && placeDecor(placeAt, id)
    if (placeAt !== null) onPlaced()
    bought = { id, n: ++n, placed }
    if (!app.muted) sfx.coin()
  }
</script>

<section class="shop">
  <div class="shop-head">
    <h2>Garden Shop <span class="dim"><span lang="ja">おみせ</span> (omise: “shop”)</span></h2>
    <div class="coins" aria-label="{app.coins} coins">🪙 {app.coins}</div>
  </div>
  <p class="dim">Buy decorations with the coins you earn, then tap a <b>+</b> on your lawn to place them.</p>

  {#if placeAt !== null}
    <div class="shop-note pending" role="status">Your next purchase will be placed on the spot you picked.</div>
  {/if}
  {#if bought}
    {#key bought.n}
      <div class="shop-note" role="status">
        {#if bought.placed}
          <span>Bought and placed on your lawn!</span>
          <button class="primary" onclick={onGarden}>See it in the garden</button>
        {:else}
          <span>Bought! It's waiting in your inventory.</span>
          <button class="primary" onclick={onGarden}>Place it in the garden</button>
        {/if}
      </div>
    {/key}
  {/if}

  <div class="shop-grid">
    {#each DECOR as d (d.id)}
      {@const owned = app.decor.owned[d.id] ?? 0}
      {@const short = app.coins < d.price}
      <div class="shop-item" class:just={bought?.id === d.id}>
        <div class="shop-art"><DecorSprite id={d.id} /></div>
        <b>{d.label}</b>
        <span class="shop-ja"><span lang="ja">{d.ja}</span> <span class="dim">({d.reading})</span></span>
        {#if owned}<span class="dim">Owned {owned}{#if available(app.decor, d.id) < owned} · {owned - available(app.decor, d.id)} placed{/if}</span>{/if}
        <button class="primary" disabled={short} onclick={() => buy(d.id)} aria-label="Buy {d.label} for {d.price} coins">🪙 {d.price}</button>
        {#if short}<span class="dim">{d.price - app.coins} more coins</span>{/if}
      </div>
    {/each}
  </div>
</section>
