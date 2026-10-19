import { gameLabel, vocabLabel, type Lang, type Monster } from '../data';
import type { TFunction } from '../i18n/I18nProvider';
import type { ColumnId } from '../games/compare';

type Num = (n: number, opts?: Intl.NumberFormatOptions) => string;

/** Human-readable value of one Classic column for a monster, in the current language. */
export function formatColumn(col: ColumnId, m: Monster, lang: Lang, t: TFunction, num: Num): string {
  const list = (kind: 'elements' | 'ailments' | 'classes', ids: string[]) =>
    ids.length ? ids.map((id) => vocabLabel(kind, id, lang)).join(lang === 'ar' ? '، ' : ', ') : t('game.none');
  switch (col) {
    case 'elements':
      return list('elements', m.elements);
    case 'ailments':
      return list('ailments', m.ailments);
    case 'weaknesses':
      return m.unknown?.includes('weaknesses') ? t('game.unknown') : list('elements', m.weaknesses);
    case 'classes':
      return list('classes', m.classes);
    case 'maxSize':
    case 'minSize': {
      const v = col === 'maxSize' ? m.size.max : m.size.min;
      return v == null ? t('game.unknown') : t('classic.size', { value: num(v, { maximumFractionDigits: 1 }) });
    }
    case 'threat':
      if (!m.threat) return t('game.unknown');
      return m.threat.min === m.threat.max
        ? t('classic.threatOne', { n: m.threat.min })
        : t('classic.threatRange', { min: m.threat.min, max: m.threat.max });
    case 'firstGame':
      return gameLabel(m.firstGame, lang);
    case 'generation':
      return t('classic.generationValue', { n: m.generation });
  }
}

export function formatCountdown(ms: number, t: TFunction): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  return t('countdown.format', { h: String(Math.floor(total / 3600)), m: pad(Math.floor((total % 3600) / 60)), s: pad(total % 60) });
}
