<script lang="ts">
  import { findLook, type Creature } from './creatures'

  // One creature, drawn around (0, 0): a flier's centre (seen from above, head up) or a ground
  // creature's feet (side-on ones face right). Renders a <g>, so it goes inside an <svg>. `note` is
  // the rolled-up note a visitor carries until it's thanked. The class names are what app.css animates.
  let { creature, look, note = false }: { creature: Creature; look: string; note?: boolean } = $props()

  const l = $derived(findLook(creature, look))
  const has = (s: string) => (l.style ?? '').split(' ').includes(s)
  const halo = $derived(l.glow ? `filter:drop-shadow(0 0 1.6px ${l.glow})` : undefined)

  // Ladybird spots, for one side; the other side mirrors them.
  const SPOTS: Record<string, [number, number, number][]> = {
    two: [[3, -0.6, 1.8]],
    seven: [[2.6, -2.2, 1.3], [3.8, 1.2, 1.3], [1.8, 3.8, 1.1]],
    many: [[1.6, -3, 0.8], [4, -2.2, 0.8], [2, 0, 0.8], [4.6, 1, 0.8], [1.6, 3, 0.8], [3.6, 3.6, 0.8]],
  }
  const spots = $derived(SPOTS[Object.keys(SPOTS).find(has) ?? ''] ?? [])
  const FROG_SPOTS = [[-3.6, -5.6, 0.9], [3, -6.4, 0.7], [-1, -3, 0.6], [4.6, -3.6, 0.8], [-5.6, -2.8, 0.6]]
</script>

