@AGENTS.md

# Genki Grow

A Japanese study app built around the Genki I textbook. There's flashcard practice for each deck, plus a garden game: plants grow when you finish 10-question quizzes. Everything runs in the browser and progress is saved to `localStorage`. There's no backend.

**This is a Svelte web app, not a MapleStory Worlds (MSW) project.** Ignore `AGENTS.md` and any MSW skill or router hooks here.

## Stack and commands

- Svelte 5 (runes: `$state`, `$derived`, `$effect`, `$props`), TypeScript, Vite. No router, no UI library, no test framework yet.
- `npm run dev`: dev server on port 5173. The browser console shows content warnings from `items.ts`.
- `npm run check`: svelte-check plus tsc. Run it after changes; it should report 0 errors and 0 warnings.
- `npm run build`: production build into `dist/`.
- `Launchers/Windows/*.bat` and `Launchers/Mac/*.command` start and stop the dev server by double-click. The start scripts install dependencies on first run, print the LAN URL for phones, and open the browser. There's no Linux equivalent yet.

## Layout

| Path | Role |
|---|---|
| `src/App.svelte` | Header and screens (Garden by default, each deck, Stats) and the chapter chips (lessons 0-12, then N5 Prep) |
| `src/lib/Menu.svelte` | Hamburger button (fixed top right) and the slide-in panel for switching screens |
| `src/data/items.ts` | `Item`/`Deck` types, generated kana decks, `ITEMS`, `MIN_DECK_SIZE`, dev-only content checks |
| `src/data/{vocab,kanji,grammar}.ts` | Hand-written content rows grouped by lesson (see `docs/CONTENT.md`) |
| `src/data/n5vocab.ts` | N5 Prep: JLPT N5 vocab outside the Genki chapters (`lesson: 'n5'`, ids `n5-…`); overlap with Genki lessons is intended |
| `src/data/build.ts` | Turns rows into `Item`s (`fromLessons`, `withType`, `norm`), plus the `Lesson` type and the `N5` group key |
| `src/lib/store.svelte.ts` | Single `$state` save object `app`, `save()`, stats, XP, import/export, garden actions, debug actions |
| `src/lib/garden.ts` | Pure garden rules: species, stages, phases, cooldown, `normalizeGarden` |
| `src/lib/quiz.svelte.ts` | `Quiz` class shared by free practice and garden quizzes (weighted picks, choice/type) |
| `src/lib/plants.ts`, `PlantSprite.svelte` | SVG plant art per species and stage |
| `src/lib/blooms.ts` | Bloom colour variants (gradients, patterns, metals) drawn over the `plants.ts` shapes. Each plot rolls `variant` when planted (0 = original); it only shows once bloomed |
| `palettes.html`, `src/palette/` | Dev-only preview of every bloom variant (`/palettes.html` on the dev server; not in the build) |
| `src/lib/meadow.ts`, `PlotTile.svelte` | Garden bed artwork (seeded, built once) and the 16 plot positions; each `PlotTile` draws its plant on its spot under a transparent button clipped to the soil (`hitClip`), so taps on the lawn do nothing; the painted plant and its badge are tappable too |
| `WeedSprite.svelte`, `WeedPluck.svelte` | Weed art (3 kinds) and the pluck animation. Weeds sit on `WEED_SPOTS` in `meadow.ts`: lawn points clear of every plot's plant |
| `Ants.svelte` | Ambient ants walking `ANT_LANES` (`meadow.ts`) while the garden is open; one may carry a coin. Its SVG layer matches the scene's box, bleed included |
| `src/lib/sfx.ts` | Sounds generated with the Web Audio API (no audio files) |
| `src/lib/Stats.svelte` | Stats and settings. Tap the version number 7 times to unlock the debug tools. |

## Conventions

- Keep `garden.ts` pure: no store, DOM, or `Date.now()` inside rules. Pass `now` in. Store functions in `store.svelte.ts` apply the rules and call `save()`.
- Every change to `app` must call `save()`, unless a bound input does it (`onchange={save}`).
- Sound callers check `app.muted` before calling `sfx.*`.
- Item ids come from their content (`v-<jp>-<meaning>`, `n5-<jp>-<meaning>`, `j-<kanji>`, `g-<sentence>`, `h-`/`k-<kana>`), and stats are stored under them. Changing a row's prompt or main meaning resets its stats.
- Typed answers are stored trimmed and lowercased. Grammar rows should include romaji alternatives.
- Saved data: key `genki-study-v1`, `SAVE_VERSION = 3`. Loaded or imported garden data always goes through `normalizeGarden`. If the save shape changes, bump the version and migrate in `repair()` (used by both `load()` and `importData()`).
- Code style: no semicolons, single quotes, 2-space indent, short comments that explain why.

## Game rules (quick reference)

- 16 plots and 10 species, two per deck. Stages run 1 (Seeded) to 7 (Bloomed). An empty plot is `null`.
- Phases: `thirsty`, then a quiz is done, then `resting` (20 h `COOLDOWN_MS`), then `ready`, then tap to grow. A bloomed plant goes back to `thirsty` (groom) after each cooldown.
- XP: 10 + 2×combo (capped at 10) for each correct answer, plus 50 for watering or 30 for grooming when a quiz is finished. A level is every 100 XP.
- Coins: +10 for each growth stage, +5 for each weed. Spending 100 ends a resting plant's cooldown at once (`skipWait`).
- Weeds: one every 2 h (`WEED_EVERY_MS`), at most 6, caught up from `weedAt` on load. Tapping one asks a single question from a random deck with items in the enabled chapters. A correct answer pulls it for 5 coins and 5 bonus XP; a wrong one leaves it and swaps in a new question.
- Ants: a line of 1-3 crosses the lawn every 15-40 s while the garden is open, some carrying crumbs or food. Once `ANT_COIN_EVERY_MS` (1 h) has passed since the last ant coin was collected (`antCoinAt`), the next lead ant carries a coin; tapping it gives 5 coins. An untapped coin ant leaves the coin for a later ant. With reduced motion, only the coin ant shows, standing still.
- A deck's plants unlock once it has at least `MIN_DECK_SIZE` (10) items.

## Current status (2026-10-27)

- Type-check and build are clean. There are no tests.
- Hiragana and katakana are complete.
- Kanji: all 80 JLPT N5 kanji, in Genki lessons 3-10. Genki's N4+ Reading & Writing kanji (65 more) are not added.
- Vocab: Genki lessons 1-3 so far, plus N5 Prep (565 words covering most of the ~670-word Waller N5 list).
- Grammar has no content yet.
- JLPT N5 research (lists, Genki mapping, licensing) is in `reports/JLPT N5 vocabulary grammar kanji.md`, with notes in `research_notes/`.

## Known issues and planned work

1. Add the remaining Genki I vocab (lessons 0, 4-12) and grammar content, following `docs/CONTENT.md`. The research notes have about 45 draft grammar items that need a native-speaker check.
2. Bug: `quiz.svelte.ts` calls `sfx.levelUp()` without checking `app.muted`.
3. Kana are hard-wired to lessons (hiragana = 1, katakana = 2 in `items.ts`), so turning off chip 1 or 2 empties that deck. Decide whether kana should ignore the chips. The chips also appear on the Garden and Stats tabs, where they're confusing.
4. `importData()`/`load()` only repair the garden. Also check `lessons`, `mode`, `xp`, `best`, and `stats`.
5. Add unit tests (for example Vitest) for `garden.ts`, starting with phases, cooldown edge cases, and `normalizeGarden`.
6. Replace the stock Vite `README.md` and rename the package from `japanesestudyapp`.
