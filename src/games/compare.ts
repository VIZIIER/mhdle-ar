import type { Monster } from '../data';

/** Result of comparing one attribute of a guess with the answer (Classic mode). */
export type Status = 'correct' | 'partial' | 'incorrect' | 'unknown';
export type Direction = 'higher' | 'lower' | null;
export interface Cell {
  status: Status;
  /** For numeric columns: the answer is higher / lower than the guess. */
  direction: Direction;
}

export type ColumnId = 'elements' | 'ailments' | 'weaknesses' | 'classes' | 'maxSize' | 'minSize' | 'threat' | 'firstGame' | 'generation';
export const COLUMNS: ColumnId[] = ['elements', 'ailments', 'weaknesses', 'classes', 'maxSize', 'minSize', 'threat', 'firstGame', 'generation'];

const cell = (status: Status, direction: Direction = null): Cell => ({ status, direction });

/** Set comparison: identical → correct, overlap → partial, no overlap → incorrect. Two empty sets are identical. */
export function compareSets(guess: readonly string[], answer: readonly string[]): Cell {
  const g = new Set(guess);
  const a = new Set(answer);
  const shared = [...g].filter((x) => a.has(x)).length;
  if (g.size === a.size && shared === g.size) return cell('correct');
  if (shared > 0) return cell('partial');
  return cell('incorrect');
}

const EPS = 0.005;
export function compareNumber(guess: number | null, answer: number | null): Cell {
  if (guess == null && answer == null) return cell('correct');
  if (guess == null || answer == null) return cell('unknown');
  if (Math.abs(guess - answer) < EPS) return cell('correct');
  return cell('incorrect', answer > guess ? 'higher' : 'lower');
}

/** Threat ranges: identical → correct, overlapping → partial, otherwise an arrow towards the answer. */
export function compareRange(guess: { min: number; max: number } | null, answer: { min: number; max: number } | null): Cell {
  if (!guess && !answer) return cell('correct');
  if (!guess || !answer) return cell('unknown');
  if (guess.min === answer.min && guess.max === answer.max) return cell('correct');
  if (guess.min <= answer.max && answer.min <= guess.max) return cell('partial');
  return cell('incorrect', answer.min > guess.max ? 'higher' : 'lower');
}

const isUnknown = (m: Monster, field: string) => m.unknown?.includes(field) ?? false;

export function compareMonsters(guess: Monster, answer: Monster): Record<ColumnId, Cell> {
  const set = (field: 'elements' | 'ailments' | 'weaknesses' | 'classes') =>
    isUnknown(guess, field) && isUnknown(answer, field)
      ? cell('correct')
      : isUnknown(guess, field) || isUnknown(answer, field)
        ? cell('unknown')
        : compareSets(guess[field], answer[field]);
  return {
    elements: set('elements'),
    ailments: set('ailments'),
    weaknesses: set('weaknesses'),
    classes: set('classes'),
    maxSize: compareNumber(guess.size.max, answer.size.max),
    minSize: compareNumber(guess.size.min, answer.size.min),
    threat: compareRange(guess.threat, answer.threat),
    firstGame: cell(guess.firstGame === answer.firstGame ? 'correct' : 'incorrect'),
    generation: compareNumber(guess.generation, answer.generation),
  };
}

/** True when every column is fully correct (used for the "same characteristics, different monster" notice). */
export const allCorrect = (row: Record<ColumnId, Cell>) => COLUMNS.every((c) => row[c].status === 'correct');

export const STATUS_EMOJI: Record<Status, string> = { correct: '🟩', partial: '🟧', incorrect: '🟥', unknown: '⬜' };
