<script lang="ts">
  // Lawn decoration art in a 40x44 view, standing on the ground point (20, 42).
  let { id }: { id: string } = $props()
</script>

<svg class="decor-art" viewBox="0 0 40 44" aria-hidden="true">
  <ellipse cx="20" cy="42" rx="12" ry="2.4" fill="#0003" />
  {#if id === 'frog'}
    <ellipse cx="20" cy="36" rx="10" ry="6.5" fill="#8fae7a" />
    <ellipse cx="13" cy="40.6" rx="3.2" ry="1.6" fill="#7f9c6b" />
    <ellipse cx="27" cy="40.6" rx="3.2" ry="1.6" fill="#7f9c6b" />
    <ellipse cx="20" cy="29" rx="8.4" ry="5.6" fill="#9bbb84" />
    <circle cx="14.6" cy="25" r="3" fill="#9bbb84" />
    <circle cx="25.4" cy="25" r="3" fill="#9bbb84" />
    <circle cx="14.6" cy="24.8" r="1.4" fill="#2b1b14" />
    <circle cx="25.4" cy="24.8" r="1.4" fill="#2b1b14" />
    <circle cx="14.2" cy="24.3" r="0.45" fill="#fff" />
    <circle cx="25" cy="24.3" r="0.45" fill="#fff" />
    <path d="M15 30.6q5 2.6 10 0" fill="none" stroke="#4e6a40" stroke-width="0.8" stroke-linecap="round" />
    <ellipse cx="13.4" cy="30" rx="1.4" ry="0.8" fill="#f0a3a3" opacity="0.6" />
    <ellipse cx="26.6" cy="30" rx="1.4" ry="0.8" fill="#f0a3a3" opacity="0.6" />
    <path d="M14 36q6 3 12 0" fill="none" stroke="#7f9c6b" stroke-width="0.7" />
  {:else if id === 'daruma'}
    <ellipse cx="20" cy="30.5" rx="11" ry="11.5" fill="#d6324a" />
    <ellipse cx="16" cy="25" rx="3" ry="5" fill="#ffffff2a" />
    <ellipse cx="20" cy="27.5" rx="7" ry="6" fill="#fff2e0" />
    <path d="M14.4 24.4q2.6-2 5.2 0M20.4 24.4q2.6-2 5.2 0" fill="none" stroke="#111" stroke-width="1.1" stroke-linecap="round" />
    <!-- One eye painted in, as when a wish is made; the other waits for it to come true. -->
    <circle cx="17.2" cy="27.4" r="1.6" fill="#111" />
    <circle cx="22.8" cy="27.4" r="1.6" fill="#fff" stroke="#111" stroke-width="0.6" />
    <path d="M17.4 30.8q2.6 1.6 5.2 0" fill="none" stroke="#111" stroke-width="0.8" stroke-linecap="round" />
    <path d="M14.5 36.5q5.5 3.2 11 0" fill="none" stroke="#ffcf3f" stroke-width="1.3" stroke-linecap="round" />
    <path d="M17 38.6q3 1.4 6 0" fill="none" stroke="#ffcf3f" stroke-width="0.9" stroke-linecap="round" />
  {:else if id === 'bamboo'}
    <path d="M14 42V12M21 42V4M28 42V15" stroke-width="3.2" stroke-linecap="round" fill="none" stroke="#78b545" />
    <path d="M21 42V4" stroke-width="1" fill="none" stroke="#9ad06a" opacity="0.7" transform="translate(-0.7 0)" />
    <path d="M12.4 20h3.2M12.4 30h3.2M19.4 12h3.2M19.4 22h3.2M19.4 32h3.2M26.4 24h3.2M26.4 34h3.2" stroke="#4f8a2e" stroke-width="0.8" />
    <path d="M21 12q6-4 11-2q-5 3.4-11 2ZM21 22q-6-4.4-11-2.6q5 3.6 11 2.6ZM14 20q-5-3-9-1q4 3 9 1ZM28 24q5-3.6 9-2q-4 3.4-9 2ZM21 5q4-4 8-3.4q-3 3.4-8 3.4Z" fill="#4f9a3a" />
    <path d="M10 42q2-4 4-0M25 42q2-3.6 4 0" fill="#5aa84a" />
  {:else if id === 'chime'}
    <path d="M11 42V7h17" fill="none" stroke="#b9a25a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M9.8 18h2.4M9.8 30h2.4" stroke="#8c7a3c" stroke-width="0.8" />
    <path d="M26.5 8v4.5" stroke="#555" stroke-width="0.5" />
    <g class="chime-swing">
      <path d="M21 21q0-8.6 5.5-8.6t5.5 8.6Z" fill="#cfeeff" stroke="#7fb8db" stroke-width="0.6" />
      <circle cx="24.4" cy="17.4" r="1.2" fill="#e0475a" />
      <circle cx="28.4" cy="16.6" r="1" fill="#4f8fe0" />
      <path d="M26.5 21v3" stroke="#555" stroke-width="0.5" />
      <rect x="24.6" y="24" width="3.8" height="10" rx="0.4" fill="#ff9ec0" />
      <path d="M25.6 26.5h1.8M25.6 28.5h1.8M25.6 30.5h1.2" stroke="#c4587a" stroke-width="0.5" />
    </g>
  {:else if id === 'cat'}
    <ellipse cx="20" cy="34.5" rx="9.4" ry="8" fill="#fffaf0" stroke="#0002" stroke-width="0.5" />
    <ellipse cx="25" cy="34" rx="3" ry="3.6" fill="#2b2b2b" opacity="0.85" />
    <path d="M27 23q3.5-2 2.6-8" fill="none" stroke="#fffaf0" stroke-width="4" stroke-linecap="round" />
    <ellipse cx="29.6" cy="14.6" rx="2.8" ry="3.4" fill="#fffaf0" stroke="#0002" stroke-width="0.5" />
    <path d="M14 15.5L14.4 9L19 13.6ZM26 15.5L25.6 9L21 13.6Z" fill="#fffaf0" stroke="#0002" stroke-width="0.5" />
    <path d="M15 14.4L15.3 11L17.6 13.4ZM25 14.4L24.7 11L22.4 13.4Z" fill="#ffb3bf" />
    <circle cx="20" cy="21" r="8" fill="#fffaf0" stroke="#0002" stroke-width="0.5" />
    <path d="M13.4 18q1.6-4 5-4.6q-3 3-5 4.6Z" fill="#f29b38" />
    <path d="M15.8 21q1.2-1.3 2.4 0M21.8 21q1.2-1.3 2.4 0" fill="none" stroke="#2b1b14" stroke-width="0.8" stroke-linecap="round" />
    <path d="M19.3 23.2h1.4l-0.7 0.9Z" fill="#f08a9a" />
    <path d="M18.6 24.6q1.4 1 2.8 0" fill="none" stroke="#2b1b14" stroke-width="0.5" />
    <path d="M11.5 22.6l4 0.6M11.6 25l4-0.4M28.5 22.6l-4 0.6M28.4 25l-4-0.4" stroke="#0005" stroke-width="0.4" />
    <path d="M13.2 27.4q6.8 3.6 13.6 0" fill="none" stroke="#d6324a" stroke-width="1.8" stroke-linecap="round" />
    <circle cx="20" cy="30" r="1.7" fill="#ffcf3f" stroke="#c4900f" stroke-width="0.4" />
    <ellipse cx="20" cy="37.4" rx="4.4" ry="2.8" fill="#ffcf3f" stroke="#c4900f" stroke-width="0.5" />
    <path d="M18.4 37.4h3.2" stroke="#c4900f" stroke-width="0.5" />
  {:else if id === 'bonsai'}
    <path d="M20.5 33C18 28 23.5 26 21.5 21C20 17.5 15.5 18 13.5 15" fill="none" stroke="#6b4a2e" stroke-width="2.6" stroke-linecap="round" />
    <path d="M21.5 24.5C24.5 23.5 26.5 20.5 28.5 19.4" fill="none" stroke="#6b4a2e" stroke-width="1.8" stroke-linecap="round" />
    <ellipse cx="13.5" cy="13.6" rx="6.4" ry="3.6" fill="#3f8a32" />
    <ellipse cx="28.6" cy="17.6" rx="5.6" ry="3.2" fill="#3f8a32" />
    <ellipse cx="21.5" cy="9.6" rx="6.6" ry="3.8" fill="#3f8a32" />
    <ellipse cx="12.6" cy="12.6" rx="3.6" ry="1.6" fill="#5aa84a" />
    <ellipse cx="28" cy="16.6" rx="3" ry="1.4" fill="#5aa84a" />
    <ellipse cx="20.6" cy="8.4" rx="3.8" ry="1.7" fill="#5aa84a" />
    <rect x="8" y="32.4" width="24" height="2.6" rx="1" fill="#335d8f" />
    <path d="M9.4 35H30.6L28.6 41H11.4Z" fill="#3f6fa8" />
    <path d="M12 41.2h3M25 41.2h3" stroke="#264a73" stroke-width="1.2" />
  {:else if id === 'lantern'}
    <rect x="12" y="37" width="16" height="5" rx="1" fill="#8f8f87" />
    <rect x="17" y="27" width="6" height="10.5" fill="#a9a9a0" />
    <rect x="11.5" y="24.6" width="17" height="3" rx="1" fill="#8f8f87" />
    <rect x="13.6" y="16" width="12.8" height="8.8" fill="#b3b3aa" />
    <rect x="16.6" y="17.8" width="6.8" height="5.4" fill="#ffd76a" />
    <rect x="16.6" y="17.8" width="6.8" height="5.4" fill="#fff3b0" class="lantern-glow" />
    <path d="M19.6 17.8v5.4" stroke="#b3b3aa" stroke-width="0.6" />
    <path d="M5.5 16.6L20 8.4L34.5 16.6Q20 13.8 5.5 16.6Z" fill="#8a8a82" />
    <circle cx="20" cy="7.2" r="2.3" fill="#9a9a92" />
    <path d="M13 38.5h14" stroke="#7a7a72" stroke-width="0.5" />
  {:else if id === 'torii'}
    <rect x="10" y="12" width="3.4" height="28" fill="#d8452f" />
    <rect x="26.6" y="12" width="3.4" height="28" fill="#d8452f" />
    <rect x="9.4" y="38.6" width="4.6" height="3.4" fill="#2b1b14" />
    <rect x="26" y="38.6" width="4.6" height="3.4" fill="#2b1b14" />
    <rect x="6.4" y="17.4" width="27.2" height="2.8" fill="#d8452f" />
    <rect x="18.8" y="12" width="2.4" height="5.4" fill="#c23a26" />
    <rect x="5.4" y="10" width="29.2" height="2.6" fill="#c23a26" />
    <path d="M2.6 9.8Q20 12.6 37.4 9.8L36.4 6.6Q20 9.2 3.6 6.6Z" fill="#2b1b14" />
  {/if}
</svg>
