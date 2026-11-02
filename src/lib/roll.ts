// Weighted picks for the collections: what hasn't been found yet comes up this many times as often.
export const FAVOUR_NEW = 2

// `r` is a random number in [0, 1). Returns an index into `weights`.
export function pickWeighted(weights: number[], r: number): number {
  let left = r * weights.reduce((a, w) => a + w, 0)
  for (let i = 0; i < weights.length; i++) {
    left -= weights[i]
    if (left < 0) return i
  }
  return weights.length - 1
}
