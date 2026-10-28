<script lang="ts">
  import { SPOTS, VIEW } from './meadow'

  // Played on the garden after a watering quiz: droplets circle over the bed, then swirl down
  // into plot `index` and vanish. `onLand` fires once as they reach the plant, `onDone` at the end.
  let { index, onLand, onDone }: { index: number; onLand: () => void; onDone: () => void } = $props()

  const COUNT = 8
  const DUR = 2200 // ms
  const ORBIT = 0.55 // share of the run spent circling
  const HUB = { x: VIEW.w / 2, y: 200 } // orbit centre, in bed units
  const R = 62

  const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

  // Where drop i sits (in bed units) at time t in 0..1.
  function at(i: number, t: number, to: { x: number; y: number }) {
    const a = (i / COUNT) * 2 * Math.PI + t * 3.2 * Math.PI
    const fly = t < ORBIT ? 0 : ease((t - ORBIT) / (1 - ORBIT))
    const r = R * Math.min(1, t / 0.12) * (1 - fly)
    return {
      x: HUB.x + (to.x - HUB.x) * fly + Math.cos(a) * r,
      y: HUB.y + (to.y - HUB.y) * fly + Math.sin(a) * r * 0.6, // flattened, like the bed's perspective
    }
  }

  function run(el: HTMLDivElement) {
    // Without motion, keep the sound cue and skip the flight.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onLand()
      onDone()
      return
    }
    const spot = SPOTS[index]
    const to = { x: spot.x, y: spot.y - 6 } // just above the soil at the stem
    const k = el.clientWidth / VIEW.w
    const drops = [...el.querySelectorAll<HTMLElement>('.wdrop')]
    const anims = drops.map((d, i) =>
      d.animate(
        Array.from({ length: 49 }, (_, s) => {
          const t = s / 48
          const p = at(i, t, to)
          const fade = t < 0.08 ? t / 0.08 : t > 0.94 ? (1 - t) / 0.06 : 1
          const size = t > ORBIT ? 1 - 0.5 * ((t - ORBIT) / (1 - ORBIT)) : 1
          return { transform: `translate(${p.x * k}px, ${p.y * k}px) scale(${size})`, opacity: fade }
        }),
        { duration: DUR, fill: 'forwards' },
      ),
    )
    const ring = el.querySelector<HTMLElement>('.wring')!
    ring.style.left = `${(to.x / VIEW.w) * 100}%`
    ring.style.top = `${(to.y / VIEW.h) * 100}%`
    const land = setTimeout(() => {
      onLand()
      ring.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.2)', opacity: 0.9 },
          { transform: 'translate(-50%, -50%) scale(1.4)', opacity: 0 },
        ],
        { duration: 500, easing: 'ease-out', fill: 'forwards' },
      )
    }, DUR * 0.94)
    const done = setTimeout(onDone, DUR + 500)
    return () => {
      clearTimeout(land)
      clearTimeout(done)
      anims.forEach((a) => a.cancel())
    }
  }
</script>

<div class="wsplash" aria-hidden="true" {@attach run}>
  {#each Array(COUNT) as _}<i class="wdrop"></i>{/each}
  <b class="wring"></b>
</div>
