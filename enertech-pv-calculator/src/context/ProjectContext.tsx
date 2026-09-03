import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ProjectState, Appareil } from '../types';

const defaultState: ProjectState = {
  info: {
    nomProjet: '',
    nomClient: '',
    localisation: '',
    typeInstallation: 'Résidentielle',
    tensionSysteme: 24,
    objectif: 'Autoconsommation',
  },
  appareils: [
    { id: crypto.randomUUID(), nom: 'Réfrigérateur', puissanceW: 150, quantite: 1, heuresParJour: 10, coefficient: 1, demarrageImportant: true },
    { id: crypto.randomUUID(), nom: 'Ampoule LED', puissanceW: 10, quantite: 6, heuresParJour: 6, coefficient: 1, demarrageImportant: false },
  ],
  solaire: { hsp: 5, rendementGlobal: 0.75 },
  panneau: { puissanceW: 550, voc: 49.5, vmp: 41.5, isc: 14.0, imp: 13.3 },
  limites: { tensionPvMax: 500, tensionMpptMin: 120, tensionMpptMax: 450, courantPvMax: 30 },
  batterieParams: { autonomieJours: 1, dod: 0.5, rendementBatterie: 0.95 },
  batterie: { tensionNominale: 12, capaciteAh: 200, technologie: 'AGM', dodRecommande: 0.5, rendement: 0.9 },
  onduleurParams: { margePourcent: 20 },
  regulateurParams: { margePourcent: 25, calibreChoisi: 60 },
};

interface ProjectContextValue {
  state: ProjectState;
  setState: React.Dispatch<React.SetStateAction<ProjectState>>;
  updateInfo: (patch: Partial<ProjectState['info']>) => void;
  updateSolaire: (patch: Partial<ProjectState['solaire']>) => void;
  updatePanneau: (patch: Partial<ProjectState['panneau']>) => void;
  updateLimites: (patch: Partial<ProjectState['limites']>) => void;
  updateBatterieParams: (patch: Partial<ProjectState['batterieParams']>) => void;
  updateBatterie: (patch: Partial<ProjectState['batterie']>) => void;
  updateOnduleurParams: (patch: Partial<ProjectState['onduleurParams']>) => void;
  updateRegulateurParams: (patch: Partial<ProjectState['regulateurParams']>) => void;
  addAppareil: () => void;
  updateAppareil: (id: string, patch: Partial<Appareil>) => void;
  removeAppareil: (id: string) => void;
  reset: () => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProjectState>(defaultState);

  const updateInfo: ProjectContextValue['updateInfo'] = (patch) =>
    setState((s) => ({ ...s, info: { ...s.info, ...patch } }));
  const updateSolaire: ProjectContextValue['updateSolaire'] = (patch) =>
    setState((s) => ({ ...s, solaire: { ...s.solaire, ...patch } }));
  const updatePanneau: ProjectContextValue['updatePanneau'] = (patch) =>
    setState((s) => ({ ...s, panneau: { ...s.panneau, ...patch } }));
  const updateLimites: ProjectContextValue['updateLimites'] = (patch) =>
    setState((s) => ({ ...s, limites: { ...s.limites, ...patch } }));
  const updateBatterieParams: ProjectContextValue['updateBatterieParams'] = (patch) =>
    setState((s) => ({ ...s, batterieParams: { ...s.batterieParams, ...patch } }));
  const updateBatterie: ProjectContextValue['updateBatterie'] = (patch) =>
    setState((s) => ({ ...s, batterie: { ...s.batterie, ...patch } }));
  const updateOnduleurParams: ProjectContextValue['updateOnduleurParams'] = (patch) =>
    setState((s) => ({ ...s, onduleurParams: { ...s.onduleurParams, ...patch } }));
  const updateRegulateurParams: ProjectContextValue['updateRegulateurParams'] = (patch) =>
    setState((s) => ({ ...s, regulateurParams: { ...s.regulateurParams, ...patch } }));

  const addAppareil = () =>
    setState((s) => ({
      ...s,
      appareils: [
        ...s.appareils,
        { id: crypto.randomUUID(), nom: 'Nouvel appareil', puissanceW: 0, quantite: 1, heuresParJour: 1, coefficient: 1, demarrageImportant: false },
      ],
    }));

  const updateAppareil = (id: string, patch: Partial<Appareil>) =>
    setState((s) => ({ ...s, appareils: s.appareils.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));

  const removeAppareil = (id: string) =>
    setState((s) => ({ ...s, appareils: s.appareils.filter((a) => a.id !== id) }));

  const reset = () => setState(defaultState);

  return (
    <ProjectContext.Provider
      value={{
        state,
        setState,
        updateInfo,
        updateSolaire,
        updatePanneau,
        updateLimites,
        updateBatterieParams,
        updateBatterie,
        updateOnduleurParams,
        updateRegulateurParams,
        addAppareil,
        updateAppareil,
        removeAppareil,
        reset,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject doit être utilisé dans un ProjectProvider');
  return ctx;
}
