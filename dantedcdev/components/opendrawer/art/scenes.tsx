import { ReactNode, Ref, useEffect, useId, useRef } from "react";
import { View, cleanId, makeView, path, path3, planeMatrix, V2 } from "./geometry";
import {
  BAR_CENTER_Y,
  BAR_CENTER_Z,
  COLOR,
  CatchCabinetPiece,
  CatchDrawerPiece,
  Cavity,
  CurveArrow,
  DrawerBox,
  Fixture,
  Hand,
  Handle,
  LEFT_HANDLE,
  LINE,
  RIGHT_HANDLE,
  SidePanel,
  Slab,
  THICK,
  openingRegion,
} from "./parts";

export const CORNER = { az: 52, el: 16 };
const CABINET_CORNER = [90.3, 15.7, 0] as const;

export const cornerView = (k: number, to: V2): View => makeView({ k, ...CORNER, at: CABINET_CORNER, to });

export function Frame({ vb, label, children }: { vb: string; label: string; children: ReactNode }) {
  return (
    <svg viewBox={vb} role="img" aria-label={label} preserveAspectRatio="xMidYMid meet">
      {children}
    </svg>
  );
}

export interface RigProps {
  v: View;
  d: number;
  hand?: boolean;
  handAlpha?: number;
  tray?: boolean;
  sideDepth?: number;
  // Leaves out the cabinet side and its catch piece, for views from above.
  bare?: boolean;
  // Drawn behind the drawer front and the cabinet side.
  behind?: ReactNode;
  frontRef?: Ref<SVGGElement>;
  boxRef?: Ref<SVGGElement>;
}

// Paint order is what makes the mechanism read correctly. The drawer piece
// is drawn before the cabinet piece, so it passes underneath it.
export function DrawerRig({ v, d, hand, handAlpha, tray, sideDepth, bare, behind, frontRef, boxRef }: RigProps) {
  const clipId = "od" + cleanId(useId());
  return (
    <g>
      <clipPath id={clipId}>
        <path d={openingRegion(v)} />
      </clipPath>
      <Cavity v={v} />
      {behind}
      {bare ? null : <SidePanel v={v} depth={sideDepth} />}
      <g clipPath={`url(#${clipId})`}>
        <g ref={boxRef}>
          <DrawerBox v={v} d={d} tray={tray} />
        </g>
      </g>
      <g ref={frontRef}>
        <Slab v={v} d={d} />
        <Handle v={v} cx={LEFT_HANDLE} d={d} />
        <CatchDrawerPiece v={v} d={d} />
        <Handle
          v={v}
          cx={RIGHT_HANDLE}
          d={d}
          grip={hand ? <Hand v={v} x={RIGHT_HANDLE} y={BAR_CENTER_Y} z={THICK + d + BAR_CENTER_Z} alpha={handAlpha} /> : undefined}
        />
      </g>
      {bare ? null : <CatchCabinetPiece v={v} />}
    </g>
  );
}

export const CLOSE_UP_K = 12.5;

export function CatchCloseUp(props: { cx: number; cy: number; d: number; moveRef?: Ref<SVGGElement> }) {
  const { cx, cy, d, moveRef } = props;
  const v = makeView({ k: CLOSE_UP_K, ...CORNER, at: [92, 10.85, THICK + 0.6 + d * 0.5], to: [cx, cy] });
  return (
    <g>
      <SidePanel v={v} />
      <g ref={moveRef}>
        <Slab v={v} d={d} />
        <CatchDrawerPiece v={v} d={d} />
      </g>
      <CatchCabinetPiece v={v} />
    </g>
  );
}

export function SceneCover({ label }: { label: string }) {
  const v = cornerView(5, [289, 132]);
  return (
    <Frame vb="0 0 400 260" label={label}>
      <DrawerRig v={v} d={0} hand sideDepth={20} />
    </Frame>
  );
}

