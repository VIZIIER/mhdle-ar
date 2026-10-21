// Builds src/data/monsters.json from:
//   data-raw/wiki.json      – attributes extracted from the Monster Hunter Wiki (Fandom, CC BY-SA 3.0)
//   data-raw/patches.json   – documented manual corrections
//   data-raw/i18n-*.json    – Arabic names, Arabic nickname translations, original EN/AR descriptions
// Run: npm run data:build   (then npm run data:validate)
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

const wiki = read('data-raw/wiki.json');
const { patches } = read('data-raw/patches.json');
const { games } = read('src/data/games.json');
const vocab = read('src/data/vocab.json');
const i18n = Object.assign(
  {},
  ...readdirSync(join(root, 'data-raw'))
    .filter((f) => /^i18n-.*\.json$/.test(f))
    .sort()
    .map((f) => read(`data-raw/${f}`)),
);

export const slug = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const wikiToGame = Object.fromEntries(games.map((g) => [g.wiki, g.id]));
const gameOrder = games.map((g) => g.id);

const FIRST = {
  'Monster Hunter': 'mh1', 'Monster Hunter G': 'mhg', 'Monster Hunter Freedom': 'mhf1', 'Monster Hunter 2': 'mh2',
  'Monster Hunter Freedom 2': 'mhf2', 'Monster Hunter Freedom Unite': 'mhfu', 'Monster Hunter 3': 'mh3',
  'Monster Hunter Portable 3rd': 'mhp3', 'Monster Hunter 3 Ultimate': 'mh3u', 'Monster Hunter 4': 'mh4',
  'Monster Hunter 4 Ultimate': 'mh4u', 'Monster Hunter Generations': 'mhgen', 'Monster Hunter Generations Ultimate': 'mhgu',
  'Monster Hunter: World': 'mhw', 'Monster Hunter World: Iceborne': 'mhwi', 'Monster Hunter Rise': 'mhrise',
  'Monster Hunter Rise: Sunbreak': 'mhrs', 'Monster Hunter Wilds': 'mhwilds',
};
const firstGame = (s) => {
  if (!s) return null;
  s = s.trim();
  if (/^Monster Hunter Frontier/.test(s)) return 'mhfrontier';
  return FIRST[s] ?? null;
};

const toIds = (list, dict, kind, name) =>
  (Array.isArray(list) ? list : [list]).filter(Boolean).map((v) => {
    const id = slug(v === '??? (Monster Type)' ? 'Unclassified' : v);
    if (!dict[id]) throw new Error(`Unknown ${kind} "${v}" on ${name}. Add it to src/data/vocab.json.`);
    return id;
  });

const errors = [];
const monsters = wiki.map((raw) => {
  const p = patches[raw.n] ?? {};
  // Every manual threat value must say where it comes from.
  if ('t' in p && p.t !== null && !p.threatSource) errors.push(`Patch for ${raw.n} sets a threat level without a threatSource`);
  const r = { ...raw, ...p };
  const tr = i18n[r.n];
  if (!tr) { errors.push(`Missing translation entry for ${r.n}`); return null; }

  const gamesIds = [...new Set(r.gm.map((g) => wikiToGame[g]).filter(Boolean))].sort((a, b) => gameOrder.indexOf(a) - gameOrder.indexOf(b));
  let first = firstGame(r.f);
  if (!first) first = gamesIds[0];

  const titlesEn = (r.ti ?? []).filter((t) => t && t !== 'None' && !/\[\[/.test(t));
  const titlesAr = tr.t ?? [];
  const n = Math.min(titlesEn.length, titlesAr.length);
  const titles = Array.from({ length: n }, (_, i) => ({ en: titlesEn[i], ar: titlesAr[i] }));

  const size = r.s ? { min: r.s[0] ?? null, max: r.s[1] ?? null } : { min: null, max: null };
  if (size.min != null && size.max != null && size.min > size.max) [size.min, size.max] = [size.max, size.min];

  return {
    id: slug(r.n),
    name: { en: r.n, ar: tr.ar },
    titles,
    description: { en: tr.d, ar: tr.dA },
    classes: toIds(r.c, vocab.classes, 'class', r.n),
    elements: toIds(r.e, vocab.elements, 'element', r.n),
    ailments: toIds(r.a, vocab.ailments, 'ailment', r.n),
    weaknesses: toIds(r.w, vocab.elements, 'weakness', r.n),
    size,
    threat: r.t ? { min: r.t[0], max: r.t[1] } : null,
    firstGame: first,
    generation: r.g,
    games: gamesIds,
    ...(p.unknown ? { unknown: p.unknown } : {}),
  };
}).filter(Boolean);

for (const name of Object.keys(i18n)) if (!wiki.find((w) => w.n === name)) errors.push(`Translation for unknown monster ${name}`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }

monsters.sort((a, b) => a.name.en.localeCompare(b.name.en, 'en'));
const out = {
  _source: 'Attributes: Monster Hunter Wiki (monsterhunter.fandom.com), CC BY-SA 3.0, extracted 2026-10-18 — see DATA_SOURCES.md. Names/titles are Capcom trademarks used for identification. Descriptions and Arabic text: original to this project, CC BY-SA 3.0.',
  monsters,
};
writeFileSync(join(root, 'src/data/monsters.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`Wrote ${monsters.length} monsters to src/data/monsters.json`);
