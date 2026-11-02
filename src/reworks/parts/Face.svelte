<script lang="ts">
  // A pair of eyes, cheeks and a mouth to stick on anything. The eyes follow the pointer (ReworkLab)
  // and blink out of step, which does most of the work of making a thing feel alive.
  let { mood = 'happy', size = 1 }: { mood?: 'happy' | 'wow' | 'sleepy' | 'shy' | 'glad'; size?: number } = $props()

  const blink = (Math.random() * 5).toFixed(2)
</script>

<span class="face {mood}" style="--s:{size};--blink:-{blink}s" aria-hidden="true">
  <span class="eye"><i></i></span><span class="eye"><i></i></span>
  <span class="cheek l"></span><span class="cheek r"></span>
  <span class="mouth"></span>
</span>
