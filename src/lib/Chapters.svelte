<script lang="ts">
  import { N5, N5_KANJI, lessonTag, type Lesson } from '../data/build'
  import { app, chapterSheet, poolFor, toggleLesson } from './store.svelte'

  // Which chapters' vocab, kanji and grammar are in study. Kana are always in (store.svelte.ts poolFor).
  const lessons: Lesson[] = [...Array.from({ length: 13 }, (_, i) => i), N5, N5_KANJI]
  const close = () => (chapterSheet.open = false)
  const counts = $derived(`${poolFor('vocab').length} vocabulary · ${poolFor('kanji').length} kanji · ${poolFor('grammar').length} grammar`)

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') close()
  }
</script>

<svelte:window onkeydown={onKey} />

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="backdrop" onclick={(e) => e.target === e.currentTarget && close()}>
  <div class="sheet" role="dialog" aria-modal="true" aria-label="Chapters">
    <button class="x" aria-label="Close" onclick={close}>✕</button>
    <h2>Chapters</h2>
    <p class="dim">Choose what your plants quiz you on. Hiragana and katakana are always included.</p>
    <div class="chapters" role="group" aria-label="Chapters to study">
      {#each lessons as n (n)}
        <button class="chip" class:on={app.lessons.includes(n)} class:n5={n === N5} aria-pressed={app.lessons.includes(n)} aria-label={lessonTag(n)} onclick={() => toggleLesson(n)}>
          {typeof n === 'number' && n > 0 ? n : lessonTag(n)}
        </button>
      {/each}
    </div>
    <p class="dim" aria-live="polite">{counts}</p>
    <button class="primary big-btn" onclick={close}>Done</button>
  </div>
</div>
