<script lang="ts">
  import { untrack } from 'svelte'
  import type { Item } from '../data/items'
  import { flyCoinsFrom } from './coinfly.svelte'
  import { BLOOMED, visitorCoins } from './garden'
  import { BLEED, PLANT_SCALE, SPOTS, VIEW, WEED_SPOTS } from './meadow'
  import { STEM_TOP } from './plants'
  import * as sfx from './sfx'
  import { app, collectVisitor, reminderItem, tourDid, visitorReady } from './store.svelte'

  // Garden visitors. Once a visitor is due (garden.ts visitorDue), a butterfly or a bird flies in and
  // settles: butterflies on an open flower when there is one, birds on the lawn. Tapping it opens a
  // card with a word to review and a few coins, collected on confirm. One that isn't thanked flies
  // off after a while and a later one comes instead.

  type Kind = 'butterfly' | 'bird'
  type Pt = { x: number; y: number }
  interface Visitor {
    id: number
    kind: Kind
    look: number
    at: Pt // where it settles, in bed units
    from: Pt
    state: 'in' | 'perched' | 'out'
    note: boolean // still carrying its word, rolled up; handed over once thanked
  }

  const BUTTERFLIES = [
    { name: 'cabbage white', wing: '#fbfbf6', hind: '#eef0e2', spot: '#3a3a3a' },
    { name: 'swallowtail', wing: '#ffd84d', hind: '#f5b324', spot: '#2b1b14' },
    { name: 'blue butterfly', wing: '#8fd3ff', hind: '#4f8fe0', spot: '#ffffff' },
    { name: 'orange tip', wing: '#ffffff', hind: '#f6f1df', spot: '#ff8a3d' },
  ]
  const BIRDS = [
    { name: 'white-eye', body: '#9bbf3f', belly: '#e9eccd', head: '#a9c94a', wing: '#7a9a2a', ring: '#ffffff', cheek: '' },
    { name: 'sparrow', body: '#a0714a', belly: '#e8dccb', head: '#7a4a2a', wing: '#6e4a2e', ring: '', cheek: '#2b1b14' },
  ]

  const LINGER = 150_000 // ms a visitor waits to be thanked
  const SIZE = 1.5 // drawn larger than life so it's easy to spot and tap
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  let visitor = $state<Visitor | null>(null)
  let card = $state<{ v: Visitor; item: Item | null; coins: number } | null>(null)
  let gain = $state<{ id: number; x: number; y: number; coins: number } | null>(null)
  let n = 0
  let el: SVGGElement | undefined
  let linger: ReturnType<typeof setTimeout> | undefined

  const rand = (a: number, b: number) => a + Math.random() * (b - a)
  const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]

  // A free lawn spot (no weed on it), lifted a touch so feet sit on the grass.
  function lawn(): Pt {
    const taken = new Set(app.weeds.map((w) => w.spot))
    const free = WEED_SPOTS.filter((_, i) => !taken.has(i))
    const p = pick(free.length ? free : WEED_SPOTS)
    return { x: p.x, y: p.y - 2 }
  }

  // The top of a flower head on plot i (plants are drawn at PLANT_SCALE with their ground on the spot).
  const flowerTop = (i: number): Pt => ({ x: SPOTS[i].x + rand(-3, 3), y: SPOTS[i].y - (86 - STEM_TOP[BLOOMED]) * PLANT_SCALE - 4 })

  function spawn() {
    // During the tutorial, visitors wait for their own step.
    if (document.hidden || visitor || card || !visitorReady() || (app.tour && app.tour !== 'visitor')) return
    const kind: Kind = Math.random() < 0.55 ? 'butterfly' : 'bird'
    const flowers = app.garden.flatMap((p, i) => (p && p.stage >= BLOOMED - 1 ? [i] : []))
    const at = kind === 'butterfly' && flowers.length && Math.random() < 0.85 ? flowerTop(pick(flowers)) : lawn()
    const from = { x: Math.min(VIEW.w + 40, Math.max(-40, at.x + rand(-180, 180))), y: -30 }
    visitor = { id: ++n, kind, look: Math.floor(Math.random() * (kind === 'bird' ? BIRDS : BUTTERFLIES).length), at, from, state: 'in', note: true }
  }

  $effect(() => {
    let t: ReturnType<typeof setTimeout>
    const loop = (wait: number) => (t = setTimeout(() => (spawn(), loop(rand(8000, 20000))), wait))
    loop(rand(3000, 8000))
    return () => {
      clearTimeout(t)
      clearTimeout(linger)
    }
  })

  // The tutorial calls one in straight away.
  $effect(() => {
    if (app.tour === 'visitor' && visitorReady()) untrack(spawn)
  })

  // Keyframes from a to b: butterflies flutter in loops, birds swoop in an arc. Birds face their way.
  function path(v: Visitor, a: Pt, b: Pt, arriving: boolean): Keyframe[] {
    const face = v.kind === 'bird' && b.x < a.x ? -1 : 1
    return Array.from({ length: 41 }, (_, k) => {
      const t = k / 40
      const e = arriving ? 1 - (1 - t) ** 2 : t * t
      const fade = arriving ? 1 - t : t // wobble dies down as it settles, grows as it leaves
      let x = a.x + (b.x - a.x) * e, y = a.y + (b.y - a.y) * e
      if (v.kind === 'butterfly') {
        x += Math.sin(t * Math.PI * 5) * 16 * fade
        y += Math.sin(t * Math.PI * 8) * 9 * fade
      } else y -= Math.sin(t * Math.PI) * 24 * fade
      return { transform: `translate(${x}px, ${y}px) scale(${face * SIZE}, ${SIZE})` }
    })
  }

  const still = (p: Pt) => `translate(${p.x}px, ${p.y}px) scale(${SIZE})`

  function settle() {
    if (!visitor) return
    visitor.state = 'perched'
    clearTimeout(linger)
    const wait = () => (linger = setTimeout(() => (card || app.tour === 'visitor' ? wait() : leave()), LINGER))
    wait()
  }

  // Runs once per visitor ({#key} remounts it); untracked so settling doesn't restart the flight.
  function fly(node: SVGGElement) {
    return untrack(() => {
      el = node
      const v = visitor!
      if (reduced) {
        node.style.transform = still(v.at)
        settle()
        return
      }
      const a = node.animate(path(v, v.from, v.at, true), { duration: v.kind === 'bird' ? 2200 : 4200, fill: 'forwards' })
      a.finished.then(settle, () => {})
      return () => a.cancel()
    })
  }

  function leave() {
    const v = visitor
    if (!v || v.state === 'out') return
    v.state = 'out'
    clearTimeout(linger)
    if (reduced || !el) {
      visitor = null
      return
    }
    const to = { x: v.at.x + rand(-160, 160), y: -40 }
    const a = el.animate(path(v, v.at, to, false), { duration: v.kind === 'bird' ? 1600 : 3200, fill: 'forwards' })
    a.finished.then(() => visitor?.id === v.id && (visitor = null), () => {})
  }

  function tap() {
    const v = visitor
    if (!v || v.state === 'out') return
    card = { v, item: reminderItem(), coins: visitorCoins(Math.random()) }
    if (!app.muted) (v.kind === 'bird' ? sfx.chirp : sfx.flutter)()
  }

  function thank() {
    if (!card) return
    const { coins } = card
    card = null
    if (!collectVisitor(coins)) return leave()
    tourDid('visitor')
    if (!app.muted) sfx.coin()
    if (visitor) visitor.note = false
    flyCoinsFrom(el, coins)
    if (el) {
      const bed = el.closest('.visitors')!.getBoundingClientRect(), box = el.getBoundingClientRect()
      gain = { id: ++n, coins, x: ((box.left + box.width / 2 - bed.left) / bed.width) * 100, y: ((box.top - bed.top) / bed.height) * 100 }
    }
    leave()
  }

  function onKey(e: KeyboardEvent) {
    if (card && e.key === 'Escape') card = null
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="visitors">
  <svg viewBox="{-BLEED} 0 {VIEW.w + BLEED * 2} {VIEW.h}" preserveAspectRatio="xMidYMid slice" aria-hidden={!visitor}>
    {#if visitor}
      {@const v = visitor}
      {#key v.id}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <g
          class="visitor {v.kind} {v.state}"
          role="button"
          tabindex="0"
          aria-label="A {v.kind} landed in your garden, tap to say hello"
          onclick={tap}
          onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && tap()}
          {@attach fly}
        >
          <circle class="v-hit" cy="-6" r="16" />
          {@render art(v.kind, v.look, v.note)}
        </g>
      {/key}
    {/if}
  </svg>
  {#if gain}
    {#key gain.id}<b class="ant-gain" style="left:{gain.x}%;top:{gain.y}%">+{gain.coins} 🪙</b>{/key}
  {/if}
</div>

{#if card}
  {@const c = card}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="backdrop" onclick={(e) => e.target === e.currentTarget && (card = null)}>
    <div class="sheet vcard" role="dialog" aria-modal="true" aria-label="A {c.v.kind} came to visit">
      <button class="x" aria-label="Close" onclick={() => (card = null)}>✕</button>
      <svg class="vart" viewBox="-18 -24 36 28" aria-hidden="true"><g class="visitor {c.v.kind} perched">{@render art(c.v.kind, c.v.look, false)}</g></svg>
      <h2>{c.v.kind === 'bird' ? 'A little bird stopped by!' : 'A butterfly stopped by!'}</h2>
      {#if c.item}
        <p class="dim">It brought you a word to remember:</p>
        <div class="vword">
          <div class="big" class:long={c.item.front.length > 4} lang="ja">{c.item.front}</div>
          {#if c.item.hint}<div class="hint" lang="ja">{c.item.hint}</div>{/if}
          <div class="answer">{c.item.back}</div>
        </div>
      {/if}
      <p class="coins">and a little gift: +{c.coins} 🪙</p>
      <button class="primary big-btn" onclick={thank}>ありがとう! Thank you</button>
    </div>
  </div>
{/if}

<!-- Drawn around (0, 0): a butterfly's body centre, or a bird's feet. Birds face right. -->
{#snippet art(kind: Kind, look: number, note: boolean)}
  {#if kind === 'butterfly'}
    {@const b = BUTTERFLIES[look]}
    <g class="v-body">
      <g class="wing-l">
        <path d="M0 -1C-3 -11 -13 -13 -12 -4C-11 0 -5 1 0 0Z" fill={b.wing} stroke="#0003" stroke-width="0.4" />
        <path d="M0 0C-4 1 -9 4 -7 8C-5 10 -1 5 0 1Z" fill={b.hind} stroke="#0003" stroke-width="0.4" />
        <circle cx="-7.5" cy="-6" r="1.5" fill={b.spot} />
      </g>
      <g class="wing-r">
        <path d="M0 -1C3 -11 13 -13 12 -4C11 0 5 1 0 0Z" fill={b.wing} stroke="#0003" stroke-width="0.4" />
        <path d="M0 0C4 1 9 4 7 8C5 10 1 5 0 1Z" fill={b.hind} stroke="#0003" stroke-width="0.4" />
        <circle cx="7.5" cy="-6" r="1.5" fill={b.spot} />
      </g>
      <ellipse rx="1.1" ry="5" fill="#2b1b14" />
      <path d="M-0.4 -4.6Q-2 -8 -3.2 -8.6M0.4 -4.6Q2 -8 3.2 -8.6" fill="none" stroke="#2b1b14" stroke-width="0.5" stroke-linecap="round" />
      {#if note}
        <!-- Held in its legs under the body. -->
        <path d="M-0.6 3.6L-1.8 6.4M0.6 3.6L1.8 6.4" stroke="#2b1b14" stroke-width="0.45" stroke-linecap="round" />
        <g transform="translate(0 7.4) rotate(-6)">{@render scroll()}</g>
      {/if}
    </g>
  {:else}
    {@const b = BIRDS[look]}
    <g class="v-body">
      <path d="M-5 -6L-12 -9.5L-11 -5Z" fill={b.wing} />
      <path d="M-1.4 -1.4L-1.8 0M1.2 -1.4L1.6 0" stroke="#7a5a3a" stroke-width="0.7" stroke-linecap="round" />
      <ellipse cx="-1" cy="-6" rx="6.4" ry="5" fill={b.body} />
      <ellipse cx="0.4" cy="-4.4" rx="4.4" ry="3" fill={b.belly} />
      <g class="b-head">
        <circle cx="4" cy="-10.6" r="4" fill={b.head} />
        {#if b.cheek}<ellipse cx="4.6" cy="-9" rx="2.4" ry="1.6" fill="#f4ede0" /><circle cx="5" cy="-8.8" r="0.8" fill={b.cheek} />{/if}
        {#if b.ring}<circle cx="5.4" cy="-11.4" r="1.6" fill={b.ring} />{/if}
        <circle cx="5.5" cy="-11.4" r="0.85" fill="#111" />
        <path d="M7.6 -11.3L10.2 -10.4L7.6 -9.6Z" fill="#3a2a1a" />
        {#if note}<g transform="translate(9.6 -10.2) rotate(-22)">{@render scroll()}</g>{/if}
      </g>
      <path class="b-wing" d="M-6 -8Q0 -10.5 3 -6Q-2 -2.5 -6.5 -5Z" fill={b.wing} />
    </g>
  {/if}
{/snippet}

<!-- A rolled-up note tied with a red string, centred on (0, 0). -->
{#snippet scroll()}
  <g class="v-note">
    <rect x="-4.2" y="-1.3" width="8.4" height="2.6" rx="1.3" fill="#fbf3dc" stroke="#a88a50" stroke-width="0.35" />
    <path d="M-2.4 -1.1q0.6 1.1 0 2.2M1.6 -1.1q0.6 1.1 0 2.2" fill="none" stroke="#e2d3ad" stroke-width="0.35" />
    <path d="M-0.4 -1.3v2.6" stroke="#d6324a" stroke-width="0.9" />
    <ellipse cx="4.1" rx="0.55" ry="1.3" fill="#efe3c3" stroke="#a88a50" stroke-width="0.3" />
  </g>
{/snippet}
