import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  plugins: [svelte()],
  // GitHub Pages serves the site from /<repo>/ (build and preview). Dev stays at / for the launchers.
  // Set BASE_PATH=/ for a custom domain or another host.
  base: command === 'build' || isPreview ? (process.env.BASE_PATH ?? '/GenkiGrow/') : '/',
  server: { host: true, port: 5173 }, // host: true exposes the dev server on the LAN for phone testing
}))
