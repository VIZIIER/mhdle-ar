# Differences from the original

Everything listed in `FEATURE_INVENTORY.md` is implemented. These are the places where this version intentionally behaves differently, and why.

| Area | Original | This version | Reason |
|---|---|---|---|
| Roster | 330 entries including small, Frontier and spin-off monsters | 249 large monsters from the 18 main-series games | Data had to come from a licensed source and be verifiable; agreed scope. The "Disable small monsters" option is therefore not needed |
| Game selection | Main, Frontier and spin-off categories | Main games grouped by generation | Matches the roster |
| Surveyor / Roar media | Capcom renders and roars bundled | No media shipped; modes appear when files are added | Media is Capcom's property |
| Daily pick | Hash of the date plus an offset; the "no repeat in 30 days" history was ineffective | Seeded shuffle per cycle: no monster repeats until the whole pool has been used | Implements the intended behaviour reliably |
| Sizes | Strings with mixed formats, compared with `parseInt` | Numbers in cm, compared exactly | Fixes silent truncation |
| Threat level | Its own 1–10 ratings | The same ratings, copied from MHDLE's data (248/249 monsters) | Classic comparisons behave like the original |
| Missing data | Shown as "none" or compared as 0 | Shown as "?" (grey "no data" tile) | Avoids presenting a missing value as a fact |
| Visual assets | Capcom landscape backgrounds, logo, mode icons, OptimusPrinceps font | Same hierarchy (title → game choices → framed message → stacked mode buttons; framed dark table; parchment panels; gold accents) built from original CSS, Unicode icons and OFL fonts (Cinzel, Reem Kufi, IBM Plex Sans Arabic) | The original's images are not licensed for reuse |
| Search position | Search box below the Classic table | Search box above the grid | Keeps input next to the newest row on phones |
| Classic row order | New rows appended at the bottom | Newest row first, tiles flip in one by one | Keeps the latest result next to the search box, especially on phones |
| Language | Separate French and English pages; switching reloads | English and Arabic in one app; switching is instant and keeps the round | Brief |
| Search | English names only | English and Arabic names in either interface language, Arabic-aware normalisation | Brief |
| Midnight | "Refresh the page" message | Countdown turns into a "Hunt the new monster" button | Same intent, no reload |
| Streak | Requires all 4 modes | Requires all *installed* modes | Surveyor/Roar may be hidden |
| Extras not in the original | — | Statistics dialog (wins, average and fewest tries per mode, best streak), reset button | "Statistics where applicable" in the brief; all values are from real play |
| Not reproduced | Ads, Google Analytics, cookie banner, Ko-fi and affiliate links, changelog popup, Palico horn easter egg (uses a Capcom sound) | — | No trackers or third-party services; no Capcom media |
