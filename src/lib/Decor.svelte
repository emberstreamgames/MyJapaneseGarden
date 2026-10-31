<script lang="ts">
  import { DECOR, DECOR_BY_ID, MAX_TIER, TIER_NAMES, available, tierOf, upgradeCost } from './decor'
  import DecorSprite from './DecorSprite.svelte'
  import { DECOR_SPOTS, VIEW, decorBox } from './meadow'
  import * as sfx from './sfx'
  import { app, giftRock, moveDecor, placeDecor, storeDecor, upgradeDecor } from './store.svelte'

  // Decorations on the lawn. An empty spot shows a faint marker: tap it to pick something from the
  // inventory. Tap a decoration to upgrade it or put it back in the inventory, or drag it to another
  // spot (a decoration already there swaps places with it).
  // `onShop` gets the spot the picker was opened for, so the next purchase can go straight there.
  let { onShop }: { onShop: (spot: number | null) => void } = $props()

  const DRAG_START = 6 // px of travel before a press counts as a drag
  const REACH = 38 // bed units from a spot's middle that still count as dropping on it

  let picking = $state<number | null>(null)
  let inspecting = $state<number | null>(null) // the decoration whose sheet is open
  let gifted = $state(false) // the tutorial's rock was just placed: the sheet says so and points to the shop
  // On the tutorial's shop step, the first + tapped holds a gift instead of the inventory.
  const gift = $derived(app.tour === 'shop' && !app.decor.owned.rock)
  const rock = DECOR_BY_ID.rock
  // `x`/`y` are the pointer in bed units while dragging.
  let drag = $state<{ from: number; id: string; x: number; y: number; over: number | null; moved: boolean } | null>(null)
  let start = { x: 0, y: 0 }
  let dragged = false // the last press was a drag, so its click doesn't also store the decoration
  let bed: HTMLElement | null = null

  const spots = $derived(DECOR_SPOTS.slice(0, app.decor.open))
  const inventory = $derived(DECOR.filter((d) => available(app.decor, d.id) > 0))
  const mid = (i: number) => ({ x: DECOR_SPOTS[i].x, y: DECOR_SPOTS[i].y - 22 })

  function toBed(e: PointerEvent) {
    const r = bed!.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * VIEW.w, y: ((e.clientY - r.top) / r.height) * VIEW.h }
  }

  function nearest(p: { x: number; y: number }) {
    let best: number | null = null, d = REACH
    spots.forEach((_, i) => {
      const m = mid(i), dist = Math.hypot(p.x - m.x, p.y - m.y)
      if (dist < d) [best, d] = [i, dist]
    })
    return best
  }

  function down(e: PointerEvent, i: number) {
    const id = app.decor.placed[i]
    if (!id || (e.pointerType === 'mouse' && e.button !== 0)) return
    const el = e.currentTarget as HTMLElement
    bed = el.closest('.bed')
    el.setPointerCapture(e.pointerId)
    start = { x: e.clientX, y: e.clientY }
    dragged = false
    drag = { from: i, id, x: 0, y: 0, over: null, moved: false }
  }

  function moveTo(e: PointerEvent) {
    if (!drag || !bed) return
    if (!drag.moved && Math.hypot(e.clientX - start.x, e.clientY - start.y) < DRAG_START) return
    const p = toBed(e)
    drag.moved = true
    drag.x = p.x
    drag.y = p.y
    const over = nearest(p)
    if (over !== drag.over && over !== null && over !== drag.from && !app.muted) sfx.coinLand()
    drag.over = over
  }

  function up() {
    const d = drag
    drag = null
    if (!d?.moved) return
    dragged = true
    if (d.over !== null && d.over !== d.from && moveDecor(d.from, d.over) && !app.muted) sfx.pluck()
  }

  function tapPlaced(i: number) {
    if (dragged) {
      dragged = false
      return
    }
    inspecting = i
  }

  function putAway() {
    if (inspecting !== null && storeDecor(inspecting) && !app.muted) sfx.pluck()
    inspecting = null
  }

  function upgradeIt(id: string) {
    if (upgradeDecor(id) && !app.muted) sfx.grow()
  }

  function choose(id: string) {
    if (picking !== null && placeDecor(picking, id) && !app.muted) sfx.grow()
    picking = null
  }

  function placeGift() {
    if (picking === null || !giftRock(picking)) return
    gifted = true
    if (!app.muted) sfx.grow()
  }

  function close() {
    picking = null
    inspecting = null
    gifted = false
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (picking !== null || inspecting !== null) close()
      else drag = null
    }
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="decor-layer" class:dragging={drag?.moved}>
  {#each spots as spot, i (i)}
    {@const id = app.decor.placed[i]}
    {@const target = drag?.moved && drag.over === i && drag.from !== i}
    {#if id}
      <button
        class="decor"
        class:lifted={drag?.moved && drag.from === i}
        class:swap={target}
        style={decorBox(spot)}
        aria-label="{DECOR_BY_ID[id].label}. Tap for options, or drag it to another spot"
        onpointerdown={(e) => down(e, i)}
        onpointermove={moveTo}
        onpointerup={up}
        onpointercancel={() => (drag = null)}
        onclick={() => tapPlaced(i)}
      >
        <DecorSprite {id} tier={tierOf(app.decor, id)} />
        {#if target}<span class="decor-tag">⇄ Swap</span>{/if}
      </button>
    {:else}
      <button class="decor-spot" class:target style={decorBox(spot)} aria-label="Empty decoration spot. Tap to place a decoration" onclick={() => (picking = i)}>
        {#if target && drag}
          <span class="decor-preview"><DecorSprite id={drag.id} tier={tierOf(app.decor, drag.id)} /></span>
          <span class="decor-tag">Move here</span>
        {:else}
          <span class="decor-plus" aria-hidden="true">+</span>
        {/if}
      </button>
    {/if}
  {/each}

  {#if drag?.moved}
    <div class="decor-ghost" style="left:{(drag.x / VIEW.w) * 100}%;top:{(drag.y / VIEW.h) * 100}%" aria-hidden="true">
      <DecorSprite id={drag.id} tier={tierOf(app.decor, drag.id)} />
    </div>
  {/if}
</div>

{#if picking !== null}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="backdrop" onclick={(e) => e.target === e.currentTarget && close()}>
    <div class="sheet" role="dialog" aria-modal="true" aria-label={gift || gifted ? 'A gift for your garden' : 'Place a decoration'}>
      <button class="x" aria-label="Close" onclick={close}>✕</button>
      {#if gifted}
        <div class="decor-gift"><DecorSprite id={rock.id} /></div>
        <h2>It looks lovely!</h2>
        <p class="dim">Find more decorations in the garden shop, bought with the coins you earn.</p>
        <button class="primary big-btn" onclick={() => (close(), onShop(null))}>🛍️ Open the garden shop</button>
      {:else if gift}
        <h2>🎁 A gift for you!</h2>
        <div class="decor-gift"><DecorSprite id={rock.id} /></div>
        <b>{rock.label}</b>
        <span class="shop-ja"><span lang="ja">{rock.ja}</span> <span class="dim">({rock.reading})</span></span>
        <p class="dim">Every garden needs a first decoration. This one is on the house.</p>
        <button class="primary big-btn" onclick={placeGift}>Place it here</button>
      {:else if inventory.length}
        <h2>Place a decoration</h2>
        <p class="dim">Pick one from your inventory. You can drag it to another spot later, or tap it for options.</p>
        <div class="decor-picks">
          {#each inventory as d (d.id)}
            {@const n = available(app.decor, d.id)}
            <button class="decor-pick" onclick={() => choose(d.id)}>
              <DecorSprite id={d.id} tier={tierOf(app.decor, d.id)} />
              <span>{d.label}</span>
              <span class="dim" lang="ja">{d.ja}</span>
              {#if n > 1}<b class="decor-count">×{n}</b>{/if}
            </button>
          {/each}
        </div>
        <button class="linkish shop-link" onclick={() => onShop(picking)}>Visit the garden shop for more 🛍️</button>
      {:else}
        <h2>Place a decoration</h2>
        <p class="dim">Your inventory is empty. Decorations can be purchased in the garden shop.</p>
        <button class="primary big-btn" onclick={() => onShop(picking)}>🛍️ Open the garden shop</button>
      {/if}
    </div>
  </div>
{/if}

{#if inspecting !== null && app.decor.placed[inspecting]}
  {@const id = app.decor.placed[inspecting]!}
  {@const d = DECOR_BY_ID[id]}
  {@const tier = tierOf(app.decor, id)}
  {@const cost = upgradeCost(app.decor, id)}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="backdrop" onclick={(e) => e.target === e.currentTarget && close()}>
    <div class="sheet" role="dialog" aria-modal="true" aria-label={d.label}>
      <button class="x" aria-label="Close" onclick={close}>✕</button>
      <div class="decor-sheet-art">
        {#key tier}
          <DecorSprite {id} {tier} />
        {/key}
        {#if cost !== null}
          <span class="decor-arrow" aria-hidden="true">→</span>
          <DecorSprite {id} tier={tier + 1} />
        {/if}
      </div>
      <h2>{d.label}</h2>
      <span class="shop-ja"><span lang="ja">{d.ja}</span> <span class="dim">({d.reading})</span></span>
      <p class="tier-stars" aria-label="{TIER_NAMES[tier]}, level {tier + 1} of {MAX_TIER + 1}">{'★'.repeat(tier + 1)}{'☆'.repeat(MAX_TIER - tier)} <span class="dim">{TIER_NAMES[tier]}</span></p>
      {#if cost !== null}
        <button class="primary big-btn" disabled={app.coins < cost} onclick={() => upgradeIt(id)} aria-label="Upgrade to {TIER_NAMES[tier + 1]} for {cost} coins">Upgrade to {TIER_NAMES[tier + 1]} · 🪙 {cost}</button>
        <p class="dim">You have 🪙 {app.coins}. Upgrades apply to every {d.label.toLowerCase()} you own.</p>
      {/if}
      <button class="linkish shop-link" onclick={putAway}>Put it back in your inventory</button>
    </div>
  </div>
{/if}
