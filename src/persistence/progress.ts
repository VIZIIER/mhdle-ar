import { addDays, dayNumber } from '../utils/day';
import type { ModeId } from '../games/modes';
import { load, save } from './storage';
import type { Round } from '../types';
export type { Round };


interface ModeRounds {
  daily: Round | null;
  infinite: Round | null;
  /** Recent infinite answers, to avoid immediate repeats. */
  recent: string[];
}
type RoundsStore = Partial<Record<ModeId, ModeRounds>>;


const isStrArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');

/** Accepts only well-formed rounds; anything corrupted or hand-edited is discarded instead of crashing the game. */
export function sanitizeRound(v: unknown): Round | null {
  if (!v || typeof v !== 'object') return null;
  const r = v as Record<string, unknown>;
  if (typeof r.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(r.day)) return null;
  if (typeof r.answerId !== 'string' || !isStrArray(r.guesses)) return null;
  const revealed = Array.isArray(r.revealed) ? r.revealed.filter((x): x is number => Number.isInteger(x)) : [];
  return { day: r.day, answerId: r.answerId, guesses: [...new Set(r.guesses)], won: r.won === true, revealed, infinite: r.infinite === true };
}

export function loadModeRounds(mode: ModeId): ModeRounds {
  const store = load<RoundsStore>('rounds', {});
  const raw: Partial<Record<keyof ModeRounds, unknown>> = (store && typeof store === 'object' ? store[mode] : null) ?? {};
  return {
    daily: sanitizeRound(raw.daily),
    infinite: sanitizeRound(raw.infinite),
    recent: isStrArray(raw.recent) ? raw.recent.slice(0, 30) : [],
  };
}

export function saveModeRounds(mode: ModeId, value: ModeRounds): void {
  const store = load<RoundsStore>('rounds', {});
  store[mode] = value;
  save('rounds', store);
}

// ---------------------------------------------------------------- missions (daily completions)

/** day → mode → number of tries used to win the daily round. Infinite rounds never count. */
type DoneStore = Record<string, Partial<Record<ModeId, number>>>;

export function loadDone(): DoneStore {
  return load<DoneStore>('done', {});
}

export function recordDailyWin(day: string, mode: ModeId, tries: number): void {
  const done = loadDone();
  done[day] = { ...(done[day] ?? {}), [mode]: done[day]?.[mode] ?? tries };
  // Keep about two months of history.
  const keep = Object.keys(done).filter((d) => dayNumber(d) >= dayNumber(day) - 60);
  save('done', Object.fromEntries(keep.map((d) => [d, done[d]])));
}

export const completedModes = (day: string): ModeId[] => Object.keys(loadDone()[day] ?? {}) as ModeId[];

// ---------------------------------------------------------------- streak

export interface Streak {
  count: number;
  best: number;
  /** Last day on which every available mode was completed. */
  lastDay: string | null;
  /** Shown for one day after a streak is lost. */
  lost: { day: string; count: number } | null;
}
const DEFAULT_STREAK: Streak = { count: 0, best: 0, lastDay: null, lost: null };

export const loadStreak = (): Streak => ({ ...DEFAULT_STREAK, ...load<Partial<Streak>>('streak', {}) });

/**
 * Brings the streak up to date for `today`:
 * 1. if every required mode is done today, count the day once (+1, or restart at 1 after a gap);
 * 2. if more than one calendar day passed since the last full day, the streak is lost (shown once that day).
 */
export function updateStreak(today: string, requiredModes: readonly ModeId[]): Streak {
  const s = loadStreak();
  const doneToday = completedModes(today);
  const allDone = requiredModes.length > 0 && requiredModes.every((m) => doneToday.includes(m));

  if (s.count > 0 && s.lastDay && dayNumber(today) - dayNumber(s.lastDay) > 1) {
    s.lost = { day: today, count: s.count };
    s.count = 0;
  }
  if (allDone && s.lastDay !== today) {
    s.count = s.lastDay === addDays(today, -1) ? s.count + 1 : 1;
    s.best = Math.max(s.best, s.count);
    s.lastDay = today;
  }
  if (s.lost && s.lost.day !== today) s.lost = null;
  save('streak', s);
  return s;
}

// ---------------------------------------------------------------- per-mode statistics

export interface ModeStats {
  wins: number;
  totalTries: number;
  best: number | null;
  infiniteWins: number;
}
type StatsStore = Partial<Record<ModeId, ModeStats>>;
const emptyStats = (): ModeStats => ({ wins: 0, totalTries: 0, best: null, infiniteWins: 0 });

export function loadStats(): Record<ModeId, ModeStats> {
  const s = load<StatsStore>('stats', {});
  return {
    classic: { ...emptyStats(), ...s.classic },
    compendium: { ...emptyStats(), ...s.compendium },
    surveyor: { ...emptyStats(), ...s.surveyor },
    roar: { ...emptyStats(), ...s.roar },
  };
}

export function recordStats(mode: ModeId, tries: number, infinite: boolean): void {
  const all = loadStats();
  const m = all[mode];
  if (infinite) m.infiniteWins += 1;
  else {
    m.wins += 1;
    m.totalTries += tries;
    m.best = m.best == null ? tries : Math.min(m.best, tries);
  }
  save('stats', all);
}
