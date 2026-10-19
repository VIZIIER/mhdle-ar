import { useMemo } from 'react';
import { loadStats, loadStreak } from '../persistence/progress';
import { clearAll } from '../persistence/storage';
import { useI18n } from '../i18n/I18nProvider';
import { useAppState } from '../state/AppState';
import { Modal } from './Modal';

export function StatsDialog() {
  const { t, num } = useI18n();
  const { dialog, openDialog, modes } = useAppState();
  const open = dialog === 'stats';
  // Re-read storage each time the dialog opens.
  const { streak, stats } = useMemo(() => ({ streak: loadStreak(), stats: loadStats(), open }), [open]);

  return (
    <Modal open={open} title={t('stats.title')} onClose={() => openDialog(null)}>
      <dl className="streaks">
        <div>
          <dt>{t('stats.streak')}</dt>
          <dd>{t('stats.days', { count: streak.count })}</dd>
        </div>
        <div>
          <dt>{t('stats.best')}</dt>
          <dd>{t('stats.days', { count: streak.best })}</dd>
        </div>
      </dl>
      <div className="table-scroll">
        <table className="stats-table">
          <thead>
            <tr>
              <th scope="col">{t('stats.mode')}</th>
              <th scope="col">{t('stats.wins')}</th>
              <th scope="col">{t('stats.average')}</th>
              <th scope="col">{t('stats.fewest')}</th>
              <th scope="col">{t('stats.infiniteWins')}</th>
            </tr>
          </thead>
          <tbody>
            {modes.map((m) => {
              const s = stats[m];
              return (
                <tr key={m}>
                  <th scope="row">{t(`modes.${m}.name`)}</th>
                  <td>{num(s.wins)}</td>
                  <td>{s.wins ? num(s.totalTries / s.wins, { maximumFractionDigits: 1 }) : t('stats.empty')}</td>
                  <td>{s.best ?? t('stats.empty')}</td>
                  <td>{num(s.infiniteWins)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="btn btn-danger"
        onClick={() => {
          if (window.confirm(t('stats.resetConfirm'))) {
            const lang = localStorage.getItem('mhdle:v1:lang');
            clearAll();
            if (lang) localStorage.setItem('mhdle:v1:lang', lang);
            window.location.reload();
          }
        }}
      >
        {t('stats.reset')}
      </button>
    </Modal>
  );
}
