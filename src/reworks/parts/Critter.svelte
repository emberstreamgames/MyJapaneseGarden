<script lang="ts">
  import CreatureSprite from '../../lib/CreatureSprite.svelte'
  import { CREATURES, type Creature } from '../../lib/creatures'
  // One of the game's real creatures, drawn at any size.
  let { creature, look, size = 56 }: { creature: Creature; look?: string; size?: number } = $props()
</script>

<svg class="critter" width={size} height={size} viewBox={CREATURES[creature].view} aria-hidden="true">
  <CreatureSprite {creature} look={look ?? CREATURES[creature].looks[0].id} />
</svg>
