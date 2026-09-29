import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { Field, NumberInput, SelectInput, Spec } from './Fields';
import StepHeader from './StepHeader';
import EquipmentPicker from './EquipmentPicker';
import { useI18n } from '../i18n';
import { localizeCalculationText } from '../i18n/localize';
import { batteryCatalog, mapBatteryTechnology, type BatteryCatalogItem } from '../data/catalog';
import { calculerBilan, calculerBesoinBatterie, trouverConfigurationBatterie } from '../engine/calculations';

const technologies = ['Lithium', 'AGM', 'GEL', 'Plomb', 'Autre'] as const;

export default function StepBattery() {
  const { state, updateBatterieParams, updateBatterie, setBatterieChoisie } = useProject();
  const navigate = useNavigate();
  const { language, t } = useI18n();

  const bilan = calculerBilan(state.appareils);
  const besoin = calculerBesoinBatterie(bilan.energieJourWh, state.batterieParams, Number(state.info.tensionSysteme));
  const config = trouverConfigurationBatterie(state.batterie, besoin.capaciteAh, Number(state.info.tensionSysteme));

  const valide = state.batterieParams.dod > 0 && state.batterieParams.dod <= 1 && state.batterieParams.rendementBatterie > 0 && state.batterie.tensionNominale > 0 && state.batterie.capaciteAh > 0;

  const choisirBatterie = (b: BatteryCatalogItem) => {
    setBatterieChoisie(b);
    updateBatterie({
      tensionNominale: b.nominalVoltage,
      capaciteAh: b.nominalCapacityAh,
      technologie: mapBatteryTechnology(b.technology),
      dodRecommande: b.maxDoD / 100,
      // Le rendement n'est pas systématiquement fourni par les fiches fabricants : on ne l'écrase pas ici.
    });
  };

  const catalogueFiltre = batteryCatalog.filter((b) => mapBatteryTechnology(b.technology) === state.batterie.technologie);

  return (
    <div className="max-w-3xl">
      <StepHeader num="4" titre={t('batterySizing')} description={t('batteryDescription', { voltage: state.info.tensionSysteme })} />

      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <Field label={t('autonomy')}>
          <NumberInput value={state.batterieParams.autonomieJours} min={0.1} onChange={(v) => updateBatterieParams({ autonomieJours: v })} />
        </Field>
        <Field label={t('depthDischarge')} hint="Entre 0 et 1.">
          <NumberInput value={state.batterieParams.dod} min={0.01} max={1} step={0.05} onChange={(v) => updateBatterieParams({ dod: v })} />
        </Field>
        <Field label={t('batteryEfficiency')}>
          <NumberInput value={state.batterieParams.rendementBatterie} min={0.01} max={1} step={0.01} onChange={(v) => updateBatterieParams({ rendementBatterie: v })} />
        </Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <Stat label={t('requiredEnergy')} value={`${besoin.energieBatterieKWh.toFixed(2)} kWh`} />
        <Stat label={t('requiredCapacity')} value={`${besoin.capaciteAh.toFixed(0)} Ah`} />
        <Stat label={t('under')} value={`${state.info.tensionSysteme} V`} />
      </div>

      <Field label={t('batteryTechnology')} hint={t('batteryTechnology')}>
        <div className="flex flex-wrap gap-2">
          {technologies.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => updateBatterie({ technologie: t })}
              className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                state.batterie.technologie === t ? 'bg-forest-900 text-white border-forest-900' : 'border-forest-200 hover:border-forest-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Field>

      <h3 className="font-display font-medium text-forest-950 mb-3 mt-6">{t('chooseBattery', { technology: state.batterie.technologie })}</h3>
      <EquipmentPicker
        key={state.batterie.technologie}
        items={catalogueFiltre}
        getId={(b) => b.id}
        getLabel={(b) => `${b.manufacturer} ${b.model} — ${b.nominalVoltage} V / ${b.nominalCapacityAh} Ah`}
        getSearchText={(b) => `${b.manufacturer} ${b.model} ${b.technology}`}
        onSelect={choisirBatterie}
        placeholder={`${t('search')} ${state.batterie.technologie}…`}
        renderDetails={(b) => (
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs font-mono-num">
            <Spec label={t('technology')} value={b.technology} mono={false} />
            <Spec label="DoD max" value={`${b.maxDoD} %`} />
            <Spec label={t('nominalEnergy')} value={b.nominalEnergyKWh ? `${b.nominalEnergyKWh} kWh` : '—'} />
            <Spec label="Cycles" value={b.cycleLife ? `${b.cycleLife}` : '—'} />
            <Spec label="Poids" value={b.weightKg ? `${b.weightKg} kg` : '—'} />
          </dl>
        )}
      />
      {catalogueFiltre.length === 0 && (
        <p className="text-xs text-ink/50 mt-2">{t('noResults')}</p>
      )}
      <p className="text-xs text-ink/50 mt-2 mb-8">
        {t('batteryEfficiencyNote')}
      </p>

      <h3 className="font-display font-medium text-forest-950 mb-3">{t('chosenBattery')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <Field label={t('batteryVoltage')}>
          <NumberInput value={state.batterie.tensionNominale} min={1} onChange={(v) => updateBatterie({ tensionNominale: v })} />
        </Field>
        <Field label={t('batteryCapacity')}>
          <NumberInput value={state.batterie.capaciteAh} min={1} onChange={(v) => updateBatterie({ capaciteAh: v })} />
        </Field>
        <Field label={t('technology')}>
          <SelectInput value={state.batterie.technologie} onChange={(v) => updateBatterie({ technologie: v })} options={technologies} />
        </Field>
        <Field label={t('recommendedDod')}>
          <NumberInput value={state.batterie.dodRecommande} min={0.01} max={1} step={0.05} onChange={(v) => updateBatterie({ dodRecommande: v })} />
        </Field>
        <Field label={t('efficiency')}>
          <NumberInput value={state.batterie.rendement} min={0.01} max={1} step={0.01} onChange={(v) => updateBatterie({ rendement: v })} />
        </Field>
      </div>

      <div className={`rounded-md px-4 py-3 text-sm border ${config.compatible ? 'border-forest-500 bg-forest-100' : 'border-alert/50 bg-alert/10'}`}>
        <p className="font-medium mb-1">
          {config.compatible ? t('coherentBattery') : t('fixBattery')}
        </p>
        {config.totalBatteries > 0 && (
          <p className="font-mono-num text-xs">
            {config.enSerie}S × {config.enParallele}P = {config.totalBatteries} {t('batteries')} — {config.tensionTotale} V, {config.capaciteTotaleAh.toFixed(0)} Ah, {(config.energieUtilisableWh / 1000).toFixed(2)} kWh {t('usable')}
          </p>
        )}
        {!config.compatible && config.raisons.map((r, i) => <p key={i} className="text-xs mt-1">{localizeCalculationText(language, r)}</p>)}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          disabled={!valide}
          onClick={() => navigate('/dimensionnement/onduleur')}
          className="bg-forest-900 disabled:bg-forest-200 disabled:text-ink/40 hover:bg-forest-700 hover:shadow-md text-white font-medium px-5 py-2.5 rounded-md transition-all"
        >
          {t('continueInverter')}
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
