import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { Field, NumberInput } from './Fields';
import { Spec } from './Fields';
import StepHeader from './StepHeader';
import EquipmentPicker from './EquipmentPicker';
import { panelCatalog, type PanelCatalogItem } from '../data/catalog';
import {
  calculerBilan,
  calculerPuissancePV,
  calculerNombrePanneaux,
  trouverConfigurationSeriParallele,
} from '../engine/calculations';

export default function StepSolar() {
  const { state, updateSolaire, updatePanneau, updateLimites, setPanneauChoisi } = useProject();
  const navigate = useNavigate();

  const bilan = calculerBilan(state.appareils);
  const puissancePvW = calculerPuissancePV(bilan.energieJourWh, state.solaire.hsp, state.solaire.rendementGlobal);
  const dimensionnement = calculerNombrePanneaux(puissancePvW, state.panneau);
  const config = trouverConfigurationSeriParallele(state.panneau, dimensionnement.nombrePanneaux, state.limites);

  const valide = state.solaire.hsp > 0 && state.solaire.rendementGlobal > 0 && state.solaire.rendementGlobal <= 1 && state.panneau.puissanceW > 0;

  const choisirPanneau = (p: PanelCatalogItem) => {
    setPanneauChoisi(p);
    updatePanneau({ puissanceW: p.powerWp, voc: p.voc, vmp: p.vmp, isc: p.isc, imp: p.imp });
  };

  return (
    <div className="max-w-3xl">
      <StepHeader num="3" titre="Paramètres solaires et champ photovoltaïque" description="La puissance PV nécessaire est calculée à partir de votre consommation quotidienne." />

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <Field label="Heures solaires de pointe (HSP)" hint="Estimation de l'énergie solaire quotidienne disponible, en heures équivalentes de plein soleil.">
          <NumberInput value={state.solaire.hsp} min={0.1} onChange={(v) => updateSolaire({ hsp: v })} />
        </Field>
        <Field label="Rendement global du système" hint="Pertes combinées (câblage, onduleur, température…), entre 0 et 1.">
          <NumberInput value={state.solaire.rendementGlobal} min={0.01} max={1} step={0.01} onChange={(v) => updateSolaire({ rendementGlobal: v })} />
        </Field>
      </div>

      <div className="bg-forest-100 rounded-md px-4 py-3 mb-8 text-sm">
        Puissance PV théorique nécessaire : <span className="font-mono-num font-semibold">{isFinite(puissancePvW) ? puissancePvW.toFixed(0) : '—'} W</span>
        {' '}({(puissancePvW / 1000).toFixed(2)} kWc)
      </div>

      <h3 className="font-display font-medium text-forest-950 mb-3">Choisir un panneau dans le catalogue</h3>
      <EquipmentPicker
        items={panelCatalog}
        getId={(p) => p.id}
        getLabel={(p) => `${p.manufacturer} ${p.model} — ${p.powerWp} Wc`}
        getSearchText={(p) => `${p.manufacturer} ${p.model} ${p.technology}`}
        onSelect={choisirPanneau}
        placeholder="Rechercher une marque ou un modèle de panneau…"
        renderDetails={(p) => (
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs font-mono-num">
            <Spec label="Voc" value={`${p.voc} V`} />
            <Spec label="Vmp" value={`${p.vmp} V`} />
            <Spec label="Isc" value={`${p.isc} A`} />
            <Spec label="Imp" value={`${p.imp} A`} />
            <Spec label="Technologie" value={p.technology} mono={false} />
            <Spec label="Poids" value={p.weightKg ? `${p.weightKg} kg` : '—'} />
          </dl>
        )}
      />
      <p className="text-xs text-ink/50 mt-2 mb-8">
        Les champs ci-dessous restent modifiables manuellement, y compris après une sélection dans le catalogue.
      </p>

      <h3 className="font-display font-medium text-forest-950 mb-3">Caractéristiques du panneau</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <Field label="Puissance (W)">
          <NumberInput value={state.panneau.puissanceW} min={1} onChange={(v) => updatePanneau({ puissanceW: v })} />
        </Field>
        <Field label="Voc (V)">
          <NumberInput value={state.panneau.voc} min={0} onChange={(v) => updatePanneau({ voc: v })} />
        </Field>
        <Field label="Vmp (V)">
          <NumberInput value={state.panneau.vmp} min={0} onChange={(v) => updatePanneau({ vmp: v })} />
        </Field>
        <Field label="Isc (A)">
          <NumberInput value={state.panneau.isc} min={0} onChange={(v) => updatePanneau({ isc: v })} />
        </Field>
        <Field label="Imp (A)">
          <NumberInput value={state.panneau.imp} min={0} onChange={(v) => updatePanneau({ imp: v })} />
        </Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <Stat label="Nombre de panneaux" value={dimensionnement.nombrePanneaux.toString()} />
        <Stat label="Puissance installée" value={`${(dimensionnement.puissanceInstalleeW / 1000).toFixed(2)} kWc`} />
        <Stat label="Écart / besoin" value={`${dimensionnement.ecartPourcent >= 0 ? '+' : ''}${dimensionnement.ecartPourcent.toFixed(1)} %`} />
      </div>

      <h3 className="font-display font-medium text-forest-950 mb-3">Limites de l'onduleur / régulateur</h3>
      <p className="text-xs text-ink/55 mb-4 max-w-lg">Ces valeurs proviennent de la fiche technique de votre onduleur ou régulateur MPPT — elles servent à valider la configuration série/parallèle.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Field label="Tension PV max (V)">
          <NumberInput value={state.limites.tensionPvMax} min={0} onChange={(v) => updateLimites({ tensionPvMax: v })} />
        </Field>
        <Field label="MPPT min (V)">
          <NumberInput value={state.limites.tensionMpptMin} min={0} onChange={(v) => updateLimites({ tensionMpptMin: v })} />
        </Field>
        <Field label="MPPT max (V)">
          <NumberInput value={state.limites.tensionMpptMax} min={0} onChange={(v) => updateLimites({ tensionMpptMax: v })} />
        </Field>
        <Field label="Courant PV max (A)">
          <NumberInput value={state.limites.courantPvMax} min={0} onChange={(v) => updateLimites({ courantPvMax: v })} />
        </Field>
      </div>

      <div className={`rounded-md px-4 py-3 text-sm border ${config.compatible ? 'border-forest-500 bg-forest-100' : 'border-alert/50 bg-alert/10'}`}>
        <p className="font-medium mb-1">{config.compatible ? 'Configuration compatible' : 'Aucune configuration compatible avec les paramètres saisis.'}</p>
        {config.totalPanneaux > 0 && (
          <p className="font-mono-num text-xs">
            {config.enSerie}S × {config.enParallele}P — Vmp {config.vmpChamp.toFixed(1)} V, Voc {config.vocChamp.toFixed(1)} V, {config.courantChamp.toFixed(1)} A, {(config.puissanceChamp / 1000).toFixed(2)} kWc
          </p>
        )}
        {!config.compatible && config.raisons.map((r, i) => <p key={i} className="text-xs mt-1">{r}</p>)}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          disabled={!valide}
          onClick={() => navigate('/dimensionnement/batterie')}
          className="bg-forest-900 disabled:bg-forest-200 disabled:text-ink/40 hover:bg-forest-700 text-white font-medium px-5 py-2.5 rounded-md transition-colors"
        >
          Continuer — Batterie
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
