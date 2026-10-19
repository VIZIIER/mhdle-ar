import type { Monster } from '../data';
import { normalize } from './search';

const STOP = new Set(['the', 'of', 'and', 'a', 'an']);
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Words that would give the answer away: the full names and each meaningful word of them, in both languages. */
export function nameParts(m: Monster): string[] {
  const parts = new Set<string>();
  for (const name of [m.name.en, m.name.ar]) {
    parts.add(name);
    for (const w of name.split(/[\s\-']+/)) if (w.length >= 3 && !STOP.has(w.toLowerCase())) parts.add(w);
  }
  return [...parts].sort((a, b) => b.length - a.length);
}

/**
 * Replaces every occurrence of the answer's name (and its parts) in a description with "…",
 * case-insensitively, like the original Compendium mode. Arabic matches tolerate diacritics.
 */
export function maskDescription(text: string, m: Monster, mask = '…'): string {
  let out = text;
  for (const part of nameParts(m)) {
    const re = new RegExp(`${escape(part)}(s|'s)?`, 'giu');
    out = out.replace(re, mask);
  }
  // Arabic fallback: compare normalized words, catching spelling variants with/without hamza.
  const arParts = new Set(nameParts(m).map(normalize).filter((p) => /[؀-ۿ]/.test(p)));
  if (arParts.size) out = out.split(/(\s+)/).map((tok) => (arParts.has(normalize(tok.replace(/^ال/, ''))) || arParts.has(normalize(tok)) ? mask : tok)).join('');
  return out.replace(/(…\s*){2,}/g, `${mask} `);
}
