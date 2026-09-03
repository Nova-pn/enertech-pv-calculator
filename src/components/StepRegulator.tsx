import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { Field, NumberInput } from './Fields';
import StepHeader from './StepHeader';
import { calculerBilan, calculerPuissancePV, calculerNombrePanneaux, calculerRegulateur } from '../engine/calculations';

const calibres = [40, 50, 60, 80, 100, 120, 150];

export default function StepRegulator() {
  const { state, updateRegulateurParams } = useProject();

  const bilan = calculerBilan(state.appareils);
  const puissancePvW = calculerPuissancePV(bilan.energieJourWh, state.solaire.hsp, state.solaire.rendementGlobal);
  const dimensionnement = calculerNombrePanneaux(puissancePvW, state.panneau);
  const res = calculerRegulateur(
    dimensionnement.puissanceInstalleeW,
    Number(state.info.tensionSysteme),
    state.regulateurParams.margePourcent,
    state.regulateurParams.calibreChoisi
  );

  return (
    <div className="max-w-2xl">
      <StepHeader num="6" titre="Dimensionnement du régulateur MPPT" description="Estimation du courant côté batterie à partir de la puissance PV installée." />

      <Field label="Marge de dimensionnement (%)">
        <div className="max-w-[160px]">
          <NumberInput value={state.regulateurParams.margePourcent} min={0} max={200} onChange={(v) => updateRegulateurParams({ margePourcent: v })} />
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4 my-8">
        <Stat label="Courant théorique" value={`${res.courantTheoriqueA.toFixed(1)} A`} />
        <Stat label="Courant recommandé (marge incluse)" value={`${res.courantAvecMargeA.toFixed(1)} A`} />
      </div>

      <Field label="Calibre du régulateur">
        <div className="flex flex-wrap gap-2">
          {calibres.map((c) => (
            <button
              key={c}
              onClick={() => updateRegulateurParams({ calibreChoisi: c })}
              className={`px-4 py-2 rounded-md text-sm font-mono-num border transition-colors ${
                state.regulateurParams.calibreChoisi === c ? 'bg-forest-900 text-white border-forest-900' : 'border-forest-200 hover:border-forest-500'
              }`}
            >
              {c} A
            </button>
          ))}
        </div>
      </Field>

      <div className={`mt-6 rounded-md px-4 py-3 text-sm border ${res.calibreSuffisant ? 'border-forest-500 bg-forest-100' : 'border-alert/50 bg-alert/10'}`}>
        {res.calibreSuffisant
          ? `Le calibre de ${state.regulateurParams.calibreChoisi} A couvre le courant recommandé.`
          : `Le calibre de ${state.regulateurParams.calibreChoisi} A est insuffisant face au courant recommandé de ${res.courantAvecMargeA.toFixed(1)} A. Choisissez un calibre supérieur.`}
      </div>

      <p className="text-xs text-ink/55 mt-4 max-w-lg leading-relaxed">
        Vérifiez également, sur la fiche technique du régulateur, ses limites de tension d'entrée et de puissance PV
        maximale admissible — cette étape ne contrôle que le courant.
      </p>

      <div className="mt-8 flex justify-end">
        <Link to="/resultats" className="bg-forest-900 hover:bg-forest-700 text-white font-medium px-5 py-2.5 rounded-md transition-colors">
          Voir les résultats du dimensionnement
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-2 border-forest-500 pl-3">
      <p className="text-xs text-ink/55">{label}</p>
      <p className="font-mono-num text-lg font-semibold text-forest-950">{value}</p>
    </div>
  );
}
