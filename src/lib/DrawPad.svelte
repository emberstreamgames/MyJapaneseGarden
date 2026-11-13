<script lang="ts">
  import { BOX, type CharStrokes, type Fault, type Pt } from './strokes'

  // A square practice sheet to draw one character on, in KanjiVG's 109-unit box so the reference can
  // be laid over it. ⤢ moves the same sheet to a full-screen layer for more room on a phone.
  let {
    strokes = $bindable([]),
    onCheck,
    done = false,
    show = null,
    ok = false,
    label = '',
    faults = [],
  }: {
    strokes?: Pt[][]
    onCheck: (strokes: Pt[][]) => void
    done?: boolean // answered: drawing stops
    show?: CharStrokes | null // the right strokes, played in order over the drawing
    ok?: boolean // tints the drawing as right
    label?: string // the prompt, repeated on the full-screen sheet
    faults?: Fault[] // after a miss: the player's strokes that went wrong, and the right ones they stand for
  } = $props()

  const offDrawn = $derived(new Set(faults.map((f) => f.drawn)))
  const offRef = $derived(new Set(faults.map((f) => f.stroke)))

  const TAP = 1.5 // shorter than this (in box units) is a stray tap, not a stroke: real dots are longer

  let live = $state<Pt[] | null>(null)
  let pointer: number | null = null
  let full = $state(false)
  let replay = $state(0)

  function at(e: PointerEvent, svg: SVGSVGElement): Pt {
    const r = svg.getBoundingClientRect()
    return [((e.clientX - r.left) / r.width) * BOX, ((e.clientY - r.top) / r.height) * BOX]
  }

  function down(e: PointerEvent) {
    // One finger at a time: a second touch (or a resting palm) is ignored.
    if (done || pointer !== null || e.button > 0) return
    e.preventDefault()
    const svg = e.currentTarget as SVGSVGElement
    svg.setPointerCapture(e.pointerId)
    pointer = e.pointerId
    live = [at(e, svg)]
  }

  function move(e: PointerEvent) {
    if (e.pointerId !== pointer || !live) return
    const svg = e.currentTarget as SVGSVGElement
    // Coalesced events keep fast strokes smooth where the browser batches them.
    for (const ev of e.getCoalescedEvents?.() ?? [e]) {
      const p = at(ev, svg)
      const last = live[live.length - 1]
      if (Math.hypot(p[0] - last[0], p[1] - last[1]) > 0.4) live.push(p)
    }
  }

  function up(e: PointerEvent) {
    if (e.pointerId !== pointer) return
    pointer = null
    const s = live
    live = null
    if (!s) return
    let len = 0
    for (let i = 1; i < s.length; i++) len += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1])
    if (len >= TAP) strokes.push(s)
  }

  function check() {
    if (!strokes.length || done) return
    full = false
    onCheck($state.snapshot(strokes) as Pt[][])
  }

  // A small arrowhead at a stroke's end, pointing the way it was drawn.
  function arrow(s: Pt[]): string {
    const end = s[s.length - 1]
    const from = s.findLast((p) => Math.hypot(p[0] - end[0], p[1] - end[1]) > 4)
    if (!from) return ''
    const a = Math.atan2(end[1] - from[1], end[0] - from[0])
    const pt = (r: number, t: number) => `${(end[0] + r * Math.cos(a + t)).toFixed(1)},${(end[1] + r * Math.sin(a + t)).toFixed(1)}`
    return [pt(3, 0), pt(6, 2.5), pt(6, -2.5)].join(' ')
  }

  const line = (s: Pt[]) => s.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

  // Rendered under <body>, so the quiz card's pop-in transform can't trap the fixed layer.
  function portal(node: HTMLElement) {
    document.body.appendChild(node)
    return { destroy: () => node.remove() }
  }

  // iOS Safari ignores touch-action on <svg>, so a vertical stroke turns into a page scroll and the
  // browser cancels the pointer mid-line. Non-passive touch listeners that cancel the default stop it.
  function noScroll(node: SVGSVGElement) {
    const stop = (e: TouchEvent) => {
      if (!done) e.preventDefault()
    }
    node.addEventListener('touchstart', stop, { passive: false })
    node.addEventListener('touchmove', stop, { passive: false })
    return {
      destroy() {
        node.removeEventListener('touchstart', stop)
        node.removeEventListener('touchmove', stop)
      },
    }
  }

  function onKey(e: KeyboardEvent) {
    if (full && e.key === 'Escape') full = false
  }
</script>

<svelte:window onkeydown={onKey} />

{#snippet sheet()}
  <svg
    class="pad-sheet"
    class:done
    viewBox="0 0 {BOX} {BOX}"
    role="img"
    aria-label={done ? 'Your drawing' : 'Drawing area: draw the character with your finger'}
    onpointerdown={down}
    onpointermove={move}
    onpointerup={up}
    onpointercancel={up}
    use:noScroll
  >
    <!-- Practice-paper guides: a dashed cross through the middle. -->
    <g class="pad-guide">
      <line x1={BOX / 2} y1="6" x2={BOX / 2} y2={BOX - 6} />
      <line x1="6" y1={BOX / 2} x2={BOX - 6} y2={BOX / 2} />
    </g>
    <g class="pad-ink" class:faint={!!show} class:ok>
      {#each strokes as s, i (i)}<polyline points={line(s)} class:hide={!!show && offDrawn.has(i)} />{/each}
      {#if live}<polyline points={line(live)} />{/if}
    </g>
    {#if show}
      {#key replay}
        <g class="pad-answer">
          {#each show.d as d, i (i)}
            <path {d} pathLength="1" style="--i:{i}" class:off={offRef.has(i)} />
            <text x={show.p[i][0] - 5} y={show.p[i][1] - 2} style="--i:{i}" class:off={offRef.has(i)}>{i + 1}</text>
          {/each}
        </g>
      {/key}
      <!-- On top of the right strokes, so one drawn backwards over its twin still shows which way it went. -->
      <g class="pad-off">
        {#each strokes as s, i (i)}
          {#if offDrawn.has(i)}
            <polyline points={line(s)} />
            {#if arrow(s)}<polygon points={arrow(s)} />{/if}
          {/if}
        {/each}
      </g>
    {/if}
  </svg>
{/snippet}

{#snippet tools()}
  <div class="pad-tools">
    {#if done}
      {#if show}<button onclick={() => replay++}>▶ Show the strokes again</button>{/if}
    {:else}
      <button disabled={!strokes.length} onclick={() => strokes.pop()} aria-label="Undo last stroke">↶ Undo</button>
      <button disabled={!strokes.length} onclick={() => (strokes = [])}>Clear</button>
      <button class="primary" disabled={!strokes.length} onclick={check}>Check</button>
    {/if}
  </div>
{/snippet}

<div class="pad">
  {#if !full}
    <div class="pad-wrap">
      {@render sheet()}
      {#if !done}<button class="pad-grow" onclick={() => (full = true)} aria-label="Draw full screen">⤢</button>{/if}
    </div>
  {:else}
    <div class="pad-wrap pad-away" aria-hidden="true"></div>
  {/if}
  {@render tools()}
</div>

{#if full}
  <div class="pad-full" use:portal role="dialog" aria-modal="true" aria-label="Draw full screen">
    <div class="pad-full-top">
      <span class="pad-full-label">{label}</span>
      <button class="pad-shrink" onclick={() => (full = false)} aria-label="Back to the card">⤡</button>
    </div>
    <div class="pad-full-sheet">{@render sheet()}</div>
    {@render tools()}
  </div>
{/if}
