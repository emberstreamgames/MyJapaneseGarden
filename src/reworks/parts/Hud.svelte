<script lang="ts">
  import Icon from './Icon.svelte'
  import Snail from './Snail.svelte'

  let { v }: { v: string } = $props()

  const pct = 62
  let bump = $state('')
  let n = 0

  // Replays the little reaction even when the same thing is tapped twice.
  function hit(k: string) {
    const id = ++n
    bump = ''
    requestAnimationFrame(() => (bump = k))
    setTimeout(() => id === n && (bump = ''), 700)
  }
</script>

{#if v === 'sign'}
  <button class="h-sign surface-wood" class:swing={bump === 'sign'} onclick={() => hit('sign')} aria-label="Level 4, 5-day streak, 120 coins">
    <i class="rope l"></i><i class="rope r"></i>
    <b>Lv 4</b>
    <span class="h-bar"><span style="width:{pct}%"></span></span>
    <span class="h-stat"><Icon name="sprout" /> 5</span>
    <span class="h-stat"><Icon name="acorn" /> 120</span>
  </button>
{:else if v === 'vine'}
  <div class="h-vine">
    <b>Lv 4</b>
    <button class="vine-track" onclick={() => hit('vine')} aria-label="62% to level 5">
      <i class="vine-line"></i>
      {#each Array(9) as _, i}
        <i class="vine-leaf" class:on={(i + 1) / 9 <= pct / 100} class:up={i % 2 === 0} class:rustle={bump === 'vine'} style="left:{6 + i * 11}%;animation-delay:{i * 30}ms"></i>
      {/each}
    </button>
    <span class="h-stat"><Icon name="sprout" /> 5</span>
    <span class="h-stat"><Icon name="acorn" /> 120</span>
  </div>
{:else if v === 'pebbles'}
  <div class="h-pebbles">
    {#each [['lvl', 'Lv 4', 'var(--leaf)'], ['day', '5 days', 'var(--blush)'], ['coin', '120', 'var(--honey)']] as [k, label, bg]}
      <button class="pebble-friend" class:hop={bump === k} style="background:{bg}" onclick={() => hit(k)}>
        <b>{label}</b>
      </button>
    {/each}
  </div>
{:else}
  <div class="h-snail">
    <b>Lv 4</b>
    <button class="snail-track" onclick={() => hit('snail')} aria-label="62% to level 5">
      <span class="snail-trail" style="width:{pct}%"></span>
      <span class="snail-at" class:scoot={bump === 'snail'} style="left:{pct}%"><Snail size={36} /></span>
      <span class="snail-goal"><Icon name="star" size={18} /></span>
    </button>
    <span class="h-stat"><Icon name="sprout" /> 5</span>
    <span class="h-stat"><Icon name="acorn" /> 120</span>
  </div>
{/if}
