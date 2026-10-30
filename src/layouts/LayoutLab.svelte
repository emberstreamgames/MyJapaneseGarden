<script lang="ts">
  import PlantSprite from '../lib/PlantSprite.svelte'
  import { BLOOMED, COOLDOWN_MS, PRESERVE_GROOMS, QUIZ_LENGTH, SPECIES, type Species } from '../lib/garden'
  import { FLOWERS } from '../lib/collection'
  import { DECOR_SPOTS, VIEW } from '../lib/meadow'
  import { deckReady } from '../data/items'

  // Dev-only comparison of garden layouts with fewer, larger plots. Everything is drawn in the
  // garden's 400x440 bed units, like meadow.ts, so sizes match the real garden.

  type Layout = { id: string; name: string; rows: number[]; stagger?: boolean }
  const LAYOUTS: Layout[] = [
    { id: 'g16', name: '4×4 grid (old)', rows: [4, 4, 4, 4] },
    { id: 'g12w', name: '4×3 grid', rows: [4, 4, 4] },
    { id: 's12', name: '3-3-3-3 staggered', rows: [3, 3, 3, 3], stagger: true },
    { id: 's11', name: '4-3-4 staggered', rows: [4, 3, 4] },
    { id: 's10', name: '3-2-3-2 staggered', rows: [3, 2, 3, 2] },
    { id: 's10b', name: '3-4-3 staggered', rows: [3, 4, 3] },
    { id: 's9', name: '3-3-3 staggered', rows: [3, 3, 3], stagger: true },
    { id: 'g9', name: '3×3 grid', rows: [3, 3, 3] },
  ]

  // Today's plot: 75x84 cells, plants at 0.9 of the sprite, reaching 66 units above their ground point.
  const NOW = { col: 75, row: 84, above: 66, s: 0.9 }
  const TOP = 24 // highest a plant's box may reach
  const LAST_Y = 345 // lowest ground point, leaving room for the rest timer and the bed's edge
  const SPAN = 300 // width the columns share
  const BED = { cx: 200, cy: 222, rx: 166, ry: 182 }

  function build(l: Layout) {
    const cols = Math.max(...l.rows)
    const col = SPAN / cols
    const staggered = !!l.stagger || new Set(l.rows).size > 1
    // A staggered row's plants stand between, not behind, the row in front, so rows can sit closer.
    const rowRoom = staggered ? 1.25 : 1
    let k = col / NOW.col, row = 0
    for (let n = 0; n < 4; n++) {
      row = l.rows.length > 1 ? (LAST_Y - TOP - NOW.above * k) / (l.rows.length - 1) : 0
      k = Math.min(col / NOW.col, (row * rowRoom) / NOW.row, 1.45)
    }
    const y0 = LAST_Y - row * (l.rows.length - 1)
    const spots = l.rows.flatMap((n, r) =>
      Array.from({ length: n }, (_, c) => ({
        x: 200 + (c - (n - 1) / 2) * col + (l.stagger ? (r % 2 ? 1 : -1) * col / 4 : 0),
        y: y0 + r * row,
      })),
    )
    // Each row's tilled mound follows its plants: shifted with an offset row, and shortened so it
    // stays inside the bed's edge.
    const mounds = l.rows.map((_, r) => {
      const shift = l.stagger ? ((r % 2 ? 1 : -1) * col) / 4 : 0
      return { cx: 200 + shift, cy: y0 + r * row - 1, rx: Math.min(150, BED.rx - 4 - Math.abs(shift)) }
    })
    return { ...l, spots, mounds, k, col, row, s: NOW.s * k }
  }
  const BUILT = LAYOUTS.map(build)

  // Weed spots, found the way meadow.ts does it but clear of this layout's (larger) plants.
  const STONES = [[16, 140], [384, 296], [374, 316], [62, 424]]
  function rng(seed: number) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }
  function weedSpots(b: (typeof BUILT)[number]) {
    const r = rng(11)
    const out: { x: number; y: number }[] = []
    const offBed = (x: number, y: number) => ((x - BED.cx) / (BED.rx + 12)) ** 6 + ((y - BED.cy) / (BED.ry + 12)) ** 6 >= 1
    const clear = (x: number, y: number) => b.spots.every((s) => Math.abs(x - s.x) > 34 * b.k || y - 24 > s.y + 12 || y < s.y - 80 * b.k)
    for (let k = 0; k < 4000 && out.length < 18; k++) {
      const x = 14 + r() * 372, y = 26 + r() * 406
      if (!offBed(x, y) || !clear(x, y)) continue
      if (STONES.some(([sx, sy]) => Math.hypot(x - sx, y - sy) < 20)) continue
      if (DECOR_SPOTS.some((d) => Math.abs(x - d.x) < 34 && y > d.y - 50 && y < d.y + 32)) continue
      if (out.some((p) => Math.hypot(x - p.x, y - p.y) < 30)) continue
      out.push({ x, y })
    }
    return out
  }

  const bedPath = (() => {
    let d = ''
    for (let i = 0; i < 72; i++) {
      const t = (i / 72) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t)
      const x = BED.cx + BED.rx * Math.sign(c) * Math.abs(c) ** (1 / 3), y = BED.cy + BED.ry * Math.sign(s) * Math.abs(s) ** (1 / 3)
      d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
    }
    return d + 'Z'
  })()

  // Study load. A plot takes one quiz per cooldown, so a full garden asks for about one quiz per plot a day.
  const SECONDS_PER_QUESTION = 12
  const QUIZZES_PER_FLOWER = BLOOMED - 1 + PRESERVE_GROOMS // waterings to bloom, then grooms to preserve
  const SPECIES_LIST = Object.keys(SPECIES) as Species[]
  const OPEN_SPECIES = SPECIES_LIST.filter((s) => deckReady(SPECIES[s].deck))
  const perDay = (n: number) => n * Math.min(1, 24 / (COOLDOWN_MS / 3_600_000))
  const load = (n: number) => {
    const quizzes = perDay(n)
    return {
      quizzes,
      questions: quizzes * QUIZ_LENGTH,
      minutes: (quizzes * QUIZ_LENGTH * SECONDS_PER_QUESTION) / 60,
      collectionDays: Math.ceil((FLOWERS.length * QUIZZES_PER_FLOWER) / n),
    }
  }

  // Preview controls.
  let stageMode = $state<'mixed' | 'seed' | 'sprout' | 'bloom'>('mixed')
  let phone = $state(375)
  let showWeeds = $state(false)
  let showHits = $state(false)
  const MIXED = [BLOOMED, 5, 3, 6, 1, BLOOMED, 4, 2, BLOOMED, 6, 5, 3, 1, BLOOMED, 4, 6]
  const stageFor = (i: number) =>
    stageMode === 'seed' ? 1 : stageMode === 'sprout' ? 4 : stageMode === 'bloom' ? BLOOMED : MIXED[i % MIXED.length]
  // The bed is the page width minus 16px gutters, up to 480px (app.css).
  const bedPx = $derived(Math.min(480, phone - 32))
  const px = (units: number) => Math.round((units * bedPx) / VIEW.w)

  const pct = (n: number, of: number) => `${((n / of) * 100).toFixed(3)}%`
  const artBox = (b: (typeof BUILT)[number], p: { x: number; y: number }) =>
    `left:${pct(p.x - 50 * b.s, VIEW.w)};top:${pct(p.y - 86 * b.s, VIEW.h)};width:${pct(100 * b.s, VIEW.w)};height:${pct(100 * b.s, VIEW.h)}`
  // Tap areas, in two parts. The soil pad is an ellipse around the ground point; the plant is a
  // narrow strip up the stem to the head. Where they overlap (a staggered row's plants reach up into
  // the soil of the row behind), the soil pad wins, since that's where players aim for a plot.
  type B = (typeof BUILT)[number]
  type P = { x: number; y: number }
  const soilPad = (b: B, p: P) => ({ cx: p.x, cy: p.y + 2 * b.k, rx: b.col * 0.42, ry: 17 * b.k })
  const plantStrip = (b: B, p: P) => ({ l: p.x - 20 * b.k, r: p.x + 20 * b.k, t: p.y - NOW.above * b.k, btm: p.y })
  function hitAt(b: B, x: number, y: number) {
    // Nearest soil pad containing the tap, measured in pad radii.
    let best = -1, bestD = 1
    b.spots.forEach((p, i) => {
      const s = soilPad(b, p), d = ((x - s.cx) / s.rx) ** 2 + ((y - s.cy) / s.ry) ** 2
      if (d <= bestD) (best = i), (bestD = d)
    })
    if (best >= 0) return best
    let bestX = Infinity
    b.spots.forEach((p, i) => {
      const h = plantStrip(b, p)
      if (x >= h.l && x <= h.r && y >= h.t && y <= h.btm && Math.abs(x - p.x) < bestX) (best = i), (bestX = Math.abs(x - p.x))
    })
    return best
  }

  // Tap test: tap the glowing plot ten times; misses are taps on the wrong plot or on the lawn.
  type Run = { id: string; target: number; n: number; misses: number; ms: number[]; at: number; last: number[] }
  let run = $state<Run | null>(null)
  let results = $state<Record<string, { misses: number; avg: number; taps: number }>>({})
  const ROUNDS = 10

  function nextTarget(count: number, prev: number) {
    let t = prev
    while (t === prev) t = Math.floor(Math.random() * count)
    return t
  }
  function startTest(id: string) {
    const b = BUILT.find((x) => x.id === id)!
    run = { id, target: nextTarget(b.spots.length, -1), n: 0, misses: 0, ms: [], at: performance.now(), last: [] }
  }
  function tap(e: PointerEvent, b: (typeof BUILT)[number]) {
    if (!run || run.id !== b.id) return
    const box = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = ((e.clientX - box.left) / box.width) * VIEW.w, y = ((e.clientY - box.top) / box.height) * VIEW.h
    if (hitAt(b, x, y) !== run.target) {
      run.misses++
      return
    }
    const now = performance.now()
    run.ms.push(now - run.at)
    run.at = now
    run.n++
    if (run.n >= ROUNDS) {
      results[b.id] = { misses: run.misses, avg: run.ms.reduce((a, m) => a + m, 0) / run.ms.length, taps: run.n }
      run = null
    } else run.target = nextTarget(b.spots.length, run.target)
  }

  const RECOMMENDED = 's10'
