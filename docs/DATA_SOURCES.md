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

## Media

- **Source:** <https://monster-hunter-dle.akato.fr>, fetched on 2026-11-16 with [Scrapling](https://github.com/D4Vinci/Scrapling). The site's `monsters_en.json` lists one icon, one picture and zero to two roars per monster; entries were matched to this project's monster IDs by English name.
- **What was taken:** for the 249 monsters in this roster, 248 icons, 248 pictures and 191 roars (first recording only), plus the Palico picture and its horn sound for `public/media/ui/`.
- **Not taken:** media for the 81 small, Frontier-only and variant monsters outside this roster; the original's logo, backgrounds, mode emblems and "Quest complete" stamp (this project keeps its own title, theme, line-art mode icons and translated seal).
- **Name fixes:** the original spells three monsters differently (*Hermitaur Daimyo*, *Ceanataur Shogun*, *Tigrex berserk*). Its link to Stygian Zinogre's roar is broken by a typo (`Zynogre`); the correctly spelled file was used.
- **Processing:** pictures resized to at most 900 px and icons to 160 px, re-encoded as WebP. Roars are unchanged MP3s.
- **Rights:** monster renders, icons and roars are **Capcom's property**. The original's legal notice says the same and grants no licence. They are included here as non-commercial fan use and are **not** covered by this repository's MIT or CC BY-SA licences. The Palico artwork comes from the original site.

## Theme art from Monster Hunter Wilds: Ascendance

- **Source:** the story page of the official site, <https://www.monsterhunter.com/wilds-ascendance/en-us/story/>, read on 2026-11-19 with [Scrapling](https://github.com/D4Vinci/Scrapling). Its stylesheet and markup were inspected to recreate the layout and motion, and these images were downloaded into `src/assets/wilds/`:
  - three hunting wallpapers (one per page; resized from 3840 to 1920 px);
  - the blue paper texture, the torn top and bottom section edges, and the torn navy panel of the character pop-up (wide and tall versions);
  - the red-to-blue title banner, its light line and two corner ornaments;
  - the button bars (dark, framed with its hover glow, blue patterned), the button arrow, the close mark, the divider gem and finial, and the fog sprite used for the reveal.
- **Not taken:** the site's code, logo, story text, character portraits and renders, video, and its font files.
- **Motion:** recreated in CSS from the site's own rules. Cards land with a 3D turn (`land`), hovered buttons and cards brighten and saturate (`.hover_brightness`), the win picture floats (`floatLeft`) and is revealed by the fog sprite (`fog`, 35 steps).
- **Rights:** this art is **Capcom's property** and is not licensed to this project. It is included as non-commercial fan use, like the monster media above, and is **not** covered by this repository's MIT or CC BY-SA licences.

## Other assets

- **Fonts:** Source Serif 4 and Source Sans 3 (the faces the Wilds Ascendance site uses), Amiri and IBM Plex Sans Arabic, all under the SIL Open Font License 1.1 and bundled through @fontsource packages. They are installed from npm, not copied from Capcom's site.
- **Icons:** the favicon is a hammer icon supplied by the project owner. Mode icons and top-bar icons are original inline SVG or Unicode. The diamond buttons on the quest cards and the Roar play button are CSS, drawn after the Ascendance site's zoom button.
- **Monster tokens:** coloured initials, used only where a monster has no icon.
