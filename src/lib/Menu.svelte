<script lang="ts" generics="T extends string">
  import Mochi from './Mochi.svelte'

  // The burrow dock: the main screens along the bottom, with Mochi peeking from the one you're on.
  // Screens without a `dock` label, and `actions` (which do something instead of switching screen),
  // are in the More sheet.
  let {
    items,
    current,
    onselect,
    actions = [],
  }: { items: { id: T; label: string; dock?: string }[]; current: T; onselect: (id: T) => void; actions?: { label: string; run: () => void }[] } = $props()

  let more = $state(false)
  let moreBtn: HTMLButtonElement
  const docked = $derived(items.filter((it) => it.dock))
  const rest = $derived(items.filter((it) => !it.dock))
  const inMore = $derived(rest.some((it) => it.id === current))

  function choose(id: T) {
    onselect(id)
    more = false
  }

  function act(run: () => void) {
    run()
    more = false
  }

  function close() {
    more = false
    moreBtn.focus()
  }

  function onKey(e: KeyboardEvent) {
    if (more && e.key === 'Escape') close()
  }
</script>

<svelte:window onkeydown={onKey} />

<nav class="dock" aria-label="Screens">
  {#each docked as it (it.id)}
    <button class="burrow" class:on={it.id === current} aria-current={it.id === current ? 'page' : undefined} onclick={() => choose(it.id)}>
      <span class="burrow-hole">{#if it.id === current}<span class="burrow-peek"><Mochi size={34} /></span>{/if}</span>
      <small>{it.dock}</small>
    </button>
  {/each}
  <button bind:this={moreBtn} class="burrow" class:on={inMore} aria-haspopup="dialog" aria-expanded={more} onclick={() => (more = true)}>
    <span class="burrow-hole">
      {#if inMore}<span class="burrow-peek"><Mochi size={34} /></span>{:else}<span class="burrow-dots" aria-hidden="true"><i></i><i></i><i></i></span>{/if}
    </span>
    <small>More</small>
  </button>
</nav>

{#if more}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="backdrop" onclick={(e) => e.target === e.currentTarget && close()}>
    <div class="sheet more-sheet" role="dialog" aria-modal="true" aria-label="More">
      <button class="x" aria-label="Close" onclick={close}>✕</button>
      <h2>More</h2>
      {#each rest as it (it.id)}
        <button class="big-btn" aria-current={it.id === current ? 'page' : undefined} onclick={() => choose(it.id)}>{it.label}</button>
      {/each}
      {#each actions as a (a.label)}
        <button class="big-btn" onclick={() => act(a.run)}>{a.label}</button>
      {/each}
    </div>
  </div>
{/if}
