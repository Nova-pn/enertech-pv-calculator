import panelsRaw from './panels.json';
import batteriesRaw from './batteries.json';
import invertersRaw from './inverters.json';
import regulatorsRaw from './regulators.json';
import cablesRaw from './cables.json';
import protectionsRaw from './protections.json';

export interface PanelCatalogItem {
  id: string;
  manufacturer: string;
  model: string;
  technology: string;
  powerWp: number;
  voc: number;
  vmp: number;
  isc: number;
  imp: number;
  powerTolerance?: string;
  vocTempCoefficient?: string;
  pmaxTempCoefficient?: string;
  operatingTemperature?: string;
  dimensions?: string;
  weightKg?: number;
  cellCount?: string;
  moduleType?: string;
  bifacial?: boolean;
  markets?: string[];
  sourceUrl?: string;
  sourceDocuments?: string[];
  sourcePages?: string;
  reviewFlags?: string[];
  verificationLevel?: string;
}

export interface BatteryCatalogItem {
  id: string;
  manufacturer: string;
  model: string;
  technology: string;
  nominalVoltage: number | null;
  nominalCapacityAh: number | null;
  nominalEnergyKWh: number | null;
  usableEnergyKWh?: number | null;
  maxDoD: number | null; // en %, seulement si explicitement qualifié comme maximum
  recommendedChargeCurrent?: number | null;
  maxChargeCurrent?: number | null;
  maxDischargeCurrent?: number | null;
  peakDischargeCurrent?: number | null;
  peakDuration?: string;
  maxPower?: number | null;
  cycleLife?: number | null;
  operatingTemperature?: string;
  dimensions?: string;
  weightKg?: number;
  communicationBMS?: string;
  markets?: string[];
  sourceUrl?: string;
  sourceDocuments?: string[];
  sourcePages?: string;
  reviewFlags?: string[];
  verificationLevel?: string;
}

export interface InverterCatalogItem {
  id: string;
  manufacturer: string;
  model: string;
  type: string;
  topology?: string;
  nominalPowerW: number;
  maxPvPowerW: number;
  maxAcPowerW: number;
  maxEfficiency?: number;
  euroEfficiency?: number;
  mpptCount?: number;
  maxDcVoltage?: number;
  mpptVoltageRange?: string;
  startVoltage?: number;
  maxDcCurrentPerMppt?: number;
  maxShortCircuitCurrent?: number;
  stringsPerMppt?: number;
  batteryVoltageRange?: string;
  maxBatteryChargeCurrent?: number;
  backupPower?: boolean;
  operatingTemperature?: string;
  dimensions?: string;
  weightKg?: number;
  protectionClass?: string;
  cooling?: string;
  communication?: string;
  markets?: string[];
  sourceUrl?: string;
  sourceDocuments?: string[];
  sourcePages?: string;
  reviewFlags?: string[];
  verificationLevel?: string;
}

export interface RegulatorCatalogItem {
  id: string;
  type: 'MPPT' | 'PWM';
  manufacturer: string;
  model: string;
  batteryVoltage?: string;
  maxChargeCurrentA: number;
  maxPvVoltageV: number | string | null;
  maxPvVoltageVRaw?: string;
  maxPvPowerW12v?: number | null;
  maxPvPowerW24v?: number | null;
  maxPvPowerW48v?: number | null;
  maxPvPowerWRaw?: string;
  maxEfficiencyPct?: number | null;
  trackingMpptPct?: number;
  chargeAlgorithm?: string;
  mainProtections?: string;
  communication?: string;
  operatingTemperature?: string;
  dimensions?: string;
  weightKg?: number;
  ip?: string;
  cooling?: string;
  markets?: string | string[];
  sourceUrl?: string | null;
  sourceDocuments?: string[];
  sourcePages?: string;
  reviewFlags?: string[];
  verificationLevel?: string;
}

export interface CableCatalogItem {
  id: string;
  manufacturer: string;
  model: string;
  crossSectionMm2: number;
  maxVoltageDcV: number;
  resistanceOhmPerKm: number;
  currentCarryingCapacityA: number;
  temperatureRange?: string;
  standard?: string;
  markets?: string[];
  sourceUrl?: string;
  verificationLevel?: string;
}

export interface ProtectionCatalogItem {
  id: string;
  manufacturer: string;
  model: string;
  ratedCurrentARaw?: string;
  ratedCurrentMinA: number | null;
  ratedCurrentMaxA: number | null;
  ratedVoltageDcV: number;
  breakingCapacitykA?: number;
  poles?: number;
  standard?: string;
  markets?: string[];
  sourceUrl?: string;
  verificationLevel?: string;
}

/** Normalise fabricant/modèle afin qu'une même fiche ne soit jamais exposée deux fois. */
export function normalizeCatalogKey(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function deduplicateCatalogItems<T extends { id: string; manufacturer: string; model: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${normalizeCatalogKey(item.manufacturer)}::${normalizeCatalogKey(item.model)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const panelCatalog = deduplicateCatalogItems((panelsRaw as { panels: PanelCatalogItem[] }).panels);
export const batteryCatalog = deduplicateCatalogItems((batteriesRaw as { batteries: BatteryCatalogItem[] }).batteries);
export const inverterCatalog = deduplicateCatalogItems((invertersRaw as { inverters: InverterCatalogItem[] }).inverters);
export const regulatorCatalog = deduplicateCatalogItems((regulatorsRaw as { regulateurs: RegulatorCatalogItem[] }).regulateurs);
export const cableCatalog = (cablesRaw as { cables: CableCatalogItem[] }).cables;
export const protectionCatalog = (protectionsRaw as { protections: ProtectionCatalogItem[] }).protections;

/** Mappe la technologie du catalogue batterie vers l'enum utilisé par le moteur de calcul, sans inventer de valeur. */
export function mapBatteryTechnology(tech: string): 'Lithium' | 'AGM' | 'GEL' | 'Plomb' | 'Autre' {
  const t = tech.toLowerCase();
  if (t.includes('lifepo4') || t.includes('lithium') || t.includes('li-ion')) return 'Lithium';
  if (t.includes('agm')) return 'AGM';
  if (t.includes('gel')) return 'GEL';
  if (t.includes('plomb') || t.includes('lead') || t.includes('flooded') || t.includes('opzs')) return 'Plomb';
  return 'Autre';
}

/** Câble le plus petit du catalogue dont la section couvre la section théorique calculée. Ne choisit jamais une section inférieure. */
export function selectionnerCableRecommande(items: CableCatalogItem[], sectionTheoriqueMm2: number): CableCatalogItem | null {
  const candidats = items.filter((c) => c.crossSectionMm2 >= sectionTheoriqueMm2).sort((a, b) => a.crossSectionMm2 - b.crossSectionMm2);
  return candidats[0] ?? null;
}

/** Protection la plus proche du catalogue dont la plage de calibre couvre le courant recommandé. */
export function selectionnerProtectionRecommandee(items: ProtectionCatalogItem[], calibreRecommandeA: number): ProtectionCatalogItem | null {
  const candidats = items
    .filter((p) => p.ratedCurrentMaxA !== null && p.ratedCurrentMaxA >= calibreRecommandeA)
    .sort((a, b) => (a.ratedCurrentMaxA as number) - (b.ratedCurrentMaxA as number));
  return candidats[0] ?? null;
}

/** Extrait une plage numérique simple telle que « 65-530 V » sans compléter les données absentes. */
export function parseVoltageRange(value?: string): { min: number; max: number } | null {
  if (!value) return null;
  const numbers = value.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  return numbers.length >= 2 ? { min: numbers[0], max: numbers[1] } : null;
}
