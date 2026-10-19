import { ModeShell } from '../components/ModeShell';
import { maskDescription } from '../games/mask';
import { useRound } from '../hooks/useRound';
import { useI18n } from '../i18n/I18nProvider';

export function CompendiumPage() {
  const api = useRound('compendium');
  const { lang } = useI18n();
  const clue = api.answer && (
    <figure className="entry">
      <blockquote className="entry-text">{maskDescription(api.answer.description[lang], api.answer)}</blockquote>
    </figure>
  );
  return <ModeShell mode="compendium" api={api} clue={clue} />;
}
