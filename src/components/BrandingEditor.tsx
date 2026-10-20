import { useState } from 'react';
import { useI18n } from '../i18n';
import { defaultBranding, loadBranding, saveBranding, type ReportBranding } from '../lib/branding';

export default function BrandingEditor({ onSaved }: { onSaved?: (branding: ReportBranding) => void }) {
  const { t } = useI18n();
  const [branding, setBranding] = useState<ReportBranding>(loadBranding);
  const [open, setOpen] = useState(false);
  const update = (patch: Partial<ReportBranding>) => setBranding((current) => ({ ...current, ...patch }));
  const file = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected || !['image/png', 'image/jpeg'].includes(selected.type) || selected.size > 2_000_000) return;
    const reader = new FileReader(); reader.onload = () => update({ logoDataUrl: String(reader.result) }); reader.readAsDataURL(selected);
  };
  const save = () => { saveBranding(branding); onSaved?.(branding); setOpen(false); };
  return <div className="mt-4 border border-forest-200 rounded-lg bg-white p-4"><button type="button" onClick={() => setOpen((value) => !value)} className="text-sm font-medium text-forest-900">{t('customizePdf')}</button>{open && <div className="mt-4 grid sm:grid-cols-2 gap-3"><label className="text-sm">{t('companyName')}<input value={branding.companyName} onChange={(e) => update({ companyName: e.target.value })} className="mt-1 w-full border border-forest-200 rounded px-2 py-1.5" /></label><label className="text-sm">{t('companyAddress')}<input value={branding.address} onChange={(e) => update({ address: e.target.value })} className="mt-1 w-full border border-forest-200 rounded px-2 py-1.5" /></label><label className="text-sm">{t('companyPhone')}<input value={branding.phone} onChange={(e) => update({ phone: e.target.value })} className="mt-1 w-full border border-forest-200 rounded px-2 py-1.5" /></label><label className="text-sm">{t('companyEmail')}<input value={branding.email} onChange={(e) => update({ email: e.target.value })} className="mt-1 w-full border border-forest-200 rounded px-2 py-1.5" /></label><label className="text-sm">{t('companyWebsite')}<input value={branding.website} onChange={(e) => update({ website: e.target.value })} className="mt-1 w-full border border-forest-200 rounded px-2 py-1.5" /></label><label className="text-sm">Logo 1 / entreprise<input type="file" accept="image/png,image/jpeg" onChange={file} className="mt-1 block w-full text-xs" /></label>{branding.logoDataUrl && <img src={branding.logoDataUrl} alt="Logo 1" className="h-12 max-w-40 object-contain border border-forest-100 p-1" />}<div className="sm:col-span-2 flex gap-2"><button type="button" onClick={save} className="bg-forest-900 text-white text-sm px-3 py-2 rounded">{t('saveBranding')}</button><button type="button" onClick={() => { setBranding(defaultBranding); saveBranding(defaultBranding); }} className="border border-forest-200 text-sm px-3 py-2 rounded">{t('resetBranding')}</button></div></div>}</div>;
}
