<script lang="ts">
  import Festival from './Festival.svelte'
  import type { FestivalId, Hours } from './seasons'
  import Sky from './Sky.svelte'

  // The real calendar over the garden: a light for the time of day and a sparse seasonal drift
  // (unless a bought atmosphere is on). Nothing here takes taps.
  let { hours, ambient, festival }: { hours: Hours; ambient: string; festival: FestivalId | null } = $props()
</script>

<div class="tod {hours}" aria-hidden="true"></div>
<Sky sky={ambient} sparse />
{#if festival === 'tsukimi'}<Festival {festival} />{/if}
