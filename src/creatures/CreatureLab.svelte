<script lang="ts">
  import ConfirmSheet from '../lib/ConfirmSheet.svelte'
  import CreatureSprite from '../lib/CreatureSprite.svelte'
  import { ALL_CREATURES, CREATURES, CREATURE_LIST, creatureKey } from '../lib/creatures'

  // Dev-only preview of every creature and look, drawn with the real sprite. Tap the ones you like;
  // the picks stay in this browser, and Copy gives a list to hand back.
  const KEY = 'creature-picks'

  function loadPicks(): string[] {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]')
    } catch {
      return []
    }
  }

  let picks = $state<string[]>(loadPicks())
  let animate = $state(false)
  let garden = $state(false)
  let copied = $state(false)

  function keep() {
    try {
      localStorage.setItem(KEY, JSON.stringify(picks))
    } catch {
      // ignore: the picks still work for this visit
    }
  }

  function toggle(key: string) {
    picks = picks.includes(key) ? picks.filter((p) => p !== key) : [...picks, key]
    keep()
  }

  let clearing = $state(false)

  function clear() {
    clearing = false
    picks = []
    keep()
  }

  async function copy() {
    const lines = ALL_CREATURES.filter((c) => picks.includes(c.key)).map((c) => c.key)
    await navigator.clipboard.writeText(lines.join('\n'))
    copied = true
    setTimeout(() => (copied = false), 1500)
  }
</script>

<main>
  <header>
    <h1>Creature preview</h1>
    <p class="dim">Every creature and look in the game. Tap the ones you like, then copy your list.</p>
    <div class="bar">
      <b>{picks.length} of {ALL_CREATURES.length} liked</b>
      <button disabled={!picks.length} onclick={copy}>{copied ? 'Copied' : 'Copy my list'}</button>
      <button disabled={!picks.length} onclick={() => (clearing = true)}>Clear</button>
      <label><input type="checkbox" bind:checked={animate} /> Animate</label>
      <label><input type="checkbox" bind:checked={garden} /> Garden size</label>
    </div>
  </header>

  {#each CREATURE_LIST as c (c)}
    {@const info = CREATURES[c]}
    <section>
      <h2>{info.label} <span lang="ja">{info.jp}</span> <span class="dim">{info.looks.length} looks · arrives by {info.move}</span></h2>
      <div class="grid" class:garden>
        {#each info.looks as l (l.id)}
          {@const key = creatureKey(c, l.id)}
          <button class="tile" class:on={picks.includes(key)} aria-pressed={picks.includes(key)} onclick={() => toggle(key)}>
            <span class="art">
              <svg viewBox={info.view} aria-hidden="true">
                <g class={animate ? `visitor ${info.move} ${c} perched` : ''}><CreatureSprite creature={c} look={l.id} /></g>
              </svg>
              {#if picks.includes(key)}<i>♥</i>{/if}
            </span>
            <b>{l.name}</b>
          </button>
        {/each}
      </div>
    </section>
  {/each}
</main>

{#if clearing}
  <ConfirmSheet title="Clear all your picks?" yes="Clear" no="Keep them" danger onYes={clear} onNo={() => (clearing = false)}>
    <p class="dim">You'll need to choose your favourites again.</p>
  </ConfirmSheet>
{/if}

<style>
  main { max-width: 1100px; }
  header { position: sticky; top: 0; z-index: 2; display: block; padding: 8px 0; background: var(--bg); }
  .dim { color: var(--dim); font-size: 0.9rem; font-weight: normal; }
  .bar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
  .bar label { display: inline-flex; gap: 6px; align-items: center; cursor: pointer; }
  section { margin: 28px 0; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
  .tile { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 8px 10px; border: 2px solid transparent; border-radius: 14px; background: var(--panel); }
  .tile.on { border-color: var(--gold); }
  /* lawn-coloured backdrop so the colours read as they will in the garden */
  .art { position: relative; display: grid; place-items: center; width: 100%; aspect-ratio: 1; border-radius: 10px; overflow: hidden; background: radial-gradient(circle at 50% 40%, #8fd17a, #5aa851); }
  .art svg { display: block; width: 86%; height: 86%; overflow: visible; }
  /* About as wide as one is drawn on a phone: 1.5 bed units per sprite unit, with the bed near full width. */
  .garden .art svg { width: 54px; height: 54px; }
  .art i { position: absolute; top: 4px; right: 6px; color: var(--gold); font-style: normal; font-size: 1.2rem; text-shadow: 0 1px 2px #0008; }
  b { font-size: 0.92rem; font-weight: 600; }
</style>
