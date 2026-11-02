import { mount } from 'svelte'
import '@fontsource/zen-maru-gothic/500.css'
import '@fontsource/zen-maru-gothic/700.css'
import './app.css'
import App from './App.svelte'
import { squishOnRelease } from './lib/squish'

const app = mount(App, {
  target: document.getElementById('app')!,
})

squishOnRelease()

// Offline support and home-screen install. Skipped in dev so Vite's hot reload isn't cached.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
}

// Ask the browser not to clear the save when space runs low. Refusal changes nothing.
navigator.storage?.persist?.().catch(() => {})

export default app
