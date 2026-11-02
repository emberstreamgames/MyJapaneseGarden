<script lang="ts">
  // Mochi the seed: the garden's guide, and the only thing in the UI with a face. Everything else
  // comes alive through how it moves.
  let { mood = 'happy', size = 56 }: { mood?: 'happy' | 'wow' | 'sleepy' | 'shy' | 'glad'; size?: number } = $props()

  const blink = (Math.random() * 5).toFixed(2) // so two Mochis on screen don't blink together
</script>

<span class="mochi" style="--m:{size}px" aria-hidden="true">
  <i class="mochi-leaf l"></i><i class="mochi-leaf r"></i>
  <span class="mochi-body">
    <span class="face {mood}" style="--s:{size / 60};--blink:-{blink}s">
      <span class="eye"><i></i></span><span class="eye"><i></i></span>
      <span class="cheek l"></span><span class="cheek r"></span>
      <span class="mouth"></span>
    </span>
  </span>
</span>
