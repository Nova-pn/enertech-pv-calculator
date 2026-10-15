import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import { supabase } from '../lib/supabase';

type ActivityEvent = { event_name: string; event_data: Record<string, unknown>; created_at: string };

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase || !user) { setLoading(false); return; }
      const { data, error } = await supabase.from('activity_events').select('event_name,event_data,created_at').order('created_at', { ascending: false }).limit(5000);
      if (!active) return;
      if (error) setMessage(error.message);
      else setEvents((data ?? []) as ActivityEvent[]);
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [user]);

  const counts = useMemo(() => events.reduce<Record<string, number>>((acc, event) => { acc[event.event_name] = (acc[event.event_name] ?? 0) + 1; return acc; }, {}), [events]);
  const suppliers = useMemo(() => events.filter((event) => event.event_name === 'supplier_whatsapp_clicked' || event.event_name === 'supplier_phone_clicked').reduce<Record<string, number>>((acc, event) => { const id = String(event.event_data.supplierId ?? 'inconnu'); acc[id] = (acc[id] ?? 0) + 1; return acc; }, {}), [events]);

  if (!user) return <div className="max-w-3xl rounded-lg border border-sun-dark/40 bg-sun/10 p-6"><h2 className="font-display text-2xl font-semibold">{t('analyticsTitle')}</h2><p className="mt-2 text-sm">{t('analyticsLoginRequired')}</p></div>;
  return <div className="max-w-5xl">
    <div className="mb-8 border-b border-forest-200 pb-5"><p className="font-mono-num text-xs tracking-widest text-forest-700">{t('analyticsLabel')}</p><h2 className="font-display text-2xl font-semibold text-forest-950">{t('analyticsTitle')}</h2><p className="mt-1 text-sm text-ink/60">{t('analyticsSubtitle')}</p></div>
    {loading && <p className="text-sm">{t('loading')}</p>}
    {message && <div className="rounded border border-sun-dark/40 bg-sun/10 p-4 text-sm">{t('analyticsAdminRequired')}<br /><span className="text-xs text-ink/60">{message}</span></div>}
    {!loading && !message && <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t('analyticsPages')} value={counts.page_view ?? 0} />
        <Stat label={t('analyticsSizing')} value={(counts.sizing_started ?? 0) + (counts.sizing_completed ?? 0)} />
        <Stat label={t('analyticsPdfs')} value={counts.pdf_generated ?? 0} />
        <Stat label={t('analyticsContacts')} value={(counts.supplier_whatsapp_clicked ?? 0) + (counts.supplier_phone_clicked ?? 0)} />
      </div>
      <section className="mt-8 rounded-lg border border-forest-200 bg-white p-5"><h3 className="font-display text-lg font-semibold text-forest-950">{t('analyticsSupplierClicks')}</h3><div className="mt-4 space-y-2">{Object.entries(suppliers).sort((a, b) => b[1] - a[1]).map(([name, count]) => <div key={name} className="flex justify-between border-b border-forest-100 py-2 text-sm"><span>{name}</span><strong>{count}</strong></div>)}{Object.keys(suppliers).length === 0 && <p className="text-sm text-ink/60">{t('analyticsNoData')}</p>}</div></section>
    </>}
  </div>;
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-lg border border-forest-200 bg-white p-5"><p className="text-xs text-ink/60">{label}</p><p className="mt-2 font-mono-num text-3xl font-semibold text-forest-950">{value}</p></div>; }
