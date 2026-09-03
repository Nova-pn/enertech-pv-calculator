import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useResults } from '../engine/useResults';
import { generateReport } from '../pdf/generateReport';
import type { NiveauValidation } from '../types';

const badgeStyles: Record<NiveauValidation, string> = {
  vert: 'bg-forest-100 text-forest-900 border-forest-500',
  orange: 'bg-sun/15 text-sun-dark border-sun-dark',
  rouge: 'bg-alert/10 text-alert border-alert',
};

const badgeLabel: Record<NiveauValidation, string> = { vert: 'OK', orange: 'À vérifier', rouge: 'Incompatible' };

export default function Results() {
  const { state, reset } = useProject();
  const results = useResults(state);
  const navigate = useNavigate();

  const handleReset = () => {
    reset();
    navigate('/dimensionnement/projet');
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="font-mono-num text-xs text-forest-700 mb-1">RÉSULTATS</p>
          <h2 className="font-display text-2xl font-semibold text-forest-950">
            {state.info.nomProjet || 'Dimensionnement'}
          </h2>
          <p className="text-sm text-ink/60 mt-1">
            {state.info.localisation || 'Localisation non renseignée'} — {state.info.typeInstallation} — {state.info.tensionSysteme} V
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => generateReport(state, results)}
            className="bg-forest-900 hover:bg-forest-700 text-white text-sm font-medium px-4 py-2.5 rounded-md transition-colors"
          >
            Télécharger le rapport PDF
          </button>
          <button
            onClick={handleReset}
            className="border border-forest-200 hover:border-forest-500 text-sm font-medium px-4 py-2.5 rounded-md transition-colors"
          >
            Recommencer
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-8">
        <Card titre="Bilan énergétique">
          <BigStat value={`${(results.bilan.energieJourWh / 1000).toFixed(2)}`} unit="kWh/jour" />
          <p className="text-xs text-ink/55 mt-2">{(results.bilan.energieMoisWh / 1000).toFixed(1)} kWh/mois · {(results.bilan.energieAnneeWh / 1000).toFixed(0)} kWh/an</p>
        </Card>

        <Card titre="Champ photovoltaïque">
          <BigStat value={(results.dimensionnementPanneaux.puissanceInstalleeW / 1000).toFixed(2)} unit="kWc installés" />
          <p className="text-xs text-ink/55 mt-2">
            {results.dimensionnementPanneaux.nombrePanneaux} × {state.panneau.puissanceW} W (besoin : {results.puissancePvW.toFixed(0)} W)
          </p>
        </Card>

        <Card titre="Batterie">
          <BigStat value={results.besoinBatterie.capaciteAh.toFixed(0)} unit="Ah nécessaires" />
          <p className="text-xs text-ink/55 mt-2">
            {state.batterie.technologie} — {results.configBatterie.enSerie}S × {results.configBatterie.enParallele}P
          </p>
        </Card>

        <Card titre="Onduleur">
          <BigStat value={(results.onduleur.puissanceMinRecommandeeW / 1000).toFixed(2)} unit="kW minimum" />
          <p className="text-xs text-ink/55 mt-2">
            {results.onduleur.aChargesDemarrage ? 'Charges à démarrage important à vérifier' : 'Aucune charge à démarrage signalée'}
          </p>
        </Card>

        <Card titre="Régulateur MPPT">
          <BigStat value={results.regulateur.courantAvecMargeA.toFixed(1)} unit="A recommandés" />
          <p className="text-xs text-ink/55 mt-2">Calibre choisi : {state.regulateurParams.calibreChoisi} A</p>
        </Card>

        <Card titre="Configuration PV">
          <BigStat value={results.configPV.enSerie.toString()} unit="panneaux en série" />
          <p className="text-xs text-ink/55 mt-2">{results.configPV.enParallele} branche(s) en parallèle — {results.configPV.totalPanneaux} panneaux au total</p>
        </Card>
      </div>

      <h3 className="font-display font-medium text-forest-950 mb-3">Indicateurs de validation</h3>
      <div className="space-y-2">
        {results.avertissements.map((av, i) => (
          <div key={i} className={`border-l-4 rounded-md px-4 py-3 text-sm ${badgeStyles[av.niveau]}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono-num uppercase tracking-wide px-1.5 py-0.5 rounded border border-current">
                {badgeLabel[av.niveau]}
              </span>
              <span className="font-medium">{av.titre}</span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">{av.explication}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 border border-sun-dark/40 bg-sun/10 rounded-md px-4 py-3 text-sm text-ink/80">
        Les résultats fournis sont des estimations de dimensionnement et doivent être vérifiés par un professionnel
        qualifié avant toute installation.
      </div>
    </div>
  );
}

function Card({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div className="border border-forest-200 rounded-lg p-5 bg-white">
      <p className="text-xs text-ink/55 mb-2">{titre}</p>
      {children}
    </div>
  );
}

function BigStat({ value, unit }: { value: string; unit: string }) {
  return (
    <p className="font-mono-num text-2xl font-semibold text-forest-950">
      {value} <span className="text-sm font-body font-normal text-ink/60">{unit}</span>
    </p>
  );
}
