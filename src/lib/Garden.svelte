<script lang="ts">
  import { untrack } from 'svelte'
  import Ants from './Ants.svelte'
  import type { Deck } from '../data/items'
  import GardenQuiz from './GardenQuiz.svelte'
  import { BLOOMED, WEED_BONUS_XP, completionBonus, formatWait, msUntilReady, phaseOf, type Weed } from './garden'
  import { SCENE, WEED_SPOTS, weedBox } from './meadow'
  import PlotSheet from './PlotSheet.svelte'
  import PlotTile from './PlotTile.svelte'
  import * as sfx from './sfx'
  import { app, finishQuiz, level, poolFor, pullWeed, tendWeeds } from './store.svelte'
  import WaterSplash from './WaterSplash.svelte'
  import WeedPluck from './WeedPluck.svelte'
  import WeedSprite from './WeedSprite.svelte'

  const DECKS: Deck[] = ['hiragana', 'katakana', 'kanji', 'vocab', 'grammar']

  let now = $state(Date.now())
  let selected = $state<number | null>(null)
  // `target` is the plot index, or the weed's spot for a weed quiz.
  let quiz = $state<{ target: number; deck: Deck; mode: 'water' | 'groom' | 'weed'; bonus: number } | null>(null)
  let watered: number | null = null // plot whose watering quiz finished, splashed on return
  let splash = $state<number | null>(null)
  let pulled: Weed | null = null // weed whose question was answered, plucked on return
  let pluck = $state<Weed | null>(null)

  // Keep countdowns fresh and weeds growing, and catch up when the tab comes back to the foreground.
  $effect(() => {
    const tick = () => {
      now = Date.now()
      tendWeeds(now)
    }
    untrack(tick)
    const t = setInterval(tick, 30_000)
    const vis = () => !document.hidden && tick()
    document.addEventListener('visibilitychange', vis)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', vis)
    }
  })

  const attention = $derived(
    app.garden.filter((p) => p && (phaseOf(p, now) === 'thirsty' || phaseOf(p, now) === 'ready')).length,
  )
  const nextWait = $derived.by(() => {
    const waits = app.garden.flatMap((p) => (p && phaseOf(p, now) === 'resting' ? [msUntilReady(p, now)] : []))
    return waits.length ? Math.min(...waits) : null
  })
  const planted = $derived(app.garden.filter((p) => p).length)
  const pct = $derived(app.xp % 100)

  function open(i: number) {
    now = Date.now()
    selected = i
  }

  function startQuiz(i: number) {
    const p = app.garden[i]
    if (!p) return
    selected = null
    watered = null
    quiz = { target: i, deck: p.deck, mode: p.stage === BLOOMED ? 'groom' : 'water', bonus: completionBonus(p) }
  }

  // A weed asks one question from any deck the enabled chapters cover.
  function startWeed(w: Weed) {
    const decks = DECKS.filter((d) => poolFor(d).length)
    pulled = null
    quiz = { target: w.spot, deck: decks[Math.floor(Math.random() * decks.length)] ?? 'hiragana', mode: 'weed', bonus: WEED_BONUS_XP }
  }

  function closeQuiz() {
    quiz = null
    now = Date.now()
    splash = watered
    pluck = pulled
    watered = null
    pulled = null
  }

  function complete(target: number, mode: 'water' | 'groom' | 'weed') {
    if (mode === 'weed') {
      const w = app.weeds.find((w) => w.spot === target)
      if (w && pullWeed(target)) pulled = { ...w }
    } else if (finishQuiz(target) && mode === 'water') watered = target
  }
</script>

{#if quiz}
  {@const q = quiz}
  <GardenQuiz deck={q.deck} mode={q.mode} bonus={q.bonus} onComplete={() => complete(q.target, q.mode)} onClose={closeQuiz} />
{:else}
  <section class="garden">
    <div class="hud">
      <div class="lvl">Lv {level()}</div>
      <div class="xpbar" aria-label="XP progress"><div style="width:{pct}%"></div></div>
      <div class="coins" aria-label="{app.coins} coins">🪙 {app.coins}</div>
    </div>

    <div class="bed">
      {@html SCENE}
      {#each app.garden as plot, i (i)}
        <PlotTile {plot} index={i} {now} onclick={() => open(i)} />
      {/each}
      {#each app.weeds as w (w.spot)}
        <button class="weed-tile" style={weedBox(WEED_SPOTS[w.spot])} aria-label="Weed, answer a question to pull it" onclick={() => startWeed(w)}>
          <WeedSprite kind={w.kind} />
        </button>
      {/each}
      <Ants />
      {#if pluck}
        {@const p = pluck}
        <WeedPluck spot={p.spot} kind={p.kind} onPop={() => !app.muted && sfx.pluck()} onDone={() => (pluck = null)} />
      {/if}
      {#if splash !== null}
        <WaterSplash index={splash} onLand={() => !app.muted && sfx.splash()} onDone={() => (splash = null)} />
      {/if}
    </div>

    <p class="gstatus">
      {#if !planted}
        Tap a plot to plant your first seed.
      {:else if attention}
        {attention} {attention === 1 ? 'plant needs' : 'plants need'} you.
      {:else if app.weeds.length}
        {app.weeds.length === 1 ? 'A weed is' : `${app.weeds.length} weeds are`} creeping in. Tap to pull for coins.
      {:else if nextWait !== null}
        All resting. Next ready in {formatWait(nextWait)}.
      {/if}
    </p>
  </section>

  {#if selected !== null}
    <PlotSheet index={selected} {now} onClose={() => (selected = null)} onStart={startQuiz} />
  {/if}
{/if}
