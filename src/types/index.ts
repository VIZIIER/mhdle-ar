/** Shared domain types. Game rules, persistence and UI all import from here. */

export type Lang = 'en' | 'ar';
export type Localized = { en: string; ar: string };

export type ModeId = 'classic' | 'compendium' | 'surveyor' | 'roar';

export interface Monster {
  /** Stable kebab-case id (never translated; used in storage, share links and media file names). */
  id: string;
  name: Localized;
  /** Official in-game titles with their Arabic translation (used for the nickname hint). */
  titles: Localized[];
  description: Localized;
  classes: string[];
  elements: string[];
  ailments: string[];
  weaknesses: string[];
  /** Gold-crown sizes in cm; null when the source has no value. */
  size: { min: number | null; max: number | null };
  threat: { min: number; max: number } | null;
  firstGame: string;
  generation: number;
  games: string[];
  /** Fields the source marks as unknown (compared as "no data"). */
  unknown?: string[];
}

export interface GameInfo extends Localized {
  id: string;
  year: number;
  gen: number;
  short: string;
}

export type MediaKind = 'images' | 'icons' | 'audio';

/** One round of one mode (the daily round, or an infinite round). */
export interface Round {
  day: string;
  answerId: string;
  /** Guessed monster ids in order, including the winning one. */
  guesses: string[];
  won: boolean;
  /** Hints the player has opened (by index). */
  revealed: number[];
  infinite: boolean;
}

export interface Settings {
  /** Selected game ids. Only monsters from these games can be answers or search results. */
  games: string[];
  /** False until the player has confirmed a game selection once. */
  configured: boolean;
}
