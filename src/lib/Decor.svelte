<script lang="ts">
  import { DECOR, DECOR_BY_ID, available } from './decor'
  import DecorSprite from './DecorSprite.svelte'
  import { DECOR_SPOTS, VIEW, decorBox } from './meadow'
  import * as sfx from './sfx'
  import { app, moveDecor, placeDecor, storeDecor } from './store.svelte'

  // Decorations on the lawn. An empty spot shows a faint marker: tap it to pick something from the
  // inventory. Tap a decoration to put it back in the inventory, or drag it to another spot (a
  // decoration already there swaps places with it).
  // `onShop` gets the spot the picker was opened for, so the next purchase can go straight there.
  let { onShop }: { onShop: (spot: number | null) => void } = $props()

  const DRAG_START = 6 // px of travel before a press counts as a drag
  const REACH = 38 // bed units from a spot's middle that still count as dropping on it

  let picking = $state<number | null>(null)
  // `x`/`y` are the pointer in bed units while dragging.
  let drag = $state<{ from: number; id: string; x: number; y: number; over: number | null; moved: boolean } | null>(null)
  let start = { x: 0, y: 0 }
  let dragged = false // the last press was a drag, so its click doesn't also store the decoration
  let bed: HTMLElement | null = null

  const inventory = $derived(DECOR.filter((d) => available(app.decor, d.id) > 0))
  const mid = (i: number) => ({ x: DECOR_SPOTS[i].x, y: DECOR_SPOTS[i].y - 22 })

  function toBed(e: PointerEvent) {
    const r = bed!.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * VIEW.w, y: ((e.clientY - r.top) / r.height) * VIEW.h }
  }

  function nearest(p: { x: number; y: number }) {
    let best: number | null = null, d = REACH
    DECOR_SPOTS.forEach((_, i) => {
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
    if (storeDecor(i) && !app.muted) sfx.pluck()
  }

  function choose(id: string) {
    if (picking !== null && placeDecor(picking, id) && !app.muted) sfx.grow()
    picking = null
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (picking !== null) picking = null
      else drag = null
    }
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="decor-layer" class:dragging={drag?.moved}>
  {#each DECOR_SPOTS as spot, i (i)}
    {@const id = app.decor.placed[i]}
    {@const target = drag?.moved && drag.over === i && drag.from !== i}
    {#if id}
      <button
        class="decor"
        class:lifted={drag?.moved && drag.from === i}
        class:swap={target}
        style={decorBox(spot)}
        aria-label="{DECOR_BY_ID[id].label}. Tap to put it back in your inventory, or drag it to another spot"
        onpointerdown={(e) => down(e, i)}
        onpointermove={moveTo}
        onpointerup={up}
        onpointercancel={() => (drag = null)}
        onclick={() => tapPlaced(i)}
      >
        <DecorSprite {id} />
        {#if target}<span class="decor-tag">⇄ Swap</span>{/if}
      </button>
    {:else}
      <button class="decor-spot" class:target style={decorBox(spot)} aria-label="Empty decoration spot. Tap to place a decoration" onclick={() => (picking = i)}>
        {#if target && drag}
          <span class="decor-preview"><DecorSprite id={drag.id} /></span>
          <span class="decor-tag">Move here</span>
        {:else}
          <span class="decor-plus" aria-hidden="true">+</span>
        {/if}
      </button>
    {/if}
  {/each}

  {#if drag?.moved}
    <div class="decor-ghost" style="left:{(drag.x / VIEW.w) * 100}%;top:{(drag.y / VIEW.h) * 100}%" aria-hidden="true">
      <DecorSprite id={drag.id} />
    </div>
  {/if}
</div>

{#if picking !== null}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="backdrop" onclick={(e) => e.target === e.currentTarget && (picking = null)}>
    <div class="sheet" role="dialog" aria-modal="true" aria-label="Place a decoration">
      <button class="x" aria-label="Close" onclick={() => (picking = null)}>✕</button>
      <h2>Place a decoration</h2>
      {#if inventory.length}
        <p class="dim">Pick one from your inventory. You can drag it to another spot later, or tap it to put it back.</p>
        <div class="decor-picks">
          {#each inventory as d (d.id)}
            {@const n = available(app.decor, d.id)}
            <button class="decor-pick" onclick={() => choose(d.id)}>
              <DecorSprite id={d.id} />
              <span>{d.label}</span>
              <span class="dim" lang="ja">{d.ja}</span>
              {#if n > 1}<b class="decor-count">×{n}</b>{/if}
            </button>
          {/each}
        </div>
        <button class="linkish shop-link" onclick={() => onShop(picking)}>Visit the garden shop for more 🛍️</button>
      {:else}
        <p class="dim">Your inventory is empty. Decorations can be purchased in the garden shop.</p>
        <button class="primary big-btn" onclick={() => onShop(picking)}>🛍️ Open the garden shop</button>
      {/if}
    </div>
  </div>
{/if}
