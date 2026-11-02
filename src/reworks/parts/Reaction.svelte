<script lang="ts">
  import Critter from './Critter.svelte'
  import Icon from './Icon.svelte'
  import Mochi from './Mochi.svelte'

  let { v, kind, id }: { v: string; kind: 'right' | 'miss' | null; id: number } = $props()

  const WORDS = { right: { ja: 'いいね!', gloss: 'nice!' }, miss: { ja: 'だいじょうぶ', gloss: 'it’s okay' } }
</script>

<div class="r-stage {v} {kind ?? ''}" aria-live="polite">
  {#key id}
    <span class="r-actor">
      {#if v === 'frog'}
        <Critter creature="frog" size={70} />
      {:else if v === 'rabbit'}
        <Critter creature="rabbit" size={84} />
      {:else if v === 'sprout'}
        <Mochi size={62} mood={kind === 'miss' ? 'shy' : kind === 'right' ? 'glad' : 'happy'} />
      {:else if v === 'bud'}
        <span class="rb-flower">
          <i class="rb-stem"></i>
          <span class="rb-head">
            {#each Array(6) as _, i}<i class="rb-petal" style="--a:{i * 60}deg"></i>{/each}
            <i class="rb-heart"></i>
          </span>
          {#if kind === 'miss'}<i class="rb-drop"></i>{/if}
        </span>
      {:else if v === 'pebble'}
        <span class="rp-stone"><i class="rp-moss"></i></span>
      {:else if v === 'weather'}
        <span class="rw-sky">
          <i class="rw-sun"></i>
          <i class="rw-cloud"></i>
          {#if kind === 'miss'}{#each [0, 1, 2] as i}<i class="rw-rain" style="--i:{i}"></i>{/each}{/if}
          <span class="rw-sprout"><Icon name="sprout" size={26} /></span>
        </span>
      {:else}
        <Critter creature="bee" size={46} />
      {/if}
    </span>
    {#if v === 'rabbit'}<i class="r-hole"></i>{/if}
    {#if kind}
      <span class="r-word"><b lang="ja">{WORDS[kind].ja}</b> <small>{WORDS[kind].gloss}</small></span>
      {#if kind === 'right'}{#each Array(8) as _, i}<i class="r-spark" style="--a:{i * 45}deg"></i>{/each}{/if}
    {/if}
  {/key}
</div>
