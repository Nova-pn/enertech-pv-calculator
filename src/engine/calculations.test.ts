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
