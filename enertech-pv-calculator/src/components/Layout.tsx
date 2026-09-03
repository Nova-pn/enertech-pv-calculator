import { NavLink, Outlet } from 'react-router-dom';

const steps = [
  { to: '/dimensionnement/projet', label: 'Projet', num: '1' },
  { to: '/dimensionnement/consommation', label: 'Consommation', num: '2' },
  { to: '/dimensionnement/solaire', label: 'Champ PV', num: '3' },
  { to: '/dimensionnement/batterie', label: 'Batterie', num: '4' },
  { to: '/dimensionnement/onduleur', label: 'Onduleur', num: '5' },
  { to: '/dimensionnement/regulateur', label: 'Régulateur', num: '6' },
  { to: '/resultats', label: 'Résultats', num: '7' },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-forest-950 text-forest-100 border-b border-forest-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sun" aria-hidden />
            <span className="font-display font-semibold text-lg tracking-tight">EnerTech</span>
            <span className="hidden sm:inline text-sm text-forest-200/80 font-body">PV Calculator</span>
          </NavLink>
          <nav className="flex gap-4 text-sm font-body">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'text-sun' : 'text-forest-200 hover:text-white')}>
              Accueil
            </NavLink>
            <NavLink
              to="/dimensionnement/projet"
              className={({ isActive }) => (isActive ? 'text-sun' : 'text-forest-200 hover:text-white')}
            >
              Dimensionnement
            </NavLink>
            <NavLink to="/resultats" className={({ isActive }) => (isActive ? 'text-sun' : 'text-forest-200 hover:text-white')}>
              Résultats
            </NavLink>
            <NavLink to="/a-propos" className={({ isActive }) => (isActive ? 'text-sun' : 'text-forest-200 hover:text-white')}>
              À propos
            </NavLink>
          </nav>
        </div>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-10">
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

      <footer className="border-t border-forest-200 py-6 text-center text-xs text-ink/50 font-body">
        EnerTech PV Calculator — outil d'aide au dimensionnement. Toute installation doit être validée par un professionnel qualifié.
      </footer>
    </div>
  );
}
