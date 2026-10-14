import { useState } from 'react';
import { useI18n } from '../i18n';
import { defaultReportEdits, loadReportEdits, saveReportEdits, type ReportEdits } from '../lib/reportEdits';

export default function ReportEditor({ onSaved }: { onSaved?: (edits: ReportEdits) => void }) {
  const { t } = useI18n();
  const [edits, setEdits] = useState<ReportEdits>(loadReportEdits);
  const [open, setOpen] = useState(false);
  const update = (patch: Partial<ReportEdits>) => setEdits((current) => ({ ...current, ...patch }));
  const save = () => { saveReportEdits(edits); onSaved?.(edits); setOpen(false); };
  const reset = () => { setEdits(defaultReportEdits); saveReportEdits(defaultReportEdits); onSaved?.(defaultReportEdits); };

  return <div className="mt-4 border border-forest-200 rounded-lg bg-white p-4">
    <button type="button" onClick={() => setOpen((value) => !value)} className="text-sm font-medium text-forest-900">{t('editReport')}</button>
    {open && <div className="mt-4 space-y-3">
      <p className="text-xs text-ink/60">{t('editReportHint')}</p>
      <label className="block text-sm">{t('reportTitle')}<input value={edits.title} onChange={(e) => update({ title: e.target.value })} placeholder={t('reportTitlePlaceholder')} className="mt-1 w-full border border-forest-200 rounded px-2 py-1.5" /></label>
      <label className="block text-sm">{t('reportIntroduction')}<textarea value={edits.introduction} onChange={(e) => update({ introduction: e.target.value })} rows={3} className="mt-1 w-full border border-forest-200 rounded px-2 py-1.5" /></label>
      <label className="block text-sm">{t('reportTechnicalNotes')}<textarea value={edits.technicalNotes} onChange={(e) => update({ technicalNotes: e.target.value })} rows={4} className="mt-1 w-full border border-forest-200 rounded px-2 py-1.5" /></label>
      <label className="block text-sm">{t('reportConclusion')}<textarea value={edits.conclusion} onChange={(e) => update({ conclusion: e.target.value })} rows={3} className="mt-1 w-full border border-forest-200 rounded px-2 py-1.5" /></label>
      <div className="flex gap-2"><button type="button" onClick={save} className="bg-forest-900 text-white text-sm px-3 py-2 rounded">{t('saveReportEdits')}</button><button type="button" onClick={reset} className="border border-forest-200 text-sm px-3 py-2 rounded">{t('resetReportEdits')}</button></div>
    </div>}
  </div>;
}
