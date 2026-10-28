// Coins flying from where they were earned to the coin counter (the element marked data-coin-target).
// The coins are already in app.coins; counters show `app.coins - inFlight.coins` so they tick up as
// each coin lands. CoinFlights.svelte draws and times the flights.

export interface Flight {
  id: number
  x: number // viewport point the coins leave from
  y: number
  amount: number
}

export const inFlight = $state({ coins: 0, flights: [] as Flight[] })

let n = 0

export function flyCoins(x: number, y: number, amount: number) {
  if (amount <= 0 || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!document.querySelector('[data-coin-target]')) return
  inFlight.coins += amount
  inFlight.flights.push({ id: ++n, x, y, amount })
}

// From the middle of an element, e.g. the ant or visitor that brought the coins.
export function flyCoinsFrom(el: Element | null | undefined, amount: number) {
  if (!el) return
  const r = el.getBoundingClientRect()
  flyCoins(r.left + r.width / 2, r.top + r.height / 2, amount)
}

// A coin (or the whole flight, if it was cut short) has landed.
export function landed(id: number, amount: number, last: boolean) {
  inFlight.coins = Math.max(0, inFlight.coins - amount)
  if (last) inFlight.flights = inFlight.flights.filter((f) => f.id !== id)
}
