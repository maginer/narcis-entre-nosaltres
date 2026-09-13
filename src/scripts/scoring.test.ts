import { describe, expect, it } from 'vitest';
import { BANDS, DEMO_ANSWERS, DIMS, ITEMS, N_ITEMS } from '../data/items';
import { bandFor, normalize, pointsFor, resultText, score } from './scoring';

describe('ítems', () => {
  it('són 21, tres per dimensió, intercalats per rondes', () => {
    expect(N_ITEMS).toBe(21);
    for (const dim of DIMS) expect(ITEMS.filter((i) => i.dim === dim)).toHaveLength(3);
    expect(ITEMS.slice(0, 7).map((i) => i.dim)).toEqual([...DIMS]);
  });

  it('les bandes cobreixen de 0 a 100 sense forats', () => {
    expect(BANDS.map((b) => b.max)).toEqual([30, 50, 70, 100]);
  });
});

describe('normalize', () => {
  it('dona 0 amb tot a 1 i 100 amb tot a 5', () => {
    expect(normalize(Array(21).fill(1))).toBe(0);
    expect(normalize(Array(21).fill(5))).toBe(100);
  });

  it('dona 50 amb tot a 3', () => {
    expect(normalize([3, 3, 3])).toBe(50);
  });

  it('retorna 0 sense punts', () => {
    expect(normalize([])).toBe(0);
  });
});

describe('pointsFor', () => {
  it('inverteix només els ítems inversos', () => {
    const rev = ITEMS.find((i) => i.rev)!;
    const direct = ITEMS.find((i) => !i.rev)!;
    expect(pointsFor(rev, 5)).toBe(1);
    expect(pointsFor(rev, 1)).toBe(5);
    expect(pointsFor(direct, 5)).toBe(5);
  });
});

describe('bandFor', () => {
  it('assigna cada límit a la banda correcta', () => {
    expect(bandFor(0).band.short).toBe('baix');
    expect(bandFor(30).band.short).toBe('baix');
    expect(bandFor(31).band.short).toBe('moderat');
    expect(bandFor(50).band.short).toBe('moderat');
    expect(bandFor(51).band.short).toBe('marcat');
    expect(bandFor(70).band.short).toBe('marcat');
    expect(bandFor(71).band.short).toBe('alt');
    expect(bandFor(100).band.short).toBe('alt');
  });
});

describe('score', () => {
  it('reprodueix el patró de demostració del treball (54 %, tret marcat)', () => {
    const r = score(DEMO_ANSWERS);
    expect(r.pct).toBe(54);
    expect(r.band.name).toBe('Tret marcat');
    expect(r.dims.map((d) => d.pct)).toEqual([42, 58, 75, 42, 33, 58, 67]);
  });

  it('rebutja respostes que falten o fora de rang', () => {
    expect(() => score(Array(21).fill(null))).toThrow(/Resposta 1/);
    expect(() => score([...Array(20).fill(3), 6])).toThrow(/Resposta 21/);
    expect(() => score([3, 3])).toThrow(/Calen 21/);
  });

  it('tot al mínim narcisista dona 0 en global i en cada dimensió', () => {
    const answers = ITEMS.map((i) => (i.rev ? 5 : 1));
    const r = score(answers);
    expect(r.pct).toBe(0);
    expect(r.dims.every((d) => d.pct === 0)).toBe(true);
    expect(r.band.short).toBe('baix');
  });
});

describe('resultText', () => {
  it('inclou el percentatge, la banda i les set dimensions', () => {
    const t = resultText(score(DEMO_ANSWERS));
    expect(t).toContain('54 % (Tret marcat)');
    for (const dim of DIMS) expect(t).toContain(dim);
    expect(t).toContain('maginer.com');
  });
});
