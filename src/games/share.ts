import { compactDay } from '../utils/day';
import { STATUS_EMOJI, type Status } from './compare';
import { MODES, type ModeId } from './modes';
import { encodeSelection } from '../persistence/settings';

/** Builds the link a friend opens: same mode, same game selection (?s=), and the score to beat (&c=tries-YYYYMMDD). */
export function shareUrl(mode: ModeId, games: readonly string[], tries: number, day: string): string {
  const base = `${location.origin}${location.pathname}`;
  const q = new URLSearchParams({ s: encodeSelection(games), c: `${Math.min(tries, 99)}-${compactDay(day)}` });
  return `${base}#/${mode}?${q.toString()}`;
}

/** Parses "&c=4-20261018" into a challenge, only if it is for today. */
export function parseChallenge(param: string | null, day: string): number | null {
  const m = param?.match(/^(\d{1,2})-(\d{8})$/);
  if (!m || m[2] !== compactDay(day)) return null;
  const n = Number(m[1]);
  return n >= 1 ? n : null;
}

/** Emoji grid of the last rows of a Classic game (newest last), like the original share card. */
export function classicGrid(rows: Status[][], maxRows = 5): { lines: string[]; hidden: number } {
  const hidden = Math.max(0, rows.length - maxRows);
  return { lines: rows.slice(-maxRows).map((r) => r.map((s) => STATUS_EMOJI[s]).join('')), hidden };
}

export const modeEmoji = (mode: ModeId) => MODES[mode].emoji;
