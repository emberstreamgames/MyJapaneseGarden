<script lang="ts">
  import PlantSprite from '../../lib/PlantSprite.svelte'
  import Icon from './Icon.svelte'

  let { v }: { v: string } = $props()

  let open = $state(false)
</script>

<div class="u-stage u-{v}" class:open>
  <span class="u-resting"><PlantSprite species="sakura" stage={4} soil={false} /></span>
  <button class="u-open" onclick={() => (open = !open)}>{open ? 'Close it' : 'Tap the plant'}</button>
  <div class="u-pop" aria-hidden={!open}>
    {#if v === 'door'}<i class="u-leaf" aria-hidden="true"></i>{/if}
    {#if v === 'notebook'}<i class="u-tape"></i><i class="u-spine"></i>{/if}
    <div class="u-body">
      <span class="u-plant"><PlantSprite species="sakura" stage={4} soil={false} /></span>
      <b>Cherry blossom</b>
      <small>Hiragana · 3 more waterings to bloom</small>
      <span class="u-pill"><Icon name="drop" size={16} /> Water</span>
    </div>
  </div>
</div>
