<script lang="ts">
  import PlantSprite from '../lib/PlantSprite.svelte'
  import { BLOOMS } from '../lib/blooms'
  import { BLOOMED, SPECIES, type Species } from '../lib/garden'

  // Dev-only preview of every bloom colour variant in the game, drawn with the real sprite.
  const LIST = Object.keys(SPECIES) as Species[]
  let full = $state(false)
</script>

<main>
  <header>
    <h1>Bloom colour preview</h1>
    <p class="dim">Each plant rolls one of these when planted, all equally likely. Card 0 is the original colours.</p>
    <label class="toggle"><input type="checkbox" bind:checked={full} /> Show the whole plant</label>
  </header>

  {#each LIST as s}
    <section>
      <h2>{SPECIES[s].label} <span class="dim">{BLOOMS[s].length + 1} looks</span></h2>
      <div class="grid">
        {#each ['Original', ...BLOOMS[s].map((b) => b.name)] as name, v}
          <div class="card">
            <div class="art"><PlantSprite species={s} stage={BLOOMED} variant={v} icon={!full} /></div>
            <b>{v} · {name}</b>
          </div>
        {/each}
      </div>
    </section>
  {/each}
</main>

<style>
  main { max-width: 1100px; }
  .dim { color: var(--dim); font-size: 0.9rem; font-weight: normal; }
  .toggle { display: inline-flex; gap: 8px; align-items: center; cursor: pointer; }
  section { margin: 28px 0; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
  .card { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 8px 10px; border-radius: 14px; background: var(--panel); }
  /* lawn-coloured backdrop so the colours read as they will in the garden */
  .art { width: 100%; aspect-ratio: 1; border-radius: 10px; overflow: hidden; background: radial-gradient(circle at 50% 40%, #8fd17a, #5aa851); }
  b { font-size: 0.92rem; }
</style>
