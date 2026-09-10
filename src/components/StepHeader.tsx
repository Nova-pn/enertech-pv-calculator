export default function StepHeader({ num, titre, description }: { num: string; titre: string; description?: string }) {
  return (
    <div className="mb-7 pb-5 border-b border-forest-200">
      <p className="font-mono-num text-xs tracking-widest text-forest-700 mb-1.5">ÉTAPE {num}</p>
      <h2 className="font-display text-2xl sm:text-3xl font-semibold text-forest-950">{titre}</h2>
      {description && <p className="text-sm text-ink/65 mt-2 max-w-lg leading-relaxed">{description}</p>}
    </div>
  );
}
