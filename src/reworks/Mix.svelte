<script lang="ts">
  import PlantSprite from '../lib/PlantSprite.svelte'
  import { PLANT_SCALE, SPOTS, VIEW } from '../lib/meadow'
  import type { Picks } from './options'
  import Action from './parts/Action.svelte'
  import Badge from './parts/Badge.svelte'
  import Card from './parts/Card.svelte'
  import Choices from './parts/Choices.svelte'
  import Hud from './parts/Hud.svelte'
  import Menu from './parts/Menu.svelte'
  import Progress from './parts/Progress.svelte'
  import Reward from './parts/Reward.svelte'
  import Voice from './parts/Voice.svelte'

  // The picks together on a phone-sized screen, so an element can be judged next to the others.
  let { picks, lawn }: { picks: Picks; lawn: string } = $props()

  let screen = $state<'garden' | 'quiz' | 'reward'>('garden')
  let run = $state(0)
  // Menus that live along the bottom of the screen rather than in the top corner.
  const docked = $derived(['dock', 'path'].includes(picks.menu))

  const PLANTS = [
    { i: 0, species: 'sakura', stage: 5, state: 'ready' },
    { i: 1, species: 'tulip', stage: 3, state: 'thirsty' },
    { i: 3, species: 'daisy', stage: 7, state: 'resting' },
  ] as const
  const left = (x: number) => `${(x / VIEW.w) * 100}%`
  const top = (y: number) => `${(y / VIEW.h) * 100}%`
</script>

<div class="mix-tabs" role="group" aria-label="Screen">
  {#each [['garden', 'Garden'], ['quiz', 'Quiz'], ['reward', 'Reward']] as const as [id, label]}
    <button class:on={screen === id} aria-pressed={screen === id} onclick={() => { screen = id; run++ }}>{label}</button>
  {/each}
</div>

<div class="phone">
  {#if screen === 'garden'}
    <div class="ph-top" class:with-dock={docked}>
      <div class="ph-hud"><Hud v={picks.hud} /></div>
      {#if !docked}<div class="ph-menu"><Menu v={picks.menu} /></div>{/if}
    </div>
    <div class="ph-bed">
      {@html lawn}
      {#each PLANTS as p}
        <span class="ph-plant" style="--w:{PLANT_SCALE * 25}%;left:{left(SPOTS[p.i].x)};top:{top(SPOTS[p.i].y)}"><PlantSprite species={p.species} stage={p.stage} soil={false} /></span>
        <span class="ph-badge" style="left:{left(SPOTS[p.i].x + 26)};top:{top(SPOTS[p.i].y - 62)}"><Badge v={picks.badge} state={p.state} /></span>
      {/each}
    </div>
    <div class="ph-voice"><Voice v={picks.voice} compact /></div>
    <div class="ph-action"><Action v={picks.action} /></div>
    {#if docked}<div class="ph-dock"><Menu v={picks.menu} /></div>{/if}
  {:else if screen === 'quiz'}
    <div class="ph-prog"><Progress v={picks.progress} at={4} /></div>
    <div class="ph-card"><Card v={picks.card} /></div>
    <div class="ph-choices"><Choices v={picks.choices} /></div>
  {:else}
    <div class="ph-reward"><Reward v={picks.reward} {run} /></div>
    <div class="ph-action"><Action v={picks.action} label="Done" /></div>
  {/if}
</div>
