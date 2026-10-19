import type { CSSProperties } from 'react';
import type { Monster } from '../data';
import { COLUMNS, compareMonsters, type Cell } from '../games/compare';
import { formatColumn } from '../utils/format';
import { useI18n } from '../i18n/I18nProvider';
import { MonsterBadge } from './MonsterBadge';

interface Props {
  guesses: Monster[];
  answer: Monster;
  /** Id of the row that was just added (its tiles flip in one by one). */
  freshId: string | null;
}

function Arrow({ cell }: { cell: Cell }) {
  const { t } = useI18n();
  if (!cell.direction) return null;
  return (
    <span className={`arrow arrow-${cell.direction}`} role="img" aria-label={t(cell.direction === 'higher' ? 'classic.higherTitle' : 'classic.lowerTitle')}>
      {cell.direction === 'higher' ? '▲' : '▼'}
    </span>
  );
}

/** The Classic comparison grid. Newest guess first; every attribute tile is coloured by its match status. */
export function ClassicBoard({ guesses, answer, freshId }: Props) {
  const { t, lang, num } = useI18n();
  if (!guesses.length) return null;
  const rows = [...guesses].reverse();
  const statusLabel = (c: Cell) => t(`classic.${c.status === 'unknown' ? 'noData' : c.status}`);

  return (
    <div className="board-panel">
    <div className="board-wrap" role="region" aria-label={t('game.wrongGuesses')} tabIndex={0}>
      <table className="board">
        <thead>
          <tr>
            <th scope="col">{t('classic.monster')}</th>
            {COLUMNS.map((c) => (
              <th scope="col" key={c}>
                {t(`classic.${c}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => {
            const cells = compareMonsters(m, answer);
            const fresh = m.id === freshId;
            return (
              <tr key={m.id} className={fresh ? 'fresh' : undefined}>
                <th scope="row" className="tile tile-name">
                  <MonsterBadge monster={m} size={44} />
                  <span>{m.name[lang]}</span>
                </th>
                {COLUMNS.map((c, i) => {
                  const cell = cells[c];
                  return (
                    <td
                      key={c}
                      className={`tile tile-${cell.status}`}
                      style={{ '--i': i } as CSSProperties}
                      title={statusLabel(cell)}
                    >
                      <bdi className="tile-text" dir={c === 'threat' ? 'ltr' : undefined}>
                        {formatColumn(c, m, lang, t, num)}
                      </bdi>
                      <Arrow cell={cell} />
                      <span className="sr-only">{statusLabel(cell)}</span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
      <p className="board-scroll-note">{t('classic.scrollNote')}</p>
    </div>
  );
}

export function ClassicLegend() {
  const { t } = useI18n();
  const items: [string, string][] = [
    ['correct', t('classic.correct')],
    ['partial', t('classic.partial')],
    ['incorrect', t('classic.incorrect')],
    ['unknown', t('classic.noData')],
  ];
  return (
    <section className="legend" aria-labelledby="legend-title">
      <h2 id="legend-title">{t('classic.legendTitle')}</h2>
      <ul>
        {items.map(([k, label]) => (
          <li key={k}>
            <span className={`swatch tile-${k}`} aria-hidden="true" />
            {label}
          </li>
        ))}
        <li>
          <span className="swatch tile-incorrect" aria-hidden="true">
            ▲
          </span>
          {t('classic.higher')}
        </li>
        <li>
          <span className="swatch tile-incorrect" aria-hidden="true">
            ▼
          </span>
          {t('classic.lower')}
        </li>
      </ul>
      <p>{t('classic.partialNote')}</p>
    </section>
  );
}
