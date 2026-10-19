import { useId, useMemo, useRef, useState } from 'react';
import type { Monster } from '../data';
import { searchMonsters } from '../games/search';
import { useI18n } from '../i18n/I18nProvider';
import { MonsterBadge } from './MonsterBadge';

interface Props {
  pool: Monster[];
  exclude: ReadonlySet<string>;
  onPick: (m: Monster) => void;
  disabled?: boolean;
}

/** Combobox search over monster names in both languages, with full keyboard support (ARIA 1.2 pattern). */
export function SearchBox({ pool, exclude, onPick, disabled }: Props) {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimer = useRef<number | undefined>(undefined);
  const listId = useId();
  const helpId = useId();

  const results = useMemo(() => searchMonsters(pool, query, lang, exclude), [pool, query, lang, exclude]);
  const other = lang === 'ar' ? 'en' : 'ar';

  const pick = (m: Monster | undefined) => {
    if (!m) return;
    onPick(m);
    setQuery('');
    setActive(0);
    setOpen(false);
    inputRef.current?.focus();
  };

  const showList = open && query.trim().length > 0;

  return (
    <div className="search">
      <label className="sr-only" htmlFor={`${listId}-input`}>
        {t('game.searchLabel')}
      </label>
      <input
        ref={inputRef}
        id={`${listId}-input`}
        className="search-input"
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-describedby={helpId}
        aria-activedescendant={showList && results[active] ? `${listId}-${results[active].id}` : undefined}
        placeholder={t('game.searchPlaceholder')}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        disabled={disabled}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => {
          // Cancel a pending close from an earlier blur, or the list would vanish right after refocusing.
          window.clearTimeout(blurTimer.current);
          setOpen(true);
        }}
        onBlur={() => {
          blurTimer.current = window.setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            setActive((a) => Math.min(a + 1, results.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            pick(results[active]);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
      />
      <p id={helpId} className="sr-only">
        {t('game.searchHelp')}
      </p>
      {showList && (
        <ul className="search-list" id={listId} role="listbox" aria-label={t('game.searchLabel')}>
          {results.length === 0 && (
            <li className="search-empty" role="option" aria-disabled="true" aria-selected="false">
              {t('game.noResults', { query: query.trim() })}
            </li>
          )}
          {results.map((m, i) => (
            <li
              key={m.id}
              id={`${listId}-${m.id}`}
              data-id={m.id}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'search-item active' : 'search-item'}
              onMouseDown={(e) => e.preventDefault()}
              onMouseMove={() => i !== active && setActive(i)}
              onClick={() => pick(m)}
            >
              <MonsterBadge monster={m} size={34} />
              <span className="search-names">
                <span className="search-name">{m.name[lang]}</span>
                <bdi className="search-alt" lang={other}>
                  {m.name[other]}
                </bdi>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
