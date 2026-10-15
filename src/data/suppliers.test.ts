import { describe, expect, it } from 'vitest';
import { suppliers, whatsappUrls, whatsappUrl } from './suppliers';

describe('supplier WhatsApp contacts', () => {
  it('does not turn an ordinary phone number into a WhatsApp link', () => {
    const suntec = suppliers.find((supplier) => supplier.id === 'suntec-togo');
    expect(suntec).toBeDefined();
    expect(whatsappUrls(suntec!)).toEqual([]);
    expect(whatsappUrl(suntec!)).toBeNull();
  });

  it('exposes only explicitly verified WhatsApp numbers', () => {
    const autostan = suppliers.find((supplier) => supplier.id === 'autostan-technology-accra');
    const warehouse = suppliers.find((supplier) => supplier.id === 'solar-warehouse-sandton');
    expect(whatsappUrls(autostan!)).toEqual(['https://wa.me/233509552231']);
    expect(whatsappUrls(warehouse!)).toEqual(['https://wa.me/27651624239']);
  });

  it('supports multiple official WhatsApp contacts', () => {
    const solarLane = suppliers.find((supplier) => supplier.id === 'solar-lane-cape-town');
    expect(whatsappUrls(solarLane!)).toEqual(['https://wa.me/27763723886', 'https://wa.me/27797156118']);
  });
});
