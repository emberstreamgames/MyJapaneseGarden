import { fromLessons, withType, type ByLesson } from './build'
import type { Item } from './items'

// [kanji, meaning, readings, ...other accepted meanings]. Use '' for readings to hide them.
// Readings are written 'ON / kun': on'yomi in katakana, kun'yomi in hiragana, okurigana in brackets.
type Row = [kanji: string, meaning: string, readings: string, ...alts: string[]]

// All 80 JLPT N5 kanji (Waller's 79 plus 分), placed in the Genki I lesson that teaches each one.
// Genki's other Reading & Writing kanji (N4 and above) are not added yet.
const kanji: ByLesson<Row> = {
  3: [
    ['一', 'one', 'イチ / ひと(つ)'],
    ['二', 'two', 'ニ / ふた(つ)'],
    ['三', 'three', 'サン / みっ(つ)'],
    ['四', 'four', 'シ / よん、よっ(つ)'],
    ['五', 'five', 'ゴ / いつ(つ)'],
    ['六', 'six', 'ロク / むっ(つ)'],
    ['七', 'seven', 'シチ / なな、なな(つ)'],
    ['八', 'eight', 'ハチ / やっ(つ)'],
    ['九', 'nine', 'キュウ、ク / ここの(つ)'],
    ['十', 'ten', 'ジュウ / とお'],
    ['百', 'hundred', 'ヒャク', 'one hundred'],
    ['千', 'thousand', 'セン', 'one thousand'],
    ['万', 'ten thousand', 'マン'],
    ['円', 'yen', 'エン / まる(い)', 'circle', 'round'],
    ['時', 'time', 'ジ / とき', 'hour', "o'clock", 'o’clock'],
  ],
  4: [
    ['日', 'day', 'ニチ、ジツ / ひ、か', 'sun', 'japan'],
    ['本', 'book', 'ホン / もと', 'origin', 'main'],
    ['人', 'person', 'ジン、ニン / ひと', 'people'],
    ['月', 'month', 'ゲツ、ガツ / つき', 'moon'],
    ['火', 'fire', 'カ / ひ'],
    ['水', 'water', 'スイ / みず'],
    ['木', 'tree', 'モク / き', 'wood'],
    ['金', 'gold', 'キン / かね', 'money'],
    ['土', 'soil', 'ド / つち', 'earth', 'ground'],
    ['上', 'up', 'ジョウ / うえ、あ(がる)', 'above', 'top'],
    ['下', 'down', 'カ、ゲ / した、さ(がる)', 'below', 'under'],
    ['中', 'middle', 'チュウ / なか', 'inside', 'center', 'centre'],
    ['半', 'half', 'ハン'],
  ],
  5: [
    ['山', 'mountain', 'サン / やま'],
    ['川', 'river', 'セン / かわ'],
    ['気', 'spirit', 'キ', 'energy', 'mind', 'air'],
    ['天', 'heaven', 'テン', 'heavens', 'sky'],
    ['今', 'now', 'コン / いま'],
    ['女', 'woman', 'ジョ / おんな', 'female'],
    ['男', 'man', 'ダン、ナン / おとこ', 'male'],
    ['見', 'see', 'ケン / み(る)', 'look', 'watch'],
    ['行', 'go', 'コウ / い(く)'],
    ['食', 'eat', 'ショク / た(べる)', 'food'],
  ],
  6: [
    ['東', 'east', 'トウ / ひがし'],
    ['西', 'west', 'セイ、サイ / にし'],
    ['南', 'south', 'ナン / みなみ'],
    ['北', 'north', 'ホク / きた'],
    ['出', 'exit', 'シュツ / で(る)、だ(す)', 'go out', 'leave'],
    ['右', 'right', 'ウ、ユウ / みぎ'],
    ['左', 'left', 'サ / ひだり'],
    ['分', 'minute', 'フン、ブン / わ(かる)', 'part', 'divide', 'understand'],
    ['先', 'ahead', 'セン / さき', 'previous', 'earlier', 'tip'],
    ['生', 'life', 'セイ / い(きる)、う(まれる)', 'birth', 'live', 'raw'],
    ['大', 'big', 'ダイ、タイ / おお(きい)', 'large'],
    ['学', 'study', 'ガク / まな(ぶ)', 'learning', 'learn'],
    ['外', 'outside', 'ガイ / そと'],
    ['国', 'country', 'コク / くに', 'nation'],
  ],
  7: [
    ['子', 'child', 'シ / こ'],
    ['小', 'small', 'ショウ / ちい(さい)', 'little'],
    ['父', 'father', 'フ / ちち'],
    ['母', 'mother', 'ボ / はは'],
    ['高', 'high', 'コウ / たか(い)', 'tall', 'expensive'],
    ['校', 'school', 'コウ'],
    ['毎', 'every', 'マイ'],
    ['語', 'language', 'ゴ', 'word'],
    ['入', 'enter', 'ニュウ / はい(る)、い(れる)', 'insert', 'put in'],
  ],
  8: [
    ['聞', 'hear', 'ブン / き(く)', 'listen', 'ask'],
    ['電', 'electricity', 'デン'],
    ['車', 'car', 'シャ / くるま', 'vehicle'],
    ['休', 'rest', 'キュウ / やす(む)', 'holiday', 'day off'],
    ['読', 'read', 'ドク / よ(む)'],
    ['何', 'what', 'なに、なん'],
  ],
  9: [
    ['午', 'noon', 'ゴ'],
    ['後', 'after', 'ゴ、コウ / あと、うし(ろ)', 'behind', 'later', 'back'],
    ['前', 'before', 'ゼン / まえ', 'front', 'in front'],
    ['名', 'name', 'メイ / な'],
    ['白', 'white', 'ハク / しろ(い)'],
    ['雨', 'rain', 'ウ / あめ'],
    ['書', 'write', 'ショ / か(く)'],
    ['友', 'friend', 'ユウ / とも'],
    ['間', 'between', 'カン / あいだ、ま', 'interval', 'space'],
    ['話', 'talk', 'ワ / はな(す)、はなし', 'speak', 'story'],
    ['来', 'come', 'ライ / く(る)', 'next'],
  ],
  10: [
    ['年', 'year', 'ネン / とし'],
    ['長', 'long', 'チョウ / なが(い)', 'leader', 'chief'],
  ],
}

export const kanjiItems = (): Item[] =>
  fromLessons(kanji, ([k, meaning, readings, ...alts]) =>
    withType('kanji', `j-${k}`, k, meaning, [meaning, ...alts], readings),
  )
