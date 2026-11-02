<script lang="ts">
  import { DECK_LABEL, type Deck, type Item } from '../data/items'
  import ConfirmSheet from './ConfirmSheet.svelte'
  import { QUIZ_LENGTH, REVIEW_MAX, type Plot } from './garden'
  import Icon from './Icon.svelte'
  import PlantSprite from './PlantSprite.svelte'
  import { Quiz } from './quiz.svelte'
  import QuizCard from './QuizCard.svelte'
  import QuizSummary from './QuizSummary.svelte'
  import * as sfx from './sfx'
  import { app, chapterSheet, holdLevelUps, knownWords, quizState, type QuizReward } from './store.svelte'

  // A fixed-length quiz for watering or grooming a plant: answering all 10 questions is the only
  // requirement. Its misses are then asked once more, for practice only. Weeds need one correct
  // answer each; a miss swaps in a new question. Tend weak words runs through a short fixed list, then
  // sends the player off for a break.
  let {
    deck,
    mode,
    plot = null,
    cards,
    bonus,
    weeds = 1,
    onComplete,
    onClose,
    onTend,
  }: {
    deck: Deck
    mode: 'water' | 'groom' | 'weed' | 'tend'
    plot?: Plot | null // the plant being tended, shown during the quiz and in the summary
    cards?: Item[] // a fixed list of questions, for Tend weak words
    bonus: number // completion XP, shown in the summary
    weeds?: number // how many weeds a weed quiz is pulling
    onComplete: (right: number) => QuizReward | null // fires once, when the last question is answered, or on leaving a weed run early
    onClose: () => void // leave the quiz (after the summary, or via Quit)
    onTend?: () => void // go to Tend weak words from the summary
  } = $props()

  const quiz = new Quiz(() => deck, () => cards)
  const length = $derived(mode === 'weed' ? weeds : cards ? cards.length : QUIZ_LENGTH)
  // Where the player started, for the summary's XP bar and word count.
  const startXp = app.xp
  const startWords = knownWords()
  const progress = $derived(mode === 'weed' ? quiz.session.right : quiz.answered)
  // The seed row counts the review round once it starts.
  const dots = $derived(quiz.reviewing ? { n: quiz.reviewTotal, at: quiz.reviewDone } : { n: length, at: progress })

  let finished = $state(false) // all questions answered and credited
  let summary = $state(false)
  let reward = $state<QuizReward | null>(null)
  let quitting = $state(false) // asking whether to give up on the plant
  const verb = $derived(quiz.reviewing ? 'Reviewing' : mode === 'tend' ? 'Tending' : mode === 'weed' ? 'Weeding' : mode === 'groom' ? 'Grooming' : 'Watering')
  // Fills as right answers come in, the way the plant gets its water.
  const fill = $derived(Math.min(1, quiz.session.right / QUIZ_LENGTH))
  const noun = $derived(mode !== 'tend' && (deck === 'hiragana' || deck === 'katakana') ? 'characters' : 'words')

  $effect(() => quiz.sync())
  // Level-ups are celebrated once the quiz is over.
  $effect(() => holdLevelUps())
  // The pool mustn't change mid-quiz: App leaves Chapters out of the menu while this is set.
  $effect(() => {
    quizState.open = true
    return () => {
      quizState.open = false
    }
  })

  $effect(() => {
    if (!finished && progress >= length) {
      finished = true
      reward = onComplete(quiz.session.right)
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
    if (mode === 'weed') return finished ? (weeds > 1 ? 'Pull them 🌿' : 'Pull it 🌿') : quiz.result === 'right' ? 'Next ▶' : 'Try another ▶'
    if (quiz.reviewing) return quiz.reviewLeft ? 'Next ▶' : 'Finish ✓'
    if (!finished) return 'Next ▶'
    return mode !== 'tend' && quiz.missed.length ? `Review ${Math.min(quiz.missed.length, REVIEW_MAX)} missed ▶` : 'Finish ✓'
  })

  function quit() {
    // The plant is already credited, so leaving the review only skips to the summary.
    if (quiz.reviewing && !summary) showSummary()
    // Leaving a weed run keeps what was pulled so far; the rest stay on the lawn.
    else if (mode === 'weed') {
      if (!finished && quiz.session.right) onComplete(quiz.session.right)
      onClose()
    } else if (finished || mode === 'tend' || quiz.answered === 0) onClose()
    else quitting = true
  }
</script>

<section class="deck">
  {#if !summary}
    <div class="hud">
      <div class="lvl">{verb}</div>
      {#if mode === 'water' || mode === 'groom'}<div class="combo gq" class:hot={quiz.combo >= 3} class:cold={quiz.combo < 2} title="Combo: right answers in a row" aria-label="Combo {quiz.combo}">🔥 {quiz.combo}</div>{/if}
      <!-- A seed for each question, sprouting once it's answered. -->
      <div class="seedrow" role="progressbar" aria-valuemin="0" aria-valuemax={dots.n} aria-valuenow={Math.min(dots.at, dots.n)} aria-label="Quiz progress">
        {#each Array(dots.n) as _, i}
          <span class="seed-slot">
            {#if i < dots.at}<span class="seed-sprout"><Icon name="sprout" size={16} /></span>{:else}<i class:now={i === dots.at && (quiz.reviewing || !finished)}></i>{/if}
          </span>
        {/each}
      </div>
      <button class="quit" onclick={quit}>{quiz.reviewing ? 'Skip' : finished ? 'Close' : 'Quit'}</button>
    </div>
  {/if}

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

  {#if summary && mode !== 'weed'}
    <QuizSummary {quiz} {mode} plot={plot ?? null} {reward} {length} {bonus} {noun} {startXp} {startWords} {onClose} {onTend} />
  {:else if !quiz.current}
    <div class="empty">
      <h2>No {DECK_LABEL[deck]} to study</h2>
      <p>Add a chapter with {DECK_LABEL[deck]} to study it here.</p>
      <button class="primary" onclick={() => (chapterSheet.open = true)}>Choose chapters</button>
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
