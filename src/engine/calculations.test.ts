import { describe, it, expect } from 'vitest';
import {
  calculerBilan,
  calculerPuissancePV,
  calculerNombrePanneaux,
  trouverConfigurationSeriParallele,
  calculerBesoinBatterie,
  trouverConfigurationBatterie,
  calculerOnduleur,
  calculerRegulateur,
  calculerRegulateurPWM,
  calculerChuteDeTension,
  calculerCalibreProtection,
  calculerSectionTheorique,
  selectionnerSectionNormalisee,
  selectionnerCalibreNormalise,
  RESISTIVITE_CUIVRE_OHM_MM2_PAR_M,
  energieQuotidienneAppareil,
} from './calculations';
import type { Appareil, Panneau, LimitesOnduleurRegulateur, Batterie } from '../types';

const appareil = (over: Partial<Appareil> = {}): Appareil => ({
  id: '1',
  nom: 'Réfrigérateur',
  puissanceW: 150,
  quantite: 1,
  heuresParJour: 10,
  coefficient: 1,
  demarrageImportant: false,
  ...over,
});

describe('bilan énergétique', () => {
  it("calcule l'énergie quotidienne d'un appareil selon la formule P × Q × h × coeff", () => {
    expect(energieQuotidienneAppareil(appareil())).toBe(1500);
  });

  it('renvoie 0 pour une puissance négative ou nulle', () => {
    expect(energieQuotidienneAppareil(appareil({ puissanceW: 0 }))).toBe(0);
    expect(energieQuotidienneAppareil(appareil({ puissanceW: -10 }))).toBe(0);
  });

  it('renvoie 0 pour des heures hors de la plage 0-24', () => {
    expect(energieQuotidienneAppareil(appareil({ heuresParJour: 25 }))).toBe(0);
    expect(energieQuotidienneAppareil(appareil({ heuresParJour: -1 }))).toBe(0);
  });

  it('agrège plusieurs appareils et dérive mois/année', () => {
    const bilan = calculerBilan([appareil(), appareil({ id: '2', puissanceW: 60, heuresParJour: 5 })]);
    expect(bilan.energieJourWh).toBe(1500 + 300);
    expect(bilan.energieMoisWh).toBe(bilan.energieJourWh * 30);
    expect(bilan.energieAnneeWh).toBe(bilan.energieJourWh * 365);
  });

  it("une quantité de 0 (nouvelle ligne) ne provoque pas d'erreur et compte pour une énergie nulle", () => {
    const bilan = calculerBilan([appareil({ quantite: 0, puissanceW: 100 }), appareil({ id: '2', quantite: 2 })]);
    expect(bilan.energieJourWh).toBe(3000); // seul le 2e appareil (quantite 2 au lieu de 1) compte
    expect(Number.isNaN(bilan.energieJourWh)).toBe(false);
  });

  it('une quantité en cours de saisie (NaN, champ momentanément vide) ne casse pas les totaux', () => {
    const bilan = calculerBilan([appareil({ quantite: NaN }), appareil({ id: '2' })]);
    expect(Number.isNaN(bilan.energieJourWh)).toBe(false);
    expect(Number.isNaN(bilan.puissanceTotaleW)).toBe(false);
    expect(bilan.energieJourWh).toBe(1500); // seul le 2e appareil (quantite valide) compte
  });

  it('la modification de la quantité met à jour le calcul en conséquence', () => {
    const bilanAvant = calculerBilan([appareil({ quantite: 1 })]);
    const bilanApres = calculerBilan([appareil({ quantite: 3 })]);
    expect(bilanApres.energieJourWh).toBe(bilanAvant.energieJourWh * 3);
  });
});

describe('puissance PV', () => {
  it('applique P_PV = E_jour / (HSP × rendement)', () => {
    expect(calculerPuissancePV(5000, 5, 0.75)).toBeCloseTo(5000 / (5 * 0.75), 5);
  });

  it('renvoie 0 si HSP ou rendement invalides', () => {
    expect(calculerPuissancePV(5000, 0, 0.75)).toBe(0);
    expect(calculerPuissancePV(5000, 5, 1.2)).toBe(0);
  });
});

