import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { Field, NumberInput, Spec } from './Fields';
import StepHeader from './StepHeader';
import EquipmentPicker from './EquipmentPicker';
import { inverterCatalog, type InverterCatalogItem } from '../data/catalog';
import { calculerOnduleur } from '../engine/calculations';

export default function StepInverter() {
  const { state, updateOnduleurParams, setOnduleurChoisi } = useProject();
  const navigate = useNavigate();
  const res = calculerOnduleur(state.appareils, state.onduleurParams.margePourcent);

  const hybride = state.info.architectureSysteme === 'Hybride';
  const titreEquipement = hybride ? 'convertisseur hybride' : 'onduleur';
  const catalogueFiltre = hybride
    ? inverterCatalog.filter((o) => o.type.toLowerCase().includes('hybrid'))
    : inverterCatalog;

  const choisi = state.onduleurChoisi;
  const puissanceSuffisante = choisi ? choisi.nominalPowerW >= res.puissanceMinRecommandeeW : null;

  const choisirOnduleur = (o: InverterCatalogItem) => setOnduleurChoisi(o);

  return (
    <div className="max-w-2xl">
      <StepHeader
        num="5"
        titre={hybride ? 'Dimensionnement du convertisseur hybride' : "Dimensionnement de l'onduleur"}
        description="Calculé à partir des puissances nominale et de démarrage de tous les appareils saisis à l'étape 2."
      />

      {hybride && (
        <div className="mb-6 rounded-md px-4 py-3 text-sm border border-forest-200 bg-forest-100/60">
          Système hybride : le champ PV et la batterie sont gérés par un seul convertisseur hybride intégré, pas par
          un contrôleur de charge et un onduleur séparés. Le catalogue ci-dessous ne montre que les modèles hybrides.
        </div>
      )}

      <Field label="Marge de dimensionnement (%)">
        <div className="max-w-[160px]">
          <NumberInput value={state.onduleurParams.margePourcent} min={0} max={200} onChange={(v) => updateOnduleurParams({ margePourcent: v })} />
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4 my-8">
        <Stat label="Puissance nominale totale" value={`${(res.puissanceContinueW / 1000).toFixed(2)} kW`} />
        <Stat
          label="Puissance de démarrage totale"
          value={res.puissanceDemarrageConnue ? `${(res.puissanceDemarrageTotaleW / 1000).toFixed(2)} kW` : 'Non renseignée'}
        />
      </div>

      <div className="rounded-md px-4 py-3 text-sm border border-forest-500 bg-forest-100 mb-6">
        Puissance minimale recommandée : <span className="font-mono-num font-semibold">{(res.puissanceMinRecommandeeW / 1000).toFixed(2)} kW</span>
        <p className="text-xs text-ink/60 mt-1">
          {res.puissanceDemarrageConnue
            ? 'Maximum entre la puissance nominale (avec marge) et la puissance de démarrage totale : la puissance de démarrage renseignée ne remplace jamais la puissance nominale, elle est comparée à elle.'
            : "Basée uniquement sur la puissance nominale (avec marge) — aucune puissance de démarrage n'a été renseignée pour l'instant."}
        </p>
      </div>

      {res.aChargesDemarrage && (
        <div className="rounded-md px-4 py-3 text-sm border border-sun-dark/50 bg-sun/10 mb-6">
          <p className="font-medium mb-1">Charges à démarrage important signalées</p>
          <p className="text-xs leading-relaxed">
            Un ou plusieurs appareils (réfrigérateur, congélateur, pompe, moteur, climatiseur…) sont marqués comme
            ayant un démarrage important. {res.puissanceDemarrageConnue
              ? 'Leur puissance de démarrage chiffrée est prise en compte ci-dessus.'
              : "Aucune valeur chiffrée n'a été renseignée pour ces appareils : la vérification ci-dessus ne porte que sur la puissance nominale. Renseignez leur puissance de démarrage si vous la connaissez."}
          </p>
        </div>
      )}

      <h3 className="font-display font-medium text-forest-950 mb-3">Choisir un {titreEquipement} dans le catalogue</h3>
      <EquipmentPicker
        items={catalogueFiltre}
        getId={(o) => o.id}
        getLabel={(o) => `${o.manufacturer} ${o.model} — ${(o.nominalPowerW / 1000).toFixed(1)} kW`}
        getSearchText={(o) => `${o.manufacturer} ${o.model} ${o.type}`}
        onSelect={choisirOnduleur}
        placeholder={`Rechercher un ${titreEquipement}…`}
        renderDetails={(o) => (
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs font-mono-num">
            <Spec label="Type" value={o.type} mono={false} />
            <Spec label="P. nominale" value={`${(o.nominalPowerW / 1000).toFixed(2)} kW`} />
            <Spec label="P. AC max" value={o.maxAcPowerW ? `${(o.maxAcPowerW / 1000).toFixed(2)} kW` : '—'} />
            <Spec label="P. PV max" value={o.maxPvPowerW ? `${(o.maxPvPowerW / 1000).toFixed(2)} kWc` : '—'} />
            <Spec label="Entrées MPPT" value={o.mpptCount ? `${o.mpptCount}` : '—'} />
            <Spec label="Tension DC max" value={o.maxDcVoltage ? `${o.maxDcVoltage} V` : '—'} />
            {hybride && <Spec label="Plage tension batterie" value={o.batteryVoltageRange || '—'} mono={false} />}
          </dl>
        )}
      />
      {hybride && catalogueFiltre.length === 0 && (
        <p className="text-xs text-ink/50 mt-2">Aucun convertisseur hybride dans le catalogue actuel.</p>
      )}

      {choisi && (
        <div
          className={`mt-4 rounded-md px-4 py-3 text-sm border ${
            puissanceSuffisante ? 'border-forest-500 bg-forest-100' : 'border-alert/50 bg-alert/10'
          }`}
        >
          {puissanceSuffisante
            ? `La puissance nominale de ${choisi.model} (${(choisi.nominalPowerW / 1000).toFixed(2)} kW) couvre le besoin recommandé.`
            : `La puissance nominale de ${choisi.model} (${(choisi.nominalPowerW / 1000).toFixed(2)} kW) est inférieure à la puissance minimale recommandée (${(res.puissanceMinRecommandeeW / 1000).toFixed(2)} kW).`}
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => navigate('/dimensionnement/regulateur')}
          className="bg-forest-900 hover:bg-forest-700 hover:shadow-md text-white font-medium px-5 py-2.5 rounded-md transition-all"
        >
          Continuer vers le contrôleur
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
