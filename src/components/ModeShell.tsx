import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Monster } from '../data';
import { MODES, type ModeId } from '../games/modes';
import { decodeSelection, selectionSignature } from '../persistence/settings';
import { parseChallenge } from '../games/share';
import type { RoundApi } from '../hooks/useRound';
import { useI18n } from '../i18n/I18nProvider';
import { useAppState } from '../state/AppState';
import { GuessList } from './GuessList';
import { Hints } from './Hints';
import { Modal } from './Modal';
import { SearchBox } from './SearchBox';
import { WinPanel } from './WinPanel';

interface Props {
  mode: ModeId;
  api: RoundApi;
  /** The clue for this mode (description, picture, audio player). Not used by Classic. */
  clue?: ReactNode;
  /** Custom guess display (Classic's comparison grid). Defaults to a simple list. */
  board?: ReactNode;
  /** Shown under the board (Classic legend). */
  aside?: ReactNode;
  onGuess?: (m: Monster) => void;
}

/** Shared page frame for every mode: heading, challenge banner, clue, hints, search, guesses and the win panel. */
export function ModeShell({ mode, api, clue, board, aside, onGuess }: Props) {
  const { t } = useI18n();
  const { settings, setGames, day, openDialog } = useAppState();
  const [params, setParams] = useSearchParams();

  // Share links: ?s=<game selection>&c=<friend's tries>-<date>
  const linkGames = useMemo(() => decodeSelection(params.get('s')), [params]);
  const [askAdopt, setAskAdopt] = useState(false);
  useEffect(() => {
    if (linkGames && selectionSignature(linkGames) !== selectionSignature(settings.games)) setAskAdopt(true);
  }, [linkGames, settings.games]);
  const challenge = parseChallenge(params.get('c'), day);

  const closeAdopt = (adopt: boolean) => {
    if (adopt && linkGames) setGames(linkGames);
    setAskAdopt(false);
    const next = new URLSearchParams(params);
    next.delete('s');
    setParams(next, { replace: true });
  };

  const exclude = useMemo(() => new Set(api.round?.guesses ?? []), [api.round]);
  const won = Boolean(api.round?.won);

  const handlePick = (m: Monster) => {
    if (api.guess(m.id)) onGuess?.(m);
  };

  return (
    <article className={`mode mode-${mode}`}>
      <header className="mode-head">
        <h1>
          <span className="mode-emoji" aria-hidden="true">
            {MODES[mode].emoji}
          </span>{' '}
          {t(`modes.${mode}.name`)}
        </h1>
        {api.isInfinite && <span className="pill">{t('win.infiniteBadge')}</span>}
        <p className="mode-question">{t(`modes.${mode}.question`)}</p>
        {!won && <p className="mode-intro">{t(`modes.${mode}.intro`)}</p>}
      </header>

      {challenge && !won && !api.isInfinite && <p className="challenge">{t('challenge.banner', { count: challenge })}</p>}

      {!api.answer ? (
        <div className="empty">
          <p>{t('game.poolEmpty')}</p>
          <button type="button" className="btn btn-primary" onClick={() => openDialog('games')}>
            {t('game.chooseGames')}
          </button>
        </div>
      ) : (
        <>
          {!won && clue}
          {!won && MODES[mode].hintThresholds.length > 0 && <Hints api={api} thresholds={MODES[mode].hintThresholds} />}
          {!won && <SearchBox pool={api.searchPool} exclude={exclude} onPick={handlePick} />}
          {won && <WinPanel mode={mode} api={api} answer={api.answer} challenge={challenge} />}
          {board ?? <GuessList guesses={api.guesses} answerId={api.answer.id} />}
          {aside}
        </>
      )}

      <p className="back-link">
        <Link to="/">{t('nav.back')}</Link>
      </p>

      <Modal
        open={askAdopt}
        title={t('challenge.adoptTitle')}
        onClose={() => closeAdopt(false)}
        footer={
          <>
            <button type="button" className="btn" onClick={() => closeAdopt(false)}>
              {t('challenge.adoptNo')}
            </button>
            <button type="button" className="btn btn-primary" onClick={() => closeAdopt(true)}>
              {t('challenge.adoptYes')}
            </button>
          </>
        }
      >
        <p>{t('challenge.adoptText')}</p>
      </Modal>
    </article>
  );
}
