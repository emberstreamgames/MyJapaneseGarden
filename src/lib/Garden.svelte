<script lang="ts">
  import type { Deck } from '../data/items'
  import GardenQuiz from './GardenQuiz.svelte'
  import { BLOOMED, completionBonus, formatWait, msUntilReady, phaseOf } from './garden'
  import { SCENE } from './meadow'
  import PlotSheet from './PlotSheet.svelte'
  import PlotTile from './PlotTile.svelte'
  import * as sfx from './sfx'
  import { app, finishQuiz, level } from './store.svelte'
  import WaterSplash from './WaterSplash.svelte'

  let now = $state(Date.now())
  let selected = $state<number | null>(null)
  let quiz = $state<{ index: number; deck: Deck; mode: 'water' | 'groom'; bonus: number } | null>(null)
  let watered: number | null = null // plot whose watering quiz finished, splashed on return
  let splash = $state<number | null>(null)

  // Keep countdowns fresh, and catch up when the tab comes back to the foreground.
  $effect(() => {
    const tick = () => (now = Date.now())
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
    quiz = { index: i, deck: p.deck, mode: p.stage === BLOOMED ? 'groom' : 'water', bonus: completionBonus(p) }
  }

  function closeQuiz() {
    quiz = null
    now = Date.now()
    splash = watered
    watered = null
  }

  function complete(i: number, mode: 'water' | 'groom') {
    if (finishQuiz(i) && mode === 'water') watered = i
  }
</script>

{#if quiz}
  {@const q = quiz}
  <GardenQuiz deck={q.deck} mode={q.mode} bonus={q.bonus} onComplete={() => complete(q.index, q.mode)} onClose={closeQuiz} />
{:else}
  <section class="garden">
    <div class="hud">
      <div class="lvl">Lv {level()}</div>
      <div class="xpbar" aria-label="XP progress"><div style="width:{pct}%"></div></div>
    </div>

    <div class="bed">
      {@html SCENE}
      {#each app.garden as plot, i (i)}
        <PlotTile {plot} index={i} {now} onclick={() => open(i)} />
      {/each}
      {#if splash !== null}
        <WaterSplash index={splash} onLand={() => !app.muted && sfx.splash()} onDone={() => (splash = null)} />
      {/if}
    </div>

    <p class="gstatus">
      {#if !planted}
        Tap a plot to plant your first seed.
      {:else if attention}
        {attention} {attention === 1 ? 'plant needs' : 'plants need'} you.
      {:else if nextWait !== null}
        All resting. Next ready in {formatWait(nextWait)}.
      {/if}
    </p>
  </section>

  {#if selected !== null}
    <PlotSheet index={selected} {now} onClose={() => (selected = null)} onStart={startQuiz} />
  {/if}
{/if}
