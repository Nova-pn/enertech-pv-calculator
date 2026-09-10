import { NavLink, Outlet, useLocation } from 'react-router-dom';
import LogoMark from './LogoMark';

const steps = [
  { to: '/dimensionnement/projet', label: 'Projet', num: '1' },
  { to: '/dimensionnement/consommation', label: 'Consommation', num: '2' },
  { to: '/dimensionnement/solaire', label: 'Champ PV', num: '3' },
  { to: '/dimensionnement/batterie', label: 'Batterie', num: '4' },
  { to: '/dimensionnement/onduleur', label: 'Onduleur', num: '5' },
  { to: '/dimensionnement/regulateur', label: 'Contrôleur', num: '6' },
  { to: '/dimensionnement/cablage', label: 'Câblage & protection', num: '7' },
  { to: '/resultats', label: 'Résultats', num: '8' },
];

export default function Layout() {
  const location = useLocation();
  const dansLeWizard = location.pathname.startsWith('/dimensionnement') || location.pathname === '/resultats';

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
          <nav className="flex gap-5 text-sm font-body">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'text-sun font-medium' : 'text-forest-200 hover:text-white transition-colors')}>
              Accueil
            </NavLink>
            <NavLink
              to="/dimensionnement/projet"
              className={() => (dansLeWizard ? 'text-sun font-medium' : 'text-forest-200 hover:text-white transition-colors')}
            >
              Dimensionnement
            </NavLink>
            <NavLink to="/a-propos" className={({ isActive }) => (isActive ? 'text-sun font-medium' : 'text-forest-200 hover:text-white transition-colors')}>
              À propos
            </NavLink>
          </nav>
        </div>
      </header>

      {dansLeWizard ? (
        <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 grid grid-cols-1 md:grid-cols-[210px_1fr] gap-6 md:gap-10">
          <aside className="md:sticky md:top-8 md:self-start">
            <ol className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              {steps.map((s) => (
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
        EnerTech PV Calculator — outil d'aide au dimensionnement. Toute installation doit être validée par un professionnel qualifié.
      </footer>
    </div>
  );
}
