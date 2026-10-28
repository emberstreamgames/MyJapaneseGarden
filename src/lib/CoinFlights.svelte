<script lang="ts">
  import { inFlight, landed, type Flight } from './coinfly.svelte'
  import * as sfx from './sfx'
  import { app } from './store.svelte'

  // Each flight sends a few coins (one per coin earned, up to 6) in a staggered arc to the counter.
  // Every landing gives the counter its share and a little bump.

  const MAX_COINS = 6

  function fly(el: HTMLElement, f: Flight) {
    const target = document.querySelector<HTMLElement>('[data-coin-target]')
    if (!target) {
      landed(f.id, f.amount, true)
      return
    }
    const t = target.getBoundingClientRect()
    const tx = t.left + Math.min(t.width, 24) / 2, ty = t.top + t.height / 2
    const count = Math.min(f.amount, MAX_COINS)
    const share = Math.floor(f.amount / count)
    const coins = [...el.children] as HTMLElement[]
    let left = f.amount
    let done = 0
    const anims = coins.slice(0, count).map((c, i) => {
      // Burst out a little, then curve up into the counter.
      const sx = (Math.random() - 0.5) * 60, sy = -20 - Math.random() * 30
      const dx = tx - f.x, dy = ty - f.y
      const a = c.animate(
        [
          { transform: 'translate(0, 0) scale(0.6)', opacity: 0 },
          { transform: `translate(${sx}px, ${sy}px) scale(1.15)`, opacity: 1, offset: 0.25 },
          { transform: `translate(${sx + (dx - sx) * 0.5}px, ${sy + (dy - sy) * 0.3 - 40}px) scale(1)`, opacity: 1, offset: 0.6 },
          { transform: `translate(${dx}px, ${dy}px) scale(0.7)`, opacity: 0.9 },
        ],
        { duration: 850, delay: i * 90, easing: 'ease-in', fill: 'both' },
      )
      a.finished.then(
        () => {
          const last = ++done === count
          const amount = last ? left : share
          left -= amount
          landed(f.id, amount, last)
          target.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 220 })
          if (!app.muted && (i === 0 || last)) sfx.coinLand()
        },
        () => {},
      )
      return a
    })
    return () => {
      for (const a of anims) a.cancel()
      // Whatever was still in the air lands at once.
      if (left > 0 && done < count) landed(f.id, left, true)
    }
  }

  const flyer = (f: Flight) => (el: HTMLElement) => fly(el, f)
</script>

<div class="coin-flights" aria-hidden="true">
  {#each inFlight.flights as f (f.id)}
    <div class="coin-flight" style="left:{f.x}px;top:{f.y}px" {@attach flyer(f)}>
      {#each Array(Math.min(f.amount, 6)) as _}<i>🪙</i>{/each}
    </div>
  {/each}
</div>
