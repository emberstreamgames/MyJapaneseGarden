<script lang="ts">
  import Flashcards from './lib/Flashcards.svelte'
  import Garden from './lib/Garden.svelte'
  import Menu from './lib/Menu.svelte'
  import Stats from './lib/Stats.svelte'
  import { N5, type Lesson } from './data/build'
  import { app, toggleLesson } from './lib/store.svelte'

  type Tab = 'garden' | 'hiragana' | 'katakana' | 'kanji' | 'vocab' | 'grammar' | 'stats'
  const tabs: { id: Tab; label: string }[] = [
    { id: 'garden', label: 'Garden' },
    { id: 'hiragana', label: 'ひらがな' },
    { id: 'katakana', label: 'カタカナ' },
    { id: 'kanji', label: '漢字' },
    { id: 'vocab', label: 'Vocab' },
    { id: 'grammar', label: 'Grammar' },
    { id: 'stats', label: 'Stats' },
  ]
  let tab = $state<Tab>('garden')
  const lessons: Lesson[] = [...Array.from({ length: 13 }, (_, i) => i), N5]
</script>

<main>
  <header>
    <h1>My Japanese Garden</h1>
    <Menu items={tabs} current={tab} onselect={(id) => (tab = id)} />
  </header>

  <div class="chapters" role="group" aria-label="Chapters in your review pool">
    <span class="lbl">Chapters</span>
    {#each lessons as n (n)}
      <button class="chip" class:on={app.lessons.includes(n)} class:n5={n === N5} aria-pressed={app.lessons.includes(n)} onclick={() => toggleLesson(n)}>
        {n === N5 ? 'N5 Prep' : n === 0 ? 'Intro' : n}
      </button>
    {/each}
  </div>

  {#if tab === 'stats'}
    <Stats />
  {:else if tab === 'garden'}
    <Garden />
  {:else}
    <Flashcards deck={tab} />
  {/if}
</main>
