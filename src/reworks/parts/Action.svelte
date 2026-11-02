<script lang="ts">
  // The main button. No faces: Mochi is the only thing in the UI with one, so these feel alive
  // through how they move when pressed and let go.
  let { v, label = 'Water · 10 questions' }: { v: string; label?: string } = $props()

  let held = $state(false)
  let boing = $state(0) // replays the let-go wobble
  const press = () => (held = true)
  function lift() {
    if (!held) return
    held = false
    boing++
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<button class="a-btn {v}" class:held onpointerdown={press} onpointerup={lift} onpointerleave={lift} onpointercancel={lift}>
  {#key boing}
    <span class="a-inner" class:boing={boing > 0}>
      {#if v === 'pebble'}
        <b>{label}</b>
      {:else if v === 'pod'}
        <span class="pod-peas">{#each [0, 1, 2] as _}<span class="pea"></span>{/each}</span>
        <span class="pod-skin"><b>{label}</b></span>
      {:else if v === 'mushroom'}
        <span class="mush-cap"><i></i><i></i><i></i><b>{label}</b></span>
        <span class="mush-stem"></span>
      {:else if v === 'acorn'}
        <span class="acorn-cap"></span>
        <span class="acorn-body"><b>{label}</b></span>
      {:else if v === 'honey'}
        <span class="hj-lid"><i class="hj-drip"></i></span>
        <span class="hj-jar"><b>{label}</b><i class="hj-shine"></i></span>
      {:else if v === 'can'}
        <i class="wc-handle"></i><i class="wc-spout"></i>
        <span class="wc-body"><b>{label}</b></span>
        {#each [0, 1, 2] as i}<i class="wc-drop" style="--i:{i}"></i>{/each}
      {:else if v === 'pumpkin'}
        <i class="pk-stem"></i><i class="pk-curl"></i>
        <span class="pk-body"><b>{label}</b></span>
      {:else if v === 'blossom'}
        {#each Array(10) as _, i}<i class="bl-petal" style="--c:{i % 5}"></i>{/each}
        <span class="bl-heart"><b>{label}</b></span>
      {:else if v === 'cushion'}
        <span class="cu-body"><b>{label}</b><i class="cu-tuft l"></i><i class="cu-tuft r"></i></span>
      {:else}
        <span class="dw-drop"><b>{label}</b><i class="dw-shine"></i></span>
      {/if}
    </span>
  {/key}
</button>
