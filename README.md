# MH DLE — Arabic / English

A daily Monster Hunter guessing game in the style of [Monster Hunter DLE](https://monster-hunter-dle.akato.fr/en). It's rebuilt from scratch in React + TypeScript + Vite, fully bilingual (English LTR, Arabic RTL), and runs as a **static site on GitHub Pages** with no server.

> Unofficial fan project. Monster Hunter and its monster names are trademarks of Capcom Co., Ltd. Not affiliated with or endorsed by Capcom or by the original MHDLE.

- [What's in the game](#whats-in-the-game)
- [Deploy to GitHub Pages (step by step)](#deploy-to-github-pages-step-by-step)
- [Develop, test, build](#develop-test-build)
- [Architecture](#architecture)
- [Data](#data) · [Media for Surveyor and Roar](#media-for-surveyor-and-roar) · [Translations](#translations)
- [Limitations](docs/LIMITATIONS.md) · [Test report](docs/TEST_REPORT.md) · [Feature inventory of the original](docs/FEATURE_INVENTORY.md) · [Differences](docs/DIFFERENCES.md) · [Data sources](docs/DATA_SOURCES.md)

## What's in the game

| Mode | Clue | Hints | Ready out of the box |
|---|---|---|---|
| **Classic** | Compares 9 attributes with each guess: element, ailments, weaknesses, class, max and min size, threat level, first appearance, generation. Green / orange / red tiles, with ↑/↓ arrows | — | ✅ |
| **Compendium** | An original field-guide entry with the name masked | Class after 5 wrong guesses, nickname after 10 | ✅ |
| **Surveyor** | A picture that starts as a dark 15 px blur and sharpens with each miss | — | Needs pictures ([why](#media-for-surveyor-and-roar)) |
| **Roar** | The monster's cry, with play/pause and volume | Class after 5, nickname after 10 | Needs sounds |

Shared features, matching the original:

- **Daily monsters:** one per mode, changing at local midnight. Everyone with the same game selection gets the same monster.
- **Game selection:** 18 main-series games, MH1 to Wilds, grouped by generation.
- **Search:** works in English or Arabic, whatever the interface language. It tolerates hamza and alef variants and diacritics, and supports keyboard navigation.
- **Guessing:** unlimited, as in the original, which has no loss state. Guesses are saved per mode and day, so reloading, switching modes or switching language never loses progress.
- **Win screen:**
  - answer reveal with a "Cleared" stamp;
  - countdown to midnight;
  - share text and link;
  - links to the other quests;
  - infinite mode, which gives new random rounds that don't count toward stats.
- **Daily missions and win streak:** the "village was attacked" message appears when a streak is lost.
- **Share links:** carry your game selection and score. A friend is offered your selection, sees your score to beat, and gets a win / tie / loss line.
- **Statistics:** current and best streak, plus wins, average and fewest tries per mode, with a reset button.

## Deploy to GitHub Pages (step by step)

You need a free GitHub account. Nothing else: no server, database or paid service.

### 1. Create a GitHub repository

1. On github.com, click **+ → New repository**.
2. Pick a name, for example `mhdle-ar`. It becomes part of the URL.
3. Choose **Public**. GitHub Pages is free for public repositories; private ones need a paid plan.
4. Leave "Add a README" unticked (this project already has one), then click **Create repository**.

### 2. Upload or push the project

**With Git** (from this project folder):

```bash
git init
git add .
git commit -m "First version"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

**Without Git:** on the new repository's page, click **uploading an existing file**. Drag in everything from this folder except `node_modules/` and `dist/`, including the hidden `.github` folder, then commit to `main`. If your file manager hides `.github`, create the file `.github/workflows/deploy.yml` in the web editor instead and paste its contents.

### 3. Enable GitHub Pages

Open the repository's **Settings → Pages**. Pages is available on every public repository; there's no separate switch beyond choosing a source in the next step.

### 4. Configure the deployment source

On the same page, under **Build and deployment → Source**, choose **GitHub Actions**. Not "Deploy from a branch": the workflow builds the site itself.

### 5. Trigger the first deployment

- If you already pushed to `main`, open the **Actions** tab. The run "Deploy to GitHub Pages" may have failed because Pages wasn't set up yet. Open it and click **Re-run all jobs**.
- Otherwise go to **Actions → Deploy to GitHub Pages → Run workflow** (the workflow allows manual runs), or push any commit.

The run installs dependencies, runs the unit tests, builds, runs the end-to-end tests against the built site, and then publishes. It takes about 3–4 minutes.

### 6. Find the published website URL

When the run is green, the URL appears in three places:

- on the **deploy** job of the run;
- under **Settings → Pages** ("Your site is live at…");
- in the repository's **Environments → github-pages** panel.

It has this form:

```
https://<your-user>.github.io/<your-repo>/
```

Each mode has its own address, for example `…/<your-repo>/#/classic` or `…/#/compendium`.

### 7. Update the website

Commit and push to `main` (or upload changed files through the web interface). Every push runs the same workflow and republishes the site automatically. If a test fails, the old version stays online and the run shows what broke. The Playwright report is attached to the failed run.

### How the repository sub-path is handled

- `vite.config.ts` uses a **relative base (`./`)**, so every script, stylesheet, font and media URL resolves relative to `index.html`. The same build works at `/<repo>/`, at a custom domain root, or opened from any folder. Renaming the repository needs no change.
- To pin an absolute base instead, change the default in `vite.config.ts`, or build with `VITE_BASE=/<repo>/ npm run build`.
- Pages use **hash routes** (`#/classic`), so refreshing or opening a deep link always loads `index.html`. No 404 page or rewrite rules are needed.
- **Custom domain:** add it under Settings → Pages. No code change is needed.

## Develop, test, build

Requires **Node 20+**.

```bash
npm install
npm run dev          # local dev server, http://localhost:5173
npm test             # unit tests (Vitest)
npm run build        # validate data + generate media manifest + type-check + build to dist/
npm run preview      # serve dist/
npm run test:e2e     # end-to-end tests (Playwright) against dist/ served from /test-repo/
npm run test:all     # everything above, in order
```

The first time you run end-to-end tests, run `npx playwright install chromium`.

| Script | What it does |
|---|---|
| `npm run data:build` | Rebuilds `src/data/monsters.json` from `data-raw/` |
| `npm run data:validate` | Checks data, vocab, games, locale key parity and media references (runs before every build) |
| `npm run media:manifest` | Scans `public/media/` (runs before `dev` and `build`) |

## Architecture

```
src/
  types/        Shared domain types (Monster, Round, Settings, ModeId…)
  data/         Datasets: monsters.json (generated), games.json, vocab.json, media-manifest.json (generated)
                index.ts — typed accessors (MONSTERS, GAMES, VOCAB, mediaUrl)
  games/        Game rules, pure functions with no React or storage:
                  modes.ts    mode definitions, pools, hint thresholds
                  daily.ts    daily pick (seeded shuffle per cycle) and infinite pick
                  compare.ts  Classic comparison rules
                  search.ts   bilingual normalisation and ranking
                  mask.ts     Compendium name masking
                  share.ts    share URL, challenge parsing, emoji grid
  persistence/  localStorage only: storage.ts (safe wrapper), settings.ts, progress.ts
                (rounds, missions, streak, stats, all validated on load)
  state/        AppState context: settings, current day, installed modes, dialogs
  hooks/        useRound: one mode's round (daily + infinite), persisted
  i18n/         Translation provider: plural rules, interpolation, number format, dir/lang
  locales/      en.json, ar.json — every interface string
  utils/        day keys, seeded random, formatting
  components/   UI: SearchBox, ClassicBoard, Hints, WinPanel, SharePanel, dialogs, Layout…
  pages/        Home (quest board), Classic, Compendium, Surveyor, Roar, About
  styles/       global.css (design tokens, logical properties for RTL)
public/media/   Optional monster pictures, icons and sounds (not shipped)
scripts/        Data build, validation, media manifest
data-raw/       Source extract, translations, documented patches
tests/          engine.test.ts (unit) · e2e/*.spec.ts (Playwright)
```

**How a round flows:**

1. `useRound(mode)` builds the pool from the selected games, plus media availability for Surveyor and Roar.
2. It picks today's answer with `pickDaily(pool, day, salt)` and restores saved guesses.
3. Each guess is validated: the monster must exist, not be a repeat, and the round must not be over. Then it's saved.
4. A correct guess records the daily mission and stats; infinite rounds only count as infinite wins.
5. Pages render with the language from `I18nProvider`. Because state is keyed by monster IDs, never by translated names, switching language changes only the text.

## Data

- **249 large monsters** from the main series, with stable IDs, English and Arabic names, attributes, original descriptions and translated nicknames.
- Attributes are derived from the Monster Hunter Wiki (CC BY-SA 3.0). Where the source has no value, the game shows "?" instead of inventing one.
- Details: [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md).

**To update data:**

1. Edit `data-raw/wiki.json` (attributes), `data-raw/patches.json` (corrections, each with a `reason`) or `data-raw/i18n-*.json` (names, nicknames, descriptions).
2. Run `npm run data:build && npm run data:validate`.
3. New vocabulary goes in `src/data/vocab.json`. New games are appended to the **end** of `src/data/games.json`, because the order is used in share links.

## Media for Surveyor and Roar

Official renders and roars are Capcom's property, and the original site grants no reuse rights, so none are included. Both modes stay hidden until media exists:

```
public/media/images/<monster-id>.webp|png|jpg|avif   → Surveyor (and the win-screen picture)
public/media/audio/<monster-id>.mp3|ogg|m4a|wav      → Roar
public/media/icons/<monster-id>.webp|png|svg         → optional icons in search and the Classic grid
```

- IDs are listed in `src/data/monsters.json`, for example `rathalos`, `kushala-daora` and `dahren-mohran`.
- A mode appears as soon as one monster has a file. Only monsters with media can be that mode's answer, but any monster can be guessed.
- The manifest is regenerated on every `dev` and `build`, and files that don't match an ID are reported.
- Without icons, monsters get a neutral initial-letter token.

## Translations

- `src/locales/en.json` and `src/locales/ar.json` hold every interface string, with matching keys (enforced by `data:validate`).
- Plurals use `Intl.PluralRules`, so Arabic gets all six forms.
- Switching language is instant, keeps the current round, and updates `lang`, `dir` and the page title. The choice is saved.
- The layout uses CSS logical properties, so RTL is native rather than mirrored.
- Numbers, ranges and file names are isolated so they read correctly inside Arabic text.

## Licences

- **Code:** MIT (`LICENSE`).
- **Monster attributes:** Monster Hunter Wiki contributors, **CC BY-SA 3.0**. `src/data/monsters.json` and `data-raw/` are shared under the same licence.
- **Descriptions and Arabic text:** written for this project, CC BY-SA 3.0.
- **Fonts:** Cinzel, Reem Kufi and IBM Plex Sans Arabic, SIL Open Font License, self-hosted via @fontsource.
