import type { DimScore } from './scoring';

const CX = 200;
const CY = 172;
const R = 112;
const GRID = 'rgba(255,255,255,.14)';
const GOLD = '#d8b65a';
const GOLD_FILL = 'rgba(216,182,90,.28)';
const LABEL = '#9aa5ae';
const GROW_MS = 900;

type Point = readonly [number, number];

const angle = (i: number, n: number): number => -Math.PI / 2 + (i * 2 * Math.PI) / n;
const point = (i: number, n: number, r: number): Point => [
  CX + r * Math.cos(angle(i, n)),
  CY + r * Math.sin(angle(i, n)),
];
const fmt = (p: Point): string => p.map((v) => v.toFixed(1)).join(',');
const polygon = (points: ReadonlyArray<Point>): string => points.map(fmt).join(' ');
const easeOut = (k: number): number => 1 - Math.pow(1 - k, 3);

/** Dibuixa el radar de les set dimensions dins de l'SVG. Amb `animate`, el polígon creix des del centre. */
export function drawRadar(svg: SVGSVGElement, dims: ReadonlyArray<DimScore>, animate: boolean): void {
  const n = dims.length;
  const target = dims.map((d, i) => point(i, n, (R * d.pct) / 100));
  const centre = dims.map(() => [CX, CY] as const);
  let s = '';
  for (const level of [25, 50, 75, 100]) {
    s += `<polygon points="${polygon(dims.map((_, i) => point(i, n, (R * level) / 100)))}" fill="none" stroke="${GRID}" stroke-width="1"/>`;
  }
  dims.forEach((_, i) => {
    const [x, y] = point(i, n, R);
    s += `<line x1="${CX}" y1="${CY}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${GRID}" stroke-width="1"/>`;
  });
  s += `<polygon class="rpoly" points="${polygon(animate ? centre : target)}" fill="${GOLD_FILL}" stroke="${GOLD}" stroke-width="2" stroke-linejoin="round"/>`;
  target.forEach((p) => {
    s += `<circle class="rdot" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.5" fill="${GOLD}" opacity="${animate ? 0 : 1}"/>`;
  });
  dims.forEach((d, i) => {
    const [x, y] = point(i, n, R + 22);
    const c = Math.cos(angle(i, n));
    const anchor = Math.abs(c) < 0.2 ? 'middle' : c > 0 ? 'start' : 'end';
    s += `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${anchor}" font-family="IBM Plex Sans, Segoe UI, sans-serif" font-size="12" fill="${LABEL}">${d.dim}</text>`;
  });
  svg.innerHTML = s;

  if (!animate) return;
  const poly = svg.querySelector<SVGPolygonElement>('.rpoly');
  if (!poly) return;
  const t0 = performance.now();
  const tick = (now: number): void => {
    const k = Math.min(1, (now - t0) / GROW_MS);
    const e = easeOut(k);
    poly.setAttribute(
      'points',
      polygon(centre.map((c, i) => [c[0] + (target[i]![0] - c[0]) * e, c[1] + (target[i]![1] - c[1]) * e] as const)),
    );
    if (k < 1) requestAnimationFrame(tick);
    else svg.querySelectorAll('.rdot').forEach((dot) => dot.setAttribute('opacity', '1'));
  };
  requestAnimationFrame(tick);
}
