import type { Language } from './index';
import { translate } from './index';

export function localizeCalculationText(language: Language, text: string): string {
  const t = (key: string, vars: Record<string, string | number> = {}) => translate(language, key, vars);
  if (text === 'Aucune configuration compatible avec les paramètres saisis.') return t('calcNoCompatible');
  if (text === 'Données du panneau ou nombre de panneaux invalides.') return t('calcInvalidPanel');
  if (text === 'Données de batterie invalides ou incomplètes.') return t('calcInvalidBattery');
  const pvMax = text.match(/^Voc du champ PV = ([\d.]+) V alors que la tension PV maximale admissible est de ([\d.]+) V\.$/);
  if (pvMax) return t('calcVocTooHigh', { actual: pvMax[1], max: pvMax[2] });
  const mpptMin = text.match(/^Vmp du champ PV = ([\d.]+) V, inférieur à la tension MPPT minimale de ([\d.]+) V\.$/);
  if (mpptMin) return t('calcVmpTooLow', { actual: mpptMin[1], min: mpptMin[2] });
  const mpptMax = text.match(/^Vmp du champ PV = ([\d.]+) V, supérieur à la tension MPPT maximale de ([\d.]+) V\.$/);
  if (mpptMax) return t('calcVmpTooHigh', { actual: mpptMax[1], max: mpptMax[2] });
  const currentMax = text.match(/^Courant du champ PV = ([\d.]+) A, supérieur au courant maximal admissible de ([\d.]+) A\.$/);
  if (currentMax) return t('calcCurrentTooHigh', { actual: currentMax[1], max: currentMax[2] });
  const batteryMismatch = text.match(/^(\d+) batterie\(s\) de ([\d.]+) V en série donnent ([\d.]+) V, ce qui ne correspond pas à la tension système de ([\d.]+) V\.$/);
  if (batteryMismatch) return t('calcBatteryMismatch', { count: batteryMismatch[1], nominal: batteryMismatch[2], actual: batteryMismatch[3], system: batteryMismatch[4] });
  return text;
}

export function localizeWarning(language: Language, title: string, explanation: string) {
  const t = (key: string, vars: Record<string, string | number> = {}) => translate(language, key, vars);
  let localizedTitle = title;
  let localizedExplanation = localizeCalculationText(language, explanation);
  if (title === 'Configuration batterie cohérente') {
    localizedTitle = t('warningBatteryOk');
    const m = explanation.match(/^(\d+)S × (\d+)P atteint ([\d.]+) V pour ([\d.]+) Ah\.$/);
    if (m) localizedExplanation = t('warningBatteryOkText', { series: m[1], parallel: m[2], voltage: m[3], capacity: m[4] });
  } else if (title === 'Configuration batterie à corriger') {
    localizedTitle = t('warningBatteryFix');
  } else if (title === 'Charges à démarrage important détectées') {
    localizedTitle = t('warningStartup');
    localizedExplanation = t('warningStartupText');
  } else if (title.startsWith('Calibre du ') && title.endsWith(' suffisant')) {
    localizedTitle = t('warningControllerOk', { controller: title.replace(/^Calibre du | suffisant$/g, '') });
    const m = explanation.match(/([\d.]+) A/);
    localizedExplanation = m ? t('warningControllerOkText', { current: m[1] }) : explanation;
  } else if (title.startsWith('Calibre du ') && title.endsWith(' insuffisant')) {
    localizedTitle = t('warningControllerLow', { controller: title.replace(/^Calibre du | insuffisant$/g, '') });
    const m = explanation.match(/\(([\d.]+) A.*?calibre choisi/);
    localizedExplanation = m ? t('warningControllerLowText', { current: m[1] }) : explanation;
  } else if (title === 'Chute de tension du câblage acceptable') {
    localizedTitle = t('warningVoltageDropOk');
  } else if (title === 'Chute de tension du câblage élevée') {
    localizedTitle = t('warningVoltageDropHigh');
  } else if (title === 'Protection DC à revoir') {
    localizedTitle = t('warningProtectionReview');
  }
  return { title: localizedTitle, explanation: localizedExplanation };
}
