<script lang="ts">
  import { ANT_COINS, COMPLETE_COINS, GROW_COINS, PERFECT_COINS, PRESERVE_COINS, VISITOR_COINS, WEED_COINS } from './garden'
  import { XP_PER_LEVEL, app, level, seedPackets } from './store.svelte'
  import { MAX_RAIN_DAYS, daysToRain, nextMilestone } from './streak'

  // What's behind each number in the garden's HUD.
  let { kind, streak, studied, onShop, onClose }: { kind: 'level' | 'streak' | 'coins'; streak: number; studied: boolean; onShop: () => void; onClose: () => void } = $props()

  const toNext = $derived(XP_PER_LEVEL - (app.xp % XP_PER_LEVEL))
  const milestone = $derived(nextMilestone(streak))
  const rain = $derived(daysToRain(streak))

  const EARN = [
    ['🌱', 'Growing a plant', `${GROW_COINS}`],
    ['🌿', 'Pulling a weed', `${WEED_COINS}`],
    ['🐜', 'Tapping a coin ant', `${ANT_COINS}`],
    ['🦋', 'Thanking a visitor', `${VISITOR_COINS[0]}-${VISITOR_COINS[1]}`],
    ['🌟', 'A perfect quiz', `${PERFECT_COINS}`],
    ['🌸', 'Preserving a flower', `${PRESERVE_COINS}, or ${PRESERVE_COINS + COMPLETE_COINS} the first time`],
  ]

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }
</script>

<svelte:window onkeydown={onKey} />

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="backdrop" onclick={(e) => e.target === e.currentTarget && onClose()}>
  <div class="sheet hud-sheet" role="dialog" aria-modal="true" aria-label={kind === 'level' ? 'Your level' : kind === 'streak' ? 'Your streak' : 'Your coins'}>
    <button class="x" aria-label="Close" onclick={onClose}>✕</button>
    {#if kind === 'level'}
      <h2>Level {level()}</h2>
      <p class="hud-big">{toNext} XP to level {level() + 1}</p>
      <ul>
        <li>🌱 Each new level brings a seed packet, which lets you choose a new plant's bloom colour.</li>
        <li>📦 {seedPackets() === 1 ? 'You have 1 seed packet.' : `You have ${seedPackets()} seed packets.`} Plant in an empty plot to use one.</li>
        <li>🔥 Right answers in a row earn more XP.</li>
      </ul>
    {:else if kind === 'streak'}
      <h2>{streak}-day streak</h2>
      <p class="hud-big">{studied ? 'Today is done. Well played!' : 'Water or groom a plant today to keep it growing.'}</p>
      <ul>
        <li>🏆 Best streak: {app.streak.best} {app.streak.best === 1 ? 'day' : 'days'}</li>
        <li>☔ Rain days: {app.streak.rain} of {MAX_RAIN_DAYS}. Each one covers a day you miss.</li>
        {#if app.streak.rain < MAX_RAIN_DAYS}<li>🌧️ Next rain day in {rain} study {rain === 1 ? 'day' : 'days'}</li>{/if}
        <li>🪙 Day {milestone.day} pays {milestone.coins} coins</li>
      </ul>
    {:else}
      <h2>🪙 {app.coins} coins</h2>
      <p class="hud-big">Spend them in the Garden Shop.</p>
      <ul class="hud-earn">
        {#each EARN as [icon, what, coins]}<li><span>{icon} {what}</span><b>{coins}</b></li>{/each}
      </ul>
      <button class="primary big-btn" onclick={onShop}>Visit the shop</button>
    {/if}
  </div>
</div>
