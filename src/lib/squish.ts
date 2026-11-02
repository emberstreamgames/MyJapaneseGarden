// Squishy buttons wobble once when let go. Pressing is plain CSS (:active); the let-go needs a nudge
// from here, because CSS has no "just released". Only the class changes: replacing the element
// would lose the click that follows the release.
const SQUISHY = '.primary, .choice'

export function squishOnRelease() {
  document.addEventListener('pointerup', (e) => {
    const el = (e.target as Element | null)?.closest?.(SQUISHY)
    if (!(el instanceof HTMLElement) || (el as HTMLButtonElement).disabled) return
    el.classList.remove('boing')
    void el.offsetWidth // restart the animation on a second tap
    el.classList.add('boing')
  })
  document.addEventListener('animationend', (e) => {
    if (e.animationName === 'boing') (e.target as Element).classList.remove('boing')
  })
}
