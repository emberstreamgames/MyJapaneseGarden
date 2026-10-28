<script lang="ts">
  import { tick, untrack } from 'svelte'
  import Ants from './Ants.svelte'
  import { flyCoins, inFlight } from './coinfly.svelte'
  import Decor from './Decor.svelte'
  import { DECOR, available } from './decor'
  import { DECK_LABEL, type Deck } from '../data/items'
  import GardenQuiz from './GardenQuiz.svelte'
  import { BLOOMED, WEED_BONUS_XP, WEED_COINS, WELCOME_AFTER_MS, completionBonus, formatWait, msUntilReady, phaseOf, type Weed } from './garden'
  import { SCENE, WEED_SPOTS, weedBox } from './meadow'
  import PlotSheet from './PlotSheet.svelte'
  import PlotTile from './PlotTile.svelte'
  import * as sfx from './sfx'
  import { antCoinReady, app, finishQuiz, level, levelProgress, markSeen, poolFor, pullWeed, setTour, tendWeeds, tourDid, type Preserved } from './store.svelte'
  import { dayNumber, liveStreak, rainedDays } from './streak'
  import Visitors from './Visitors.svelte'
  import Welcome, { type Away } from './Welcome.svelte'
  import WaterSplash from './WaterSplash.svelte'
  import WeedPluck from './WeedPluck.svelte'
  import WeedSprite from './WeedSprite.svelte'

  let { onPreserved, onShop }: { onPreserved: (p: Preserved) => void; onShop: (spot: number | null) => void } = $props()

  const DECKS: Deck[] = ['hiragana', 'katakana', 'kanji', 'vocab', 'grammar']

  let now = $state(Date.now())
  let selected = $state<number | null>(null)
  // `target` is the plot index, or the weed's spot for a weed quiz.
  let quiz = $state<{ target: number; deck: Deck; mode: 'water' | 'groom' | 'weed'; bonus: number } | null>(null)
  let watered: number | null = null // plot whose watering quiz finished, splashed on return
  let splash = $state<number | null>(null)
  let pulled: Weed | null = null // weed whose question was answered, plucked on return
  let pluck = $state<Weed | null>(null)
  let away = $state<Away | null>(null)
  let weedAsk = $state<{ w: Weed; deck: Deck } | null>(null) // the pre-screen before a weed's question
  let earned = 0 // perfect and streak coins from the quiz just finished, flown in on return

  // Keep countdowns fresh and weeds growing, and catch up when the tab comes back to the foreground.
  // After a long time away, say what happened meanwhile.
  $effect(() => {
    const tick = () => {
      now = Date.now()
      const gone = app.seenAt ? now - app.seenAt : 0
      const weedsBefore = app.weeds.length
      tendWeeds(now)
      if (document.hidden) return
      if (gone >= WELCOME_AFTER_MS && !quiz) away = summarize(app.weeds.length - weedsBefore)
      markSeen(now)
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
  const unplaced = $derived(DECOR.some((d) => available(app.decor, d.id) > 0) && app.decor.placed.some((p) => !p))
  const today = $derived(dayNumber(now))
  const streak = $derived(liveStreak(app.streak, today))
  const studiedToday = $derived(app.streak.day === today)

  function summarize(sprouted: number): Away {
    const phases = app.garden.flatMap((p) => (p ? [phaseOf(p, now)] : []))
    return {
      ready: phases.filter((ph) => ph === 'ready').length,
      thirsty: phases.filter((ph) => ph === 'thirsty').length,
      sprouted,
      ant: antCoinReady(now),
      streak: liveStreak(app.streak, today),
      rained: rainedDays(app.streak, today),
      studied: app.streak.day === today,
      lost: app.streak.count > 0 && !liveStreak(app.streak, today),
    }
  }
  const pct = $derived(levelProgress())

  function open(i: number) {
    now = Date.now()
    selected = i
    const p = app.garden[i]
    if (p && phaseOf(p, now) === 'thirsty') tourDid('water')
  }

  function closeSheet() {
    selected = null
    // Closed without taking the quiz: the tutorial points back at the 💧.
    if (app.tour === 'quiz') setTour('water')
  }

  function startQuiz(i: number) {
    const p = app.garden[i]
    if (!p) return
    selected = null
    watered = null
    tourDid('quiz')
    quiz = { target: i, deck: p.deck, mode: p.stage === BLOOMED ? 'groom' : 'water', bonus: completionBonus(p) }
  }

  // A weed asks one question from any deck the enabled chapters cover. The deck is picked first so
  // the pre-screen can say what kind of question is coming. The tutorial's weed asks hiragana, the gentlest.
  function askWeed(w: Weed) {
    const decks = app.tour && poolFor('hiragana').length ? ['hiragana' as const] : DECKS.filter((d) => poolFor(d).length)
    weedAsk = { w, deck: decks[Math.floor(Math.random() * decks.length)] ?? 'hiragana' }
  }

  function startWeed() {
    if (!weedAsk) return
    const { w, deck } = weedAsk
    weedAsk = null
    pulled = null
    quiz = { target: w.spot, deck, mode: 'weed', bonus: WEED_BONUS_XP }
  }

  function closeQuiz() {
    if (quiz?.mode === 'weed') tourDid('weed')
    quiz = null
    now = Date.now()
    splash = watered
    pluck = pulled
    watered = null
    pulled = null
    const coins = earned
    earned = 0
    // The garden (and its coin counter) mounts on the next tick.
    if (coins) tick().then(() => flyCoins(innerWidth / 2, innerHeight / 2, coins))
  }

  function complete(target: number, mode: 'water' | 'groom' | 'weed', right: number) {
    if (mode === 'weed') {
      const w = app.weeds.find((w) => w.spot === target)
      if (w && pullWeed(target)) pulled = { ...w }
      return null
    }
    const reward = finishQuiz(target, right)
    if (reward && mode === 'water') watered = target
    earned = reward?.coins ?? 0
    return reward
  }

  function onKey(e: KeyboardEvent) {
    if (weedAsk && e.key === 'Escape') weedAsk = null
  }

  function preserved(p: Preserved) {
    selected = null
    onPreserved(p)
  }
</script>

<svelte:window onkeydown={onKey} />

{#if quiz}
  {@const q = quiz}
  <GardenQuiz deck={q.deck} mode={q.mode} bonus={q.bonus} onComplete={(right) => complete(q.target, q.mode, right)} onClose={closeQuiz} />
{:else}
  <section class="garden">
    <div class="hud">
      <div class="lvl">Lv {level()}</div>
      <div class="xpbar" aria-label="XP progress"><div style="width:{pct}%"></div></div>
      {#if streak}
        <div class="streak" class:pending={!studiedToday} title={studiedToday ? `${streak}-day streak` : 'Water or groom a plant today to grow your streak'} aria-label="{streak}-day streak">🌱 {streak}</div>
      {/if}
      <div class="coins" data-coin-target aria-label="{app.coins} coins">🪙 {app.coins - inFlight.coins}</div>
    </div>

    <div class="bed">
      {@html SCENE}
      <Decor {onShop} />
      {#each app.garden as plot, i (i)}
        <PlotTile {plot} index={i} {now} onclick={() => open(i)} />
      {/each}
      {#each app.weeds as w (w.spot)}
        <button class="weed-tile" style={weedBox(WEED_SPOTS[w.spot])} aria-label="Weed, answer a question to pull it" onclick={() => askWeed(w)}>
          <WeedSprite kind={w.kind} />
        </button>
      {/each}
      <Ants />
      <Visitors />
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
      {:else if unplaced}
        You have decorations to place. Tap a <b>+</b> on the lawn.
      {:else if nextWait !== null}
        All resting. Next ready in {formatWait(nextWait)}.
      {/if}
    </p>
  </section>

  {#if selected !== null}
    <PlotSheet index={selected} {now} onClose={closeSheet} onStart={startQuiz} onPreserved={preserved} />
  {/if}
  {#if weedAsk}
    {@const a = weedAsk}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="backdrop" onclick={(e) => e.target === e.currentTarget && (weedAsk = null)}>
      <div class="sheet weed-ask" role="dialog" aria-modal="true" aria-label="Pull the weeds">
        <button class="x" aria-label="Close" onclick={() => (weedAsk = null)}>✕</button>
        <div class="weed-ask-art"><WeedSprite kind={a.w.kind} /></div>
        <h2>Pull the weeds!</h2>
        <p>Answer a <b>{DECK_LABEL[a.deck]}</b> question to earn coins!</p>
        <p class="coins">+{WEED_COINS} 🪙 · +{WEED_BONUS_XP} XP</p>
        <button class="primary big-btn" onclick={startWeed}>Start</button>
      </div>
    </div>
  {/if}
  {#if away}
    <Welcome {away} onClose={() => (away = null)} />
  {/if}
{/if}
