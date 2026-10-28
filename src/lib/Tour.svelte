<script lang="ts">
  import { untrack } from 'svelte'
  import { phaseOf } from './garden'
  import { app, prepTour, setTour, tourDid } from './store.svelte'
  import { TOUR_STEPS, type TourStep } from './tour'

  // The new-player tutorial: a card pinned to the top or bottom of the screen, and a spotlight on
  // what to tap. Steps with a Next button only explain; the others wait for the player to act
  // (tourDid calls in the garden's components). The card steps aside while a sheet, quiz, menu or
  // level-up is open, unless the step is about that sheet.
  let { screen, onGarden }: { screen: string; onGarden: () => void } = $props()

  interface Step {
    title: string
    text: string | (() => string)
    screen?: 'garden' | 'shop' // where it shows; garden by default
    target?: () => Element | null
    next?: string // button label, for steps that only explain
    over?: boolean // shown over an open sheet
  }

  const find = (sel: string) => () => document.querySelector(sel)

  const STEPS: Record<TourStep, Step> = {
    hello: {
      title: 'ようこそ! Welcome to your garden',
      text: 'This garden grows as you study Japanese. Every plant is linked to a kind of question: hiragana, katakana, kanji, vocab or grammar. Answer its questions to water it, and it grows day by day until it blooms.',
      next: 'Next',
    },
    hud: {
      title: 'Level and coins',
      text: 'Up here are your level, your XP bar and your coins. Right answers earn XP. Coins come from growing plants and from little surprises around the garden. Let’s find some!',
      target: find('.garden .hud'),
      next: 'Next',
    },
    visitor: {
      title: 'A visitor!',
      text: 'Butterflies and birds drop by now and then, each with a word to review. Tap it to say hello.',
      target: find('.visitors .visitor'),
    },
    ant: {
      title: 'Busy ants',
      text: 'Ants march across the lawn, and sometimes one carries a coin. Tap the ant with the coin to take it.',
      target: find('.ants .ant.coin'),
    },
    weed: {
      title: 'Pull a weed',
      text: 'Weeds pop up every couple of hours. Tap one and answer a question to pull it for coins and XP.',
      target: find('.weed-tile'),
    },
    plant: {
      title: 'Plant a seed',
      text: 'Tap an empty plot and pick a flower. Each flower grows from a different kind of question.',
      // A plot near the middle, if it's free.
      target: () => {
        const plots = document.querySelectorAll('.bed .plot')
        return plots[5]?.classList.contains('empty') ? plots[5] : document.querySelector('.bed .plot.empty')
      },
    },
    shop: {
      title: 'Decorate your garden',
      text: () =>
        app.decor.owned.rock
          ? 'Decorations go on the + spots around the lawn. Tap one to open the Garden Shop.'
          : 'Your seed is planted! Before watering it, let’s decorate. Tap a + on the lawn: there’s a gift waiting for you.',
      target: find('.decor-spot'),
    },
    'shop-visit': {
      title: 'The Garden Shop',
      text: 'Spend your coins here on decorations, then tap a + on the lawn to place them. The fancy ones cost a lot, so keep studying and saving!',
      screen: 'shop',
      next: 'Back to the garden',
    },
    water: {
      title: 'Time to water',
      text: 'The 💧 means your seed is thirsty. Tap it.',
      target: find('.plot.thirsty .badge'),
    },
    quiz: {
      title: 'がんばって! Take the quiz',
      text: 'Answer 10 questions to water your plant. It rests for a day, then it’s ready to grow. Come back every day to keep your streak going. Good luck!',
      target: find('.sheet .primary.big-btn'),
      next: 'Got it',
      over: true,
    },
  }

  const step = $derived(app.tour && STEPS[app.tour])
  const n = $derived(app.tour ? TOUR_STEPS.indexOf(app.tour) + 1 : 0)
  // Replaying with nothing to water: end on a friendlier note than a missing 💧.
  const dry = $derived(app.tour === 'water' && !app.garden.some((p) => p && phaseOf(p, Date.now()) === 'thirsty'))

  let shown = $state(false)
  let ring = $state<{ x: number; y: number; w: number; h: number } | null>(null)
  let top = $state(false)

  // Follow the target every frame: ants and visitors move, and sheets come and go.
  $effect(() => {
    const s = step
    if (!s) return
    untrack(() => prepTour())
    let raf = 0
    let scrolled = false
    const frame = () => {
      raf = requestAnimationFrame(frame)
      const where = s.screen ?? 'garden'
      const covered = !s.over && document.querySelector('.backdrop, .lvlup, .menu')
      shown = where === screen && !covered && (where !== 'garden' || !!document.querySelector('.bed'))
      const el = shown ? s.target?.() : null
      if (!el) {
        ring = null
        return
      }
      const r = el.getBoundingClientRect()
      if (!scrolled) {
        scrolled = true
        if (r.top < 0 || r.bottom > innerHeight) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
      // Skip the update when nothing moved, so a still target doesn't re-render every frame.
      const next = { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }
      if (!ring || ring.x !== next.x || ring.y !== next.y || ring.w !== next.w || ring.h !== next.h) ring = next
      top = r.top + r.height / 2 > innerHeight * 0.55
    }
    frame()
    return () => cancelAnimationFrame(raf)
  })

  function next() {
    if (app.tour === 'shop-visit') onGarden()
    else if (app.tour) tourDid(app.tour)
  }

  function skip() {
    if (confirm('Skip the tutorial? You can replay it from Stats.')) setTour(null)
  }
</script>

{#if step && shown}
  {#if ring}
    <div class="tour-ring" style="left:{ring.x - 6}px;top:{ring.y - 6}px;width:{ring.w + 12}px;height:{ring.h + 12}px" aria-hidden="true"></div>
  {/if}
  {#key app.tour}
    <aside class="tour" class:top aria-live="polite" aria-label="Tutorial">
      <span class="tour-count">{n} / {TOUR_STEPS.length}</span>
      {#if dry}
        <h2>がんばって! You’re all set</h2>
        <p>When a plant shows a 💧, tap it and answer 10 questions to water it. Good luck!</p>
      {:else}
        <h2>{step.title}</h2>
        <p>{typeof step.text === 'string' ? step.text : step.text()}</p>
      {/if}
      <div class="tour-row">
        <button class="linkish" onclick={skip}>Skip tutorial</button>
        {#if dry}
          <button class="primary" onclick={() => setTour(null)}>Done</button>
        {:else if step.next}
          <button class="primary" onclick={next}>{step.next}</button>
        {/if}
      </div>
    </aside>
  {/key}
{/if}
