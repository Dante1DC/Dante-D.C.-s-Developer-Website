import { ReactNode, Ref } from "react";
import { V2, V3, View, circle3, hull, path, path3, planeMatrix, wavy } from "./geometry";

export const COLOR = { ink: "#141414", paper: "#fff", yellow: "#ffc800", red: "#d6181f" };
export const LINE = { heavy: 2.6, mid: 1.6, fine: 0.8 };

// Real proportions, measured from drawer_1.jpg and drawer_2.jpg (centimetres).
export const WIDTH = 90;
export const HEIGHT = 15;
export const THICK = 1.9;
export const RIGHT_HANDLE = 68.4;
export const LEFT_HANDLE = 21.6;
const HANDLE_LENGTH = 11.4;
const BAR_Y: V2 = [7.1, 8.1];
const BAR_Z: V2 = [3.65, 4.35];
export const BAR_CENTER_Y = 7.6;
export const BAR_CENTER_Z = 4;
const SIDE_X = 90.3;
const OPENING_TOP = 15.4;

type Range = readonly [number, number];

function Prism(props: {
  v: View;
  x: Range;
  y: Range;
  z: Range;
  face?: string;
  top?: string;
  side?: string;
  lw?: number;
}) {
  const { v, x, y, z, face = COLOR.paper, top = COLOR.paper, side = COLOR.paper, lw = LINE.mid } = props;
  return (
    <g stroke={COLOR.ink} strokeWidth={lw} strokeLinejoin="round">
      <path fill={top} d={path3(v, [[x[0], y[1], z[0]], [x[1], y[1], z[0]], [x[1], y[1], z[1]], [x[0], y[1], z[1]]])} />
      <path fill={side} d={path3(v, [[x[1], y[0], z[0]], [x[1], y[1], z[0]], [x[1], y[1], z[1]], [x[1], y[0], z[1]]])} />
      <path fill={face} d={path3(v, [[x[0], y[0], z[1]], [x[1], y[0], z[1]], [x[1], y[1], z[1]], [x[0], y[1], z[1]]])} />
    </g>
  );
}

// Sparse strokes standing in for the laminate's vertical grain.
const GRAIN: readonly (readonly [number, number, number])[] = [
  [3.4, 2, 13], [6.8, 6, 15], [11.5, 0, 8.5], [16, 4, 14], [27.5, 7, 15], [31, 0, 6.5], [37.5, 3.5, 12],
  [52.5, 0, 6], [57.5, 9.5, 15], [62, 1, 5], [76, 0, 7], [83.5, 0, 6.5], [86.2, 2.5, 7.5], [88.6, 0, 11],
];

export function Slab({ v, d }: { v: View; d: number }) {
  const z: Range = [d, THICK + d];
  const corners: V3[] = [];
  [0, WIDTH].forEach((x) => [0, HEIGHT].forEach((y) => z.forEach((zz) => corners.push([x, y, zz]))));
  return (
    <g>
      <Prism v={v} x={[0, WIDTH]} y={[0, HEIGHT]} z={z} />
      <g stroke={COLOR.ink} strokeWidth={LINE.fine} strokeLinecap="round">
        {GRAIN.map(([x, a, b]) => (
          <path key={x} d={path3(v, [[x, a, z[1]], [x, b, z[1]]], false)} />
        ))}
      </g>
      <g transform={planeMatrix(v, [45, 8, z[1]], [1, 0, 0], [0, -1, 0], 0.1)}>
        <rect x={-20} y={-6.5} width={40} height={13} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={1.4} />
        <text textAnchor="middle" y={3} fontSize={8.5} fontWeight={700} fill={COLOR.ink}>
          Utensils
        </text>
      </g>
      <path d={path(hull(corners.map(v.p)))} fill="none" stroke={COLOR.ink} strokeWidth={LINE.heavy} strokeLinejoin="round" />
    </g>
  );
}

