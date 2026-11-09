import { CSSProperties, PointerEvent, ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./booklet.module.css";
import { Manual, PageDef, hrefFor, indexFromQuery } from "./manifest";
import { FACTS, SpotArt, Step, TROUBLE } from "./content";
import { AnimatedScene, SceneHandle, Variant } from "./art/AnimatedScene";
import { SPOT_ART, HandIcon, ProTipArt, WarningArt } from "./art/scenes";
import { musicIsPlaying, pauseMusic, playMusic, readSoundPref, stopMusic, unlockAudio, writeSoundPref } from "./sound";

const TURN_MS = 320;
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(" ");

// The stylesheet owns the breakpoint and publishes it through --spread.
const inSpreadLayout = (el: HTMLElement | null) =>
  !!el && getComputedStyle(el).getPropertyValue("--spread").trim() === "1";

const visiblePages = (pages: PageDef[], index: number, spread: boolean) =>
  pages.map((_, i) => i).filter((i) => (spread ? pages[i].spread === pages[index].spread : i === index));

function Heading({ children, className }: { children: ReactNode; className: string }) {
  return (
    <h2 className={className} tabIndex={-1} data-heading="">
      {children}
    </h2>
  );
}

function TipPanel({ tip }: { tip: NonNullable<Step["tip"]> }) {
  const pro = tip.kind === "pro";
  return (
    <aside className={styles.panel}>
      <div className={styles.panelArt}>{pro ? <ProTipArt /> : <WarningArt />}</div>
      <div>
        <p className={cx(styles.tag, pro ? styles.tagPro : styles.tagWarn)}>{pro ? "Pro tip" : "Warning"}</p>
        <p className={styles.panelText}>{tip.text}</p>
      </div>
    </aside>
  );
}

function StepSheet(props: {
  index: number;
  step: Step;
  soundOn: boolean;
  variant?: Variant;
  still?: (label: string) => ReactNode;
  bindScene: (h: SceneHandle | null) => void;
}) {
  const { index, step, soundOn, variant, still, bindScene } = props;
  return (
    <div className={styles.sheet}>
      <header className={styles.head}>
        <p className={styles.num} aria-hidden="true">
          {step.n}
        </p>
        <div className={styles.headText}>
          <Heading className={styles.title}>
            <span className={styles.srOnly}>Step {step.n}: </span>
            {step.title}
          </Heading>
          {step.note ? <p className={styles.note}>{step.note}</p> : null}
        </div>
      </header>
      <div className={styles.art}>
        {variant ? (
          <>
            <AnimatedScene ref={bindScene} variant={variant} label={step.alt} soundOn={soundOn} />
            <p className={styles.replayHint} aria-hidden="true">
              <span className={styles.touchOnly}>Tap</span>
              <span className={styles.mouseOnly}>Click</span> picture to replay
            </p>
          </>
        ) : (
          still?.(step.alt)
        )}
      </div>
      {step.tip ? <TipPanel tip={step.tip} /> : null}
      {step.part ? (
        <aside className={styles.parts}>
          <HandIcon />
          <p className={styles.partsText}>
            <span className={styles.partsCount}>1x</span> {step.part}
          </p>
        </aside>
      ) : null}
      <p className={styles.folio}>{index + 1}</p>
    </div>
  );
}

function CoverSheet({ manual }: { manual: Manual }) {
  return (
    <div className={styles.cover}>
      <p className={styles.coverSub}>How To</p>
      <h1 className={styles.coverTitle} tabIndex={-1} data-heading="">
        {manual.coverTitle}
      </h1>
      <div className={styles.coverArt}>{manual.coverArt(manual.coverAlt)}</div>
    </div>
  );
}

function BackSheet({ art, onRestart }: { art: ReactNode; onRestart: () => void }) {
  return (
    <div className={styles.back}>
      <Heading className={styles.backTitle}>Build complete.</Heading>
      <div className={styles.backArt}>{art}</div>
      <button type="button" className={styles.restart} onClick={onRestart}>
        Back to step 1
      </button>
    </div>
  );
}

function Spot({ art }: { art: SpotArt }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={styles.rowArt}>
      {SPOT_ART[art]}
    </svg>
  );
}

function TroubleSheet({ index }: { index: number }) {
  return (
    <div className={styles.list}>
      <Heading className={styles.listTitle}>Troubleshooting</Heading>
      <div className={styles.scroll} tabIndex={0} role="region" aria-label="Troubleshooting list">
        {TROUBLE.map((t) => (
          <div className={styles.row} key={t.problem}>
            <Spot art={t.art} />
            <div>
              <h3 className={styles.rowHead}>{t.problem}</h3>
              <p className={styles.rowBody}>{t.fix}</p>
            </div>
          </div>
        ))}
      </div>
      <p className={styles.folio}>{index + 1}</p>
    </div>
  );
}

