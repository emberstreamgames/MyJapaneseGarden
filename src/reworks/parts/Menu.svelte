<script lang="ts">
  import Critter from './Critter.svelte'
  import Face from './Face.svelte'
  import Icon from './Icon.svelte'
  import Mochi from './Mochi.svelte'

  let { v }: { v: string } = $props()

  const PLACES = ['Garden', 'Shop', 'Collection', 'Stats']
  const PADS = [[-64, -2], [-22, -56], [-96, -54], [-66, -100]] // where each lily pad floats to
  let open = $state(false)
  let at = $state(0)
</script>

{#if v === 'mole'}
  <div class="m-mole" class:open>
    {#if open}
      <div class="m-list">
        {#each PLACES as p, i}<button class="m-chip" style="animation-delay:{i * 50}ms" onclick={() => (at = i)} class:on={at === i}>{p}</button>{/each}
      </div>
    {/if}
    <button class="mole" aria-expanded={open} aria-label="Menu" onclick={() => (open = !open)}>
      <span class="mole-body"><Face size={0.7} mood={open ? 'wow' : 'happy'} /><i class="mole-nose"></i></span>
      <i class="mole-hill"></i>
    </button>
  </div>
{:else if v === 'lily'}
  <div class="m-lily" class:open>
    {#each PLACES as p, i}
      <button class="pad" class:on={at === i} style="--a:{i};--x:{PADS[i][0]}px;--y:{PADS[i][1]}px" tabindex={open ? 0 : -1} onclick={() => (at = i)}>{p}</button>
    {/each}
    <button class="lily-frog" aria-expanded={open} aria-label="Menu" onclick={() => (open = !open)}>
      <i class="pad-home"></i>
      <span class:bob={!open}><Critter creature="frog" size={46} /></span>
    </button>
  </div>
{:else if v === 'tin'}
  <div class="m-tin" class:open>
    {#each PLACES as p, i}
      <button class="tin-tab" class:on={at === i} style="--a:{i}" tabindex={open ? 0 : -1} onclick={() => (at = i)}>{p}</button>
    {/each}
    <button class="tin" aria-expanded={open} aria-label="Menu" onclick={() => (open = !open)}>
      <i class="tin-lid"></i>
      <span class="tin-can"><Icon name="sprout" size={22} /></span>
    </button>
  </div>
{:else if v === 'pouch'}
  <div class="m-mole m-pouch" class:open>
    {#if open}
      <div class="m-list">
        {#each PLACES as p, i}<button class="m-chip" style="animation-delay:{i * 50}ms" onclick={() => (at = i)} class:on={at === i}>{p}</button>{/each}
      </div>
    {/if}
    <button class="pouch" aria-expanded={open} aria-label="Menu" onclick={() => (open = !open)}>
      <i class="pouch-mouth"></i>
      <span class="pouch-bag"><i class="pouch-tie"></i></span>
    </button>
  </div>
{:else if v === 'path'}
  <nav class="m-dock m-path" aria-label="Screens">
    {#each PLACES as p, i}
      <button class="burrow" class:on={at === i} aria-current={at === i ? 'page' : undefined} onclick={() => (at = i)}>
        <span class="path-stone" style="--i:{i}">
          {#if at === i}<span class="path-sprout"><Icon name="sprout" size={18} /></span>{/if}
        </span>
        <small>{p}</small>
      </button>
    {/each}
  </nav>
{:else}
  <nav class="m-dock" aria-label="Screens">
    {#each PLACES as p, i}
      <button class="burrow" class:on={at === i} aria-current={at === i ? 'page' : undefined} onclick={() => (at = i)}>
        <span class="burrow-hole">
          {#if at === i}
            <span class="burrow-peek"><Mochi size={34} /></span>
          {/if}
        </span>
        <small>{p}</small>
      </button>
    {/each}
  </nav>
{/if}
