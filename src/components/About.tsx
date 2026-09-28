import { useI18n } from '../i18n';

export default function About() {
  const { t } = useI18n();
  return (
    <div className="max-w-2xl prose-sm">
      <h2 className="font-display text-2xl font-semibold text-forest-950 mb-4">{t('about')}</h2>
      <p className="text-ink/75 leading-relaxed mb-4">
        {t('aboutText1')}
      </p>
      <p className="text-ink/75 leading-relaxed mb-4">{t('aboutText2')}</p>
      <p className="text-ink/75 leading-relaxed">{t('aboutText3')}</p>
    </div>
  );
}
