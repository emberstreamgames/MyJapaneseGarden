<script module lang="ts">
  // What changed while the player was away, gathered by Garden when the garden opens.
  export interface Away {
    ready: number // plants rested and can grow
    thirsty: number // plants that want water or grooming
    sprouted: number // weeds that came up meanwhile
    ant: boolean // an ant coin is waiting
    streak: number // live streak, 0 if none
    rained: number // missed days rain is covering
    studied: boolean // already studied today
    lost: boolean // a streak ran out while away
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte'
  import * as sfx from './sfx'
  import { app } from './store.svelte'

  let { away, onClose }: { away: Away; onClose: () => void } = $props()

  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

  onMount(() => {
    if (!app.muted) sfx.welcome()
  })

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }
</script>

<svelte:window onkeydown={onKey} />

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="backdrop" onclick={(e) => e.target === e.currentTarget && onClose()}>
  <div class="sheet welcome" role="dialog" aria-modal="true" aria-label="Welcome back">
    <h2><span lang="ja">おかえり!</span> Welcome back</h2>
    <p class="dim">Here's what happened in your garden while you were away.</p>
    <ul>
      {#if away.ready}<li>✨ {plural(away.ready, 'plant has', 'plants have')} finished resting and can grow</li>{/if}
      {#if away.thirsty}<li>💧 {plural(away.thirsty, 'plant would', 'plants would')} love some care</li>{/if}
      {#if away.sprouted}<li>🌿 {plural(away.sprouted, 'weed', 'weeds')} sprouted. Pull them for coins</li>{/if}
      {#if away.ant}<li>🐜 An ant is out with a coin for you</li>{/if}
      {#if away.rained && away.streak}
        <li>☔ It rained while you were away, so your {away.streak}-day streak is safe</li>
      {:else if away.streak && away.studied}
        <li>🌱 {away.streak}-day streak. Lovely work today!</li>
      {:else if away.streak}
        <li>🌱 {away.streak}-day streak. Water a plant today to make it {away.streak + 1}</li>
      {:else if away.lost}
        <li>🌱 A fresh start! Water a plant today to begin a new streak</li>
      {/if}
      {#if !away.ready && !away.thirsty && !away.sprouted && !away.ant}<li>😴 Everything is resting peacefully</li>{/if}
    </ul>
    <button class="primary big-btn" onclick={onClose}>Let's garden! 🌸</button>
  </div>
</div>
