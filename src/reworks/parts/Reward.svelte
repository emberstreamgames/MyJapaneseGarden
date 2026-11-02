<script lang="ts">
  import Critter from './Critter.svelte'
  import Icon from './Icon.svelte'
  import type { Creature } from '../../lib/creatures'

  let { v, run }: { v: string; run: number } = $props()

  const ITEMS: { icon: 'acorn' | 'star' | 'sprout'; label: string }[] = [
    { icon: 'sprout', label: '+214 XP' },
    { icon: 'acorn', label: '+15' },
    { icon: 'star', label: '1 mastered' },
  ]
  const PARADE: Creature[] = ['frog', 'rabbit', 'cat']
</script>

{#key run}
  <div class="w-stage {v}">
    {#if v === 'basket'}
      {#each ITEMS as it, i}<span class="w-fall" style="--i:{i}"><Icon name={it.icon} size={30} /></span>{/each}
      <span class="w-basket"></span>
    {:else if v === 'jar'}
      <span class="w-jar">
        <i class="w-lid"></i>
        {#each Array(14) as _, i}<i class="w-seed" style="--i:{i};--x:{6 + (i % 4) * 23}%;--r:{Math.floor(i / 4)}"></i>{/each}
      </span>
    {:else if v === 'parade'}
      {#each PARADE as c, i}
        <span class="w-march" style="--i:{i}">
          <b>{ITEMS[i].label}</b>
          <Critter creature={c} size={58} />
        </span>
      {/each}
    {:else if v === 'shelf'}
      <span class="w-shelf">
        {#each ITEMS as it, i}
          <span class="w-hjar" style="--i:{i}">
            <i class="w-hlid"></i>
            <span class="w-hglass"><i class="w-honey"></i><span class="w-hicon"><Icon name={it.icon} size={22} /></span></span>
            <b>{it.label}</b>
          </span>
        {/each}
        <i class="w-plank"></i>
      </span>
    {:else if v === 'branch'}
      <i class="w-bough"></i>
      {#each ITEMS as it, i}
        <span class="w-fruit" style="--i:{i}"><i class="w-fstalk"></i><span class="w-fbody"><Icon name={it.icon} size={20} /></span></span>
      {/each}
    {:else if v === 'quilt'}
      <span class="w-quilt">
        {#each ITEMS as it, i}<span class="w-square" style="--i:{i}"><Icon name={it.icon} size={28} /></span>{/each}
      </span>
    {:else}
      <span class="w-bird"><Critter creature="bird" size={50} /></span>
      <span class="w-note surface">
        <b>Dear gardener,</b>
        <span>Thank you for the water. I feel taller already.</span>
        <em>+214 XP · 1 word mastered</em>
      </span>
    {/if}
    {#if v !== 'letter' && v !== 'shelf'}<ul class="w-list">
      {#each ITEMS as it, i}<li style="--i:{i}"><Icon name={it.icon} size={16} /> {it.label}</li>{/each}
    </ul>{/if}
  </div>
{/key}
