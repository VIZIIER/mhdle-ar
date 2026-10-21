# Data sources and licensing

## Why the original's data and media aren't reused

The reference site publishes its dataset (`monsters_en.json`, 330 entries) and its media publicly, but grants no licence to reuse them. Its legal notice also states that all images, sounds and other assets belong to Capcom. Following the brief ("where reuse is permitted… otherwise independently obtained or properly licensed"), this project:

- does **not** copy the original's dataset, code, descriptions, images, icons or sounds;
- builds its attribute data from a **CC BY-SA** source;
- writes its own descriptions and Arabic text;
- ships **no** Capcom media. Surveyor and Roar read user-supplied files (see README → *Media*).

The original was only inspected to document how its game works (see `FEATURE_INVENTORY.md`).

## Monster attributes: Monster Hunter Wiki (Fandom)

- **Source:** <https://monsterhunter.fandom.com>, page infoboxes and categories, read through the public MediaWiki API on 2026-10-18.
- **Licence:** Creative Commons Attribution-ShareAlike 3.0 (as stated by the wiki's site info). Attribution: "Monster Hunter Wiki contributors".
- **Scope:** every page in *Category:Large Monsters* that is also in a main-series game category (MH1, MHG, MHF1, MH2, MHF2, MHFU, MH3, MHP3, MH3U, MH4, MH4U, MHGen, MHGU, MHW, MHWI, MHRise, MHRS, MHWilds). That gives **249 monsters**. Small monsters, Frontier-only and spin-off-only monsters are out of scope.

Fields taken from each page:

| Field | Infobox / page source | Notes |
|---|---|---|
| Class | `Monster Type` | `???` mapped to "Unclassified" |
| Elements | `Element` | Entries limited to spin-offs (Explore, Frontier, Online, Stories, Now…) or to specific terrain/food are dropped |
| Ailments | `Ailments` | Same filtering |
| Weaknesses | `Weakest to` | Same filtering |
| Max / Min size | `Monster Size` | Gold-crown large / small sizes in cm. Single-value pages use that value for both. Missing → "?" |
| Threat level | `data-raw/threat-mhdle.json` | **Ratings from the original Monster Hunter DLE** (`monsters_en.json`, retrieved 2026-10-21) for 248 of 249 monsters, on its 1–10 scale, so the Classic column matches the original game. Yian Garuga (not listed by MHDLE) uses its in-game Hunter's Notes value from the wiki. The in-game values are kept for reference in `data-raw/patches.json` |
| First appearance | Lead sentence ("introduced in …") | When absent, the earliest main-series game in the monster's categories (documented fallback) |
| Generation | `Generation` | 1–6 |
| Games | Page categories | Used for the game selection |
| Nicknames | `English Title` | Official in-game titles; at most the translated ones are used |

- **Raw extract:** `data-raw/wiki.json`.
- **Manual corrections:** `data-raw/patches.json`. Each one has a reason and comes from the same wiki page (for example Gravios uses a different infobox template; Lagiacrus had a malformed line break).
- **Generated output:** `src/data/monsters.json`, shared under CC BY-SA 3.0.

**Known limitations.** Values are as the wiki records them, and some vary between games. Where the source has no value, the game shows "?" and compares it as *no data* rather than guessing.

## Threat levels from Monster Hunter DLE

At the project owner's request, threat levels are taken from the original MHDLE dataset rather than from the games:

- They differ from the in-game Hunter's Notes for most monsters. Of the 187 monsters with an in-game value, 45 match exactly, 40 overlap and 102 differ.
- Monster Hunter World/Iceborne have no in-game monster rating at all, and Wilds rates each encounter (1–5 stars).

So these values are best described as MHDLE's ratings, not official game data. The snapshot is `data-raw/threat-mhdle.json`; to update it, re-download `monsters_en.json` from the original site and regenerate the file.

## Written for this project (CC BY-SA 3.0)

- **Descriptions (EN + AR):** short original descriptions written for Compendium mode. They are not Capcom's in-game text and are not copied from the wiki.
- **Arabic monster names:** transliterations of the official English names, since no official Arabic localisation exists.
- **Arabic nickname translations, interface text, game names:** translated for this project.

## Other assets

- **Fonts:** Cinzel, Reem Kufi and IBM Plex Sans Arabic (SIL Open Font License 1.1), bundled through @fontsource packages.
- **Icons:** the favicon and interface icons are original inline SVG or Unicode.
- **Monster tokens:** coloured initials, not artwork.
