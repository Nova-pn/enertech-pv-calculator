import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { suppliers, supplierCategories, matchesSupplier, whatsappUrl, type Supplier } from '../data/suppliers';
import { useI18n } from '../i18n';

const categoryKeys: Record<string, string> = {
  panels: 'supplierCatPanels', batteries: 'supplierCatBatteries', offgridInverters: 'supplierCatOffgrid', hybridInverters: 'supplierCatHybrid', controllers: 'supplierCatControllers', solarCables: 'supplierCatCables', dcProtection: 'supplierCatProtection', electricalBoxes: 'supplierCatBoxes', connectors: 'supplierCatConnectors', mounting: 'supplierCatMounting', kits: 'supplierCatKits', other: 'supplierCatOther',
};

export default function Suppliers() {
  const { t } = useI18n();
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [within24h, setWithin24h] = useState(false);
  const filtered = useMemo(() => suppliers.filter((supplier) => matchesSupplier(supplier, { country, city, category, within24h })), [country, city, category, within24h]);
  const countries = [...new Set(suppliers.map((s) => s.country))].sort();
  const cities = [...new Set(suppliers.filter((s) => !country || s.country === country).map((s) => s.city))].sort();

  return <div className="max-w-5xl">
    <div className="flex flex-wrap items-start justify-between gap-4 mb-8 pb-5 border-b border-forest-200">
      <div><p className="font-mono-num text-xs tracking-widest text-forest-700 mb-1.5">{t('supplierDirectory')}</p><h2 className="font-display text-2xl sm:text-3xl font-semibold text-forest-950">{t('supplierAvailability')}</h2><p className="text-sm text-ink/60 mt-1">{t('supplierIntro')}</p></div>
      <Link to="/resultats" className="border border-forest-200 hover:border-forest-500 text-sm font-medium px-4 py-2.5 rounded-md">{t('backToResults')}</Link>
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-5 rounded-lg border border-forest-200 bg-white">
      <label className="text-sm">{t('country')}<select value={country} onChange={(e) => { setCountry(e.target.value); setCity(''); }} className="mt-1 w-full rounded border border-forest-200 px-3 py-2 bg-white"><option value="">{t('allCountries')}</option>{countries.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="text-sm">{t('city')}<select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded border border-forest-200 px-3 py-2 bg-white"><option value="">{t('allCities')}</option>{cities.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="text-sm">{t('equipmentCategory')}<select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded border border-forest-200 px-3 py-2 bg-white"><option value="">{t('allCategories')}</option>{supplierCategories.map((value) => <option key={value} value={value}>{t(categoryKeys[value])}</option>)}</select></label>
      <label className="flex items-center gap-2 text-sm self-end pb-2"><input type="checkbox" checked={within24h} onChange={(e) => setWithin24h(e.target.checked)} />{t('delivery24h')}</label>
    </div>
    {filtered.length === 0 ? <div className="rounded-lg border border-sun-dark/40 bg-sun/10 px-5 py-6"><h3 className="font-display font-medium text-forest-950 mb-2">{t('noVerifiedSuppliers')}</h3><p className="text-sm text-ink/70">{t('supplierEmptyHelp')}</p><p className="text-xs text-ink/55 mt-3">{t('supplierDataNote')}</p></div> : <div className="grid md:grid-cols-2 gap-5">{filtered.map((supplier) => <SupplierCard key={supplier.id} supplier={supplier} />)}</div>}
  </div>;
}

function SupplierCard({ supplier }: { supplier: Supplier }) {
  const { t } = useI18n();
  const whatsapp = whatsappUrl(supplier);
  return <article className="border border-forest-200 rounded-lg p-5 bg-white"><h3 className="font-display text-lg font-semibold text-forest-950">{supplier.name}</h3><p className="text-sm text-ink/65 mt-1">{supplier.city}, {supplier.country}</p><p className="text-sm mt-3">{t('supplierAvailabilityLabel')}: {t(`availability_${supplier.availability}`)}</p><p className="text-sm">{t('supplierDeliveryLabel')}: {t(`delivery_${supplier.delivery}`)}</p>{supplier.lastVerified && <p className="text-xs text-ink/55 mt-2">{t('lastVerified')}: {supplier.lastVerified}</p>}<div className="flex flex-wrap gap-2 mt-4">{whatsapp && <a href={whatsapp} target="_blank" rel="noreferrer" className="bg-forest-900 text-white text-sm px-3 py-2 rounded">{t('contactWhatsApp')}</a>}{supplier.phone && <a href={`tel:${supplier.phone}`} className="border border-forest-200 text-sm px-3 py-2 rounded">{t('contactSupplier')}</a>}</div></article>;
}
