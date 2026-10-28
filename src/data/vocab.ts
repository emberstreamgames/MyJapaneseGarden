import { fromLessons, withType, type ByLesson } from './build'
import type { Item } from './items'

// [japanese, reading, meaning, ...other accepted meanings]. Use '' for the reading when the word is all kana.
type Row = [japanese: string, reading: string, meaning: string, ...alts: string[]]

// The meaning is the book's wording. Extra values are other accepted typed answers.
// Meanings with an apostrophe also accept the curly ’ that phone keyboards type.
const vocab: ByLesson<Row> = {
  1: [
    // School
    ['だいがく', '', 'college; university', 'college', 'university'],
    ['こうこう', '', 'high school'],
    ['がくせい', '', 'student'],
    ['だいがくせい', '', 'college student', 'university student'],
    ['りゅうがくせい', '', 'international student', 'foreign student'],
    ['せんせい', '', 'teacher; Professor …', 'teacher', 'professor'],
    ['～ねんせい', '', '… year student', 'year student'],
    ['いちねんせい', '', 'first-year student', 'first year student', 'freshman'],
    ['せんこう', '', 'major'],
    // Person
    ['わたし', '', 'I', 'me'],
    ['ともだち', '', 'friend'],
    ['～さん', '', 'Mr./Ms. …', 'mr.', 'ms.', 'mr', 'ms', 'mrs'],
    ['～じん', '', '… people', 'people', 'person', 'nationality'],
    ['にほんじん', '', 'Japanese people', 'japanese person', 'japanese'],
    // Time
    ['いま', '', 'now'],
    ['ごぜん', '', 'A.M.', 'am'],
    ['ごご', '', 'P.M.', 'pm'],
    ['～じ', '', "o'clock", 'o’clock', 'oclock'],
    ['いちじ', '', "one o'clock", 'one o’clock', 'one oclock', "1 o'clock", '1:00'],
    ['はん', '', 'half', 'half past'],
    ['にじはん', '', 'half past two', '2:30', 'two thirty'],
    // Others
    ['にほん', '', 'Japan'],
    ['アメリカ', '', 'U.S.A.', 'usa', 'america', 'united states', 'us'],
    ['～ご', '', '… language', 'language'],
    ['にほんご', '', 'Japanese language', 'japanese'],
    ['～さい', '', '… years old', 'years old', 'age'],
    ['でんわ', '', 'telephone', 'phone'],
    ['～ばん', '', 'number …', 'number', 'no.'],
    ['ばんごう', '', 'number'],
    ['なまえ', '', 'name'],
    ['なん／なに', '', 'what'],
    // Expressions
    ['あのう', '', 'um …', 'um', 'uh'],
    ['はい', '', 'yes'],
    ['そうです', '', "That's right.", "that's right", 'that’s right', 'thats right'],
    ['そうですか', '', 'I see.; Is that so?', 'i see', 'is that so?', 'is that so', 'oh i see'],
    // Additional vocabulary: countries
    ['イギリス', '', 'Britain', 'uk', 'england', 'united kingdom'],
    ['オーストラリア', '', 'Australia'],
    ['かんこく', '', 'Korea', 'south korea'],
    ['カナダ', '', 'Canada'],
    ['ちゅうごく', '', 'China'],
    ['インド', '', 'India'],
    ['エジプト', '', 'Egypt'],
    ['フィリピン', '', 'Philippines', 'the philippines'],
    // Additional vocabulary: majors
    ['アジアけんきゅう', '', 'Asian studies'],
    ['けいざい', '', 'economics'],
    ['こうがく', '', 'engineering'],
    ['こくさいかんけい', '', 'international relations'],
    ['コンピューター', '', 'computer', 'computer science'],
    ['せいじ', '', 'politics'],
    ['せいぶつがく', '', 'biology'],
    ['ビジネス', '', 'business'],
    ['ぶんがく', '', 'literature'],
    ['れきし', '', 'history'],
    // Additional vocabulary: occupations
    ['いしゃ', '', 'doctor'],
    ['かいしゃいん', '', 'office worker'],
    ['かんごし', '', 'nurse'],
    ['こうこうせい', '', 'high school student'],
    ['しゅふ', '', 'housewife', 'homemaker'],
    ['だいがくいんせい', '', 'graduate student', 'grad student'],
    ['べんごし', '', 'lawyer'],
    // Additional vocabulary: family
    ['おかあさん', '', 'mother', 'mom'],
    ['おとうさん', '', 'father', 'dad'],
    ['おねえさん', '', 'older sister'],
    ['おにいさん', '', 'older brother'],
    ['いもうと', '', 'younger sister'],
    ['おとうと', '', 'younger brother'],
  ],
  // Lesson 2 also lists some lesson 1 additional words (countries, majors, family); they stay in lesson 1 only.
  2: [
    // Words that point
    ['これ', '', 'this one'],
    ['それ', '', 'that one'],
    ['あれ', '', 'that one (over there)', 'that one over there'],
    ['どれ', '', 'which one'],
    ['この', '', 'this …', 'this'],
    ['その', '', 'that …', 'that'],
    ['あの', '', 'that … (over there)', 'that over there'],
    ['どの', '', 'which …', 'which'],
    ['ここ', '', 'here'],
    ['そこ', '', 'there'],
    ['あそこ', '', 'over there'],
    ['どこ', '', 'where'],
    ['だれ', '', 'who'],
    // Food
    ['おいしい', '', 'delicious', 'tasty'],
    ['さかな', '', 'fish'],
    ['とんかつ', '', 'pork cutlet'],
    ['にく', '', 'meat'],
    ['メニュー', '', 'menu'],
    ['やさい', '', 'vegetable', 'vegetables'],
    // Things
    ['かさ', '', 'umbrella'],
    ['かばん', '', 'bag'],
    ['くつ', '', 'shoes'],
    ['さいふ', '', 'wallet'],
    ['ジーンズ', '', 'jeans'],
    ['じてんしゃ', '', 'bicycle', 'bike'],
    ['しんぶん', '', 'newspaper'],
    ['スマホ', '', 'smartphone; mobile', 'smartphone', 'mobile', 'phone', 'cell phone'],
    ['Tシャツ', '', 'T-shirt', 'tshirt', 't shirt'],
    ['とけい', '', 'watch; clock', 'watch', 'clock'],
    ['ノート', '', 'notebook'],
    ['ペン', '', 'pen'],
    ['ぼうし', '', 'hat; cap', 'hat', 'cap'],
    ['ほん', '', 'book'],
    // Places
    ['ぎんこう', '', 'bank'],
    ['コンビニ', '', 'convenience store'],
    ['トイレ', '', 'toilet; restroom', 'toilet', 'restroom', 'bathroom'],
    ['としょかん', '', 'library'],
    ['ゆうびんきょく', '', 'post office'],
    // Majors
    ['えいご', '', 'English (language)', 'english', 'english language'],
    // Money matters
    ['いくら', '', 'how much'],
    ['～えん', '', '… yen', 'yen'],
    ['たかい', '', 'expensive; high', 'expensive', 'high'],
    // Expressions
    ['いらっしゃいませ', '', 'Welcome (to our store).', 'welcome', 'welcome to our store'],
    ['（～を）おねがいします', '', '…, please.', 'please'],
    ['（～を）ください', '', 'Please give me …', 'please give me'],
    ['じゃあ', '', 'then …; if that is the case, …', 'then', 'well then', 'if that is the case'],
    ['どうぞ', '', 'Please.; Here it is.', 'please', 'here it is', 'here you go'],
    ['どうも', '', 'Thank you.', 'thank you', 'thanks'],
  ],
  3: [
    // Entertainment and sports
    ['映画', 'えいが', 'movie', 'film'],
    ['音楽', 'おんがく', 'music'],
    ['雑誌', 'ざっし', 'magazine'],
    ['スポーツ', '', 'sports', 'sport'],
    ['デート', '', 'date (romantic, not calendar)', 'date'],
    ['テニス', '', 'tennis'],
    ['テレビ', '', 'TV', 'television'],
    // Foods and drinks
    ['アイスクリーム', '', 'ice cream'],
    ['ハンバーガー', '', 'hamburger', 'burger'],
    ['お酒', 'おさけ', 'sake; alcoholic drink', 'sake', 'alcoholic drink', 'alcohol'],
    ['お茶', 'おちゃ', 'green tea', 'tea'],
    ['コーヒー', '', 'coffee'],
    ['水', 'みず', 'water'],
    ['朝ご飯', 'あさごはん', 'breakfast'],
    ['昼ご飯', 'ひるごはん', 'lunch'],
    ['晩ご飯', 'ばんごはん', 'dinner', 'supper'],
    // Places
    ['家', 'いえ', 'home; house', 'home', 'house'],
    ['うち', '', 'home; house; my place', 'home', 'house', 'my place'],
    ['学校', 'がっこう', 'school'],
    ['カフェ', '', 'cafe', 'café'],
    // Time
    ['明日', 'あした', 'tomorrow'],
    ['今日', 'きょう', 'today'],
    ['朝', 'あさ', 'morning'],
    ['今晩', 'こんばん', 'tonight', 'this evening'],
    ['毎日', 'まいにち', 'every day', 'everyday'],
    ['毎晩', 'まいばん', 'every night'],
    ['週末', 'しゅうまつ', 'weekend'],
    ['土曜日', 'どようび', 'Saturday'],
    ['日曜日', 'にちようび', 'Sunday'],
    ['いつ', '', 'when'],
    ['～ごろ', '', 'at about …', 'at about', 'about', 'around'],
    // U-verbs
    ['行く', 'いく', 'to go', 'go'],
    ['帰る', 'かえる', 'to go back; to return', 'to go back', 'to return', 'go back', 'return'],
    ['聞く', 'きく', 'to listen; to hear', 'to listen', 'to hear', 'listen', 'hear'],
    ['飲む', 'のむ', 'to drink', 'drink'],
    ['話す', 'はなす', 'to speak; to talk', 'to speak', 'to talk', 'speak', 'talk'],
    ['読む', 'よむ', 'to read', 'read'],
    // Ru-verbs
    ['起きる', 'おきる', 'to get up', 'get up', 'to wake up', 'wake up'],
    ['食べる', 'たべる', 'to eat', 'eat'],
    ['寝る', 'ねる', 'to sleep; to go to sleep', 'to sleep', 'to go to sleep', 'sleep', 'go to sleep'],
    ['見る', 'みる', 'to see; to look at; to watch', 'to see', 'to look at', 'to watch', 'see', 'look at', 'watch'],
    // Irregular verbs
    ['来る', 'くる', 'to come', 'come'],
    ['する', '', 'to do', 'do'],
    ['勉強する', 'べんきょうする', 'to study', 'study'],
    // Adjectives
    ['いい', '', 'good'],
    ['早い', 'はやい', 'early'],
    // Adverbs (あまり and ぜんぜん take a negative verb)
    ['あまり', '', 'not much'],
    ['全然', 'ぜんぜん', 'not at all'],
    ['たいてい', '', 'usually'],
    ['ちょっと', '', 'a little', 'a bit'],
    ['時々', 'ときどき', 'sometimes'],
    ['よく', '', 'often; much', 'often', 'much'],
    // Expressions
    ['そうですね', '', "That's right.; Let me see.", "that's right", 'that’s right', 'thats right', 'let me see'],
    ['でも', '', 'but'],
    ['どうですか', '', 'How about …?; How is …?', 'how about', 'how is', 'how is it'],
    ['ええ', '', 'yes', 'yeah'],
  ],
}

export const vocabItems = (): Item[] =>
  fromLessons(vocab, ([jp, reading, meaning, ...alts]) =>
    withType('vocab', `v-${jp}-${meaning.trim().toLowerCase()}`, jp, meaning, [meaning, ...alts], reading),
  )
