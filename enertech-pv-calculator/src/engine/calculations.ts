import type {
  Appareil,
  Panneau,
  LimitesOnduleurRegulateur,
  ConfigurationPV,
  ParametresBatterie,
  Batterie,
  ConfigurationBatterie,
  Avertissement,
} from '../types';

// ---------------------------------------------------------------------------
// 1. Bilan de consommation
// ---------------------------------------------------------------------------

/** Énergie quotidienne d'un appareil, en Wh. */
export function energieQuotidienneAppareil(a: Appareil): number {
  if (a.puissanceW <= 0 || a.quantite < 1 || a.heuresParJour < 0 || a.heuresParJour > 24) {
    return 0;
  }
  return a.puissanceW * a.quantite * a.heuresParJour * a.coefficient;
}

export interface BilanConsommation {
  puissanceTotaleW: number;
  energieJourWh: number;
  energieMoisWh: number;
  energieAnneeWh: number;
}

export function calculerBilan(appareils: Appareil[]): BilanConsommation {
  const puissanceTotaleW = appareils.reduce((s, a) => s + a.puissanceW * a.quantite, 0);
  const energieJourWh = appareils.reduce((s, a) => s + energieQuotidienneAppareil(a), 0);
  return {
    puissanceTotaleW,
    energieJourWh,
    energieMoisWh: energieJourWh * 30,
    energieAnneeWh: energieJourWh * 365,
  };
}

/** Puissance simultanée = somme des puissances de tous les appareils actifs en même temps (hypothèse majorante). */
export function puissanceSimultanee(appareils: Appareil[]): number {
  return appareils.reduce((s, a) => s + a.puissanceW * a.quantite, 0);
}

// ---------------------------------------------------------------------------
// 2. Puissance photovoltaïque nécessaire
// ---------------------------------------------------------------------------

/** P_PV = E_jour / (HSP × rendement_global), résultat en W. */
export function calculerPuissancePV(energieJourWh: number, hsp: number, rendementGlobal: number): number {
  if (hsp <= 0 || rendementGlobal <= 0 || rendementGlobal > 1) return 0;
  return energieJourWh / (hsp * rendementGlobal);
}

export interface DimensionnementPanneaux {
  puissanceNecessaireW: number;
  nombreTheorique: number;
  nombrePanneaux: number;
  puissanceInstalleeW: number;
  ecartW: number;
  ecartPourcent: number;
}

export function calculerNombrePanneaux(puissanceNecessaireW: number, panneau: Panneau): DimensionnementPanneaux {
  if (panneau.puissanceW <= 0 || puissanceNecessaireW <= 0) {
    return {
      puissanceNecessaireW,
      nombreTheorique: 0,
      nombrePanneaux: 0,
      puissanceInstalleeW: 0,
      ecartW: 0,
      ecartPourcent: 0,
    };
  }
  const nombreTheorique = puissanceNecessaireW / panneau.puissanceW;
  const nombrePanneaux = Math.ceil(nombreTheorique);
  const puissanceInstalleeW = nombrePanneaux * panneau.puissanceW;
  const ecartW = puissanceInstalleeW - puissanceNecessaireW;
  const ecartPourcent = (ecartW / puissanceNecessaireW) * 100;
  return { puissanceNecessaireW, nombreTheorique, nombrePanneaux, puissanceInstalleeW, ecartW, ecartPourcent };
}

// ---------------------------------------------------------------------------
// 3. Configuration série / parallèle du champ PV
// ---------------------------------------------------------------------------

/**
 * Teste toutes les combinaisons série/parallèle raisonnables pour atteindre (au moins)
 * le nombre total de panneaux requis, et retourne la première configuration compatible
 * avec les limites de l'onduleur/régulateur. Si aucune ne convient, retourne la config
 * la plus proche avec les raisons de l'incompatibilité — jamais une fausse compatibilité.
 */
