# Differences from the original

Everything listed in `FEATURE_INVENTORY.md` is implemented. These are the places where this version intentionally behaves differently, and why.

| Area | Original | This version | Reason |
|---|---|---|---|
| Roster | 330 entries including small, Frontier and spin-off monsters | 249 large monsters from the 18 main-series games | Data had to come from a licensed source and be verifiable; agreed scope. The "Disable small monsters" option is therefore not needed |
| Game selection | Main, Frontier and spin-off categories | Main games grouped by generation | Matches the roster |
| Surveyor / Roar media | Capcom renders and roars bundled | The same files for the 249-monster roster, resized; first roar only | Taken from the original at the owner's request; still Capcom's property |
| Daily pick | Hash of the date plus an offset; the "no repeat in 30 days" history was ineffective | Seeded shuffle per cycle: no monster repeats until the whole pool has been used | Implements the intended behaviour reliably |
| Sizes | Strings with mixed formats, compared with `parseInt` | Numbers in cm, compared exactly | Fixes silent truncation |
| Threat level | Its own 1–10 ratings | The same ratings, copied from MHDLE's data (248/249 monsters) | Classic comparisons behave like the original |
| Missing data | Shown as "none" or compared as 0 | Shown as "?" (grey "no data" tile) | Avoids presenting a missing value as a fact |
| Visual assets | Capcom landscape backgrounds, logo, mode icons, OptimusPrinceps font | The look of the Monster Hunter Wilds: Ascendance website: its hunting wallpapers, content on navy paper with torn edges, the red-to-blue title banner, the quest board as slanted character-select cards, its painted button bars, and the character pop-up as the win screen. Fonts Source Serif 4 / Source Sans 3 (OFL), with Amiri and IBM Plex Sans Arabic for Arabic | Requested by the project owner. The art is Capcom's (see DATA_SOURCES.md); the layout and motion are recreated in CSS |
| Search position | Search box below the Classic table | Search box above the grid | Keeps input next to the newest row on phones |
| Classic row order | New rows appended at the bottom | Newest row first, tiles flip in one by one | Keeps the latest result next to the search box, especially on phones |
| Language | Separate French and English pages; switching reloads | English and Arabic in one app; switching is instant and keeps the round | Brief |
| Search | English names only | English and Arabic names in either interface language, Arabic-aware normalisation | Brief |
| Midnight | "Refresh the page" message | Countdown turns into a "Hunt the new monster" button | Same intent, no reload |
| Streak | Requires all 4 modes | Requires all *installed* modes (all 4 as shipped) | Surveyor/Roar hide themselves if their media is removed |
| Extras not in the original | — | Statistics dialog (wins, average and fewest tries per mode, best streak), reset button | "Statistics where applicable" in the brief; all values are from real play |
| Not reproduced | Ads, Google Analytics, cookie banner, Ko-fi and affiliate links, changelog popup | — | No trackers or third-party services |
