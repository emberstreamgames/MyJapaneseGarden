<script lang="ts">
  import { untrack } from 'svelte'
  import type { Item } from '../data/items'
  import { flyCoinsFrom } from './coinfly.svelte'
  import CreatureSprite from './CreatureSprite.svelte'
  import { CREATURES, creatureKey, findLook, rollCreature, type Creature, type Move } from './creatures'
  import { BLOOMED, visitorCoins } from './garden'
  import { BLEED, PLANT_SCALE, SPOTS, VIEW, WEED_SPOTS } from './meadow'
  import { STEM_TOP } from './plants'
  import * as sfx from './sfx'
  import { app, collectVisitor, meetCreature, record, reminderItem, tourDid, visitorReady } from './store.svelte'

  // Garden visitors. Once a visitor is due (garden.ts visitorDue), a creature (creatures.ts) arrives
  // and settles: fliers often on an open flower, the rest on the lawn. Tapping it logs it in the
  // collection and opens a card with a word to recall: the player reveals the meaning, says how they
  // did (recorded like a quiz answer), and collects a few coins. One that isn't thanked leaves after
  // a while and a later one comes instead.

  type Pt = { x: number; y: number }
  interface Visitor {
    id: number
    creature: Creature
    look: string
    at: Pt // where it settles, in bed units
    from: Pt
    state: 'in' | 'perched' | 'out'
    note: boolean // still carrying its word, rolled up; handed over once thanked
    met: boolean // logged in the collection, so tapping it twice counts once
    first: boolean // and it was new there
  }

  // Flight time in ms, arriving and leaving.
  const FLIGHT: Record<Move, [number, number]> = { flutter: [4200, 3200], swoop: [2200, 1600], hop: [3000, 2200] }

  const LINGER = 150_000 // ms a visitor waits to be thanked
  const SIZE = 1.5 // drawn larger than life so it's easy to spot and tap
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  let visitor = $state<Visitor | null>(null)
  let card = $state<{ v: Visitor; item: Item | null; coins: number; shown: boolean } | null>(null)
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

  // Ground creatures come and go by the nearer side of the lawn.
  const offLawn = (at: Pt): Pt => ({ x: at.x < VIEW.w / 2 ? -BLEED - 30 : VIEW.w + BLEED + 30, y: at.y })

  function spawn() {
    // During the tutorial, visitors wait for their own step.
    if (document.hidden || visitor || card || !visitorReady() || (app.tour && app.tour !== 'visitor')) return
    const { creature, look } = rollCreature(Math.random(), Math.random())
    const info = CREATURES[creature]
    const flowers = app.garden.flatMap((p, i) => (p && p.stage >= BLOOMED - 1 ? [i] : []))
    const at = info.flowers && flowers.length && Math.random() < 0.85 ? flowerTop(pick(flowers)) : lawn()
    const from = info.move === 'hop' ? offLawn(at) : { x: Math.min(VIEW.w + 40, Math.max(-40, at.x + rand(-180, 180))), y: -30 }
    visitor = { id: ++n, creature, look, at, from, state: 'in', note: true, met: false, first: false }
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

  // Keyframes from a to b: fliers wander in loops, birds swoop in an arc, the rest hop along the
  // lawn. Those seen from the side face their way.
  function path(v: Visitor, a: Pt, b: Pt, arriving: boolean): Keyframe[] {
    const move = CREATURES[v.creature].move
    const face = move !== 'flutter' && b.x < a.x ? -1 : 1
    return Array.from({ length: 41 }, (_, k) => {
      const t = k / 40
      const e = arriving ? 1 - (1 - t) ** 2 : t * t
      const fade = arriving ? 1 - t : t // wobble dies down as it settles, grows as it leaves
      let x = a.x + (b.x - a.x) * e, y = a.y + (b.y - a.y) * e
      if (move === 'flutter') {
        x += Math.sin(t * Math.PI * 5) * 16 * fade
        y += Math.sin(t * Math.PI * 8) * 9 * fade
      } else if (move === 'swoop') y -= Math.sin(t * Math.PI) * 24 * fade
      else y -= Math.abs(Math.sin(t * Math.PI * 6)) * 9
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
      const a = node.animate(path(v, v.from, v.at, true), { duration: FLIGHT[CREATURES[v.creature].move][0], fill: 'forwards' })
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
    const move = CREATURES[v.creature].move
    const to = move === 'hop' ? offLawn(v.at) : { x: v.at.x + rand(-160, 160), y: -40 }
    const a = el.animate(path(v, v.at, to, false), { duration: FLIGHT[move][1], fill: 'forwards' })
    a.finished.then(() => visitor?.id === v.id && (visitor = null), () => {})
  }

  function tap() {
    const v = visitor
    if (!v || v.state === 'out') return
    if (!v.met) {
      v.met = true
      v.first = meetCreature(creatureKey(v.creature, v.look))
    }
    card = { v, item: reminderItem(), coins: visitorCoins(Math.random()), shown: false }
    if (!app.muted) sfx[CREATURES[v.creature].call]()
  }

  // `knew` is the player's own verdict on the word, if the card had one.
  function thank(knew?: boolean) {
    if (!card) return
    const { coins, item } = card
    card = null
    if (item && knew !== undefined) record(item.id, knew)
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

  const aLabel = (c: Creature) => {
    const label = CREATURES[c].label
    return `${/^[AEIOU]/.test(label) ? 'An' : 'A'} ${label.toLowerCase()}`
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
          class="visitor {CREATURES[v.creature].move} {v.creature} {v.state}"
          role="button"
          tabindex="0"
          aria-label="{aLabel(v.creature)} is in your garden, tap to say hello"
          onclick={tap}
          onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && tap()}
          {@attach fly}
        >
          <circle class="v-hit" cy="-6" r="16" />
          <CreatureSprite creature={v.creature} look={v.look} note={v.note} />
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
  {@const info = CREATURES[c.v.creature]}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="backdrop" onclick={(e) => e.target === e.currentTarget && (card = null)}>
    <div class="sheet vcard" role="dialog" aria-modal="true" aria-label="{aLabel(c.v.creature)} came to visit">
      <button class="x" aria-label="Close" onclick={() => (card = null)}>✕</button>
      <svg class="vart" viewBox={info.view} aria-hidden="true"><g class="visitor {info.move} {c.v.creature} perched"><CreatureSprite creature={c.v.creature} look={c.v.look} /></g></svg>
      <h2>{aLabel(c.v.creature)} stopped by!</h2>
      <p class="variant">{findLook(c.v.creature, c.v.look).name} · <span lang="ja">{info.jp}</span></p>
      {#if c.v.first}<p class="discovery">✨ New! Added to your collection</p>{/if}
      {#if c.item}
        <p class="dim">{c.shown ? 'It brought you this word:' : 'It brought you a word. Do you remember it?'}</p>
        <div class="vword">
          <div class="big" class:long={c.item.front.length > 4} lang="ja">{c.item.front}</div>
          <!-- A kanji's readings give it away, as in the quizzes. -->
          {#if c.item.hint && (c.shown || c.item.type !== 'kanji')}<div class="hint" lang="ja">{c.item.hint}</div>{/if}
          {#if c.shown}<div class="answer">{c.item.back}</div>{/if}
        </div>
      {/if}
      <p class="coins">and a little gift: +{c.coins} 🪙</p>
      {#if !c.item}
        <button class="primary big-btn" onclick={() => thank()}>ありがとう! Thank you</button>
      {:else if !c.shown}
        <button class="primary big-btn" onclick={() => (c.shown = true)}>Show meaning</button>
      {:else}
        <p class="vask">How did you do?</p>
        <div class="vgrade">
          <button class="big-btn" onclick={() => thank(false)}>Still learning</button>
          <button class="primary big-btn" onclick={() => thank(true)}>Got it!</button>
        </div>
      {/if}
    </div>
  </div>
{/if}
