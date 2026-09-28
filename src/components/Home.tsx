import { Link } from 'react-router-dom';
import fullLogo from '../assets/logo/enertech-logo-full.jpg';
import { useI18n } from '../i18n';

export default function Home() {
  const { t } = useI18n();
  const fonctionnalites = [
    { num: '01', titre: t('energyBalance'), desc: t('totalNominalPower') },
    { num: '02', titre: t('solar'), desc: t('choosePanel') },
    { num: '03', titre: t('battery'), desc: t('requiredCapacity') },
    { num: '04', titre: t('inverter'), desc: t('recommendedMinimum') },
    { num: '05', titre: t('controller'), desc: t('chooseController', { type: 'MPPT / PWM' }) },
    { num: '06', titre: t('cabling'), desc: t('maxVoltageDrop') },
    { num: '07', titre: t('reportPdf'), desc: t('generatePdf') },
  ];
  return (
    <div>
      <section className="bg-forest-950 text-forest-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl shadow-lg inline-block p-3 sm:p-4 mb-8">
              <img src={fullLogo} alt="EnerTech" className="h-20 sm:h-28 w-auto block" />
            </div>
            <p className="font-mono-num text-xs tracking-widest text-sun mb-3">{t('solar')}</p>
            <h1 className="font-display text-4xl sm:text-6xl font-semibold leading-[1.05] mb-6">
              PV <span className="text-sun">Calculator</span>
            </h1>
            <p className="text-lg sm:text-xl text-forest-100/85 mb-3">
              {t('completeTool')}
            </p>
            <p className="text-forest-200/70 mb-10 max-w-xl leading-relaxed">{t('heroDescription')}</p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/dimensionnement/projet"
                className="inline-flex items-center gap-2 bg-sun hover:bg-sun-dark text-forest-950 font-body font-semibold px-6 py-3 rounded-md shadow-lg shadow-sun/10 transition-all hover:shadow-xl"
              >
                {t('start')}
              </Link>
              <Link
                to="/a-propos"
                className="inline-flex items-center gap-2 border border-forest-200/30 hover:border-forest-200/60 text-forest-100 font-body font-medium px-6 py-3 rounded-md transition-colors"
              >
                {t('learnMore')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <p className="font-mono-num text-xs tracking-widest text-forest-700 mb-2">{t('features')}</p>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-forest-950 mb-10">
          {t('completeTool')}
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {fonctionnalites.map((f) => (
            <div
              key={f.titre}
              className="rounded-lg border border-forest-200 bg-white p-5 hover:border-forest-500 hover:shadow-md transition-all"
            >
              <span className="font-mono-num text-xs text-sun-dark">{f.num}</span>
              <h3 className="font-display font-medium text-forest-950 mt-1 mb-1.5">{f.titre}</h3>
              <p className="text-sm text-ink/65 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 border border-sun-dark/40 bg-sun/10 rounded-lg px-5 py-4 text-sm text-ink/80">{t('disclaimer')}</div>
      </section>
    </div>
  );
}
