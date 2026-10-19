import { ALL_GAME_IDS, GAMES } from '../data';
import { load, save } from './storage';

import type { Settings } from '../types';
export type { Settings };

const DEFAULT: Settings = { games: [...ALL_GAME_IDS], configured: false };

export function loadSettings(): Settings {
  const s = load<Partial<Settings>>('settings', DEFAULT);
  const games = Array.isArray(s.games) ? s.games.filter((g) => ALL_GAME_IDS.includes(g)) : DEFAULT.games;
  return { games: games.length ? games : DEFAULT.games, configured: Boolean(s.configured) };
}

export const saveSettings = (s: Settings) => save('settings', s);

/** Order-independent signature of a selection (used to detect changes). */
export const selectionSignature = (games: readonly string[]) => [...games].sort().join(',');

/**
 * Encodes the selection as a base-36 bitmask over the fixed game order in games.json.
 * Used by share links (?s=) so a friend can hunt the very same daily monster.
 */
export function encodeSelection(games: readonly string[]): string {
  let n = 0n;
  GAMES.forEach((g, i) => {
    if (games.includes(g.id)) n |= 1n << BigInt(i);
  });
  return n.toString(36);
}

export function decodeSelection(code: string | null): string[] | null {
  if (!code || !/^[0-9a-z]{1,12}$/.test(code)) return null;
  let n = 0n;
  for (const ch of code) n = n * 36n + BigInt(parseInt(ch, 36));
  const games = GAMES.filter((_, i) => (n >> BigInt(i)) & 1n).map((g) => g.id);
  return games.length ? games : null;
}
