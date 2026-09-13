/** Geometria compartida del radar de set dimensions (pantalla i imatge). */

export type Point = readonly [number, number];

export interface RadarFrame {
  cx: number;
  cy: number;
  r: number;
}

/** Angle de l'eix i-èsim de n, començant a dalt i girant en sentit horari. */
export function axisAngle(i: number, n: number): number {
  return -Math.PI / 2 + (i * 2 * Math.PI) / n;
}

/** Punt sobre l'eix i-èsim a una distància `radius` del centre. */
export function axisPoint(frame: RadarFrame, i: number, n: number, radius: number): Point {
  const a = axisAngle(i, n);
  return [frame.cx + radius * Math.cos(a), frame.cy + radius * Math.sin(a)];
}

/** Vèrtexs del polígon d'una sèrie de percentatges (0 a 100), un per eix. */
export function valuePoints(frame: RadarFrame, values: ReadonlyArray<number>): Point[] {
  return values.map((v, i) => axisPoint(frame, i, values.length, (frame.r * v) / 100));
}

/** Alineació del text d'una etiqueta segons la posició de l'eix. */
export function labelAnchor(i: number, n: number): 'start' | 'middle' | 'end' {
  const c = Math.cos(axisAngle(i, n));
  return Math.abs(c) < 0.2 ? 'middle' : c > 0 ? 'start' : 'end';
}

export const easeOutCubic = (k: number): number => 1 - Math.pow(1 - k, 3);
