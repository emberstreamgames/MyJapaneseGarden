<script lang="ts">
  import { ITEMS, type Item } from '../data/items'
  import pkg from '../../package.json'
  import { BLOOMED, PLOT_COUNT, STAGE_NAMES } from './garden'
  import { app, debugFill, debugSetStage, debugSkipTime, exportData, importData, level, resetGarden, resetStats, save } from './store.svelte'

  const rows = $derived(
    ITEMS.map((it) => ({ it, s: app.stats[it.id] })).filter((r): r is { it: Item; s: NonNullable<typeof r.s> } => !!r.s),
  )
  const missed = $derived([...rows].filter((r) => r.s.w > 0).sort((a, b) => b.s.w - a.s.w || a.s.c - b.s.c).slice(0, 10))
  const best = $derived(
    [...rows].filter((r) => r.s.c > 0).sort((a, b) => b.s.streak - a.s.streak || b.s.c - a.s.c).slice(0, 10),
  )
  const totalC = $derived(rows.reduce((a, r) => a + r.s.c, 0))
  const totalW = $derived(rows.reduce((a, r) => a + r.s.w, 0))
  const acc = $derived(totalC + totalW ? Math.round((totalC / (totalC + totalW)) * 100) : 0)

  const plants = $derived(app.garden.flatMap((p) => (p ? [p] : [])))
  const blooms = $derived(plants.filter((p) => p.stage === BLOOMED).length)
  const waters = $derived(plants.reduce((a, p) => a + p.waters, 0))
  const grooms = $derived(plants.reduce((a, p) => a + p.grooms, 0))

  let msg = $state('')

  // Tapping the version number 7 times unlocks the debug tools.
  let taps = $state(0)
  let tapTimer: ReturnType<typeof setTimeout> | undefined
  function tapVersion() {
    clearTimeout(tapTimer)
    tapTimer = setTimeout(() => (taps = 0), 1500)
    if (++taps >= 7) {
      taps = 0
      app.debug = !app.debug
      save()
      msg = app.debug ? 'Debug tools unlocked.' : 'Debug tools hidden.'
    }
  }

  let dbgPlot = $state(1)
  let dbgStage = $state(BLOOMED)

  function download() {
    const url = URL.createObjectURL(new Blob([exportData()], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `genki-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function upload(e: Event) {
    const f = (e.currentTarget as HTMLInputElement).files?.[0]
    if (!f) return
    msg = importData(await f.text()) ? 'Progress imported.' : 'That file could not be read.'
  }

  function resetPlants() {
    if (confirm('Remove every plant and start the garden over? Your XP and stats are kept.')) {
      resetGarden()
      msg = 'Garden cleared.'
    }
  }

  function reset() {
    if (confirm('Reset all review stats, XP and best combo?')) {
      resetStats()
      msg = 'Stats reset.'
    }
  }
</script>

<section class="stats">
  <div class="tiles">
    <div><b>Lv {level()}</b><span>{app.xp} XP</span></div>
    <div><b>{totalC + totalW}</b><span>reviews</span></div>
    <div><b>{acc}%</b><span>accuracy</span></div>
    <div><b>{app.best}</b><span>best combo</span></div>
  </div>

  <h3>Garden</h3>
  <div class="tiles">
    <div><b>{plants.length}/{PLOT_COUNT}</b><span>plants</span></div>
    <div><b>{blooms}</b><span>in bloom</span></div>
    <div><b>{waters}</b><span>waterings</span></div>
    <div><b>{grooms}</b><span>groomings</span></div>
  </div>

  <div class="lists">
    <div>
      <h3>Most missed</h3>
      {#each missed as r (r.it.id)}
        <div class="line"><span class="jp" lang="ja">{r.it.front}</span><em>{r.it.back}</em><span class="bad">{r.s.w} ✗</span><span class="good">{r.s.c} ✓</span></div>
      {:else}
        <p class="dim">Nothing missed yet.</p>
      {/each}
    </div>
    <div>
      <h3>Strongest</h3>
      {#each best as r (r.it.id)}
        <div class="line"><span class="jp" lang="ja">{r.it.front}</span><em>{r.it.back}</em><span class="good">{r.s.c} ✓</span><span class="dim">streak {r.s.streak}</span></div>
      {:else}
        <p class="dim">Review some cards first.</p>
      {/each}
    </div>
  </div>

  <h3>Settings &amp; backup</h3>
  <div class="settings">
    <label>Answer style
      <select bind:value={app.mode} onchange={save}>
        <option value="mix">Mix</option>
        <option value="choice">Multiple choice</option>
        <option value="type">Typed</option>
      </select>
    </label>
    <label><input type="checkbox" bind:checked={app.muted} onchange={save} /> Mute sounds</label>
    <button onclick={download}>Export progress</button>
    <label class="file">Import progress<input type="file" accept="application/json" onchange={upload} /></label>
    <button class="danger" onclick={reset}>Reset stats</button>
    <button class="danger" onclick={resetPlants}>Reset garden</button>
  </div>
  {#if msg}<p class="dim">{msg}</p>{/if}

  {#if app.debug}
    <h3>Debug tools</h3>
    <div class="settings">
      <button onclick={() => debugSkipTime()}>Skip 20 hours</button>
      <button onclick={debugFill}>Fill empty plots</button>
      <label>Plot
        <select bind:value={dbgPlot}>
          {#each Array(PLOT_COUNT) as _, i}<option value={i + 1}>{i + 1}</option>{/each}
        </select>
      </label>
      <label>Stage
        <select bind:value={dbgStage}>
          {#each STAGE_NAMES.slice(1) as n, i}<option value={i + 1}>{n}</option>{/each}
        </select>
      </label>
      <button onclick={() => debugSetStage(dbgPlot - 1, dbgStage)}>Set stage</button>
    </div>
  {/if}

  <p class="dim ver"><button class="linkish" onclick={tapVersion}>Genki Grow v{pkg.version}</button></p>
</section>