function FactsSheet({ index }: { index: number }) {
  return (
    <div className={styles.list}>
      <Heading className={styles.listTitle}>Fun facts</Heading>
      <div className={styles.scroll} tabIndex={0} role="region" aria-label="Fun facts list">
        {FACTS.map((f) => (
          <div className={styles.row} key={f.text}>
            <Spot art={f.art} />
            <p className={styles.rowBody}>
              {f.text}
              {f.link ? (
                <>
                  {" "}
                  &ldquo;
                  <Link className={styles.rowLink} href={f.link.href}>
                    {f.link.label}
                  </Link>
                  &rdquo;.
                </>
              ) : null}
            </p>
          </div>
        ))}
      </div>
      <p className={styles.folio}>{index + 1}</p>
    </div>
  );
}

const Chevron = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" className={styles.chevron} style={flip ? { transform: "scaleX(-1)" } : undefined}>
    <path d="M6 12.5H16V5L28 16L16 27V19.5H6Z" fill="currentColor" stroke="#141414" strokeWidth={2.4} strokeLinejoin="round" />
  </svg>
);

const SoundIcon = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" className={styles.soundIcon}>
    <path d="M5 12.5H10L17 6.5V25.5L10 19.5H5Z" fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
    {on ? (
      <path d="M21.5 11.5Q24.5 16 21.5 20.5M25 8.5Q30 16 25 23.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
    ) : (
      <path d="M22 12.5L28.5 19.5M28.5 12.5L22 19.5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />
    )}
  </svg>
);

interface Drag {
  id: number;
  x: number;
  y: number;
  dx: number;
  on: boolean;
  t: number;
}

