import type { Species } from './garden'

// Shared geometry and per-species palettes for the plant sprites (100x100 viewBox, soil at y=86).

export const GROUND = 86
// Where the stem ends for each stage (index = stage; 0 is unused). Flowers are centred here.
export const STEM_TOP = [GROUND, 86, 77, 66, 52, 40, 36, 36]
// Pairs of leaves along the stem for each stage.
export const LEAF_PAIRS = [0, 0, 0, 1, 2, 3, 3, 3]

export interface Layer {
  n: number // petal count
  rot: number // angle of the first petal, degrees (0 points up)
  color: string
  shape: 'oval' | 'point'
  off?: number // oval: distance from the centre to the petal's centre
  rx?: number
  ry?: number
  w?: number // point: half width
  h?: number // point: length
}

export interface Art {
  layers: Layer[]
  center?: { r: number; color: string }
  bud: string // colour of the closed bud
  custom?: 'tulip' | 'lavender' | 'hydrangea' // heads drawn by hand instead of from layers
}

export const ART: Record<Species, Art> = {
  sakura: {
    layers: [{ n: 5, rot: 0, shape: 'oval', off: 10, rx: 7.5, ry: 10.5, color: '#ffb7d1' }],
    center: { r: 4, color: '#ff6f9f' },
    bud: '#ff9ec0',
  },
  tulip: { layers: [], bud: '#e8435a', custom: 'tulip' },
  sunflower: {
    layers: [
      { n: 16, rot: 0, shape: 'oval', off: 14, rx: 3.6, ry: 10, color: '#ffb800' },
      { n: 16, rot: 11, shape: 'oval', off: 12, rx: 3.4, ry: 9, color: '#ffd23f' },
    ],
    center: { r: 9, color: '#6b3f1d' },
    bud: '#e0a100',
  },
  marigold: {
    layers: [
      { n: 11, rot: 0, shape: 'oval', off: 11, rx: 6.5, ry: 9, color: '#f08a00' },
      { n: 9, rot: 20, shape: 'oval', off: 8, rx: 5.5, ry: 7.5, color: '#ffab1f' },
    ],
    center: { r: 4.5, color: '#d96b00' },
    bud: '#f08a00',
  },
  lotus: {
    layers: [
      { n: 5, rot: -72, shape: 'point', w: 8, h: 26, color: '#f2a6c4' },
      { n: 3, rot: -36, shape: 'point', w: 8, h: 24, color: '#ff8fb8' },
      { n: 1, rot: 0, shape: 'point', w: 7, h: 22, color: '#ffc2d9' },
    ],
    bud: '#f58bb4',
  },
  iris: {
    layers: [
      { n: 3, rot: 60, shape: 'oval', off: 10, rx: 8, ry: 12, color: '#9b7bff' },
      { n: 3, rot: 0, shape: 'oval', off: 9, rx: 6, ry: 11, color: '#5b3fd0' },
    ],
    center: { r: 3, color: '#ffd23f' },
    bud: '#6d4fe0',
  },
  daisy: {
    layers: [{ n: 13, rot: 0, shape: 'oval', off: 12, rx: 3.4, ry: 9.5, color: '#ffffff' }],
    center: { r: 6.5, color: '#ffc61a' },
    bud: '#e9eef8',
  },
  poppy: {
    layers: [
      { n: 4, rot: 45, shape: 'oval', off: 9, rx: 11, ry: 11, color: '#d62839' },
      { n: 4, rot: 0, shape: 'oval', off: 7, rx: 9, ry: 9, color: '#ef476f' },
    ],
    center: { r: 4, color: '#2b2d42' },
    bud: '#d62839',
  },
  lavender: { layers: [], bud: '#9a8fd0', custom: 'lavender' },
  hydrangea: { layers: [], bud: '#8fb0e8', custom: 'hydrangea' },
  starter: {
    layers: [{ n: 6, rot: 0, shape: 'oval', off: 10, rx: 6.5, ry: 9.5, color: '#ffe9a8' }],
    center: { r: 4.5, color: '#ff9f5a' },
    bud: '#ffd873',
  },
}

// Hand-placed bits for the custom heads, relative to the head centre.
export const LAVENDER_BUDS: [number, number][] = [
  [0, -26], [-3.5, -20], [3.5, -20], [-4, -14], [4, -14], [-4.5, -8], [4.5, -8], [-4, -2], [4, -2], [0, -4],
]

export const HYDRANGEA_BLOOMS: { x: number; y: number; r: number; c: string }[] = [
  { x: 0, y: -12, r: 6, c: '#6f9cf0' },
  { x: -10, y: -6, r: 6, c: '#8fb0f5' },
  { x: 10, y: -6, r: 6, c: '#7c8ff0' },
  { x: -6, y: 4, r: 6, c: '#a9a2f5' },
  { x: 6, y: 4, r: 6, c: '#6f9cf0' },
  { x: 0, y: -2, r: 6.5, c: '#9fc0f7' },
  { x: -15, y: 2, r: 5, c: '#a9a2f5' },
  { x: 15, y: 2, r: 5, c: '#8fb0f5' },
  { x: 0, y: 11, r: 5, c: '#7c8ff0' },
]
