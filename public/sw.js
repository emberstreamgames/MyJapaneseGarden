// Offline support for the installed app. Production only (registered in main.ts).
// The page is network-first so a new deploy shows up on the next online launch;
// hashed assets are cache-first since their names change whenever their content does.
const CACHE = 'genki-grow-v1'
const SHELL = ['./', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png']

const scope = new URL(self.registration.scope)

// Hashed files the given index.html loads (one JS bundle and one stylesheet today)
const assetsIn = (html) =>
  [...html.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+)"/g)].map((m) => new URL(m[1], scope).href)

// Cache the page plus its assets, and drop assets from older builds
async function refresh(res) {
  const cache = await caches.open(CACHE)
  const html = await res.text()
  const assets = assetsIn(html)
  await cache.addAll(assets)
  await cache.put(scope.href, new Response(html, { headers: { 'Content-Type': 'text/html' } }))
  for (const req of await cache.keys()) {
    if (req.url.includes('/assets/') && !assets.includes(req.url)) await cache.delete(req)
  }
}

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE)
    await cache.addAll(SHELL.map((p) => new URL(p, scope).href))
    await refresh(await fetch(scope.href, { cache: 'no-cache' }))
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key)
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || !req.url.startsWith(scope.href)) return

  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const res = await fetch(req, { cache: 'no-cache' })
        if (res.ok) e.waitUntil(refresh(res.clone()).catch(() => {}))
        return res
      } catch {
        return (await caches.match(scope.href)) || Response.error()
      }
    })())
    return
  }

  e.respondWith((async () => {
    const hit = await caches.match(req)
    if (hit) return hit
    const res = await fetch(req)
    if (res.ok) {
      const copy = res.clone()
      e.waitUntil(caches.open(CACHE).then((c) => c.put(req, copy)))
    }
    return res
  })())
})
