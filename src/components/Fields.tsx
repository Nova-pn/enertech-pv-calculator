import type { ReactNode } from 'react';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-forest-900 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-ink/60 mt-1 leading-snug">{hint}</span>}
    </label>
  );
}

const inputClass =
  'w-full rounded-md border border-forest-200 bg-white px-3 py-2 text-sm font-mono-num text-ink focus:border-forest-500 transition-colors';

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
  placeholder,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      className={inputClass}
      value={Number.isNaN(value) ? '' : value}
      min={min}
      max={max}
      step={step ?? 'any'}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value === '' ? NaN : parseFloat(e.target.value))}
    />
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      className={inputClass + ' font-body'}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function SelectInput<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
}) {
  return (
    <select className={inputClass + ' font-body'} value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return <p className="text-xs text-alert mt-1">{children}</p>;
}
