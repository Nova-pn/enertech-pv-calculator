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
  whatsapp?: string;
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

/** Catalogue volontairement vide : aucune donnée commerciale n'est inventée. */
export const suppliers: Supplier[] = [];

export const supplierCategories: SupplierCategory[] = [
  'panels', 'batteries', 'offgridInverters', 'hybridInverters', 'controllers',
  'solarCables', 'dcProtection', 'electricalBoxes', 'connectors', 'mounting', 'kits', 'other',
];

export function whatsappUrl(supplier: Supplier): string | null {
  const raw = supplier.whatsapp || supplier.phone;
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, '').replace(/^\+/, '');
  return digits ? `https://wa.me/${digits}` : null;
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
