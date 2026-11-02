<script lang="ts">
  import Face from './Face.svelte'
  let { size = 44 }: { size?: number } = $props()
</script>

<span class="snail" style="--n:{size}px" aria-hidden="true">
  <i class="snail-body"></i><i class="snail-shell"></i><i class="snail-horn a"></i><i class="snail-horn b"></i>
  <span class="snail-face"><Face size={size / 90} /></span>
</span>
