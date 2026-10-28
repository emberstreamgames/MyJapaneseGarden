<script lang="ts">
  import { DECK_LABEL, type Deck } from '../data/items'
  import Celebration from './Celebration.svelte'
  import { PERFECT_COINS, QUIZ_LENGTH } from './garden'
  import { STREAK_RAIN_EVERY } from './streak'
  import { Quiz } from './quiz.svelte'
  import QuizCard from './QuizCard.svelte'
  import * as sfx from './sfx'
  import { app, holdLevelUps, level, type QuizReward } from './store.svelte'

  // A fixed-length quiz for watering or grooming a plant: answering all 10 questions is the only
  // requirement. A weed needs one correct answer; a miss swaps in a new question.
  let {
    deck,
    mode,
    bonus,
    onComplete,
    onClose,
  }: {
    deck: Deck
    mode: 'water' | 'groom' | 'weed'
    bonus: number // completion XP, shown in the summary
    onComplete: (right: number) => QuizReward | null // fires once, when the last question is answered
    onClose: () => void // leave the quiz (after the summary, or via Quit)
  } = $props()

  const quiz = new Quiz(() => deck)
  const length = $derived(mode === 'weed' ? 1 : QUIZ_LENGTH)
  const verb = $derived(mode === 'weed' ? 'Weeding' : mode === 'groom' ? 'Grooming' : 'Watering')
  const progress = $derived(mode === 'weed' ? quiz.session.right : quiz.answered)

  let finished = $state(false) // all questions answered and credited
  let summary = $state(false)
  let leveled = $state(false) // the completion bonus pushed the player up a level
  let reward = $state<QuizReward | null>(null)

  $effect(() => quiz.sync())
  // Level-ups are celebrated once the quiz is over.
  $effect(() => holdLevelUps())

  $effect(() => {
    if (!finished && progress >= length) {
      finished = true
      const before = level()
      reward = onComplete(quiz.session.right)
      leveled = level() > before
    }
  })

  function next() {
    // A weed has no summary: the garden plays the pluck instead.
    if (finished && mode === 'weed') {
      onClose()
    } else if (finished) {
      summary = true
      if (!app.muted) {
        if (mode === 'groom') sfx.groom()
        else sfx.water()
        if (reward?.perfect || reward?.study.bonus) setTimeout(sfx.fanfare, 900)
      }
    } else quiz.next()
  }

  function quit() {
    // Leaving a weed loses nothing: it stays on the lawn.
    if (finished || mode === 'weed' || quiz.answered === 0 || confirm('Quit now? Your plant will not be ' + (mode === 'groom' ? 'groomed.' : 'watered.'))) onClose()
  }
</script>

<section class="deck">
  <div class="hud">
    <div class="lvl">{verb}</div>
    {#if mode !== 'weed'}<div class="combo gq" class:hot={quiz.combo >= 3} class:cold={quiz.combo < 2} title="Combo: right answers in a row" aria-label="Combo {quiz.combo}">🔥 {quiz.combo}</div>{/if}
    <div class="dots" role="progressbar" aria-valuemin="0" aria-valuemax={length} aria-valuenow={Math.min(progress, length)} aria-label="Quiz progress">
      {#each Array(length) as _, i}
        <i class:done={i < progress} class:now={i === progress && !finished}></i>
      {/each}
    </div>
    <button class="quit" onclick={quit}>{finished ? 'Close' : 'Quit'}</button>
  </div>

  {#if summary}
    <div class="empty summary fxwrap">
      <Celebration kind={mode === 'groom' ? 'groom' : 'water'} />
      <h2>{mode === 'groom' ? 'Groomed!' : 'Watered!'}</h2>
      {#if reward?.perfect}
        <p class="perfect">🌟 Perfect! Every answer right</p>
      {:else}
        <p>{quiz.session.right} of {length} correct</p>
      {/if}
      {#if quiz.bestCombo >= 3}<p class="dim">Best combo this round: 🔥 {quiz.bestCombo}</p>{/if}
      <p class="good">+{bonus} XP bonus</p>
      {#if reward?.perfect}<p class="coins">+{PERFECT_COINS} 🪙 perfect bonus</p>{/if}
      {#if reward}{@render streakNote(reward)}{/if}
      {#if leveled}<p class="lvl">Level up! Lv {level()}</p>{/if}
      <button class="primary" onclick={onClose}>Done</button>
    </div>
  {:else if !quiz.current}
    <div class="empty">
      <h2>No {DECK_LABEL[deck]} to study</h2>
      <p>Turn on a chapter that includes {DECK_LABEL[deck]}, or wait until its content is added.</p>
      <button onclick={onClose}>Back</button>
    </div>
  {:else}
    <QuizCard {quiz} onNext={next} nextLabel={finished ? (mode === 'weed' ? 'Pull it 🌿' : 'Finish ✓') : mode === 'weed' ? 'Try another ▶' : 'Next ▶'} />
  {/if}
</section>

{#snippet streakNote(r: QuizReward)}
  {@const n = r.study.streak.count}
  {#if r.study.event === 'next'}
    <p class="streak-note">🌱 Day {n} streak! Come back tomorrow for day {n + 1}.</p>
  {:else if r.study.event === 'rain'}
    <p class="streak-note">☔ Rain watered your garden while you were away. Day {n} streak!</p>
  {:else if r.study.event === 'fresh'}
    <p class="streak-note">🌱 Day 1 of a new streak. Water a plant tomorrow to keep it growing.</p>
  {/if}
  {#if r.study.bonus}<p class="coins">+{r.study.bonus} 🪙 for a {n}-day streak!</p>{/if}
  {#if r.study.rainEarned}<p class="dim">You earned a rain day: if you miss a day, it waters the garden for you. (One every {STREAK_RAIN_EVERY} days.)</p>{/if}
{/snippet}
