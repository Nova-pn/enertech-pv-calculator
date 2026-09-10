import emblem from '../assets/logo/enertech-emblem.jpg';

/**
 * Logo officiel EnerTech (fichier fourni par l'utilisateur, simplement rogné sur l'emblème —
 * aucune couleur ni forme n'a été modifiée). Isolé dans ce seul composant : tous les endroits
 * qui utilisent <LogoMark /> se mettront à jour automatiquement si le fichier change.
 *
 * Le logo a un fond blanc plein ; sur un arrière-plan sombre (en-tête, hero), il est présenté
 * dans un petit badge blanc arrondi pour rester net plutôt que de laisser voir un bord carré.
 */
export default function LogoMark({ size = 28, onDark = false, className = '' }: { size?: number; onDark?: boolean; className?: string }) {
  const img = <img src={emblem} alt="EnerTech" width={size} height={size} style={{ objectFit: 'contain' }} className="block" />;
  if (!onDark) return <span className={className}>{img}</span>;
  return (
    <span
      className={`inline-flex items-center justify-center bg-white rounded-md shadow-sm ${className}`}
      style={{ width: size * 1.35, height: size * 1.35, padding: size * 0.16 }}
    >
      {img}
    </span>
  );
}
