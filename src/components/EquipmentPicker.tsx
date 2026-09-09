import { useMemo, useState, type ReactNode } from 'react';

interface EquipmentPickerProps<T> {
  items: T[];
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  getSearchText: (item: T) => string;
  onSelect: (item: T) => void;
  renderDetails: (item: T) => ReactNode;
  placeholder?: string;
}

/**
 * Liste déroulante de recherche + fiche du modèle choisi. L'utilisateur sélectionne
 * lui-même l'équipement ; rien n'est présélectionné automatiquement.
 */
export default function EquipmentPicker<T>({
  items,
  getId,
  getLabel,
  getSearchText,
  onSelect,
  renderDetails,
  placeholder = 'Rechercher un modèle…',
}: EquipmentPickerProps<T>) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => getSearchText(item).toLowerCase().includes(q));
  }, [items, query]);

  const selected = selectedId ? items.find((i) => getId(i) === selectedId) ?? null : null;

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          className="w-full rounded-md border border-forest-200 bg-white px-3 py-2 text-sm focus:border-forest-500"
          placeholder={placeholder}
          value={open ? query : selected ? getLabel(selected) : query}
          onFocus={() => {
            setOpen(true);
            setQuery('');
          }}
          onChange={(e) => setQuery(e.target.value)}
        />
        {open && (
          <div className="absolute z-20 mt-1 w-full max-h-64 overflow-auto rounded-md border border-forest-200 bg-white shadow-lg">
            {filtered.length === 0 && <p className="px-3 py-2 text-sm text-ink/50">Aucun résultat.</p>}
            {filtered.map((item) => (
              <button
                key={getId(item)}
                type="button"
                className="block w-full text-left px-3 py-2 text-sm hover:bg-forest-100 border-b border-forest-100 last:border-b-0"
                onClick={() => {
                  setSelectedId(getId(item));
                  onSelect(item);
                  setOpen(false);
                  setQuery('');
                }}
              >
                {getLabel(item)}
              </button>
            ))}
          </div>
        )}
      </div>
      {open && (
        <button type="button" className="text-xs text-ink/50 mt-1 hover:underline" onClick={() => setOpen(false)}>
          Fermer la liste
        </button>
      )}

      {selected && !open && (
        <div className="mt-3 border border-forest-200 rounded-md p-4 bg-forest-100/40">
          <div className="flex items-center justify-between mb-2">
            <p className="font-display font-medium text-forest-950">{getLabel(selected)}</p>
            <button
              type="button"
              className="text-xs text-alert hover:underline"
              onClick={() => setSelectedId(null)}
            >
              Retirer
            </button>
          </div>
          {renderDetails(selected)}
        </div>
      )}
    </div>
  );
}
