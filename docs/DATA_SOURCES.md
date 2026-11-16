# Data sources and licensing

## Why the original's dataset isn't reused

The reference site publishes its dataset (`monsters_en.json`, 330 entries) and its media publicly, but grants no licence to reuse them. Its legal notice also states that all images, sounds and other assets belong to Capcom. Following the brief ("where reuse is permitted… otherwise independently obtained or properly licensed"), this project:

- does **not** copy the original's dataset, code or descriptions;
- builds its attribute data from a **CC BY-SA** source;
- writes its own descriptions and Arabic text;
- **does** ship the original's monster icons, pictures and roars, at the project owner's request (see [Media](#media) below). These are not licensed.

The original's code and dataset were only inspected to document how its game works (see `FEATURE_INVENTORY.md`) and to find the media file for each monster.

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
| Threat level | In-game description blocks (`Threat Level N = ★…`) | Range of the star ratings recorded for main-series games (MH3/3U, MH4/4U, MHGen/GU, MHRise/RS, Wilds). Missing for 67 monsters → "?" |
| First appearance | Lead sentence ("introduced in …") | When absent, the earliest main-series game in the monster's categories (documented fallback) |
| Generation | `Generation` | 1–6 |
| Games | Page categories | Used for the game selection |
| Nicknames | `English Title` | Official in-game titles; at most the translated ones are used |

- **Raw extract:** `data-raw/wiki.json`.
- **Manual corrections:** `data-raw/patches.json`. Each one has a reason and comes from the same wiki page (for example Gravios uses a different infobox template; Lagiacrus had a malformed line break).
- **Generated output:** `src/data/monsters.json`, shared under CC BY-SA 3.0.

**Known limitations.** Values are as the wiki records them, and some vary between games. Where the source has no value, the game shows "?" and compares it as *no data* rather than guessing.

## Written for this project (CC BY-SA 3.0)

- **Descriptions (EN + AR):** short original descriptions written for Compendium mode. They are not Capcom's in-game text and are not copied from the wiki.
- **Arabic monster names:** transliterations of the official English names, since no official Arabic localisation exists.
- **Arabic nickname translations, interface text, game names:** translated for this project.

## Media

- **Source:** <https://monster-hunter-dle.akato.fr>, fetched on 2026-11-16 with [Scrapling](https://github.com/D4Vinci/Scrapling). The site's `monsters_en.json` lists one icon, one picture and zero to two roars per monster; entries were matched to this project's monster IDs by English name.
- **What was taken:** for the 249 monsters in this roster, 248 icons, 248 pictures and 191 roars (first recording only), plus eight mode emblems, the Palico picture and its horn sound for `public/media/ui/`.
- **Not taken:** media for the 81 small, Frontier-only and variant monsters outside this roster; the original's logo, backgrounds and "Quest complete" stamp (this project keeps its own title, theme and translated seal).
- **Name fixes:** the original spells three monsters differently (*Hermitaur Daimyo*, *Ceanataur Shogun*, *Tigrex berserk*). Its link to Stygian Zinogre's roar is broken by a typo (`Zynogre`); the correctly spelled file was used.
- **Processing:** pictures resized to at most 900 px and icons to 160 px, re-encoded as WebP. Roars are unchanged MP3s.
- **Rights:** monster renders, icons and roars are **Capcom's property**. The original's legal notice says the same and grants no licence. They are included here as non-commercial fan use and are **not** covered by this repository's MIT or CC BY-SA licences. Mode emblems and the Palico artwork come from the original site.

## Other assets

- **Fonts:** Cinzel, Reem Kufi and IBM Plex Sans Arabic (SIL Open Font License 1.1), bundled through @fontsource packages.
- **Icons:** the favicon and top-bar icons are original inline SVG or Unicode.
- **Monster tokens:** coloured initials, used only where a monster has no icon.
