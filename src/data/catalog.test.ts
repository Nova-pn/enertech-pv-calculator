import { describe, it, expect } from 'vitest';
import { batteryCatalog, mapBatteryTechnology } from './catalog';

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