export function SceneApproach({ label }: { label: string }) {
  const v = cornerView(3.7, [272, 66]);
  const handZ = 54;
  const handAt = v.p([RIGHT_HANDLE, -4, handZ]);
  const target = v.p([RIGHT_HANDLE, BAR_CENTER_Y - 2, THICK + BAR_CENTER_Z + 3]);
  const start: V2 = [handAt[0] + 30, handAt[1] - 12];
  const via: V2 = [(start[0] + target[0]) / 2 + 22, (start[1] + target[1]) / 2 + 40];
  return (
    <Frame vb="0 0 400 320" label={label}>
      <DrawerRig v={v} d={0} />
      <Hand v={v} x={RIGHT_HANDLE} y={-4} z={handZ} scale={1.55} />
      <CurveArrow from={start} via={via} to={target} />
    </Frame>
  );
}

export function SceneGrip({ label }: { label: string }) {
  const v = makeView({ k: 7.4, az: 40, el: 12, at: [90, 15, THICK], to: [300, 76] });
  return (
    <Frame vb="0 0 400 260" label={label}>
      <DrawerRig v={v} d={0} hand handAlpha={0} />
      <CurveArrow from={[262, 246]} via={[240, 186]} to={[172, 148]} />
    </Frame>
  );
}

export function SceneUse({ label }: { label: string }) {
  const v = makeView({ k: 3.85, az: 8, el: 58, at: [0, 15.4, 0], to: [28, 44] });
  return (
    <Frame vb="0 0 400 320" label={label}>
      <DrawerRig v={v} d={40} tray bare />
    </Frame>
  );
}

export function SceneRegrip({ label }: { label: string }) {
  const v = cornerView(4.6, [250, 76]);
  return (
    <Frame vb="0 0 400 300" label={label}>
      <DrawerRig v={v} d={26} hand />
      <CurveArrow from={[168, 236]} via={[128, 208]} to={[84, 138]} />
    </Frame>
  );
}

const GUY_WIDTH = 240;
const Guy = ({ x, y }: { x: number; y: number }) => (
  <image href="/h2/thumbs-up-guy.webp" x={x} y={y} width={GUY_WIDTH} height={(GUY_WIDTH * 545) / 612} />
);

export function SceneFinished({ label }: { label: string }) {
  const v = cornerView(5, [289, 222]);
  const clipId = "od" + cleanId(useId());
  // Keeps him from showing below the drawer front, which only hides his upper half.
  const aboveMidline = path3(v, [[-40, 7, THICK], [130, 7, THICK], [130, 90, THICK], [-40, 90, THICK]]);
  return (
    <Frame vb="0 0 400 340" label={label}>
      <clipPath id={clipId}>
        <path d={aboveMidline} />
      </clipPath>
      <DrawerRig
        v={v}
        d={0}
        sideDepth={20}
        behind={
          <g clipPath={`url(#${clipId})`}>
            <Guy x={70} y={22} />
          </g>
        }
      />
    </Frame>
  );
}

