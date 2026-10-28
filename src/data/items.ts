import { N5, type Lesson } from './build'
import { grammarItems } from './grammar'
import { kanjiItems } from './kanji'
import { n5VocabItems } from './n5vocab'
import { vocabItems } from './vocab'

export type Deck = 'hiragana' | 'katakana' | 'kanji' | 'vocab' | 'grammar'

export interface Item {
  id: string
  type: Deck
  lesson: Lesson // 0 = Greetings/Numbers, 1-12 = Genki I lessons, 'n5' = N5 Prep
  front: string // what is shown as the prompt
  back: string // display form of the answer
  answers: string[] // accepted typed answers (lowercase)
  tag: string // small label shown above the prompt, e.g. 'basic' or 'Lesson 3'
  hint?: string // optional extra shown under the prompt (a reading, a translation)
}

// [hiragana, romaji, ...alternate accepted romaji]
type Row = [string, string, ...string[]]

const basic: Row[] = [
  ['あ', 'a'], ['い', 'i'], ['う', 'u'], ['え', 'e'], ['お', 'o'],
  ['か', 'ka'], ['き', 'ki'], ['く', 'ku'], ['け', 'ke'], ['こ', 'ko'],
  ['さ', 'sa'], ['し', 'shi', 'si'], ['す', 'su'], ['せ', 'se'], ['そ', 'so'],
  ['た', 'ta'], ['ち', 'chi', 'ti'], ['つ', 'tsu', 'tu'], ['て', 'te'], ['と', 'to'],
  ['な', 'na'], ['に', 'ni'], ['ぬ', 'nu'], ['ね', 'ne'], ['の', 'no'],
  ['は', 'ha'], ['ひ', 'hi'], ['ふ', 'fu', 'hu'], ['へ', 'he'], ['ほ', 'ho'],
  ['ま', 'ma'], ['み', 'mi'], ['む', 'mu'], ['め', 'me'], ['も', 'mo'],
  ['や', 'ya'], ['ゆ', 'yu'], ['よ', 'yo'],
  ['ら', 'ra'], ['り', 'ri'], ['る', 'ru'], ['れ', 're'], ['ろ', 'ro'],
  ['わ', 'wa'], ['を', 'wo', 'o'], ['ん', 'n'],
]

const dakuten: Row[] = [
  ['が', 'ga'], ['ぎ', 'gi'], ['ぐ', 'gu'], ['げ', 'ge'], ['ご', 'go'],
  ['ざ', 'za'], ['じ', 'ji', 'zi'], ['ず', 'zu'], ['ぜ', 'ze'], ['ぞ', 'zo'],
  ['だ', 'da'], ['ぢ', 'ji', 'di'], ['づ', 'zu', 'du'], ['で', 'de'], ['ど', 'do'],
  ['ば', 'ba'], ['び', 'bi'], ['ぶ', 'bu'], ['べ', 'be'], ['ぼ', 'bo'],
]

const handakuten: Row[] = [
  ['ぱ', 'pa'], ['ぴ', 'pi'], ['ぷ', 'pu'], ['ぺ', 'pe'], ['ぽ', 'po'],
]

const combo: Row[] = [
  ['きゃ', 'kya'], ['きゅ', 'kyu'], ['きょ', 'kyo'],
  ['しゃ', 'sha', 'sya'], ['しゅ', 'shu', 'syu'], ['しょ', 'sho', 'syo'],
  ['ちゃ', 'cha', 'tya'], ['ちゅ', 'chu', 'tyu'], ['ちょ', 'cho', 'tyo'],
  ['にゃ', 'nya'], ['にゅ', 'nyu'], ['にょ', 'nyo'],
  ['ひゃ', 'hya'], ['ひゅ', 'hyu'], ['ひょ', 'hyo'],
  ['みゃ', 'mya'], ['みゅ', 'myu'], ['みょ', 'myo'],
  ['りゃ', 'rya'], ['りゅ', 'ryu'], ['りょ', 'ryo'],
  ['ぎゃ', 'gya'], ['ぎゅ', 'gyu'], ['ぎょ', 'gyo'],
  ['じゃ', 'ja', 'jya', 'zya'], ['じゅ', 'ju', 'jyu', 'zyu'], ['じょ', 'jo', 'jyo', 'zyo'],
  ['びゃ', 'bya'], ['びゅ', 'byu'], ['びょ', 'byo'],
  ['ぴゃ', 'pya'], ['ぴゅ', 'pyu'], ['ぴょ', 'pyo'],
]

// Hiragana (U+3041-3096) maps to katakana by a fixed code point offset.
const toKatakana = (s: string) =>
  [...s].map((c) => String.fromCharCode(c.charCodeAt(0) + 0x60)).join('')

// Kana keep the Genki lesson that teaches them (1 and 2) for reference, but the chapter chips
// don't filter them: store.svelte.ts poolFor always includes every kana.
function build(rows: Row[], tag: string): Item[] {
  const out: Item[] = []
  for (const [hira, romaji, ...alts] of rows) {
    const answers = [romaji, ...alts]
    out.push({ id: `h-${hira}`, type: 'hiragana', lesson: 1, front: hira, back: romaji, answers, tag })
    const kata = toKatakana(hira)
    out.push({ id: `k-${kata}`, type: 'katakana', lesson: 2, front: kata, back: romaji, answers, tag })
  }
  return out
}

export const ITEMS: Item[] = [
  ...build(basic, 'basic'),
  ...build(dakuten, 'dakuten'),
  ...build(handakuten, 'handakuten'),
  ...build(combo, 'combo'),
  ...vocabItems(),
  ...n5VocabItems(),
  ...kanjiItems(),
  ...grammarItems(),
]

// A deck needs at least this many items before its plant can be planted.
export const MIN_DECK_SIZE = 10
export const deckReady = (d: Deck): boolean => ITEMS.filter((i) => i.type === d).length >= MIN_DECK_SIZE

// What the typed-answer box asks for.
export const DECK_PROMPT: Record<Deck, string> = {
  hiragana: 'type the romaji',
  katakana: 'type the romaji',
  kanji: 'type the meaning',
  vocab: 'type the meaning',
  grammar: 'type the missing word',
}

// Content mistakes are easy to make by hand; flag them while developing.
if (import.meta.env.DEV) {
  const seen = new Set<string>()
  for (const it of ITEMS) {
    const problems: string[] = []
    if (seen.has(it.id)) problems.push('duplicate id')
    seen.add(it.id)
    if (!it.front || !it.back) problems.push('empty front or back')
    if (!it.answers.length) problems.push('no accepted answers')
    if (it.answers.some((a) => a !== a.trim().toLowerCase())) problems.push('answers must be trimmed lowercase')
    const l = it.lesson
    if (l !== N5 && (typeof l !== 'number' || !Number.isInteger(l) || l < 0 || l > 12)) problems.push("lesson must be 0-12 or 'n5'")
    if (problems.length) console.warn(`[items] ${it.id}: ${problems.join(', ')}`)
  }
}

export const DECK_LABEL: Record<Deck, string> = {
  hiragana: 'Hiragana',
  katakana: 'Katakana',
  kanji: 'Kanji',
  vocab: 'Vocabulary',
  grammar: 'Grammar',
}
