<script lang="ts">
  import { bloomMarkup, nextUid } from './blooms'
  import type { Species } from './garden'

  // Just the open flower, no stem or soil: how a pressed flower sits in the collection.
  let { species, variant }: { species: Species; variant: number } = $props()

  const uid = nextUid()
  // Centre each head in the frame: the lavender spike rises above its head centre and is slim, and the small
  // tulip cup is zoomed to match the others.
  const fit = $derived(species === 'lavender' ? 'translate(0 16.2) scale(1.35)' : species === 'tulip' ? 'scale(1.45)' : '')
</script>

<svg class="flower-head" viewBox="-30 -30 60 60" aria-hidden="true">
  <g transform={fit}>{@html bloomMarkup(species, variant, uid)}</g>
</svg>
