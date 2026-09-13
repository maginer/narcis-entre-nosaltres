import { axisPoint, easeOutCubic, labelAnchor, valuePoints, type RadarFrame } from './geometry';
import type { DimScore } from './scoring';

const FRAME: RadarFrame = { cx: 200, cy: 172, r: 112 };
const GRID = 'rgba(255,255,255,.14)';
const GOLD = '#d8b65a';
const GOLD_FILL = 'rgba(216,182,90,.28)';
const LABEL = '#9aa5ae';
const GROW_MS = 900;

const fmt = (p: readonly [number, number]): string => p.map((v) => v.toFixed(1)).join(',');
const polygon = (points: ReadonlyArray<readonly [number, number]>): string => points.map(fmt).join(' ');

let generation = 0;

/** Dibuixa el radar de les set dimensions dins de l'SVG. Amb `animate`, el polígon creix des del centre. */
export function drawRadar(svg: SVGSVGElement, dims: ReadonlyArray<DimScore>, animate: boolean): void {
  const n = dims.length;
  const target = valuePoints(
    FRAME,
    dims.map((d) => d.pct),
  );
  const centre = dims.map(() => [FRAME.cx, FRAME.cy] as const);
  let s = '';
  for (const level of [25, 50, 75, 100]) {
    s += `<polygon points="${polygon(dims.map((_, i) => axisPoint(FRAME, i, n, (FRAME.r * level) / 100)))}" fill="none" stroke="${GRID}" stroke-width="1"/>`;
  }
  dims.forEach((_, i) => {
    const [x, y] = axisPoint(FRAME, i, n, FRAME.r);
    s += `<line x1="${FRAME.cx}" y1="${FRAME.cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${GRID}" stroke-width="1"/>`;
  });
  s += `<polygon class="rpoly" points="${polygon(animate ? centre : target)}" fill="${GOLD_FILL}" stroke="${GOLD}" stroke-width="2" stroke-linejoin="round"/>`;
  target.forEach((p) => {
    s += `<circle class="rdot" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.5" fill="${GOLD}" opacity="${animate ? 0 : 1}"/>`;
  });
  dims.forEach((d, i) => {
    const [x, y] = axisPoint(FRAME, i, n, FRAME.r + 22);
    s += `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${labelAnchor(i, n)}" font-family="IBM Plex Sans, Segoe UI, sans-serif" font-size="12" fill="${LABEL}">${d.dim}</text>`;
  });
  svg.innerHTML = s;

  // Un dibuix nou invalida l'animació anterior: cada quadre comprova que encara sigui l'últim.
  const mine = ++generation;
  if (!animate) return;
  const poly = svg.querySelector<SVGPolygonElement>('.rpoly');
  if (!poly) return;
  const t0 = performance.now();
  const tick = (now: number): void => {
    if (mine !== generation) return;
    const k = Math.min(1, (now - t0) / GROW_MS);
    const e = easeOutCubic(k);
    poly.setAttribute(
      'points',
      polygon(centre.map((c, i) => [c[0] + (target[i]![0] - c[0]) * e, c[1] + (target[i]![1] - c[1]) * e] as const)),
    );
    if (k < 1) requestAnimationFrame(tick);
    else svg.querySelectorAll('.rdot').forEach((dot) => dot.setAttribute('opacity', '1'));
  };
  requestAnimationFrame(tick);
}
