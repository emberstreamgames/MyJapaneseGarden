<script lang="ts">
  import Critter from './Critter.svelte'
  import Icon from './Icon.svelte'

  let { v, state }: { v: string; state: 'thirsty' | 'ready' | 'resting' } = $props()

  const icon = $derived(state === 'thirsty' ? 'drop' : state === 'ready' ? 'star' : 'moon')
  const word = $derived(state === 'thirsty' ? 'みず' : state === 'ready' ? 'grow!' : 'zzz')
</script>

{#if v === 'sprites'}
  <span class="b-sprite {state}" aria-hidden="true">
    <span class="b-shape"><Icon name={icon} size={38} /></span>
  </span>
{:else if v === 'bubble'}
  <span class="b-bubble {state}" aria-hidden="true">
    <span><Icon name={icon} size={24} /></span><i></i><i></i>
  </span>
{:else if v === 'bee'}
  <span class="b-bee {state}" aria-hidden="true">
    <span class="b-bee-fly"><Critter creature="bee" size={26} /></span>
    <span class="b-bee-note"><Icon name={icon} size={16} /></span>
  </span>
{:else}
  <span class="b-stake {state}" aria-hidden="true"><b>{word}</b><i></i></span>
{/if}
