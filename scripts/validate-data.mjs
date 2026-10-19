// Validates src/data/monsters.json, vocab.json, games.json, the locale files and the media manifest.
// Exits with code 1 on any error, so `npm run build` fails on broken data.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

const { monsters } = read('src/data/monsters.json');
const vocab = read('src/data/vocab.json');
const { games, displayOnly } = read('src/data/games.json');
const en = read('src/locales/en.json');
const ar = read('src/locales/ar.json');

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const AR = /[؀-ۿ]/;
const gameIds = new Set(games.map((g) => g.id));
const allGameIds = new Set([...gameIds, ...displayOnly.map((g) => g.id)]);

const seen = { id: new Map(), en: new Map(), ar: new Map() };
for (const m of monsters) {
  const where = `[${m.id}]`;
  for (const [k, v] of [['id', m.id], ['en', m.name?.en?.toLowerCase()], ['ar', m.name?.ar]]) {
    if (!v) { err(`${where} missing ${k}`); continue; }
    if (seen[k].has(v)) err(`${where} duplicate ${k} "${v}" (also ${seen[k].get(v)})`);
    seen[k].set(v, m.id);
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.id)) err(`${where} id is not kebab-case`);
  if (!AR.test(m.name.ar)) err(`${where} Arabic name has no Arabic characters`);
  if (!m.description?.en || m.description.en.length < 30) err(`${where} English description missing/too short`);
  if (!m.description?.ar || !AR.test(m.description.ar)) err(`${where} Arabic description missing`);
  for (const t of m.titles ?? []) if (!t.en || !t.ar || !AR.test(t.ar)) err(`${where} incomplete title pair ${JSON.stringify(t)}`);

  if (!m.classes?.length) err(`${where} has no class`);
  for (const c of m.classes ?? []) if (!vocab.classes[c]) err(`${where} unknown class ${c}`);
  for (const e of m.elements ?? []) if (!vocab.elements[e]) err(`${where} unknown element ${e}`);
  for (const e of m.weaknesses ?? []) if (!vocab.elements[e]) err(`${where} unknown weakness ${e}`);
  for (const a of m.ailments ?? []) if (!vocab.ailments[a]) err(`${where} unknown ailment ${a}`);
  for (const key of ['classes', 'elements', 'weaknesses', 'ailments'])
    if (new Set(m[key]).size !== (m[key] ?? []).length) err(`${where} duplicate value in ${key}`);

  if (!Number.isInteger(m.generation) || m.generation < 1 || m.generation > 6) err(`${where} generation out of range`);
  if (m.threat) {
    const { min, max } = m.threat;
    if (!(min >= 1 && max <= 10 && min <= max)) err(`${where} invalid threat ${min}-${max}`);
  }
  const { min, max } = m.size ?? {};
  if (min != null && max != null && min > max) err(`${where} size min > max`);
  if ((min != null && min <= 0) || (max != null && max <= 0)) err(`${where} non-positive size`);

  if (!allGameIds.has(m.firstGame)) err(`${where} unknown first game ${m.firstGame}`);
  if (!m.games?.length) err(`${where} appears in no selectable game`);
  for (const g of m.games ?? []) if (!gameIds.has(g)) err(`${where} unknown game ${g}`);
  if (m.unknown) for (const u of m.unknown) if (!['weaknesses', 'elements', 'ailments'].includes(u)) err(`${where} bad unknown field ${u}`);

  if (m.size?.min == null || m.size?.max == null) warnings.push(`${m.id}: size partly unknown`);
}

// Locales must have identical key sets.
const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' && v !== null && !Array.isArray(v) && !('one' in v || 'other' in v) ? flat(v, `${p}${k}.`) : [`${p}${k}`]));
const kEn = new Set(flat(en)), kAr = new Set(flat(ar));
for (const k of kEn) if (!kAr.has(k)) err(`locales: "${k}" missing in ar.json`);
for (const k of kAr) if (!kEn.has(k)) err(`locales: "${k}" missing in en.json`);

// Media manifest (optional) must reference existing monsters and files.
const manifestPath = 'src/data/media-manifest.json';
if (existsSync(join(root, manifestPath))) {
  const mf = read(manifestPath);
  for (const kind of ['images', 'audio', 'icons'])
    for (const [id, file] of Object.entries(mf[kind] ?? {})) {
      if (!seen.id.has(id)) err(`media: ${kind} file for unknown monster id "${id}"`);
      if (!existsSync(join(root, 'public', file))) err(`media: missing file public/${file}`);
    }
}

console.log(`Checked ${monsters.length} monsters, ${kEn.size} locale keys. ${warnings.length} notes (unknown sizes are allowed and shown as "?").`);
if (errors.length) {
  console.error(`\n${errors.length} error(s):\n- ` + errors.join('\n- '));
  process.exit(1);
}
console.log('Data OK');
