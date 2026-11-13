# My Japanese Garden

A Japanese study app that follows the chapters of **Genki I**. Finish short quizzes to water your plants, grow them into flowers, and fill a pressed-flower collection along the way. There are kana, kanji and vocab quizzes, and you can answer by multiple choice, by typing, or by drawing the character.

It's meant to go alongside the textbook, not replace it. You'll still want your copy of Genki I.

## Play it

Open **https://emberstreamgames.github.io/MyJapaneseGarden/** on your phone or computer. There's nothing to install or sign up for.

- **On a phone:** use your browser's *Add to Home Screen* to get an app icon. It works offline after the first visit.
- **Choosing chapters:** tap **📚 Chapters** in the garden to pick the Genki lessons you've covered. Hiragana and katakana are always included.
- **Answer style:** set it in Stats. Choose multiple choice, typing, drawing, or a mix.

### Your progress stays on your device

There are no accounts. Your garden and study history are saved in the browser you use, so:

- a different phone or browser starts a fresh garden;
- clearing your browser's site data erases it.

To move or back up your progress, go to **Stats → Export progress** to save a file, then **Import progress** on the other device.

## What's in it so far

- Hiragana and katakana: complete
- Kanji: all 80 JLPT N5 kanji, under the Genki lessons that teach them (3-10)
- Vocab: Genki I lessons 1-6, plus an optional *N5 Prep* set of extra JLPT N5 words
- Grammar: not yet

Spotted a wrong reading or meaning? Tell me, or open an issue on GitHub.

## Running it yourself

Only needed if you want to change the app. You'll need [Node.js](https://nodejs.org/) 20.19 or newer (22 is fine).

```sh
npm install
npm run dev      # http://localhost:5173
```

Or double-click the launcher for your system in `Launchers/`. The launchers install everything on first run, open the browser, and print an address for testing on your phone over the same Wi-Fi.

Other commands:

```sh
npm test         # rule tests
npm run check    # type check
npm run build    # production build into dist/
```

To add or fix words, see [docs/CONTENT.md](docs/CONTENT.md). Each lesson's words are a plain list in `src/data/`.

## Credits

Stroke data for drawn answers comes from [KanjiVG](https://kanjivg.tagaini.net/) by Ulrich Apel and contributors, under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). `src/data/strokes.json` is derived from it and shares that licence.
