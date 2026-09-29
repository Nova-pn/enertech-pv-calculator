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
import { useI18n } from '../i18n';

export default function StepCabling() {
  const { state, updateCablage, setCableChoisi, setProtectionChoisie } = useProject();
  const { t } = useI18n();
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
        titre={t('cablingProtection')}
        description={t('cablingDescription')}
      />

      {!champDimensionne && (
        <div className="mb-6 rounded-md px-4 py-3 text-sm border border-sun-dark/50 bg-sun/10">
          {t('fieldNotSized')}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Stat label={t('fieldCurrent')} value={champDimensionne ? `${courantIscChampA.toFixed(1)} A` : t('insufficientData')} />
        <Stat label={t('recommendedProtection')} value={champDimensionne ? `${calibreProtectionRecommandeeA.toFixed(1)} A` : t('insufficientData')} />
      </div>
      <p className="text-xs text-ink/55 -mt-4 mb-8">
        {t('voltageArrayNote', { parallel: configPV.enParallele || '—' })}
      </p>

      <h3 className="font-display font-medium text-forest-950 mb-3">{t('cable')}</h3>
      <div className="grid sm:grid-cols-2 gap-6 mb-4">
        <Field label={t('cableLength')} hint={t('cableLength')}>
          <NumberInput value={state.cablage.longueurAllerM} min={0} onChange={(v) => updateCablage({ longueurAllerM: v })} />
        </Field>
        <Field label={t('maxVoltageDrop')}>
          <NumberInput value={state.cablage.chuteTensionMaxPourcent} min={0.1} step={0.1} onChange={(v) => updateCablage({ chuteTensionMaxPourcent: v })} />
        </Field>
      </div>

      <div className="rounded-md px-4 py-3 text-sm border border-forest-200 bg-forest-100/40 mb-4">
        {sectionTheorique === null ? (
          <p>{t('insufficientData')}</p>
        ) : (
          <>
            <p>
              {t('theoreticalSectionText', { resistivity: RESISTIVITE_CUIVRE_OHM_MM2_PAR_M })}{' '}
              <span className="font-mono-num font-medium">{sectionTheorique.toFixed(2)} mm²</span>
            </p>
            <p className="mt-1">
              {t('catalogRecommended')}{' '}
              <span className="font-mono-num font-medium">
                {cableRecommande ? `${cableRecommande.crossSectionMm2} mm² (${cableRecommande.manufacturer} ${cableRecommande.model})` : t('noCableCovers')}
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
        placeholder={t('chooseCable')}
        renderDetails={(c) => (
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs font-mono-num">
            <Spec label={t('section')} value={`${c.crossSectionMm2} mm²`} />
            <Spec label={t('resistance')} value={`${c.resistanceOhmPerKm} Ω/km`} />
            <Spec label={t('allowableCurrent')} value={`${c.currentCarryingCapacityA} A`} />
            <Spec label={t('maxDcVoltage')} value={`${c.maxVoltageDcV} V`} />
            <Spec label={t('standard')} value={c.standard || '—'} mono={false} />
          </dl>
        )}
      />

      {chute && (
        <div className={`mt-4 rounded-md px-4 py-3 text-sm border ${chute.acceptable ? 'border-forest-500 bg-forest-100' : 'border-sun-dark/50 bg-sun/10'}`}>
          {t('cableDropText')} <span className="font-mono-num font-medium">{chute.chutePourcent.toFixed(2)} %</span> ({chute.chuteVoltsV.toFixed(2)} V)
          {!chute.acceptable && ` — ${t('aboveTarget')}`}
          {state.cableChoisi && courantIscChampA > state.cableChoisi.currentCarryingCapacityA && (
            <p className="mt-1 text-alert">
              {t('cableOverload', { current: courantIscChampA.toFixed(1), max: state.cableChoisi.currentCarryingCapacityA })}
            </p>
          )}
        </div>
      )}

      <h3 className="font-display font-medium text-forest-950 mb-3 mt-10">{t('protection')}</h3>
      <div className="rounded-md px-4 py-3 text-sm border border-forest-200 bg-forest-100/40 mb-4">
        {!champDimensionne ? (
          <p>{t('insufficientData')}</p>
        ) : (
          <p>
            {t('protectionCatalog')}{' '}
            <span className="font-mono-num font-medium">
              {protectionRecommandee ? `${protectionRecommandee.manufacturer} ${protectionRecommandee.model} (${protectionRecommandee.ratedCurrentARaw} A)` : t('noProtectionCovers')}
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
        placeholder={t('chooseProtection')}
        renderDetails={(p) => (
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs font-mono-num">
            <Spec label={t('ratingRange')} value={p.ratedCurrentARaw ? `${p.ratedCurrentARaw} A` : '—'} />
            <Spec label={t('maxDcVoltage')} value={`${p.ratedVoltageDcV} V`} />
            <Spec label={t('breakingCapacity')} value={p.breakingCapacitykA ? `${p.breakingCapacitykA} kA` : '—'} />
            <Spec label={t('poles')} value={p.poles ? `${p.poles}` : '—'} />
            <Spec label={t('standard')} value={p.standard || '—'} mono={false} />
          </dl>
        )}
      />

      {protectionChoisie && (
        <div className={`mt-4 rounded-md px-4 py-3 text-sm border ${courantOk && tensionOk ? 'border-forest-500 bg-forest-100' : 'border-alert/50 bg-alert/10'}`}>
          {courantOk && tensionOk
            ? t('protectionOk')
            : t('protectionCheck') + ' ' +
              [
                !courantOk && t('protectionCurrentIssue'),
                !tensionOk && t('protectionVoltageIssue', { voltage: protectionChoisie.ratedVoltageDcV, voc: configPV.vocChamp.toFixed(1) }),
              ]
                .filter(Boolean)
                .join(' et ') +
              '.'}
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <Link to="/resultats" className="bg-forest-900 hover:bg-forest-700 hover:shadow-md text-white font-medium px-5 py-2.5 rounded-md transition-all">
          {t('seeResults')}
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
