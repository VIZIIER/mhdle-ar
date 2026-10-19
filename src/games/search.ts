import type { Lang, Monster } from '../data';

/**
 * Normalizes text for matching in both scripts:
 * - Latin: lower case, accents removed, apostrophes dropped ("Dah'ren" → "dahren"), hyphens treated as spaces.
 * - Arabic: diacritics (tashkeel) and tatweel removed; alef forms (أ إ آ ٱ) → ا; ى → ي; ة → ه; ؤ → و; ئ → ي.
 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/['’`]/g, '')
    .replace(/[-_.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface Indexed {
  monster: Monster;
  keys: string[];
}
const cache = new WeakMap<readonly Monster[], Indexed[]>();
function index(pool: readonly Monster[]): Indexed[] {
  let idx = cache.get(pool);
  if (!idx) {
    idx = pool.map((m) => {
      const keys = [normalize(m.name.en), normalize(m.name.ar)];
      // Also match regardless of spacing: "kuluyaku", "kulu ya ku" and "Kulu-Ya-Ku" all find the same monster.
      return { monster: m, keys: [...keys, ...keys.map((k) => k.replace(/ /g, ''))] };
    });
    cache.set(pool, idx);
  }
  return idx;
}

/** 0 = a name starts with the query, 1 = a word starts with it, 2 = contains it, -1 = no match. */
function rank(keys: string[], q: string): number {
  let best = -1;
  for (const k of keys) {
    let r = -1;
    if (k.startsWith(q)) r = 0;
    else if (k.split(' ').some((w) => w.startsWith(q))) r = 1;
    else if (k.includes(q)) r = 2;
    if (r !== -1 && (best === -1 || r < best)) best = r;
  }
  return best;
}

/**
 * Searches monsters by English or Arabic name, whatever the interface language.
 * Results are ranked (prefix → word prefix → substring) then sorted alphabetically in the current language.
 */
export function searchMonsters(pool: readonly Monster[], query: string, lang: Lang, exclude: ReadonlySet<string>, limit = 12): Monster[] {
  const q = normalize(query);
  if (!q) return [];
  const compact = q.replace(/ /g, '');
  const collator = new Intl.Collator(lang, { sensitivity: 'base' });
  return index(pool)
    .filter((e) => !exclude.has(e.monster.id))
    .map((e) => {
      const a = rank(e.keys, q);
      const b = rank(e.keys, compact);
      return { m: e.monster, r: a === -1 ? b : b === -1 ? a : Math.min(a, b) };
    })
    .filter((e) => e.r !== -1)
    .sort((a, b) => a.r - b.r || collator.compare(a.m.name[lang], b.m.name[lang]))
    .slice(0, limit)
    .map((e) => e.m);
}
