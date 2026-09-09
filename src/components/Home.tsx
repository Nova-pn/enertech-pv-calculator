import { Link } from 'react-router-dom';

const fonctionnalites = [
  { titre: 'Bilan énergétique', desc: "Listez vos appareils et obtenez la consommation quotidienne, mensuelle et annuelle." },
  { titre: 'Champ photovoltaïque', desc: 'Choisissez un panneau réel dans le catalogue ou saisissez vos propres caractéristiques.' },
  { titre: 'Batterie', desc: "Capacité en Ah et configuration série/parallèle, avec un catalogue de batteries réelles." },
  { titre: 'Onduleur', desc: 'Puissance minimale recommandée, avec un catalogue de modèles réels à comparer.' },
  { titre: 'Régulateur MPPT ou PWM', desc: "Vous choisissez le type et le modèle ; le calcul et la vérification s'adaptent en conséquence." },
  { titre: 'Câblage et protection DC', desc: 'Chute de tension du câble PV et calibre de protection, à partir de catalogues réels.' },
  { titre: 'Rapport PDF', desc: 'Un document complet et professionnel à remettre au client ou archiver.' },
];

export default function Home() {
  return (
    <div className="max-w-3xl">
      <p className="font-mono-num text-xs tracking-wide text-forest-700 mb-3">DIMENSIONNEMENT PHOTOVOLTAÏQUE</p>
      <h1 className="font-display text-4xl sm:text-5xl font-semibold text-forest-950 leading-[1.05] mb-5">
        EnerTech PV Calculator
      </h1>
      <p className="text-lg text-ink/80 mb-2">Calculateur intelligent de dimensionnement photovoltaïque.</p>
      <p className="text-ink/70 mb-8 max-w-xl">
        Dimensionnez votre installation photovoltaïque à partir de votre consommation électrique : panneaux,
        batteries, onduleur et régulateur, calculés automatiquement à chaque modification.
      </p>

      <Link
        to="/dimensionnement/projet"
        className="inline-flex items-center gap-2 bg-forest-900 hover:bg-forest-700 text-white font-body font-medium px-6 py-3 rounded-md transition-colors"
      >
        Commencer le dimensionnement
      </Link>

      <div className="mt-14 grid sm:grid-cols-2 gap-x-8 gap-y-6">
        {fonctionnalites.map((f) => (
          <div key={f.titre} className="border-l-2 border-forest-200 pl-4">
            <h3 className="font-display font-medium text-forest-950">{f.titre}</h3>
            <p className="text-sm text-ink/65 mt-1 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 border border-sun-dark/40 bg-sun/10 rounded-md px-4 py-3 text-sm text-ink/80">
        Les résultats fournis sont des estimations de dimensionnement et doivent être vérifiés par un professionnel
        qualifié avant toute installation.
      </div>
    </div>
  );
}
