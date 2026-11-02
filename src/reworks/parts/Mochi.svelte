<script lang="ts">
  import Face from './Face.svelte'
  // The round seed character: a soft blob with a sprout, used by the guide, reactions and the pod.
  let { mood = 'happy', size = 56 }: { mood?: 'happy' | 'wow' | 'sleepy' | 'shy' | 'glad'; size?: number } = $props()
</script>

<span class="mochi" style="--m:{size}px" aria-hidden="true">
  <i class="mochi-leaf l"></i><i class="mochi-leaf r"></i>
  <span class="mochi-body"><Face {mood} size={size / 60} /></span>
</span>
