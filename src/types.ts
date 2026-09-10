import type {
  PanelCatalogItem,
  BatteryCatalogItem,
  InverterCatalogItem,
  RegulatorCatalogItem,
  CableCatalogItem,
  ProtectionCatalogItem,
} from './data/catalog';

export type TensionSysteme = 12 | 24 | 48 | number;

export interface ProjectInfo {
  nomProjet: string;
  nomClient: string;
  localisation: string;
  typeInstallation: 'Résidentielle' | 'Commerciale' | 'Site isolé' | 'Système hybride' | 'Autre';
  tensionSysteme: TensionSysteme;
  objectif: 'Autoconsommation' | 'Site isolé' | 'Secours' | 'Système hybride';
  architectureSysteme: 'Simple' | 'Hybride';
}

export interface Appareil {
  id: string;
  nom: string;
  puissanceW: number;
  quantite: number;
  heuresParJour: number;
  coefficient: number;
  demarrageImportant: boolean;
  /** Puissance de démarrage en W, connue explicitement — jamais déduite du nom de l'appareil. undefined/null = non renseignée. */
  puissanceDemarrageW: number | null;
}

export interface ParametresSolaires {
  hsp: number;
  rendementGlobal: number;
}

export interface Panneau {
  puissanceW: number;
  voc: number;
  vmp: number;
  isc: number;
  imp: number;
}

export interface LimitesOnduleurRegulateur {
  tensionPvMax: number;
  tensionMpptMin: number;
  tensionMpptMax: number;
  courantPvMax: number;
}

export interface ParametresBatterie {
  autonomieJours: number;
  dod: number;
  rendementBatterie: number;
}

export interface Batterie {
  tensionNominale: number;
  capaciteAh: number;
  technologie: 'Lithium' | 'AGM' | 'GEL' | 'Plomb' | 'Autre';
  dodRecommande: number;
  rendement: number;
}

export interface ParametresOnduleur {
  margePourcent: number;
}

export interface ParametresRegulateur {
  type: 'MPPT' | 'PWM';
  margePourcent: number;
  calibreChoisi: number;
}

export interface ParametresCablage {
  longueurAllerM: number;
  chuteTensionMaxPourcent: number;
}

export interface ConfigurationPV {
  enSerie: number;
  enParallele: number;
  totalPanneaux: number;
  vmpChamp: number;
  vocChamp: number;
  courantChamp: number;
  puissanceChamp: number;
  compatible: boolean;
  raisons: string[];
}

export interface ConfigurationBatterie {
  enSerie: number;
  enParallele: number;
  totalBatteries: number;
  capaciteTotaleAh: number;
  tensionTotale: number;
  energieNominaleWh: number;
  energieUtilisableWh: number;
  compatible: boolean;
  raisons: string[];
}

export type NiveauValidation = 'vert' | 'orange' | 'rouge';

export interface Avertissement {
  niveau: NiveauValidation;
  titre: string;
  explication: string;
}

export interface ProjectState {
  info: ProjectInfo;
  appareils: Appareil[];
  solaire: ParametresSolaires;
  panneau: Panneau;
  panneauChoisi: PanelCatalogItem | null;
  limites: LimitesOnduleurRegulateur;
  batterieParams: ParametresBatterie;
  batterie: Batterie;
  batterieChoisie: BatteryCatalogItem | null;
  onduleurParams: ParametresOnduleur;
  onduleurChoisi: InverterCatalogItem | null;
  regulateurParams: ParametresRegulateur;
  regulateurChoisi: RegulatorCatalogItem | null;
  cablage: ParametresCablage;
  cableChoisi: CableCatalogItem | null;
  protectionChoisie: ProtectionCatalogItem | null;
}
