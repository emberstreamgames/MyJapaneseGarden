// The creatures that visit the garden, and the pure rules for the collection of those seen. Tapping
// one logs it. Entries are keyed by creature and look id, never by position, so a look can be cut
// from these lists without shifting anyone's save. CreatureSprite.svelte draws them.

export interface Look {
  id: string // part of the saved key: keep it when renaming
  name: string
  main: string // body, or a butterfly's forewing
  light: string // belly, hindwing or wing membrane
  dark: string // wings, legs, shading
  mark?: string // spots, stripes, patches
  head?: string
  ring?: string // eye colour or eye ring
  cheek?: string
  beak?: string
  style?: string // space-separated pattern and shape options, per creature
  glow?: string // a soft halo, for the special ones
}

export type Move = 'flutter' | 'swoop' | 'hop' // how it arrives: wandering down, in an arc, or along the lawn
export type Call = 'flutter' | 'chirp' | 'buzz' | 'hoot' | 'ribbit' | 'meow' | 'pad' // sfx.ts

export interface CreatureInfo {
  label: string
  jp: string
  move: Move
  flowers: boolean // may settle on an open flower
  call: Call
  view: string // viewBox framing it, for cards. (0, 0) is a flier's centre or a ground creature's feet
  looks: Look[]
}

export const CREATURES = {
  butterfly: {
    label: 'Butterfly',
    jp: 'ちょう',
    move: 'flutter',
    flowers: true,
    call: 'flutter',
    view: '-16 -15 32 29',
    looks: [
      { id: 'cabbage-white', name: 'Cabbage white', main: '#fbfbf6', light: '#eef0e2', dark: '#2b1b14', mark: '#3a3a3a' },
      { id: 'swallowtail', name: 'Swallowtail', main: '#ffd84d', light: '#f5b324', dark: '#2b1b14', mark: '#2b1b14', style: 'bands tails' },
      { id: 'blue', name: 'Common blue', main: '#8fd3ff', light: '#4f8fe0', dark: '#2b1b14', mark: '#ffffff' },
      { id: 'orange-tip', name: 'Orange tip', main: '#ffffff', light: '#f6f1df', dark: '#2b1b14', mark: '#ff8a3d', style: 'tips' },
      { id: 'monarch', name: 'Monarch', main: '#f58a1f', light: '#e9701a', dark: '#2b1b14', mark: '#1f1410', style: 'veins bands dots' },
      { id: 'morpho', name: 'Morpho', main: '#1fa2ff', light: '#1668e0', dark: '#14162e', mark: '#0d1030', style: 'bands', glow: '#6fc8ff' },
      { id: 'peacock', name: 'Peacock', main: '#b5322c', light: '#8e2622', dark: '#2b1b14', mark: '#2f5fc4', style: 'eyes' },
      { id: 'sakura', name: 'Sakura', main: '#ffc4da', light: '#ff9ec0', dark: '#5a2b3c', mark: '#ffffff', style: 'dots' },
      { id: 'glasswing', name: 'Glasswing', main: '#e8f6ff8c', light: '#dff1ff80', dark: '#2b1b14', mark: '#1f1410', style: 'bands' },
      { id: 'moon', name: 'Moon moth', main: '#c9f2c7', light: '#a9e6b4', dark: '#6a5a3a', mark: '#f7e08a', style: 'eyes tails', glow: '#d9ffd0' },
    ],
  },
  dragonfly: {
    label: 'Dragonfly',
    jp: 'とんぼ',
    move: 'flutter',
    flowers: true,
    call: 'buzz',
    view: '-16 -13 32 28',
    looks: [
      { id: 'red', name: 'Red darter', main: '#d8392b', light: '#ffe9d6', dark: '#7a1f18', mark: '#7a1f18' },
      { id: 'blue', name: 'Blue skimmer', main: '#5aa8e6', light: '#dff1ff', dark: '#1f3f66', mark: '#1f3f66' },
      { id: 'emperor', name: 'Emperor', main: '#2f9e5a', light: '#e4f7d8', dark: '#14432a', mark: '#7fd6ff' },
      { id: 'amber', name: 'Amber wing', main: '#d98a1f', light: '#ffd98a', dark: '#6a3f0a', mark: '#6a3f0a' },
      { id: 'black', name: 'Damselfly', main: '#23253f', light: '#3a3d66', dark: '#101124', mark: '#54e0c0', style: 'dark-wings' },
      { id: 'rose', name: 'Rose dasher', main: '#ff5fa0', light: '#ffe0ee', dark: '#8e1f54', mark: '#8e1f54' },
    ],
  },
  bee: {
    label: 'Bee',
    jp: 'はち',
    move: 'flutter',
    flowers: true,
    call: 'buzz',
    view: '-13 -13 26 22',
    looks: [
      { id: 'honey', name: 'Honey bee', main: '#f5b324', light: '#ffd98a', dark: '#2b1b14', mark: '#2b1b14' },
      { id: 'bumble', name: 'Bumblebee', main: '#ffd84d', light: '#ffe58a', dark: '#17120e', mark: '#17120e', style: 'fluffy' },
      { id: 'carpenter', name: 'Carpenter bee', main: '#23232b', light: '#ffd84d', dark: '#101014', mark: '#3a3a4a', style: 'fluffy' },
      { id: 'orchid', name: 'Orchid bee', main: '#2fc488', light: '#7fe8bc', dark: '#0f5a4a', mark: '#1b8f8f', glow: '#7fe8bc' },
      { id: 'mason', name: 'Mason bee', main: '#3f6fd8', light: '#8fb1f5', dark: '#14224f', mark: '#14224f' },
    ],
  },
  ladybug: {
    label: 'Ladybug',
    jp: 'てんとうむし',
    move: 'flutter',
    flowers: true,
    call: 'buzz',
    view: '-13 -12 26 24',
    looks: [
      { id: 'seven', name: 'Seven-spot', main: '#d8322a', light: '#ffffffa0', dark: '#17120e', mark: '#17120e', style: 'seven' },
      { id: 'two', name: 'Two-spot', main: '#17120e', light: '#ffffffa0', dark: '#0d0a08', mark: '#e8392b', style: 'two' },
      { id: 'orange', name: 'Orange', main: '#f58a1f', light: '#ffffffa0', dark: '#3a2010', mark: '#fff3d6', style: 'many' },
      { id: 'pink', name: 'Pink', main: '#ff8fb6', light: '#ffffffa0', dark: '#3a1020', mark: '#3a1020', style: 'seven' },
      { id: 'jewel', name: 'Jewel', main: '#2fa8a0', light: '#ffffffa0', dark: '#0f3a3a', mark: '#ffd84d', style: 'two', glow: '#7fe8d8' },
    ],
  },
  bird: {
    label: 'Bird',
    jp: 'とり',
    move: 'swoop',
    flowers: false,
    call: 'chirp',
    view: '-18 -20 36 23',
    looks: [
      { id: 'white-eye', name: 'White-eye', main: '#9bbf3f', light: '#e9eccd', dark: '#7a9a2a', head: '#a9c94a', ring: '#ffffff' },
      { id: 'sparrow', name: 'Sparrow', main: '#a0714a', light: '#e8dccb', dark: '#6e4a2e', head: '#7a4a2a', cheek: '#2b1b14' },
      { id: 'robin', name: 'Japanese robin', main: '#8a6a4a', light: '#d9d3c7', dark: '#6a4f36', head: '#e0672b', mark: '#e0672b' },
      { id: 'flycatcher', name: 'Blue flycatcher', main: '#2f5fc4', light: '#f4f4f0', dark: '#1f3f8e', head: '#2f6fe0' },
      { id: 'kingfisher', name: 'Kingfisher', main: '#1fa8c9', light: '#f08a3c', dark: '#127a9e', head: '#1b8fb0', cheek: '#f08a3c', style: 'long-beak', beak: '#17120e' },
      { id: 'bullfinch', name: 'Bullfinch', main: '#8d8f9e', light: '#d8d8e0', dark: '#2b2b38', head: '#2b2b38', mark: '#f08a9c', beak: '#17120e' },
      { id: 'tit', name: 'Great tit', main: '#7a8a6a', light: '#f0f0e8', dark: '#4a5a4a', head: '#1f1f26', cheek: '#ffffff', style: 'bib' },
      { id: 'java', name: 'Java sparrow', main: '#8f97a8', light: '#d9c9c9', dark: '#6a7184', head: '#1f1f26', cheek: '#ffffff', beak: '#ff6a6a', ring: '#ff6a6a' },
      { id: 'jay', name: 'Crested jay', main: '#6f8fd8', light: '#eef0f8', dark: '#3f5fb0', head: '#7f9fe8', style: 'crest' },
      { id: 'golden', name: 'Golden pheasant', main: '#e8b13f', light: '#ffe08a', dark: '#c8402e', head: '#ffd23f', style: 'crest long-tail', beak: '#8a5a1f', glow: '#ffe08a' },
    ],
  },
  owl: {
    label: 'Owl',
    jp: 'ふくろう',
    move: 'swoop',
    flowers: false,
    call: 'hoot',
    view: '-13 -21 26 23',
    looks: [
      { id: 'ural', name: 'Ural owl', main: '#a98a6a', light: '#e8dccb', dark: '#7a5a3f', mark: '#7a5a3f', head: '#d9c9b0', ring: '#2b1b14', style: 'round' },
      { id: 'horned', name: 'Horned owl', main: '#7a5a3f', light: '#d9b98a', dark: '#4a3424', mark: '#4a3424', head: '#b08a5f', ring: '#ffc94d' },
      { id: 'snowy', name: 'Snowy owl', main: '#f7f7f2', light: '#ffffff', dark: '#d9dbe0', mark: '#8d8f9e', head: '#ffffff', ring: '#ffd23f', style: 'round' },
      { id: 'scops', name: 'Scops owl', main: '#8d8f88', light: '#c9c9bc', dark: '#5f615c', mark: '#3f413c', head: '#b0b0a4', ring: '#ff9a3c' },
      { id: 'moon', name: 'Moon owl', main: '#3a3f7a', light: '#6a70b8', dark: '#23264f', mark: '#d9dcff', head: '#8a90d8', ring: '#fff27a', glow: '#b8bfff' },
    ],
  },
  frog: {
    label: 'Frog',
    jp: 'かえる',
    move: 'hop',
    flowers: false,
    call: 'ribbit',
    view: '-13 -17 26 19',
    looks: [
      { id: 'tree', name: 'Tree frog', main: '#6fc24f', light: '#e9f5d8', dark: '#4f9a3a' },
      { id: 'pond', name: 'Pond frog', main: '#a0894f', light: '#e8dcb8', dark: '#6e5a2e', mark: '#5a4a24', style: 'spots' },
      { id: 'red-eye', name: 'Red-eyed', main: '#57c86a', light: '#fff3d6', dark: '#2f6fc4', ring: '#e8392b' },
      { id: 'dart', name: 'Blue dart', main: '#2f6fe0', light: '#5a95f0', dark: '#1a3f9e', mark: '#101428', style: 'spots' },
      { id: 'golden', name: 'Golden', main: '#ffc73f', light: '#ffe9a0', dark: '#d9952a', glow: '#ffe08a' },
      { id: 'pink', name: 'Sakura frog', main: '#ff9ec0', light: '#ffe6ef', dark: '#e0709a', mark: '#ffffff', style: 'spots' },
    ],
  },
  rabbit: {
    label: 'Rabbit',
    jp: 'うさぎ',
    move: 'hop',
    flowers: false,
    call: 'pad',
    view: '-13 -26 26 28',
    looks: [
      { id: 'white', name: 'Snow rabbit', main: '#fbfbf6', light: '#ffc4d0', dark: '#e0e0d6', ring: '#d8324a' },
      { id: 'brown', name: 'Wild rabbit', main: '#a0714a', light: '#e8c4a8', dark: '#7a4f30', ring: '#2b1b14' },
      { id: 'grey', name: 'Grey rabbit', main: '#9a9eaa', light: '#e0d0d8', dark: '#747884', ring: '#2b1b14' },
      { id: 'dutch', name: 'Dutch rabbit', main: '#fbfbf6', light: '#ffc4d0', dark: '#3a3036', mark: '#3a3036', ring: '#2b1b14', style: 'dutch' },
      { id: 'black', name: 'Black rabbit', main: '#34303a', light: '#7a6470', dark: '#201d24', ring: '#ffd23f' },
      { id: 'moon', name: 'Moon rabbit', main: '#fff3c4', light: '#ffd98a', dark: '#f0d68a', ring: '#c8402e', glow: '#fff0a8' },
    ],
  },
  cat: {
    label: 'Cat',
    jp: 'ねこ',
    move: 'hop',
    flowers: false,
    call: 'meow',
    view: '-13 -21 26 23',
    looks: [
      { id: 'calico', name: 'Calico', main: '#fbf7ee', light: '#ffffff', dark: '#2b2622', mark: '#e8912f', ring: '#7fbf4f', style: 'calico' },
      { id: 'black', name: 'Black cat', main: '#2a2830', light: '#2a2830', dark: '#15141a', ring: '#ffd23f' },
      { id: 'ginger', name: 'Ginger tabby', main: '#ee9a3f', light: '#ffe2bd', dark: '#c26a1f', mark: '#c26a1f', ring: '#8fbf4f', style: 'tabby' },
      { id: 'grey', name: 'Grey tabby', main: '#9a9eaa', light: '#e4e4e8', dark: '#60646f', mark: '#60646f', ring: '#ffd23f', style: 'tabby' },
      { id: 'white', name: 'White cat', main: '#fbfbf6', light: '#ffffff', dark: '#e0e0d6', ring: '#6fb8ff' },
      { id: 'siamese', name: 'Siamese', main: '#f0e2c8', light: '#fff5e0', dark: '#4a3428', ring: '#4f9fe8', style: 'points' },
      { id: 'lucky', name: 'Lucky cat', main: '#ffffff', light: '#ffffff', dark: '#e8e0d0', mark: '#e8912f', ring: '#2b1b14', style: 'calico bell', glow: '#ffe08a' },
    ],
  },
  tanuki: {
    label: 'Tanuki',
    jp: 'たぬき',
    move: 'hop',
    flowers: false,
    call: 'pad',
    view: '-13 -23 26 25',
    looks: [
      { id: 'classic', name: 'Classic', main: '#a07f58', light: '#ecdcc0', dark: '#3f3028' },
      { id: 'dusk', name: 'Dusk', main: '#6a5a50', light: '#c9b8a4', dark: '#252028' },
      { id: 'snow', name: 'Snow', main: '#e8e4dc', light: '#ffffff', dark: '#6a6a74' },
      { id: 'leaf', name: 'Shapeshifter', main: '#a07f58', light: '#ecdcc0', dark: '#3f3028', style: 'leaf' },
      { id: 'hat', name: 'Traveller', main: '#b08a5f', light: '#f0e0c4', dark: '#4a382a', style: 'hat' },
    ],
  },
} as const satisfies Record<string, CreatureInfo>

