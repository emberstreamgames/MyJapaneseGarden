<script lang="ts">
  import { untrack } from 'svelte'
  import Chapters from './lib/Chapters.svelte'
  import CoinFlights from './lib/CoinFlights.svelte'
  import Collection from './lib/Collection.svelte'
  import DevTools from './lib/DevTools.svelte'
  import Flashcards from './lib/Flashcards.svelte'
  import Garden from './lib/Garden.svelte'
  import LevelUp from './lib/LevelUp.svelte'
  import Menu from './lib/Menu.svelte'
  import PressFlower from './lib/PressFlower.svelte'
  import Shop from './lib/Shop.svelte'
  import Stats from './lib/Stats.svelte'
  import Tend from './lib/Tend.svelte'
  import Tour from './lib/Tour.svelte'
  import { app, chapterSheet, level, levelHold, quizState, setTour, tourDid, type Preserved } from './lib/store.svelte'

  type Tab = 'garden' | 'shop' | 'collection' | 'tend' | 'hiragana' | 'katakana' | 'kanji' | 'vocab' | 'grammar' | 'stats'
  // `hidden` leaves a screen out of the menu, and `dock` puts it on the dock rather than under More.
  // The free practice decks are off for now.
  const tabs: { id: Tab; label: string; dock?: string; hidden?: boolean }[] = [
    { id: 'garden', label: 'Garden', dock: 'Garden' },
    { id: 'shop', label: 'Garden Shop', dock: 'Shop' },
    { id: 'collection', label: 'Collection', dock: 'Collection' },
    { id: 'tend', label: 'Tend weak words' },
    { id: 'hiragana', label: 'ひらがな', hidden: true },
    { id: 'katakana', label: 'カタカナ', hidden: true },
    { id: 'kanji', label: '漢字', hidden: true },
    { id: 'vocab', label: 'Vocab', hidden: true },
    { id: 'grammar', label: 'Grammar', hidden: true },
    { id: 'stats', label: 'Stats', dock: 'Stats' },
  ]
  let tab = $state<Tab>('garden')
  let fresh = $state<Preserved | null>(null) // a flower just preserved, shown off on the Collection page
  let pressing = $state<Preserved | null>(null) // a flower on its way into the book
  let placeAt = $state<number | null>(null) // decoration spot the shop was opened for; the next purchase goes there

  function go(id: Tab) {
    tab = id
    fresh = null
    placeAt = null
    // The tutorial's shop steps: opening the shop, then leaving it.
    tourDid(id === 'shop' ? 'shop' : 'shop-visit')
  }

  // Replaying the tutorial (from Stats) starts in the garden.
  $effect(() => {
    if (app.tour === 'hello') untrack(() => go('garden'))
  })

  function shopFor(spot: number | null) {
    go('shop')
    placeAt = spot
  }

  // The flower is already saved: this only plays it into the book before showing the Collection.
  function preserved(p: Preserved) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) showPressed(p)
    else pressing = p
  }

  function showPressed(p: Preserved) {
    pressing = null
    tab = 'collection'
    fresh = p
  }

  // A garden quiz's pool shouldn't change under it, so the menu leaves Chapters out while one is open.
  const actions = $derived([
    ...(quizState.open ? [] : [{ label: '📚 Chapters', run: () => (chapterSheet.open = true) }]),
    { label: '🎓 Replay tutorial', run: () => (setTour('hello'), go('garden')) },
  ])

  // Celebrate each new level. `seen` starts at the loaded level so opening the app doesn't count,
  // and follows a reset back down. A quiz in progress holds the popup back (levelHold); after that a
  // short wait lets the last answer's own feedback play first.
  let seen = level()
  let due = $state<{ from: number; to: number } | null>(null)
  let showLevel = $state(false)
  $effect(() => {
    const now = level()
    untrack(() => {
      if (now > seen) due = { from: due?.from ?? seen, to: now }
      seen = now
    })
  })
  $effect(() => {
    if (!due || showLevel || levelHold.n) return
    const t = setTimeout(() => (showLevel = true), 600)
    return () => clearTimeout(t)
  })
</script>

<main>
  <header>
    <h1><button class="home" onclick={() => go('garden')}>My Japanese Garden</button></h1>
    <Menu items={tabs.filter((t) => !t.hidden)} current={tab} onselect={go} {actions} />
  </header>

  {#if tab === 'stats'}
    <Stats />
  {:else if tab === 'garden'}
    <Garden onPreserved={preserved} onShop={shopFor} onTend={() => go('tend')} />
  {:else if tab === 'shop'}
    <Shop {placeAt} onPlaced={() => (placeAt = null)} onGarden={() => go('garden')} />
  {:else if tab === 'collection'}
    <Collection {fresh} />
  {:else if tab === 'tend'}
    <Tend onDone={() => go('garden')} />
  {:else}
    <Flashcards deck={tab} />
  {/if}
</main>

<Tour screen={tab} onGarden={() => go('garden')} />
<CoinFlights />
<DevTools />
{#if chapterSheet.open}<Chapters />{/if}
{#if pressing}
  {@const p = pressing}
  <PressFlower species={p.species} variant={p.variant} onDone={() => showPressed(p)} />
{/if}
{#if showLevel && due}
  <LevelUp from={due.from} to={due.to} onClose={() => ((showLevel = false), (due = null))} />
{/if}
