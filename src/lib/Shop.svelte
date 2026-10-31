<script lang="ts">
  import { DECOR_BY_ID, MAX_TIER, SHOP_DECOR, TIER_NAMES, available, nextSpotPrice, tierOf, upgradeCost } from './decor'
  import DecorSprite from './DecorSprite.svelte'
  import { LOOKS, LOOK_BY_ID, PARTS, type Wearing } from './look'
  import { DECOR_SPOTS, scene } from './meadow'
  import * as sfx from './sfx'
  import Sky from './Sky.svelte'
  import { app, buyDecor, buyLook, buySpot, placeDecor, upgradeDecor, wearLook } from './store.svelte'

  // The garden shop: decorations to buy and upgrade, then place on the lawn from the garden, and
  // looks for the garden itself, tried on in a preview before paying.
  // `placeAt` is the lawn spot the shop was opened from: the next purchase is placed there.
  let { placeAt, onPlaced, onGarden }: { placeAt: number | null; onPlaced: () => void; onGarden: () => void } = $props()

  let tab = $state<'decor' | 'garden'>('decor')
  let bought = $state<{ id: string; n: number; placed: boolean } | null>(null)
  let n = 0
  let trying = $state<string | null>(null) // a look shown in the preview, not necessarily owned

  // The gift rock isn't for sale, but it can be upgraded like the rest once it's yours.
  const stock = $derived(app.decor.owned.rock ? [...SHOP_DECOR, DECOR_BY_ID.rock] : SHOP_DECOR)
  const preview = $derived.by((): Wearing => {
    const item = trying ? LOOK_BY_ID[trying] : null
    return item ? { ...app.look.wearing, [item.part]: item.id } : app.look.wearing
  })
  const owns = (id: string) => !LOOK_BY_ID[id].price || app.look.owned.includes(id)
  const spotPrice = $derived(nextSpotPrice(app.decor))

  function buy(id: string) {
    if (!buyDecor(id)) return
    // If the spot was filled meanwhile, it just waits in the inventory.
    const placed = placeAt !== null && placeDecor(placeAt, id)
    if (placeAt !== null) onPlaced()
    bought = { id, n: ++n, placed }
    if (!app.muted) sfx.coin()
  }

  function up(id: string) {
    if (upgradeDecor(id) && !app.muted) sfx.grow()
  }

  function spot() {
    if (buySpot() && !app.muted) sfx.coin()
  }

  function take(id: string) {
    if (!(owns(id) ? wearLook(id) : buyLook(id))) return
    trying = null
    if (!app.muted) sfx.coin()
  }
</script>

<section class="shop">
  <div class="shop-head">
    <h2>Garden Shop <span class="dim"><span lang="ja">おみせ</span> (omise: “shop”)</span></h2>
    <div class="coins" aria-label="{app.coins} coins">🪙 {app.coins}</div>
  </div>

  <div class="shop-tabs" role="group" aria-label="Shop sections">
    <button class="shop-tab" class:on={tab === 'decor'} aria-pressed={tab === 'decor'} onclick={() => (tab = 'decor')}>🏮 Decorations</button>
    <button class="shop-tab" class:on={tab === 'garden'} aria-pressed={tab === 'garden'} onclick={() => (tab = 'garden')}>🎨 Garden</button>
  </div>

  {#if tab === 'decor'}
    <p class="dim">Buy decorations with the coins you earn, then tap a <b>+</b> on your lawn to place them. Upgrades apply to every copy you own.</p>

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
      {#each stock as d (d.id)}
        {@const owned = app.decor.owned[d.id] ?? 0}
        {@const short = app.coins < d.price}
        {@const tier = tierOf(app.decor, d.id)}
        {@const cost = upgradeCost(app.decor, d.id)}
        <div class="shop-item" class:just={bought?.id === d.id}>
          <div class="shop-art"><DecorSprite id={d.id} {tier} /></div>
          <b>{d.label}</b>
          <span class="shop-ja"><span lang="ja">{d.ja}</span> <span class="dim">({d.reading})</span></span>
          {#if owned}<span class="dim">Owned {owned}{#if available(app.decor, d.id) < owned} · {owned - available(app.decor, d.id)} placed{/if}</span>{/if}
          {#if !d.gift}
            <button class="primary" disabled={short} onclick={() => buy(d.id)} aria-label="Buy {d.label} for {d.price} coins">🪙 {d.price}</button>
            {#if short}<span class="dim">{d.price - app.coins} more coins</span>{/if}
          {/if}
          {#if owned}
            <div class="tier-row">
              <span class="tier-stars" aria-label="{TIER_NAMES[tier]}, level {tier + 1} of {MAX_TIER + 1}">{'★'.repeat(tier + 1)}{'☆'.repeat(MAX_TIER - tier)}</span>
              {#if cost !== null}
                <button class="tier-up" disabled={app.coins < cost} onclick={() => up(d.id)} aria-label="Upgrade {d.label} to {TIER_NAMES[tier + 1]} for {cost} coins">
                  <DecorSprite id={d.id} tier={tier + 1} /> ⬆ 🪙 {cost}
                </button>
              {:else}
                <span class="dim">Fully upgraded</span>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <p class="dim">Change the garden itself. Tap anything to try it on here, and pay only if you like it.</p>

    <div class="look-stage">
      <div class="look-preview" aria-hidden="true">
        {@html scene(preview)}
        <Sky sky={preview.sky} />
      </div>
      {#if trying && !owns(trying)}
        <p class="look-note dim">Trying on {LOOK_BY_ID[trying].label}</p>
      {/if}
    </div>

    {#each PARTS as { part, title } (part)}
      <div class="look-part">
        <h3>{title}</h3>
        <div class="look-grid">
          {#each LOOKS.filter((l) => l.part === part) as l (l.id)}
            {@const worn = app.look.wearing[part] === l.id}
            {@const mine = owns(l.id)}
            <div class="look-card" class:trying={trying === l.id} class:worn>
              <button class="look-pick" aria-label="Try on {l.label}" onclick={() => (trying = worn ? null : l.id)}>
                <span class="look-swatch" style="background:{l.swatch}" aria-hidden="true">{l.icon ?? ''}</span>
                <b>{l.label}</b>
                <span class="shop-ja"><span lang="ja">{l.ja}</span> <span class="dim">({l.reading})</span></span>
              </button>
              {#if worn}
                <span class="look-worn">In your garden</span>
              {:else if mine}
                <button class="primary" onclick={() => take(l.id)} aria-label="Use {l.label}">Use</button>
              {:else}
                <button class="primary" disabled={app.coins < l.price} onclick={() => take(l.id)} aria-label="Buy {l.label} for {l.price} coins">🪙 {l.price}</button>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/each}

    <div class="look-part">
      <h3>Lawn space</h3>
      <div class="look-grid">
        <div class="look-card">
          <span class="look-swatch" style="background:linear-gradient(160deg, #6cbb4f, #4a973a)" aria-hidden="true">➕</span>
          <b>Extra decoration spot</b>
          <span class="dim">{app.decor.open} of {DECOR_SPOTS.length} open</span>
          {#if spotPrice !== null}
            <button class="primary" disabled={app.coins < spotPrice} onclick={spot} aria-label="Buy a decoration spot for {spotPrice} coins">🪙 {spotPrice}</button>
          {:else}
            <span class="look-worn">All open</span>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</section>
