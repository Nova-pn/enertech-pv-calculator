export type SupplierCategory =
  | 'panels' | 'batteries' | 'offgridInverters' | 'hybridInverters' | 'controllers'
  | 'solarCables' | 'dcProtection' | 'electricalBoxes' | 'connectors'
  | 'mounting' | 'kits' | 'other';

export type AvailabilityStatus = 'confirmed' | 'to_confirm' | 'unavailable' | 'old';
export type DeliveryStatus = 'confirmed_24h' | 'pickup_24h' | 'estimated' | 'unknown';

export interface Supplier {
  id: string;
  name: string;
  country: string;
  city: string;
  address?: string;
  phone?: string;
  whatsapp?: string | string[];
  email?: string;
  website?: string;
  categories: SupplierCategory[];
  brands?: string[];
  products?: string[];
  availability: AvailabilityStatus;
  delivery: DeliveryStatus;
  usualDeliveryHours?: number;
  servedAreas?: string[];
  pickupAvailable?: boolean;
  lastVerified?: string;
  source?: string;
  validation: 'verified' | 'pending';
}

const commonCategories: SupplierCategory[] = ['panels', 'batteries', 'hybridInverters', 'controllers', 'kits'];

/** Boutiques et distributeurs issus du rapport vérifié fourni par l'utilisateur. Les délais restent prudents : aucun 2 h n'est garanti. */
export const suppliers: Supplier[] = [
  { id: 'besta-solar', name: 'Besta Solar', country: 'Bénin', city: 'Parakou', phone: '+229 61 73 29 56', email: 'contact@bestasolar.com', website: 'https://www.bestasolar.com/', categories: ['batteries', 'hybridInverters', 'controllers', 'kits', 'other'], brands: ['Felicity', 'Deye', 'Growatt', 'Must', 'SRNE'], products: ['Kits de pompage', 'Lampadaires'], availability: 'to_confirm', delivery: 'unknown', servedAreas: ['Cotonou', 'Togo'], lastVerified: '2026-10-10', source: 'https://www.bestasolar.com/', validation: 'verified' },
  { id: 'aress-cotonou', name: 'ARESS', country: 'Bénin', city: 'Cotonou', phone: '+229 97 44 46 46 / +229 65 80 12 05', website: 'https://en.aress.solar/', categories: commonCategories, products: ['Micro-réseaux', 'Solutions résidentielles et professionnelles'], availability: 'to_confirm', delivery: 'unknown', servedAreas: ['Lomé', 'Dakar', 'Ouagadougou'], lastVerified: '2026-10-10', source: 'https://en.aress.solar/', validation: 'verified' },
  { id: 'yourbeststores-lome', name: 'Yourbeststores', country: 'Togo', city: 'Lomé', phone: '+228 91 23 41 91', website: 'https://www.facebook.com/Yourbeststores/', categories: ['panels', 'kits'], products: ['Panneaux solaires pliables'], availability: 'to_confirm', delivery: 'unknown', lastVerified: '2026-10-10', source: 'https://www.facebook.com/Yourbeststores/', validation: 'verified' },
  { id: 'egent-togo', name: 'EGENT TOGO', country: 'Togo', city: 'Lomé', phone: '+228 92 53 14 55 / +228 91 20 43 73', whatsapp: '+228 91 20 43 73', email: 'infos@egenttogo.com', website: 'https://egenttogo.com/en', categories: ['kits', 'other'], products: ['Kits Zoklin', 'Pompage solaire Free Water'], availability: 'to_confirm', delivery: 'unknown', lastVerified: '2026-10-10', source: 'https://egenttogo.com/en', validation: 'verified' },
  { id: 'suntec-togo', name: 'Suntec Togo SARL', country: 'Togo', city: 'Lomé', phone: '+228 90 32 62 35', email: 'info@suntec-togo.com', website: 'https://suntec-togo.com/', categories: ['other'], products: ['Projets renouvelables', 'Agrivoltaïsme'], availability: 'to_confirm', delivery: 'unknown', lastVerified: '2026-10-10', source: 'https://suntec-togo.com/', validation: 'verified' },
  { id: 'nrj-solaire-dakar', name: 'NRJ Solaire', country: 'Sénégal', city: 'Dakar', phone: '+221 77 534 22 04', email: 'nrjsolaire@nrjsolaire.sn', website: 'https://energiesolaire.sn/boutique', categories: ['panels', 'batteries', 'offgridInverters', 'hybridInverters', 'controllers', 'kits', 'other'], brands: ['JA Solar', 'Jinko', 'LONGi', 'Trina', 'MUST', 'Deye', 'Victron', 'Voltronic'], products: ['Pompage', 'Éclairage'], availability: 'to_confirm', delivery: 'unknown', lastVerified: '2026-10-10', source: 'https://energiesolaire.sn/boutique', validation: 'verified' },
  { id: 'mercury-direct-lagos', name: 'Mercury Direct', country: 'Nigeria', city: 'Lagos', phone: '+234 703 745 1701', email: 'support@mercurydirect.com.ng', website: 'https://mercurydirect.com.ng/solar/', categories: ['panels', 'batteries', 'hybridInverters', 'kits'], products: ['Onduleurs Mercury 1,5–11 kVA', 'Systèmes complets'], availability: 'to_confirm', delivery: 'estimated', servedAreas: ['Lagos'], lastVerified: '2026-10-10', source: 'https://mercurydirect.com.ng/solar/', validation: 'verified' },
  { id: 'solar-shop-lagos', name: 'The Solar Shop Limited', country: 'Nigeria', city: 'Lagos', phone: '+234 708 500 3494', website: 'https://www.solarshopnigeria.com/', categories: ['panels', 'batteries', 'offgridInverters', 'hybridInverters', 'kits'], brands: ['Jinko', 'JA Solar', 'Victron', 'Phocos', 'Schneider', 'SMA', 'Huawei', 'Ultron'], products: ['OPzV', 'EPC'], availability: 'to_confirm', delivery: 'unknown', servedAreas: ['Abuja', 'Accra'], pickupAvailable: true, lastVerified: '2026-10-10', source: 'https://www.solarshopnigeria.com/', validation: 'verified' },
  { id: 'solar-depot-ilorin', name: 'Solar Depot Nigeria', country: 'Nigeria', city: 'Ilorin', address: 'Shop 49, opposite NNPC, Fate Road', phone: '+234 806 432 1780', website: 'https://solardepot.ng/', categories: ['panels', 'batteries', 'hybridInverters', 'controllers', 'kits'], brands: ['Jinko', 'SAKO', 'SMS'], products: ['Panneaux 480/585 W', 'Systèmes 500 W à 20 kW'], availability: 'to_confirm', delivery: 'unknown', lastVerified: '2026-10-10', source: 'https://solardepot.ng/', validation: 'verified' },
  { id: 'gotech-solar-benin-city', name: 'Gotech Solar', country: 'Nigeria', city: 'Benin City', address: 'No 88, Igbinake Street', phone: '+234 904 141 1575 / +234 905 791 1846', whatsapp: ['+234 904 141 1575', '+234 905 791 1846'], website: 'https://gotechsolar.com/', categories: ['panels', 'batteries', 'hybridInverters', 'kits'], products: ['Packages 2–11 kVA'], availability: 'to_confirm', delivery: 'unknown', lastVerified: '2026-10-15', source: 'https://gotechsolar.com/support-policy/', validation: 'verified' },
  { id: 'felicity-solar-lekki', name: 'Felicity Solar Company Nigeria', country: 'Nigeria', city: 'Lagos', address: 'Shop 9, Shore Mall, Ganiu Eletu Way, Osapa, Lekki', website: 'https://felicitysolarlagos.com.ng/', categories: ['panels', 'batteries', 'hybridInverters', 'kits'], brands: ['Felicity'], products: ['Éclairage solaire'], availability: 'to_confirm', delivery: 'unknown', pickupAvailable: true, lastVerified: '2026-10-10', source: 'https://felicitysolarlagos.com.ng/', validation: 'verified' },
  { id: 'ttt-solar-accra', name: 'TTT Solar', country: 'Ghana', city: 'Accra', phone: '+233 204 266 308', whatsapp: '+233 240 818 849', email: 'info@tttsolar.com', website: 'https://www.tttsolar.com/', categories: commonCategories, products: ['Vente en gros et au détail', 'Installation et maintenance'], availability: 'to_confirm', delivery: 'unknown', lastVerified: '2026-10-10', source: 'https://www.tttsolar.com/', validation: 'verified' },
  { id: 'deep-solar-madina', name: 'Deep Solar Ghana', country: 'Ghana', city: 'Accra / Madina', address: 'UPSA Road, Madina', phone: '+233 59 549 4113', email: 'deepsolarghana@gmail.com', website: 'https://www.deepsolarghana.com/', categories: ['panels', 'batteries', 'hybridInverters', 'kits'], products: ['Systèmes hors réseau'], availability: 'to_confirm', delivery: 'unknown', lastVerified: '2026-10-10', source: 'https://www.deepsolarghana.com/', validation: 'verified' },
  { id: 'sunsum-tech-accra', name: 'SUNSUM Tech', country: 'Ghana', city: 'Accra', address: 'Manet Junction, Spintex Road', phone: '+233 25 676 6074', email: 'info@sunsumtech.com', website: 'https://www.sunsumtech.com/contact', categories: commonCategories, products: ['Solutions résidentielles, commerciales et industrielles'], availability: 'to_confirm', delivery: 'unknown', lastVerified: '2026-10-10', source: 'https://www.sunsumtech.com/contact', validation: 'verified' },
  { id: 'autostan-technology-accra', name: 'Autostan Technology', country: 'Ghana', city: 'Accra', address: 'Kaneshie Zongo Junction', phone: '+233 509 552 231 / +233 240 630 900', whatsapp: '+233 509 552 231', email: 'info@autostantech.com', website: 'https://autostantech.com/', categories: ['panels', 'batteries', 'hybridInverters', 'solarCables', 'kits'], brands: ['Deye', 'Galaxy'], products: ['Pompes solaires', 'Câblage', 'Maintenance'], availability: 'to_confirm', delivery: 'unknown', lastVerified: '2026-10-15', source: 'https://autostantech.com/pages/contact.html', validation: 'verified' },
  { id: 'exo-solar-nelspruit', name: 'Exo Solar', country: 'Afrique du Sud', city: 'Nelspruit', phone: '+27 13 518 0350', email: 'sales@exosolar.co.za', website: 'https://exosolar.co.za/delivery/', categories: ['panels', 'batteries', 'hybridInverters', 'kits'], products: ['Énergie portable'], availability: 'to_confirm', delivery: 'estimated', lastVerified: '2026-10-10', source: 'https://exosolar.co.za/delivery/', validation: 'verified' },
  { id: 'solar-lane-cape-town', name: 'Solar Lane', country: 'Afrique du Sud', city: 'Cape Town', phone: '+27 76 372 3886 / +27 79 715 6118', whatsapp: ['+27 76 372 3886', '+27 79 715 6118'], website: 'https://solarlane.co.za/', categories: ['panels', 'batteries', 'hybridInverters'], products: ['Panneaux Tier-1'], availability: 'to_confirm', delivery: 'unknown', servedAreas: ['Distribution nationale'], pickupAvailable: true, lastVerified: '2026-10-15', source: 'https://solarlane.co.za/pages/contact', validation: 'verified' },
  { id: 'solar-warehouse-sandton', name: 'Solar Warehouse Sandton', country: 'Afrique du Sud', city: 'Johannesburg / Sandton', address: 'Shop 46 Morning Glen Mall', phone: '+27 11 568 2657', whatsapp: '+27 65 162 4239', website: 'https://solarwarehousejhb.co.za/', categories: ['panels', 'batteries', 'hybridInverters', 'kits'], products: ['Batteries gel et lithium', 'Kits combinés'], availability: 'to_confirm', delivery: 'unknown', pickupAvailable: true, lastVerified: '2026-10-15', source: 'https://solarwarehousejhb.co.za/pages/contact-us', validation: 'verified' },
  { id: 'dong-solar-nairobi', name: 'Dong Solar Limited', country: 'Kenya', city: 'Nairobi', website: 'https://dongsolar.co.ke/content/1-delivery', categories: ['panels', 'batteries', 'offgridInverters', 'hybridInverters', 'kits'], brands: ['Bluetti', 'EcoFlow', 'Vestwoods', 'Marstek', 'Hinen'], products: ['Systèmes résidentiels et industriels'], availability: 'to_confirm', delivery: 'unknown', servedAreas: ['Nairobi', 'Autres villes'], lastVerified: '2026-10-10', source: 'https://dongsolar.co.ke/content/1-delivery', validation: 'verified' },
  { id: 'power-sun-nairobi', name: 'Power & Sun / PNS Solar Solutions Kenya', country: 'Kenya', city: 'Nairobi', address: 'Ramraj Complex, Lusaka Road', phone: '+254 720 558 884', email: 'info@powernsun.com', website: 'https://powernsun.com/solar-distributors-in-kenya/', categories: ['panels', 'batteries', 'hybridInverters', 'controllers'], brands: ['JA Solar', 'Ultimatte'], availability: 'to_confirm', delivery: 'unknown', lastVerified: '2026-10-10', source: 'https://powernsun.com/solar-distributors-in-kenya/', validation: 'verified' },
  { id: 'sun-king-africa', name: 'Sun King Nigeria', country: 'Nigeria', city: 'Réseau local', whatsapp: '+234 817 946 6478', website: 'https://sunking.com/store-locator', categories: ['panels', 'batteries', 'kits', 'other'], products: ['Lanternes solaires', 'Systèmes domestiques', 'Paiement échelonné'], availability: 'to_confirm', delivery: 'unknown', servedAreas: ['Nigeria — vérifier le pays via le localisateur'], lastVerified: '2026-10-15', source: 'https://ng.sunking.com/faq/', validation: 'verified' },
];

