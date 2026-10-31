# Genki Grow

A Japanese study app built around the Genki I textbook. There's flashcard practice for each deck, plus a garden game: plants grow when you finish 10-question quizzes. Everything runs in the browser and progress is saved to `localStorage`. There's no backend.

**This is a Svelte web app, not a MapleStory Worlds (MSW) project.**

## Stack and commands

- Svelte 5 (runes: `$state`, `$derived`, `$effect`, `$props`), TypeScript, Vite. No router, no UI library, no test framework yet.
- `npm run dev`: dev server on port 5173. The browser console shows content warnings from `items.ts`.
- `npm run check`: svelte-check plus tsc. Run it after changes; it should report 0 errors and 0 warnings.
- `npm run build`: production build into `dist/`, with base `/GenkiGrow/` for GitHub Pages (`BASE_PATH=/` overrides it). `npm run preview` serves it at `localhost:4173/GenkiGrow/`.
- `Launchers/Windows/*.bat` and `Launchers/Mac/*.command` start and stop the dev server by double-click. The start scripts install dependencies on first run, print the LAN URL for phones, and open the browser. There's no Linux equivalent yet.

## Layout

| Path | Role |
|---|---|
| `src/App.svelte` | Header (the title returns to the Garden) and screens (Garden by default, Garden Shop, Collection, each deck, Stats), the chapter chips (lessons 0-12, then N5 Prep; hidden on Shop, Collection and the kana decks), and the global coin-flight layer and level-up popup |
| `src/lib/Menu.svelte` | Hamburger button (fixed top right) and the slide-in panel for switching screens. The free practice decks are `hidden` in `App`'s `tabs` for now, so only Garden, Garden Shop, Collection and Stats are listed |
| `src/data/items.ts` | `Item`/`Deck` types, generated kana decks, `ITEMS`, `MIN_DECK_SIZE`, dev-only content checks |
| `src/data/{vocab,kanji,grammar}.ts` | Hand-written content rows grouped by lesson (see `docs/CONTENT.md`) |
| `src/data/n5vocab.ts` | N5 Prep: JLPT N5 vocab outside the Genki chapters (`lesson: 'n5'`, ids `n5-…`); overlap with Genki lessons is intended |
| `src/data/build.ts` | Turns rows into `Item`s (`fromLessons`, `withType`, `norm`), plus the `Lesson` type and the `N5` group key |
| `src/lib/store.svelte.ts` | Single `$state` save object `app`, `save()`, stats, XP, import/export, garden actions, debug actions |
| `src/lib/garden.ts` | Pure garden rules: species, stages, phases, cooldown, preserve and visitor timing, `normalizeGarden` |
| `src/lib/streak.ts` | Pure daily-streak rules: local day numbers, rain days, milestone coins |
| `src/lib/collection.ts`, `Collection.svelte`, `FlowerHead.svelte` | Pressed-flower collection: every species/variant (`FLOWERS`), discovered on bloom, completed on preserve. `FlowerHead` draws the head without a stem |
| `Welcome.svelte` | Welcome-back card shown by `Garden` after `WELCOME_AFTER_MS` away (`seenAt`) |
| `src/lib/decor.ts`, `Decor.svelte`, `DecorSprite.svelte`, `Shop.svelte` | Lawn decorations: the shop catalog and pure place/move/unplace/upgrade rules (`decor.ts`), the garden layer on `DECOR_SPOTS` (tap an empty spot to pick from the inventory, tap a placed one for its upgrade/put-away sheet, drag to move or swap), the art per kind and tier, and the shop screen (Decorations and Garden tabs) |
| `src/lib/look.ts`, `Sky.svelte` | Garden looks: the catalog and palettes for lawn, soil, bed edging and atmosphere, and what's owned and worn. `meadow.ts` `scene()` paints the first three (it's cheap, about 3 ms, and keeps the same seeded picture); `Sky` lays the atmosphere over the garden, CSS only |
| `coinfly.svelte.ts`, `CoinFlights.svelte` | Coins flying from where they were earned to the element marked `data-coin-target` (the garden HUD counter). Counters show `app.coins - inFlight.coins` so they tick up as coins land |
| `src/lib/tour.ts`, `Tour.svelte` | New-player tutorial: the step order (`TOUR_STEPS`) and the overlay card with a spotlight that follows its target. Components report actions with `tourDid(step)` |
| `ConfirmSheet.svelte` | The app's yes/no sheet, used for every confirmation (never the browser's `confirm()`). `danger` marks a yes that loses something. Mount it outside other sheets |
| `PressFlower.svelte` | The scene between Preserve and the Collection: the flower grows, is snipped from its stem, and is shut in a book. Mounted in `App`, tap to skip, left out under reduced motion. The reward is saved before it starts |
| `LevelUp.svelte` | Full-screen level-up: the old number shakes and shrinks, then pops into the new one with confetti. `App` shows it whenever `level()` rises |
| `Visitors.svelte` | Butterflies and birds: one lands when a visitor is due, and tapping it opens a card with a review word and coins |
| `src/lib/quiz.svelte.ts` | `Quiz` class shared by free practice and garden quizzes (weighted picks, choice/type) |
| `src/lib/creatures.ts`, `CreatureSprite.svelte`, `CreatureBook.svelte` | Visitor creatures: the catalog of 10 creatures and their looks plus the pure collection rules, the art for every creature and look (a `<g>` to put inside an `<svg>`), and the Creatures tab of the Collection |
| `creatures.html`, `src/creatures/` | Dev-only preview of every creature and look (`/creatures.html`; not in the build). Tap to like, then copy the list |
| `src/lib/plants.ts`, `PlantSprite.svelte` | SVG plant art per species and stage |
| `src/lib/blooms.ts` | Bloom colour variants (gradients, patterns, metals) drawn over the `plants.ts` shapes. Each plot rolls `variant` when planted (0 = original); it only shows once bloomed |
| `palettes.html`, `src/palette/` | Dev-only preview of every bloom variant (`/palettes.html` on the dev server; not in the build) |
| `layouts.html`, `src/layouts/` | Dev-only comparison of 9-16 plot layouts with plant size, study load, weed spots and a tap test (`/layouts.html`; not in the build). The game uses 3-2-3-2 |
| `src/lib/meadow.ts`, `PlotTile.svelte` | Garden bed artwork (seeded, built once) and the 10 plot positions in staggered rows of 3-2-3-2 (`SPOTS`; plants drawn at `PLANT_SCALE`). Each `PlotTile` draws its plant on its spot with an oval button over its soil (`PAD`); the pads sit above every plant (`.plots` layer), so the soil wins over a plant reaching up from the row in front. The painted plant and its badge are tappable too |
| `WeedSprite.svelte`, `WeedPluck.svelte` | Weed art (3 kinds) and the pluck animation. Weeds sit on `WEED_SPOTS` in `meadow.ts`: lawn points clear of every plot's plant |
| `Ants.svelte` | Ambient ants walking `ANT_LANES` (`meadow.ts`) while the garden is open; one may carry a coin. Its SVG layer matches the scene's box, bleed included |
| `src/lib/sfx.ts` | Sounds generated with the Web Audio API (no audio files) |
| `public/manifest.webmanifest`, `public/sw.js`, `public/icon*` | PWA: home-screen install and offline cache. `sw.js` is registered in `main.ts` (production only); it serves the page network-first and hashed assets cache-first, and drops old builds' assets |
| `.github/workflows/deploy.yml` | Runs check and build on every push to `main`, then deploys to GitHub Pages |
| `src/lib/Stats.svelte` | Stats and settings. Tap the version number 7 times to unlock the debug tools. |
| `src/lib/DevTools.svelte` | Debug panel behind a 🛠 button on every screen once unlocked: give coins, set a plot's stage, skip its timer, and the garden shortcuts. Mounted in `App` |
| `src/lib/GrowBeam.svelte` | The growth moment, played on the bed when a ready plant is tapped: sunbeam, stars, twinkles falling to the plant, the stage change and coins at `PEAK`, then fly text naming the old and new stage. Its SVG shares the scene's box, so it's drawn in bed units. `Garden` keeps a list, so several plants can grow at once |

