import { describe, expect, it } from 'vitest';
import { DEMO_ANSWERS, DIMS } from '../data/items';
import { parseAnswers, toCsv, toRow, type StoredRow } from './submission';

describe('parseAnswers', () => {
  it("accepta 21 enters de l'1 al 5", () => {
    expect(parseAnswers([...DEMO_ANSWERS])).toEqual([...DEMO_ANSWERS]);
  });

  it('rebutja longituds, tipus i valors incorrectes', () => {
    expect(parseAnswers(undefined)).toBeNull();
    expect(parseAnswers('4,3,5')).toBeNull();
    expect(parseAnswers(Array(20).fill(3))).toBeNull();
    expect(parseAnswers(Array(22).fill(3))).toBeNull();
    expect(parseAnswers([...Array(20).fill(3), 6])).toBeNull();
    expect(parseAnswers([...Array(20).fill(3), 0])).toBeNull();
    expect(parseAnswers([...Array(20).fill(3), 2.5])).toBeNull();
    expect(parseAnswers([...Array(20).fill(3), '3'])).toBeNull();
  });
});

describe('toRow', () => {
  it('calcula el resultat al servidor igual que al navegador', () => {
    const row = toRow(DEMO_ANSWERS, new Date('2026-09-29T10:00:00Z'));
    expect(row.pct).toBe(54);
    expect(row.band).toBe('marcat');
    expect(row.created_at).toBe('2026-09-29T10:00:00.000Z');
    expect(row.answers.split(',')).toHaveLength(21);
    expect(Object.keys(JSON.parse(row.dims))).toEqual([...DIMS]);
  });
});

describe('toCsv', () => {
  it('fa una capçalera i una fila per resultat', () => {
    const row: StoredRow = { id: 1, ...toRow(DEMO_ANSWERS, new Date('2026-09-29T10:00:00Z')) };
    const lines = toCsv([row]).trim().split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('percentatge');
    expect(lines[0]).toContain('r21');
    expect(lines[1]!.startsWith('1,2026-09-29T10:00:00.000Z,54,marcat,42,')).toBe(true);
  });
});
