<script lang="ts" generics="T extends string">
  import { fade, fly } from 'svelte/transition'

  let { items, current, onselect }: { items: { id: T; label: string }[]; current: T; onselect: (id: T) => void } = $props()

  let open = $state(false)
  let toggle: HTMLButtonElement
  let panel = $state<HTMLElement>()
  // Skip the slide when the system asks for less motion.
  const still = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const ms = (n: number) => (still ? 0 : n)

  function choose(id: T) {
    onselect(id)
    open = false
  }

  // Put keyboard focus on the current screen when the menu opens.
  $effect(() => {
    if (open) panel?.querySelector<HTMLButtonElement>('[aria-current="page"]')?.focus()
  })

  function onKey(e: KeyboardEvent) {
    if (open && e.key === 'Escape') {
      open = false
      toggle.focus()
    }
  }
</script>

<svelte:window onkeydown={onKey} />

<button bind:this={toggle} class="burger" class:open aria-label="Menu" aria-expanded={open} aria-controls="menu" onclick={() => (open = !open)}>
  <span></span><span></span><span></span>
</button>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="scrim" transition:fade={{ duration: ms(200) }} onclick={() => (open = false)}></div>
  <nav id="menu" class="menu" aria-label="Screens" bind:this={panel} transition:fly={{ x: 320, opacity: 1, duration: ms(260) }}>
    {#each items as it, i (it.id)}
      <!-- global: play as the panel opens, not only when the list itself changes -->
      <button
        aria-current={it.id === current ? 'page' : undefined}
        onclick={() => choose(it.id)}
        in:fly|global={{ x: 48, delay: ms(80 + i * 35), duration: ms(240) }}
      >
        {it.label}
      </button>
    {/each}
  </nav>
{/if}
