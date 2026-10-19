import { MONSTERS, hasMedia, type Monster } from '../data';

import type { ModeId } from '../types';
export type { ModeId };
export const MODE_IDS: ModeId[] = ['classic', 'compendium', 'surveyor', 'roar'];

export interface ModeDef {
  id: ModeId;
  /** Salt that makes each mode pick a different monster on the same day. */
  salt: string;
  emoji: string;
  /** Extra eligibility rule on top of the game selection. */
  eligible: (m: Monster) => boolean;
  /** Wrong guesses needed before each hint unlocks (empty = no hints). */
  hintThresholds: number[];
}

export const MODES: Record<ModeId, ModeDef> = {
  classic: { id: 'classic', salt: 'classic', emoji: '🗡️', eligible: () => true, hintThresholds: [] },
  compendium: { id: 'compendium', salt: 'compendium', emoji: '📜', eligible: () => true, hintThresholds: [5, 10] },
  surveyor: { id: 'surveyor', salt: 'surveyor', emoji: '📷', eligible: (m) => hasMedia('images', m.id), hintThresholds: [] },
  roar: { id: 'roar', salt: 'roar', emoji: '🔊', eligible: (m) => hasMedia('audio', m.id), hintThresholds: [5, 10] },
};

/** Monsters that can be answers (and search results) for a mode, given the selected games. */
export function poolFor(mode: ModeId, selectedGames: readonly string[]): Monster[] {
  const sel = new Set(selectedGames);
  return MONSTERS.filter((m) => m.games.some((g) => sel.has(g)) && MODES[mode].eligible(m));
}

/** Search candidates: every monster in the selected games (the player may guess any of them). */
export function searchPoolFor(selectedGames: readonly string[]): Monster[] {
  const sel = new Set(selectedGames);
  return MONSTERS.filter((m) => m.games.some((g) => sel.has(g)));
}

/** A mode is offered only when at least one monster in the full roster has the media it needs. */
export function modeInstalled(mode: ModeId): boolean {
  return MONSTERS.some(MODES[mode].eligible);
}
export const installedModes = (): ModeId[] => MODE_IDS.filter(modeInstalled);