function roundedRect(w: number, h: number, r: number): V2[] {
  const pts: V2[] = [];
  const corners: readonly (readonly [number, number, number])[] = [
    [w / 2 - r, h / 2 - r, 0],
    [-w / 2 + r, h / 2 - r, 90],
    [-w / 2 + r, -h / 2 + r, 180],
    [w / 2 - r, -h / 2 + r, 270],
  ];
  corners.forEach(([cx, cy, start]) => {
    for (let i = 0; i <= 6; i++) {
      const a = ((start + (90 * i) / 6) * Math.PI) / 180;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  });
  return pts;
}

// A generic wall thermostat, in the same projection and line weights as the drawer.
function Thermostat({ k, to }: { k: number; to: V2 }) {
  const v = makeView({ k, az: 26, el: 10, at: [0, 0, 1.8], to });
  const outline = roundedRect(12, 8.6, 1.2);
  const slice = (z: number) => path(outline.map((q) => v.p([q[0], q[1], z])));
  let all = "";
  for (let i = 0; i <= 12; i++) all += slice((1.8 * i) / 12);
  // Front-face details are authored in millimetres.
  const mm = (px: number) => px / (k * 0.1);
  const buttons: readonly (readonly [number, string])[] = [
    [-15, "M0 -6L6 3H-6Z"],
    [15, "M0 6L6 -3H-6Z"],
  ];
  return (
    <g strokeLinejoin="round">
      <path d={path(roundedRect(13.4, 10, 1.4).map((q) => v.p([q[0], q[1], 0])))} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={LINE.mid} />
      <path d={all} fill="none" stroke={COLOR.ink} strokeWidth={LINE.heavy * 2} />
      <path d={all} fill={COLOR.paper} stroke="none" />
      <path d={slice(1.8)} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={LINE.mid} />
      <g transform={planeMatrix(v, [0, 0, 1.8], [1, 0, 0], [0, -1, 0], 0.1)}>
        <rect x={-50} y={-30} width={68} height={42} rx={4} fill={COLOR.ink} />
        <text x={-16} y={2} textAnchor="middle" fontSize={32} fontWeight={700} fill={COLOR.paper}>
          72°
        </text>
        {buttons.map(([y, d]) => (
          <g key={y} transform={`translate(38 ${y - 6})`}>
            <circle r={11} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={mm(LINE.mid)} />
            <path d={d} fill={COLOR.ink} />
          </g>
        ))}
        <g stroke={COLOR.ink} strokeWidth={mm(LINE.mid)} strokeLinecap="round">
          {[-44, -32, -20, -8, 4, 16].map((x) => (
            <path key={x} d={`M${x} 24H${x + 7}`} />
          ))}
        </g>
      </g>
    </g>
  );
}

export function SceneThermostatCover({ label }: { label: string }) {
  return (
    <Frame vb="0 0 400 260" label={label}>
      <Thermostat k={23} to={[187, 130]} />
    </Frame>
  );
}

const GUY_DELAY_MS = 2000;
const GUY_HIDDEN = "translateY(175px)";

// He starts fully hidden behind the thermostat, then shoots up. The resting
// markup is the hidden pose, so he can't flash on screen before the script runs.
export function SceneThermostatDone({ label, active }: { label: string; active: boolean }) {
  const guy = useRef<SVGGElement>(null);
  const clipId = "od" + cleanId(useId());

  useEffect(() => {
    const el = guy.current;
    if (!el || !active) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rise = el.animate([{ transform: GUY_HIDDEN }, { transform: "translateY(0px)" }], {
      delay: GUY_DELAY_MS,
      duration: reduced ? 1 : 340,
      easing: "cubic-bezier(.16,1,.3,1)",
      fill: "both",
    });
    return () => rise.cancel();
  }, [active]);

  return (
    <Frame vb="0 0 400 380" label={label}>
      <clipPath id={clipId}>
        <rect x={0} y={-200} width={400} height={476} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <g ref={guy} style={{ transform: GUY_HIDDEN }}>
          <Guy x={66} y={14} />
        </g>
      </g>
      <Thermostat k={24} to={[184, 276]} />
    </Frame>
  );
}

export function SceneThermostat({ label }: { label: string }) {
  return (
    <Frame vb="0 0 400 320" label={label}>
      <Thermostat k={26} to={[184, 160]} />
    </Frame>
  );
}

const Check = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={11} fill={COLOR.yellow} stroke={COLOR.ink} strokeWidth={LINE.mid + 0.6} />
    <path d="M-5 .5L-1.2 4.5L5.5-4" fill="none" stroke={COLOR.ink} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

const Cross = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={11} fill={COLOR.red} stroke={COLOR.ink} strokeWidth={LINE.mid + 0.6} />
    <path d="M-4.5-4.5L4.5 4.5M4.5-4.5L-4.5 4.5" fill="none" stroke={COLOR.paper} strokeWidth={3.2} strokeLinecap="round" />
  </g>
);

