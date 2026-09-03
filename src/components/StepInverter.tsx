import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { Field, NumberInput } from './Fields';
import StepHeader from './StepHeader';
import { calculerOnduleur } from '../engine/calculations';

export default function StepInverter() {
  const { state, updateOnduleurParams } = useProject();
  const navigate = useNavigate();
  const res = calculerOnduleur(state.appareils, state.onduleurParams.margePourcent);

  return (
    <div className="max-w-2xl">
      <StepHeader num="5" titre="Dimensionnement de l'onduleur" description="Calculé à partir de la puissance simultanée de tous les appareils saisis à l'étape 2." />

      <Field label="Marge de dimensionnement (%)">
        <div className="max-w-[160px]">
          <NumberInput value={state.onduleurParams.margePourcent} min={0} max={200} onChange={(v) => updateOnduleurParams({ margePourcent: v })} />
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4 my-8">
        <Stat label="Puissance continue estimée" value={`${(res.puissanceContinueW / 1000).toFixed(2)} kW`} />
        <Stat label="Puissance minimale recommandée" value={`${(res.puissanceMinRecommandeeW / 1000).toFixed(2)} kW`} />
      </div>

      {res.aChargesDemarrage && (
        <div className="rounded-md px-4 py-3 text-sm border border-sun-dark/50 bg-sun/10 mb-4">
          <p className="font-medium mb-1">Charges à démarrage important détectées</p>
          <p className="text-xs leading-relaxed">
            Un ou plusieurs appareils (réfrigérateur, congélateur, pompe, moteur, climatiseur…) sont marqués comme
            ayant un courant de démarrage important. Cette application ne calcule pas ce courant d'appel : vérifiez
            la puissance de démarrage réelle dans la fiche technique de chaque appareil avant de valider le choix de
            l'onduleur.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => navigate('/dimensionnement/regulateur')}
          className="bg-forest-900 hover:bg-forest-700 text-white font-medium px-5 py-2.5 rounded-md transition-colors"
        >
          Continuer — Régulateur MPPT
        </button>
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
