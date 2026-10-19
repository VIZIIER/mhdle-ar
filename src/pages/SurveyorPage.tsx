import { ModeShell } from '../components/ModeShell';
import { mediaUrl } from '../data';
import { useRound } from '../hooks/useRound';
import { useI18n } from '../i18n/I18nProvider';

// Same progression as the original: a black, 15px-blurred silhouette that loses 1px of blur
// and gains 5% brightness per wrong guess (sharp after 15 misses, full brightness after 20).
const MAX_BLUR = 15;
const BLUR_STEP = 1;
const BRIGHTNESS_STEP = 0.05;

export function surveyorFilter(wrong: number): string {
  const blur = Math.max(0, MAX_BLUR - BLUR_STEP * wrong);
  const brightness = Math.min(1, BRIGHTNESS_STEP * wrong);
  return `blur(${blur}px) brightness(${brightness})`;
}

export function SurveyorPage() {
  const api = useRound('surveyor');
  const { t } = useI18n();
  const src = api.answer ? mediaUrl('images', api.answer.id) : null;
  const clue = src && (
    <figure className="survey">
      <div className="survey-frame">
        <img
          className="survey-img"
          src={src}
          alt={t('surveyor.imageAlt')}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          style={{ filter: surveyorFilter(api.wrongCount) }}
        />
      </div>
      <figcaption>{t('surveyor.clearer')}</figcaption>
    </figure>
  );
  return <ModeShell mode="surveyor" api={api} clue={clue} />;
}