describe('nombre de panneaux', () => {
  const panneau: Panneau = { puissanceW: 550, voc: 49.5, vmp: 41.5, isc: 14.0, imp: 13.3 };

  it('arrondit toujours le nombre de panneaux vers le haut', () => {
    const res = calculerNombrePanneaux(1333, panneau);
    expect(res.nombreTheorique).toBeCloseTo(1333 / 550, 5);
    expect(res.nombrePanneaux).toBe(3);
    expect(res.puissanceInstalleeW).toBe(3 * 550);
  });

  it('gère une puissance nécessaire nulle sans planter', () => {
    const res = calculerNombrePanneaux(0, panneau);
    expect(res.nombrePanneaux).toBe(0);
  });
});

describe('configuration série/parallèle du champ PV', () => {
  const panneau: Panneau = { puissanceW: 550, voc: 49.5, vmp: 41.5, isc: 14.0, imp: 13.3 };

  it('trouve une configuration compatible quand les limites le permettent', () => {
    const limites: LimitesOnduleurRegulateur = {
      tensionPvMax: 500,
      tensionMpptMin: 100,
      tensionMpptMax: 450,
      courantPvMax: 30,
    };
    const config = trouverConfigurationSeriParallele(panneau, 8, limites);
    expect(config.compatible).toBe(true);
    expect(config.totalPanneaux).toBeGreaterThanOrEqual(8);
    expect(config.vocChamp).toBeLessThan(limites.tensionPvMax);
  });

  it("signale clairement l'absence de configuration compatible sans jamais l'inventer", () => {
    const limitesImpossibles: LimitesOnduleurRegulateur = {
      tensionPvMax: 60, // inférieur à la Voc d'un seul panneau
      tensionMpptMin: 10,
      tensionMpptMax: 50,
      courantPvMax: 30,
    };
    const config = trouverConfigurationSeriParallele(panneau, 8, limitesImpossibles);
    expect(config.compatible).toBe(false);
    expect(config.raisons.length).toBeGreaterThan(0);
  });
});

describe('batterie', () => {
  it('calcule le besoin énergétique et la capacité Ah', () => {
    const res = calculerBesoinBatterie(5000, { autonomieJours: 2, dod: 0.5, rendementBatterie: 0.95 }, 48);
    const attendu = (5000 * 2) / (0.5 * 0.95);
    expect(res.energieBatterieWh).toBeCloseTo(attendu, 5);
    expect(res.capaciteAh).toBeCloseTo(attendu / 48, 5);
  });

  it('renvoie 0 pour un DoD ou un rendement hors plage', () => {
    expect(calculerBesoinBatterie(5000, { autonomieJours: 2, dod: 0, rendementBatterie: 0.95 }, 48).energieBatterieWh).toBe(0);
  });

  it('trouve une configuration série/parallèle cohérente avec la tension système', () => {
    const batterie: Batterie = {
      tensionNominale: 12,
      capaciteAh: 200,
      technologie: 'AGM',
      dodRecommande: 0.5,
      rendement: 0.9,
    };
    const config = trouverConfigurationBatterie(batterie, 450, 48);
    expect(config.enSerie).toBe(4); // 4 × 12V = 48V
    expect(config.enParallele).toBe(Math.ceil(450 / 200));
    expect(config.compatible).toBe(true);
  });

  it('signale une incohérence de tension au lieu de la masquer', () => {
    const batterie: Batterie = {
      tensionNominale: 12,
      capaciteAh: 200,
      technologie: 'AGM',
      dodRecommande: 0.5,
      rendement: 0.9,
    };
    // 48V / 12V = 4 exact, donc pour tester l'incohérence on prend une tension système non multiple
    const config = trouverConfigurationBatterie(batterie, 200, 50);
    expect(config.compatible).toBe(false);
  });
});

describe('onduleur', () => {
  it('applique la marge sur la puissance simultanée', () => {
    const res = calculerOnduleur([appareil({ puissanceW: 1000, quantite: 1 })], 20);
    expect(res.puissanceContinueW).toBe(1000);
    expect(res.puissanceMinRecommandeeW).toBe(1200);
  });

  it('détecte les charges à démarrage important sans inventer de courant de démarrage', () => {
    const res = calculerOnduleur([appareil({ demarrageImportant: true })], 20);
    expect(res.aChargesDemarrage).toBe(true);
  });
});

describe('régulateur PWM', () => {
  it("calcule le courant recommandé à partir de l'Isc du champ, pas de la puissance", () => {
    const res = calculerRegulateurPWM(20, 25, 30);
    expect(res.courantIscChampA).toBe(20);
    expect(res.courantAvecMargeA).toBeCloseTo(25, 5);
    expect(res.calibreSuffisant).toBe(true);
  });

  it('signale un calibre insuffisant', () => {
    const res = calculerRegulateurPWM(20, 25, 20);
    expect(res.calibreSuffisant).toBe(false);
  });
});

