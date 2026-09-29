// Pages Function: desa i llegeix els resultats anònims de l'autotest (D1, binding `DB`).
// No es desa cap dada personal: ni nom, ni correu, ni IP. El càlcul es refà aquí.
import { parseAnswers, toCsv, toRow, type StoredRow } from '../../src/scripts/submission';

interface Env {
  DB: D1Database;
}

const ALLOWED_ORIGINS = new Set([
  'https://maginer.com',
  'https://www.maginer.com',
  'https://maginer-tr.pages.dev',
  'http://localhost:4321',
  'http://127.0.0.1:8788',
]);
const MAX_BODY_BYTES = 2048;
const MAX_ROWS = 10000;

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return json({ error: 'Origen no permès.' }, 403);
  if (!(request.headers.get('Content-Type') ?? '').includes('application/json')) {
    return json({ error: 'Cal enviar JSON.' }, 415);
  }
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return json({ error: 'Petició massa gran.' }, 413);

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ error: 'JSON no vàlid.' }, 400);
  }
  const answers = parseAnswers((body as { answers?: unknown } | null)?.answers);
  if (!answers) return json({ error: "Calen 21 respostes de l'1 al 5." }, 400);

  const row = toRow(answers, new Date());
  try {
    await env.DB.prepare('INSERT INTO resultats (created_at, answers, pct, band, dims) VALUES (?1, ?2, ?3, ?4, ?5)')
      .bind(row.created_at, row.answers, row.pct, row.band, row.dims)
      .run();
  } catch (e) {
    console.error('D1 insert failed', e);
    return json({ error: "No s'ha pogut desar el resultat." }, 500);
  }
  return json({ ok: true, pct: row.pct, band: row.band }, 201);
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  let rows: StoredRow[];
  try {
    const res = await env.DB.prepare(
      'SELECT id, created_at, answers, pct, band, dims FROM resultats ORDER BY id DESC LIMIT ?1',
    )
      .bind(MAX_ROWS)
      .all<StoredRow>();
    rows = res.results ?? [];
  } catch (e) {
    console.error('D1 select failed', e);
    return json({ error: "No s'han pogut llegir els resultats." }, 500);
  }

  if (new URL(request.url).searchParams.get('format') === 'csv') {
    return new Response(toCsv(rows), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="resultats-autotest.csv"',
        'Cache-Control': 'no-store',
      },
    });
  }
  return json({ count: rows.length, rows });
};
