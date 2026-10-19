import { useMemo } from 'react';
import { vocabLabel, type Monster } from '../data';
import { hashString } from '../utils/random';
import type { RoundApi } from '../hooks/useRound';
import { useI18n } from '../i18n/I18nProvider';

const HINTS = ['class', 'nickname'] as const;

/** Class (after 5 wrong guesses) and nickname (after 10) hints, opened on click like the original. */
export function Hints({ api, thresholds }: { api: RoundApi; thresholds: number[] }) {
  const { t, lang } = useI18n();
  const { answer, round, wrongCount } = api;

  // The nickname is chosen once per round (stable across reloads and language switches).
  const titleIndex = useMemo(() => {
    if (!answer?.titles.length || !round) return -1;
    return hashString(`${round.day}|${round.answerId}|${round.infinite}`) % answer.titles.length;
  }, [answer, round]);

  if (!answer || !round || round.won) return null;

  const content = (h: (typeof HINTS)[number], m: Monster) => {
    if (h === 'class') return m.classes.map((c) => vocabLabel('classes', c, lang)).join(lang === 'ar' ? '، ' : ', ');
    return titleIndex >= 0 ? m.titles[titleIndex][lang] : t('hints.noNickname');
  };

  return (
    <div className="hints">
      {HINTS.map((h, i) => {
        const name = t(`hints.${h}`);
        const unlocked = api.hintUnlocked(i);
        const opened = round.revealed.includes(i);
        if (opened)
          return (
            <div key={h} className="hint hint-open" aria-live="polite">
              <span className="hint-label">{name}</span>
              <strong>{content(h, answer)}</strong>
            </div>
          );
        if (unlocked)
          return (
            <button key={h} type="button" className="hint hint-ready" onClick={() => api.reveal(i)}>
              {t('hints.reveal', { hint: name })}
            </button>
          );
        return (
          <div key={h} className="hint hint-locked">
            {t('hints.locked', { count: thresholds[i] - wrongCount, hint: name })}
          </div>
        );
      })}
    </div>
  );
}
