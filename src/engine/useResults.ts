import { useMemo } from 'react';
import type { ProjectState } from '../types';
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
  construireAvertissements,
} from './calculations';
import { parseVoltageRange } from '../data/catalog';

export function useResults(state: ProjectState) {
  return useMemo(() => {
    const tensionSysteme = Number(state.info.tensionSysteme);

    const bilan = calculerBilan(state.appareils);
    const puissancePvW = calculerPuissancePV(bilan.energieJourWh, state.solaire.hsp, state.solaire.rendementGlobal);
    const dimensionnementPanneaux = calculerNombrePanneaux(puissancePvW, state.panneau);
    const mpptRange = parseVoltageRange(state.onduleurChoisi?.mpptVoltageRange);
    const limites = state.info.architectureSysteme === 'Hybride' && state.onduleurChoisi
      ? {
          ...state.limites,
          tensionPvMax: state.onduleurChoisi.maxDcVoltage ?? state.limites.tensionPvMax,
          tensionMpptMin: mpptRange?.min ?? state.limites.tensionMpptMin,
          tensionMpptMax: mpptRange?.max ?? state.limites.tensionMpptMax,
          courantPvMax: state.onduleurChoisi.maxShortCircuitCurrent ?? state.limites.courantPvMax,
        }
      : state.limites;
    const configPV = trouverConfigurationSeriParallele(state.panneau, dimensionnementPanneaux.nombrePanneaux, limites);
    const besoinBatterie = calculerBesoinBatterie(bilan.energieJourWh, state.batterieParams, tensionSysteme);
    const configBatterie = trouverConfigurationBatterie(state.batterie, besoinBatterie.capaciteAh, tensionSysteme);
    const onduleur = calculerOnduleur(state.appareils, state.onduleurParams.margePourcent);

    const courantIscChampA = configPV.enParallele * state.panneau.isc;

    const regulateur =
      state.regulateurParams.type === 'PWM'
        ? calculerRegulateurPWM(courantIscChampA, state.regulateurParams.margePourcent, state.regulateurParams.calibreChoisi)
        : calculerRegulateur(
            dimensionnementPanneaux.puissanceInstalleeW,
            tensionSysteme,
            state.regulateurParams.margePourcent,
            state.regulateurParams.calibreChoisi
          );

    const chuteDeTension = state.cableChoisi
      ? calculerChuteDeTension(
          state.cablage.longueurAllerM,
          courantIscChampA,
          state.cableChoisi.resistanceOhmPerKm,
          configPV.vmpChamp || tensionSysteme,
          state.cablage.chuteTensionMaxPourcent
        )
      : null;

    const calibreProtectionCalc = calculerCalibreProtection(courantIscChampA);
    const calibreProtection = state.protectionChoisie
      ? {
          recommandeA: calibreProtectionCalc.calibreRecommandeA,
          choisi: {
            min: state.protectionChoisie.ratedCurrentMinA,
            max: state.protectionChoisie.ratedCurrentMaxA,
            tensionV: state.protectionChoisie.ratedVoltageDcV,
          },
          vocChampV: configPV.vocChamp,
        }
      : null;

    const avertissements = construireAvertissements({
      configPV,
      configBatterie,
      onduleur,
      regulateur,
      regulateurType: state.regulateurParams.type,
      chuteDeTension,
      calibreProtection,
    });

    return {
      bilan,
      puissancePvW,
      dimensionnementPanneaux,
      configPV,
      besoinBatterie,
      configBatterie,
      onduleur,
      regulateur,
      courantIscChampA,
      chuteDeTension,
      calibreProtectionRecommandeeA: calibreProtectionCalc.calibreRecommandeA,
      avertissements,
    };
  }, [state]);
}

export type Results = ReturnType<typeof useResults>;
