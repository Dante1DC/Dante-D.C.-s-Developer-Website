// Parallel-projection helpers. The drawer is modelled in centimetres and every
// drawing is a projection of that model, so all views agree with each other.
//
// Model axes: x runs along the cabinet front (0 = left edge of the drawer),
// y is up, z points out of the cabinet toward the person using it.

export type V2 = readonly [number, number];
export type V3 = readonly [number, number, number];

export interface View {
  k: number;
  ux: V2;
  uy: V2;
  uz: V2;
  p: (v: V3) => V2;
}

// Output is rounded so server and browser trig agree during hydration.
const round = (n: number, places = 100) => Math.round(n * places) / places;

export function makeView(opts: { k: number; az: number; el: number; at: V3; to: V2 }): View {
  const { k, az, el, at, to } = opts;
  const a = (az * Math.PI) / 180;
  const e = (el * Math.PI) / 180;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const ce = Math.cos(e);
  const se = Math.sin(e);
  const ux: V2 = [k * ca, k * sa * se];
  const uy: V2 = [0, -k * ce];
  const uz: V2 = [-k * sa, k * ca * se];
  const raw = (v: V3): V2 => [
    v[0] * ux[0] + v[1] * uy[0] + v[2] * uz[0],
    v[0] * ux[1] + v[1] * uy[1] + v[2] * uz[1],
  ];
  const anchor = raw(at);
  const ox = to[0] - anchor[0];
  const oy = to[1] - anchor[1];
  return {
    k,
    ux,
    uy,
    uz,
    p: (v) => {
      const q = raw(v);
      return [round(q[0] + ox), round(q[1] + oy)];
    },
  };
}

export function path(pts: readonly V2[], close = true): string {
  return "M" + pts.map((q) => `${q[0]} ${q[1]}`).join("L") + (close ? "Z" : "");
}

export function path3(v: View, pts: readonly V3[], close = true): string {
  return path(pts.map(v.p), close);
}

// Convex hull (monotone chain), used for silhouettes and clip regions.
export function hull(points: readonly V2[]): V2[] {
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: V2, a: V2, b: V2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: V2[] = [];
  pts.forEach((p) => {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  });
  const upper: V2[] = [];
  pts.slice().reverse().forEach((p) => {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  });
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

// SVG matrix mapping a flat local drawing onto a plane in the model.
// One local unit equals `s` centimetres.
export function planeMatrix(v: View, o: V3, u: V3, w: V3, s = 1): string {
  const map = (d: V3): V2 => [
    s * (d[0] * v.ux[0] + d[1] * v.uy[0] + d[2] * v.uz[0]),
    s * (d[0] * v.ux[1] + d[1] * v.uy[1] + d[2] * v.uz[1]),
  ];
  const a = map(u);
  const b = map(w);
  const t = v.p(o);
  const r = (n: number) => round(n, 10000);
  return `matrix(${r(a[0])} ${r(a[1])} ${r(b[0])} ${r(b[1])} ${t[0]} ${t[1]})`;
}

export function circle3(v: View, c: V3, u: V3, w: V3, r: number, n = 24): string {
  const pts: V3[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const cu = Math.cos(a) * r;
    const su = Math.sin(a) * r;
    pts.push([c[0] + u[0] * cu + w[0] * su, c[1] + u[1] * cu + w[1] * su, c[2] + u[2] * cu + w[2] * su]);
  }
  return path3(v, pts);
}

// A hand-drawn looking break line between two points.
export function wavy(a: V2, b: V2, amp = 2.4, waves = 5): string {
  const n = waves * 6;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const pts: V2[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const off = Math.sin(t * waves * Math.PI * 2) * amp;
    pts.push([round(a[0] + dx * t + nx * off), round(a[1] + dy * t + ny * off)]);
  }
  return path(pts, false);
}

export function cleanId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "");
}
