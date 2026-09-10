import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { Field, TextInput, SelectInput, NumberInput, ErrorText } from './Fields';
import StepHeader from './StepHeader';

const typesInstallation = ['Résidentielle', 'Commerciale', 'Site isolé', 'Système hybride', 'Autre'] as const;
const objectifs = ['Autoconsommation', 'Site isolé', 'Secours', 'Système hybride'] as const;
const tensions = [12, 24, 48] as const;

export default function StepProject() {
  const { state, updateInfo } = useProject();
  const navigate = useNavigate();
  const { info } = state;

  const tensionPersonnalisee = !tensions.includes(info.tensionSysteme as 12 | 24 | 48);
  const valide = info.nomProjet.trim() !== '' && Number(info.tensionSysteme) > 0;

  return (
    <div className="max-w-xl">
      <StepHeader num="1" titre="Informations du projet" description="Ces informations identifient le projet et figureront dans le rapport PDF." />

      <div className="space-y-5">
        <Field label="Nom du projet">
          <TextInput value={info.nomProjet} onChange={(v) => updateInfo({ nomProjet: v })} placeholder="Ex. : Villa Akpakpa" />
          {!info.nomProjet && <ErrorText>Le nom du projet est requis.</ErrorText>}
        </Field>

        <Field label="Nom du client">
          <TextInput value={info.nomClient} onChange={(v) => updateInfo({ nomClient: v })} placeholder="[À compléter]" />
        </Field>

        <Field label="Localisation">
          <TextInput value={info.localisation} onChange={(v) => updateInfo({ localisation: v })} placeholder="Ville, pays" />
        </Field>

        <Field label="Type d'installation">
          <SelectInput value={info.typeInstallation} onChange={(v) => updateInfo({ typeInstallation: v })} options={typesInstallation} />
        </Field>

        <Field
          label="Architecture du système"
          hint={
            info.architectureSysteme === 'Simple'
              ? 'Champ PV → contrôleur de charge → batterie → onduleur → charges (deux équipements distincts).'
              : 'Champ PV et batterie gérés par un seul convertisseur hybride intégré, plutôt que par un contrôleur et un onduleur séparés.'
          }
        >
          <div className="flex gap-2">
            {(['Simple', 'Hybride'] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => updateInfo({ architectureSysteme: a })}
                className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                  info.architectureSysteme === a ? 'bg-forest-900 text-white border-forest-900' : 'border-forest-200 hover:border-forest-500'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Tension du système">
          <div className="flex flex-wrap gap-2">
            {tensions.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => updateInfo({ tensionSysteme: t })}
                className={`px-4 py-2 rounded-md text-sm font-mono-num border transition-colors ${
                  info.tensionSysteme === t && !tensionPersonnalisee
                    ? 'bg-forest-900 text-white border-forest-900'
                    : 'border-forest-200 hover:border-forest-500'
                }`}
              >
                {t} V
              </button>
            ))}
            <button
              type="button"
              onClick={() => updateInfo({ tensionSysteme: tensionPersonnalisee ? info.tensionSysteme : 0 })}
              className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                tensionPersonnalisee ? 'bg-forest-900 text-white border-forest-900' : 'border-forest-200 hover:border-forest-500'
              }`}
            >
              Personnalisée
            </button>
          </div>
          {tensionPersonnalisee && (
            <div className="mt-2 max-w-[160px]">
              <NumberInput value={Number(info.tensionSysteme)} min={1} onChange={(v) => updateInfo({ tensionSysteme: v })} />
            </div>
          )}
          {!(Number(info.tensionSysteme) > 0) && <ErrorText>La tension du système doit être supérieure à 0.</ErrorText>}
        </Field>

        <Field label="Objectif">
          <SelectInput value={info.objectif} onChange={(v) => updateInfo({ objectif: v })} options={objectifs} />
        </Field>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          disabled={!valide}
          onClick={() => navigate('/dimensionnement/consommation')}
          className="bg-forest-900 disabled:bg-forest-200 disabled:text-ink/40 hover:bg-forest-700 hover:shadow-md text-white font-medium px-5 py-2.5 rounded-md transition-all"
        >
          Continuer vers le bilan de consommation
        </button>
      </div>
    </div>
  );
}