export function trouverConfigurationSeriParallele(
  panneau: Panneau,
  totalPanneauxRequis: number,
  limites: LimitesOnduleurRegulateur
): ConfigurationPV {
  if (totalPanneauxRequis <= 0 || panneau.vmp <= 0 || panneau.voc <= 0) {
    return {
      enSerie: 0,
      enParallele: 0,
      totalPanneaux: 0,
      vmpChamp: 0,
      vocChamp: 0,
      courantChamp: 0,
      puissanceChamp: 0,
      compatible: false,
      raisons: ['Données du panneau ou nombre de panneaux invalides.'],
    };
  }

  const candidats: ConfigurationPV[] = [];
  const maxSerie = Math.max(1, totalPanneauxRequis);

  for (let ns = 1; ns <= maxSerie; ns++) {
    const vocChamp = ns * panneau.voc;
    const vmpChamp = ns * panneau.vmp;
    // Une série est déjà hors-jeu si sa Voc dépasse la tension PV max : inutile de continuer plus haut.
    if (limites.tensionPvMax > 0 && vocChamp > limites.tensionPvMax) break;

    const np = Math.ceil(totalPanneauxRequis / ns);
    const totalPanneaux = ns * np;
    const courantChamp = np * panneau.imp;
    const puissanceChamp = totalPanneaux * panneau.puissanceW;

    const raisons: string[] = [];
    if (limites.tensionPvMax > 0 && vocChamp >= limites.tensionPvMax) {
      raisons.push(
        `Voc du champ PV = ${vocChamp.toFixed(1)} V alors que la tension PV maximale admissible est de ${limites.tensionPvMax} V.`
      );
    }
    if (limites.tensionMpptMin > 0 && vmpChamp < limites.tensionMpptMin) {
      raisons.push(
        `Vmp du champ PV = ${vmpChamp.toFixed(1)} V, inférieur à la tension MPPT minimale de ${limites.tensionMpptMin} V.`
      );
    }
    if (limites.tensionMpptMax > 0 && vmpChamp > limites.tensionMpptMax) {
      raisons.push(
        `Vmp du champ PV = ${vmpChamp.toFixed(1)} V, supérieur à la tension MPPT maximale de ${limites.tensionMpptMax} V.`
      );
    }
    if (limites.courantPvMax > 0 && courantChamp > limites.courantPvMax) {
      raisons.push(
        `Courant du champ PV = ${courantChamp.toFixed(1)} A, supérieur au courant maximal admissible de ${limites.courantPvMax} A.`
      );
    }

    candidats.push({
      enSerie: ns,
      enParallele: np,
      totalPanneaux,
      vmpChamp,
      vocChamp,
      courantChamp,
      puissanceChamp,
      compatible: raisons.length === 0,
      raisons,
    });
  }

  const compatible = candidats.find((c) => c.compatible);
  if (compatible) return compatible;

  if (candidats.length === 0) {
    return {
      enSerie: 0,
      enParallele: 0,
      totalPanneaux: 0,
      vmpChamp: 0,
      vocChamp: 0,
      courantChamp: 0,
      puissanceChamp: 0,
      compatible: false,
      raisons: ['Aucune configuration compatible avec les paramètres saisis.'],
    };
  }

  // Aucune compatible : on retourne celle qui a le moins de problèmes, en étant explicite.
  const meilleure = [...candidats].sort((a, b) => a.raisons.length - b.raisons.length)[0];
  return { ...meilleure, raisons: ['Aucune configuration compatible avec les paramètres saisis.', ...meilleure.raisons] };
}

// ---------------------------------------------------------------------------
// 4. Batterie
// ---------------------------------------------------------------------------

export interface BesoinBatterie {
  energieBatterieWh: number;
  energieBatterieKWh: number;
  capaciteAh: number;
}

/** E_batterie = (E_jour × jours_autonomie) / (DoD × rendement_batterie) ; C_Ah = E_batterie / tension_système */
export function calculerBesoinBatterie(
  energieJourWh: number,
  params: ParametresBatterie,
  tensionSysteme: number
): BesoinBatterie {
  if (params.dod <= 0 || params.dod > 1 || params.rendementBatterie <= 0 || params.rendementBatterie > 1 || tensionSysteme <= 0) {
    return { energieBatterieWh: 0, energieBatterieKWh: 0, capaciteAh: 0 };
  }
  const energieBatterieWh = (energieJourWh * params.autonomieJours) / (params.dod * params.rendementBatterie);
  return {
    energieBatterieWh,
    energieBatterieKWh: energieBatterieWh / 1000,
    capaciteAh: energieBatterieWh / tensionSysteme,
  };
}

/**
 * Détermine une configuration série/parallèle de batteries cohérente avec la tension système
 * et la capacité (Ah) nécessaire — sans jamais arrondir "à l'aveugle".
 */
export function trouverConfigurationBatterie(
  batterie: Batterie,
  capaciteAhRequise: number,
  tensionSysteme: number
): ConfigurationBatterie {
  const raisons: string[] = [];
  if (batterie.tensionNominale <= 0 || batterie.capaciteAh <= 0 || tensionSysteme <= 0 || capaciteAhRequise <= 0) {
    return {
      enSerie: 0,
      enParallele: 0,
      totalBatteries: 0,
      capaciteTotaleAh: 0,
      tensionTotale: 0,
      energieNominaleWh: 0,
      energieUtilisableWh: 0,
      compatible: false,
      raisons: ['Données de batterie invalides ou incomplètes.'],
    };
  }

  const enSerieExact = tensionSysteme / batterie.tensionNominale;
  const enSerie = Math.round(enSerieExact);
  const tensionTotale = enSerie * batterie.tensionNominale;

  if (Math.abs(tensionTotale - tensionSysteme) > 0.01) {
    raisons.push(
      `${enSerie} batterie(s) de ${batterie.tensionNominale} V en série donnent ${tensionTotale} V, ce qui ne correspond pas à la tension système de ${tensionSysteme} V.`
    );
  }

  const enParallele = Math.ceil(capaciteAhRequise / batterie.capaciteAh);
  const totalBatteries = enSerie * enParallele;
  const capaciteTotaleAh = enParallele * batterie.capaciteAh;
  const energieNominaleWh = capaciteTotaleAh * tensionTotale;
  const energieUtilisableWh = energieNominaleWh * batterie.dodRecommande * batterie.rendement;

  return {
    enSerie,
    enParallele,
    totalBatteries,
    capaciteTotaleAh,
    tensionTotale,
    energieNominaleWh,
    energieUtilisableWh,
    compatible: raisons.length === 0,
    raisons,
  };
}

