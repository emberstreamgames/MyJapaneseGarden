<script lang="ts">
  import Critter from './Critter.svelte'
  import Face from './Face.svelte'
  import Icon from './Icon.svelte'

  let { v, at, of = 10 }: { v: string; at: number; of?: number } = $props()
  const share = $derived(at / of)
</script>

<div class="p-prog {v}" role="progressbar" aria-valuemin="0" aria-valuemax={of} aria-valuenow={at} aria-label="Question {at} of {of}">
  {#if v === 'caterpillar'}
    <span class="cat-head"><Face size={0.44} /></span>
    {#each Array(at) as _, i (i)}<i class="cat-seg" style="--i:{i}"></i>{/each}
  {:else if v === 'sprout'}
    <i class="pv-stem"></i>
    {#each Array(of) as _, i}
      <i class="pv-leaf" class:on={i < at} class:up={i % 2 === 0} style="left:{5 + i * 10}%"></i>
    {/each}
  {:else if v === 'ladybug'}
    <i class="pl-stem"></i>
    <span class="pl-bud" class:open={at >= of}><Icon name="star" size={22} /></span>
    <span class="pl-bug" style="left:calc({share} * (100% - 34px))"><Critter creature="ladybug" size={26} /></span>
  {:else if v === 'stones'}
    <span class="ps-row">
      {#each Array(of) as _, i}<i class="ps-stone" class:on={i < at} class:here={i === at}></i>{/each}
    </span>
  {:else if v === 'seeds'}
    <span class="pz-soil">
      {#each Array(of) as _, i}
        <span class="pz-slot">
          {#if i < at}<span class="pz-sprout"><Icon name="sprout" size={16} /></span>{:else}<i class="pz-seed"></i>{/if}
        </span>
      {/each}
    </span>
  {:else if v === 'thread'}
    <span class="pt-track">
      <i class="pt-sewn" style="width:calc({share} * (100% - 20px))"></i>
      <i class="pt-needle" style="left:calc({share} * (100% - 20px))"></i>
    </span>
    <b>{at} of {of}</b>
  {:else}
    <span class="pb-bucket">
      <span class="pb-water" style="height:{share * 100}%"></span>
    </span>
    <b>{at} of {of}</b>
  {/if}
</div>
