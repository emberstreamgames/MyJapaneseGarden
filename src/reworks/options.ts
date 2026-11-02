// The elements a rework is made of, each with its options. Foundations restyle the whole page the
// moment they're picked; the rest are live pieces that come together in the mix on the side.

export interface Option {
  id: string
  name: string
  why: string
}

export interface Element {
  id: string
  title: string
  ask: string // what to judge it on
  group: string
  options: Option[]
}

export const GROUPS = ['Foundations', 'Garden screen', 'Quiz', 'Rewards and pop-ups']

export const ELEMENTS: Element[] = [
  {
    id: 'colour', group: 'Foundations', title: 'Colour', ask: 'Does it feel like somewhere you want to stay a while?',
    options: [
      { id: 'meadow', name: 'Morning meadow', why: 'Cream paper, sage leaves and a soft terracotta. The calmest choice.' },
      { id: 'honey', name: 'Honey harvest', why: 'Butter and amber, like late-summer light on a full basket.' },
      { id: 'peach', name: 'Peach orchard', why: 'Blush and moss. The sweetest and most playful.' },
      { id: 'firefly', name: 'Firefly evening', why: 'A soft dusk, for anyone who loves the dark theme. Lantern gold, no black.' },
    ],
  },
  {
    id: 'font', group: 'Foundations', title: 'Lettering', ask: 'Is the Japanese still easy to read at quiz size?',
    options: [
      { id: 'zen', name: 'Zen Maru Gothic', why: 'Gentle rounded strokes. The clearest for learning kana.' },
      { id: 'mplus', name: 'M PLUS Rounded', why: 'Sturdy and friendly, the most game-like.' },
      { id: 'kiwi', name: 'Kiwi Maru', why: 'Soft, like a storybook. Plenty of personality.' },
      { id: 'yusei', name: 'Yusei Magic', why: 'Felt-tip handwriting, like a garden label. Least formal.' },
    ],
  },
  {
    id: 'surface', group: 'Foundations', title: 'Surfaces', ask: 'What are cards and panels made of?',
    options: [
      { id: 'pillow', name: 'Pillow', why: 'Puffy with a soft shadow. Nothing has a hard edge.' },
      { id: 'clay', name: 'Clay', why: 'A thick baked edge you want to press, like a tile.' },
      { id: 'paper', name: 'Cut paper', why: 'Slightly uneven corners, as if cut by hand.' },
      { id: 'stitch', name: 'Stitched', why: 'A sewn dashed edge, like a garden patch on a quilt.' },
    ],
  },
  {
    id: 'hud', group: 'Garden screen', title: 'Top bar', ask: 'Level, XP, streak and coins. Try tapping them.',
    options: [
      { id: 'sign', name: 'Hanging sign', why: 'A wooden plank on ropes that swings when tapped.' },
      { id: 'vine', name: 'Growing vine', why: 'XP is a vine that sprouts another leaf as it fills.' },
      { id: 'pebbles', name: 'Pebbles', why: 'Each number sits on a smooth pebble that hops when tapped.' },
      { id: 'snail', name: 'Snail trail', why: 'A snail crawls towards the next level. It takes its time, like the game.' },
    ],
  },
  {
    id: 'menu', group: 'Garden screen', title: 'Menu', ask: 'A replacement for the three-line button. Tap to open.',
    options: [
      { id: 'mole', name: 'Mole hill', why: 'A mole pops up with the menu in its paws.' },
      { id: 'lily', name: 'Frog on a lily pad', why: 'The frog stays put; each place is a lily pad that floats out.' },
      { id: 'dock', name: 'Burrow dock', why: 'Always-visible burrows along the bottom. Mochi peeks from the one you’re in.' },
      { id: 'tin', name: 'Seed tin', why: 'Tap the tin and its lid pops; each place comes out as a seed packet.' },
      { id: 'pouch', name: 'Garden pouch', why: 'A stitched bag whose drawstring loosens to let the places out.' },
      { id: 'path', name: 'Pebble path', why: 'Squishy pebbles along the bottom, always visible. A sprout grows on the one you’re on.' },
    ],
  },
  {
    id: 'badge', group: 'Garden screen', title: 'Plant signals', ask: 'The 💧, ✨ and resting marks over each plant. Can you tell them apart at a glance?',
    options: [
      { id: 'sprites', name: 'Little sprites', why: 'A droplet, a star and a moon that bob over the plant.' },
      { id: 'bubble', name: 'Plant thoughts', why: 'The plant is thinking about what it wants.' },
      { id: 'bee', name: 'Bee messengers', why: 'A bee hovers nearby carrying the request.' },
      { id: 'stake', name: 'Garden stakes', why: 'Tiny hand-painted labels pushed into the soil.' },
    ],
  },
  {
    id: 'voice', group: 'Garden screen', title: 'Garden guide', ask: 'Who talks to you? Tap for another line.',
    options: [
      { id: 'mochi', name: 'Mochi the seed', why: 'A round new character who could lead the tutorial too.' },
      { id: 'tanuki', name: 'Tanuki gardener', why: 'A creature from the game, promoted to head gardener.' },
      { id: 'snail', name: 'Old Snail', why: 'Slow, wise, and unbothered if you skip a day.' },
      { id: 'post', name: 'Signpost', why: 'No character: the garden’s own wooden sign.' },
    ],
  },
  {
    id: 'action', group: 'Garden screen', title: 'Main button', ask: 'Press, hold and let go. No faces: each one comes alive in how it moves.',
    options: [
      { id: 'pebble', name: 'Squishy pebble', why: 'A lumpy stone that squashes flat and springs back.' },
      { id: 'honey', name: 'Honey jar', why: 'The gingham lid lifts and a drip of honey runs down. Made for Honey harvest.' },
      { id: 'pumpkin', name: 'Plump pumpkin', why: 'A ribbed pumpkin that squashes; its stem and curl wobble after.' },
      { id: 'cushion', name: 'Stitched cushion', why: 'A tufted pillow with sewn edges that sinks under your thumb. Matches Stitched.' },
      { id: 'can', name: 'Watering can', why: 'Tips forward and sprinkles three drops from the spout.' },
      { id: 'blossom', name: 'Scalloped blossom', why: 'Petals frame the label and spread open when pressed.' },
      { id: 'dewdrop', name: 'Jelly dewdrop', why: 'A glossy drop that wobbles like jelly when let go.' },
      { id: 'pod', name: 'Pea pod', why: 'The peas push up out of the pod.' },
      { id: 'mushroom', name: 'Bouncy mushroom', why: 'The cap bounces like a trampoline.' },
      { id: 'acorn', name: 'Acorn', why: 'The little cap hops off when pressed.' },
    ],
  },
  {
    id: 'card', group: 'Quiz', title: 'Question card', ask: 'What holds the question? Tap it.',
    options: [
      { id: 'packet', name: 'Seed packet', why: 'Every question is a packet of something you’re growing.' },
      { id: 'stake', name: 'Garden stake', why: 'A painted board pushed into the soil, like a plant label. Wiggles when tapped.' },
      { id: 'patch', name: 'Quilted patch', why: 'Sewn into a gingham border. Made for Stitched.' },
      { id: 'stone', name: 'Big pebble', why: 'A large Squishy pebble with a patch of moss, to match the answer stones below.' },
      { id: 'peg', name: 'Pegged to the line', why: 'A note on a washing line that sways in the breeze.' },
      { id: 'leaf', name: 'Big leaf', why: 'The word is written on a broad leaf.' },
      { id: 'board', name: 'Held up by a friend', why: 'A creature peeks over the top and holds it up for you.' },
    ],
  },
  {
    id: 'choices', group: 'Quiz', title: 'Answer choices', ask: 'Try the right answer (“college; university”) and a wrong one. Press and hold too.',
    options: [
      { id: 'pebbles', name: 'Stepping stones', why: 'Round stones. The right one hops, a wrong one wobbles.' },
      { id: 'squish', name: 'Squishy pebbles', why: 'Four little Squishy pebble buttons. They squash under your thumb; the right one double-bounces, a wrong one sighs flat and slowly puffs back.' },
      { id: 'moss', name: 'Mossy pebbles', why: 'Squishy pebbles with a patch of moss. The right one grows a sprout and the moss spreads over it.' },
      { id: 'pond', name: 'Pond pebbles', why: 'Squishy pebbles in a shallow pond. Every press sends a ripple; the right one sends golden rings.' },
      { id: 'fruit', name: 'Fruit on a branch', why: 'Pick the right fruit and it drops into your harvest.' },
      { id: 'puffs', name: 'Dandelion puffs', why: 'Soft clouds that drift. A wrong one just floats away.' },
    ],
  },
  {
    id: 'progress', group: 'Quiz', title: 'Quiz progress', ask: 'The 10 questions. Press Next to see it grow.',
    options: [
      { id: 'caterpillar', name: 'Growing caterpillar', why: 'One more segment for each question.' },
      { id: 'sprout', name: 'Sprouting vine', why: 'A leaf uncurls for each question.' },
      { id: 'ladybug', name: 'Ladybug on a stem', why: 'A ladybug climbs towards the flower.' },
      { id: 'bucket', name: 'Filling bucket', why: 'Each answer adds water, ready for the plant.' },
      { id: 'stones', name: 'Pebble path', why: 'One small pebble per question; each answered one turns green and bounces.' },
      { id: 'seeds', name: 'Seed row', why: 'A seed per question, sprouting once it’s answered.' },
      { id: 'thread', name: 'Stitching', why: 'A needle sews its way along. Made for Stitched.' },
    ],
  },
  {
    id: 'reaction', group: 'Quiz', title: 'Answer reaction', ask: 'Who reacts to right and wrong? A miss should feel like a hug.',
    options: [
      { id: 'frog', name: 'Leaping frog', why: 'Big leap for a right answer, a pat on the shoulder for a miss.' },
      { id: 'rabbit', name: 'Popping rabbit', why: 'Bursts up from a burrow, then ducks back down.' },
      { id: 'sprout', name: 'Dancing sprout', why: 'Mochi wiggles, or droops a little.' },
      { id: 'bud', name: 'Bursting bud', why: 'A bud bursts into flower. A miss is a drop of water, and it nods.' },
      { id: 'pebble', name: 'Squishy pebble', why: 'The answer pebble on its own: a double bounce, or a sigh that puffs back up.' },
      { id: 'weather', name: 'Sun and rain', why: 'The sun comes out for a right answer. A miss rains on the sprout, and it grows anyway.' },
      { id: 'bee', name: 'Loop-the-loop bee', why: 'A bee does a happy loop and leaves a trail.' },
    ],
  },
  {
    id: 'reward', group: 'Rewards and pop-ups', title: 'Quiz reward', ask: 'The end of a quiz, as a harvest. Press Play.',
    options: [
      { id: 'basket', name: 'Harvest basket', why: 'Each reward tumbles in and the basket jumps.' },
      { id: 'shelf', name: 'Honey shelf', why: 'A jar for each reward, filling with honey in turn. Made for Honey harvest.' },
      { id: 'branch', name: 'Ripening branch', why: 'Buds swell into fruit, one per reward.' },
      { id: 'quilt', name: 'Quilt', why: 'Each reward is a patch sewn into a little quilt.' },
      { id: 'jar', name: 'Seed jar', why: 'Words saved up like seeds, filling a glass jar.' },
      { id: 'parade', name: 'Creature parade', why: 'Your friends march through, each carrying a reward.' },
      { id: 'letter', name: 'Thank-you note', why: 'The plant writes to you, delivered by a bird.' },
    ],
  },
  {
    id: 'popup', group: 'Rewards and pop-ups', title: 'Pop-ups', ask: 'How a plant’s details appear. Tap to open.',
    options: [
      { id: 'sheet', name: 'Soft sheet', why: 'Rises from below like the current one, but puffy.' },
      { id: 'door', name: 'Burrow door', why: 'A round door swings open onto a warm room.' },
      { id: 'notebook', name: 'Garden notebook', why: 'A journal flips open, with tape and doodles.' },
      { id: 'stump', name: 'Tree stump', why: 'Pops out of the ground with the rings as a table.' },
    ],
  },
]

