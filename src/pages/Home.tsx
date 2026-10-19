import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Countdown } from '../components/Countdown';
import { addDays } from '../utils/day';
import { MODE_IDS, MODES } from '../games/modes';
import { completedModes, loadModeRounds, updateStreak } from '../persistence/progress';
import { loadRaw, saveRaw } from '../persistence/storage';
import { useI18n } from '../i18n/I18nProvider';
import { useAppState } from '../state/AppState';

export function Home() {
  const { t } = useI18n();
  const { day, modes, settings, openDialog } = useAppState();

  // Decided once per page load, so switching language doesn't change which message is shown.
  const [firstVisit] = useState(() => {
    const first = loadRaw('visited') !== '1';
    saveRaw('visited', '1');
    return first;
  });

  const { message, done } = useMemo(() => {
    const streak = updateStreak(day, modes);
    const done = completedModes(day).filter((m) => modes.includes(m));
    let message: string;
    if (modes.length && done.length === modes.length) message = t('home.msgAllDone', { count: streak.count });
    else if (streak.lost?.day === day) message = t('home.msgLost', { count: streak.lost.count });
    else if (done.length > 0) message = t('home.msgProgress', { count: done.length, total: modes.length });
    else if (firstVisit) message = t('home.msgFirst');
    else if (streak.lastDay === addDays(day, -1)) message = t('home.msgYesterday');
    else message = t('home.msgIdle');
    return { message, done };
  }, [day, modes, t, firstVisit]);

  return (
    <div className="home">
      <section className="home-hero">
        <h1 className="home-title">{t('app.tagline')}</h1>
        <div className="home-actions">
          <button type="button" className="btn btn-dark" onClick={() => openDialog('games')}>
            {t('home.changeGames')}
          </button>
          <button type="button" className="btn btn-dark" onClick={() => openDialog('stats')}>
            {t('nav.stats')}
          </button>
        </div>
        <p className="home-message parchment" role="status">
          {message}
        </p>
      </section>

      <section aria-labelledby="quests-title">
        <h2 id="quests-title" className="sr-only">
          {t('home.heading')}
        </h2>
        <ul className="board-quests">
          {modes.map((mode) => {
            const cleared = done.includes(mode);
            const r = loadModeRounds(mode).daily;
            const tries = r && r.day === day && !r.won ? r.guesses.length : 0;
            return (
              <li key={mode}>
                <Link to={`/${mode}`} className={cleared ? 'quest quest-cleared' : 'quest'}>
                  <span className="quest-pin" aria-hidden="true" />
                  <span className="quest-icon" aria-hidden="true">
                    {MODES[mode].emoji}
                  </span>
                  <span className="quest-text">
                    <span className="quest-name">{t(`modes.${mode}.name`)}</span>
                    <span className="quest-tagline">{t(`modes.${mode}.tagline`)}</span>
                  </span>
                  <span className="quest-state">
                    {cleared ? t('home.cleared') : tries ? t('home.triesSoFar', { count: tries }) : t('home.open')}
                  </span>
                  {cleared && (
                    <span className="seal" aria-hidden="true">
                      {t('home.cleared')}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        {modes.length < MODE_IDS.length && <p className="note home-hidden">{t('home.hiddenModes')}</p>}
      </section>

      <section className="home-meta">
        <Countdown label={t('home.nextIn')} />
        <p className="note">{t('home.selection', { count: settings.games.length })}</p>
      </section>
    </div>
  );
}