describe('chute de tension du câblage DC', () => {
  it('applique ΔV = 2 × L × I × R/1000', () => {
    const res = calculerChuteDeTension(10, 20, 5, 400, 3);
    const attendu = (2 * 10 * 20 * 5) / 1000;
    expect(res.chuteVoltsV).toBeCloseTo(attendu, 5);
    expect(res.chutePourcent).toBeCloseTo((attendu / 400) * 100, 5);
  });

  it('signale une chute au-dessus du seuil visé', () => {
    const res = calculerChuteDeTension(100, 30, 10, 48, 3);
    expect(res.acceptable).toBe(false);
  });

  it('ne plante pas sur une longueur ou un courant nul', () => {
    const res = calculerChuteDeTension(0, 20, 5, 400, 3);
    expect(res.chuteVoltsV).toBe(0);
    expect(res.acceptable).toBe(true);
  });
});

describe('calibre de protection DC', () => {
  it('applique 1,25 × Isc du champ', () => {
    expect(calculerCalibreProtection(20).calibreRecommandeA).toBeCloseTo(25, 5);
  });
});

describe('section de câble théorique et sélection normalisée', () => {
  it('applique S = (2 × L × I × ρ) / ΔV avec la résistivité du cuivre par défaut', () => {
    const s = calculerSectionTheorique(10, 20, 4, 0.0175);
    expect(s).toBeCloseTo((2 * 10 * 20 * 0.0175) / 4, 6);
  });

  it("prend en compte l'aller-retour (facteur 2) et pas seulement la longueur aller", () => {
    const sAllerRetour = calculerSectionTheorique(10, 20, 4)!;
    const sSansFacteur = (10 * 20 * RESISTIVITE_CUIVRE_OHM_MM2_PAR_M) / 4;
    expect(sAllerRetour).toBeCloseTo(sSansFacteur * 2, 6);
  });

  it('renvoie null (jamais 0 déguisé en résultat) si une donnée nécessaire est absente', () => {
    expect(calculerSectionTheorique(0, 20, 4)).toBeNull();
    expect(calculerSectionTheorique(10, 0, 4)).toBeNull();
    expect(calculerSectionTheorique(10, 20, 0)).toBeNull();
    expect(calculerSectionTheorique(NaN, 20, 4)).toBeNull();
  });

  it('sélectionne la première section normalisée supérieure ou égale, jamais inférieure', () => {
    expect(selectionnerSectionNormalisee(5.8, [4, 6, 10])).toBe(6);
    expect(selectionnerSectionNormalisee(6, [4, 6, 10])).toBe(6);
    expect(selectionnerSectionNormalisee(12, [4, 6, 10])).toBeNull();
  });

  it('sélectionne le premier calibre normalisé supérieur ou égal, jamais inférieur', () => {
    expect(selectionnerCalibreNormalise(26, [10, 20, 32, 40])).toBe(32);
    expect(selectionnerCalibreNormalise(32, [10, 20, 32, 40])).toBe(32);
    expect(selectionnerCalibreNormalise(100, [10, 20, 32, 40])).toBeNull();
  });
});

describe("exemple de référence PWM (Isc 13 A, 2 strings, marge 25 %)", () => {
  it('reproduit exactement 26 A puis 32,5 A recommandés', () => {
    const iscTotal = 13 * 2;
    expect(iscTotal).toBe(26);
    const res = calculerRegulateurPWM(iscTotal, 25, 40);
    expect(res.courantAvecMargeA).toBeCloseTo(32.5, 5);
  });
});
describe('régulateur MPPT', () => {
  it('calcule le courant théorique et le courant avec marge', () => {
    const res = calculerRegulateur(2500, 48, 25, 80);
    expect(res.courantTheoriqueA).toBeCloseTo(2500 / 48, 5);
    expect(res.courantAvecMargeA).toBeCloseTo((2500 / 48) * 1.25, 5);
    expect(res.calibreSuffisant).toBe(true);
  });

  it('signale un calibre insuffisant', () => {
    const res = calculerRegulateur(2500, 12, 25, 40);
    expect(res.calibreSuffisant).toBe(false);
  });

  it('ne divise jamais par zéro sur une tension système nulle', () => {
    const res = calculerRegulateur(2500, 0, 25, 60);
    expect(res.courantTheoriqueA).toBe(0);
    expect(res.calibreSuffisant).toBe(false);
  });
});
