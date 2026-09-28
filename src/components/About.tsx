import { useI18n } from '../i18n';

export default function About() {
  const { t } = useI18n();
  return (
    <div className="max-w-2xl prose-sm">
      <h2 className="font-display text-2xl font-semibold text-forest-950 mb-4">{t('about')}</h2>
      <p className="text-ink/75 leading-relaxed mb-4">
        {t('aboutText1')}
      </p>
      <p className="text-ink/75 leading-relaxed mb-4">
        L'application calcule le bilan énergétique, la puissance PV nécessaire, le nombre de panneaux, la
        configuration série/parallèle du champ, le dimensionnement de la batterie, de l'onduleur, du contrôleur
        (MPPT ou PWM) et du câblage/protection DC, à partir des formules techniques usuelles du domaine. Un
        catalogue de panneaux, batteries, onduleurs, contrôleurs, câbles et protections DC réels — sourcés depuis
        les fiches techniques des fabricants — permet de sélectionner un modèle plutôt que de saisir chaque
        caractéristique à la main. Aucune caractéristique d'équipement n'est générée automatiquement : seules les
        valeurs présentes dans le catalogue ou saisies manuellement sont utilisées.
      </p>
      <p className="text-ink/75 leading-relaxed">
        Les résultats produits sont des estimations de dimensionnement. Une validation par un professionnel qualifié
        est recommandée avant toute installation.
      </p>
    </div>
  );
}
