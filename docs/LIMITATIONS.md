# Incomplete features, missing data and limitations

## Not playable out of the box

| Item | Why | What it takes |
|---|---|---|
| **Surveyor mode** | Needs a picture of each monster. The original uses Capcom renders, which the original site doesn't license and which Capcom owns, so none are shipped | Add pictures you're allowed to publish to `public/media/images/<id>.webp`. The mode appears automatically ([README](../README.md#media-for-surveyor-and-roar)) |
| **Roar mode** | Needs each monster's cry; same rights problem | Add sounds to `public/media/audio/<id>.mp3` |
| Monster icons | Same | Optional: `public/media/icons/<id>.webp`. Otherwise a neutral initial-letter token is shown |

Both modes are fully implemented and were tested with placeholder media (see [TEST_REPORT.md](TEST_REPORT.md)). Until media is added they are hidden, as agreed, and the streak only requires Classic and Compendium.

## Data gaps

- **Roster:** 249 large monsters from the 18 main-series games. Small monsters, Frontier-only and spin-off-only monsters (the original lists 330 entries) are out of scope, so the original's "Disable small monsters" option isn't needed.
- **Threat level:** missing ("?") for **61** monsters. This is not missing research. The games these monsters come from don't have a per-monster threat rating:
  - **Monster Hunter: World / Iceborne** (32 monsters, including Lunastra) has no threat stars in its Hunter's Notes. Only quests have stars, and tempered monsters have a separate 1–3 tempered level.
  - **Monster Hunter Wilds** (21 monsters) rates each *encounter* from 1 to 5 stars rather than each monster. Apex monsters and Arkveld range from 3 to 5, and Zoh Shia is always 5.
  - **Gen 1–2 only monsters** (8, e.g. Yama Tsukami, Shen Gaoren, Hypnocatrice) come from games without a threat rating.

  Values that do exist were filled from each game's Hunter's Notes (see `data-raw/patches.json`, each with its source). The original MHDLE shows numbers for these monsters, but they can't be traced to any game and appear to be its author's own estimates, so they are not used.
- **Size:** missing or partial for **27** monsters, shown as "?".
- **Apex Diablos weaknesses:** listed as "?" by the source, shown as "?".
- **Per-game differences:** values follow the wiki infobox. Monsters whose elements, ailments or weaknesses changed between games show the wiki's combined list, minus spin-off-only and terrain/food-dependent entries.
- **First appearance:** for 12 monsters whose wiki lead sentence doesn't name a game (collaboration and some Wilds monsters), the earliest main-series game in their game list is used.
- **Arabic names:** there is no official Arabic localisation of Monster Hunter, so names are transliterations of the official English names, and titles are translated. Players may know some monsters by other spellings; search tolerates common Arabic spelling variants and also accepts English names.

## Behaviour that differs from the original

See [DIFFERENCES.md](DIFFERENCES.md). Notably:

- no loss condition, the same as the original;
- newest Classic row on top;
- no French;
- no ads, analytics or cookie banner;
- no Palico horn easter egg (it needs a Capcom sound).

## Deployment verification

- The production build was tested served from a `/test-repo/` sub-path in Chromium (desktop and mobile emulation). No 404s were found, every route works on direct load and refresh, and there are no external requests.
- **The live `https://<user>.github.io/<repo>/` URL has not been tested**, because no GitHub account was linked to the build session. The deployment workflow runs the same end-to-end suite before publishing, so a broken build is not deployed.
- The browser tests run in Chromium only; Firefox and Safari were not tested. The code uses standard APIs (`<dialog>`, CSS logical properties, `Intl.PluralRules`), all supported in current versions of both.

## Other notes

- Progress lives in each browser's local storage. It doesn't sync between devices, and clearing site data resets it. This matches the original.
- The daily monster depends on the game selection, so share links include the selection, as in the original.