// A flat outline extruded along x, drawn as a real silhouette: every slice is
// stroked first, then every slice is filled, which leaves only the outer edge.
function Extrude(props: { v: View; shape: readonly V2[]; front?: readonly V2[]; x0: number; x1: number; y: number; z: number; fill: string }) {
  const { v, shape, front, x0, x1, y, z, fill } = props;
  const at = (pts: readonly V2[], x: number, close: boolean) => path(pts.map((q) => v.p([x, y + q[1], z + q[0]])), close);
  const n = 26;
  let all = "";
  for (let i = 0; i <= n; i++) all += at(shape, x0 + ((x1 - x0) * i) / n, true);
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d={all} fill="none" stroke={COLOR.ink} strokeWidth={LINE.heavy * 2} />
      <path d={all} fill={fill} stroke="none" />
      <path d={at(front ?? shape, x1, !front)} fill="none" stroke={COLOR.ink} strokeWidth={LINE.mid} />
    </g>
  );
}

function rotated(points: readonly V2[], alpha: number): V2[] {
  const a = (alpha * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return points.map((q) => [q[0] * c + q[1] * s, -q[0] * s + q[1] * c] as const);
}

// The outer radius stays smaller than the bar's distance from the drawer face,
// so the hand can never pass through the drawer.
const HAND_RADIUS = 3.85;
const HAND_INNER = 1.45;
const HAND_HALF_WIDTH = 1.2;

function arc(radius: number, from: number, to: number, n: number): V2[] {
  const pts: V2[] = [];
  for (let i = 0; i <= n; i++) {
    const t = from + ((to - from) * i) / n;
    pts.push([radius * Math.cos(t), radius * Math.sin(t)]);
  }
  return pts;
}

// One continuous outline for clip and wrist, so no line divides them.
// `claw` is the same outline without the wrist, for the front-face edge.
function handOutline(scale: number): { outline: V2[]; claw: V2[] } {
  const R = HAND_RADIUS * scale;
  const r = HAND_INNER * scale;
  const peg = 1.5 * scale;
  const pegEnd = R + 2.7 * scale;
  const end = Math.PI - (40 * Math.PI) / 180;
  const pegAngle = Math.asin(peg / R);
  const lower = arc(R, -end, -pegAngle, 14);
  const upper = arc(R, pegAngle, end, 14);
  const inner = arc(r, end, -end, 28);
  const wrist: V2[] = [[pegEnd, -peg], [pegEnd, peg]];
  return { outline: lower.concat(wrist, upper, inner), claw: upper.concat(inner, lower) };
}

// The toy hand: a yellow C-clip and its wrist peg, and nothing else.
// The clip's plane is perpendicular to the bar it grips, as on the real toy.
export function Hand(props: { v: View; x: number; y: number; z: number; alpha?: number; scale?: number }) {
  const { v, x, y, z, alpha = 5, scale = 1 } = props;
  const { outline, claw } = handOutline(scale);
  const half = HAND_HALF_WIDTH * scale;
  return <Extrude v={v} shape={rotated(outline, alpha)} front={rotated(claw, alpha)} x0={x - half} x1={x + half} y={y} z={z} fill={COLOR.yellow} />;
}

// The part of a gripped bar nearer the camera than the hand. It has no edge
// where it leaves the hand, so the bar reads as one piece passing through.
function NearBar({ v, x0, x1, z }: { v: View; x0: number; x1: number; z: Range }) {
  const [y0, y1] = BAR_Y;
  const edge = (y: number, zz: number) => path3(v, [[x0, y, zz], [x1, y, zz]], false);
  return (
    <g>
      <path fill={COLOR.paper} d={path3(v, [[x0, y1, z[0]], [x1, y1, z[0]], [x1, y1, z[1]], [x0, y1, z[1]]])} />
      <path fill={COLOR.paper} d={path3(v, [[x0, y0, z[1]], [x1, y0, z[1]], [x1, y1, z[1]], [x0, y1, z[1]]])} />
      <path
        fill={COLOR.paper}
        stroke={COLOR.ink}
        strokeWidth={LINE.mid}
        strokeLinejoin="round"
        d={path3(v, [[x1, y0, z[0]], [x1, y1, z[0]], [x1, y1, z[1]], [x1, y0, z[1]]])}
      />
      <path stroke={COLOR.ink} strokeWidth={LINE.mid} fill="none" d={edge(y1, z[0]) + edge(y1, z[1]) + edge(y0, z[1])} />
    </g>
  );
}

// Back to front, as the camera sees it from the right: far leg, bar, hand,
// near leg, then the stretch of bar in front of the hand.
export function Handle({ v, cx, d, grip }: { v: View; cx: number; d: number; grip?: ReactNode }) {
  const x0 = cx - HANDLE_LENGTH / 2;
  const x1 = cx + HANDLE_LENGTH / 2;
  const face = THICK + d;
  const barZ: Range = [face + BAR_Z[0], face + BAR_Z[1]];
  const farLeg = <Prism v={v} x={[x0, x0 + 1]} y={BAR_Y} z={[face, barZ[0]]} />;
  const nearLeg = <Prism v={v} x={[x1 - 1, x1]} y={BAR_Y} z={[face, barZ[0]]} />;
  const fullBar = <Prism v={v} x={[x0, x1]} y={BAR_Y} z={barZ} />;
  if (!grip) {
    return (
      <g>
        {farLeg}
        {nearLeg}
        {fullBar}
      </g>
    );
  }
  return (
    <g>
      {farLeg}
      {fullBar}
      {grip}
      {nearLeg}
      <NearBar v={v} x0={cx + HAND_HALF_WIDTH} x1={x1} z={barZ} />
    </g>
  );
}

// The black piece fixed to the drawer face. It travels with the drawer.
export function CatchDrawerPiece({ v, d }: { v: View; d: number }) {
  const z0 = THICK + d;
  const z1 = z0 + 0.55;
  return (
    <g>
      <path
        d={circle3(v, [92.9, 10.85, z1 - 0.2], [1, 0, 0], [0, 1, 0], 1.15)}
        fill={COLOR.paper}
        stroke={COLOR.ink}
        strokeWidth={LINE.mid}
      />
      <Prism v={v} x={[79.5, 92.9]} y={[8.6, 13.1]} z={[z0, z1]} face={COLOR.ink} />
      <g
        transform={planeMatrix(v, [79.5, 13.1, z1], [1, 0, 0], [0, -1, 0])}
        fill="none"
        stroke={COLOR.paper}
        strokeWidth={0.22}
        strokeLinecap="round"
      >
        <path d="M2.9 .6H1.3Q.7 .6 .7 1.2V3.3Q.7 3.9 1.3 3.9H2.9" />
        <circle cx={3.8} cy={2.25} r={0.3} />
      </g>
    </g>
  );
}

// The black piece fixed to the side of the cabinet. It never moves. When the
// drawer closes, the drawer piece clicks underneath the front end of this one.
export function CatchCabinetPiece({ v }: { v: View }) {
  const x: Range = [92.95, 93.5];
  const y: Range = [8.4, 13.3];
  const z: Range = [-15, THICK + 1.2];
  return (
    <g>
      <Prism v={v} x={x} y={y} z={z} side={COLOR.ink} />
      <g
        transform={planeMatrix(v, [x[1], y[1], z[1]], [0, 0, -1], [0, -1, 0])}
        fill="none"
        stroke={COLOR.paper}
        strokeWidth={0.24}
        strokeLinecap="round"
      >
        <path d="M3.2 .6H1.4Q.8 .6 .8 1.2V3.7Q.8 4.3 1.4 4.3H3.2" />
        <circle cx={4.3} cy={2.45} r={0.3} />
        <path d="M16.6 .8V4.1" />
      </g>
      <Fixture v={v} />
    </g>
  );
}

export function Fixture({ v }: { v: View }) {
  return (
    <path
      d={circle3(v, [93.7, 10.85, -15.4], [0, 0, 1], [0, 1, 0], 0.95)}
      fill={COLOR.paper}
      stroke={COLOR.ink}
      strokeWidth={LINE.mid}
    />
  );
}

export function SidePanel({ v, depth = 26 }: { v: View; depth?: number }) {
  const top = OPENING_TOP + 0.3;
  const a = v.p([SIDE_X, top, -depth]);
  const b = v.p([SIDE_X, -3, -depth]);
  const c = v.p([SIDE_X, -3, 0]);
  return (
    <g>
      <path d={path3(v, [[SIDE_X, top, 0], [SIDE_X, top, -depth], [SIDE_X, -3, -depth], [SIDE_X, -3, 0]])} fill={COLOR.paper} />
      <path d={path3(v, [[SIDE_X, -3, 0], [SIDE_X, top, 0], [SIDE_X, top, -depth]], false)} fill="none" stroke={COLOR.ink} strokeWidth={LINE.heavy} strokeLinejoin="round" />
      <g fill="none" stroke={COLOR.ink} strokeWidth={LINE.mid}>
        <path d={wavy(a, b, 1.6, 3)} />
        <path d={wavy(b, c, 1.6, 4)} />
      </g>
    </g>
  );
}

export function Cavity({ v }: { v: View }) {
  const lines: number[] = [];
  for (let x = 1.2; x < WIDTH; x += 1.5) lines.push(x);
  return (
    <g>
      <path d={path3(v, [[0, 0, 0], [WIDTH, 0, 0], [WIDTH, OPENING_TOP, 0], [0, OPENING_TOP, 0]])} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={LINE.heavy} strokeLinejoin="round" />
      <g stroke={COLOR.ink} strokeWidth={LINE.fine}>
        {lines.map((x) => (
          <path key={x} d={path3(v, [[x, 0, 0], [x, OPENING_TOP, 0]], false)} />
        ))}
      </g>
    </g>
  );
}

// Everything that can be seen of the drawer leaving the cabinet is inside this region.
export function openingRegion(v: View): string {
  const pts: V2[] = [];
  [0, WIDTH].forEach((x) => [0, OPENING_TOP].forEach((y) => [0, 140].forEach((z) => pts.push(v.p([x, y, z])))));
  return path(hull(pts));
}

const FORK = "M-.35 0Q0 -.5 .35 0L.45 10Q1.05 11 1.05 13V19H.62V14.4H.21V19H-.21V14.4H-.62V19H-1.05V13Q-1.05 11 -.45 10Z";
const SPOON = "M-.35 0Q0 -.5 .35 0L.4 11Q1.5 12.2 1.5 15.2Q1.5 19 0 19Q-1.5 19 -1.5 15.2Q-1.5 12.2 -.4 11Z";
const KNIFE = "M-.55 0Q0 -.6 .55 0V8.5H.7V20Q.7 20.5 .1 20.5Q-.7 19.5 -.7 16V8.5H-.55Z";
const SPATULA = "M-.4 0Q0 -.5 .4 0L.45 15L2.6 15.6V24H-2.6V15.6L-.45 15Z";

const CUTLERY: readonly (readonly [string, number, number, number?])[] = [
  [KNIFE, 3.4, 8], [KNIFE, 7, 9.5], [KNIFE, 10.2, 8.4],
  [FORK, 17.2, 9], [FORK, 21.4, 7.6], [FORK, 25.6, 9.2],
  [SPOON, 34.2, 8.6], [SPOON, 38.6, 9.8], [SPOON, 43, 8.2],
  [SPATULA, 54, 5.2], [SPOON, 62.5, 7, 1.35],
];

function CutleryTray({ v, d }: { v: View; d: number }) {
  const lw = 1.5 / v.k;
  return (
    <g transform={planeMatrix(v, [10, 2, d - 1], [1, 0, 0], [0, 0, -1])} stroke={COLOR.ink} strokeWidth={lw} strokeLinejoin="round">
      <rect x={0} y={0} width={70} height={36} fill={COLOR.paper} strokeWidth={lw * 1.5} rx={1} />
      {[13.5, 30.5, 47.5].map((a) => (
        <path key={a} d={`M${a} 0V36`} fill="none" />
      ))}
      {CUTLERY.map(([d2, a, b, s = 1], i) => (
        <g key={i} transform={`translate(${a} ${b}) scale(${s})`} fill={COLOR.paper}>
          <path d={d2} strokeWidth={lw / s} />
        </g>
      ))}
    </g>
  );
}

export function DrawerBox({ v, d, tray }: { v: View; d: number; tray?: boolean }) {
  const front = d;
  const back = d - 46;
  const z: Range = [back, front];
  return (
    <g>
      <path d={path3(v, [[2.7, 1.5, back], [87.3, 1.5, back], [87.3, 1.5, front], [2.7, 1.5, front]])} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={LINE.mid} />
      <Prism v={v} x={[1.5, 2.7]} y={[1.5, 11]} z={z} />
      {tray ? <CutleryTray v={v} d={d} /> : null}
      <Prism v={v} x={[87.3, 88.5]} y={[1.5, 11]} z={z} />
      <path d={path3(v, [[88.5, 3.8, back], [88.5, 3.8, front], [88.5, 5.2, front], [88.5, 5.2, back]])} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={LINE.fine} />
    </g>
  );
}

export function CurveArrow({ from, via, to }: { from: V2; via: V2; to: V2 }) {
  const angle = Math.atan2(to[1] - via[1], to[0] - via[0]);
  const size = 15;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const point = (back: number, side: number): V2 => [
    Math.round((to[0] - c * back - s * side) * 100) / 100,
    Math.round((to[1] - s * back + c * side) * 100) / 100,
  ];
  const stem = point(size * 0.8, 0);
  return (
    <g>
      <path d={`M${from[0]} ${from[1]}Q${via[0]} ${via[1]} ${stem[0]} ${stem[1]}`} fill="none" stroke={COLOR.red} strokeWidth={3.4} strokeDasharray="8 6" />
      <path d={path([to, point(size, size * 0.62), point(size, -size * 0.62)])} fill={COLOR.red} stroke={COLOR.ink} strokeWidth={LINE.mid} strokeLinejoin="round" />
    </g>
  );
}

export function BlockArrow({ from, to, w = 14, head = 28, lw = LINE.heavy }: { from: V2; to: V2; w?: number; head?: number; lw?: number }) {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
  const ux = (to[0] - from[0]) / len;
  const uy = (to[1] - from[1]) / len;
  const nx = -uy;
  const ny = ux;
  const bx = to[0] - ux * head;
  const by = to[1] - uy * head;
  const r = (n: number) => Math.round(n * 100) / 100;
  const pts: V2[] = [
    [r(from[0] + (nx * w) / 2), r(from[1] + (ny * w) / 2)],
    [r(bx + (nx * w) / 2), r(by + (ny * w) / 2)],
    [r(bx + nx * w * 1.05), r(by + ny * w * 1.05)],
    to,
    [r(bx - nx * w * 1.05), r(by - ny * w * 1.05)],
    [r(bx - (nx * w) / 2), r(by - (ny * w) / 2)],
    [r(from[0] - (nx * w) / 2), r(from[1] - (ny * w) / 2)],
  ];
  return <path d={path(pts)} fill={COLOR.red} stroke={COLOR.ink} strokeWidth={lw} strokeLinejoin="round" />;
}

export function Stamp({ x, y, rot = -6, innerRef }: { x: number; y: number; rot?: number; innerRef?: Ref<SVGGElement> }) {
  const jitter = [1, 0.9, 1.08, 0.94, 1.04, 0.88, 1.1, 0.92, 1.02, 0.9, 1.06];
  const pts: V2[] = [];
  const spikes = jitter.length;
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const m = i % 2 === 0 ? jitter[i / 2] : 0.72;
    pts.push([Math.round(Math.cos(a) * 56 * m * 100) / 100, Math.round(Math.sin(a) * 34 * m * 100) / 100]);
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <g ref={innerRef} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <path d={path(pts)} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={LINE.heavy} strokeLinejoin="round" />
        <text textAnchor="middle" y={7.5} fontSize={21} fontWeight={900} fill={COLOR.ink}>
          CLICK!
        </text>
      </g>
    </g>
  );
}

export function Inset(props: { cx: number; cy: number; r: number; target: V2; clipId: string; children: ReactNode }) {
  const { cx, cy, r, target, clipId, children } = props;
  return (
    <g>
      <path d={`M${target[0]} ${target[1]}L${cx} ${cy}`} stroke={COLOR.ink} strokeWidth={LINE.mid} />
      <circle cx={target[0]} cy={target[1]} r={13} fill="none" stroke={COLOR.ink} strokeWidth={LINE.mid} />
      <clipPath id={clipId}>
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
      <circle cx={cx} cy={cy} r={r} fill={COLOR.paper} />
      <g clipPath={`url(#${clipId})`}>{children}</g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={COLOR.ink} strokeWidth={3.2} />
    </g>
  );
}
