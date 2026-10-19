# MHDLE – Feature Inventory (reference: monster-hunter-dle.akato.fr)

Inspected on 18 Oct 2026. Sources: the public pages (/en, /classic, /compendium_en, /surveyor, /roar, /legal-notice), the public scripts (script-home.js, script-classic.js, script-compendium_en.js, script-surveyor.js, script-roar.js, share.js, cookies_en.js), the public dataset (monsters_en.json), network traffic and localStorage. The original is plain HTML/CSS/JS on a static host (Netlify behind Cloudflare). **All gameplay is client-side**: no game API or backend was observed, so nothing needs a server.

## 1. Site structure

| Page | Purpose |
|---|---|
| Home | Four mode cards, daily mission/streak message, game-selection dialog, changelog popup, FR/EN switch, support link |
| Classic | Guess from attribute comparisons (Wordle-style table) |
| Compendium | Guess from a field-guide description with the name masked |
| Surveyor | Guess from a blurred, darkened picture that clears up after each miss |
| Roar | Guess from the monster's cry (audio player) |
| Legal notice | Privacy, IP disclaimer, cookie consent toggle |

Languages are separate URLs (FR at `/`, EN at `/en`, `/compendium_en`, …). Switching language reloads the page.

## 2. Shared mechanics (all four modes)

**Game selection ("Hunter, prepare your quests!")**
- Shown on first visit and via "Change my game choices".
- Three collapsible categories, each with a select-all checkbox: Main games (18), Frontier (1), Spin-offs (20). The share module knows 2 extra titles (MH Now, MH Puzzles: Felyne Isles), giving a fixed ordered list of 41.
- Option "Disable small monsters".
- Only monsters present in at least one selected game are eligible as answers *and* as search results.

