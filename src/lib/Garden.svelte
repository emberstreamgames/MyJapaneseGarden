<script lang="ts">
  import { tick, untrack } from 'svelte'
  import Ants from './Ants.svelte'
  import { flyCoins, inFlight } from './coinfly.svelte'
  import Decor from './Decor.svelte'
  import { DECOR, available } from './decor'
  import Festival from './Festival.svelte'
  import { DECK_LABEL, type Deck, type Item } from '../data/items'
  import { lessonOrder, lessonTag } from '../data/build'
  import GardenQuiz from './GardenQuiz.svelte'
  import GroomSnip from './GroomSnip.svelte'
  import GrowBeam from './GrowBeam.svelte'
  import HudSheet from './HudSheet.svelte'
  import Mochi from './Mochi.svelte'
  import { BLOOMED, STARTER, WEED_BONUS_XP, WEED_COINS, WELCOME_AFTER_MS, completionBonus, formatWait, msUntilReady, phaseOf, type Species, type Weed } from './garden'
  import { WEED_SPOTS, scene, weedBox } from './meadow'
  import PlotSheet from './PlotSheet.svelte'
  import PlotTile from './PlotTile.svelte'
  import SeasonLayer from './SeasonLayer.svelte'
  import { FESTIVALS, SEASONS, ambientSky, festivalOn, hoursOf, seasonOf, type FestivalId } from './seasons'
  import * as sfx from './sfx'
  import Sky from './Sky.svelte'
  import StarterQuiz from './StarterQuiz.svelte'
  import { antCoinReady, app, chapterSheet, finishQuiz, growPlot, knownWords, level, levelProgress, markSeen, poolFor, pullWeed, retireStarter, seasonPreview, setTour, tendWeeds, tendsLeft, tourDid, waterStarterPlot, weakItems, weedCards, weedDeck, type Preserved } from './store.svelte'
  import { dayNumber, liveStreak, rainedDays } from './streak'
  import Visitors from './Visitors.svelte'
  import Welcome, { type Away } from './Welcome.svelte'
  import WaterSplash from './WaterSplash.svelte'
  import WeedPluck from './WeedPluck.svelte'
  import WeedSprite from './WeedSprite.svelte'

  let { onPreserved, onShop, onTend }: { onPreserved: (p: Preserved) => void; onShop: (spot: number | null) => void; onTend: () => void } = $props()

  const DECKS: Deck[] = ['hiragana', 'katakana', 'kanji', 'vocab', 'grammar']

  let now = $state(Date.now())
  let selected = $state<number | null>(null)
  // `target` is the plot index; `spots` are the weeds' spots for a weed quiz.
  // `cards` are a weed run's weak cards, asked before the deck's usual questions.
  let quiz = $state<{ target: number; deck: Deck; mode: 'water' | 'groom' | 'weed'; bonus: number; spots: number[]; cards?: Item[] } | null>(null)
  let guide = $state<number | null>(null) // the starter plant whose guided question is on screen
  let watered: number | null = null // plot whose watering quiz finished, splashed on return
  let splash = $state<number | null>(null)
  let pulled: Weed[] = [] // weeds whose questions were answered, plucked on return
  let pluck = $state<Weed[]>([])
  let groomed: number | null = null // plot whose grooming quiz finished, snipped on return
  let snip = $state<{ index: number; last: boolean } | null>(null)
  let hud = $state<'level' | 'streak' | 'coins' | null>(null)
  let away = $state<Away | null>(null)
  let weedAsk = $state<{ w: Weed; deck: Deck; count: number; weak: boolean } | null>(null) // the pre-screen before a weed's question
  let earned = 0 // perfect and streak coins from the quiz just finished, flown in on return
  let growing = $state<{ index: number; species: Species; stage: number; free: boolean }[]>([]) // plots under a sunbeam; free once it has passed

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

  const ready = $derived(app.garden.filter((p) => p && phaseOf(p, now) === 'ready').length)
  const thirsty = $derived(app.garden.filter((p) => p && phaseOf(p, now) === 'thirsty').length)
  const nextWait = $derived.by(() => {
    const waits = app.garden.flatMap((p) => (p && phaseOf(p, now) === 'resting' ? [msUntilReady(p, now)] : []))
    return waits.length ? Math.min(...waits) : null
  })
  const planted = $derived(app.garden.filter((p) => p).length)
  const words = $derived(knownWords())
  const unplaced = $derived(DECOR.some((d) => available(app.decor, d.id) > 0) && app.decor.placed.slice(0, app.decor.open).some((p) => !p))
  const today = $derived(dayNumber(now))
  const streak = $derived(liveStreak(app.streak, today))
  const studiedToday = $derived(app.streak.day === today)
  const chapterLabel = $derived(
    app.lessons.length ? [...app.lessons].sort((a, b) => lessonOrder(a) - lessonOrder(b)).map(lessonTag).join(', ').replaceAll('Lesson ', '') : 'None chosen',
  )
  // Worth pointing at only once today's study is done, and never during the tutorial.
  const weak = $derived(!app.tour && studiedToday && tendsLeft() ? weakItems().length : 0)

  const FESTIVAL_ICON: Record<FestivalId, string> = { shogatsu: '🎍', hanami: '🏮', tanabata: '🎋', tsukimi: '🌕' }
  const SEASON_ICON = { spring: '🌸', summer: '☀️', autumn: '🍁', winter: '❄️' }
  const date = $derived(new Date(now))
  const season = $derived(seasonPreview.season || seasonOf(date.getMonth() + 1))
  const hours = $derived(seasonPreview.hours || hoursOf(date.getHours()))
  const festival = $derived(seasonPreview.festival === 'none' ? null : seasonPreview.festival || festivalOn(date.getMonth() + 1, date.getDate()))
  const worn = $derived(app.look.wearing.sky)

  // The sign swings whenever one of its numbers is tapped. Only the class changes, so the tap's
  // click still lands on the button.
  function openHud(kind: 'level' | 'streak' | 'coins', e: MouseEvent) {
    const sign = (e.currentTarget as Element).closest('.sign')
    sign?.classList.remove('swing')
    void (sign as HTMLElement | null)?.offsetWidth
    sign?.classList.add('swing')
    hud = kind
  }

  const guideMood = $derived(ready ? 'wow' : !thirsty && !app.weeds.length && nextWait !== null ? 'sleepy' : 'happy')

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
    if (beamed(i) || snip?.index === i) return
    const p = app.garden[i]
    if (p && phaseOf(p, now) === 'ready') return beginGrow(i)
    if (p?.species === STARTER) {
      if (p.stage === BLOOMED) snip = { index: i, last: true }
      else guide = i
      return
    }
    selected = i
    if (p && phaseOf(p, now) === 'thirsty') tourDid('water')
  }

  // A ready plant grows where it stands. Several can grow at once, so a row of them takes a row of taps.
  const beamed = (i: number) => growing.some((g) => g.index === i && !g.free)

  function beginGrow(i: number) {
    const p = app.garden[i]
    if (!p || growing.some((g) => g.index === i)) return
    selected = null
    growing.push({ index: i, species: p.species, stage: p.stage, free: false })
  }

  function grow(i: number) {
    const grown = growPlot(i)
    if (!grown) return null
    now = Date.now()
    const bloom = app.garden[i]?.stage === BLOOMED
    if (!app.muted) {
      ;(bloom ? sfx.bloom : sfx.grow)()
      if (grown.found) setTimeout(sfx.fanfare, 1300)
    }
    return { bloom, found: grown.found }
  }

  function closeSheet() {
    selected = null
    // Closed without taking the quiz: the tutorial points back at the water drop.
    if (app.tour === 'quiz') setTour('water')
  }

  function startQuiz(i: number) {
    const p = app.garden[i]
    if (!p) return
    selected = null
    growing = [] // the quiz replaces the bed; a beam cut short leaves its plant ready
    watered = null
    groomed = null
    tourDid('quiz')
    quiz = { target: i, deck: p.deck, mode: p.stage === BLOOMED ? 'groom' : 'water', bonus: completionBonus(p), spots: [] }
  }

  // A weed asks a word that needs tending (weedDeck). The deck is picked first so the pre-screen can
  // say what kind of question is coming. Before anything's been studied, any deck the chapters cover will
  // do. The tutorial's weed asks hiragana, the gentlest.
  function askWeed(w: Weed) {
    const count = app.tour ? 1 : app.weeds.length
    const weak = app.tour ? null : weedDeck()
    if (weak) return (weedAsk = { w, deck: weak, count, weak: true })
    const decks = app.tour && poolFor('hiragana').length ? ['hiragana' as const] : DECKS.filter((d) => poolFor(d).length)
    weedAsk = { w, deck: decks[Math.floor(Math.random() * decks.length)] ?? 'hiragana', count, weak: false }
  }

  // `all` pulls every weed on the lawn in one run, starting with the one tapped.
  function startWeed(all: boolean) {
    if (!weedAsk) return
    const { w, deck, weak } = weedAsk
    weedAsk = null
    growing = []
    pulled = []
    const others = all ? app.weeds.filter((o) => o.spot !== w.spot).map((o) => o.spot) : []
    const spots = [w.spot, ...others]
    const cards = weak ? weedCards(deck, spots.length) : []
    quiz = { target: w.spot, deck, mode: 'weed', bonus: WEED_BONUS_XP, spots, cards: cards.length ? cards : undefined }
  }

  function closeQuiz() {
    if (quiz?.mode === 'weed') tourDid('weed')
    quiz = null
    now = Date.now()
    splash = watered
    pluck = pulled
    if (groomed !== null) snip = { index: groomed, last: false }
    watered = null
    pulled = []
    groomed = null
    const coins = earned
    earned = 0
    // The garden (and its coin counter) mounts on the next tick.
    if (coins) tick().then(() => flyCoins(innerWidth / 2, innerHeight / 2, coins))
  }

  function complete(target: number, mode: 'water' | 'groom' | 'weed', right: number) {
    if (mode === 'weed') {
      for (const spot of quiz?.spots.slice(0, right) ?? []) {
        const w = app.weeds.find((w) => w.spot === spot)
        if (w && pullWeed(spot)) pulled.push({ ...w })
      }
      return null
    }
    const reward = finishQuiz(target, right)
    if (reward && mode === 'water') watered = target
    if (reward && mode === 'groom') groomed = target
    earned = reward?.coins ?? 0
    return reward
  }

  function starterWatered() {
    const i = guide
    guide = null
    if (i === null) return
    waterStarterPlot(i)
    splash = i
  }

  function snipped() {
    const done = snip
    snip = null
    if (done?.last) retireStarter()
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

{#if guide !== null}
  <StarterQuiz onDone={starterWatered} />
{:else if quiz}
  {@const q = quiz}
  <GardenQuiz deck={q.deck} mode={q.mode} cards={q.cards} plot={q.mode === 'weed' ? null : app.garden[q.target]} bonus={q.bonus} weeds={q.spots.length || 1} onComplete={(right) => complete(q.target, q.mode, right)} onClose={closeQuiz} {onTend} />
{:else}
  <section class="garden">
    <!-- A wooden sign hanging on two ropes. -->
    <div class="hud sign">
      <i class="rope l"></i><i class="rope r"></i>
      <button class="hud-btn hud-level" aria-label="Level {level()}, see your progress" onclick={(e) => openHud('level', e)}>
        <span class="lvl">Lv {level()}</span>
        <span class="xpbar"><span class="xpfill" style="width:{pct}%"></span></span>
      </button>
      {#if streak}
        <button class="hud-btn streak" class:pending={!studiedToday} aria-label="{streak}-day streak, see details" onclick={(e) => openHud('streak', e)}>🌱 {streak}</button>
      {/if}
      <button class="hud-btn" aria-label="{app.coins} coins, see how to earn more" onclick={(e) => openHud('coins', e)}><span class="coins" data-coin-target>🪙 {app.coins - inFlight.coins}</span></button>
    </div>

    <div class="bed">
      {@html scene(app.look.wearing)}
      {#if festival && festival !== 'tsukimi'}<Festival {festival} />{/if}
      <Decor {onShop} />
      <div class="plots">
        {#each app.garden as plot, i (i)}
          <PlotTile {plot} index={i} {now} growing={beamed(i)} leaving={snip?.last && snip.index === i} onclick={() => open(i)} />
        {/each}
      </div>
      {#each app.weeds as w (w.spot)}
        <button class="weed-tile" style={weedBox(WEED_SPOTS[w.spot])} aria-label="Weed, answer a question to pull it" onclick={() => askWeed(w)}>
          <WeedSprite kind={w.kind} />
        </button>
      {/each}
      <Ants />
      <Visitors />
      <Sky sky={worn} />
      <SeasonLayer {hours} {festival} ambient={worn === 'clear' ? ambientSky(season, hours) : 'clear'} />
      <!-- A run of weeds comes out together, so only the first one makes a sound. -->
      {#each pluck as p, i (p.spot)}
        <WeedPluck spot={p.spot} kind={p.kind} onPop={() => i === 0 && !app.muted && sfx.pluck()} onDone={() => (pluck = pluck.filter((o) => o !== p))} />
      {/each}
      {#if splash !== null}
        <WaterSplash index={splash} onLand={() => !app.muted && sfx.splash()} onDone={() => (splash = null)} />
      {/if}
      {#each growing as g (g.index)}
        <GrowBeam
          index={g.index}
          species={g.species}
          stage={g.stage}
          onStart={() => !app.muted && sfx.charge(1.4)}
          onGrow={() => grow(g.index)}
          onFree={() => {
            g.free = true
            tourDid('starter-grow')
          }}
          onDone={() => (growing = growing.filter((o) => o.index !== g.index))}
        />
      {/each}
      {#if snip}
        {@const s = snip}
        <GroomSnip index={s.index} stage={BLOOMED} last={s.last} onSnip={() => !app.muted && sfx.snip()} onDone={snipped} />
      {/if}
    </div>

    {#if !planted || ready || thirsty || app.weeds.length || unplaced || nextWait !== null}
      <!-- Mochi, the garden's guide, says what to do next. -->
      <div class="guide">
        <Mochi size={44} mood={guideMood} />
        <p class="gstatus">
          {#if !planted}
            Tap a plot to plant your first seed.
          {:else if ready}
            {ready === 1 ? 'A plant is' : `${ready} plants are`} ready to grow. Tap the star.
          {:else if thirsty && studiedToday}
            One plant is enough today. The {thirsty === 1 ? 'other one' : `other ${thirsty}`} can wait if you'd like a rest.
          {:else if thirsty}
            {thirsty === 1 ? 'A plant would' : `${thirsty} plants would`} love some care. Just one is enough for today.
          {:else if app.weeds.length}
            {app.weeds.length === 1 ? 'A weed is' : `${app.weeds.length} weeds are`} creeping in. Tap to pull for coins.
          {:else if unplaced}
            You have decorations to place. Tap a <b>+</b> on the lawn.
          {:else if nextWait !== null}
            All resting. Next ready in {formatWait(nextWait)}.
          {/if}
        </p>
      </div>
    {/if}
    {#if words}<p class="gread">📖 You can read {words} {words === 1 ? 'word' : 'words'}</p>{/if}
    {#if weak}<button class="gtend" onclick={onTend}>🌿 {weak === 1 ? '1 shaky word' : `${weak} shaky words`} could use a quick tend</button>{/if}
    <p class="gseason">
      {#if festival}
        {@const f = FESTIVALS[festival]}
        {FESTIVAL_ICON[festival]} <span lang="ja">{f.ja}</span> ({f.reading}: “{f.gloss}”). {f.line}
      {:else}
        {SEASON_ICON[season]} <span lang="ja">{SEASONS[season].ja}</span> ({SEASONS[season].reading}: “{SEASONS[season].gloss}”)
      {/if}
    </p>
    <button class="gchapters" onclick={() => (chapterSheet.open = true)}>📚 Chapters: {chapterLabel}</button>
  </section>

  {#if selected !== null}
    <PlotSheet index={selected} {now} onClose={closeSheet} onStart={startQuiz} onGrow={beginGrow} onPreserved={preserved} />
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
        {#if a.weak}<p class="dim">It's one of the words that need tending.</p>{/if}
        <p class="coins">+{WEED_COINS} 🪙 · +{WEED_BONUS_XP} XP</p>
        <button class="primary big-btn" onclick={() => startWeed(false)}>Start</button>
        {#if a.count > 1}
          <button class="big-btn" onclick={() => startWeed(true)}>🌿 Pull all {a.count} · {a.count} questions · +{a.count * WEED_COINS} 🪙</button>
        {/if}
      </div>
    </div>
  {/if}
  {#if hud}
    <HudSheet kind={hud} {streak} studied={studiedToday} onClose={() => (hud = null)} onShop={() => { hud = null; onShop(null) }} />
  {/if}
  {#if away}
    <Welcome {away} onClose={() => (away = null)} />
  {/if}
{/if}
