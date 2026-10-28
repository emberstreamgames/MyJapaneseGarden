<script lang="ts">
  import { DECK_LABEL, type Deck } from '../data/items'
  import Celebration from './Celebration.svelte'
  import { QUIZ_LENGTH } from './garden'
  import { Quiz } from './quiz.svelte'
  import QuizCard from './QuizCard.svelte'
  import * as sfx from './sfx'
  import { app, level } from './store.svelte'

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
    onComplete: () => void // fires once, when the last question is answered
    onClose: () => void // leave the quiz (after the summary, or via Quit)
  } = $props()

  const quiz = new Quiz(() => deck)
  const length = $derived(mode === 'weed' ? 1 : QUIZ_LENGTH)
  const verb = $derived(mode === 'weed' ? 'Weeding' : mode === 'groom' ? 'Grooming' : 'Watering')
  const progress = $derived(mode === 'weed' ? quiz.session.right : quiz.answered)

  let finished = $state(false) // all questions answered and credited
  let summary = $state(false)
  let leveled = $state(false) // the completion bonus pushed the player up a level

  $effect(() => quiz.sync())

  $effect(() => {
    if (!finished && progress >= length) {
      finished = true
      const before = level()
      onComplete()
      leveled = level() > before
    }
  })

  function next() {
    // A weed has no summary: the garden plays the pluck instead.
    if (finished && mode === 'weed') {
      if (leveled && !app.muted) sfx.levelUp()
      onClose()
    } else if (finished) {
      summary = true
      if (!app.muted) {
        if (mode === 'groom') sfx.groom()
        else sfx.water()
        if (leveled) setTimeout(sfx.levelUp, 900)
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
      <p>{quiz.session.right} of {length} correct</p>
      <p class="good">+{bonus} XP bonus</p>
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
