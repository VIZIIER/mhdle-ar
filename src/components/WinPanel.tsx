import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { mediaUrl, type Monster } from '../data';
import type { ModeId } from '../games/modes';
import type { RoundApi } from '../hooks/useRound';
import { useI18n } from '../i18n/I18nProvider';
import { useAppState } from '../state/AppState';
import { Countdown } from './Countdown';
import { MonsterBadge } from './MonsterBadge';
import { SharePanel } from './SharePanel';
import { completedModes } from '../persistence/progress';

interface Props {
  mode: ModeId;
  api: RoundApi;
  answer: Monster;
  challenge: number | null;
}

/** Shown when the round is won: the answer, a "cleared" stamp, countdown, sharing, other quests and infinite mode. */
export function WinPanel({ mode, api, answer, challenge }: Props) {
  const { t, lang } = useI18n();
  const { modes, day } = useAppState();
  const tries = api.guesses.length;
  const picture = mediaUrl('images', answer.id);
  const done = completedModes(day);
  const other = lang === 'ar' ? 'en' : 'ar';
  const triesText = (n: number) => t('game.tries', { count: n });

  // Move focus (and the view) to the result once, when it first appears.
  const focusOnce = useCallback((el: HTMLElement | null) => {
    if (el) window.setTimeout(() => el.focus({ preventScroll: false }), 50);
  }, []);

  let versus: string | null = null;
  if (challenge && !api.isInfinite) {
    const key = tries < challenge ? 'challenge.win' : tries === challenge ? 'challenge.tie' : 'challenge.lose';
    versus = t(key, { mine: triesText(tries), theirs: triesText(challenge) });
  }

  return (
    <section className="win" aria-labelledby="win-title" tabIndex={-1} ref={focusOnce}>
      <div className="win-card">
        <h2 id="win-title">{t('win.title')}</h2>
        <p className="win-flavor">{t(`modes.${mode}.flavor`)}</p>
        <div className="win-reveal">
          {picture ? (
            <img className="win-picture" src={picture} alt={t('win.pictureAlt', { name: answer.name[lang] })} />
          ) : (
            <MonsterBadge monster={answer} size={96} />
          )}
          <span className="seal seal-stamp" aria-hidden="true">
            {t('win.stamp')}
          </span>
        </div>
        <p className="win-answer">
          {t('win.answer', { name: answer.name[lang] })} <bdi lang={other} className="win-alt">({answer.name[other]})</bdi>
        </p>
        <p className="win-tries">{t('win.in', { count: tries })}</p>
        {versus && <p className="win-versus">{versus}</p>}
      </div>

      {api.isInfinite ? (
        <div className="win-actions">
          <p className="note">{t('win.infiniteNote')}</p>
          <button type="button" className="btn btn-primary" onClick={api.startInfinite}>
            {t('win.infiniteNext')}
          </button>
          <button type="button" className="btn" onClick={api.backToDaily}>
            {t('win.backToDaily')}
          </button>
        </div>
      ) : (
        <>
          <Countdown label={t('win.nextIn')} />
          <SharePanel mode={mode} guesses={api.guesses} answer={answer} />
          <div className="win-actions">
            <button type="button" className="btn" onClick={api.startInfinite}>
              {t('win.infinite', { mode: t(`modes.${mode}.name`) })}
            </button>
          </div>
        </>
      )}

      {modes.length > 1 && (
        <nav className="other-quests" aria-label={t('win.otherQuests')}>
          <h3>{t('win.otherQuests')}</h3>
          <ul>
            {modes
              .filter((m) => m !== mode)
              .map((m) => (
                <li key={m}>
                  <Link className={done.includes(m) ? 'quest-link done' : 'quest-link'} to={`/${m}`}>
                    {t(`modes.${m}.name`)}
                    {done.includes(m) && <span aria-label={t('home.cleared')}> ✓</span>}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      )}
    </section>
  );
}
