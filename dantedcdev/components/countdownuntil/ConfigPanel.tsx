import { ChangeEvent, FocusEvent, ReactElement, useEffect, useRef, useState } from "react";
import { Config, Mode, parseInstant, serializeConfig, Theme } from "./params";
import { GRID_UNITS, GridUnit, resolveGrid, toLocalInput, Unit, UNITS } from "./time";
import styles from "./countdown.module.css";

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: "default", label: "Countdown" },
  { value: "progress", label: "Progress bar" },
  { value: "grid", label: "Grid" },
];

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

function singular(unit: GridUnit): string {
  return unit.slice(0, -1);
}

function Segments<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}): ReactElement {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.segments} role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`${styles.segment} ${option.value === value ? styles.segmentOn : ""}`}
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number | null;
  onCommit: (value: number | null) => void;
}): ReactElement {
  const committed = value === null ? "" : toLocalInput(value);
  // A half-typed date reports "", so the field needs its own copy or React would wipe the edit.
  const [draft, setDraft] = useState(committed);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setDraft(next);
    if (!next) return;
    // Browsers drop ":00" seconds. Comparing also stops the repeated DST hour shifting by re-parsing.
    if ((next.length === 16 ? `${next}:00` : next) === committed) return;
    const parsed = parseInstant(next);
    if (parsed !== null) onCommit(parsed);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (event.target.value === "" && !event.target.validity.badInput) onCommit(null);
    else setDraft(committed);
  };

  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input
        className={styles.input}
        type="datetime-local"
        step={1}
        min="1000-01-01T00:00:00"
        max="9999-12-31T23:59:59"
        value={draft}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </label>
  );
}

export default function ConfigPanel({
  config,
  onChange,
  onClose,
}: {
  config: Config;
  onChange: (config: Config) => void;
  onClose: () => void;
}): ReactElement {
  const panelRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const copiedTimer = useRef<number>();
  const [copied, setCopied] = useState(false);

  // Focus the panel, not a field, so pressing the hotkey again still closes it.
  useEffect(() => {
    panelRef.current?.focus();
    return () => window.clearTimeout(copiedTimer.current);
  }, []);

  const { target, from, mode, unit, units, theme, text } = config;
  const update = (changes: Partial<Config>) => onChange({ ...config, ...changes });

  const usesRange = mode !== "default";
  const rangeIsValid = target !== null && from !== null && from < target;
  const grid = mode === "grid" && rangeIsValid ? resolveGrid(from, target, unit) : null;
  const href = `${window.location.origin}${window.location.pathname}${serializeConfig(config)}`;

  const toggleUnit = (toggled: Unit) => {
    const isOn = (candidate: Unit) => units.indexOf(candidate) !== -1;
    update({ units: UNITS.filter((candidate) => (candidate === toggled ? !isOn(candidate) : isOn(candidate))) });
  };

  const showCopied = (succeeded: boolean) => {
    setCopied(succeeded);
    window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(false), 1500);
  };

  const copy = () => {
    // navigator.clipboard is undefined on plain http, so this can throw as well as reject.
    const fallback = () => {
      linkRef.current?.select();
      showCopied(document.execCommand("copy"));
    };
    try {
      navigator.clipboard.writeText(href).then(() => showCopied(true), fallback);
    } catch {
      fallback();
    }
  };

  return (
    <div ref={panelRef} className={styles.panel} role="dialog" aria-label="Configure countdown" tabIndex={-1}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Configure</span>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <Segments label="Mode" options={MODE_OPTIONS} value={mode} onChange={(next) => update({ mode: next })} />

      {usesRange ? <DateField label="From" value={from} onCommit={(next) => update({ from: next })} /> : null}
      <DateField
        label={usesRange ? "To" : "Count down to"}
        value={target}
        onCommit={(next) => update({ target: next })}
      />

      {target === null ? <p className={styles.warning}>Choose a date to start the countdown.</p> : null}
      {target !== null && usesRange && !rangeIsValid ? (
        <p className={styles.warning}>
          {from === null ? "Choose a start date." : "The start has to be before the end."}
        </p>
      ) : null}

      {mode === "default" ? (
        <div className={styles.field}>
          <span className={styles.label}>Show</span>
          <div className={styles.checks}>
            {UNITS.map((candidate) => {
              const checked = units.indexOf(candidate) !== -1;
              return (
                <label key={candidate} className={styles.check}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={checked && units.length === 1}
                    onChange={() => toggleUnit(candidate)}
                  />
                  {candidate}
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      {mode === "grid" ? (
        <label className={styles.field}>
          <span className={styles.label}>Each square is one</span>
          <select
            className={styles.input}
            value={unit}
            onChange={(event) => update({ unit: event.target.value as GridUnit })}
          >
            {GRID_UNITS.map((candidate) => (
              <option key={candidate} value={candidate}>
                {singular(candidate)}
              </option>
            ))}
          </select>
          {grid ? (
            <span className={grid.coarsened ? styles.warning : styles.note}>
              {grid.coarsened
                ? `Too many ${unit} to draw, so each square will be one ${singular(grid.unit)}. `
                : ""}
              {grid.count.toLocaleString()} {grid.count === 1 ? "square" : "squares"}
            </span>
          ) : null}
        </label>
      ) : null}

      <Segments label="Style" options={THEME_OPTIONS} value={theme} onChange={(next) => update({ theme: next })} />

      <label className={styles.field}>
        <span className={styles.label}>Text</span>
        <textarea
          className={styles.input}
          rows={2}
          value={text}
          onChange={(event) => update({ text: event.target.value })}
        />
      </label>

      <div className={styles.field}>
        <span className={styles.label}>Link</span>
        <div className={styles.linkRow}>
          <input
            ref={linkRef}
            className={styles.input}
            readOnly
            value={href}
            aria-label="Link"
            onFocus={(event) => event.target.select()}
          />
          <button type="button" className={styles.copy} onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