**Daily monster selection**
- Seed = local date string. A 32-bit string hash of the seed, plus a per-mode constant offset, modulo the eligible list length.
- Each mode uses a different offset, so the four daily answers differ.
- Resets at **local** midnight (not UTC). Because the eligible list depends on the selected games, two players only share the same monster if their selections match (the share link handles this, see §4).
- A rolling 30-entry history in localStorage is intended to avoid repeats. (In the original this check is ineffective because it reads a lowercase `name` key that doesn't exist; the rebuild should implement the intent properly.)

**Search box**
- Case-insensitive substring match on the English name.
- Ranking: name starts with the query → a word in the name starts with it → other matches; ties alphabetical.
- Already-guessed monsters are hidden. Each result shows the monster's icon.
- Keyboard: ↑/↓ to move, Enter to submit, click to submit.

**Attempts, winning, losing**
- Unlimited attempts in every mode. **There is no loss condition**; a round ends only when the monster is found.
- Wrong guesses are saved per mode, per day, per answer, and replayed on reload so progress survives navigation.
- Win screen: "The monster sought was indeed: X", the monster's picture with a delayed "Quest clear" stamp, a countdown to local midnight (switches to "refresh the page" after midnight), links to the other modes, a share card, and an "(infinite)" replay button.

**Infinite mode**
- Unlocked only after winning the day's round in that mode.
- Adds a random 1–10 to that mode's offset and reloads, producing a new monster. Repeatable.
- The changed offset is only valid on the day it was set, so the next day's daily monster is the same for everyone again.
- Infinite rounds are not counted for sharing.

**Missions and win streak (home page)**
- Each mode won today counts as a mission (persisted separately so infinite mode can't erase it).
- All 4 missions on a day → streak +1 (never counted twice for the same day).
- A gap of more than one calendar day → streak resets; a one-off "while you were away, the village was attacked… we lost your N streak" message is shown for that day.
- Contextual home messages: first visit, n/4 missions done, all done with streak count, thanks-for-yesterday, generic reminder.
- Mode icons on the home page and in the game headers switch to a "completed" variant.

## 3. Mode rules

### Classic
Columns: icon, Element, Ailments, Weaknesses, Class, Max size, Min size, Threat level, First appearance, Generation.

| Column | Rule |
|---|---|
| Element, Ailments | Set comparison after stripping parenthetical notes: identical → green; overlap → orange; none → red |
| Weaknesses | Same, but if exactly one side is empty → red |
| Class | Set comparison (some monsters have several classes) |
| Max / Min size | Numeric; equal → green, else red with ↑ (answer is bigger) or ↓ arrow. "Small" counts as 0 |
| Threat level | Single value or range: identical → green; overlapping ranges → orange; else red with ↑/↓ |
| First appearance | Exact match green / red |
| Generation | Numeric 1–6 with ↑/↓ |
| Empty value | Shown as a "none" icon |

- Rows appear in guess order, with a legend (correct / partial / incorrect / higher / lower; for Threat level, partial means overlapping range).
- If every attribute matches but the name doesn't, the player is told "characteristics match perfectly but it's not the one".
- Easter egg: clicking the Palico in the legend box plays a horn sound.

### Compendium
- Shows the answer's description with every occurrence of its name (and its name parts, accent-insensitive) replaced by "…".
- Hint 1 after 5 wrong guesses: Class (shows a countdown first, then "click to discover").
- Hint 2 after 10 wrong guesses: a random nickname, shown only if the monster has nicknames.
- Wrong guesses appear as a list of icon + name, newest first.

### Surveyor
- Shows the answer's picture with `blur(15px) brightness(0)` (a black blurred silhouette).
- Each wrong guess: blur −1px, brightness +0.05. Fully sharp after 15 misses; full brightness after 20.
- No text hints.

### Roar
- Eligible pool = selected-game monsters **that have an audio file** (224 of 330).
- Custom player: play/pause button and volume slider (default 30%).
- Same two hints as Compendium (Class at 5, Nickname at 10).

## 4. Sharing
- Text-only share (Copy button, plus Web Share API when available). Example: "I hunted today's monster in 4 tries! Who can do better?", date, mode emoji (🗡️ Classic, 📜 Compendium, 📷 Surveyor, 🔊 Roar).
- Classic adds an emoji grid of the last 5 rows (🟩/🟧/🟥) with "+k earlier tries".
- Link parameters:
  - `?s=` = base-36 bitmask of the selected games (fixed 41-game order) plus a small-monsters bit.
  - `&c=tries-YYYYMMDD` = the sharer's score.
- A friend opening the link is asked whether to adopt the sharer's game selection, sees "A friend's challenge: … can you do better?", and after winning gets a versus message (beat / tie / lost).

## 5. Dataset (monsters_en.json; FR version alongside)
- 330 entries. Fields: Name, Nickname[], Description, Icon[], Image[], Audio[], Element[], Ailments[], Weaknesses[], Class (string or array), Max Size, Min Size, Threat level ([n] or [min, max], 0–10), First appearance, "Présent dans" (games list), Generation (1–6).
- 224 entries have audio, 221 have nicknames, 79 are "Small".
- Generation counts: 1:43, 2:39, 3:57, 4:58, 5:97, 6:36.
- Data quality issues found:
  - Free-text annotations inside values, e.g. "Fire (lava terrains)", "Ice (critical state)".
  - Sizes stored as strings with mixed decimal separators ("1266,7"), units ("3133.8cm") or notes ("(MHWI)"), so parseInt silently truncates them.
  - A few French values in the EN file ("Feu", "Bête à crocs").
  - Display names are the comparison key; there are no stable IDs.
- Assets: icons and renders (webp) and roars (mp3) are, per the site's own legal notice, **Capcom property** used as a fan tribute; the site grants **no licence** to reuse its data, code or assets.

## 6. Other
- Persistence is localStorage only (selected games, success flags, guesses, offsets, streak, share state, changelog-seen, cookie consent).
- Cookie banner gates Google Analytics; a service worker is registered for basic offline caching.
- Responsive single-column layout on mobile; the Classic table scrolls horizontally.
- Fonts: OptimusPrinceps (titles), Montserrat (body). Parchment/gold Monster Hunter-style theme.

## 7. Rebuild notes (static / GitHub Pages)
Everything above can be implemented client-side. Nothing in the original requires a backend. Ads, analytics, Ko-fi and affiliate links are outside the game and will be omitted unless requested.
