<script lang="ts">
  import { SPECIES, STAGE_NAMES, msUntilReady, formatWait, phaseOf, type Plot } from './garden'
  import { CELL, SPOTS, VIEW, hitClip } from './meadow'
  import PlantSprite from './PlantSprite.svelte'
  import { STEM_TOP } from './plants'

  let { plot, index, now, onclick }: { plot: Plot | null; index: number; now: number; onclick: () => void } = $props()

  // Plants are drawn at 90% of their 100-unit sprite. The art box is sprite-sized, with the
  // sprite's ground point (50, 86) on this plot's spot; the ground layer uses bed units around it.
  const S = 0.9
  const pct = (n: number, of: number) => `${((n / of) * 100).toFixed(3)}%`
  const artBox = `left:${pct(CELL.w / 2 - 50 * S, CELL.w)};top:${pct(CELL.above - 86 * S, CELL.h)};width:${pct(100 * S, CELL.w)};height:${pct(100 * S, CELL.h)}`
  const groundView = `${-50 * S} ${(-86 * S).toFixed(1)} ${100 * S} ${100 * S}`

  const spot = $derived(SPOTS[index])
  const clip = $derived(hitClip(index))
  const place = $derived(
    `left:${pct(spot.x - CELL.w / 2, VIEW.w)};top:${pct(spot.y - CELL.above, VIEW.h)};width:${pct(CELL.w, VIEW.w)};height:${pct(CELL.h, VIEW.h)}`,
  )

  const phase = $derived(plot ? phaseOf(plot, now) : null)
  const bloomed = $derived(plot?.stage === STAGE_NAMES.length - 1)
  const badge = $derived(phase === 'thirsty' ? (bloomed ? '✂️' : '💧') : phase === 'resting' ? 'z' : phase === 'ready' ? '✨' : '')
  // Float the badge beside the top of the plant, clear of the flower head once it has one.
  const badgeAt = $derived.by(() => {
    if (!plot) return ''
    const head = plot.stage >= 6
    const y = STEM_TOP[plot.stage] - (head ? 16 : 10)
    return `left:${pct(CELL.w / 2 + (head ? 25 : 14) * S, CELL.w)};top:${pct(CELL.above - (86 - y) * S, CELL.h)}`
  })
  const status = $derived(
    !plot
      ? 'empty, tap to plant'
      : phase === 'thirsty'
        ? bloomed
          ? 'needs grooming'
          : 'needs water'
        : phase === 'ready'
          ? 'ready to grow'
          : `resting, ready in ${formatWait(msUntilReady(plot, now))}`,
  )
  const label = $derived(
    plot ? `Plot ${index + 1}: ${SPECIES[plot.species].label}, ${STAGE_NAMES[plot.stage]}, ${status}` : `Plot ${index + 1}: ${status}`,
  )
</script>

<!-- The art overflows onto the lawn, so only the button (clipped to the soil) takes taps. -->
<div class="plot {phase ?? 'empty'}" style={place}>
  <svg class="ground" style={artBox} viewBox={groundView} aria-hidden="true">
    <ellipse class="glow" rx="28" ry="10" />
    <ellipse class="ring" cy="0.5" rx="20" ry="7.5" />
    {#if plot}
      <ellipse cy="2" rx="17" ry="5.5" fill="#2e1d11" opacity="0.45" />
      <ellipse rx="13" ry="4.2" fill="#6a4529" />
      <ellipse cx="-3" cy="-1" rx="6" ry="1.6" fill="#8e6340" />
    {:else}
      <ellipse cy="1.6" rx="13" ry="5.6" fill="#b0845a" opacity="0.85" />
      <ellipse rx="12" ry="4.8" fill="#2a1a0f" />
      <ellipse cy="1" rx="8" ry="2.8" fill="#170d07" />
      <circle cx="15" cy="-2" r="1.4" fill="#a3774d" />
      <circle cx="-16" cy="1" r="1" fill="#a3774d" />
      <circle cx="11" cy="5" r="0.9" fill="#a3774d" />
    {/if}
  </svg>
  {#if plot}
    <!-- Taps on the painted plant or its badge count too; the button below covers keyboard use. -->
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="art" style={artBox} {onclick}><PlantSprite species={plot.species} stage={plot.stage} variant={plot.variant} soil={false} /></div>
    {#if badge}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      {#if phase === 'resting'}
        <!-- Sleeping: three Zs drift up and fade in turn. -->
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <span class="zzz" style={badgeAt} aria-hidden="true" {onclick}><i>z</i><i>z</i><i>z</i></span>
      {:else}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <span class="badge" style={badgeAt} aria-hidden="true" {onclick}>{badge}</span>
      {/if}
    {/if}
  {/if}
  <button class="hit" style="clip-path:{clip}" aria-label={label} {onclick}></button>
</div>