</script>

<main>
  <header>
    <h1>Garden layout lab</h1>
    <p class="dim">
      Dev only. Each bed uses the real plant art at the size its spacing allows, in the garden's 400×440 units. The lawn
      art is simplified.
    </p>
    <div class="controls">
      <label>Plants
        <select bind:value={stageMode}>
          <option value="mixed">Mixed stages</option>
          <option value="seed">All seeded</option>
          <option value="sprout">All sprouts</option>
          <option value="bloom">All bloomed</option>
        </select>
      </label>
      <label>Screen
        <select bind:value={phone}>
          <option value={360}>360 px phone</option>
          <option value={375}>375 px phone (iPhone mini/SE)</option>
          <option value={430}>430 px phone (Pro Max)</option>
          <option value={600}>Tablet / desktop (480 px bed)</option>
        </select>
      </label>
      <label class="check"><input type="checkbox" bind:checked={showWeeds} /> Weed spots</label>
      <label class="check"><input type="checkbox" bind:checked={showHits} /> Tap boxes</label>
    </div>
  </header>

  <section class="rec">
    <h2>Chosen: 10 plots, 3-2-3-2 staggered</h2>
    <ul>
      <li>
        <b>Study load.</b> A plot takes one quiz per {COOLDOWN_MS / 3_600_000} h cooldown, so a full garden asks for about one
        quiz per plot a day. At 16 plots that's 160 questions, about {Math.round(load(16).minutes)} minutes. Few players keep
        all 16 going, which leaves thirsty plants nagging every day. Ten plots is 100 questions, about
        {Math.round(load(10).minutes)} minutes: a solid daily session that most players can finish.
      </li>
      <li>
        <b>One of each.</b> There are {SPECIES_LIST.length} species. Ten plots holds one of every species once grammar has
        content, so no deck has to wait for a free plot. Right now {OPEN_SPECIES.length} are unlocked.
      </li>
      <li>
        <b>Bigger plants.</b> Three columns instead of four makes each column {Math.round(SPAN / 3)} units wide, not 75.
        Offsetting the rows lets them sit closer without plants hiding behind each other, so plants draw about
        {Math.round((BUILT.find((b) => b.id === RECOMMENDED)!.k - 1) * 100)}% larger and tap targets get wider.
      </li>
      <li>
        <b>The collection still moves.</b> A flower takes {QUIZZES_PER_FLOWER} quizzes ({BLOOMED - 1} waterings, then
        {PRESERVE_GROOMS} grooms). Pressing all {FLOWERS.length} flowers takes about {load(10).collectionDays} days at 10
        plots, against {load(16).collectionDays} at 16.
      </li>
      <li>
        <b>Runner-up: 3×3 (9).</b> It has the largest plants and the shortest session, but a species is always left out, and
        the straight rows look more like a planter than a garden.
      </li>
      <li class="dim">
        Before shipping: plots past the new count need a save migration (bump <code>SAVE_VERSION</code>; keep the
        most-grown plants, auto-preserve or refund the rest). The tour points at <code>plots[5]</code>, which still exists.
        Weed spots are recomputed from <code>SPOTS</code>; tick "Weed spots" to check there are still at least 6.
      </li>
    </ul>
  </section>

  <div class="grid">
    {#each BUILT as b (b.id)}
      {@const L = load(b.spots.length)}
      {@const weeds = weedSpots(b)}
      {@const testing = run?.id === b.id}
      <article class:pick={b.id === RECOMMENDED}>
        <h2>
          {b.spots.length} · {b.name}
          {#if b.id === RECOMMENDED}<span class="tag">in the game</span>{/if}
        </h2>
        <div class="frame" style="width:{bedPx}px">
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div class="bed" class:testing onpointerdown={(e) => tap(e, b)}>
            <svg class="scene" viewBox="0 0 400 440" aria-hidden="true">
              <rect width="400" height="440" fill="#5aab45" />
              <path d={bedPath} fill="#4a301d" stroke="#3a7f2e" stroke-width="4" />
              {#each b.mounds as m}
                <ellipse cx={m.cx} cy={m.cy + 6} rx={m.rx + 2} ry={28 * Math.min(b.k, 1.2)} fill="#20140b" opacity="0.5" />
                <ellipse cx={m.cx} cy={m.cy} rx={m.rx} ry={28 * Math.min(b.k, 1.2)} fill="#7c5234" />
              {/each}
              {#each DECOR_SPOTS as d}<circle cx={d.x} cy={d.y - 6} r="6" fill="#fff" opacity="0.25" />{/each}
              {#if showWeeds}
                {#each weeds as w}<circle cx={w.x} cy={w.y} r="5" fill="#d4ff3a" stroke="#234" stroke-width="1" />{/each}
              {/if}
              {#if showHits || testing}
                <!-- A pad wins where it overlaps a strip, so the strips are masked by every pad. -->
                <mask id="pads-{b.id}">
                  <rect width="400" height="440" fill="#fff" />
                  {#each b.spots as p}{@const s = soilPad(b, p)}<ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill="#000" />{/each}
                </mask>
                <g mask="url(#pads-{b.id})">
                {#each b.spots as p, i}
                  {@const h = plantStrip(b, p)}
                  <rect
                    x={h.l}
                    y={h.t}
                    width={h.r - h.l}
                    height={h.btm - h.t}
                    rx="8"
                    class="hit"
                    class:target={testing && run?.target === i}
                    class:outline={showHits}
                  />
                {/each}
                </g>
                {#each b.spots as p, i}
                  {@const s = soilPad(b, p)}
                  <ellipse
                    cx={s.cx}
                    cy={s.cy}
                    rx={s.rx}
                    ry={s.ry}
                    class="hit pad"
                    class:target={testing && run?.target === i}
                    class:outline={showHits}
                  />
                {/each}
              {/if}
            </svg>
            {#each b.spots as p, i}
              <svg class="hole" style={artBox(b, p)} viewBox="{-50 * b.s} {-86 * b.s} {100 * b.s} {100 * b.s}" aria-hidden="true">
                <ellipse cy="2" rx={17 * b.k} ry={5.5 * b.k} fill="#2e1d11" opacity="0.45" />
                <ellipse rx={13 * b.k} ry={4.2 * b.k} fill="#6a4529" />
              </svg>
              <div class="art" style={artBox(b, p)}>
                <PlantSprite species={SPECIES_LIST[i % SPECIES_LIST.length]} stage={stageFor(i)} variant={i % 3} soil={false} />
              </div>
            {/each}
          </div>
        </div>

        <dl>
          <div><dt>Plant size</dt><dd>{Math.round(b.k * 100)}% of the old 4×4's</dd></div>
          <div><dt>Soil pad width</dt><dd>{px(b.col * 0.84)} px <span class="dim">(old whole cell {px(NOW.col)})</span></dd></div>
          <div><dt>Full garden / day</dt><dd>{L.quizzes} quizzes · {L.questions} Q · ~{Math.round(L.minutes)} min</dd></div>
          <div><dt>Whole collection</dt><dd>~{L.collectionDays} days</dd></div>
          <div><dt>Weed spots</dt><dd class:warn={weeds.length < 6}>{weeds.length}</dd></div>
        </dl>

        <div class="test">
          {#if testing && run}
            <span>Tap the glowing plot · {run.n}/{ROUNDS} · misses {run.misses}</span>
            <button onclick={() => (run = null)}>Stop</button>
          {:else}
            <button onclick={() => startTest(b.id)}>{results[b.id] ? 'Retest' : 'Tap test'}</button>
            {#if results[b.id]}
              <span>{Math.round(results[b.id].avg)} ms a tap · {results[b.id].misses} misses</span>
            {/if}
          {/if}
        </div>
      </article>
    {/each}
  </div>
  <p class="dim foot">
    Study time assumes {SECONDS_PER_QUESTION} s a question. The tap test uses rectangular boxes; the real garden also clips taps
    to the soil. Try it on a phone at <code>/layouts.html</code> on the LAN URL.
  </p>
</main>

<style>
  main { max-width: 1200px; }
  .dim { color: var(--dim); font-size: 0.9rem; font-weight: normal; }
  .controls { display: flex; flex-wrap: wrap; gap: 10px 18px; align-items: center; margin-top: 10px; }
  .controls label { display: inline-flex; gap: 8px; align-items: center; }
  .check { cursor: pointer; }
  .rec { margin: 20px 0; padding: 14px 18px; border-radius: 14px; background: var(--panel); border: 2px solid #f2b51c; }
  .rec h2 { margin: 0 0 6px; }
  .rec ul { margin: 0; padding-left: 20px; display: grid; gap: 6px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr)); gap: 16px; }
  article { padding: 12px; border-radius: 14px; background: var(--panel); display: flex; flex-direction: column; gap: 10px; min-width: 0; }
  article.pick { outline: 3px solid #f2b51c; }
  article h2 { margin: 0; font-size: 1.05rem; display: flex; gap: 8px; align-items: center; }
  .tag { font-size: 0.75rem; padding: 2px 8px; border-radius: 99px; background: #f2b51c; color: #3a2a00; }
  .frame { max-width: 100%; margin: 0 auto; }
  .bed { position: relative; aspect-ratio: 400 / 440; border-radius: 12px; overflow: hidden; touch-action: manipulation; }
  .bed.testing { cursor: crosshair; }
  .scene { position: absolute; inset: 0; width: 100%; height: 100%; }
  .hole, .art { position: absolute; pointer-events: none; }
  .hit { fill: none; stroke: none; }
  .hit.outline { stroke: #fff; stroke-opacity: 0.7; stroke-dasharray: 4 3; }
  .hit.pad.outline { stroke: #9fe3ff; stroke-dasharray: none; }
  .hit.target { fill: #ffd76a; fill-opacity: 0.45; }
  .art :global(svg) { width: 100%; height: 100%; display: block; }
  dl { margin: 0; display: grid; gap: 3px; font-size: 0.9rem; }
  dl div { display: flex; justify-content: space-between; gap: 10px; }
  dt { color: var(--dim); }
  dd { margin: 0; text-align: right; }
  .warn { color: #e5484d; font-weight: bold; }
  .test { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; font-size: 0.9rem; min-height: 36px; }
  .foot { margin-top: 18px; }
</style>
