export default function About() {
  return (
    <div className="max-w-2xl prose-sm">
      <h2 className="font-display text-2xl font-semibold text-forest-950 mb-4">À propos</h2>
      <p className="text-ink/75 leading-relaxed mb-4">
        EnerTech PV Calculator est un outil d'aide au dimensionnement photovoltaïque destiné aux étudiants,
        techniciens, installateurs et professionnels des énergies renouvelables et systèmes énergétiques, en
        particulier en Afrique francophone.
      </p>
      <p className="text-ink/75 leading-relaxed mb-4">
        L'application calcule le bilan énergétique, la puissance PV nécessaire, le nombre de panneaux, la
        configuration série/parallèle du champ, le dimensionnement de la batterie, de l'onduleur et du régulateur
        MPPT, à partir des formules techniques usuelles du domaine. Aucune caractéristique d'équipement réel n'est
        générée automatiquement : les données de panneaux, batteries, onduleurs et régulateurs doivent être saisies
        à partir des fiches techniques des fabricants.
      </p>
      <p className="text-ink/75 leading-relaxed">
        Les résultats produits sont des estimations de dimensionnement. Une validation par un professionnel qualifié
        est recommandée avant toute installation.
      </p>
    </div>
  );
}
