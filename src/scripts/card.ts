import { axisPoint, labelAnchor, valuePoints } from './geometry';
import type { Result } from './scoring';

/**
 * La targeta del resultat com a imatge (1080×1350, format 4:5), per desar-la o compartir-la.
 * Es dibuixa en un canvas amb la mateixa paleta que la pantalla de resultat.
 */

const W = 1080;
const H = 1350;
const POOL = '#14202b';
const GOLD = '#d8b65a';
const GOLD_FILL = 'rgba(216,182,90,.28)';
const GRID = 'rgba(255,255,255,.16)';
const TEXT = '#ffffff';
const MUTED = '#9aa5ae';
const SOFT = '#c9d0d6';
const SERIF = '"Newsreader", "Iowan Old Style", Georgia, serif';
const SANS = '"IBM Plex Sans", "Segoe UI", Roboto, sans-serif';

async function ensureFonts(): Promise<void> {
  if (!('fonts' in document)) return;
  try {
    await Promise.all([
      document.fonts.load(`300 200px ${SERIF}`),
      document.fonts.load(`italic 400 60px ${SERIF}`),
      document.fonts.load(`500 30px ${SANS}`),
    ]);
  } catch {
    /* sense les lletres web es dibuixa amb les del sistema */
  }
}

function drawRadar(ctx: CanvasRenderingContext2D, r: Result, cx: number, cy: number, R: number): void {
  const frame = { cx, cy, r: R };
  const n = r.dims.length;
  const trace = (points: ReadonlyArray<readonly [number, number]>): void => {
    ctx.beginPath();
    points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.closePath();
  };
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = GRID;
  for (const level of [25, 50, 75, 100]) {
    trace(r.dims.map((_, i) => axisPoint(frame, i, n, (R * level) / 100)));
    ctx.stroke();
  }
  r.dims.forEach((_, i) => {
    const [x, y] = axisPoint(frame, i, n, R);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();
  });
  const values = valuePoints(
    frame,
    r.dims.map((d) => d.pct),
  );
  trace(values);
  ctx.fillStyle = GOLD_FILL;
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.fillStyle = GOLD;
  values.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = MUTED;
  ctx.font = `500 24px ${SANS}`;
  r.dims.forEach((d, i) => {
    const [x, y] = axisPoint(frame, i, n, R + 40);
    const anchor = labelAnchor(i, n);
    ctx.textAlign = anchor === 'middle' ? 'center' : anchor === 'start' ? 'left' : 'right';
    ctx.fillText(d.dim, x, y + 8);
  });
}

function drawBars(ctx: CanvasRenderingContext2D, r: Result, top: number): void {
  const colW = 440;
  const gap = 80;
  const x0 = (W - (colW * 2 + gap)) / 2;
  const rowH = 74;
  r.dims.forEach((d, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i < 4 ? i : i - 4;
    const x = x0 + col * (colW + gap);
    const y = top + row * rowH;
    ctx.fillStyle = TEXT;
    ctx.font = `500 26px ${SANS}`;
    ctx.textAlign = 'left';
    ctx.fillText(d.dim, x, y);
    ctx.font = `400 30px ${SERIF}`;
    ctx.textAlign = 'right';
    ctx.fillText(`${d.pct} %`, x + colW, y + 2);
    ctx.fillStyle = 'rgba(255,255,255,.14)';
    ctx.fillRect(x, y + 16, colW, 6);
    ctx.fillStyle = GOLD;
    ctx.fillRect(x, y + 16, (colW * d.pct) / 100, 6);
  });
}

/** Dibuixa la targeta i retorna el PNG. */
export async function renderCard(r: Result): Promise<Blob> {
  await ensureFonts();
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('El navegador no pot dibuixar la imatge.');

  ctx.fillStyle = POOL;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 260, 40, W / 2, 260, 700);
  glow.addColorStop(0, 'rgba(216,182,90,.16)');
  glow.addColorStop(1, 'rgba(216,182,90,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';
  ctx.fillStyle = SOFT;
  ctx.font = `italic 400 40px ${SERIF}`;
  ctx.fillText('Com de narcisista ets?', W / 2, 96);
  ctx.fillStyle = MUTED;
  ctx.font = `400 24px ${SANS}`;
  ctx.fillText('Autotest del Treball de Recerca «Narcís entre nosaltres»', W / 2, 138);

  ctx.fillStyle = TEXT;
  ctx.font = `300 300px ${SERIF}`;
  ctx.textAlign = 'left';
  const pctText = String(r.pct);
  const pctW = ctx.measureText(pctText).width;
  ctx.font = `italic 400 96px ${SERIF}`;
  const signW = ctx.measureText('%').width;
  const start = (W - pctW - signW - 10) / 2;
  ctx.font = `300 300px ${SERIF}`;
  ctx.fillText(pctText, start, 420);
  ctx.fillStyle = GOLD;
  ctx.font = `italic 400 96px ${SERIF}`;
  ctx.fillText('%', start + pctW + 10, 420);

  ctx.textAlign = 'center';
  ctx.fillStyle = GOLD;
  ctx.font = `italic 400 64px ${SERIF}`;
  ctx.fillText(r.band.name, W / 2, 505);
  ctx.fillStyle = MUTED;
  ctx.font = `400 24px ${SANS}`;
  ctx.fillText('tret de personalitat, no un diagnòstic', W / 2, 548);

  drawRadar(ctx, r, W / 2, 800, 190);
  drawBars(ctx, r, 1075);

  ctx.textAlign = 'center';
  ctx.fillStyle = MUTED;
  ctx.font = `500 26px ${SANS}`;
  ctx.fillText('maginer.com', W / 2, 1312);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No s'ha pogut generar la imatge."))),
      'image/png',
    );
  });
}

export function cardFile(blob: Blob): File {
  return new File([blob], 'quant-de-narcisista-ets.png', { type: 'image/png' });
}

/** Desa la imatge al dispositiu. */
export function downloadCard(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quant-de-narcisista-ets.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
