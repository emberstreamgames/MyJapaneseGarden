<script lang="ts">
  import type { Snippet } from 'svelte'

  // The app's yes/no, used instead of the browser's confirm(). Mount it outside any other .sheet or
  // .tour: their pop-in transform would otherwise trap its fixed backdrop. `danger` marks a yes that
  // loses something. Focus starts on the safe choice and goes back where it was on closing.
  let {
    title,
    yes,
    no,
    danger = false,
    onYes,
    onNo,
    children,
  }: { title: string; yes: string; no: string; danger?: boolean; onYes: () => void; onNo: () => void; children: Snippet } = $props()

  // Keys stop here, in the capture phase, so what's underneath doesn't act on them too: Escape would
  // close a sheet, and Enter would move a quiz on. The focused button still gets its click.
  function onKey(e: KeyboardEvent) {
    e.stopPropagation()
    if (e.key === 'Escape') onNo()
  }

  function holdFocus(el: HTMLElement) {
    const back = document.activeElement as HTMLElement | null
    el.focus()
    return () => back?.focus()
  }
</script>

<svelte:window onkeydowncapture={onKey} />

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="backdrop confirm-back" onclick={(e) => e.target === e.currentTarget && onNo()}>
  <div class="sheet confirm" role="alertdialog" aria-modal="true" aria-label={title}>
    <h2>{title}</h2>
    {@render children()}
    <div class="confirm-row">
      <button class="big-btn" onclick={onNo} {@attach holdFocus}>{no}</button>
      <button class="big-btn" class:primary={!danger} class:danger onclick={onYes}>{yes}</button>
    </div>
  </div>
</div>
