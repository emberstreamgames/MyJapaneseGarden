<script lang="ts">
  import { DECK_LABEL, type Deck, type Item } from '../data/items'
  import Celebration from './Celebration.svelte'
  import ConfirmSheet from './ConfirmSheet.svelte'
  import { PERFECT_COINS, QUIZ_LENGTH, REVIEW_MAX, type Plot } from './garden'
  import PlantSprite from './PlantSprite.svelte'
  import { STREAK_RAIN_EVERY } from './streak'
  import { Quiz } from './quiz.svelte'
  import QuizCard from './QuizCard.svelte'
  import * as sfx from './sfx'
  import { app, holdLevelUps, level, quizState, type QuizReward } from './store.svelte'

  // A fixed-length quiz for watering or grooming a plant: answering all 10 questions is the only
  // requirement. Its misses are then asked once more, for practice only. A weed needs one correct
  // answer; a miss swaps in a new question. Tend weak words runs through a short fixed list, then
  // sends the player off for a break.
  let {
    deck,
    mode,
    plot = null,
    cards,
    bonus,
    onComplete,
    onClose,
  }: {
    deck: Deck
    mode: 'water' | 'groom' | 'weed' | 'tend'
    plot?: Plot | null // the plant being tended, shown during the quiz and in the summary
    cards?: Item[] // a fixed list of questions, for Tend weak words
    bonus: number // completion XP, shown in the summary
    onComplete: (right: number) => QuizReward | null // fires once, when the last question is answered
    onClose: () => void // leave the quiz (after the summary, or via Quit)
  } = $props()

  const quiz = new Quiz(() => deck, () => cards)
  const length = $derived(mode === 'weed' ? 1 : cards ? cards.length : QUIZ_LENGTH)
  const progress = $derived(mode === 'weed' ? quiz.session.right : quiz.answered)
  // The dots count the review round once it starts.
  const dots = $derived(quiz.reviewing ? { n: quiz.reviewTotal, at: quiz.reviewDone } : { n: length, at: progress })

  let finished = $state(false) // all questions answered and credited
  let summary = $state(false)
  let leveled = $state(false) // the completion bonus pushed the player up a level
  let reward = $state<QuizReward | null>(null)
  let quitting = $state(false) // asking whether to give up on the plant
  const verb = $derived(quiz.reviewing && !summary ? 'Reviewing' : mode === 'tend' ? 'Tending' : mode === 'weed' ? 'Weeding' : mode === 'groom' ? 'Grooming' : 'Watering')
  // Fills as right answers come in, the way the plant gets its water.
  const fill = $derived(Math.min(1, quiz.session.right / QUIZ_LENGTH))
  const noun = $derived(mode !== 'tend' && (deck === 'hiragana' || deck === 'katakana') ? 'characters' : 'words')

  $effect(() => quiz.sync())
  // Level-ups are celebrated once the quiz is over.
  $effect(() => holdLevelUps())
  // The pool mustn't change mid-quiz: App hides the chapter chips while this is set.
  $effect(() => {
    quizState.open = true
    return () => {
      quizState.open = false
    }
  })

  $effect(() => {
    if (!finished && progress >= length) {
      finished = true
      const before = level()
      reward = onComplete(quiz.session.right)
      leveled = level() > before
    }
  })

  function showSummary() {
    summary = true
    if (!app.muted) {
      if (mode === 'groom' || mode === 'tend') sfx.groom()
      else sfx.water()
      if (reward?.perfect || reward?.study.bonus) setTimeout(sfx.fanfare, 900)
    }
  }

  function next() {
    // A weed has no summary: the garden plays the pluck instead.
    if (finished && mode === 'weed') onClose()
    else if (quiz.reviewing) quiz.reviewLeft ? quiz.next() : showSummary()
    else if (finished) mode !== 'tend' && quiz.missed.length ? quiz.beginReview() : showSummary()
    else quiz.next()
  }

  const nextLabel = $derived.by(() => {
    if (mode === 'weed') return finished ? 'Pull it 🌿' : 'Try another ▶'
    if (quiz.reviewing) return quiz.reviewLeft ? 'Next ▶' : 'Finish ✓'
    if (!finished) return 'Next ▶'
    return mode !== 'tend' && quiz.missed.length ? `Review ${Math.min(quiz.missed.length, REVIEW_MAX)} missed ▶` : 'Finish ✓'
  })

  function quit() {
    // The plant is already credited, so leaving the review only skips to the summary.
    if (quiz.reviewing && !summary) showSummary()
    // Leaving a weed loses nothing: it stays on the lawn.
    else if (finished || mode === 'weed' || mode === 'tend' || quiz.answered === 0) onClose()
    else quitting = true
  }
</script>

