<script lang="ts">
  import { untrack } from 'svelte'
  import CoinFlights from './lib/CoinFlights.svelte'
  import Collection from './lib/Collection.svelte'
  import Flashcards from './lib/Flashcards.svelte'
  import Garden from './lib/Garden.svelte'
  import LevelUp from './lib/LevelUp.svelte'
  import Menu from './lib/Menu.svelte'
  import Shop from './lib/Shop.svelte'
  import Stats from './lib/Stats.svelte'
  import Tour from './lib/Tour.svelte'
  import { N5, type Lesson } from './data/build'
  import { app, level, levelHold, setTour, toggleLesson, tourDid, type Preserved } from './lib/store.svelte'

  type Tab = 'garden' | 'shop' | 'collection' | 'hiragana' | 'katakana' | 'kanji' | 'vocab' | 'grammar' | 'stats'
  const tabs: { id: Tab; label: string }[] = [
    { id: 'garden', label: 'Garden' },
    { id: 'shop', label: 'Garden Shop' },
    { id: 'collection', label: 'Collection' },
    { id: 'hiragana', label: 'ひらがな' },
    { id: 'katakana', label: 'カタカナ' },
    { id: 'kanji', label: '漢字' },
    { id: 'vocab', label: 'Vocab' },
    { id: 'grammar', label: 'Grammar' },
    { id: 'stats', label: 'Stats' },
  ]
  let tab = $state<Tab>('garden')
  let fresh = $state<Preserved | null>(null) // a flower just preserved, shown off on the Collection page
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

  function preserved(p: Preserved) {
    tab = 'collection'
    fresh = p
  }
  const lessons: Lesson[] = [...Array.from({ length: 13 }, (_, i) => i), N5]
  // The chips choose vocab and kanji chapters, so only the screens they affect show them.
  const chips = $derived(tab !== 'collection' && tab !== 'shop' && tab !== 'hiragana' && tab !== 'katakana')

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
    <h1>My Japanese Garden</h1>
    <Menu items={tabs} current={tab} onselect={go} actions={[{ label: '🎓 Replay tutorial', run: () => (setTour('hello'), go('garden')) }]} />
  </header>

  {#if chips}
    <div class="chapters" role="group" aria-label="Chapters in your review pool">
      <span class="lbl">Chapters</span>
      {#each lessons as n (n)}
        <button class="chip" class:on={app.lessons.includes(n)} class:n5={n === N5} aria-pressed={app.lessons.includes(n)} onclick={() => toggleLesson(n)}>
          {n === N5 ? 'N5 Prep' : n === 0 ? 'Intro' : n}
        </button>
      {/each}
    </div>
  {/if}

  {#if tab === 'stats'}
    <Stats />
  {:else if tab === 'garden'}
    <Garden onPreserved={preserved} onShop={shopFor} />
  {:else if tab === 'shop'}
    <Shop {placeAt} onPlaced={() => (placeAt = null)} onGarden={() => go('garden')} />
  {:else if tab === 'collection'}
    <Collection {fresh} />
  {:else}
    <Flashcards deck={tab} />
  {/if}
</main>

<Tour screen={tab} onGarden={() => go('garden')} />
<CoinFlights />
{#if showLevel && due}
  <LevelUp from={due.from} to={due.to} onClose={() => ((showLevel = false), (due = null))} />
{/if}
