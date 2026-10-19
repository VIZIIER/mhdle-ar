import monstersJson from './monsters.json';
import vocabJson from './vocab.json';
import gamesJson from './games.json';
import mediaJson from './media-manifest.json';
import type { GameInfo, Lang, Localized, MediaKind, Monster } from '../types';

export type { Lang, Localized, Monster, GameInfo, MediaKind } from '../types';

export const MONSTERS: Monster[] = (monstersJson as { monsters: Monster[] }).monsters;
export const MONSTER_BY_ID = new Map(MONSTERS.map((m) => [m.id, m]));

export const GAMES: GameInfo[] = (gamesJson as { games: GameInfo[] }).games;
const DISPLAY_ONLY: GameInfo[] = (gamesJson as { displayOnly: GameInfo[] }).displayOnly;
export const GAME_BY_ID = new Map([...GAMES, ...DISPLAY_ONLY].map((g) => [g.id, g]));
export const ALL_GAME_IDS = GAMES.map((g) => g.id);

type VocabEntry = Localized & { icon?: string };
export const VOCAB = vocabJson as {
  classes: Record<string, VocabEntry>;
  elements: Record<string, VocabEntry>;
  ailments: Record<string, VocabEntry>;
};

const MEDIA = mediaJson as Record<MediaKind, Record<string, string>>;

/** Relative URL of a media file (resolved against the page, so it works under any sub-path). */
export function mediaUrl(kind: MediaKind, id: string): string | null {
  const path = MEDIA[kind]?.[id];
  return path ? `${import.meta.env.BASE_URL}${path}` : null;
}
export const hasMedia = (kind: MediaKind, id: string) => Boolean(MEDIA[kind]?.[id]);

export const monsterName = (m: Monster, lang: Lang) => m.name[lang];
export const vocabLabel = (kind: keyof typeof VOCAB, id: string, lang: Lang) => VOCAB[kind][id]?.[lang] ?? id;
export const gameLabel = (id: string, lang: Lang) => GAME_BY_ID.get(id)?.[lang] ?? id;