// ---------------------------------------------------------------------------
// 5. Onduleur
// ---------------------------------------------------------------------------

export interface DimensionnementOnduleur {
  puissanceContinueW: number;
  puissanceMinRecommandeeW: number;
  aChargesDemarrage: boolean;
}

/** P_onduleur_min = P_simultanée × (1 + marge) */
export function calculerOnduleur(appareils: Appareil[], margePourcent: number): DimensionnementOnduleur {
  const puissanceContinueW = puissanceSimultanee(appareils);
  const puissanceMinRecommandeeW = puissanceContinueW * (1 + margePourcent / 100);
  const aChargesDemarrage = appareils.some((a) => a.demarrageImportant);
  return { puissanceContinueW, puissanceMinRecommandeeW, aChargesDemarrage };
}

// ---------------------------------------------------------------------------
// 6. Régulateur MPPT
// ---------------------------------------------------------------------------

export interface DimensionnementRegulateur {
  courantTheoriqueA: number;
  courantAvecMargeA: number;
  calibreSuffisant: boolean;
}

/** I_MPPT ≈ P_PV / V_système ; I_recommandé = I_MPPT × (1 + marge) */
export function calculerRegulateur(
  puissancePvW: number,
  tensionSysteme: number,
  margePourcent: number,
  calibreChoisiA: number
): DimensionnementRegulateur {
  if (tensionSysteme <= 0) {
    return { courantTheoriqueA: 0, courantAvecMargeA: 0, calibreSuffisant: false };
  }
  const courantTheoriqueA = puissancePvW / tensionSysteme;
  const courantAvecMargeA = courantTheoriqueA * (1 + margePourcent / 100);
  return {
    courantTheoriqueA,
    courantAvecMargeA,
    calibreSuffisant: calibreChoisiA >= courantAvecMargeA,
  };
}

// ---------------------------------------------------------------------------
// 7. Avertissements consolidés (vert / orange / rouge)
// ---------------------------------------------------------------------------

export function construireAvertissements(args: {
  configPV: ConfigurationPV;
  configBatterie: ConfigurationBatterie;
  onduleur: DimensionnementOnduleur;
  regulateur: DimensionnementRegulateur;
}): Avertissement[] {
  const { configPV, configBatterie, onduleur, regulateur } = args;
  const avertissements: Avertissement[] = [];

  if (configPV.compatible) {
    avertissements.push({
      niveau: 'vert',
      titre: 'Configuration du champ PV acceptable',
      explication: `${configPV.enSerie} panneau(x) en série × ${configPV.enParallele} branche(s) en parallèle respectent les limites de tension et de courant saisies.`,
    });
  } else {
    avertissements.push({
      niveau: 'rouge',
      titre: 'Configuration du champ PV incompatible',
      explication: configPV.raisons.join(' '),
    });
  }

  if (configBatterie.compatible) {
    avertissements.push({
      niveau: 'vert',
      titre: 'Configuration batterie cohérente',
      explication: `${configBatterie.enSerie}S × ${configBatterie.enParallele}P atteint ${configBatterie.tensionTotale} V pour ${configBatterie.capaciteTotaleAh.toFixed(0)} Ah.`,
    });
  } else {
    avertissements.push({
      niveau: 'rouge',
      titre: 'Configuration batterie à corriger',
      explication: configBatterie.raisons.join(' '),
    });
  }

  if (onduleur.aChargesDemarrage) {
    avertissements.push({
      niveau: 'orange',
      titre: 'Charges à démarrage important détectées',
      explication:
        "Un ou plusieurs appareils (réfrigérateur, pompe, moteur, climatiseur…) ont un courant d'appel au démarrage qui n'est pas modélisé ici. Vérifiez la puissance de démarrage réelle dans la fiche technique de l'onduleur avant de valider son dimensionnement.",
    });
  }

  if (regulateur.calibreSuffisant) {
    avertissements.push({
      niveau: 'vert',
      titre: 'Calibre du régulateur suffisant',
      explication: `Le calibre choisi couvre le courant recommandé de ${regulateur.courantAvecMargeA.toFixed(1)} A.`,
    });
  } else {
    avertissements.push({
      niveau: 'rouge',
      titre: 'Calibre du régulateur insuffisant',
      explication: `Le courant recommandé (${regulateur.courantAvecMargeA.toFixed(1)} A, marge incluse) dépasse le calibre choisi. Sélectionnez un calibre supérieur.`,
    });
  }

  return avertissements;
}
