// Pure rules for how the garden itself looks: the shop catalog of lawns, soils, bed edgings and
// atmospheres, and which are owned and worn. meadow.ts paints the first three into the scene;
// Sky.svelte lays the atmosphere over it. No store or DOM, like garden.ts.

export type Part = 'lawn' | 'soil' | 'edge' | 'sky'

export interface Lawn {
  grass: [string, string] // base gradient, top to bottom
  patches: [string, string] // broad dark and light patches
  blades: string[] // six, dark to light
  lip: string // the turf edge around the bed
  shade: string // the bed's cast shadow
  flowers: string[] // the tiny wildflowers
}

export interface Soil {
  ground: [string, string] // base gradient
  mound: [string, string, string] // the tilled rows, top to bottom
  crumbs: string[]
  groove: [string, string] // light and dark furrows
  clods: [string, string] // light and dark
}

export interface LookItem {
  id: string
  part: Part
  label: string
  ja: string // Japanese name, shown with its reading so the shop teaches a word too
  reading: string
  price: number // 0 is the garden's original, free for all
  swatch: string // CSS background for the shop card
  icon?: string
  lawn?: Lawn
  soil?: Soil
}

const flowers = ['#ffffff', '#fff3a8', '#ffd0e4', '#cfe0ff']

export const LOOKS: LookItem[] = [
  {
    id: 'spring', part: 'lawn', label: 'Spring lawn', ja: '芝生', reading: 'shibafu', price: 0, swatch: 'linear-gradient(160deg, #7fcb5e, #4a973a)',
    lawn: { grass: ['#6cbb4f', '#4a973a'], patches: ['#3c8230', '#8ad065'], blades: ['#3f8a32', '#4c9a3b', '#5aab45', '#6cbb4f', '#7fcb5e', '#93d86f'], lip: '#3a7f2e', shade: '#1c3312', flowers },
  },
  {
    id: 'moss', part: 'lawn', label: 'Temple moss', ja: '苔', reading: 'koke', price: 300, swatch: 'linear-gradient(160deg, #5f9a4e, #245a3a)',
    lawn: { grass: ['#3f8450', '#245a3a'], patches: ['#1c4a30', '#6aa554'], blades: ['#1f5236', '#2a6840', '#37794a', '#4b8f50', '#64a658', '#82bb62'], lip: '#1f5236', shade: '#0d2418', flowers: ['#e8ffd8', '#fff3a8'] },
  },
  {
    id: 'autumn', part: 'lawn', label: 'Autumn leaves', ja: '紅葉', reading: 'kōyō', price: 500, swatch: 'linear-gradient(160deg, #eba53c, #b0482a)',
    lawn: { grass: ['#c9913b', '#99692e'], patches: ['#8a4a24', '#e6b04c'], blades: ['#8f5a26', '#a8702c', '#c98a34', '#e0a83f', '#d9622f', '#c8402e'], lip: '#7c5526', shade: '#2e1a0c', flowers: ['#ffe7a8', '#ffb86b', '#f07f4a'] },
  },
  {
    id: 'sakura', part: 'lawn', label: 'Petal carpet', ja: '花びら', reading: 'hanabira', price: 700, swatch: 'linear-gradient(160deg, #ffd6e6, #8fce7a)',
    lawn: { grass: ['#8fcf72', '#6fb35f'], patches: ['#f7b8d0', '#ffe2ee'], blades: ['#4f9a44', '#68b256', '#86c56a', '#ffc4da', '#ffd9e8', '#ffeef5'], lip: '#5a9c4c', shade: '#26402a', flowers: ['#ffffff', '#ffd0e4', '#ffb3cf'] },
  },
  {
    id: 'snow', part: 'lawn', label: 'Fresh snow', ja: '雪', reading: 'yuki', price: 900, swatch: 'linear-gradient(160deg, #ffffff, #bcd2ea)',
    lawn: { grass: ['#eef4fb', '#c9daee'], patches: ['#aac3df', '#ffffff'], blades: ['#b4cbe3', '#c6d9ec', '#d7e4f2', '#e6eef7', '#f2f7fc', '#ffffff'], lip: '#9db7d3', shade: '#2d3d55', flowers: ['#ffffff', '#dceafa'] },
  },

  {
    id: 'loam', part: 'soil', label: 'Garden loam', ja: '土', reading: 'tsuchi', price: 0, swatch: 'linear-gradient(160deg, #a06f46, #3b2618)',
    soil: { ground: ['#5a3b25', '#3b2618'], mound: ['#a06f46', '#7c5234', '#553621'], crumbs: ['#24170d', '#6e4a2f', '#80583a'], groove: ['#b6875c', '#462c1a'], clods: ['#a87a50', '#4a301d'] },
  },
  {
    id: 'black', part: 'soil', label: 'Black soil', ja: '黒土', reading: 'kurotsuchi', price: 200, swatch: 'linear-gradient(160deg, #5c5048, #17120f)',
    soil: { ground: ['#2e2622', '#17120f'], mound: ['#5c5048', '#40362f', '#28211c'], crumbs: ['#0c0907', '#3e342d', '#50443b'], groove: ['#71635a', '#1a1411'], clods: ['#6a5c52', '#201a16'] },
  },
  {
    id: 'clay', part: 'soil', label: 'Red clay', ja: '赤土', reading: 'akatsuchi', price: 350, swatch: 'linear-gradient(160deg, #cc6d42, #6b2e1b)',
    soil: { ground: ['#8a4228', '#5c2717'], mound: ['#cc6d42', '#a4502f', '#70331e'], crumbs: ['#3f1a0e', '#a8583a', '#bd6a48'], groove: ['#e09468', '#592514'], clods: ['#d6845a', '#642b18'] },
  },
  {
    id: 'sand', part: 'soil', label: 'Raked sand', ja: '砂', reading: 'suna', price: 500, swatch: 'linear-gradient(160deg, #efe3c8, #b6a57f)',
    soil: { ground: ['#cdbd98', '#a89874'], mound: ['#efe3c8', '#ddcea9', '#bfae87'], crumbs: ['#94855f', '#d9cba8', '#f2e8d0'], groove: ['#fbf4e2', '#a39268'], clods: ['#f4ead2', '#ab9a70'] },
  },

  { id: 'turf', part: 'edge', label: 'Plain turf', ja: '芝', reading: 'shiba', price: 0, swatch: 'linear-gradient(160deg, #5aab45, #3a7f2e)', icon: '🌿' },
  { id: 'logs', part: 'edge', label: 'Log edging', ja: '丸太', reading: 'maruta', price: 300, swatch: 'linear-gradient(160deg, #a87a4c, #5e3e24)', icon: '🪵' },
  { id: 'stones', part: 'edge', label: 'River stones', ja: '石', reading: 'ishi', price: 400, swatch: 'linear-gradient(160deg, #c7c5ba, #76766e)', icon: '🪨' },
  { id: 'fence', part: 'edge', label: 'Bamboo fence', ja: '竹垣', reading: 'takegaki', price: 600, swatch: 'linear-gradient(160deg, #cfc070, #7f9a42)', icon: '🎋' },

  { id: 'clear', part: 'sky', label: 'Clear day', ja: '晴れ', reading: 'hare', price: 0, swatch: 'linear-gradient(160deg, #a8dcff, #fff4c8)', icon: '☀️' },
  { id: 'petals', part: 'sky', label: 'Spring breeze', ja: '春風', reading: 'harukaze', price: 400, swatch: 'linear-gradient(160deg, #ffe2ee, #ff9ec0)', icon: '🌸' },
  { id: 'leaves', part: 'sky', label: 'Autumn breeze', ja: '秋風', reading: 'akikaze', price: 400, swatch: 'linear-gradient(160deg, #ffd27a, #d9622f)', icon: '🍁' },
  { id: 'snowfall', part: 'sky', label: 'Light snowfall', ja: '粉雪', reading: 'konayuki', price: 600, swatch: 'linear-gradient(160deg, #dce9f7, #8fb0d4)', icon: '❄️' },
  { id: 'fireflies', part: 'sky', label: 'Firefly night', ja: '蛍', reading: 'hotaru', price: 800, swatch: 'linear-gradient(160deg, #1c2a66, #0a1030)', icon: '✨' },
]

