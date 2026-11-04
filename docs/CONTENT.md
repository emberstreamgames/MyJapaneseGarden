# Adding quiz content

Vocab, Kanji and Grammar each have one data file in [src/data/](../src/data/). Add rows to the lesson you want and save. The dev server reloads, and no other code changes are needed.

| Deck | File | Row format |
|---|---|---|
| Vocab | `vocab.ts` | `[japanese, reading, meaning, ...otherMeanings]` |
| Kanji | `kanji.ts` | `[kanji, meaning, readings, ...otherMeanings]` |
| Grammar | `grammar.ts` | `[sentence with ＿＿, missingWord, translation, ...otherTypedAnswers]` |

Rows are grouped by lesson number: `0` is Greetings/Numbers and `1`-`12` are the Genki I lessons. These numbers match the chapter chips, so a chapter's chip turns its rows on or off for quizzes.

**N5 Prep** is JLPT N5 vocabulary kept outside the Genki chapters. It lives in `n5vocab.ts` as one flat list grouped by topic comments, uses the same row format as `vocab.ts`, and has its own **N5 Prep** chip. Words may also appear in a Genki lesson; that's expected. N5 Prep rows have their own ids (`n5-…`), so their stats are tracked separately. Kanji has no N5 Prep group: all 80 N5 kanji are already in `kanji.ts`, under the Genki lesson that teaches each one (L3-L10). The **N5 Kanji** chip brings in the kanji listed in `N5_KANJI_LIST` through the item's `also` field, so a kanji whose Genki lesson is also on is still one card. Add a new N5 kanji to that list as well as to its lesson. A vocab row written as exactly one kanji from the kanji deck (`一`, `山`) is left out of the vocab deck in `items.ts`, so the vocab plant never asks a kanji card.

## Examples

```ts
// vocab.ts
const vocab: ByLesson<Row> = {
  0: [
    ['先生', 'せんせい', 'teacher', 'professor'],
    ['ありがとう', '', 'thank you'], // all kana: leave the reading empty
  ],
}

// kanji.ts
const kanji: ByLesson<Row> = {
  3: [['水', 'water', 'スイ / みず']],
}

// grammar.ts
const grammar: ByLesson<Row> = {
  1: [['わたし＿＿がくせいです。', 'は', 'I am a student.', 'wa', 'ha']],
}
```

## What each field does
- **Prompt:** the first value (the word, kanji or sentence) is shown large. Long prompts shrink to fit.
- **Hint:** the reading (vocab) or translation (grammar) is shown under the prompt. Kanji readings stay hidden until the question is answered, or until the player pays `HINT_COST` coins.
- **Answer:** the meaning or missing word is what multiple choice shows and what a typed answer must match.
- **Typed answers:** the answer plus any extra values in the row are accepted. They are lowercased and trimmed for you. Vocab and kanji answers also pass without parentheses or a leading "to ": `to wear (on the body)` accepts "to wear" and "wear", with no extra values needed.
- Grammar answers are kana. Add romaji alternatives (`'wa'`, `'ha'`) so they can be typed without a Japanese keyboard.

## Rules
- **Unlocking a plant:** a deck needs at least **10 rows** in total (`MIN_DECK_SIZE` in `items.ts`) before its plants can be planted. Below that they show "coming soon". Free practice works with any number.
- **Multiple choice:** distractors come from other rows in the same deck, so keep answers short and similar in kind, such as particles together. A row that shares any accepted answer with the correct row is never a distractor, so near-synonyms (家 "home; house", うち "home; house; my place") can use the book's wording. Don't add a broad extra answer that two words a lesson contrasts would share ("that" on both その and あの), or they never appear as choices together. It falls back to typed answers when fewer than two distinct answers exist.
- **Identity:** each row's id is built from its text, and quiz stats are stored under it. Editing a row's prompt or main meaning resets that row's stats. Fixing typos in the reading or translation is safe.
- **Checks:** in `npm run dev`, the browser console warns about duplicate ids, empty fields and a lesson that isn't 0-12 or `'n5'`.
