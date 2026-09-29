import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { Field, NumberInput, Spec } from './Fields';
import StepHeader from './StepHeader';
import EquipmentPicker from './EquipmentPicker';
import { useI18n } from '../i18n';
import { inverterCatalog, type InverterCatalogItem } from '../data/catalog';
import { calculerOnduleur } from '../engine/calculations';

export default function StepInverter() {
  const { state, updateOnduleurParams, setOnduleurChoisi } = useProject();
  const navigate = useNavigate();
  const { t } = useI18n();
  const res = calculerOnduleur(state.appareils, state.onduleurParams.margePourcent);

  const hybride = state.info.architectureSysteme === 'Hybride';
  const titreEquipement = hybride ? t('hybridConverter') : t('inverter');
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
        titre={hybride ? t('hybridSizing') : t('inverterSizing')}
        description={t('inverterDescription')}
      />

      {hybride && (
        <div className="mb-6 rounded-md px-4 py-3 text-sm border border-forest-200 bg-forest-100/60">
          {t('hybridNote')}
        </div>
      )}

      <Field label={t('sizingMargin')}>
        <div className="max-w-[160px]">
          <NumberInput value={state.onduleurParams.margePourcent} min={0} max={200} onChange={(v) => updateOnduleurParams({ margePourcent: v })} />
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4 my-8">
        <Stat label={t('totalNominalPower')} value={`${(res.puissanceContinueW / 1000).toFixed(2)} kW`} />
        <Stat
          label={t('totalStartupPower')}
          value={res.puissanceDemarrageConnue ? `${(res.puissanceDemarrageTotaleW / 1000).toFixed(2)} kW` : t('startupUnknown')}
        />
      </div>

      <div className="rounded-md px-4 py-3 text-sm border border-forest-500 bg-forest-100 mb-6">
        {t('recommendedMinimum')} : <span className="font-mono-num font-semibold">{(res.puissanceMinRecommandeeW / 1000).toFixed(2)} kW</span>
        <p className="text-xs text-ink/60 mt-1">
          {res.puissanceDemarrageConnue
            ? t('startupCompared')
            : t('startupOnlyNominal')}
        </p>
      </div>

      {res.aChargesDemarrage && (
        <div className="rounded-md px-4 py-3 text-sm border border-sun-dark/50 bg-sun/10 mb-6">
          <p className="font-medium mb-1">{t('importantLoads')}</p>
          <p className="text-xs leading-relaxed">
            {t('importantLoadsText')}
          </p>
        </div>
      )}

      <h3 className="font-display font-medium text-forest-950 mb-3">{t('chooseInverter', { equipment: titreEquipement })}</h3>
      <EquipmentPicker
        items={catalogueFiltre}
        getId={(o) => o.id}
        getLabel={(o) => `${o.manufacturer} ${o.model} — ${(o.nominalPowerW / 1000).toFixed(1)} kW`}
        getSearchText={(o) => `${o.manufacturer} ${o.model} ${o.type}`}
        onSelect={choisirOnduleur}
        placeholder={`${t('search')} ${titreEquipement}…`}
        renderDetails={(o) => (
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs font-mono-num">
            <Spec label="Type" value={o.type} mono={false} />
            <Spec label={t('nominalPowerShort')} value={`${(o.nominalPowerW / 1000).toFixed(2)} kW`} />
            <Spec label={t('maxAcPower')} value={o.maxAcPowerW ? `${(o.maxAcPowerW / 1000).toFixed(2)} kW` : '—'} />
            <Spec label={t('maxPvPower')} value={o.maxPvPowerW ? `${(o.maxPvPowerW / 1000).toFixed(2)} kWc` : '—'} />
            <Spec label={t('mpptInputs')} value={o.mpptCount ? `${o.mpptCount}` : '—'} />
            <Spec label={t('maxDcVoltage')} value={o.maxDcVoltage ? `${o.maxDcVoltage} V` : '—'} />
            {hybride && <Spec label={t('batteryVoltageRange')} value={o.batteryVoltageRange || '—'} mono={false} />}
          </dl>
        )}
      />
      {hybride && catalogueFiltre.length === 0 && (
        <p className="text-xs text-ink/50 mt-2">{t('noHybrid')}</p>
      )}

      {choisi && (
        <div
          className={`mt-4 rounded-md px-4 py-3 text-sm border ${
            puissanceSuffisante ? 'border-forest-500 bg-forest-100' : 'border-alert/50 bg-alert/10'
          }`}
        >
          {puissanceSuffisante
            ? t('inverterSufficient', { model: choisi.model, power: (choisi.nominalPowerW / 1000).toFixed(2) })
            : t('inverterInsufficient', { model: choisi.model, power: (choisi.nominalPowerW / 1000).toFixed(2), minimum: (res.puissanceMinRecommandeeW / 1000).toFixed(2) })}
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => navigate('/dimensionnement/regulateur')}
          className="bg-forest-900 hover:bg-forest-700 hover:shadow-md text-white font-medium px-5 py-2.5 rounded-md transition-all"
        >
          {t('continueController')}
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
