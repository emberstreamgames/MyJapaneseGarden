<script lang="ts">
  import { onMount } from 'svelte'
  import * as sfx from './sfx'
  import { app } from './store.svelte'

  // Full-screen level-up moment: the old level shakes and shrinks as it gathers energy, then pops
  // into the new one with confetti and a word of encouragement.
  let { from, to, onClose }: { from: number; to: number; onClose: () => void } = $props()

  const CHARGE_MS = 1600
  const CHEERS = [
    { ja: 'すごい!', gloss: 'sugoi: “amazing”', line: 'Every answer helps your garden grow.' },
    { ja: 'やったね!', gloss: 'yatta ne: “you did it”', line: 'Keep up the great studying.' },
    { ja: 'おめでとう!', gloss: 'omedetō: “congratulations”', line: 'Your Japanese is blooming.' },
    { ja: 'いいね!', gloss: 'ii ne: “nice”', line: 'One more step on your Japanese journey.' },
    { ja: 'その調子!', gloss: 'sono chōshi: “keep it up”', line: 'Your hard work is paying off.' },
  ]
  const cheer = CHEERS[Math.floor(Math.random() * CHEERS.length)]
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const COLORS = ['#ffc94d', '#ff9ec0', '#7c5cff', '#35d49a', '#5bb6ff', '#ff8a3d']

  const rand = (a: number, b: number) => a + Math.random() * (b - a)
  const confetti = Array.from({ length: 70 }, (_, i) => ({
    dx: rand(-48, 48), // vw
    dy: rand(-42, -14), // vh, the top of its arc
    fall: rand(30, 60), // vh, where it ends
    rot: rand(-720, 720),
    w: rand(6, 10),
    h: rand(10, 16),
    color: COLORS[i % COLORS.length],
    delay: rand(0, 0.15),
    dur: rand(1.8, 2.8),
    round: Math.random() < 0.3,
  }))
  // Sparks drawn in toward the number while it charges.
  const sparks = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2
    const d = rand(90, 140)
    return { x: Math.cos(a) * d, y: Math.sin(a) * d, delay: rand(0, CHARGE_MS / 1000 - 0.5) }
  })

  let popped = $state(reduced)
  let ok = $state<HTMLButtonElement>()

  // The shake grows and the number shrinks as it charges. Keyframes are built here so the jitter
  // can get stronger over time, which a looping CSS shake can't.
  function condense(el: HTMLElement) {
    if (reduced) return
    const keys: Keyframe[] = Array.from({ length: 49 }, (_, k) => {
      const t = k / 48
      const amp = k === 48 ? 0 : 1 + 9 * t * t
      const s = 1 - 0.72 * t ** 1.6
      const glow = 6 + 34 * t
      return {
        transform: `translate(${rand(-amp, amp).toFixed(1)}px, ${rand(-amp, amp).toFixed(1)}px) scale(${s.toFixed(3)})`,
        textShadow: `0 0 ${glow.toFixed(0)}px #ffd76a, 0 0 ${(glow * 2).toFixed(0)}px #ff9ec0`,
      }
    })
    const a = el.animate(keys, { duration: CHARGE_MS, easing: 'ease-in', fill: 'forwards' })
    a.finished.then(pop, () => {})
    return () => a.cancel()
  }

  function pop() {
    popped = true
    if (!app.muted) {
      sfx.levelUp()
      setTimeout(sfx.fanfare, 250)
    }
  }

  onMount(() => {
    if (reduced) {
      if (!app.muted) sfx.levelUp()
    } else if (!app.muted) sfx.charge(CHARGE_MS / 1000)
  })

  $effect(() => {
    if (popped) ok?.focus()
  })

  function onKey(e: KeyboardEvent) {
    if (popped && e.key === 'Escape') onClose()
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="lvlup" role="dialog" aria-modal="true" aria-label="Level up! You reached level {to}">
  <div class="lvlup-card">
    <div class="lvlup-orb">
      {#if !popped}
        {#each sparks as s}<i class="spark" style="--x:{s.x}px;--y:{s.y}px;--delay:{s.delay}s"></i>{/each}
        <b class="lvlup-num old" {@attach condense}>{from}</b>
      {:else}
        <b class="lvlup-flash"></b>
        <b class="lvlup-num new">{to}</b>
      {/if}
    </div>
    {#if popped}
      <div class="lvlup-text">
        <p class="lvlup-label">Level up!</p>
        <h2>You reached level {to}</h2>
        <p class="lvlup-cheer"><b lang="ja">{cheer.ja}</b> <span class="dim">({cheer.gloss})</span></p>
        <p>{cheer.line}</p>
        <button class="primary big-btn" bind:this={ok} onclick={onClose}>OK</button>
      </div>
    {/if}
  </div>
  {#if popped && !reduced}
    <div class="confetti" aria-hidden="true">
      {#each confetti as c}
        <i
          style="--dx:{c.dx}vw;--dy:{c.dy}vh;--fall:{c.fall}vh;--rot:{c.rot}deg;width:{c.w}px;height:{c.round ? c.w : c.h}px;background:{c.color};border-radius:{c.round ? '50%' : '2px'};animation-delay:{c.delay}s;animation-duration:{c.dur}s"
        ></i>
      {/each}
    </div>
  {/if}
</div>
