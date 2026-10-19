import { useEffect, useState } from 'react';
import { msUntilMidnight } from '../utils/day';
import { formatCountdown } from '../utils/format';
import { useI18n } from '../i18n/I18nProvider';
import { useAppState } from '../state/AppState';

/** Time left until local midnight; after midnight it offers to load the new day's monsters. */
export function Countdown({ label }: { label: string }) {
  const { t } = useI18n();
  const { dayStale, refreshDay } = useAppState();
  const [ms, setMs] = useState(() => msUntilMidnight());

  useEffect(() => {
    let id = 0;
    const tick = () => {
      setMs(msUntilMidnight());
      id = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    };
    tick();
    return () => window.clearTimeout(id);
  }, []);

  if (dayStale)
    return (
      <div className="countdown countdown-new">
        <span>{t('win.newDay')}</span>
        <button type="button" className="btn btn-primary" onClick={refreshDay}>
          {t('win.loadNewDay')}
        </button>
      </div>
    );

  return (
    <div className="countdown">
      <span className="countdown-label">{label}</span>
      <time className="countdown-time" aria-live="off">
        {formatCountdown(ms, t)}
      </time>
    </div>
  );
}
