import { NavLink, Outlet, Link } from 'react-router-dom';
import { completedModes } from '../persistence/progress';
import { useI18n } from '../i18n/I18nProvider';
import { useAppState } from '../state/AppState';
import { GameSelectDialog } from './GameSelectDialog';
import { StatsDialog } from './StatsDialog';
import { MODES } from '../games/modes';

export function Layout() {
  const { t, lang, setLang } = useI18n();
  const { modes, day, openDialog } = useAppState();
  const done = completedModes(day);

  return (
    <div className="shell">
      <a className="skip" href="#main">
        {t('app.skip')}
      </a>
      <header className="topbar">
        <Link to="/" className="brand" aria-label={t('nav.home')}>
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">{t('app.title')}</span>
        </Link>
        <div className="top-actions">
          <button type="button" className="icon-btn" onClick={() => openDialog('stats')} aria-label={t('nav.stats')} title={t('nav.stats')}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
          </button>
          <button type="button" className="icon-btn" onClick={() => openDialog('games')} aria-label={t('nav.games')} title={t('nav.games')}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16M8 4v4M16 10v4M11 16v4" /></svg>
          </button>
          <NavLink to="/about" className="icon-btn" aria-label={t('nav.about')} title={t('nav.about')}>
            <span aria-hidden="true">?</span>
          </NavLink>
          <button
            type="button"
            className="lang-btn"
            lang={lang === 'ar' ? 'en' : 'ar'}
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            aria-label={t('nav.switchLanguageLabel')}
          >
            {t('nav.switchLanguage')}
          </button>
        </div>
      </header>

      <nav className="modebar" aria-label={t('nav.modes')}>
        <ul>
          {modes.map((m) => (
            <li key={m}>
              <NavLink to={`/${m}`} className={({ isActive }) => `modetab${isActive ? ' active' : ''}${done.includes(m) ? ' done' : ''}`}>
                <span aria-hidden="true">{MODES[m].emoji}</span> {t(`modes.${m}.name`)}
                {done.includes(m) && <span className="tick" aria-label={t('home.cleared')}>✓</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="footer">
        <p>{t('app.disclaimer')}</p>
        <p>
          {t('app.dataCredit')} · <Link to="/about">{t('nav.about')}</Link>
        </p>
      </footer>

      <GameSelectDialog />
      <StatsDialog />
    </div>
  );
}
