<script lang="ts">
  let { v }: { v: string } = $props()

  const OPTIONS = ['delicious', 'college; university', 'this …', 'Asian studies']
  const RIGHT = 1
  // Choices built from the Squishy pebble main button: they squash while held and wobble on letting go.
  const SQUISHY = ['squish', 'moss', 'pond']
  let picked = $state<number | null>(null)
  let held = $state<number | null>(null)
  let boings = $state([0, 0, 0, 0]) // replays each one's let-go wobble
  let timer: ReturnType<typeof setTimeout>

  function choose(i: number) {
    picked = i
    clearTimeout(timer)
    timer = setTimeout(() => (picked = null), 2600)
  }

  function lift(i: number) {
    if (held !== i) return
    held = null
    boings[i]++
  }

  const stateOf = (i: number) => (picked === null ? '' : i === RIGHT ? 'right' : i === picked ? 'miss' : 'rest')
</script>

<div class="ch {v}" class:squishy={SQUISHY.includes(v)} class:done={picked !== null}>
  {#if v === 'fruit'}<i class="ch-branch"></i>{/if}
  {#each OPTIONS as o, i}
    {#if SQUISHY.includes(v)}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <button
        class="ch-opt {stateOf(i)}"
        class:held={held === i}
        style="--i:{i}"
        onpointerdown={() => (held = i)}
        onpointerup={() => lift(i)}
        onpointerleave={() => lift(i)}
        onpointercancel={() => lift(i)}
        onclick={() => choose(i)}
      >
        {#if v === 'pond'}
          {#key boings[i]}<i class="ch-ring" class:go={boings[i] > 0}></i>{/key}
          {#if stateOf(i) === 'right'}<i class="ch-ring gold"></i><i class="ch-ring gold late"></i>{/if}
        {/if}
        <!-- Swapping between two copies of the wobble replays it. Re-creating the element would also
             replay it, but the press started on the old one, so the click would never arrive. -->
        <span class="ch-in {boings[i] ? `boing${boings[i] % 2}` : ''}">
          {#if v === 'moss'}
            <i class="ch-moss"></i>
            <i class="ch-sprout"><i></i><i></i></i>
          {/if}
          <span>{o}</span>
        </span>
      </button>
    {:else}
      <button class="ch-opt {stateOf(i)}" style="--i:{i};--fall:{i < 2 ? 124 : 42}px;--toward:{i % 2 ? -72 : 72}px" onclick={() => choose(i)}>
        {#if v === 'fruit'}<i class="ch-stalk"></i>{/if}
        <span>{o}</span>
      </button>
    {/if}
  {/each}
  {#if v === 'fruit'}<i class="ch-basket"></i>{/if}
</div>