export const LOOK_BY_ID: Record<string, LookItem> = Object.fromEntries(LOOKS.map((l) => [l.id, l]))

export const PARTS: { part: Part; title: string }[] = [
  { part: 'lawn', title: 'Lawn' },
  { part: 'soil', title: 'Soil' },
  { part: 'edge', title: 'Bed edging' },
  { part: 'sky', title: 'Atmosphere' },
]

export type Wearing = Record<Part, string>

export interface LookState {
  owned: string[] // bought looks; the free originals aren't listed
  wearing: Wearing
}

const ORIGINAL: Wearing = { lawn: 'spring', soil: 'loam', edge: 'turf', sky: 'clear' }

export const newLook = (): LookState => ({ owned: [], wearing: { ...ORIGINAL } })

// Make loaded data safe: known looks only, and nothing worn that isn't owned.
export function normalizeLook(raw: unknown): LookState {
  const r = (raw ?? {}) as Partial<LookState>
  const owned = [...new Set(Array.isArray(r.owned) ? r.owned : [])].filter((id) => LOOK_BY_ID[id]?.price)
  const wearing = { ...ORIGINAL }
  for (const { part } of PARTS) {
    const item = LOOK_BY_ID[r.wearing?.[part] as string]
    if (item?.part === part && (!item.price || owned.includes(item.id))) wearing[part] = item.id
  }
  return { owned, wearing }
}
