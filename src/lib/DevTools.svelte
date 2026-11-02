<script lang="ts">
  import { BLOOMED, PLOT_COUNT, SPECIES, STAGE_NAMES } from './garden'
  import {
    app, debugAddCoins, debugAntCoin, debugFill, debugPreservable, debugReady, debugSetStage, debugSkipTime, debugSproutWeed, debugStreakDay, debugVisitor, seasonPreview,
  } from './store.svelte'
  import { FESTIVALS, SEASONS } from './seasons'

  // The developer panel: a 🛠 button on every screen once debug tools are unlocked from Stats.
  let open = $state(false)
  let coins = $state(100)
  let plotNo = $state(1)
  let stage = $state(BLOOMED)

  const plot = $derived(app.garden[plotNo - 1])
  const plotLabel = (i: number) => {
    const p = app.garden[i]
    return `${i + 1}: ${p ? `${SPECIES[p.species].label}, ${STAGE_NAMES[p.stage]}` : 'empty'}`
  }

  // Land on a plant rather than an empty plot, and show the stage it's at.
  function toggle() {
    open = !open
    if (!open) return
    if (!plot) plotNo = app.garden.findIndex((p) => p) + 1 || 1
    if (plot) stage = plot.stage
  }

  function pick() {
    if (plot) stage = plot.stage
  }

  function onKey(e: KeyboardEvent) {
    if (open && e.key === 'Escape') open = false
  }
</script>

<svelte:window onkeydown={onKey} />

{#if app.debug}
  <button class="dev-btn" aria-label="Developer tools" aria-expanded={open} onclick={toggle}>🛠</button>
  {#if open}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="backdrop" onclick={(e) => e.target === e.currentTarget && (open = false)}>
      <div class="sheet dev" role="dialog" aria-modal="true" aria-label="Developer tools">
        <button class="x" aria-label="Close" onclick={() => (open = false)}>✕</button>
        <h2>Developer tools</h2>

        <h3>Coins <span class="dim">({app.coins})</span></h3>
        <div class="settings">
          <input type="number" step="50" aria-label="Coins to give" bind:value={coins} />
          <button onclick={() => debugAddCoins(coins)}>Give</button>
          <button onclick={() => debugAddCoins(1000)}>+1000</button>
        </div>

        <h3>Plant</h3>
        <div class="settings">
          <label>Plot
            <select bind:value={plotNo} onchange={pick}>
              {#each Array(PLOT_COUNT) as _, i}<option value={i + 1}>{plotLabel(i)}</option>{/each}
            </select>
          </label>
          <label>Stage
            <select bind:value={stage}>
              {#each STAGE_NAMES.slice(1) as n, i}<option value={i + 1}>{n}</option>{/each}
            </select>
          </label>
        </div>
        <div class="settings">
          <button disabled={!plot} onclick={() => debugSetStage(plotNo - 1, stage)}>Set stage</button>
          <button disabled={!plot} onclick={() => debugReady(plotNo - 1)}>Skip timer</button>
          <button disabled={!plot} onclick={() => debugPreservable(plotNo - 1)}>Make preservable</button>
        </div>
        <p class="dim">Set stage leaves the plant thirsty. Skip timer makes it ready to grow, with or without a watering.</p>

        <h3>Season preview</h3>
        <div class="settings">
          <label>Season
            <select bind:value={seasonPreview.season}>
              <option value="">Today's</option>
              {#each Object.keys(SEASONS) as s}<option value={s}>{s}</option>{/each}
            </select>
          </label>
          <label>Time
            <select bind:value={seasonPreview.hours}>
              <option value="">Now</option>
              <option value="day">day</option>
              <option value="dusk">dusk</option>
              <option value="night">night</option>
            </select>
          </label>
          <label>Festival
            <select bind:value={seasonPreview.festival}>
              <option value="">Today's</option>
              <option value="none">none</option>
              {#each Object.keys(FESTIVALS) as f}<option value={f}>{f}</option>{/each}
            </select>
          </label>
        </div>

        <h3>Garden</h3>
        <div class="settings">
          <button onclick={() => debugSkipTime()}>Skip 20 hours</button>
          <button onclick={debugFill}>Fill empty plots</button>
          <button onclick={debugSproutWeed}>Sprout a weed</button>
          <button onclick={debugAntCoin}>Next ant brings a coin</button>
          <button onclick={debugVisitor}>Visitor now</button>
          <button onclick={debugStreakDay}>Streak: last study a day earlier</button>
        </div>
      </div>
    </div>
  {/if}
{/if}
