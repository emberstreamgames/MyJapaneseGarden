<script lang="ts">
  import Celebration from './Celebration.svelte'
  import { BLOOMED, PERFECT_COINS, PRESERVE_GROOMS, canPreserve, type Plot } from './garden'
  import PlantSprite from './PlantSprite.svelte'
  import type { Quiz } from './quiz.svelte'
  import * as sfx from './sfx'
  import { XP_PER_LEVEL, app, knownWords, level, levelProgress, tendsLeft, type QuizReward } from './store.svelte'
  import { STREAK_RAIN_EVERY } from './streak'

  // The end of a watering, grooming or tending quiz: the score, then each reward popping in turn
  // while the XP counts up and fills the bar.
  let {
    quiz,
    mode,
    plot,
    reward,
    length,
    bonus,
    noun,
    startXp,
    startWords,
    onClose,
    onTend,
  }: {
    quiz: Quiz
    mode: 'water' | 'groom' | 'tend'
    plot: Plot | null
    reward: QuizReward | null
    length: number
    bonus: number
    noun: string
    startXp: number
    startWords: number
    onClose: () => void
    onTend?: () => void
  } = $props()

  const STEP_S = 0.32 // between rewards popping in
  const FIRST_S = 0.7
  const READ_MILESTONES = [10, 25, 50, 100, 150, 200, 300, 400, 500, 600]
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  const right = $derived(quiz.session.right)
  const perfect = $derived(right >= length)
  const share = $derived(right / length)
  const stars = $derived(perfect ? 3 : share >= 0.7 ? 2 : 1)
  const cheer = $derived(
    perfect ? { ja: 'かんぺき!', gloss: 'kanpeki: “perfect”' } : share >= 0.8 ? { ja: 'すごい!', gloss: 'sugoi: “amazing”' } : share >= 0.5 ? { ja: 'いいね!', gloss: 'ii ne: “nice”' } : null,
  )
  const totalXp = $derived(quiz.xp + bonus)
  const startPct = $derived(((startXp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100)
  const startLevel = $derived(Math.floor(startXp / XP_PER_LEVEL) + 1)
  const leveled = $derived(level() > startLevel)
  const words = $derived(knownWords())
  const plural = (n: number, word: string) => (n === 1 ? word : `${word}s`)
  const units = (n: number) => (n === 1 ? noun.slice(0, -1) : noun)

  function streakRows(r: QuizReward) {
    const n = r.study.streak.count
    const out: { text: string; cls: string }[] = []
    if (r.study.event === 'next') out.push({ cls: 'streak-note', text: `🌱 Day ${n} streak! Come back tomorrow for day ${n + 1}.` })
    else if (r.study.event === 'rain') out.push({ cls: 'streak-note', text: `☔ Rain watered your garden while you were away. Day ${n} streak!` })
    else if (r.study.event === 'fresh') out.push({ cls: 'streak-note', text: '🌱 Day 1 of a new streak. Water a plant tomorrow to keep it growing.' })
    if (r.study.bonus) out.push({ cls: 'coins', text: `+${r.study.bonus} 🪙 for a ${n}-day streak!` })
    if (r.study.rainEarned) out.push({ cls: 'dim', text: `☔ You earned a rain day: if you miss a day, it waters the garden for you. (One every ${STREAK_RAIN_EVERY} days.)` })
    return out
  }

  // What's left for this plant, so the summary points at tomorrow.
  function hook(): string {
    if (!plot || mode === 'tend') return ''
    if (mode === 'groom') {
      if (canPreserve(plot)) return '🌸 Ready to preserve!'
      const n = PRESERVE_GROOMS - plot.grooms
      return `✂️ ${n} more ${plural(n, 'grooming')} to preserve it`
    }
    const n = BLOOMED - plot.stage - 1
    return n > 0 ? `🌿 ${n} more ${plural(n, 'watering')} to bloom` : '🌸 It blooms at its next growth!'
  }

  const rows = $derived.by(() => {
    const out: { text: string; cls: string }[] = []
    if (quiz.stronger) out.push({ cls: 'good', text: `💪 ${quiz.stronger} ${units(quiz.stronger)} got stronger` })
    if (quiz.met) out.push({ cls: 'dim', text: `🌱 ${quiz.met} new ${units(quiz.met)}` })
    if (words > startWords) {
      const milestone = READ_MILESTONES.findLast((m) => m > startWords && m <= words)
      out.push(milestone ? { cls: 'sum-big', text: `📖 You can read ${milestone}+ words now!` } : { cls: 'good', text: `📖 +${words - startWords} ${plural(words - startWords, 'word')} you can read` })
    }
    if (mode !== 'tend' && quiz.bestCombo >= 3) out.push({ cls: 'dim', text: `Best combo this round: 🔥 ${quiz.bestCombo}` })
    if (reward?.perfect) out.push({ cls: 'coins', text: `+${PERFECT_COINS} 🪙 perfect bonus` })
    if (reward) out.push(...streakRows(reward))
    const next = hook()
    if (next) out.push({ cls: 'sum-hook', text: next })
    return out
  })

  // Everything in pop order: mastered cards come first, the biggest news of the quiz.
  const order = (i: number) => `--at:${(FIRST_S + i * STEP_S).toFixed(2)}s`
  const firstRow = $derived(quiz.mastered.length)
  const pops = $derived(firstRow + rows.length)

  const confetti = Array.from({ length: 46 }, (_, i) => ({
    dx: Math.random() * 90 - 45,
    dy: -14 - Math.random() * 26,
    fall: 30 + Math.random() * 40,
    rot: Math.random() * 1400 - 700,
    size: 6 + Math.random() * 5,
    color: ['#f9d37a', '#f9c79d', '#c3d07c', '#f6bc61', '#cfe6dd'][i % 5],
    delay: Math.random() * 0.2,
    dur: 1.8 + Math.random(),
  }))

  let xp = $state(0)
  let bar = $state(0)

  // The count and bar run alongside the rewards; each reward gets a soft tick as it lands.
  function play() {
    const end = leveled ? 100 : levelProgress()
    if (reduced) {
      xp = totalXp
      bar = end
      return
    }
    bar = startPct
    const started = performance.now()
    const count = 1100
    let raf = requestAnimationFrame(function step(t) {
      const p = Math.min(1, (t - started) / count)
      xp = Math.round(totalXp * (1 - (1 - p) ** 3))
      if (p < 1) raf = requestAnimationFrame(step)
    })
    const fill = setTimeout(() => (bar = end), 120)
    const ticks = app.muted ? [] : Array.from({ length: pops }, (_, i) => setTimeout(sfx.coinLand, (FIRST_S + i * STEP_S) * 1000))
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(fill)
      ticks.forEach(clearTimeout)
    }
  }
</script>

<div class="empty summary" {@attach play}>
  {#if (perfect || leveled) && !reduced}
    <div class="sum-confetti" aria-hidden="true">
      <div class="confetti">
        {#each confetti as c}
          <i style="--dx:{c.dx.toFixed(1)}vw;--dy:{c.dy.toFixed(1)}vh;--fall:{c.fall.toFixed(1)}vh;--rot:{c.rot.toFixed(0)}deg;width:{c.size.toFixed(1)}px;height:{(c.size * 1.5).toFixed(1)}px;background:{c.color};animation-delay:{c.delay.toFixed(2)}s;animation-duration:{c.dur.toFixed(2)}s"></i>
        {/each}
      </div>
    </div>
  {/if}

  {#if mode !== 'tend'}
    <div class="sum-plant fxwrap">
      {#if plot}<PlantSprite species={plot.species} stage={plot.stage} variant={plot.variant} />{/if}
      <Celebration kind={mode === 'groom' ? 'groom' : 'water'} />
    </div>
  {/if}

  <h2 class="sum-title">{mode === 'tend' ? 'Nicely tended!' : mode === 'groom' ? 'Groomed!' : 'Watered!'}</h2>
  <!-- The score as a branch of three fruits: one ripens for each star. -->
  <div class="sum-branch" role="img" aria-label="{stars} of 3 stars">
    <i class="sum-bough"></i>
    {#each [0, 1, 2] as i}<span class="sum-fruit" class:on={i < stars} style="--i:{i}"><i></i><span></span></span>{/each}
  </div>
  {#if cheer}<p class="sum-cheer"><b lang="ja">{cheer.ja}</b> <span class="dim">({cheer.gloss})</span></p>{/if}
  <p>{#if perfect}Every answer right{:else}{right} of {length} correct{/if}</p>

  <div class="sum-xp">
    <div class="sum-xp-row"><b class="lvl">Lv {startLevel}</b><b class="sum-gain" aria-label="{totalXp} XP earned">+{xp} XP</b></div>
    <div class="xpbar sum-bar" aria-hidden="true"><div style="width:{bar}%"></div></div>
  </div>

  {#each quiz.mastered as m, i (m.item.id)}
    <div class="sum-pop sum-mastered" style={order(i)}>
      <b>🌸 Mastered!</b>
      <span><span class="jp" lang="ja">{m.item.front}</span> {m.item.back}</span>
      {#if m.unlocked}<span class="dim">Its harder version is unlocked</span>{/if}
    </div>
  {/each}

  {#each rows as r, i}
    <p class="sum-pop {r.cls}" style={order(firstRow + i)}>{r.text}</p>
  {/each}
  {#if leveled}<p class="sum-pop sum-big" style={order(pops)}>Level up! Lv {level()}</p>{/if}
  {#if mode === 'tend'}
    <p class="rest-note sum-pop" style={order(pops)}>Now take a break. Words settle while you rest, so this is a good place to stop.</p>
  {/if}

  {#if quiz.missed.length}
    <div class="sum-missed sum-pop" style={order(pops + 1)}>
      <h3>Keep practising</h3>
      {#each quiz.missed as m (m.item.id)}
        <div class="line">
          <span class="jp" lang="ja">{m.item.front}</span><em>{m.item.back}</em>
          {#if m.fixed}<span class="good">✓ reviewed</span>{/if}
        </div>
      {/each}
      {#if onTend && tendsLeft()}
        <button class="linkish sum-tend" onclick={onTend}>🌿 Go over your weak words</button>
      {/if}
    </div>
  {/if}
  <button class="primary" onclick={onClose}>Done</button>
</div>
