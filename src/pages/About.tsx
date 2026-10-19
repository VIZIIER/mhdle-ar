import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';

const SECTIONS = ['classic', 'compendium', 'surveyor', 'roar', 'extra', 'data', 'privacy'] as const;

export function About() {
  const { t } = useI18n();
  return (
    <article className="prose">
      <h1>{t('about.title')}</h1>
      <p>{t('about.intro')}</p>
      {SECTIONS.map((s) => (
        <section key={s}>
          <h2>{t(`about.${s}Title`)}</h2>
          <p>{t(`about.${s}Text`)}</p>
        </section>
      ))}
      <p className="note">{t('app.disclaimer')}</p>
      <p className="back-link">
        <Link to="/">{t('nav.back')}</Link>
      </p>
    </article>
  );
}

export function NotFound() {
  const { t } = useI18n();
  return (
    <article className="prose">
      <h1>{t('notFound.title')}</h1>
      <p>
        <Link to="/">{t('notFound.link')}</Link>
      </p>
    </article>
  );
}

export function Unavailable() {
  const { t } = useI18n();
  return (
    <article className="prose">
      <h1>{t('unavailable.title')}</h1>
      <p>{t('unavailable.text')}</p>
      <p className="back-link">
        <Link to="/">{t('nav.back')}</Link>
      </p>
    </article>
  );
}
