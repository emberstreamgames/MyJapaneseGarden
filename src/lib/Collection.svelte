<script lang="ts">
  import { DECK_LABEL, deckReady } from '../data/items'
  import { FLOWERS, flowerKey, flowerName } from './collection'
  import FlowerHead from './FlowerHead.svelte'
  import { PRESERVE_GROOMS, SPECIES, type Species } from './garden'
  import * as sfx from './sfx'
  import { app, type Preserved } from './store.svelte'

  // The pressed-flower book. Every species/variant shows: hidden until it blooms, then fresh until
  // one is preserved, then pressed (completed). `fresh` is a flower just preserved in the garden.
  let { fresh }: { fresh: Preserved | null } = $props()

  const groups = (Object.keys(SPECIES) as Species[]).map((species) => ({ species, flowers: FLOWERS.filter((f) => f.species === species) }))
  const found = $derived(FLOWERS.filter((f) => app.collection[f.key]).length)
  const done = $derived(FLOWERS.filter((f) => app.collection[f.key]?.pressed).length)
  const freshKey = $derived(fresh ? flowerKey(fresh.species, fresh.variant) : '')

  // A small, steady tilt per card, like flowers pressed by hand.
  const tilt = (key: string) => ([...key].reduce((a, c) => a + c.charCodeAt(0), 0) % 7) - 3

  // Bring the new card into view and play its drying (CSS) with a sound.
  function arrive(el: HTMLElement) {
    el.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    const t = setTimeout(() => !app.muted && sfx.preserve(), 500)
    return () => clearTimeout(t)
  }
</script>

<section class="collection">
  <h2>Pressed flowers</h2>
  <p class="dim">Bloom a flower to discover it. Groom it {PRESERVE_GROOMS} times, then preserve it to complete it.</p>
  <div class="cprog">
    <div><b>{found}</b>/{FLOWERS.length}<span>discovered</span></div>
    <div><b>{done}</b>/{FLOWERS.length}<span>completed</span></div>
  </div>
  <div class="xpbar cbar" aria-hidden="true"><div style="width:{(done / FLOWERS.length) * 100}%"></div></div>

  {#if fresh}
    <div class="cbanner">
      <b>Preserved! {flowerName(fresh.species, fresh.variant)} {SPECIES[fresh.species].label}</b>
      {#if fresh.first}<span>✓ Completed for the first time</span>{/if}
      <span class="coins">+{fresh.coins} 🪙</span>
    </div>
  {/if}

  {#each groups as g (g.species)}
    {@const pressed = g.flowers.filter((f) => app.collection[f.key]?.pressed).length}
    <div class="cgroup">
      <h3>
        {SPECIES[g.species].label}
        <span class="dim">· {DECK_LABEL[SPECIES[g.species].deck]}{#if !deckReady(SPECIES[g.species].deck)}{' · coming soon'}{/if}</span>
        {#if pressed === g.flowers.length}<span class="medal">🏅 Complete</span>{:else}<span class="dim count">{pressed}/{g.flowers.length}</span>{/if}
      </h3>
      <div class="cards">
        {#each g.flowers as f (f.key)}
          {@const entry = app.collection[f.key]}
          {@const isNew = f.key === freshKey}
          {#if entry?.pressed}
            <div class="fcard pressed" class:arrive={isNew} style="--tilt:{tilt(f.key)}deg" {@attach (el) => (isNew ? arrive(el) : undefined)}>
              <div class="paper"><FlowerHead species={f.species} variant={f.variant} /></div>
              <b>{flowerName(f.species, f.variant)}</b>
              <span class="stamp" aria-label="Completed">✓{#if entry.pressed > 1} ×{entry.pressed}{/if}</span>
            </div>
          {:else if entry}
            <div class="fcard bloomed">
              <div class="paper"><FlowerHead species={f.species} variant={f.variant} /></div>
              <b>{flowerName(f.species, f.variant)}</b>
              <span class="dim">Preserve to complete</span>
            </div>
          {:else}
            <div class="fcard hidden" aria-label="Not yet discovered">
              <div class="paper"><FlowerHead species={f.species} variant={0} /></div>
              <b>???</b>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/each}
</section>