export function ProTipArt() {
  return (
    <svg viewBox="0 0 150 74" aria-hidden="true" className="tipArt">
      <g stroke={COLOR.ink} strokeLinejoin="round">
        <rect x={2} y={4} width={146} height={30} fill={COLOR.paper} strokeWidth={LINE.heavy} />
        <rect x={25} y={18} width={26} height={4.5} fill={COLOR.paper} strokeWidth={LINE.mid} />
        <rect x={100} y={18} width={26} height={4.5} fill={COLOR.paper} strokeWidth={LINE.mid} />
        <rect x={129} y={9.5} width={19} height={8} fill={COLOR.ink} strokeWidth={LINE.fine} />
      </g>
      <Cross x={38} y={58} />
      <Check x={113} y={58} />
    </svg>
  );
}

export function WarningArt() {
  const v = cornerView(4.6, [42, 20]);
  return (
    <svg viewBox="0 0 130 96" aria-hidden="true" className="tipArt">
      <SidePanel v={v} depth={19} />
      <Fixture v={v} />
      <g transform="translate(-4 -19) rotate(-17 72 34)">
        <CatchCabinetPiece v={v} />
      </g>
      <g stroke={COLOR.ink} strokeWidth={LINE.mid + 0.4} strokeLinecap="round">
        <path d="M34 4L28 -1M50 -1L48 -7M18 16L10 14" transform="translate(4 8)" />
      </g>
      <Cross x={111} y={78} />
    </svg>
  );
}

export function HandIcon() {
  const v = makeView({ k: 4.4, az: 62, el: 12, at: [0, 0, 0], to: [36, 22] });
  return (
    <svg viewBox="0 0 56 44" aria-hidden="true" className="partIcon">
      <Hand v={v} x={0} y={0} z={0} />
    </svg>
  );
}

const stroke = { fill: "none", stroke: COLOR.ink, strokeWidth: 2.6, strokeLinejoin: "round", strokeLinecap: "round" } as const;

export const SPOT_ART: Record<string, ReactNode> = {
  catch: (
    <>
      <rect x={6} y={28} width={30} height={11} fill={COLOR.ink} />
      <rect x={32} y={20} width={27} height={11} fill={COLOR.ink} stroke={COLOR.paper} strokeWidth={1.4} />
      <path {...stroke} d="M44 44L40 40M18 46L18 52M32 44L33 50" />
    </>
  ),
  handles: (
    <>
      <path {...stroke} d="M4 30H24M8 30V36M20 30V36M40 30H60M44 30V36M56 30V36" />
      <path d="M45 16L50 21L59 10" {...stroke} strokeWidth={3.4} />
      <path d="M9 11L19 21M19 11L9 21" {...stroke} strokeWidth={3.4} />
    </>
  ),
  scale: (
    <>
      <rect x={17} y={9} width={14} height={9} fill={COLOR.ink} />
      <rect x={34} y={9} width={14} height={9} fill={COLOR.ink} />
      <path {...stroke} d="M8 20H56" />
      <path {...stroke} d="M14 20L10 56H54L50 20Z" />
      <path {...stroke} d="M22 32H42V44H22Z" />
    </>
  ),
  ticket: (
    <>
      <path {...stroke} d="M14 6H50V58H14Z" />
      <path {...stroke} d="M22 17H42M22 26H42M22 35H32" />
      <path {...stroke} strokeWidth={3.6} d="M36 40L47 51M47 40L36 51" />
    </>
  ),
  fell: (
    <>
      <rect x={14} y={14} width={36} height={13} fill={COLOR.ink} transform="rotate(-20 32 20)" />
      <path {...stroke} d="M16 38L14 44M32 34L32 42M48 30L51 37" />
      <path {...stroke} d="M6 57H58" />
    </>
  ),
  press: (
    <>
      <rect x={6} y={34} width={24} height={12} fill={COLOR.ink} />
      <rect x={36} y={34} width={22} height={12} fill={COLOR.ink} />
      <path {...stroke} d="M18 8V26M12 20L18 26L24 20M47 8V26M41 20L47 26L53 20" />
    </>
  ),
  white: (
    <>
      <rect x={6} y={36} width={52} height={12} fill={COLOR.ink} />
      <circle cx={32} cy={42} r={11} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={2.6} />
      <path {...stroke} d="M32 6V24M25 17L32 24L39 17" />
    </>
  ),
};