export type Picks = Record<string, string>

export const defaultPicks = (): Picks => Object.fromEntries(ELEMENTS.map((e) => [e.id, e.options[0].id]))

export const PALETTES: Record<string, Record<string, string>> = {
  meadow: { paper: '#fbf6e9', card: '#fffdf6', ink: '#4a3f35', soft: '#74675a', leaf: '#a8cf96', deep: '#5c8f5a', accent: '#f4ad96', onAccent: '#4f2a1e', honey: '#f6cf7c', sky: '#bfe0e8', earth: '#b98a62', blush: '#f7c6bb', shade: '#8a6a4a' },
  honey: { paper: '#fff3d6', card: '#fffbec', ink: '#54402a', soft: '#7c6547', leaf: '#c3d07c', deep: '#75873f', accent: '#f6bc61', onAccent: '#4a300c', honey: '#f9d37a', sky: '#cfe6dd', earth: '#c08d55', blush: '#f9c79d', shade: '#94682c' },
  peach: { paper: '#fdeee6', card: '#fff9f5', ink: '#574047', soft: '#80666d', leaf: '#b3d2ab', deep: '#64906a', accent: '#f7aca6', onAccent: '#53262a', honey: '#fbd58e', sky: '#cbe3ec', earth: '#c49478', blush: '#fbc4c4', shade: '#a06a6a' },
  firefly: { paper: '#2f3547', card: '#3c435a', ink: '#f8f1df', soft: '#cfc9ba', leaf: '#84b58c', deep: '#a9d6ab', accent: '#f7c873', onAccent: '#40300f', honey: '#f7d98c', sky: '#7fa4b8', earth: '#8b6d57', blush: '#c98c94', shade: '#141827' },
}

export const FONTS: Record<string, string> = {
  zen: "'Zen Maru Gothic', sans-serif",
  mplus: "'M PLUS Rounded 1c', sans-serif",
  kiwi: "'Kiwi Maru', serif",
  yusei: "'Yusei Magic', sans-serif",
}
