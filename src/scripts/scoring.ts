import { BANDS, DIMS, ITEMS, type Band, type Dim, type Item } from '../data/items';

export interface DimScore {
  dim: Dim;
  pct: number;
}

export interface Result {
  pct: number;
  band: Band;
  bandIndex: number;
  dims: ReadonlyArray<DimScore>;
}

/**
 * Normalitza puntuacions d'1 a 5 a un percentatge de 0 a 100:
 * es resta el mínim possible (una unitat per ítem) i es divideix pel recorregut (quatre per ítem).
 */
export function normalize(points: ReadonlyArray<number>): number {
  if (points.length === 0) return 0;
  const sum = points.reduce((a, b) => a + b, 0);
  return Math.round(((sum - points.length) / (4 * points.length)) * 100);
}

/** Puntuació efectiva d'una resposta: els ítems inversos giren l'escala (5 passa a valer 1). */
export function pointsFor(item: Item, answer: number): number {
  return item.rev ? 6 - answer : answer;
}

export function bandFor(pct: number): { band: Band; index: number } {
  const index = BANDS.findIndex((b) => pct <= b.max);
  const i = index === -1 ? BANDS.length - 1 : index;
  return { band: BANDS[i]!, index: i };
}

/** Calcula el resultat a partir de les 21 respostes (1 a 5). Llança si en falta alguna. */
export function score(answers: ReadonlyArray<number | null>, items: ReadonlyArray<Item> = ITEMS): Result {
  if (answers.length !== items.length) throw new Error(`Calen ${items.length} respostes, n'hi ha ${answers.length}.`);
  const points = items.map((item, i) => {
    const a = answers[i];
    if (a === null || a === undefined || a < 1 || a > 5) throw new Error(`Resposta ${i + 1} no vàlida.`);
    return pointsFor(item, a);
  });
  const pct = normalize(points);
  const { band, index } = bandFor(pct);
  const dims = DIMS.map((dim) => ({
    dim,
    pct: normalize(points.filter((_, i) => items[i]!.dim === dim)),
  }));
  return { pct, band, bandIndex: index, dims };
}

export function resultText(r: Result): string {
  const lines = r.dims.map((d) => `  ${d.dim}: ${d.pct} %`).join('\n');
  return [
    'Autotest «Quant de narcisista ets?» (tret, no diagnòstic)',
    `Resultat global: ${r.pct} % (${r.band.name})`,
    'Perfil per dimensions:',
    lines,
    'Fet a https://maginer.com, material del TR «Narcís entre nosaltres».',
  ].join('\n');
}
