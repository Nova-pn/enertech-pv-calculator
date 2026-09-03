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
  construireAvertissements,
} from './calculations';

export function useResults(state: ProjectState) {
  return useMemo(() => {
    const bilan = calculerBilan(state.appareils);
    const puissancePvW = calculerPuissancePV(bilan.energieJourWh, state.solaire.hsp, state.solaire.rendementGlobal);
    const dimensionnementPanneaux = calculerNombrePanneaux(puissancePvW, state.panneau);
    const configPV = trouverConfigurationSeriParallele(
      state.panneau,
      dimensionnementPanneaux.nombrePanneaux,
      state.limites
    );
    const besoinBatterie = calculerBesoinBatterie(
      bilan.energieJourWh,
      state.batterieParams,
      Number(state.info.tensionSysteme)
    );
    const configBatterie = trouverConfigurationBatterie(
      state.batterie,
      besoinBatterie.capaciteAh,
      Number(state.info.tensionSysteme)
    );
    const onduleur = calculerOnduleur(state.appareils, state.onduleurParams.margePourcent);
    const regulateur = calculerRegulateur(
      dimensionnementPanneaux.puissanceInstalleeW,
      Number(state.info.tensionSysteme),
      state.regulateurParams.margePourcent,
      state.regulateurParams.calibreChoisi
    );
    const avertissements = construireAvertissements({ configPV, configBatterie, onduleur, regulateur });

    return {
      bilan,
      puissancePvW,
      dimensionnementPanneaux,
      configPV,
      besoinBatterie,
      configBatterie,
      onduleur,
      regulateur,
      avertissements,
    };
  }, [state]);
}

export type Results = ReturnType<typeof useResults>;
