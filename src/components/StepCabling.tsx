import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { Field, NumberInput, Spec } from './Fields';
import StepHeader from './StepHeader';
import EquipmentPicker from './EquipmentPicker';
import {
  cableCatalog,
  protectionCatalog,
  selectionnerCableRecommande,
  selectionnerProtectionRecommandee,
  type CableCatalogItem,
  type ProtectionCatalogItem,
} from '../data/catalog';
import { calculerSectionTheorique, RESISTIVITE_CUIVRE_OHM_MM2_PAR_M } from '../engine/calculations';
import { useResults } from '../engine/useResults';

export default function StepCabling() {
  const { state, updateCablage, setCableChoisi, setProtectionChoisie } = useProject();
  // Mêmes données de champ PV que les étapes MPPT/PWM et la page Résultats — aucun second calcul du champ ici.
  const results = useResults(state);
  const { configPV, dimensionnementPanneaux, courantIscChampA, calibreProtectionRecommandeeA, chuteDeTension: chute } = results;

  const champDimensionne = dimensionnementPanneaux.nombrePanneaux > 0 && configPV.totalPanneaux > 0;
  const tensionReference = configPV.vmpChamp || null;

  const chuteVoltsAdmissible =
    tensionReference && state.cablage.chuteTensionMaxPourcent > 0 ? (tensionReference * state.cablage.chuteTensionMaxPourcent) / 100 : null;

  const sectionTheorique =
    champDimensionne && chuteVoltsAdmissible
      ? calculerSectionTheorique(state.cablage.longueurAllerM, courantIscChampA, chuteVoltsAdmissible)
      : null;

  const cableRecommande = sectionTheorique !== null ? selectionnerCableRecommande(cableCatalog, sectionTheorique) : null;
  const protectionRecommandee = champDimensionne ? selectionnerProtectionRecommandee(protectionCatalog, calibreProtectionRecommandeeA) : null;

  const protectionChoisie = state.protectionChoisie;
  const courantOk =
    protectionChoisie &&
    (protectionChoisie.ratedCurrentMinA === null || protectionChoisie.ratedCurrentMinA <= calibreProtectionRecommandeeA) &&
    (protectionChoisie.ratedCurrentMaxA === null || protectionChoisie.ratedCurrentMaxA >= calibreProtectionRecommandeeA);
  const tensionOk = protectionChoisie ? protectionChoisie.ratedVoltageDcV >= configPV.vocChamp : null;

  return (
    <div className="max-w-2xl">
      <StepHeader
        num="7"
        titre="Câblage et protection DC"
        description="Section de câble entre le champ PV et le régulateur, et calibre de la protection DC côté champ."
      />

      {!champDimensionne && (
        <div className="mb-6 rounded-md px-4 py-3 text-sm border border-sun-dark/50 bg-sun/10">
          Le champ photovoltaïque n'est pas encore dimensionné. Renseignez le bilan de consommation et les
          paramètres solaires (étape 3) avant de calculer le câblage.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Stat label="Courant du champ (Isc)" value={champDimensionne ? `${courantIscChampA.toFixed(1)} A` : 'Données insuffisantes'} />
        <Stat label="Calibre protection recommandé" value={champDimensionne ? `${calibreProtectionRecommandeeA.toFixed(1)} A` : 'Données insuffisantes'} />
      </div>
      <p className="text-xs text-ink/55 -mt-4 mb-8">
        Isc du champ = Isc du panneau × nombre de branches parallèles ({configPV.enParallele || '—'}). Calibre recommandé = 1,25 × Isc du champ.
      </p>

      <h3 className="font-display font-medium text-forest-950 mb-3">Câble PV</h3>
      <div className="grid sm:grid-cols-2 gap-6 mb-4">
        <Field label="Longueur aller (m)" hint="Distance à sens unique entre le champ et le régulateur (le calcul prend en compte l'aller-retour).">
          <NumberInput value={state.cablage.longueurAllerM} min={0} onChange={(v) => updateCablage({ longueurAllerM: v })} />
        </Field>
        <Field label="Chute de tension maximale visée (%)">
          <NumberInput value={state.cablage.chuteTensionMaxPourcent} min={0.1} step={0.1} onChange={(v) => updateCablage({ chuteTensionMaxPourcent: v })} />
        </Field>
      </div>

      <div className="rounded-md px-4 py-3 text-sm border border-forest-200 bg-forest-100/40 mb-4">
        {sectionTheorique === null ? (
          <p>Données insuffisantes pour calculer la section (longueur, courant du champ ou tension de référence manquants).</p>
        ) : (
          <>
            <p>
              Section théorique (S = 2×L×I×ρ/ΔV, ρ cuivre = {RESISTIVITE_CUIVRE_OHM_MM2_PAR_M} Ω·mm²/m) :{' '}
              <span className="font-mono-num font-medium">{sectionTheorique.toFixed(2)} mm²</span>
            </p>
            <p className="mt-1">
              Section normalisée recommandée dans le catalogue :{' '}
              <span className="font-mono-num font-medium">
                {cableRecommande ? `${cableRecommande.crossSectionMm2} mm² (${cableRecommande.manufacturer} ${cableRecommande.model})` : 'aucune section du catalogue ne couvre ce besoin'}
              </span>
            </p>
          </>
        )}
      </div>

      <EquipmentPicker
        items={cableCatalog}
        getId={(c) => c.id}
        getLabel={(c: CableCatalogItem) => `${c.model} (${c.manufacturer})`}
        getSearchText={(c) => `${c.manufacturer} ${c.model} ${c.crossSectionMm2}mm2`}
        onSelect={(c) => setCableChoisi(c)}
        placeholder="Rechercher une section de câble…"
        renderDetails={(c) => (
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs font-mono-num">
            <Spec label="Section" value={`${c.crossSectionMm2} mm²`} />
            <Spec label="Résistance" value={`${c.resistanceOhmPerKm} Ω/km`} />
            <Spec label="Courant admissible" value={`${c.currentCarryingCapacityA} A`} />
            <Spec label="Tension DC max" value={`${c.maxVoltageDcV} V`} />
            <Spec label="Norme" value={c.standard || '—'} mono={false} />
          </dl>
        )}
      />

      {chute && (
        <div className={`mt-4 rounded-md px-4 py-3 text-sm border ${chute.acceptable ? 'border-forest-500 bg-forest-100' : 'border-sun-dark/50 bg-sun/10'}`}>
          Chute de tension estimée pour le câble choisi : <span className="font-mono-num font-medium">{chute.chutePourcent.toFixed(2)} %</span> ({chute.chuteVoltsV.toFixed(2)} V)
          {!chute.acceptable && ' — au-dessus du seuil visé, augmentez la section ou réduisez la longueur.'}
          {state.cableChoisi && courantIscChampA > state.cableChoisi.currentCarryingCapacityA && (
            <p className="mt-1 text-alert">
              Le courant du champ ({courantIscChampA.toFixed(1)} A) dépasse le courant admissible de ce câble ({state.cableChoisi.currentCarryingCapacityA} A).
            </p>
          )}
        </div>
      )}

      <h3 className="font-display font-medium text-forest-950 mb-3 mt-10">Protection DC</h3>
      <div className="rounded-md px-4 py-3 text-sm border border-forest-200 bg-forest-100/40 mb-4">
        {!champDimensionne ? (
          <p>Données insuffisantes pour recommander un calibre de protection.</p>
        ) : (
          <p>
            Protection recommandée dans le catalogue :{' '}
            <span className="font-mono-num font-medium">
              {protectionRecommandee ? `${protectionRecommandee.manufacturer} ${protectionRecommandee.model} (${protectionRecommandee.ratedCurrentARaw} A)` : 'aucune protection du catalogue ne couvre ce calibre'}
            </span>
          </p>
        )}
      </div>

      <EquipmentPicker
        items={protectionCatalog}
        getId={(p) => p.id}
        getLabel={(p: ProtectionCatalogItem) => `${p.model} (${p.manufacturer})`}
        getSearchText={(p) => `${p.manufacturer} ${p.model}`}
        onSelect={(p) => setProtectionChoisie(p)}
        placeholder="Rechercher un disjoncteur / fusible DC…"
        renderDetails={(p) => (
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs font-mono-num">
            <Spec label="Plage de calibre" value={p.ratedCurrentARaw ? `${p.ratedCurrentARaw} A` : '—'} />
            <Spec label="Tension DC max" value={`${p.ratedVoltageDcV} V`} />
            <Spec label="Pouvoir de coupure" value={p.breakingCapacitykA ? `${p.breakingCapacitykA} kA` : '—'} />
            <Spec label="Pôles" value={p.poles ? `${p.poles}` : '—'} />
            <Spec label="Norme" value={p.standard || '—'} mono={false} />
          </dl>
        )}
      />

      {protectionChoisie && (
        <div className={`mt-4 rounded-md px-4 py-3 text-sm border ${courantOk && tensionOk ? 'border-forest-500 bg-forest-100' : 'border-alert/50 bg-alert/10'}`}>
          {courantOk && tensionOk
            ? 'Cette protection couvre le calibre recommandé et la tension du champ.'
            : 'Vérifiez cette protection : ' +
              [
                !courantOk && 'le calibre recommandé sort de sa plage réglable',
                !tensionOk && `sa tension admissible (${protectionChoisie.ratedVoltageDcV} V) est inférieure à la Voc du champ (${configPV.vocChamp.toFixed(1)} V)`,
              ]
                .filter(Boolean)
                .join(' et ') +
              '.'}
        </div>
      )}

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
