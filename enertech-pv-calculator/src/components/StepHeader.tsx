export default function StepHeader({ num, titre, description }: { num: string; titre: string; description?: string }) {
  return (
    <div className="mb-7">
      <p className="font-mono-num text-xs text-forest-700 mb-1">ÉTAPE {num}</p>
      <h2 className="font-display text-2xl font-semibold text-forest-950">{titre}</h2>
      {description && <p className="text-sm text-ink/65 mt-1.5 max-w-lg leading-relaxed">{description}</p>}
    </div>
  );
}