## Conventions

- Keep `garden.ts` pure: no store, DOM, or `Date.now()` inside rules. Pass `now` in. Store functions in `store.svelte.ts` apply the rules and call `save()`.
- Every change to `app` must call `save()`, unless a bound input does it (`onchange={save}`).
- Sound callers check `app.muted` before calling `sfx.*`.
- Confirmations use `ConfirmSheet`, never `confirm()`, `alert()` or `prompt()`.
- Item ids come from their content (`v-<jp>-<meaning>`, `n5-<jp>-<meaning>`, `j-<kanji>`, `g-<sentence>`, `h-`/`k-<kana>`), and stats are stored under them. Changing a row's prompt or main meaning resets its stats.
- Typed answers are stored trimmed and lowercased. Grammar rows should include romaji alternatives.
- Saved data: key `genki-study-v1`, `SAVE_VERSION = 9`. Loaded or imported garden data always goes through `normalizeGarden`. If the save shape changes, bump the version and migrate in `repair()` (used by both `load()` and `importData()`).
- Code style: no semicolons, single quotes, 2-space indent, short comments that explain why.

## Game rules (quick reference)

- 10 plots (3-2-3-2 staggered) and 10 species, two per deck. Saves from before version 7 had 16: `shrinkGarden` keeps the 10 most-grown, and `repair()` presses each extra bloom into the collection and pays `GROW_COINS × stage` for each other extra. Stages run 1 (Seeded) to 7 (Bloomed). An empty plot is `null`.
- Phases: `thirsty`, then a quiz is done, then `resting` (20 h `COOLDOWN_MS`, shown as a filling bar with a clock under the plant), then `ready`, then tap to grow. Tapping a ready plant skips the plot sheet and plays `GrowBeam`; the stage and coins only change at its peak, so a beam cut short (a quiz, leaving the screen) leaves the plant ready. A bloomed plant goes back to `thirsty` (groom) after each cooldown.
- XP: 10 + 2×combo (capped at 10) for each correct answer, plus 50 for watering or 30 for grooming when a quiz is finished. A level is every 1200 XP (`XP_PER_LEVEL`).
- Coins: +10 for each growth stage, +5 for each weed. Spending 100 ends a resting plant's cooldown at once (`skipWait`) and goes straight on to growing it.
- Kanji hints: in every quiz, a kanji's readings stay hidden until the question is answered, or until the player pays `HINT_COST` (5) coins during it. Vocab readings and grammar translations stay free.
- Weeds: one every 2 h (`WEED_EVERY_MS`), at most 6, caught up from `weedAt` on load. Tapping one shows a pre-screen naming the question's deck (Start or ✕), then asks a single question from that deck, picked at random among decks with items in the pool. A correct answer pulls it for 5 coins and 5 bonus XP; a wrong one leaves it and swaps in a new question.
- Chapters: the chips choose which lessons' vocab, kanji and grammar are in the pool. Hiragana and katakana are always fully in it (`poolFor`).
- Mastery: a card is mastered at a streak of `MASTERY_STREAK` (5). Stats shows a ring per deck over the cards in the pool.
- Ants: a line of 1-3 crosses the lawn every 15-40 s while the garden is open, some carrying crumbs or food. Once `ANT_COIN_EVERY_MS` (1 h) has passed since the last ant coin was collected (`antCoinAt`), the next lead ant carries a coin; tapping it gives 5 coins. An untapped coin ant leaves the coin for a later ant. With reduced motion, only the coin ant shows, standing still.
- A deck's plants unlock once it has at least `MIN_DECK_SIZE` (10) items.
- Perfect quiz: 10/10 on a watering or grooming quiz gives +15 coins (`PERFECT_COINS`). The summary also shows the best combo of the run.
- Streak (`streak.ts`): days in a row with a finished watering or grooming quiz, counted at local midnight. Every 7th day earns a rain day (at most 2), and each covers one missed day. A streak that can't be covered restarts at day 1, with no other penalty. Milestone coins: 15 at day 3, 30 at day 7, 50 at day 14, and 100 every 30 days.
- Collection: a species/variant is discovered when a plant of it blooms. Once a bloomed plant has been groomed `PRESERVE_GROOMS` (3) times, it can be preserved, after a confirmation: the plot is freed, the flower is pressed into the collection (completing it), and after the `PressFlower` scene the player is taken to the Collection page. It pays 25 coins, plus 50 the first time a flower is completed.
- Welcome back: opening the garden after 4 h or more away shows what changed (ready and thirsty plants, new weeds, an ant coin, the streak or rain).
- Shop and decorations: 20 decorations (30 to 800 coins) can be bought any number of times and placed on the open lawn spots (`DECOR_SPOTS`, kept clear of weed spots). 6 are open from the start; 6 more cost 150 to 1000 coins each (`SPOT_PRICES`). Saved as `decor: { owned, placed, tiers, open }`, repaired by `normalizeDecor`. If the shop was opened from an empty spot's picker, the next purchase is placed on that spot.
- Upgrades: per kind, so every copy changes together. Plain to Adorned costs 2× the price and adds a touch unique to that kind; Adorned to Golden costs 4× and turns it gold. Upgrades are cosmetic. The gift rock prices as 50.
- Garden looks: 4 lawns, 3 soils, 3 bed edgings and 4 atmospheres on top of the free originals (200 to 900 coins). Bought once, swapped free, and tried on in the shop's preview before paying. Saved as `look: { owned, wearing }`, repaired by `normalizeLook`.
- Shiny rock: a gift-only decoration from the tutorial (`gift: true`, so it's left out of `SHOP_DECOR` and `buyDecor` refuses it). `giftRock` gives it once, even on a replay.
- Tutorial: new saves start at `tour: 'hello'`; saves from before version 6 skip it. Steps: welcome, HUD, visitor, ant, weed, plant (the sheet closes without offering water), shop (the first + tapped holds a gift: a shiny rock, placed on that spot, then a button to the shop), inside the shop, tap the 💧, take the quiz. During it, visitors and coin ants only come on their own steps (called in at once; the coin ant stops halfway along its lane until tapped), and the weed asks hiragana. `prepTour` makes sure each step's target exists. Closing the plot sheet on the last step goes back to the 💧 step. Replay from the menu or Stats; skip from the card.
- Level-ups: a popup celebrates each new level (it plays the level-up sound; the quiz no longer does). It waits while a quiz holds `levelHold` (`holdLevelUps()`): a garden or weed quiz until it closes, free practice until Next is pressed.
- Visitors: once `VISITOR_EVERY_MS` (20 min) has passed since the last one was thanked, a creature comes, with an even chance of each creature and then of each of its looks (`rollCreature`). Butterflies, dragonflies, bees and ladybugs usually land on a flower; birds and owls swoop to the lawn; frogs, rabbits, cats and tanuki hop in from the side. It carries a rolled-up note until thanked. Tapping it shows a vocab word to review (missed words come up more often); confirming gives 1-3 coins. One that isn't thanked leaves after 2.5 min, and a later one comes instead.
- Creature collection: tapping a visitor logs that creature and look in `creatures` (`meetCreature`), unlocking it on the Collection's Creatures tab, even if the card is closed without thanking. Keys use look ids, so looks can be cut without shifting saves; `normalizeCreatures` drops entries for cut looks. There's no coin reward for a new one.

## Current status (2026-10-30)

- Added the creature collection, 8 new creatures and 65 looks in all, chosen on `/creatures.html` (the yellow ladybug was cut).
- Growing a plant now happens on the garden with a sunbeam (`GrowBeam`) instead of in the plot sheet, and the debug tools moved from Stats to the 🛠 panel (`DevTools`), which adds any coin amount and a per-plot Skip timer. Checked in headless Chromium and WebKit (phone emulation), including reduced motion. The sounds were not checked by ear.
- Added 12 decorations, tiered upgrades, buyable lawn spots, and garden looks (lawn, soil, edging, atmosphere). Tapping a placed decoration now opens a sheet instead of storing it. Checked in headless Chromium and WebKit, including a version 7 save migrating.
- Added the garden shop and decorations, flying coins, the level-up popup, mastery rings on Stats, the always-visible garden quiz combo, glossed wrong-answer encouragement with an explanation of the answer, and notes carried by visitors. Kana ignore the chapter chips. Checked in headless Chromium and WebKit (iPhone emulation); dragging decorations with touch was only checked with a mouse.
- Fixed: ants stood still on iOS because WebKit ignores keyframes passed as a Svelte `$state` proxy. Pass `$state.snapshot(...)` (or a plain array) to `el.animate`.
- Streaks, the welcome-back card, the pressed-flower collection with Preserve, perfect-quiz bonuses, and butterfly/bird visitors were added. They were checked in a headless browser, except the quiz summary's streak and perfect lines.
- Type-check and build are clean. There are no tests.
- Hiragana and katakana are complete.
- Kanji: all 80 JLPT N5 kanji, in Genki lessons 3-10. Genki's N4+ Reading & Writing kanji (65 more) are not added.
- Vocab: Genki lessons 1-3 so far, plus N5 Prep (565 words covering most of the ~670-word Waller N5 list).
- Grammar has no content yet.
- JLPT N5 research (lists, Genki mapping, licensing) is in `reports/JLPT N5 vocabulary grammar kanji.md`, with notes in `research_notes/`.

## Known issues and planned work

1. Add the remaining Genki I vocab (lessons 0, 4-12) and grammar content, following `docs/CONTENT.md`. The research notes have about 45 draft grammar items that need a native-speaker check.
2. `importData()`/`load()` repair the garden, weeds, streak and collection. Also check `lessons`, `xp`, `best`, and `stats`.
3. Add unit tests (for example Vitest) for `garden.ts`, starting with phases, cooldown edge cases, and `normalizeGarden`.
4. Replace the stock Vite `README.md` and rename the package from `japanesestudyapp`.
