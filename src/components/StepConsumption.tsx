import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { calculerBilan, energieQuotidienneAppareil } from '../engine/calculations';
import StepHeader from './StepHeader';

export default function StepConsumption() {
  const { state, addAppareil, updateAppareil, removeAppareil } = useProject();
  const navigate = useNavigate();
  const bilan = calculerBilan(state.appareils);
  const auMoinsUnAppareilValide = state.appareils.some((a) => a.puissanceW > 0 && a.quantite >= 1);

  const puissanceDemarrageTotaleW = state.appareils.reduce((s, a) => {
    if (a.puissanceDemarrageW === null || !Number.isFinite(a.puissanceDemarrageW) || !Number.isFinite(a.quantite)) return s;
    return s + a.puissanceDemarrageW * a.quantite;
  }, 0);
  const auMoinsUneDemarrageRenseignee = state.appareils.some((a) => a.puissanceDemarrageW !== null && Number.isFinite(a.puissanceDemarrageW));

  return (
    <div>
      <StepHeader
        num="2"
        titre="Bilan de consommation"
        description="Ajoutez chaque appareil du site. L'énergie quotidienne est recalculée en direct : Puissance × Quantité × Heures × Coefficient."
      />

      <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-forest-200 bg-white">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-forest-700 bg-forest-100/70 border-b border-forest-200">
              <th className="py-3 pl-4 pr-2 font-medium">Appareil</th>
              <th className="py-3 px-2 font-medium">P. nominale (W)</th>
              <th className="py-3 px-2 font-medium">P. démarrage (W)</th>
              <th className="py-3 px-2 font-medium">Qté</th>
              <th className="py-3 px-2 font-medium">h/jour</th>
              <th className="py-3 px-2 font-medium">Coeff.</th>
              <th className="py-3 px-2 font-medium">Démarrage important</th>
              <th className="py-3 px-2 font-medium text-right">Énergie/jour</th>
              <th className="py-3 pr-4 pl-2" />
            </tr>
          </thead>
          <tbody>
            {state.appareils.map((a) => (
              <tr key={a.id} className="border-b border-forest-100 last:border-b-0 hover:bg-forest-100/30 transition-colors">
                <td className="py-2 pl-4 pr-2">
                  <input
                    className="w-full min-w-[120px] rounded border border-forest-200 px-2 py-1.5 focus:border-forest-500"
                    value={a.nom}
                    onChange={(e) => updateAppareil(a.id, { nom: e.target.value })}
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    className="w-24 rounded border border-forest-200 px-2 py-1.5 font-mono-num focus:border-forest-500"
                    value={a.puissanceW}
                    min={0}
                    onChange={(e) => updateAppareil(a.id, { puissanceW: parseFloat(e.target.value) || 0 })}
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    className="w-24 rounded border border-forest-200 px-2 py-1.5 font-mono-num focus:border-forest-500"
                    placeholder="—"
                    value={a.puissanceDemarrageW === null || !Number.isFinite(a.puissanceDemarrageW) ? '' : a.puissanceDemarrageW}
                    min={0}
                    onChange={(e) => {
                      const raw = e.target.value;
                      updateAppareil(a.id, { puissanceDemarrageW: raw === '' ? null : parseFloat(raw) });
                    }}
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    className="w-16 rounded border border-forest-200 px-2 py-1.5 font-mono-num focus:border-forest-500"
                    value={Number.isFinite(a.quantite) ? a.quantite : ''}
                    min={0}
                    onChange={(e) => {
                      const raw = e.target.value;
                      updateAppareil(a.id, { quantite: raw === '' ? (NaN as number) : parseInt(raw, 10) });
                    }}
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    className="w-16 rounded border border-forest-200 px-2 py-1.5 font-mono-num focus:border-forest-500"
                    value={a.heuresParJour}
                    min={0}
                    max={24}
                    onChange={(e) => updateAppareil(a.id, { heuresParJour: parseFloat(e.target.value) || 0 })}
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    className="w-16 rounded border border-forest-200 px-2 py-1.5 font-mono-num focus:border-forest-500"
                    value={a.coefficient}
                    min={0}
                    max={1}
                    step={0.1}
                    onChange={(e) => updateAppareil(a.id, { coefficient: parseFloat(e.target.value) || 0 })}
                  />
                </td>
                <td className="py-2 px-2 text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-forest-700"
                    checked={a.demarrageImportant}
                    onChange={(e) => updateAppareil(a.id, { demarrageImportant: e.target.checked })}
                  />
                </td>
                <td className="py-2 px-2 text-right font-mono-num">{energieQuotidienneAppareil(a).toFixed(0)} Wh</td>
                <td className="py-2 pr-4 pl-2">
                  <button onClick={() => removeAppareil(a.id)} className="text-alert text-xs hover:underline">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={addAppareil}
        className="mt-4 text-sm font-medium text-forest-700 hover:text-forest-900 border border-forest-200 hover:border-forest-500 rounded-md px-4 py-2 transition-colors"
      >
        + Ajouter un appareil
      </button>

      <p className="text-xs text-ink/55 mt-3 max-w-xl leading-relaxed">
        Le coefficient représente le fonctionnement moyen réel de l'appareil (par défaut 1 = fonctionnement continu
        pendant les heures indiquées). La puissance de démarrage n'est jamais déduite automatiquement du nom de
        l'appareil : laissez le champ vide si elle n'est pas connue, elle sera alors marquée comme non renseignée
        plutôt que comptée comme nulle.
      </p>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Puissance totale nominale" value={`${bilan.puissanceTotaleW.toFixed(0)} W`} />
        <Stat
          label="Puissance totale de démarrage"
          value={auMoinsUneDemarrageRenseignee ? `${puissanceDemarrageTotaleW.toFixed(0)} W` : 'Non renseignée'}
        />
        <Stat label="Énergie / jour" value={`${(bilan.energieJourWh / 1000).toFixed(2)} kWh`} />
        <Stat label="Énergie / mois" value={`${(bilan.energieMoisWh / 1000).toFixed(1)} kWh`} />
      </div>

      {!auMoinsUnAppareilValide && (
        <p className="text-xs text-alert mt-4">Ajoutez au moins un appareil avec une puissance et une quantité valides.</p>
      )}

      <div className="mt-8 flex justify-end">
        <button
          disabled={!auMoinsUnAppareilValide}
          onClick={() => navigate('/dimensionnement/solaire')}
          className="bg-forest-900 disabled:bg-forest-200 disabled:text-ink/40 hover:bg-forest-700 hover:shadow-md text-white font-medium px-5 py-2.5 rounded-md transition-all"
        >
          Continuer vers le champ PV
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-2 border-forest-500 pl-3">
      <p className="text-xs text-ink/55">{label}</p>
      <p className="font-mono-num text-lg font-semibold text-forest-950">{value}</p>
    </div>
  );
}
