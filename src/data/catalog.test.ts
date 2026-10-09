import { describe, it, expect } from 'vitest';
import { batteryCatalog, deduplicateCatalogItems, mapBatteryTechnology, normalizeCatalogKey } from './catalog';

describe('intégrité et déduplication des catalogues', () => {
  it('normalise les variantes de casse, accents et séparateurs', () => {
    expect(normalizeCatalogKey('MultiPlus-II 48/5000/70-50')).toBe(normalizeCatalogKey('multiplus ii 48 5000 70 50'));
  });

  it('conserve une seule fiche pour un même fabricant et modèle', () => {
    const items = [
      { id: 'a', manufacturer: 'ACME', model: 'Model 5' },
      { id: 'b', manufacturer: 'acmé', model: 'MODEL-5' },
      { id: 'c', manufacturer: 'ACME', model: 'Model 6' },
    ];
    expect(deduplicateCatalogItems(items).map((item) => item.id)).toEqual(['a', 'c']);
  });
});

describe('filtrage des batteries par technologie', () => {
  it('classe chaque batterie du catalogue réel dans une technologie connue', () => {
    for (const b of batteryCatalog) {
      expect(['Lithium', 'AGM', 'GEL', 'Plomb', 'Autre']).toContain(mapBatteryTechnology(b.technology));
    }
  });

  it('le filtre AGM ne renvoie que des batteries dont la technologie mappée est AGM', () => {
    const filtre = batteryCatalog.filter((b) => mapBatteryTechnology(b.technology) === 'AGM');
    expect(filtre.length).toBeGreaterThan(0);
    for (const b of filtre) {
      expect(mapBatteryTechnology(b.technology)).toBe('AGM');
      expect(b.technology.toLowerCase()).toContain('agm');
    }
  });

  it('le filtre GEL ne renvoie que des batteries dont la technologie mappée est GEL', () => {
    const filtre = batteryCatalog.filter((b) => mapBatteryTechnology(b.technology) === 'GEL');
    for (const b of filtre) {
      expect(mapBatteryTechnology(b.technology)).toBe('GEL');
    }
  });

  it('le filtre Lithium ne renvoie que des batteries dont la technologie mappée est Lithium', () => {
    const filtre = batteryCatalog.filter((b) => mapBatteryTechnology(b.technology) === 'Lithium');
    expect(filtre.length).toBeGreaterThan(0);
    for (const b of filtre) {
      expect(mapBatteryTechnology(b.technology)).toBe('Lithium');
    }
  });

  it("aucune technologie étrangère n'apparaît dans un filtre donné (AGM exclut Lithium/GEL/Plomb)", () => {
    const agm = new Set(batteryCatalog.filter((b) => mapBatteryTechnology(b.technology) === 'AGM').map((b) => b.id));
    const autres = batteryCatalog.filter((b) => mapBatteryTechnology(b.technology) !== 'AGM');
    for (const b of autres) {
      expect(agm.has(b.id)).toBe(false);
    }
  });
});
