import Head from "next/head";
import { CSSProperties, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ConfigPanel from "./ConfigPanel";
import Grid from "./Grid";
import { Config, parseConfig, serializeConfig, Theme, writeUrl } from "./params";
import { breakdown, GridUnit, nextTickDelay, passedCount, progressFraction, resolveGrid, Unit } from "./time";
import styles from "./countdown.module.css";

const URL_WRITE_DELAY = 250;
/** Longer gaps than this mean a load or a background tab, which shouldn't animate. */
const SMOOTH_STEP_LIMIT = 1500;

/** Set from event handlers, not an effect, because Grid reads these colors in its own effect. */
function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-cd-theme", theme);
}

function isTypingIn(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  return !!element && (element.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName));
}

function formatValue(value: number, unit: Unit): string {
  const isClockUnit = unit === "hours" || unit === "minutes" || unit === "seconds";
  return isClockUnit ? String(value).padStart(2, "0") : String(value);
}

function Digits({ now, target, units }: { now: number; target: number; units: Unit[] }): ReactElement {
  const values = breakdown(now, target, units);
  const groups = values.map((value, i) => formatValue(value, units[i]));
  const sizing = { "--digits": groups.join("").length, "--groups": groups.length } as CSSProperties;

  return (
    <div
      className={styles.digits}
      style={sizing}
      role="timer"
      aria-label={values.map((value, i) => `${value} ${units[i]}`).join(", ")}
    >
      {groups.map((group, i) => (
        <span key={units[i]} className={styles.group}>
          {group.split("").map((digit, j) => (
            <span key={j} className={styles.digit}>
              {digit}
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}

function ProgressBar({ from, to, now }: { from: number; to: number; now: number }): ReactElement {
  const previous = useRef<number | null>(null);
  const isSmallStep = previous.current !== null && now - previous.current < SMOOTH_STEP_LIMIT;
  const fraction = progressFraction(from, to, now);

  useEffect(() => {
    previous.current = now;
  }, [now]);

  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(fraction * 100)}
    >
      <div
        className={styles.fill}
        style={{ transform: `scaleX(${fraction})`, transition: isSmallStep ? "transform 1s linear" : "none" }}
      />
    </div>
  );
}

function GridDisplay({
  from,
  to,
  unit,
  now,
  theme,
}: {
  from: number;
  to: number;
  unit: GridUnit;
  now: number;
  theme: Theme;
}): ReactElement {
  const grid = useMemo(() => resolveGrid(from, to, unit), [from, to, unit]);
  return <Grid count={grid.count} passed={passedCount(from, to, grid, now)} theme={theme} />;
}

function renderDisplay(config: Config, now: number): ReactElement | null {
  const { target, from, mode, units, unit, theme } = config;
  if (target === null) return null;
  if (mode === "default") return <Digits now={now} target={target} units={units} />;
  if (from === null || from >= target) return null;
  if (mode === "progress") return <ProgressBar key={`${from}-${target}`} from={from} to={target} now={now} />;
  return <GridDisplay from={from} to={target} unit={unit} now={now} theme={theme} />;
}

export default function Countdown(): ReactElement {
  // Null until mounted, because the exported HTML is built without a query string.
  const [config, setConfig] = useState<Config | null>(null);
  const [now, setNow] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const urlTimer = useRef<number>();

  useEffect(() => {
    const parsed = parseConfig(window.location.search);
    applyTheme(parsed.theme);
    setConfig(parsed);
    setNow(Date.now());
    return () => {
      window.clearTimeout(urlTimer.current);
      document.documentElement.removeAttribute("data-cd-theme");
    };
  }, []);

  const target = config ? config.target : null;

  useEffect(() => {
    if (target === null) return;
    let timer: number | undefined;
    const tick = () => {
      window.clearTimeout(timer);
      const current = Date.now();
      setNow(current);
      if (current < target) timer = window.setTimeout(tick, nextTickDelay(current, target));
    };
    // Background tabs throttle timers, and a page restored from history has none running.
    const resync = () => {
      if (document.visibilityState === "visible") tick();
    };

    tick();
    document.addEventListener("visibilitychange", resync);
    window.addEventListener("pageshow", resync);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", resync);
      window.removeEventListener("pageshow", resync);
    };
  }, [target]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanelOpen(false);
        return;
      }
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
      if (event.key.toLowerCase() !== "c" || isTypingIn(event.target)) return;
      event.preventDefault();
      setPanelOpen((open) => !open);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const updateConfig = useCallback((next: Config) => {
    applyTheme(next.theme);
    setConfig(next);
    window.clearTimeout(urlTimer.current);
    urlTimer.current = window.setTimeout(() => writeUrl(serializeConfig(next)), URL_WRITE_DELAY);
  }, []);

  const closePanel = useCallback(() => setPanelOpen(false), []);
  const text = config ? config.text : "";

  return (
    <div className={`${styles.root} ${panelOpen ? styles.panelOpen : ""}`}>
      {text ? (
        <Head>
          <title>{text}</title>
        </Head>
      ) : null}
      <div className={`hub ${styles.background}`} />
      <div className={styles.stage}>
        {text ? <div className={styles.text}>{text}</div> : null}
        {config && now > 0 ? renderDisplay(config, now) : null}
      </div>
      {panelOpen && config ? <ConfigPanel config={config} onChange={updateConfig} onClose={closePanel} /> : null}
    </div>
  );
}
