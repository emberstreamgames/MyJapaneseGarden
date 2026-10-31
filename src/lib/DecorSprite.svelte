<script lang="ts">
  // Lawn decoration art in a 40x44 view, standing on the ground point (20, 42). Upgrades (decor.ts):
  // tier 1 adds a touch of its own over the plain art, tier 2 turns it all to gold and makes it glint.
  let { id, tier = 0 }: { id: string; tier?: number } = $props()
</script>

<svg class="decor-art" class:golden={tier >= 2} viewBox="0 0 40 44" aria-hidden="true">
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
  {:else if id === 'rock'}
    <path d="M7 41.4Q5.4 33 11 28.4Q16 23.6 23.4 24.6Q31 25.6 33.4 32.4Q35 38.4 32 41.4Z" fill="#8b93a8" />
    <path d="M11 28.4Q16 23.6 23.4 24.6Q31 25.6 33.4 32.4Q26 29.6 19 31.4Q12.4 33 7.4 37.6Q7.6 31.6 11 28.4Z" fill="#a9b1c6" />
    <path d="M13.6 28.6Q17.6 26 22.4 26.6Q19.4 28.4 15.6 30.6Z" fill="#dfe5f5" />
    <path d="M19 31.4Q26 29.6 33.4 32.4M19 31.4L21.4 41.4" fill="none" stroke="#6f7790" stroke-width="0.6" />
    <!-- Glints: what makes it shiny. They twinkle in turn. -->
    <path class="rock-glint" d="M16 22.4l0.9 2.6 2.6 0.9-2.6 0.9-0.9 2.6-0.9-2.6-2.6-0.9 2.6-0.9Z" fill="#fff" />
    <path class="rock-glint" d="M29.6 26l0.6 1.7 1.7 0.6-1.7 0.6-0.6 1.7-0.6-1.7-1.7-0.6 1.7-0.6Z" fill="#fff6c8" />
    <path class="rock-glint" d="M24.6 34.6l0.5 1.4 1.4 0.5-1.4 0.5-0.5 1.4-0.5-1.4-1.4-0.5 1.4-0.5Z" fill="#fff" />
  {:else if id === 'torii'}
    <rect x="10" y="12" width="3.4" height="28" fill="#d8452f" />
    <rect x="26.6" y="12" width="3.4" height="28" fill="#d8452f" />
    <rect x="9.4" y="38.6" width="4.6" height="3.4" fill="#2b1b14" />
    <rect x="26" y="38.6" width="4.6" height="3.4" fill="#2b1b14" />
    <rect x="6.4" y="17.4" width="27.2" height="2.8" fill="#d8452f" />
    <rect x="18.8" y="12" width="2.4" height="5.4" fill="#c23a26" />
    <rect x="5.4" y="10" width="29.2" height="2.6" fill="#c23a26" />
    <path d="M2.6 9.8Q20 12.6 37.4 9.8L36.4 6.6Q20 9.2 3.6 6.6Z" fill="#2b1b14" />
  {:else if id === 'mushroom'}
    <path d="M16 32q-1 5 -1.6 9.4h7q-1-5-1.4-9.4Z" fill="#f3e6cf" />
    <path d="M6 32Q7 16 18 16T30 32Q18 35.4 6 32Z" fill="#d6324a" />
    <circle cx="13" cy="25" r="2.2" fill="#fff4e4" />
    <circle cx="21" cy="21.4" r="2.6" fill="#fff4e4" />
    <circle cx="25" cy="28.4" r="1.7" fill="#fff4e4" />
    <path d="M28 37.4q-0.4 2-0.6 4h4q-0.2-2-0.6-4Z" fill="#f3e6cf" />
    <path d="M24 37.6Q24.6 30.6 29.6 30.6T35 37.6Q29.6 39 24 37.6Z" fill="#e8a13a" />
    <circle cx="28" cy="34.4" r="0.9" fill="#fff4e4" />
  {:else if id === 'teru'}
    <path d="M9 42V8h22" fill="none" stroke="#8a6a44" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M23 8v5" stroke="#555" stroke-width="0.6" />
    <path d="M18 22L13.4 34.6Q23 37.4 32.6 34.6L28 22Z" fill="#fbfbf6" stroke="#0002" stroke-width="0.5" />
    <circle cx="23" cy="18" r="6.4" fill="#fff" stroke="#0002" stroke-width="0.5" />
    <path d="M17 23.4q6 2.2 12 0" fill="none" stroke="#d6324a" stroke-width="1" />
    <circle cx="20.8" cy="17.4" r="0.8" fill="#2b1b14" />
    <circle cx="25.2" cy="17.4" r="0.8" fill="#2b1b14" />
    <path d="M21 20q2 1.6 4 0" fill="none" stroke="#2b1b14" stroke-width="0.6" stroke-linecap="round" />
  {:else if id === 'kokeshi'}
    <path d="M13.6 41.4Q12.4 30 15.4 22H24.6Q27.6 30 26.4 41.4Z" fill="#c8392b" />
    <path d="M14 30h12M13.6 36h12.8" stroke="#ffcf3f" stroke-width="1.1" />
    <circle cx="17" cy="33" r="1.1" fill="#fff4e4" />
    <circle cx="23" cy="33" r="1.1" fill="#fff4e4" />
    <circle cx="20" cy="39" r="1.1" fill="#fff4e4" />
    <circle cx="20" cy="14.6" r="9" fill="#f7e2c0" />
    <path d="M11 14.6A9 9 0 0 1 29 14.6Q26 9.6 20 9.6T11 14.6Z" fill="#1c1410" />
    <path d="M16 16.6q1.2-1 2.4 0M21.6 16.6q1.2-1 2.4 0" fill="none" stroke="#1c1410" stroke-width="0.8" stroke-linecap="round" />
    <path d="M19 20.4q1 0.8 2 0" fill="none" stroke="#c8392b" stroke-width="0.9" stroke-linecap="round" />
  {:else if id === 'koinobori'}
    <path d="M9 42V3" stroke="#8a6a44" stroke-width="2" stroke-linecap="round" />
    <circle cx="9" cy="3" r="1.6" fill="#ffcf3f" />
    <g class="koi-wave">
      <path d="M10 7Q22 3.6 32 7L36.6 5.4L34.6 10.4L37 15L32 13.4Q22 16.4 10 13Z" fill="#2f5fb3" />
      <path d="M16 7v6M21 6.4v7.2M26 6.4v7.2" stroke="#9cc0f0" stroke-width="0.8" />
      <circle cx="13.4" cy="9.6" r="1.4" fill="#fff" />
      <circle cx="13.4" cy="9.6" r="0.7" fill="#111" />
      <path d="M10 18Q20 15 29 18L33 16.6L31.4 21L33.4 25L29 23.6Q20 26.4 10 23.4Z" fill="#d6324a" />
      <path d="M15.6 18v5.6M20 17.6v6.4M24.4 17.6v6.2" stroke="#ffb3bf" stroke-width="0.8" />
      <circle cx="13" cy="20.6" r="1.3" fill="#fff" />
      <circle cx="13" cy="20.6" r="0.6" fill="#111" />
    </g>
  {:else if id === 'wagasa'}
    <path d="M21 13L18 41.6" stroke="#6b4a2e" stroke-width="1.4" stroke-linecap="round" />
    <path d="M3 25Q6 9 21 8Q36 9 37 25Q31.5 21.6 27 25Q21 21.6 15 25Q9 21.6 3 25Z" fill="#d6324a" />
    <path d="M21 8Q14 13 9.4 22.8M21 8Q19 15 15 24.6M21 8Q23 15 27 24.6M21 8Q28 13 32.6 22.8" fill="none" stroke="#fff4e4" stroke-width="0.7" opacity="0.8" />
    <path d="M9 19q12-5.4 24 0" fill="none" stroke="#ffcf3f" stroke-width="1" />
    <circle cx="21" cy="7.6" r="1.3" fill="#2b1b14" />
  {:else if id === 'tanuki'}
    <path d="M8 41.4Q7 26 20 25.6T32 41.4Z" fill="#8c6a4a" />
    <ellipse cx="20" cy="33.6" rx="8.4" ry="7.6" fill="#f0e0c4" />
    <circle cx="20" cy="17.6" r="9" fill="#8c6a4a" />
    <circle cx="12.6" cy="10" r="2.6" fill="#6e5238" />
    <circle cx="27.4" cy="10" r="2.6" fill="#6e5238" />
    <ellipse cx="15.6" cy="16.6" rx="3.2" ry="2.6" fill="#3a2a1e" />
    <ellipse cx="24.4" cy="16.6" rx="3.2" ry="2.6" fill="#3a2a1e" />
    <circle cx="15.8" cy="16.4" r="1" fill="#fff" />
    <circle cx="24.2" cy="16.4" r="1" fill="#fff" />
    <ellipse cx="20" cy="21.6" rx="4.4" ry="3.2" fill="#f0e0c4" />
    <ellipse cx="20" cy="20.4" rx="1.3" ry="0.9" fill="#2b1b14" />
    <path d="M18 23q2 1.2 4 0" fill="none" stroke="#2b1b14" stroke-width="0.6" stroke-linecap="round" />
  {:else if id === 'kitsune'}
    <rect x="9" y="37" width="22" height="5" rx="1" fill="#8f8f87" />
    <path d="M28 37Q36 30 31 19Q29.4 25 26 28Z" fill="#fbf4e6" stroke="#0002" stroke-width="0.5" />
    <path d="M13.6 37Q13 24 17 17H23Q27 24 26.4 37Z" fill="#fbf4e6" stroke="#0002" stroke-width="0.5" />
    <path d="M14 9.6L12.6 2.6L18 6.4M26 9.6L27.4 2.6L22 6.4" fill="#fbf4e6" stroke="#0002" stroke-width="0.5" />
    <path d="M12.8 8Q20 3.4 27.2 8L20 19Z" fill="#fbf4e6" stroke="#0002" stroke-width="0.5" />
    <path d="M14.4 5.4l-0.5-1.8 2 1.2ZM25.6 5.4l0.5-1.8-2 1.2Z" fill="#e8574a" />
    <path d="M15.6 9.6q1.4-1 2.8 0M21.6 9.6q1.4-1 2.8 0" fill="none" stroke="#2b1b14" stroke-width="0.8" stroke-linecap="round" />
    <circle cx="20" cy="18" r="1" fill="#2b1b14" />
    <path d="M14.4 21.6H25.6L20 28.6Z" fill="#d6324a" />
  {:else if id === 'shishi'}
    <path d="M8 41.6h24l-2.6-5H10.6Z" fill="#8f8f87" />
    <ellipse cx="29" cy="36.6" rx="5" ry="1.6" fill="#7fb8db" />
    <path d="M10 41V25M16 41V25" stroke="#b9a25a" stroke-width="2" stroke-linecap="round" />
    <path d="M9 30h8" stroke="#6b4a2e" stroke-width="1" />
    <path d="M32 41V16" stroke="#9fb54e" stroke-width="3" stroke-linecap="round" />
    <path d="M32 18L23 19.6" stroke="#9fb54e" stroke-width="2.2" stroke-linecap="round" />
    <path d="M23 21v3" stroke="#7fb8db" stroke-width="0.9" stroke-linecap="round" />
    <g class="shishi-tip">
      <path d="M4.6 34.4L28 20.6" stroke="#7f9a3a" stroke-width="4" stroke-linecap="round" />
      <path d="M26.4 21.6L24.6 22.6" stroke="#5f7a2a" stroke-width="4" />
    </g>
  {:else if id === 'pond'}
    <ellipse cx="20" cy="33.6" rx="18.6" ry="8.6" fill="#8f8f87" />
    <ellipse cx="20" cy="33" rx="16.4" ry="7" fill="#3f8ec0" />
    <ellipse cx="17" cy="31.4" rx="9" ry="3" fill="#7fc2e6" opacity="0.5" />
    <path d="M9 33.6q3.4-2.6 6-0.6l2.6-1.2-0.8 2 0.8 2-2.6-1.2q-2.6 1.6-6-1Z" fill="#fff4e4" />
    <path d="M10.6 33.4q1.4-0.8 2.4 0" fill="none" stroke="#e8574a" stroke-width="1.2" />
    <path d="M30 35.4q-3.2-2.2-5.8-0.4l-2.4-1 0.6 1.8-0.6 1.8 2.4-1q2.4 1.4 5.8-1.2Z" fill="#f29b38" />
    <ellipse cx="27" cy="29.6" rx="3" ry="1.2" fill="#5aa84a" />
  {:else if id === 'bridge'}
    <path d="M3 41.6Q20 13 37 41.6L33 41.6Q20 22.6 7 41.6Z" fill="#d8452f" />
    <path d="M1.6 33Q20 8 38.4 33" fill="none" stroke="#c23a26" stroke-width="1.8" stroke-linecap="round" />
    <path d="M9 41V25.6M15 35V19.4M20 31V17.4M25 35V19.4M31 41V25.6" stroke="#c23a26" stroke-width="1.4" />
    <path d="M12 34.6Q20 25.4 28 34.6" fill="none" stroke="#2b1b14" stroke-width="0.7" opacity="0.4" />
  {:else if id === 'sakura'}
    <path d="M19 41.6Q21 31 18 24Q16 19 11 16M18.8 27Q23 22 28 20" fill="none" stroke="#5a3a2a" stroke-width="3" stroke-linecap="round" />
    <circle cx="12" cy="14" r="8" fill="#ffc4da" />
    <circle cx="28" cy="16" r="8.6" fill="#ffb3cf" />
    <circle cx="20" cy="9.4" r="8.4" fill="#ffd2e2" />
    <circle cx="19" cy="17.4" r="6.4" fill="#ffc4da" />
    <path d="M9 11.4h0.1M15 8h0.1M22 6.4h0.1M28 12h0.1M25 18.4h0.1M12 18h0.1M31 18h0.1M18 14h0.1" stroke="#ff8cb5" stroke-width="1.6" stroke-linecap="round" />
    <ellipse cx="11" cy="39.6" rx="1.6" ry="0.7" fill="#ffc4da" />
    <ellipse cx="29" cy="40.4" rx="1.6" ry="0.7" fill="#ffd2e2" />
  {:else if id === 'pagoda'}
    <rect x="12" y="38.6" width="16" height="3.4" fill="#8f8f87" />
    <rect x="14.4" y="31" width="11.2" height="8" fill="#b6442f" />
    <rect x="15.4" y="23.4" width="9.2" height="5" fill="#b6442f" />
    <rect x="16.4" y="16.4" width="7.2" height="4.4" fill="#b6442f" />
    <rect x="17.4" y="10.4" width="5.2" height="3.6" fill="#b6442f" />
    <path d="M7 32Q20 28 33 32L28 28H12Z" fill="#3a4a52" />
    <path d="M9 24.6Q20 21 31 24.6L27 21H13Z" fill="#3a4a52" />
    <path d="M10.6 17.4Q20 14.4 29.4 17.4L26 14.4H14Z" fill="#3a4a52" />
    <path d="M12.4 11.4Q20 8.6 27.6 11.4L24.6 8.6H15.4Z" fill="#3a4a52" />
    <path d="M20 9V2" stroke="#8a7a3c" stroke-width="1" stroke-linecap="round" />
    <path d="M18.4 34h3.2v5h-3.2Z" fill="#2b1b14" />
  {/if}

  {#if tier >= 1}
    {#if id === 'frog'}
      <!-- A lily-pad hat with a flower on it. -->
      <ellipse cx="20" cy="22.6" rx="7" ry="2" fill="#4f9a3a" />
      <circle cx="20" cy="20.8" r="1.8" fill="#ff9ec0" />
      <circle cx="20" cy="20.8" r="0.7" fill="#ffcf3f" />
    {:else if id === 'daruma'}
      <!-- The wish came true, so the second eye is painted in. -->
      <circle cx="22.8" cy="27.4" r="1.6" fill="#111" />
      <path d="M12 14q8-5 16 0" fill="none" stroke="#ffcf3f" stroke-width="1.3" stroke-linecap="round" transform="translate(0 7)" />
    {:else if id === 'bamboo'}
      <!-- Paper wishes, as hung at Tanabata. -->
      <rect x="23.4" y="13" width="2.4" height="6" fill="#ff9ec0" />
      <rect x="15.4" y="22" width="2.4" height="6" fill="#ffcf3f" />
      <rect x="29.6" y="26" width="2.4" height="6" fill="#7fb8ff" />
    {:else if id === 'chime'}
      <path d="M17 7.6v4" stroke="#555" stroke-width="0.5" />
      <path d="M14 18q0-6.6 3-6.6t3 6.6Z" fill="#ffe29a" stroke="#c4900f" stroke-width="0.5" />
      <rect x="16" y="19" width="2" height="6" rx="0.3" fill="#7fb8ff" />
    {:else if id === 'cat'}
      <!-- A pile of gold coins at its paws. -->
      <ellipse cx="11" cy="40" rx="4.4" ry="2" fill="#ffcf3f" stroke="#c4900f" stroke-width="0.5" />
      <ellipse cx="12" cy="37.8" rx="3.6" ry="1.7" fill="#ffdc6b" stroke="#c4900f" stroke-width="0.5" />
      <ellipse cx="30" cy="40.2" rx="3.6" ry="1.7" fill="#ffcf3f" stroke="#c4900f" stroke-width="0.5" />
    {:else if id === 'bonsai'}
      <!-- In bloom. -->
      <path d="M10 12.6h0.1M15.4 14.6h0.1M17.6 12h0.1M21 7.4h0.1M25.4 10.4h0.1M25.4 17h0.1M30.6 16.4h0.1M28.4 19h0.1" stroke="#ffb3cf" stroke-width="2" stroke-linecap="round" />
    {:else if id === 'lantern'}
      <!-- Moss on the stone, and a warm light. -->
      <circle cx="20" cy="20.5" r="12" fill="#ffd76a" opacity="0.28" />
      <path d="M12 41.6q2-4.4 5.4-2.6q2.6-1.6 3.6 2.6Z" fill="#5aa84a" />
      <path d="M7 15.8q5-1 8-3l-1 3.4Z" fill="#5aa84a" />
    {:else if id === 'torii'}
      <!-- A sacred rope with paper streamers. -->
      <path d="M13.4 22.4Q20 25.6 26.6 22.4" fill="none" stroke="#e8d9a8" stroke-width="1.6" stroke-linecap="round" />
      <path d="M16.4 24v4l1.6-1v3M23 24v4l1.6-1v3" fill="none" stroke="#fff" stroke-width="1" />
    {:else if id === 'rock'}
      <!-- Crystals have grown on top. -->
      <path d="M21 26L19 17l3.6-3.4L26 18l-1.6 8Z" fill="#b8a4ff" stroke="#7a62d6" stroke-width="0.5" />
      <path d="M26 27l-0.6-6.4 2.6-2 2.4 3-1.4 6Z" fill="#d6c9ff" stroke="#7a62d6" stroke-width="0.5" />
    {:else if id === 'mushroom'}
      <path d="M8 41.4v-2.6h2.2v2.6Z" fill="#f3e6cf" />
      <path d="M5.4 38.8q0-4 3.8-4t3.8 4q-3.8 1-7.6 0Z" fill="#d6324a" />
      <circle cx="8.4" cy="37" r="0.7" fill="#fff4e4" />
    {:else if id === 'teru'}
      <circle cx="23" cy="26.2" r="1.7" fill="#ffcf3f" stroke="#c4900f" stroke-width="0.5" />
      <path d="M13 8.6q2 4 0 8M16 8.6q2 3 0 6" fill="none" stroke="#ff9ec0" stroke-width="1" stroke-linecap="round" />
    {:else if id === 'kokeshi'}
      <!-- A flower in her hair. -->
      <circle cx="26" cy="9" r="3" fill="#ff9ec0" />
      <circle cx="26" cy="9" r="1.1" fill="#ffcf3f" />
      <path d="M13.4 24q6.6 3 13.2 0" fill="none" stroke="#fff4e4" stroke-width="1.4" />
    {:else if id === 'koinobori'}
      <!-- A third carp joins the family. -->
      <path d="M10 28Q18 25.6 25 28L28.4 27L27 30.4L28.6 33.4L25 32.4Q18 34.6 10 32Z" fill="#35b06a" />
      <path d="M15 28v4M19 27.6v4.8" stroke="#a8e6c0" stroke-width="0.7" />
      <circle cx="12.6" cy="30" r="1" fill="#fff" />
      <circle cx="12.6" cy="30" r="0.5" fill="#111" />
    {:else if id === 'wagasa'}
      <!-- A paper charm on a tassel. -->
      <path d="M32.6 24v7" stroke="#ffcf3f" stroke-width="0.7" />
      <rect x="30.8" y="30" width="3.6" height="7" rx="0.5" fill="#fff4e4" stroke="#d6324a" stroke-width="0.6" />
      <circle cx="21" cy="14" r="2.6" fill="#ffcf3f" opacity="0.9" />
    {:else if id === 'tanuki'}
      <!-- The straw hat and sake flask of the classic statue. -->
      <path d="M6.6 11.6Q20 3 33.4 11.6Q20 8.4 6.6 11.6Z" fill="#d9b566" stroke="#9c7a33" stroke-width="0.5" />
      <path d="M12 9Q20 0.6 28 9Q20 7.4 12 9Z" fill="#e6c678" stroke="#9c7a33" stroke-width="0.5" />
      <path d="M29 30q-0.4 2-1.6 3.4v5.4h6.6v-5.4Q32.8 32 32.6 30Z" fill="#6b4a2e" stroke="#2b1b14" stroke-width="0.4" />
      <rect x="29" y="28.4" width="3.6" height="1.8" fill="#d6324a" />
    {:else if id === 'kitsune'}
      <!-- A sacred jewel held on the tail. -->
      <circle cx="31.4" cy="16.4" r="2.8" fill="#ffcf3f" stroke="#c4900f" stroke-width="0.5" />
      <path d="M31.4 13.6q2 1.4 0 2.8" fill="none" stroke="#c4900f" stroke-width="0.5" />
      <circle cx="20" cy="24" r="1.1" fill="#ffcf3f" />
    {:else if id === 'shishi'}
      <!-- Iris by the water. -->
      <path d="M25 41V33M28 41v-5" stroke="#4f9a3a" stroke-width="1" />
      <path d="M25 33q-2-2.6 0-4q2 1.4 0 4Z" fill="#7a62d6" />
      <path d="M28 36q-1.6-2 0-3.2q1.6 1.2 0 3.2Z" fill="#a48cf0" />
    {:else if id === 'pond'}
      <!-- A lotus in bloom. -->
      <ellipse cx="13" cy="29" rx="3.4" ry="1.3" fill="#5aa84a" />
      <path d="M13 28.6q-3-0.6-3.4-2.8q2 0 2.6 0.8q0-2.2 0.8-3.2q0.8 1 0.8 3.2q0.6-0.8 2.6-0.8q-0.4 2.2-3.4 2.8Z" fill="#ff9ec0" />
    {:else if id === 'bridge'}
      <!-- Gold caps on the rail posts. -->
      <path d="M9 25.4h0.1M15 19.2h0.1M20 17.2h0.1M25 19.2h0.1M31 25.4h0.1" stroke="#ffcf3f" stroke-width="2.6" stroke-linecap="round" />
    {:else if id === 'sakura'}
      <!-- Full bloom, with a lantern hung from the branch. -->
      <circle cx="33" cy="11" r="4" fill="#ffd2e2" />
      <circle cx="7" cy="17" r="4" fill="#ffd2e2" />
      <path d="M12 22v3" stroke="#555" stroke-width="0.5" />
      <rect x="9.6" y="25" width="4.8" height="5.4" rx="2" fill="#e8574a" />
      <path d="M9.8 27.6h4.4" stroke="#ffcf3f" stroke-width="0.5" />
    {:else if id === 'pagoda'}
      <!-- Lit windows and a ringed spire. -->
      <rect x="17.6" y="24.6" width="4.8" height="2.6" fill="#ffd76a" />
      <rect x="18.2" y="17.4" width="3.6" height="2.2" fill="#ffd76a" />
      <rect x="19" y="11.2" width="2" height="1.8" fill="#ffd76a" />
      <path d="M18.8 4.4h2.4M18.4 6h3.2M18 7.6h4" stroke="#ffcf3f" stroke-width="0.8" stroke-linecap="round" />
    {/if}
  {/if}
  {#if tier >= 2}
    <path class="rock-glint" d="M9 10l0.9 2.6 2.6 0.9-2.6 0.9-0.9 2.6-0.9-2.6-2.6-0.9 2.6-0.9Z" fill="#fff" />
    <path class="rock-glint" d="M32 22l0.7 1.9 1.9 0.7-1.9 0.7-0.7 1.9-0.7-1.9-1.9-0.7 1.9-0.7Z" fill="#fff" />
    <path class="rock-glint" d="M14 33l0.6 1.5 1.5 0.6-1.5 0.6-0.6 1.5-0.6-1.5-1.5-0.6 1.5-0.6Z" fill="#fff" />
  {/if}
</svg>
