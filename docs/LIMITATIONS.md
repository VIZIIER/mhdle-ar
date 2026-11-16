# Incomplete features, missing data and limitations

## Media coverage

All four modes are playable. Monster icons, pictures and roars come from the original MHDLE site (see [DATA_SOURCES.md](DATA_SOURCES.md#media)).

| Item | Coverage | Gap |
|---|---|---|
| Icons and pictures | 248 of 249 monsters | Plain **Yian Garuga** isn't on the original site (only its Scarred and Deadeye variants), so it shows the initial-letter token and can't be a Surveyor answer |
| Roars | 191 of 249 monsters | The original has no roar for the other 58, so they can't be a Roar answer. They can still be guessed |
| Second roars | — | 29 monsters have two recordings on the original; only the first is used |

**Rights.** This media is Capcom's property and is not licensed to this project. It is included as fan use, the same basis the original site relies on. If it has to be removed, delete the files in `public/media/`: Surveyor and Roar then hide themselves and the streak only requires Classic and Compendium.

## Data gaps

- **Roster:** 249 large monsters from the 18 main-series games. Small monsters, Frontier-only and spin-off-only monsters (the original lists 330 entries) are out of scope, so the original's "Disable small monsters" option isn't needed.
- **Threat level:** every monster now has one. The values are the **original MHDLE's ratings** (see [DATA_SOURCES.md](DATA_SOURCES.md#threat-levels-from-monster-hunter-dle)), not the in-game Hunter's Notes stars, which they often differ from. World/Iceborne monsters have no in-game rating, and Wilds rates each encounter rather than each monster. Yian Garuga isn't in MHDLE's list, so it uses its in-game value (5).
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
- no ads, analytics or cookie banner.

## Deployment verification

- The production build was tested served from a `/test-repo/` sub-path in Chromium (desktop and mobile emulation). No 404s were found, every route works on direct load and refresh, and there are no external requests.
- **The live `https://<user>.github.io/<repo>/` URL has not been tested**, because no GitHub account was linked to the build session. The deployment workflow runs the same end-to-end suite before publishing, so a broken build is not deployed.
- The browser tests run in Chromium only; Firefox and Safari were not tested. The code uses standard APIs (`<dialog>`, CSS logical properties, `Intl.PluralRules`), all supported in current versions of both.

## Other notes

- Progress lives in each browser's local storage. It doesn't sync between devices, and clearing site data resets it. This matches the original.
- The daily monster depends on the game selection, so share links include the selection, as in the original.
