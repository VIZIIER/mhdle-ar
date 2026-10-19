import { useCallback, useMemo, useState } from 'react';
import { MONSTER_BY_ID, type Monster } from '../data';
import { pickDaily, pickInfinite } from '../games/daily';
import { MODES, poolFor, searchPoolFor, type ModeId } from '../games/modes';
import { loadModeRounds, recordDailyWin, recordStats, saveModeRounds, type Round } from '../persistence/progress';
import { useAppState } from '../state/AppState';

export interface RoundApi {
  pool: Monster[];
  searchPool: Monster[];
  answer: Monster | null;
  round: Round | null;
  isInfinite: boolean;
  guesses: Monster[];
  wrongCount: number;
  /** Returns true when the guess was accepted (not a repeat, round not over). */
  guess: (id: string) => boolean;
  reveal: (hintIndex: number) => void;
  hintUnlocked: (hintIndex: number) => boolean;
  startInfinite: () => void;
  backToDaily: () => void;
}

const freshRound = (day: string, answerId: string, infinite: boolean): Round => ({ day, answerId, guesses: [], won: false, revealed: [], infinite });

/**
 * State of the current round of a mode: today's daily round, or an infinite round started after winning it.
 * Everything is persisted per mode, so reloading or switching language/mode never loses guesses.
 */
export function useRound(mode: ModeId): RoundApi {
  const { settings, day } = useAppState();
  const pool = useMemo(() => poolFor(mode, settings.games), [mode, settings.games]);
  const searchPool = useMemo(() => searchPoolFor(settings.games), [settings.games]);
  const dailyAnswer = useMemo(() => pickDaily(pool, day, MODES[mode].salt), [pool, day, mode]);
  const [version, setVersion] = useState(0);

  const stored = useMemo(() => {
    void version;
    const s = loadModeRounds(mode);
    const dailyValid = s.daily && s.daily.day === day && s.daily.answerId === dailyAnswer?.id;
    const daily = dailyValid ? s.daily! : dailyAnswer ? freshRound(day, dailyAnswer.id, false) : null;
    const infValid = s.infinite && s.infinite.day === day && pool.some((m) => m.id === s.infinite!.answerId);
    return { ...s, daily, infinite: infValid ? s.infinite : null };
  }, [mode, day, dailyAnswer, pool, version]);

  const isInfinite = Boolean(stored.infinite);
  const round = stored.infinite ?? stored.daily;
  const answer = round ? MONSTER_BY_ID.get(round.answerId) ?? null : null;
  const guesses = useMemo(() => (round?.guesses ?? []).map((id) => MONSTER_BY_ID.get(id)).filter(Boolean) as Monster[], [round]);
  const wrongCount = round ? round.guesses.filter((g) => g !== round.answerId).length : 0;

  const commit = useCallback(
    (next: typeof stored) => {
      saveModeRounds(mode, { daily: next.daily, infinite: next.infinite, recent: next.recent });
      setVersion((v) => v + 1);
    },
    [mode],
  );

  const guess = useCallback(
    (id: string) => {
      if (!round || round.won || round.guesses.includes(id) || !MONSTER_BY_ID.has(id)) return false;
      const updated: Round = { ...round, guesses: [...round.guesses, id] };
      if (id === round.answerId) {
        updated.won = true;
        const tries = updated.guesses.length;
        if (!round.infinite) recordDailyWin(round.day, mode, tries);
        recordStats(mode, tries, round.infinite);
      }
      commit(round.infinite ? { ...stored, infinite: updated } : { ...stored, daily: updated });
      return true;
    },
    [round, stored, commit, mode],
  );

  const thresholds = MODES[mode].hintThresholds;
  const hintUnlocked = useCallback((i: number) => thresholds[i] !== undefined && (wrongCount >= thresholds[i] || Boolean(round?.won)), [thresholds, wrongCount, round]);

  const reveal = useCallback(
    (i: number) => {
      if (!round || round.revealed.includes(i) || !hintUnlocked(i)) return;
      const updated = { ...round, revealed: [...round.revealed, i] };
      commit(round.infinite ? { ...stored, infinite: updated } : { ...stored, daily: updated });
    },
    [round, stored, commit, hintUnlocked],
  );

  const startInfinite = useCallback(() => {
    const avoid = [stored.daily?.answerId, stored.infinite?.answerId, ...stored.recent].filter(Boolean) as string[];
    const next = pickInfinite(pool, avoid);
    if (!next) return;
    commit({ ...stored, infinite: freshRound(day, next.id, true), recent: [next.id, ...stored.recent].slice(0, 30) });
  }, [stored, pool, commit, day]);

  const backToDaily = useCallback(() => commit({ ...stored, infinite: null }), [stored, commit]);

  return { pool, searchPool, answer, round, isInfinite, guesses, wrongCount, guess, reveal, hintUnlocked, startInfinite, backToDaily };
}
