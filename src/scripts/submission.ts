import { DIMS, N_ITEMS } from '../data/items';
import { score } from './scoring';

/** Una fila de la taula `resultats` (D1). */
export interface StoredRow {
  id: number;
  created_at: string;
  answers: string;
  pct: number;
  band: string;
  dims: string;
}

/** Els camps que es desen d'un test acabat (sense id). */
export type NewRow = Omit<StoredRow, 'id'>;

/**
 * Valida les respostes que arriben del navegador: exactament 21 enters de l'1 al 5.
 * Retorna null si no són vàlides; el servidor no es refia mai del càlcul del client.
 */
export function parseAnswers(input: unknown): number[] | null {
  if (!Array.isArray(input) || input.length !== N_ITEMS) return null;
  const out: number[] = [];
  for (const v of input) {
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 1 || v > 5) return null;
    out.push(v);
  }
  return out;
}

/** Calcula el resultat al servidor i el prepara per desar-lo. */
export function toRow(answers: ReadonlyArray<number>, now: Date): NewRow {
  const r = score(answers);
  const dims: Record<string, number> = {};
  for (const d of r.dims) dims[d.dim] = d.pct;
  return {
    created_at: now.toISOString(),
    answers: answers.join(','),
    pct: r.pct,
    band: r.band.short,
    dims: JSON.stringify(dims),
  };
}

const csvCell = (v: string | number): string => {
  const s = String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Exporta les files en CSV (una columna per dimensió i una per resposta), per analitzar-les amb un full de càlcul. */
export function toCsv(rows: ReadonlyArray<StoredRow>): string {
  const header = [
    'id',
    'data_utc',
    'percentatge',
    'banda',
    ...DIMS,
    ...Array.from({ length: N_ITEMS }, (_, i) => `r${i + 1}`),
  ];
  const lines = rows.map((row) => {
    let dims: Record<string, number> = {};
    try {
      dims = JSON.parse(row.dims) as Record<string, number>;
    } catch {
      dims = {};
    }
    const answers = row.answers.split(',');
    return [
      row.id,
      row.created_at,
      row.pct,
      row.band,
      ...DIMS.map((d) => dims[d] ?? ''),
      ...Array.from({ length: N_ITEMS }, (_, i) => answers[i] ?? ''),
    ]
      .map(csvCell)
      .join(',');
  });
  return [header.map(csvCell).join(','), ...lines].join('\n') + '\n';
}