export type Creature = keyof typeof CREATURES

export const CREATURE_LIST = Object.keys(CREATURES) as Creature[]

const looksOf = (c: Creature): readonly Look[] => CREATURES[c].looks

export const creatureKey = (c: Creature, look: string) => `${c}:${look}`

export const findLook = (c: Creature, id: string): Look => looksOf(c).find((l) => l.id === id) ?? looksOf(c)[0]

// Every entry in display order.
export const ALL_CREATURES = CREATURE_LIST.flatMap((creature) => looksOf(creature).map((look) => ({ creature, look, key: creatureKey(creature, look.id) })))

// Which visitor comes next: an even chance of each creature, then of each of its looks.
// `r` and `s` are random numbers in [0, 1).
export function rollCreature(r: number, s: number): { creature: Creature; look: string } {
  const creature = CREATURE_LIST[Math.floor(r * CREATURE_LIST.length)]
  const looks = looksOf(creature)
  return { creature, look: looks[Math.floor(s * looks.length)].id }
}

export interface Seen {
  at: number // when it was first tapped
  count: number // times tapped
}

export type CreatureLog = Record<string, Seen>

export const meet = (log: CreatureLog, key: string, now: number): CreatureLog => {
  const s = log[key]
  return { ...log, [key]: { at: s?.at ?? now, count: (s?.count ?? 0) + 1 } }
}

// Entries for looks since cut from the lists are dropped.
export function normalizeCreatures(raw: unknown): CreatureLog {
  const out: CreatureLog = {}
  if (!raw || typeof raw !== 'object') return out
  const known = new Set(ALL_CREATURES.map((c) => c.key))
  for (const [key, v] of Object.entries(raw as Record<string, unknown>)) {
    const s = v as Partial<Seen> | null
    if (!known.has(key) || !s || typeof s !== 'object') continue
    const at = typeof s.at === 'number' && Number.isFinite(s.at) ? s.at : 0
    const count = typeof s.count === 'number' && Number.isFinite(s.count) && s.count > 0 ? Math.floor(s.count) : 1
    out[key] = { at, count }
  }
  return out
}