<section class="deck">
  <div class="hud">
    <div class="lvl">{verb}</div>
    {#if mode === 'water' || mode === 'groom'}<div class="combo gq" class:hot={quiz.combo >= 3} class:cold={quiz.combo < 2} title="Combo: right answers in a row" aria-label="Combo {quiz.combo}">🔥 {quiz.combo}</div>{/if}
    <div class="dots" role="progressbar" aria-valuemin="0" aria-valuemax={dots.n} aria-valuenow={Math.min(dots.at, dots.n)} aria-label="Quiz progress">
      {#each Array(dots.n) as _, i}
        <i class:done={i < dots.at} class:now={i === dots.at && (quiz.reviewing || !finished)}></i>
      {/each}
    </div>
    <button class="quit" onclick={quit}>{quiz.reviewing && !summary ? 'Skip' : finished ? 'Close' : 'Quit'}</button>
  </div>

  {#if plot && !summary}
    <div class="quiz-plant" aria-hidden="true">
      <PlantSprite species={plot.species} stage={plot.stage} variant={plot.variant} />
      {#if mode === 'groom'}
        <span class="quiz-scissors">✂️</span>
      {:else}
        <svg class="can" viewBox="0 0 64 48">
          <defs><clipPath id="can-body"><path d="M18 14h26v28a3 3 0 0 1-3 3H21a3 3 0 0 1-3-3Z" /></clipPath></defs>
          <rect class="can-water" clip-path="url(#can-body)" x="18" y={45 - 31 * fill} width="26" height={31 * fill} />
          <path class="can-line" d="M18 14h26v28a3 3 0 0 1-3 3H21a3 3 0 0 1-3-3ZM18 24 5 12M2 9l7 6M44 20c10-1 12 15 0 17M24 14c0-10 14-10 14 0" />
        </svg>
      {/if}
    </div>
  {/if}

  {#if summary}
    <div class="empty summary">
      {#if mode !== 'tend'}
        <div class="sum-plant fxwrap">
          {#if plot}<PlantSprite species={plot.species} stage={plot.stage} variant={plot.variant} />{/if}
          <Celebration kind={mode === 'groom' ? 'groom' : 'water'} />
        </div>
      {/if}
      <h2>{mode === 'tend' ? 'Nicely tended!' : mode === 'groom' ? 'Groomed!' : 'Watered!'}</h2>
      {#if reward?.perfect}
        <p class="perfect">🌟 Perfect! Every answer right</p>
      {:else}
        <p>{quiz.session.right} of {length} correct</p>
      {/if}
      {#if quiz.stronger}<p class="good">💪 {quiz.stronger} {quiz.stronger === 1 ? noun.slice(0, -1) : noun} got stronger</p>{/if}
      {#if quiz.met}<p class="dim">🌱 {quiz.met} new {quiz.met === 1 ? noun.slice(0, -1) : noun}</p>{/if}
      {#if mode === 'tend'}
        <p class="rest-note">Now take a break. Words settle while you rest, so this is a good place to stop.</p>
      {:else}
        {#if quiz.bestCombo >= 3}<p class="dim">Best combo this round: 🔥 {quiz.bestCombo}</p>{/if}
        <p class="good">+{bonus} XP bonus</p>
      {/if}
      {#if reward?.perfect}<p class="coins">+{PERFECT_COINS} 🪙 perfect bonus</p>{/if}
      {#if reward}{@render streakNote(reward)}{/if}
      {#if leveled}<p class="lvl">Level up! Lv {level()}</p>{/if}
      {#if quiz.missed.length}
        <div class="sum-missed">
          <h3>Keep practising</h3>
          {#each quiz.missed as m (m.item.id)}
            <div class="line">
              <span class="jp" lang="ja">{m.item.front}</span><em>{m.item.back}</em>
              {#if m.fixed}<span class="good">✓ reviewed</span>{/if}
            </div>
          {/each}
        </div>
      {/if}
      <button class="primary" onclick={onClose}>Done</button>
    </div>
  {:else if !quiz.current}
    <div class="empty">
      <h2>No {DECK_LABEL[deck]} to study</h2>
      <p>Turn on a chapter that includes {DECK_LABEL[deck]}, or wait until its content is added.</p>
      <button onclick={onClose}>Back</button>
    </div>
  {:else}
    <QuizCard {quiz} onNext={next} {nextLabel} auto={quiz.reviewing ? quiz.reviewLeft > 0 : !finished} />
  {/if}
</section>

{#if quitting}
  <ConfirmSheet title="Quit now?" yes="Quit" no="Keep going" danger onYes={onClose} onNo={() => (quitting = false)}>
    <p class="dim">Your plant will not be {mode === 'groom' ? 'groomed' : 'watered'}.</p>
  </ConfirmSheet>
{/if}

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