export default function Booklet({ fontClass, manual }: { fontClass: string; manual: Manual }) {
  const router = useRouter();
  const pages = manual.pages;
  const index = indexFromQuery(pages, router.query.page);
  const page: PageDef = pages[index];

  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scenes = useRef<Record<number, SceneHandle | null>>({});
  const pendingTurn = useRef(false);
  const turnTimer = useRef<number>();
  const drag = useRef<Drag | null>(null);

  const [turning, setTurning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;
  const indexRef = useRef(index);
  indexRef.current = index;

  useEffect(() => setSoundOn(readSoundPref()), []);

  const settle = useCallback(() => {
    setTurning(true);
    window.clearTimeout(turnTimer.current);
    turnTimer.current = window.setTimeout(() => setTurning(false), TURN_MS + 60);
  }, []);

  useEffect(() => () => window.clearTimeout(turnTimer.current), []);

  // Music belongs to the tutorial, not the cover, and stops when the reader leaves.
  useEffect(() => {
    if (index === 0) stopMusic();
    else if (!soundOn) pauseMusic();
  }, [index, soundOn]);

  useEffect(() => stopMusic, []);

  useEffect(() => {
    let resume = false;
    const onVisibility = () => {
      if (document.hidden) {
        resume = musicIsPlaying();
        pauseMusic();
      } else if (resume) {
        playMusic();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // A page opened by direct link starts its music on the reader's first touch or key press.
  useEffect(() => {
    const onGesture = () => {
      if (indexRef.current !== 0 && soundRef.current) playMusic();
    };
    window.addEventListener("pointerdown", onGesture, true);
    window.addEventListener("keydown", onGesture, true);
    return () => {
      window.removeEventListener("pointerdown", onGesture, true);
      window.removeEventListener("keydown", onGesture, true);
    };
  }, []);

  const goTo = useCallback(
    (target: number) => {
      if (target < 0 || target >= pages.length || target === index) return;
      unlockAudio();
      // Called here rather than after the route changes, while the tap still counts as a gesture.
      if (target !== 0 && soundRef.current) playMusic();
      pendingTurn.current = true;
      settle();
      void router.push(hrefFor(manual, target), undefined, { shallow: true, scroll: false });
    },
    [index, manual, pages, router, settle]
  );

  const turn = useCallback(
    (dir: 1 | -1) => {
      if (!inSpreadLayout(rootRef.current)) {
        goTo(index + dir);
        return;
      }
      const wanted = pages[index].spread + dir;
      goTo(pages.findIndex((p) => p.spread === wanted));
    },
    [goTo, index, pages]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowRight") turn(1);
      else if (e.key === "ArrowLeft") turn(-1);
      else if (e.key === "Home") goTo(0);
      else if (e.key === "End") goTo(pages.length - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, pages, turn]);

  // Runs before paint so a scene that is about to animate never flashes its end pose.
  useIsoLayoutEffect(() => {
    if (!pendingTurn.current) return;
    pendingTurn.current = false;
    const root = rootRef.current;
    if (!root) return;
    visiblePages(pages, index, inSpreadLayout(root)).forEach((i) => {
      scenes.current[i]?.play({ delay: TURN_MS, sound: soundRef.current });
    });
    root.querySelector<HTMLElement>(`[data-page="${index}"] [data-heading]`)?.focus({ preventScroll: true });
  }, [index]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" || !e.isPrimary) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, on: false, t: e.timeStamp };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const root = rootRef.current;
    if (!d || !root || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.on) {
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy)) return;
      d.on = true;
      root.setAttribute("data-dragging", "");
      trackRef.current?.setPointerCapture(d.id);
    }
    d.dx = dx;
    const atEdge = (dx > 0 && index === 0) || (dx < 0 && index === pages.length - 1);
    root.style.setProperty("--drag", `${atEdge ? dx * 0.25 : dx}px`);
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const d = drag.current;
    const root = rootRef.current;
    if (!d || !root || e.pointerId !== d.id) return;
    drag.current = null;
    if (!d.on) return;
    root.setAttribute("data-turning", "");
    root.removeAttribute("data-dragging");
    root.style.setProperty("--drag", "0px");
    settle();
    if (cancelled) return;
    const width = root.clientWidth;
    const fast = Math.abs(d.dx) / Math.max(e.timeStamp - d.t, 1) > 0.45;
    if (Math.abs(d.dx) > width * 0.22 || (fast && Math.abs(d.dx) > 24)) turn(d.dx < 0 ? 1 : -1);
  };

  const toggleSound = () => {
    unlockAudio();
    const next = !soundOn;
    setSoundOn(next);
    writeSoundPref(next);
    if (next && index !== 0) playMusic();
  };

  const rootStyle = { "--i": index, "--s": page.spread } as CSSProperties;
  const lastSpread = pages[pages.length - 1].spread;
  const spreadLabel = pages
    .filter((p) => p.spread === page.spread)
    .map((p) => p.label.replace(/ of \d+$/, ""))
    .join(" and ");

  return (
    <div ref={rootRef} lang="en" className={cx(styles.root, fontClass)} style={rootStyle} data-turning={turning ? "" : undefined}>
      <main className={styles.book}>
        <div
          ref={trackRef}
          className={styles.track}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => endDrag(e, false)}
          onPointerCancel={(e) => endDrag(e, true)}
        >
          {pages.map((p, i) => (
            <section
              key={p.slug || "cover"}
              className={cx(styles.page, p.side === "single" && styles.single)}
              data-page={i}
              data-side={p.side}
              data-phone={i === index ? "" : undefined}
              data-desk={p.spread === page.spread ? "" : undefined}
              aria-label={p.label}
            >
              {p.kind === "cover" && <CoverSheet manual={manual} />}
              {p.kind === "step" && p.step && (
                <StepSheet
                  index={i}
                  step={p.step}
                  soundOn={soundOn}
                  variant={manual.animated[i]}
                  still={manual.stillArt[i]}
                  bindScene={(h) => {
                    scenes.current[i] = h;
                  }}
                />
              )}
              {p.kind === "trouble" && <TroubleSheet index={i} />}
              {p.kind === "facts" && <FactsSheet index={i} />}
              {p.kind === "back" && <BackSheet art={manual.backArt(i === index)} onRestart={() => goTo(1)} />}
            </section>
          ))}
        </div>
      </main>

      <nav className={styles.bar} aria-label="Manual pages">
        <button type="button" className={styles.prev} onClick={() => turn(-1)} disabled={index === 0} aria-label="Previous page">
          <Chevron flip />
        </button>
        {index === 0 ? (
          <div />
        ) : (
          <div className={styles.progress}>
            <p className={styles.progressLabel}>
              <span className={styles.onPhone}>{page.label}</span>
              <span className={styles.onDesk}>{spreadLabel}</span>
            </p>
            <div className={styles.studs} aria-hidden="true">
              {pages.map((p, i) =>
                p.kind !== "cover" ? (
                  <i
                    key={p.slug}
                    className={styles.stud}
                    data-phone={i <= index ? "" : undefined}
                    data-desk={p.spread <= page.spread ? "" : undefined}
                  />
                ) : null
              )}
            </div>
          </div>
        )}
        <button type="button" className={styles.sound} onClick={toggleSound} aria-pressed={soundOn} aria-label="Sound">
          <SoundIcon on={soundOn} />
        </button>
        <button
          type="button"
          className={cx(styles.next, index === 0 && styles.nextStart)}
          onClick={() => turn(1)}
          disabled={page.spread === lastSpread}
          aria-label={index === 0 ? "Start" : "Next page"}
        >
          {index === 0 ? <span className={styles.nextLabel}>Start</span> : null}
          <Chevron />
        </button>
      </nav>
    </div>
  );
}
