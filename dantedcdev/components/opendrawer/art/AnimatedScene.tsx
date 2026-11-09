import { forwardRef, useCallback, useId, useImperativeHandle, useRef } from "react";
import { cleanId, V2 } from "./geometry";
import { BlockArrow, Inset, LINE, Stamp } from "./parts";
import { CLOSE_UP_K, CatchCloseUp, DrawerRig, cornerView, Frame } from "./scenes";
import { playClick, unlockAudio } from "../sound";

export interface SceneHandle {
  play: (opts: { delay: number; sound: boolean }) => void;
}

export type Variant = "open" | "close";

interface Key {
  t: number;
  at: number;
  ease?: string;
}

// How far apart the two catch pieces end up inside the close-up circle.
const INSET_TRAVEL = 3.2;

// The click happens where the drawer's motion changes. Pulling, the catch
// resists and then lets go. Pushing, the drawer slides home and then seats.
const MOTION: Record<Variant, { final: number; duration: number; clickAt: number; insetFinal: number; keys: Key[] }> = {
  open: {
    final: 26,
    duration: 760,
    clickAt: 240,
    insetFinal: INSET_TRAVEL,
    keys: [
      { t: 0, at: 0, ease: "cubic-bezier(.5,0,.9,.55)" },
      { t: 2.4, at: 240 / 760, ease: "cubic-bezier(.16,1,.3,1)" },
      { t: 26, at: 1 },
    ],
  },
  close: {
    final: 0,
    duration: 620,
    clickAt: 520,
    insetFinal: 0,
    keys: [
      { t: 26, at: 0, ease: "cubic-bezier(.3,.1,.3,1)" },
      { t: 1.6, at: 440 / 620, ease: "linear" },
      { t: 0, at: 520 / 620 },
      { t: 0, at: 1 },
    ],
  },
};

const COMPOSE: Record<Variant, { arrow: [V2, V2]; insetArrow: [V2, V2]; stamp: V2 }> = {
  open: { arrow: [[188, 200], [100, 219]], insetArrow: [[352, 281], [308, 288]], stamp: [212, 44] },
  close: { arrow: [[96, 196], [186, 177]], insetArrow: [[308, 288], [352, 281]], stamp: [268, 36] },
};

interface Props {
  variant: Variant;
  label: string;
  soundOn: boolean;
}

export const AnimatedScene = forwardRef<SceneHandle, Props>(function AnimatedScene({ variant, label, soundOn }, ref) {
  const v = cornerView(4.6, [250, 76]);
  const m = MOTION[variant];
  const c = COMPOSE[variant];
  const insetClip = "od" + cleanId(useId());
  const front = useRef<SVGGElement>(null);
  const box = useRef<SVGGElement>(null);
  const insetMove = useRef<SVGGElement>(null);
  const stamp = useRef<SVGGElement>(null);
  const running = useRef<Animation[]>([]);

  const play = useCallback<SceneHandle["play"]>(
    ({ delay, sound }) => {
      running.current.forEach((a) => a.cancel());
      running.current = [];
      if (sound) playClick((delay + m.clickAt) / 1000);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const offset = (from: number, unit: V2, final: number) =>
        `translate(${((from - final) * unit[0]).toFixed(2)}px, ${((from - final) * unit[1]).toFixed(2)}px)`;
      const options = { duration: m.duration, delay, fill: "backwards" as const };
      const frames = (map: (t: number) => number, unit: V2, final: number): Keyframe[] =>
        m.keys.map((k) => ({ transform: offset(map(k.t), unit, final), offset: k.at, easing: k.ease ?? "linear" }));

      const slide = frames((t) => t, v.uz, m.final);
      if (front.current) running.current.push(front.current.animate(slide, options));
      if (box.current) running.current.push(box.current.animate(slide, options));

      const insetUnit: V2 = [v.uz[0] * (CLOSE_UP_K / v.k), v.uz[1] * (CLOSE_UP_K / v.k)];
      if (insetMove.current) {
        running.current.push(insetMove.current.animate(frames((t) => Math.min(t, INSET_TRAVEL), insetUnit, m.insetFinal), options));
      }
      if (stamp.current) {
        running.current.push(
          stamp.current.animate(
            [
              { opacity: 0, transform: "scale(1.45)" },
              { opacity: 1, transform: "scale(1)" },
            ],
            { duration: 90, delay: delay + m.clickAt, easing: "cubic-bezier(.1,.8,.2,1)", fill: "backwards" }
          )
        );
      }
    },
    [m, v.k, v.uz]
  );

  useImperativeHandle(ref, () => ({ play }), [play]);

  const replay = () => {
    unlockAudio();
    play({ delay: 0, sound: soundOn });
  };

  return (
    <button type="button" className="replay" onClick={replay} aria-label="Replay this step">
      <Frame vb="0 0 400 310" label={label}>
        <DrawerRig v={v} d={m.final} hand frontRef={front} boxRef={box} />
        <BlockArrow from={c.arrow[0]} to={c.arrow[1]} />
        <Inset cx={328} cy={238} r={60} target={[238, 99]} clipId={insetClip}>
          <CatchCloseUp cx={328} cy={238} d={m.insetFinal} moveRef={insetMove} />
          <BlockArrow from={c.insetArrow[0]} to={c.insetArrow[1]} w={7} head={14} lw={LINE.mid} />
        </Inset>
        <Stamp x={c.stamp[0]} y={c.stamp[1]} innerRef={stamp} />
      </Frame>
    </button>
  );
});
