import { useMemo, useState } from 'react';
import type { Monster } from '../data';
import { compareMonsters, COLUMNS } from '../games/compare';
import { type ModeId, MODES } from '../games/modes';
import { classicGrid, shareUrl } from '../games/share';
import { useI18n } from '../i18n/I18nProvider';
import { useAppState } from '../state/AppState';

interface Props {
  mode: ModeId;
  guesses: Monster[];
  answer: Monster;
}

/** Text-only share card (copy / native share), like the original. The link carries the game selection and the score. */
export function SharePanel({ mode, guesses, answer }: Props) {
  const { t, lang } = useI18n();
  const { settings, day } = useAppState();
  const [copied, setCopied] = useState<null | 'ok' | 'fail'>(null);
  const tries = guesses.length;

  const text = useMemo(() => {
    const date = new Date().toLocaleDateString(lang === 'ar' ? 'ar-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const lines = [
      `${t(`share.head.${mode}`)} ${t('share.result', { count: tries })}! ${t(tries === 1 ? 'share.outroFirst' : 'share.outro')}`,
      `${MODES[mode].emoji} ${t(`modes.${mode}.name`)} · MH DLE · ${date}`,
    ];
    if (mode === 'classic') {
      const rows = guesses.map((g) => {
        const r = compareMonsters(g, answer);
        return COLUMNS.map((c) => r[c].status);
      });
      const grid = classicGrid(rows);
      if (grid.hidden) lines.push(t('share.earlier', { count: grid.hidden }));
      lines.push(...grid.lines);
    }
    lines.push('', `${t('share.cta')} ${shareUrl(mode, settings.games, tries, day)}`);
    return lines.join('\n');
  }, [t, lang, mode, tries, guesses, answer, settings.games, day]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied('ok');
    } catch {
      setCopied('fail');
    }
    window.setTimeout(() => setCopied(null), 2500);
  };

  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <section className="share" aria-labelledby="share-title">
      <h3 id="share-title">{t('share.heading')}</h3>
      <pre className="share-text" dir="auto">
        {text}
      </pre>
      <div className="share-actions">
        <button type="button" className="btn btn-primary" onClick={copy}>
          {copied === 'ok' ? t('share.copied') : t('share.copy')}
        </button>
        {canShare && (
          <button type="button" className="btn" onClick={() => navigator.share({ text }).catch(() => undefined)}>
            {t('share.share')}
          </button>
        )}
      </div>
      <p className="share-note" role="status">
        {copied === 'fail' ? t('share.copyFailed') : t('share.note')}
      </p>
    </section>
  );
}
