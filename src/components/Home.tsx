import { Link } from 'react-router-dom';
import fullLogo from '../assets/logo/enertech-logo-full.jpg';

const fonctionnalites = [
  { num: '01', titre: 'Bilan énergétique', desc: "Listez vos appareils et obtenez la consommation quotidienne, mensuelle et annuelle, avec puissance nominale et puissance de démarrage." },
  { num: '02', titre: 'Champ photovoltaïque', desc: 'Choisissez un panneau réel dans le catalogue ou saisissez vos propres caractéristiques.' },
  { num: '03', titre: 'Batterie', desc: "Capacité en Ah et configuration série/parallèle, filtrable par technologie (AGM, GEL, Lithium…)." },
  { num: '04', titre: 'Onduleur', desc: 'Puissance nominale et puissance de démarrage prises en compte séparément, catalogue de modèles réels.' },
  { num: '05', titre: 'Contrôleur MPPT ou PWM', desc: "Vous choisissez le type et le modèle ; le calcul et la vérification s'adaptent en conséquence." },
  { num: '06', titre: 'Câblage et protection DC', desc: 'Section de câble théorique, chute de tension et calibre de protection, à partir de catalogues réels.' },
  { num: '07', titre: 'Rapport PDF', desc: 'Un document complet et professionnel à remettre au client ou archiver.' },
];

export default function Home() {
  return (
    <div>
      <section className="bg-forest-950 text-forest-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl shadow-lg inline-block p-3 sm:p-4 mb-8">
              <img src={fullLogo} alt="EnerTech" className="h-20 sm:h-28 w-auto block" />
            </div>
            <p className="font-mono-num text-xs tracking-widest text-sun mb-3">DIMENSIONNEMENT PHOTOVOLTAÏQUE</p>
            <h1 className="font-display text-4xl sm:text-6xl font-semibold leading-[1.05] mb-6">
              PV <span className="text-sun">Calculator</span>
            </h1>
            <p className="text-lg sm:text-xl text-forest-100/85 mb-3">
              Calculateur professionnel de dimensionnement photovoltaïque.
            </p>
            <p className="text-forest-200/70 mb-10 max-w-xl leading-relaxed">
              Dimensionnez votre installation à partir de votre consommation électrique : champ PV, batterie,
              onduleur et contrôleur, calculés automatiquement à chaque modification, à partir de catalogues
              d'équipements réels.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/dimensionnement/projet"
                className="inline-flex items-center gap-2 bg-sun hover:bg-sun-dark text-forest-950 font-body font-semibold px-6 py-3 rounded-md shadow-lg shadow-sun/10 transition-all hover:shadow-xl"
              >
                Commencer le dimensionnement
              </Link>
              <Link
                to="/a-propos"
                className="inline-flex items-center gap-2 border border-forest-200/30 hover:border-forest-200/60 text-forest-100 font-body font-medium px-6 py-3 rounded-md transition-colors"
              >
                En savoir plus
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <p className="font-mono-num text-xs tracking-widest text-forest-700 mb-2">FONCTIONNALITÉS</p>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-forest-950 mb-10">
          Un outil de dimensionnement complet
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

        <div className="mt-12 border border-sun-dark/40 bg-sun/10 rounded-lg px-5 py-4 text-sm text-ink/80">
          Les résultats fournis sont des estimations de dimensionnement et doivent être vérifiés par un professionnel
          qualifié avant toute installation.
        </div>
      </section>
    </div>
  );
}
