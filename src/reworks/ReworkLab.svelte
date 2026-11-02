<script lang="ts">
  import { onMount } from 'svelte'
  import ConfirmSheet from '../lib/ConfirmSheet.svelte'
  import { newLook } from '../lib/look'
  import { scene } from '../lib/meadow'
  import PlantSprite from '../lib/PlantSprite.svelte'
  import Mix from './Mix.svelte'
  import { ELEMENTS, FONTS, GROUPS, PALETTES, defaultPicks, type Picks } from './options'
  import Action from './parts/Action.svelte'
  import Badge from './parts/Badge.svelte'
  import Card from './parts/Card.svelte'
  import Choices from './parts/Choices.svelte'
  import Hud from './parts/Hud.svelte'
  import Menu from './parts/Menu.svelte'
  import Popup from './parts/Popup.svelte'
  import Progress from './parts/Progress.svelte'
  import Reaction from './parts/Reaction.svelte'
  import Reward from './parts/Reward.svelte'
  import Voice from './parts/Voice.svelte'

  // Dev-only page of UI rework options, one element at a time. Choosing an option in each section
  // builds up the mix, which shows them together on a phone. The picks stay in this browser, and Copy
  // gives a list to hand back.
  const KEY = 'rework-picks'

  function load(): Picks {
    try {
      return { ...defaultPicks(), ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
    } catch {
      return defaultPicks()
    }
  }

  let picks = $state<Picks>(load())
  let copied = $state(false)
  let mixOpen = $state(false)
  let resetting = $state(false)

  // Each option's own demo state.
  let steps = $state<Record<string, number>>({})
  let reacts = $state<Record<string, { kind: 'right' | 'miss' | null; id: number }>>({})
  let plays = $state<Record<string, number>>({})

  const summary = $derived(ELEMENTS.map((e) => `${e.title}: ${e.options.find((o) => o.id === picks[e.id])?.name ?? picks[e.id]}`))
  const keep = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(picks))
    } catch {
      // ignore: the picks still work for this visit
    }
  }

  function choose(el: string, id: string) {
    picks[el] = id
    keep()
  }

  function reset() {
    resetting = false
    picks = defaultPicks()
    keep()
  }

  async function copy() {
    await navigator.clipboard.writeText(summary.join('\n'))
    copied = true
    setTimeout(() => (copied = false), 1500)
  }

  const react = (id: string, kind: 'right' | 'miss') => (reacts[id] = { kind, id: (reacts[id]?.id ?? 0) + 1 })

  // The whole page wears the picked colour, lettering and surface.
  $effect(() => {
    const root = document.documentElement
    for (const [k, value] of Object.entries(PALETTES[picks.colour])) root.style.setProperty(`--${k}`, value)
    root.style.setProperty('--font', FONTS[picks.font])
    root.style.colorScheme = picks.colour === 'firefly' ? 'dark' : 'light'
    root.dataset.surface = picks.surface
  })

  // Every face's eyes follow the pointer.
  onMount(() => {
    let raf = 0
    let x = innerWidth / 2
    let y = 0
    const look = () => {
      raf = 0
      for (const f of document.querySelectorAll<HTMLElement>('.face')) {
        const r = f.getBoundingClientRect()
        if (r.bottom < 0 || r.top > innerHeight) continue
        const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2)
        const d = Math.hypot(dx, dy) || 1
        const pull = Math.min(1, d / 120)
        f.style.setProperty('--lx', ((dx / d) * pull).toFixed(2))
        f.style.setProperty('--ly', ((dy / d) * pull).toFixed(2))
      }
    }
    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      raf ||= requestAnimationFrame(look)
    }
    addEventListener('pointermove', move, { passive: true })
    addEventListener('pointerdown', move, { passive: true })
    return () => {
      removeEventListener('pointermove', move)
      removeEventListener('pointerdown', move)
      cancelAnimationFrame(raf)
    }
  })

  const lawn = scene(newLook().wearing)
</script>

