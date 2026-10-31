<script lang="ts">
  import CreatureSprite from './CreatureSprite.svelte'
  import { ALL_CREATURES, CREATURES, CREATURE_LIST, creatureKey } from './creatures'
  import { app } from './store.svelte'

  // The creature book. Every creature and look shows: a silhouette until a visitor of it is tapped.
  const found = $derived(ALL_CREATURES.filter((c) => app.creatures[c.key]).length)
</script>

<h2>Creatures</h2>
<p class="dim">Tap a visitor in the garden to add it here.</p>
<div class="cprog">
  <div><b>{found}</b>/{ALL_CREATURES.length}<span>seen</span></div>
</div>
<div class="xpbar cbar" aria-hidden="true"><div style="width:{(found / ALL_CREATURES.length) * 100}%"></div></div>

{#each CREATURE_LIST as c (c)}
  {@const info = CREATURES[c]}
  {@const seen = info.looks.filter((l) => app.creatures[creatureKey(c, l.id)]).length}
  <div class="cgroup">
    <h3>
      {info.label}
      <span class="dim" lang="ja">· {info.jp}</span>
      {#if seen === info.looks.length}<span class="medal">🏅 Complete</span>{:else}<span class="dim count">{seen}/{info.looks.length}</span>{/if}
    </h3>
    <div class="cards">
      {#each info.looks as l (l.id)}
        {@const entry = app.creatures[creatureKey(c, l.id)]}
        <div class="fcard" class:seen={entry} class:hidden={!entry} aria-label={entry ? undefined : 'Not yet seen'}>
          <div class="paper">
            <svg class="creature-art" viewBox={info.view} aria-hidden="true"><CreatureSprite creature={c} look={entry ? l.id : info.looks[0].id} /></svg>
          </div>
          {#if entry}
            <b>{l.name}</b>
            <span class="dim">Seen {entry.count}×</span>
          {:else}
            <b>???</b>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/each}
