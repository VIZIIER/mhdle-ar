import { useEffect, useMemo, useState } from 'react';
import { GAMES, MONSTERS } from '../data';
import { useI18n } from '../i18n/I18nProvider';
import { useAppState } from '../state/AppState';
import { Modal } from './Modal';

/** "Hunter, prepare your quests!" – choose which games' monsters appear. Grouped by generation. */
export function GameSelectDialog() {
  const { t, lang } = useI18n();
  const { settings, setGames, dialog, openDialog } = useAppState();
  const open = dialog === 'games';
  const [picked, setPicked] = useState<string[]>(settings.games);

  useEffect(() => {
    if (open) setPicked(settings.games);
  }, [open, settings.games]);

  const byGen = useMemo(() => {
    const m = new Map<number, typeof GAMES>();
    GAMES.forEach((g) => m.set(g.gen, [...(m.get(g.gen) ?? []), g]));
    return [...m.entries()];
  }, []);

  const count = useMemo(() => MONSTERS.filter((mo) => mo.games.some((g) => picked.includes(g))).length, [picked]);
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const toggleGen = (ids: string[], on: boolean) => setPicked((p) => (on ? [...new Set([...p, ...ids])] : p.filter((x) => !ids.includes(x))));
  const locked = !settings.configured;

  return (
    <Modal
      open={open}
      locked={locked}
      title={t('settings.title')}
      onClose={() => openDialog(null)}
      footer={
        <>
          <span className="dialog-count" aria-live="polite">
            {picked.length ? t('settings.monsters', { count }) : t('settings.needOne')}
          </span>
          {!locked && (
            <button type="button" className="btn" onClick={() => openDialog(null)}>
              {t('settings.cancel')}
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            disabled={!picked.length}
            onClick={() => {
              setGames(GAMES.map((g) => g.id).filter((id) => picked.includes(id)));
              openDialog(null);
            }}
          >
            {t('settings.save')}
          </button>
        </>
      }
    >
      <p>{t('settings.text')}</p>
      {settings.configured && <p className="note">{t('settings.changeNote')}</p>}
      <div className="gens">
        <label className="check check-all">
          <input
            type="checkbox"
            checked={picked.length === GAMES.length}
            ref={(el) => {
              if (el) el.indeterminate = picked.length > 0 && picked.length < GAMES.length;
            }}
            onChange={(e) => setPicked(e.target.checked ? GAMES.map((g) => g.id) : [])}
          />
          {t('settings.selectAll')}
        </label>
        {byGen.map(([gen, games]) => {
          const ids = games.map((g) => g.id);
          const on = ids.filter((id) => picked.includes(id)).length;
          return (
            <fieldset key={gen} className="gen">
              <legend>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={on === ids.length}
                    ref={(el) => {
                      if (el) el.indeterminate = on > 0 && on < ids.length;
                    }}
                    onChange={(e) => toggleGen(ids, e.target.checked)}
                  />
                  {t('settings.generation', { n: gen })}
                </label>
              </legend>
              {games.map((g) => (
                <label key={g.id} className="check">
                  <input type="checkbox" checked={picked.includes(g.id)} onChange={() => toggle(g.id)} />
                  <bdi>{g[lang]}</bdi>
                </label>
              ))}
            </fieldset>
          );
        })}
      </div>
    </Modal>
  );
}
