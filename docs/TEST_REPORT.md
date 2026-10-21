# Test report

Run on 18 October 2026, on the final code in this repository. Results are reproducible with `npm run test:all`. The same steps run in the GitHub Actions workflow before every deployment.

## Summary

| Check | Result |
|---|---|
| Type check (`tsc -b`, strict) | ✅ no errors |
| Data validation (`npm run data:validate`): 249 monsters, locale key parity, media references | ✅ passed |
| Production build (`npm run build`) | ✅ passed |
| Unit tests (Vitest) | ✅ **32 / 32 passed** |
| End-to-end tests (Playwright, Chromium), desktop 1280×900 + Pixel 7 mobile | ✅ **50 / 50 passed** (25 scenarios × 2 viewports) |
| Flakiness check (`--repeat-each=2`) | ✅ 100 / 100 passed (an earlier intermittent failure was traced to bug 7 below and fixed) |
| Clean install from the packaged zip (`npm ci`, test, build) | ✅ passed |

## How the deployment is simulated

The end-to-end tests do **not** use the dev server. `dist/` is built first (`npm run build`), then Playwright serves it with `vite preview --base /test-repo/`, the same sub-path layout as `https://<user>.github.io/<repo>/`. The tests then check that:

- every request returns 2xx/3xx: no 404s for scripts, styles, fonts or data;
- no request goes outside `/test-repo/`, and no request goes to any external host;
- direct navigation to every route, and a refresh on it, renders the page.

**Not verified yet:** the live `github.io` URL. This session had no linked GitHub account, so no test repository could be created. The first workflow run on your repository performs the same end-to-end suite before publishing.

## Unit tests (`tests/engine.test.ts`)

| Area | Test | Result |
|---|---|---|
| data | has unique ids and both names for every monster | ✅ |
| Classic comparisons | compares sets: identical, overlap, disjoint, both empty | ✅ |
| Classic comparisons | gives arrows towards the answer for numbers | ✅ |
| Classic comparisons | treats overlapping threat ranges as partial | ✅ |
| Classic comparisons | a monster compared with itself is all correct | ✅ |
| Classic comparisons | Rathalos vs Rathian behaves as expected | ✅ |
| Classic comparisons | unknown fields compare as unknown, never as wrong | ✅ |
| daily selection | is deterministic for a day and mode | ✅ |
| daily selection | does not depend on the order of the pool | ✅ |
| daily selection | gives different answers to different modes on most days | ✅ |
| daily selection | never repeats a monster within one cycle of the pool | ✅ |
| daily selection | respects the game selection | ✅ |
| daily selection | infinite picks avoid recent answers | ✅ |
| daily selection | dayKey and dayNumber are consistent | ✅ |
| search | ranks prefix matches first | ✅ |
| search | finds monsters by Arabic name, tolerant of hamza forms | ✅ |
| search | finds Arabic names while the UI is in English and vice versa | ✅ |
| search | hides already guessed monsters | ✅ |
| search | ignores apostrophes, hyphens and spacing | ✅ |
| search | every monster is found by its own English and Arabic name | ✅ |
| compendium masking | hides the name and its parts in both languages | ✅ |
| compendium masking | leaves descriptions without the name untouched | ✅ |
| share links | round-trips the game selection | ✅ |
| share links | only accepts challenges for today | ✅ |
| share links | builds an emoji grid of at most five rows | ✅ |
| translations | uses Arabic plural forms | ✅ |
| translations | uses English plural forms and interpolation | ✅ |
| persistence | discards corrupted rounds instead of crashing | ✅ |
| persistence | survives garbage in localStorage | ✅ |
| threat levels | every monster has one, within the 1–10 star scale | ✅ |
| threat levels | follows the original MHDLE ratings | ✅ |
| threat levels | falls back to the in-game value for the one monster MHDLE does not list | ✅ |

## End-to-end tests (`tests/e2e/`)