export const supplierCategories: SupplierCategory[] = [
  'panels', 'batteries', 'offgridInverters', 'hybridInverters', 'controllers',
  'solarCables', 'dcProtection', 'electricalBoxes', 'connectors', 'mounting', 'kits', 'other',
];

export function whatsappUrls(supplier: Supplier): string[] {
  const values = supplier.whatsapp ? (Array.isArray(supplier.whatsapp) ? supplier.whatsapp : [supplier.whatsapp]) : [];
  return values.map((value) => value.replace(/[^\d+]/g, '').replace(/^\+/, '')).filter(Boolean).map((digits) => `https://wa.me/${digits}`);
}

/** Compatibilité avec les anciens appels : retourne le premier WhatsApp confirmé, jamais le téléphone seul. */
export function whatsappUrl(supplier: Supplier): string | null {
  return whatsappUrls(supplier)[0] ?? null;
}

export function matchesSupplier(supplier: Supplier, filters: {
  country: string; city: string; category: string; within24h: boolean;
}): boolean {
  if (filters.country && supplier.country !== filters.country) return false;
  if (filters.city && supplier.city !== filters.city) return false;
  if (filters.category && !supplier.categories.includes(filters.category as SupplierCategory)) return false;
  if (filters.within24h && supplier.delivery !== 'confirmed_24h' && supplier.delivery !== 'pickup_24h') return false;
  return true;
}