<g class="v-body" style={halo}>
  {#if creature === 'butterfly'}
    <g class="wing-l">{@render flutterby()}</g>
    <g class="wing-r"><g transform="scale(-1 1)">{@render flutterby()}</g></g>
    <ellipse rx="1.1" ry="5" fill={l.dark} />
    <path d="M-0.4 -4.6Q-2 -8 -3.2 -8.6M0.4 -4.6Q2 -8 3.2 -8.6" fill="none" stroke={l.dark} stroke-width="0.5" stroke-linecap="round" />
    {#if note}
      <!-- Held in its legs under the body. -->
      <path d="M-0.6 3.6L-1.8 6.4M0.6 3.6L1.8 6.4" stroke={l.dark} stroke-width="0.45" stroke-linecap="round" />
      <g transform="translate(0 7.4) rotate(-6)">{@render scroll()}</g>
    {/if}
  {:else if creature === 'dragonfly'}
    {@const wing = has('dark-wings') ? l.light : `${l.light}b0`}
    <g class="wing-l">{@render veined(wing)}</g>
    <g class="wing-r"><g transform="scale(-1 1)">{@render veined(wing)}</g></g>
    <path d="M-1 -3L-0.5 9Q0 11.6 0.5 9L1 -3Z" fill={l.main} />
    <path d="M-0.9 0H0.9M-0.8 3H0.8M-0.7 6H0.7" stroke={l.mark} stroke-width="0.5" />
    <ellipse cy="-5" rx="1.7" ry="2.6" fill={l.main} />
    <path d="M-0.7 -6.4L0.7 -6.4L0 -3.4Z" fill={l.dark} />
    <circle cx="-1.2" cy="-8.2" r="1.3" fill={l.dark} />
    <circle cx="1.2" cy="-8.2" r="1.3" fill={l.dark} />
    <circle cx="-1.5" cy="-8.6" r="0.35" fill="#fff" />
    <circle cx="0.9" cy="-8.6" r="0.35" fill="#fff" />
    {#if note}<g transform="translate(0 12.4) rotate(-6)">{@render scroll()}</g>{/if}
  {:else if creature === 'bee'}
    <g class="wing-l"><path d="M-1 -3C-4 -9 -11 -10 -11 -5C-11 -2 -5 -1 -1 -2Z" fill="#ffffffb0" stroke="#0004" stroke-width="0.3" /></g>
    <g class="wing-r"><path d="M1 -3C4 -9 11 -10 11 -5C11 -2 5 -1 1 -2Z" fill="#ffffffb0" stroke="#0004" stroke-width="0.3" /></g>
    <ellipse cy="1" rx="4.4" ry="6" fill={l.main} />
    <path d="M-4.3 -0.6Q0 0.8 4.3 -0.6L4.4 1.2Q0 2.8 -4.4 1.2Z" fill={l.mark} />
    <path d="M-3.7 3.4Q0 5 3.7 3.4L2.8 5.2Q0 6.2 -2.8 5.2Z" fill={l.mark} />
    {#if has('fluffy')}
      <circle cy="-2.8" r="3.3" fill={l.light} stroke={l.light} stroke-width="1.3" stroke-dasharray="0.7 0.6" />
    {/if}
    <circle cy="-5.6" r="2.5" fill={l.dark} />
    <path d="M-0.8 -7.6Q-2 -9.6 -3.2 -9.8M0.8 -7.6Q2 -9.6 3.2 -9.8" fill="none" stroke={l.dark} stroke-width="0.5" stroke-linecap="round" />
    {#if note}<g transform="translate(0 8.6) rotate(-6)">{@render scroll()}</g>{/if}
  {:else if creature === 'ladybug'}
    <g class="wing-l"><path d="M-2 -2C-8 -7 -13 -3 -12 1C-10 3 -5 2 -2 1Z" fill={l.light} stroke="#0004" stroke-width="0.3" /></g>
    <g class="wing-r"><path d="M2 -2C8 -7 13 -3 12 1C10 3 5 2 2 1Z" fill={l.light} stroke="#0004" stroke-width="0.3" /></g>
    <circle cy="-5.2" r="3.4" fill={l.dark} />
    <circle cx="-1.8" cy="-6.6" r="0.7" fill="#fff" />
    <circle cx="1.8" cy="-6.6" r="0.7" fill="#fff" />
    <path d="M-0.9 -8Q-2 -9.6 -3 -10M0.9 -8Q2 -9.6 3 -10" fill="none" stroke={l.dark} stroke-width="0.5" stroke-linecap="round" />
    <circle cy="0.6" r="6.4" fill={l.main} />
    {#each spots as [x, y, r]}
      <circle cx={x} cy={y + 0.6} {r} fill={l.mark} />
      <circle cx={-x} cy={y + 0.6} {r} fill={l.mark} />
    {/each}
    <path d="M0 -5.8V7" stroke={l.dark} stroke-width="0.6" />
    <ellipse cx="-3" cy="-2.6" rx="1.8" ry="1" fill="#fff" opacity="0.35" transform="rotate(-30 -3 -2.6)" />
    {#if note}<g transform="translate(0 8.6) rotate(-6)">{@render scroll()}</g>{/if}
  {:else if creature === 'bird'}
    {@const beak = l.beak ?? '#3a2a1a'}
    {#if has('long-tail')}
      <path d="M-5 -6L-17 -13L-16 -7.6L-17 -5L-5 -4Z" fill={l.dark} />
    {:else}
      <path d="M-5 -6L-12 -9.5L-11 -5Z" fill={l.dark} />
    {/if}
    <path d="M-1.4 -1.4L-1.8 0M1.2 -1.4L1.6 0" stroke="#7a5a3a" stroke-width="0.7" stroke-linecap="round" />
    <ellipse cx="-1" cy="-6" rx="6.4" ry="5" fill={l.main} />
    <ellipse cx="0.4" cy="-4.4" rx="4.4" ry="3" fill={l.light} />
    {#if l.mark}<ellipse cx="3" cy="-6.6" rx="2.6" ry="2.4" fill={l.mark} />{/if}
    {#if has('bib')}<path d="M2.6 -6.4Q3.6 -3.4 1.8 -1.8" fill="none" stroke={l.head} stroke-width="1.5" stroke-linecap="round" />{/if}
    <g class="b-head">
      {#if has('crest')}<path d="M1.2 -13.4C-1 -17 1 -18.4 4 -14.6Z" fill={l.dark} />{/if}
      <circle cx="4" cy="-10.6" r="4" fill={l.head} />
      {#if l.cheek}<ellipse cx="4.6" cy="-9" rx="2.4" ry="1.6" fill={l.cheek === '#2b1b14' ? '#f4ede0' : l.cheek} />{/if}
      {#if l.cheek === '#2b1b14'}<circle cx="5" cy="-8.8" r="0.8" fill={l.cheek} />{/if}
      {#if l.ring}<circle cx="5.4" cy="-11.4" r="1.6" fill={l.ring} />{/if}
      <circle cx="5.5" cy="-11.4" r="0.85" fill="#111" />
      {#if has('long-beak')}
        <path d="M7.6 -11.6L13.6 -10.2L7.6 -9.4Z" fill={beak} />
      {:else}
        <path d="M7.6 -11.3L10.2 -10.4L7.6 -9.6Z" fill={beak} />
      {/if}
      {#if note}<g transform="translate(9.6 -10.2) rotate(-22)">{@render scroll()}</g>{/if}
    </g>
    <path class="b-wing" d="M-6 -8Q0 -10.5 3 -6Q-2 -2.5 -6.5 -5Z" fill={l.dark} />
  {:else if creature === 'owl'}
    <ellipse cy="-8.5" rx="6.8" ry="8.5" fill={l.main} />
    <ellipse cy="-6.4" rx="4.6" ry="5.6" fill={l.light} />
    <path d="M-2.8 -7.4q0.9 1 1.8 0M1 -7.4q0.9 1 1.8 0M-1 -5q1 1 2 0M-2.8 -2.8q0.9 1 1.8 0M1 -2.8q0.9 1 1.8 0" fill="none" stroke={l.mark} stroke-width="0.5" stroke-linecap="round" />
    {#if !has('round')}
      <path d="M-5.8 -13.4L-6.4 -18.8L-1.8 -15.8ZM5.8 -13.4L6.4 -18.8L1.8 -15.8Z" fill={l.main} />
    {/if}
    <circle cx="-2.7" cy="-12.2" r="3.1" fill={l.head} />
    <circle cx="2.7" cy="-12.2" r="3.1" fill={l.head} />
    <circle cx="-2.6" cy="-12.2" r="1.7" fill={l.ring} />
    <circle cx="2.6" cy="-12.2" r="1.7" fill={l.ring} />
    <circle cx="-2.6" cy="-12.2" r="0.95" fill="#111" />
    <circle cx="2.6" cy="-12.2" r="0.95" fill="#111" />
    <circle cx="-2.3" cy="-12.6" r="0.3" fill="#fff" />
    <circle cx="2.9" cy="-12.6" r="0.3" fill="#fff" />
    <path d="M-0.9 -11.2L0.9 -11.2L0 -9.2Z" fill="#e8a33f" />
    <ellipse class="b-wing" cx="-6.6" cy="-7.6" rx="2" ry="5.8" fill={l.dark} />
    <ellipse cx="6.6" cy="-7.6" rx="2" ry="5.8" fill={l.dark} />
    <path d="M-3.4 -0.4H-1M1 -0.4H3.4" stroke="#e8a33f" stroke-width="0.9" stroke-linecap="round" />
    {#if note}<g transform="translate(0 -8.6) rotate(-6)">{@render scroll()}</g>{/if}
  {:else if creature === 'frog'}
    <ellipse cx="-6.8" cy="-2.2" rx="4.4" ry="2.4" fill={l.dark} />
    <ellipse cx="6.8" cy="-2.2" rx="4.4" ry="2.4" fill={l.dark} />
    <ellipse cy="-4.8" rx="7" ry="4.8" fill={l.main} />
    <ellipse cy="-3" rx="4.6" ry="3" fill={l.light} />
    {#if has('spots')}
      {#each FROG_SPOTS as [x, y, r]}<circle cx={x} cy={y} {r} fill={l.mark} />{/each}
    {/if}
    <ellipse cy="-9" rx="6.4" ry="3.8" fill={l.main} />
    <circle cx="-3.8" cy="-12.2" r="2.5" fill={l.main} />
    <circle cx="3.8" cy="-12.2" r="2.5" fill={l.main} />
    <circle cx="-3.8" cy="-12.4" r="1.7" fill={l.ring ?? '#ffe9a0'} />
    <circle cx="3.8" cy="-12.4" r="1.7" fill={l.ring ?? '#ffe9a0'} />
    <ellipse cx="-3.8" cy="-12.4" rx="1.1" ry="0.8" fill="#111" />
    <ellipse cx="3.8" cy="-12.4" rx="1.1" ry="0.8" fill="#111" />
    <path d="M-3.8 -8.4Q0 -6.6 3.8 -8.4" fill="none" stroke={l.dark} stroke-width="0.6" stroke-linecap="round" />
    <path d="M-2.8 -0.6h-2.4M2.8 -0.6h2.4" stroke={l.dark} stroke-width="1.3" stroke-linecap="round" />
    {#if note}<g transform="translate(0 -6.6) rotate(-6)">{@render scroll()}</g>{/if}
  {:else if creature === 'rabbit'}
    <circle cx="-9" cy="-4.4" r="2.3" fill={has('dutch') ? l.mark : l.light === '#ffc4d0' ? '#fff' : l.light} />
    <ellipse cx="-2" cy="-6" rx="7" ry="6" fill={l.main} />
    {#if has('dutch')}<path d="M-9 -6C-9 -12 -4 -12.2 -1 -11.6C-3 -8 -3 -3 -1 -0.1C-5 -0.4 -9 -1.4 -9 -6Z" fill={l.mark} />{/if}
    <ellipse cx="-1" cy="-1" rx="4" ry="1.2" fill={l.dark} opacity={has('dutch') ? 1 : 0.7} />
    <ellipse cx="4" cy="-0.8" rx="1.9" ry="0.9" fill={l.main} stroke={l.dark} stroke-width="0.3" />
    <g transform="rotate(-16 2 -15)"><path d="M1 -14.6C-0.4 -20 0.4 -23.6 2 -23.6C3.6 -23.6 3.6 -19 3.2 -15Z" fill={has('dutch') ? l.mark : l.dark} /></g>
    <circle cx="4.4" cy="-11.6" r="3.9" fill={l.main} />
    {#if has('dutch')}<path d="M4.4 -15.5A3.9 3.9 0 0 1 8.2 -11.2Q6 -9 4.4 -10.8C3 -12 3.4 -14 4.4 -15.5Z" fill={l.mark} />{/if}
    <path d="M3 -14.6C1.6 -20 2.2 -24 4 -24C5.6 -24 5.6 -19 5 -14.8Z" fill={has('dutch') ? l.mark : l.main} />
    <path d="M3.6 -15.6C2.8 -19.6 3.2 -22.6 4 -22.6C4.7 -22.6 4.7 -19 4.4 -15.6Z" fill={l.light} />
    <circle cx="5.8" cy="-12.2" r="0.95" fill={l.ring} />
    <circle cx="6" cy="-12.5" r="0.3" fill="#fff" />
    <path d="M8.3 -11.2L7.3 -10.3L7 -11.2Z" fill="#e88aa0" />
    {#if note}<g transform="translate(8.6 -9) rotate(-22)">{@render scroll()}</g>{/if}
  {:else if creature === 'cat'}
    {@const eye = l.ring ?? '#ffd23f'}
    <path d="M5 -1.4C10 -1 11.4 -5 9 -8.4" fill="none" stroke={has('points') ? l.dark : has('calico') ? l.mark ?? l.dark : l.main} stroke-width="2.3" stroke-linecap="round" />
    <path d="M-6 0C-7 -6 -4 -10.5 0 -10.5C4 -10.5 7 -6 6 0Z" fill={l.main} />
    {#if has('calico')}<path d="M-6 -1C-6.6 -5 -5 -8 -2.6 -8C-1.4 -5 -3 -2 -5.6 -0.4Z" fill={l.mark} />{/if}
    {#if has('calico') && !has('bell')}<path d="M6 -0.6C6.4 -3 5.6 -5.6 3.6 -7C2.4 -5 3 -2 4.4 -0.2Z" fill={l.dark} />{/if}
    {#if has('tabby')}<path d="M-5.2 -5.4H-3M-5.4 -3H-3M5.2 -5.4H3M5.4 -3H3" stroke={l.mark} stroke-width="0.8" stroke-linecap="round" />{/if}
    <ellipse cy="-4.6" rx="3" ry="4" fill={l.light} />
    <path d="M-5.6 -14.4L-5.2 -19.6L-1.4 -16.4ZM5.6 -14.4L5.2 -19.6L1.4 -16.4Z" fill={has('points') ? l.dark : has('calico') ? (l.dark === '#2b2622' ? l.dark : l.mark) : l.main} />
    <path d="M-4.8 -15.4L-4.6 -18.2L-2.6 -16.4ZM4.8 -15.4L4.6 -18.2L2.6 -16.4Z" fill="#f0a0b0" opacity={l.main === '#2a2830' ? 0.4 : 0.9} />
    <ellipse cy="-12" rx="6.1" ry="5" fill={l.main} />
    {#if has('calico')}<path d="M0.4 -16.9A6.1 5 0 0 1 6 -12.8C4 -11.6 1.6 -12.6 0.4 -16.9Z" fill={l.mark} />{/if}
    {#if has('calico') && !has('bell')}<path d="M-0.6 -16.9A6.1 5 0 0 0 -6 -12.8C-4 -11.6 -1.8 -12.8 -0.6 -16.9Z" fill={l.dark} />{/if}
    {#if has('points')}<ellipse cy="-11.4" rx="4.4" ry="3.5" fill={l.dark} />{/if}
    {#if has('tabby')}<path d="M-1.6 -16.6V-14.8M0 -16.9V-14.6M1.6 -16.6V-14.8M-5.8 -10.8L-4.2 -10.6M5.8 -10.8L4.2 -10.6" stroke={l.mark} stroke-width="0.8" stroke-linecap="round" />{/if}
    <circle cx="-2.4" cy="-12.6" r="1.2" fill={eye} />
    <circle cx="2.4" cy="-12.6" r="1.2" fill={eye} />
    <ellipse cx="-2.4" cy="-12.6" rx="0.5" ry="1" fill="#111" />
    <ellipse cx="2.4" cy="-12.6" rx="0.5" ry="1" fill="#111" />
    <path d="M-0.7 -10.9H0.7L0 -10.1Z" fill="#f08a9c" />
    <path d="M0 -10.1Q-0.9 -9.1 -1.7 -9.7M0 -10.1Q0.9 -9.1 1.7 -9.7" fill="none" stroke={l.main === '#2a2830' ? '#6a6870' : '#5a4a44'} stroke-width="0.35" stroke-linecap="round" />
    <ellipse cx="-1.9" cy="-0.7" rx="1.7" ry="0.9" fill={has('points') ? l.dark : l.light} />
    <ellipse cx="1.9" cy="-0.7" rx="1.7" ry="0.9" fill={has('points') ? l.dark : l.light} />
    {#if has('bell')}
      <path d="M-3.8 -7.8Q0 -6 3.8 -7.8" fill="none" stroke="#d8324a" stroke-width="1.2" stroke-linecap="round" />
      <circle cy="-6" r="1.2" fill="#ffd23f" stroke="#b8860b" stroke-width="0.3" />
    {/if}
    {#if note}<g transform="translate(0 -8.8) rotate(-6)">{@render scroll()}</g>{/if}
  {:else if creature === 'tanuki'}
    <g transform="rotate(14 8 -3)">
      <ellipse cx="8.4" cy="-3.6" rx="2.9" ry="4.6" fill={l.main} />
      <path d="M5.8 -4.4Q8.4 -3.2 11 -4.4L10.9 -2.8Q8.4 -1.6 6 -2.8Z" fill={l.dark} />
    </g>
    <ellipse cy="-6.2" rx="7.4" ry="6.2" fill={l.main} />
    <ellipse cy="-5" rx="5" ry="4.6" fill={l.light} />
    <ellipse cx="-3.6" cy="-0.9" rx="2.8" ry="1.2" fill={l.dark} />
    <ellipse cx="3.6" cy="-0.9" rx="2.8" ry="1.2" fill={l.dark} />
    <ellipse cx="-6.6" cy="-6.6" rx="1.7" ry="3" fill={l.dark} transform="rotate(14 -6.6 -6.6)" />
    <ellipse cx="6.6" cy="-6.6" rx="1.7" ry="3" fill={l.dark} transform="rotate(-14 6.6 -6.6)" />
    <circle cx="-4.8" cy="-17.6" r="2" fill={l.dark} />
    <circle cx="4.8" cy="-17.6" r="2" fill={l.dark} />
    <ellipse cy="-13.8" rx="6.4" ry="5" fill={l.main} />
    <ellipse cx="-2.7" cy="-14" rx="2.7" ry="2.1" fill={l.dark} transform="rotate(16 -2.7 -14)" />
    <ellipse cx="2.7" cy="-14" rx="2.7" ry="2.1" fill={l.dark} transform="rotate(-16 2.7 -14)" />
    <circle cx="-2.5" cy="-14.2" r="0.95" fill="#fff" />
    <circle cx="2.5" cy="-14.2" r="0.95" fill="#fff" />
    <circle cx="-2.4" cy="-14.1" r="0.55" fill="#111" />
    <circle cx="2.4" cy="-14.1" r="0.55" fill="#111" />
    <ellipse cy="-11.6" rx="2.7" ry="1.9" fill={l.light} />
    <ellipse cy="-12.4" rx="0.85" ry="0.6" fill="#17120e" />
    {#if has('leaf')}
      <path d="M0 -17.6C-3 -19 -3.4 -22 0.6 -22.6C3.4 -21 3 -18.6 0 -17.6Z" fill="#5fae48" />
      <path d="M0 -17.6L0.6 -22" stroke="#3f7f30" stroke-width="0.4" />
    {/if}
    {#if has('hat')}
      <path d="M-7.6 -17.2Q0 -24.6 7.6 -17.2Q0 -15.4 -7.6 -17.2Z" fill="#d9b25f" stroke="#a8843a" stroke-width="0.4" />
      <path d="M-4 -16.8Q0 -21.6 4 -16.8M-1.4 -16.4L0 -21M1.4 -16.4L0 -21" fill="none" stroke="#a8843a" stroke-width="0.35" />
    {/if}
    {#if note}<g transform="translate(0 -9.6) rotate(-6)">{@render scroll()}</g>{/if}
  {/if}
</g>

<!-- A butterfly's left wing pair. The right is the same, mirrored. -->
{#snippet flutterby()}
  {#if has('tails')}<path d="M-6.4 7L-8.6 13.4L-4.4 8.4Z" fill={l.light} stroke="#0003" stroke-width="0.3" />{/if}
  <path d="M0 -1C-3 -11 -13 -13 -12 -4C-11 0 -5 1 0 0Z" fill={l.main} stroke="#0003" stroke-width="0.4" />
  <path d="M0 0C-4 1 -9 4 -7 8C-5 10 -1 5 0 1Z" fill={l.light} stroke="#0003" stroke-width="0.4" />
  {#if has('veins')}
    <path d="M-1 -1L-11 -9.4M-1 -1L-12 -5.4M-1 -0.4L-9.4 -1M-1 1L-6.6 6.6M-1 1.4L-3.6 6.8" fill="none" stroke={l.mark} stroke-width="0.5" />
  {/if}
  {#if has('bands')}
    <path d="M-3.4 -9.4C-7 -12 -12.8 -11.4 -12 -4C-11.7 -2.6 -11 -1.6 -10 -1" fill="none" stroke={l.mark} stroke-width="1.5" stroke-linecap="round" />
    <path d="M-7.2 7.4C-5.4 9.4 -2.4 6.4 -1 3.2" fill="none" stroke={l.mark} stroke-width="1" stroke-linecap="round" />
  {/if}
  {#if has('tips')}
    <path d="M-5.6 -10.8C-9 -12.6 -12.8 -10.6 -12 -4C-11.8 -3.2 -11.4 -2.6 -11 -2.2C-10 -5 -8 -8.4 -5.6 -10.8Z" fill={l.mark} />
  {:else if has('eyes')}
    <circle cx="-8" cy="-6.4" r="2.5" fill={l.dark} />
    <circle cx="-8" cy="-6.4" r="1.6" fill={l.mark} />
    <circle cx="-8" cy="-6.4" r="0.6" fill="#fff" />
    <circle cx="-4.8" cy="5" r="1.5" fill={l.dark} />
    <circle cx="-4.8" cy="5" r="0.8" fill={l.mark} />
  {:else if has('dots')}
    <circle cx="-11" cy="-7" r="0.6" fill="#fff" />
    <circle cx="-11.6" cy="-4.6" r="0.6" fill="#fff" />
    <circle cx="-8.6" cy="-10.2" r="0.6" fill="#fff" />
    <circle cx="-5.8" cy="6.4" r="0.5" fill="#fff" />
  {:else if !has('bands')}
    <circle cx="-7.5" cy="-6" r="1.5" fill={l.mark} />
  {/if}
{/snippet}

<!-- A dragonfly's left wings. -->
{#snippet veined(fill: string)}
  <path d="M0 -5.4C-5 -9 -12 -8.6 -14.6 -7C-12 -5.2 -5 -4 0 -4.4Z" {fill} stroke={l.dark} stroke-width="0.25" />
  <path d="M0 -3.8C-5 -3.6 -12 -2.6 -14 -0.8C-11 0.2 -5 -1.6 0 -2.8Z" {fill} stroke={l.dark} stroke-width="0.25" />
  <path d="M-12.6 -7.4L-14 -7.1M-12.2 -2.2L-13.4 -1.1" stroke={l.mark} stroke-width="0.8" stroke-linecap="round" />
{/snippet}

<!-- A rolled-up note tied with a red string, centred on (0, 0). -->
{#snippet scroll()}
  <g class="v-note">
    <rect x="-4.2" y="-1.3" width="8.4" height="2.6" rx="1.3" fill="#fbf3dc" stroke="#a88a50" stroke-width="0.35" />
    <path d="M-2.4 -1.1q0.6 1.1 0 2.2M1.6 -1.1q0.6 1.1 0 2.2" fill="none" stroke="#e2d3ad" stroke-width="0.35" />
    <path d="M-0.4 -1.3v2.6" stroke="#d6324a" stroke-width="0.9" />
    <ellipse cx="4.1" rx="0.55" ry="1.3" fill="#efe3c3" stroke="#a88a50" stroke-width="0.3" />
  </g>
{/snippet}