<div class="lab">
  <div class="lab-col">
    <header class="lab-head">
      <h1>UI rework options</h1>
      <p>One element at a time, so you can mix and match. Everything here is live: tap it, poke it and press it. Choose your favourite in each section and the phone shows them together. Mochi is the only part of the UI with a face; everything else comes alive through movement.</p>
      <div class="lab-jump">
        {#each ELEMENTS as e, i}<a href="#{e.id}">{i + 1}. {e.title}</a>{/each}
      </div>
    </header>

    {#each GROUPS as g}
      <h2 class="lab-group">{g}</h2>
      {#each ELEMENTS.filter((e) => e.group === g) as e}
        <section class="el" id={e.id}>
          <h3>{ELEMENTS.indexOf(e) + 1}. {e.title}</h3>
          <p class="el-ask">{e.ask}</p>
          <div class="opts" class:wide={['card', 'choices', 'reward', 'popup', 'voice', 'hud', 'menu'].includes(e.id)}>
            {#each e.options as o}
              {@const key = `${e.id}.${o.id}`}
              {@const on = picks[e.id] === o.id}
              <article class="opt surface" class:on>
                <div class="stage el-{e.id}">
                  {#if e.id === 'colour'}
                    <div class="swatches" style="background:{PALETTES[o.id].paper};color:{PALETTES[o.id].ink}">
                      {#each ['card', 'leaf', 'accent', 'honey', 'sky', 'blush'] as t}<i style="background:{PALETTES[o.id][t]}"></i>{/each}
                      <b style="background:{PALETTES[o.id].accent};color:{PALETTES[o.id].onAccent}">Water</b>
                    </div>
                  {:else if e.id === 'font'}
                    <div class="fontcard" style="font-family:{FONTS[o.id]}">
                      <span lang="ja">だいがく 大学</span>
                      <small lang="ja">あいうえお さきしめ ぬねの</small>
                      <small>A plant is ready to grow.</small>
                    </div>
                  {:else if e.id === 'surface'}
                    <div class="surfdemo surface" data-surface={o.id}><b>Cherry blossom</b><small>Ready to grow</small></div>
                  {:else if e.id === 'hud'}
                    <Hud v={o.id} />
                  {:else if e.id === 'menu'}
                    <Menu v={o.id} />
                  {:else if e.id === 'badge'}
                    <div class="soilrow">
                      {#each ['thirsty', 'ready', 'resting'] as const as st, i}
                        <span class="soil">
                          <span class="soil-plant"><PlantSprite species={i ? 'tulip' : 'sakura'} stage={[3, 5, 2][i]} soil={false} /></span>
                          <span class="soil-badge"><Badge v={o.id} state={st} /></span>
                        </span>
                      {/each}
                    </div>
                  {:else if e.id === 'voice'}
                    <Voice v={o.id} />
                  {:else if e.id === 'action'}
                    <Action v={o.id} />
                  {:else if e.id === 'card'}
                    <Card v={o.id} />
                  {:else if e.id === 'choices'}
                    <Choices v={o.id} />
                  {:else if e.id === 'progress'}
                    <div class="stepper">
                      <Progress v={o.id} at={steps[key] ?? 3} />
                      <button class="mini" onclick={() => (steps[key] = ((steps[key] ?? 3) + 1) % 11)}>{(steps[key] ?? 3) >= 10 ? 'Start again' : 'Next question'}</button>
                    </div>
                  {:else if e.id === 'reaction'}
                    <div class="stepper">
                      <Reaction v={o.id} kind={reacts[key]?.kind ?? null} id={reacts[key]?.id ?? 0} />
                      <div class="mini-row">
                        <button class="mini" onclick={() => react(key, 'right')}>Right</button>
                        <button class="mini" onclick={() => react(key, 'miss')}>Miss</button>
                      </div>
                    </div>
                  {:else if e.id === 'reward'}
                    <div class="stepper">
                      <Reward v={o.id} run={plays[key] ?? 0} />
                      <button class="mini" onclick={() => (plays[key] = (plays[key] ?? 0) + 1)}>Play again</button>
                    </div>
                  {:else if e.id === 'popup'}
                    <Popup v={o.id} />
                  {/if}
                </div>
                <div class="opt-text">
                  <b>{o.name}</b>
                  <p>{o.why}</p>
                </div>
                <button class="choose" aria-pressed={on} onclick={() => choose(e.id, o.id)}>{on ? '♥ Chosen' : 'Choose this'}</button>
              </article>
            {/each}
          </div>
        </section>
      {/each}
    {/each}

    <section class="done surface">
      <h3>Your picks</h3>
      <ul>
        {#each summary as s}<li>{s}</li>{/each}
      </ul>
      <div class="mini-row">
        <button class="mini strong" onclick={copy}>{copied ? 'Copied' : 'Copy my list'}</button>
        <button class="mini" onclick={() => (resetting = true)}>Start over</button>
      </div>
    </section>
  </div>

  <aside class="mix-side" class:open={mixOpen} aria-label="Your mix">
    <button class="mix-close" onclick={() => (mixOpen = false)}>Back to the options</button>
    <Mix {picks} {lawn} />
    <button class="mini strong mix-copy" onclick={copy}>{copied ? 'Copied' : 'Copy my list'}</button>
  </aside>
  <button class="mix-fab" onclick={() => (mixOpen = true)}>See my mix</button>
</div>

{#if resetting}
  <ConfirmSheet title="Start over?" yes="Start over" no="Keep my picks" danger onYes={reset} onNo={() => (resetting = false)}>
    <p>Every section goes back to its first option.</p>
  </ConfirmSheet>
{/if}
