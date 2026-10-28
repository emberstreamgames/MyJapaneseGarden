<script lang="ts">
  import { DECK_LABEL, ITEMS, type Deck } from '../data/items'
  import { app, holdLevelUps, level, levelProgress } from './store.svelte'
  import { Quiz } from './quiz.svelte'
  import QuizCard from './QuizCard.svelte'

  let { deck }: { deck: Deck } = $props()

  const quiz = new Quiz(() => deck)

  $effect(() => quiz.sync())

  const pct = $derived(levelProgress())

  // A level-up waits until this card is done with, so it never covers an answer.
  $effect(() => {
    if (quiz.result) return holdLevelUps()
  })
</script>

<section class="deck">
  <div class="hud">
    <div class="lvl">Lv {level()}</div>
    <div class="xpbar" aria-label="XP progress"><div style="width:{pct}%"></div></div>
    <div class="combo" class:hot={quiz.combo >= 3}>
      {#if quiz.combo >= 2}🔥 {quiz.combo}{:else}combo {quiz.combo}{/if}
    </div>
  </div>

  {#if !quiz.current}
    <div class="empty">
      <h2>No {DECK_LABEL[deck]} in your pool</h2>
      <p>
        {#if ITEMS.some((i) => i.type === deck)}
          Turn on a chapter above to add its {DECK_LABEL[deck]} to your pool.
        {:else}
          {DECK_LABEL[deck]} content isn't loaded yet. It's coming once the textbook pages are added.
        {/if}
      </p>
    </div>
  {:else}
    <QuizCard {quiz} onNext={() => quiz.next()} />
  {/if}

  <div class="foot">
    <span>{quiz.pool.length} cards in pool</span>
    <span>Session: {quiz.session.right} ✓ / {quiz.session.wrong} ✗</span>
    <span>Best combo {app.best}</span>
  </div>
</section>
