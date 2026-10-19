import type { Monster } from '../data';
import { dayNumber } from '../utils/day';
import { hashString, mulberry32, seededShuffle } from '../utils/random';

/**
 * Picks the daily answer for a mode.
 *
 * The pool is ordered by id, then shuffled with a seed made of the mode salt and a "cycle"
 * number. Each day takes the next monster of the shuffled cycle, so a monster cannot come back
 * until every monster in the pool has been the answer once. Everyone with the same game
 * selection gets the same monster on the same local day (this is what share links rely on).
 */
export function pickDaily(pool: readonly Monster[], day: string, salt: string): Monster | null {
  if (!pool.length) return null;
  const sorted = [...pool].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const n = dayNumber(day);
  const len = sorted.length;
  const cycle = Math.floor(n / len);
  const position = ((n % len) + len) % len;
  const order = seededShuffle(sorted, hashString(`${salt}|cycle|${cycle}|${len}`));
  return order[position];
}

/** Picks a random monster for an infinite round, avoiding recently seen answers when possible. */
export function pickInfinite(pool: readonly Monster[], avoid: readonly string[], seed = Math.random() * 2 ** 32): Monster | null {
  if (!pool.length) return null;
  const fresh = pool.filter((m) => !avoid.includes(m.id));
  const from = fresh.length ? fresh : pool;
  const rand = mulberry32(seed >>> 0);
  return from[Math.floor(rand() * from.length)];
}