| File | Scenario | Desktop | Mobile |
|---|---|---|---|
| `deploy.spec.ts` | GitHub Pages sub-path deployment › every request succeeds and stays under the repository path | ✅ | ✅ |
| `deploy.spec.ts` | GitHub Pages sub-path deployment › fonts and styles actually load | ✅ | ✅ |
| `deploy.spec.ts` | GitHub Pages sub-path deployment › direct navigation and refresh work for #/classic | ✅ | ✅ |
| `deploy.spec.ts` | GitHub Pages sub-path deployment › direct navigation and refresh work for #/compendium | ✅ | ✅ |
| `deploy.spec.ts` | GitHub Pages sub-path deployment › direct navigation and refresh work for #/about | ✅ | ✅ |
| `deploy.spec.ts` | GitHub Pages sub-path deployment › direct navigation and refresh work for #/surveyor | ✅ | ✅ |
| `deploy.spec.ts` | GitHub Pages sub-path deployment › direct navigation and refresh work for #/roar | ✅ | ✅ |
| `deploy.spec.ts` | GitHub Pages sub-path deployment › direct navigation and refresh work for #/does-not-exist | ✅ | ✅ |
| `deploy.spec.ts` | GitHub Pages sub-path deployment › modes without installed media explain why instead of breaking | ✅ | ✅ |
| `gameplay.spec.ts` | gameplay › first visit asks for the game selection and the home board lists the modes | ✅ | ✅ |
| `gameplay.spec.ts` | gameplay › Classic: wrong guesses add coloured rows, the answer wins, results persist | ✅ | ✅ |
| `gameplay.spec.ts` | gameplay › infinite mode gives new rounds repeatedly and does not count as daily wins | ✅ | ✅ |
| `gameplay.spec.ts` | gameplay › Compendium: masked entry, hints unlock at 5 and 10 wrong guesses | ✅ | ✅ |
| `gameplay.spec.ts` | gameplay › search: keyboard navigation, Arabic names, no match message | ✅ | ✅ |
| `gameplay.spec.ts` | gameplay › game selection limits answers and search, and persists | ✅ | ✅ |
| `gameplay.spec.ts` | gameplay › share link: adopt the friend selection and see the challenge | ✅ | ✅ |
| `gameplay.spec.ts` | gameplay › statistics dialog shows persisted values | ✅ | ✅ |
| `i18n.spec.ts` | localisation › English is LTR, Arabic is RTL, and the choice persists | ✅ | ✅ |
| `i18n.spec.ts` | localisation › switching language keeps the active round, guesses and hints | ✅ | ✅ |
| `i18n.spec.ts` | localisation › every screen is fully translated into Arabic | ✅ | ✅ |
| `i18n.spec.ts` | localisation › English screens contain no stray Arabic | ✅ | ✅ |
| `i18n.spec.ts` | localisation › mixed-direction values render in the right order in Arabic | ✅ | ✅ |
| `layout.spec.ts` | no horizontal page overflow (en) | ✅ | ✅ |
| `layout.spec.ts` | no horizontal page overflow (ar) | ✅ | ✅ |
| `layout.spec.ts` | quest board and search box are usable at this viewport | ✅ | ✅ |

What these cover, against the brief's checklist:

| Requirement | Covered by |
|---|---|
| All implemented modes start | deploy: direct navigation per route; gameplay: Classic and Compendium flows |
| Guessing and validation | gameplay: Classic (rows, repeat guesses not offered), Compendium |
| Search and autocomplete | gameplay: search (keyboard, Arabic names, no-match); unit: search ranking and normalisation |
| Clues and comparisons correct | unit: comparison rules; e2e: winning row is 9/9 green; Arabic threat order |
| Win / loss conditions | gameplay: win screen, persistence after reload. The original has **no loss condition** (unlimited guesses); this is reproduced and documented |
| New rounds repeatedly | gameplay: three infinite rounds in a row, all different, not counted as daily wins |
| Statistics and preferences persist | gameplay: stats after reload, game selection after reload; i18n: language after reload |
| Language switch keeps the game | i18n: guesses and opened hints survive EN → AR → EN |
| Desktop and mobile | every scenario runs on both viewports; layout: no horizontal overflow, usable search list |
| LTR / RTL | i18n: `dir`/`lang` attributes, persisted choice |
| Everything translated | i18n: scans visible text of home, Classic (playing and won), Compendium, About, both dialogs and the unavailable-mode page for untranslated Latin words; English screens for stray Arabic |
| Mixed-language content | i18n: threat range rendered LTR inside RTL; Arabic names inside the grid |
| Arabic search | unit + e2e |

## Verified manually (not automated)

- **Surveyor and Roar with media installed.** A throwaway copy of the project was built with generated placeholder pictures and tones for all 249 IDs (not shipped). Checked:
  - both modes appear on the quest board and in the navigation;
  - the Surveyor filter starts at `blur(15px) brightness(0)` and after 3 misses is `blur(12px) brightness(0.15)`;
  - winning shows the picture;
  - the Roar player plays and pauses;
  - the cleared seal appears on the home board.
- **Visual review** of screenshots: home, Classic (playing and won), Compendium, dialogs, statistics, in English and Arabic, at 1280 px and 390 px.

## Bugs found by testing and fixed

1. **Search picked the wrong monster.** If the mouse rested where the result list opened, hovering changed the highlighted result, so Enter chose it (for example "Crystalbeard Uragaan" instead of "Uragaan"). Now only real mouse movement changes the highlight.
2. **Search list closed by itself.** Clicking a hint and quickly returning to the search box let an old blur timer close the results. The timer is now cancelled on focus.
3. **Phone pages wider than the screen.** The Classic grid and the Compendium hint boxes stretched the page to 466 px on a 412 px phone, which makes mobile browsers zoom out and misplace taps (dialog buttons became hard to press). Grid children may now shrink, and the grid scrolls inside its own panel.
4. **Threat ranges reversed in Arabic.** "5–7★" displayed as "★7–5" in RTL. Values are now isolated as LTR.
5. **Missing data shown grey on the winning row.** Missing values compared with themselves showed as "no data". Equal missing values now count as a match.
6. **Corrupted saved data could crash a round.** Saved rounds are now validated when loaded.
7. **Monsters with apostrophes were hard to find.** Typing "dahren" didn't find Dah'ren Mohran; the same applied to Safi'jiiva and Xeno'jiiva. An infinite-mode test hit this when one of them came up as the answer. Search now ignores apostrophes and spacing, and a new unit test checks that all 249 monsters are found by their English name, Arabic name and ID.
8. **Wrong threat level for three Wilds monsters (found 21 October 2026).** Balahara, Doshaguma and Nu Udra showed threat 6. The wiki writes Wilds ratings as a per-encounter range (`★-★★★★★`), and the importer counted the stars. They were set to "?", and then replaced by MHDLE's ratings (see DATA_SOURCES.md).
