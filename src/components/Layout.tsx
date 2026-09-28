import { NavLink, Outlet, useLocation } from 'react-router-dom';
import LogoMark from './LogoMark';
import { languages, useI18n } from '../i18n';

export default function Layout() {
  const location = useLocation();
  const { language, setLanguage, t } = useI18n();
  const dansLeWizard = location.pathname.startsWith('/dimensionnement') || location.pathname === '/resultats';

  const translatedSteps = [
    { to: '/dimensionnement/projet', label: t('project'), num: '1' },
    { to: '/dimensionnement/consommation', label: t('consumption'), num: '2' },
    { to: '/dimensionnement/solaire', label: t('solar'), num: '3' },
    { to: '/dimensionnement/batterie', label: t('battery'), num: '4' },
    { to: '/dimensionnement/onduleur', label: t('inverter'), num: '5' },
    { to: '/dimensionnement/regulateur', label: t('controller'), num: '6' },
    { to: '/dimensionnement/cablage', label: t('cabling'), num: '7' },
    { to: '/resultats', label: t('results'), num: '8' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-forest-950 text-forest-100 border-b border-forest-700/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5">
            <LogoMark size={26} onDark />
            <span className="flex flex-col leading-none">
              <span className="font-display font-semibold text-lg tracking-tight">EnerTech</span>
              <span className="hidden sm:inline text-[11px] text-forest-200/70 font-body tracking-wide">PV CALCULATOR</span>
            </span>
          </NavLink>
          <nav className="flex flex-wrap items-center justify-end gap-3 sm:gap-5 text-sm font-body">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'text-sun font-medium' : 'text-forest-200 hover:text-white transition-colors')}>
              {t('home')}
            </NavLink>
            <NavLink
              to="/dimensionnement/projet"
              className={() => (dansLeWizard ? 'text-sun font-medium' : 'text-forest-200 hover:text-white transition-colors')}
            >
              {t('sizing')}
            </NavLink>
            <NavLink to="/a-propos" className={({ isActive }) => (isActive ? 'text-sun font-medium' : 'text-forest-200 hover:text-white transition-colors')}>
              {t('about')}
            </NavLink>
            <label className="inline-flex items-center gap-1.5 text-forest-100/80" title={t('language')}>
              <span aria-hidden="true">{languages.find((item) => item.value === language)?.flag}</span>
              <select aria-label={t('language')} value={language} onChange={(event) => setLanguage(event.target.value as typeof language)} className="bg-forest-900 border border-forest-700 rounded px-1.5 py-1 text-xs text-white">
                {languages.map((item) => <option key={item.value} value={item.value}>{item.flag} {item.label}</option>)}
              </select>
            </label>
          </nav>
        </div>
      </header>

      {dansLeWizard ? (
        <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 grid grid-cols-1 md:grid-cols-[210px_1fr] gap-6 md:gap-10">
          <aside className="md:sticky md:top-8 md:self-start">
            <ol className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              {translatedSteps.map((s) => (
                <li key={s.to} className="shrink-0">
                  <NavLink
                    to={s.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-body whitespace-nowrap border-l-2 md:border-l-4 transition-colors ${
                        isActive
                          ? 'border-sun bg-forest-100 text-forest-950 font-medium'
                          : 'border-transparent text-ink/70 hover:bg-forest-100/60'
                      }`
                    }
                  >
                    <span className="font-mono-num text-xs text-forest-700">{s.num}</span>
                    {s.label}
                  </NavLink>
                </li>
              ))}
            </ol>
          </aside>

          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      ) : (
        <main className="flex-1 w-full">
          <Outlet />
        </main>
      )}

      <footer className="border-t border-forest-200 py-6 text-center text-xs text-ink/50 font-body">
        {t('footer')}
      </footer>
    </div>
  );
}
