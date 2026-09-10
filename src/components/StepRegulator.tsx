import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { Field, NumberInput, Spec } from './Fields';
import StepHeader from './StepHeader';
import EquipmentPicker from './EquipmentPicker';
import { regulatorCatalog, type RegulatorCatalogItem } from '../data/catalog';
import { useResults } from '../engine/useResults';

const calibresCourants = [40, 50, 60, 80, 100, 120, 150];

export default function StepRegulator() {
  const { state, updateRegulateurParams, setRegulateurChoisi } = useProject();
  // Résultats calculés une seule fois, à partir des mêmes données de champ PV que la page Résultats et le PDF.
  const results = useResults(state);
  const { configPV, dimensionnementPanneaux, regulateur: res, courantIscChampA } = results;

  const type = state.regulateurParams.type;
  const champDimensionne = dimensionnementPanneaux.nombrePanneaux > 0 && configPV.totalPanneaux > 0;

  const catalogueFiltre = regulatorCatalog.filter((r) => r.type === type);

  const choisirRegulateur = (r: RegulatorCatalogItem) => {
    setRegulateurChoisi(r);
    updateRegulateurParams({ calibreChoisi: r.maxChargeCurrentA });
  };

  const choisi = state.regulateurChoisi;
  const tensionChoisieDisponible = typeof choisi?.maxPvVoltageV === 'number';
  const tensionCompatible = tensionChoisieDisponible ? (choisi!.maxPvVoltageV as number) >= configPV.vocChamp : null;

  return (
    <div className="max-w-2xl">
      <StepHeader num="6" titre="Dimensionnement du contrôleur" description="Choisissez d'abord le type de contrôleur, puis un modèle dans le catalogue — la fiche du modèle s'affiche ensuite." />

      {state.info.architectureSysteme === 'Hybride' && (
        <div className="mb-6 rounded-md px-4 py-3 text-sm border border-forest-200 bg-forest-100/60">
          Système hybride : selon le modèle choisi à l'étape « Onduleur », la gestion du champ PV peut déjà être
          intégrée au convertisseur hybride plutôt que confiée à un contrôleur séparé. Vérifiez la fiche technique
          du convertisseur choisi avant de dupliquer un contrôleur externe.
        </div>
      )}

      {!champDimensionne && (
        <div className="mb-6 rounded-md px-4 py-3 text-sm border border-sun-dark/50 bg-sun/10">
          Le champ photovoltaïque n'est pas encore dimensionné (aucun panneau requis à l'étape 3). Renseignez le
          bilan de consommation et les paramètres solaires avant de dimensionner le contrôleur.
        </div>
      )}

      <Field label="Type de contrôleur">
        <div className="flex gap-2">
          {(['MPPT', 'PWM'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                updateRegulateurParams({ type: t });
                setRegulateurChoisi(null);
              }}
              className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                type === t ? 'bg-forest-900 text-white border-forest-900' : 'border-forest-200 hover:border-forest-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Field>

      <p className="text-xs text-ink/55 mt-2 mb-6 max-w-lg leading-relaxed">
        {type === 'MPPT'
          ? 'Le MPPT convertit la puissance du champ : le courant recommandé se calcule à partir de la puissance PV installée et de la tension système.'
          : "Le PWM connecte le champ quasiment en direct sur la batterie : le courant recommandé se calcule à partir du courant de court-circuit (Isc) total du champ (Isc du panneau × nombre de branches parallèles), pas de la puissance."}
      </p>

      <Field label="Marge de dimensionnement (%)">
        <div className="max-w-[160px]">
          <NumberInput value={state.regulateurParams.margePourcent} min={0} max={200} onChange={(v) => updateRegulateurParams({ margePourcent: v })} />
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4 my-8">
        {!champDimensionne ? (
          <>
            <Stat label="Courant théorique" value="Données insuffisantes" />
            <Stat label="Courant recommandé" value="Données insuffisantes" />
          </>
        ) : type === 'MPPT' ? (
          <>
            <Stat label="Courant théorique" value={`${'courantTheoriqueA' in res ? res.courantTheoriqueA.toFixed(1) : '—'} A`} />
            <Stat label="Courant recommandé (marge incluse)" value={`${res.courantAvecMargeA.toFixed(1)} A`} />
          </>
        ) : (
          <>
            <Stat label="Isc total du champ" value={`${courantIscChampA.toFixed(1)} A`} />
            <Stat label="Courant recommandé (marge incluse)" value={`${res.courantAvecMargeA.toFixed(1)} A`} />
          </>
        )}
      </div>

      <h3 className="font-display font-medium text-forest-950 mb-3">Choisir un contrôleur {type} dans le catalogue</h3>
      <EquipmentPicker
        key={type}
        items={catalogueFiltre}
        getId={(r) => r.id}
        getLabel={(r) => `${r.manufacturer} ${r.model} — ${r.maxChargeCurrentA} A`}
        getSearchText={(r) => `${r.manufacturer} ${r.model}`}
        onSelect={choisirRegulateur}
        placeholder={`Rechercher un contrôleur ${type}…`}
        renderDetails={(r) => (
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs font-mono-num">
            <Spec label="Courant max" value={`${r.maxChargeCurrentA} A`} />
            <Spec label="Tension PV max" value={r.maxPvVoltageV != null ? `${r.maxPvVoltageV} V` : r.maxPvVoltageVRaw || '—'} />
            <Spec label="Tension batterie" value={r.batteryVoltage || '—'} mono={false} />
            <Spec label="Rendement max" value={r.maxEfficiencyPct ? `${r.maxEfficiencyPct} %` : '—'} />
            <Spec label="Poids" value={r.weightKg ? `${r.weightKg} kg` : '—'} />
            <Spec label="Vérification" value={r.verificationLevel || '—'} mono={false} />
          </dl>
        )}
      />

      <Field label="Calibre du contrôleur (A)" hint="Préremplu par le modèle choisi dans le catalogue, modifiable.">
        <div className="flex flex-wrap gap-2 mt-1">
          {calibresCourants.map((c) => (
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

      <div className={`mt-6 rounded-md px-4 py-3 text-sm border ${!champDimensionne ? 'border-sun-dark/50 bg-sun/10' : res.calibreSuffisant ? 'border-forest-500 bg-forest-100' : 'border-alert/50 bg-alert/10'}`}>
        {!champDimensionne
          ? 'Données insuffisantes pour vérifier la compatibilité du calibre : dimensionnez d\'abord le champ PV.'
          : res.calibreSuffisant
          ? `Le calibre de ${state.regulateurParams.calibreChoisi} A couvre le courant recommandé.`
          : `Le calibre de ${state.regulateurParams.calibreChoisi} A est insuffisant face au courant recommandé de ${res.courantAvecMargeA.toFixed(1)} A. Choisissez un calibre supérieur.`}
      </div>

      {choisi && (
        <div className={`mt-3 rounded-md px-4 py-3 text-sm border ${tensionChoisieDisponible ? (tensionCompatible ? 'border-forest-500 bg-forest-100' : 'border-alert/50 bg-alert/10') : 'border-forest-200 bg-forest-100/40'}`}>
          {!champDimensionne
            ? 'Données insuffisantes pour vérifier la compatibilité de tension.'
            : !tensionChoisieDisponible
            ? 'Données insuffisantes pour vérifier la compatibilité de tension : la fiche de ce modèle ne fournit pas de tension PV maximale exploitable.'
            : tensionCompatible
            ? `Tension d'entrée du contrôleur (${choisi.maxPvVoltageV} V) compatible avec la Voc du champ (${configPV.vocChamp.toFixed(1)} V).`
            : `Tension d'entrée du contrôleur (${choisi.maxPvVoltageV} V) insuffisante face à la Voc du champ (${configPV.vocChamp.toFixed(1)} V).`}
        </div>
      )}

      {type === 'MPPT' && (
        <p className="text-xs text-ink/55 mt-4 max-w-lg leading-relaxed">
          Vérifiez également, sur la fiche technique du contrôleur, sa plage de tension MPPT face à la Vmp du champ
          ({configPV.vmpChamp.toFixed(1)} V) — cette plage n'est pas toujours publiée par les fabricants.
        </p>
      )}

      <div className="mt-8 flex justify-end">
        <Link to="/dimensionnement/cablage" className="bg-forest-900 hover:bg-forest-700 hover:shadow-md text-white font-medium px-5 py-2.5 rounded-md transition-all">
          Continuer vers le câblage
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
