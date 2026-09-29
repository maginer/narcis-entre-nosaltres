import { BANDS, DIMS } from '../data/items';
import { byId } from './dom';
import type { StoredRow } from './submission';

interface ApiResponse {
  count: number;
  rows: StoredRow[];
}

const fmtDate = new Intl.DateTimeFormat('ca-ES', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Madrid' });
const mean = (xs: ReadonlyArray<number>): number =>
  xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;

function parseDims(row: StoredRow): Record<string, number> {
  try {
    return JSON.parse(row.dims) as Record<string, number>;
  } catch {
    return {};
  }
}

function cell(text: string | number, cls?: string): HTMLTableCellElement {
  const td = document.createElement('td');
  td.textContent = String(text);
  if (cls) td.className = cls;
  return td;
}

function bar(label: string, value: number, max: number, suffix: string): HTMLDivElement {
  const row = document.createElement('div');
  row.className = 'rs-bar';
  const name = document.createElement('span');
  name.textContent = label;
  const track = document.createElement('span');
  track.className = 'rs-track';
  const fill = document.createElement('i');
  fill.style.width = `${max ? (100 * value) / max : 0}%`;
  track.append(fill);
  const val = document.createElement('b');
  val.textContent = suffix;
  row.append(name, track, val);
  return row;
}

function render(rows: ReadonlyArray<StoredRow>): void {
  const pcts = rows.map((r) => r.pct);
  byId('rs-count').textContent = String(rows.length);
  byId('rs-mean').textContent = rows.length ? `${mean(pcts)}%` : '–';
  byId('rs-range').textContent = rows.length ? `${Math.min(...pcts)}–${Math.max(...pcts)}%` : '–';

  const bands = byId('rs-bands');
  bands.replaceChildren(
    ...BANDS.map((b) => {
      const n = rows.filter((r) => r.band === b.short).length;
      const share = rows.length ? Math.round((100 * n) / rows.length) : 0;
      return bar(`${b.name} (${b.range})`, n, rows.length, `${n} · ${share}%`);
    }),
  );

  const dims = byId('rs-dims');
  const perRow = rows.map(parseDims);
  dims.replaceChildren(
    ...DIMS.map((d) => {
      const vals = perRow.map((x) => x[d]).filter((v): v is number => typeof v === 'number');
      const m = mean(vals);
      return bar(d, m, 100, vals.length ? `${m}%` : '–');
    }),
  );

  const body = byId('rs-body');
  body.replaceChildren(
    ...rows.map((r) => {
      const tr = document.createElement('tr');
      const dimsRow = parseDims(r);
      const band = BANDS.find((b) => b.short === r.band);
      tr.append(
        cell(r.id),
        cell(fmtDate.format(new Date(r.created_at))),
        cell(`${r.pct}%`, 'num strong'),
        cell(band ? band.name : r.band),
        ...DIMS.map((d) => cell(typeof dimsRow[d] === 'number' ? `${dimsRow[d]}%` : '–', 'num')),
      );
      return tr;
    }),
  );
  byId('rs-status').textContent = rows.length
    ? `${rows.length} resultats, del més recent al més antic.`
    : "Encara no hi ha cap resultat. Apareixeran aquí quan algú faci el test i accepti afegir-lo a l'estudi.";
}

async function load(): Promise<void> {
  const status = byId('rs-status');
  status.textContent = 'Carregant…';
  try {
    const res = await fetch('/api/results', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as ApiResponse;
    render(data.rows);
  } catch {
    status.textContent = "No s'han pogut carregar els resultats. Torna-ho a provar d'aquí a una estona.";
  }
}

byId<HTMLButtonElement>('rs-reload').addEventListener('click', () => void load());
void load();
