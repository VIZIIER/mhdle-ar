import type { Monster } from '../data';
import { useI18n } from '../i18n/I18nProvider';
import { MonsterBadge } from './MonsterBadge';

/** List of guesses for Compendium, Surveyor and Roar (newest first), marked right or wrong. */
export function GuessList({ guesses, answerId }: { guesses: Monster[]; answerId: string }) {
  const { t, lang } = useI18n();
  if (!guesses.length) return null;
  return (
    <section className="guesses" aria-labelledby="guesses-title">
      <h2 id="guesses-title" className="sr-only">
        {t('game.wrongGuesses')}
      </h2>
      <ol reversed>
        {[...guesses].reverse().map((m) => {
          const ok = m.id === answerId;
          return (
            <li key={m.id} className={ok ? 'guess guess-ok' : 'guess guess-no'}>
              <MonsterBadge monster={m} size={36} />
              <span className="guess-name">{m.name[lang]}</span>
              <span className="guess-mark" aria-label={t(ok ? 'classic.correct' : 'classic.incorrect')}>
                {ok ? '✓' : '✕'}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
