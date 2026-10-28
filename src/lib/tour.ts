// The new-player tutorial's steps, in order. A step ends when the player does what it asks
// (store.svelte.ts tourDid), or taps Next on the ones that only explain. Tour.svelte shows them.
export const TOUR_STEPS = ['hello', 'hud', 'visitor', 'ant', 'weed', 'plant', 'shop', 'shop-visit', 'water', 'quiz'] as const

export type TourStep = (typeof TOUR_STEPS)[number]

// null once the last step is done.
export const nextStep = (s: TourStep): TourStep | null => TOUR_STEPS[TOUR_STEPS.indexOf(s) + 1] ?? null

export const normalizeTour = (v: unknown): TourStep | null => (TOUR_STEPS.includes(v as TourStep) ? (v as TourStep) : null)
