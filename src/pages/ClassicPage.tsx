import { useState } from 'react';
import { ClassicBoard, ClassicLegend } from '../components/ClassicBoard';
import { ModeShell } from '../components/ModeShell';
import { allCorrect, compareMonsters } from '../games/compare';
import { useRound } from '../hooks/useRound';
import { useI18n } from '../i18n/I18nProvider';

export function ClassicPage() {
  const api = useRound('classic');
  const { t } = useI18n();
  const [freshId, setFreshId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <ModeShell
      mode="classic"
      api={api}
      onGuess={(m) => {
        setFreshId(m.id);
        // Two monsters can share every listed characteristic; tell the player it is not this one.
        if (api.answer && m.id !== api.answer.id && allCorrect(compareMonsters(m, api.answer))) setNotice(t('game.sameStats'));
        else setNotice(null);
      }}
      board={
        <>
          {notice && (
            <p className="notice" role="alert">
              {notice}
            </p>
          )}
          {api.answer && <ClassicBoard guesses={api.guesses} answer={api.answer} freshId={freshId} />}
        </>
      }
      aside={<ClassicLegend />}
    />
  );
}
