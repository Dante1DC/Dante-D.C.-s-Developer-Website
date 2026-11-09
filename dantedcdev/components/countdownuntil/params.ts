import { GRID_UNITS, GridUnit, Unit, UNITS } from "./time";

export const THEMES = ["default", "dark", "light"] as const;
export const MODES = ["default", "progress", "grid"] as const;
export type Theme = (typeof THEMES)[number];
export type Mode = (typeof MODES)[number];

export interface Config {
  target: number | null;
  from: number | null;
  theme: Theme;
  mode: Mode;
  unit: GridUnit;
  units: Unit[];
  text: string;
}

const DEFAULT_UNIT: GridUnit = "days";

/** Runs before first paint, so a dark or light link never flashes the wrong background. */
export const THEME_BOOT_SCRIPT =
  '(function(){try{var t=new URLSearchParams(location.search).get("theme");' +
  'document.documentElement.setAttribute("data-cd-theme",t==="dark"||t==="light"?t:"default")}catch(e){}})()';

const INSTANT =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3})\d*)?)?(Z|z|[+-]\d{2}(?::?\d{2})?)?)?$/;

/** An unencoded `+` in a query string arrives as a space, so a `+05:00` offset needs restoring. */
const SPACE_BEFORE_OFFSET = /(\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?) (\d{2}(?::?\d{2})?)$/;

/**
 * Parses a date or datetime to epoch ms, or null if it isn't a real date.
 *
 * `new Date(string)` can't be used here: it accepts "12" and rolls 2026-02-31
 * into March, and it reads date-only strings as UTC. With no `Z` or offset,
 * the value is the viewer's local time.
 */
export function parseInstant(raw: string | null): number | null {
  if (!raw) return null;
  const match = INSTANT.exec(raw.trim().replace(SPACE_BEFORE_OFFSET, "$1+$2"));
  if (!match) return null;

  const [year, month, day, hour, minute, second] = match.slice(1, 7).map((part) => Number(part || 0));
  const ms = Number((match[7] || "").padEnd(3, "0"));
  const zone = match[8];

  if (year < 1000 || month < 1 || month > 12 || day < 1) return null;
  if (day > new Date(Date.UTC(year, month, 0)).getUTCDate()) return null;
  if (hour > 23 || minute > 59 || second > 59) return null;

  if (!zone) return new Date(year, month - 1, day, hour, minute, second, ms).getTime();

  const utc = Date.UTC(year, month - 1, day, hour, minute, second, ms);
  if (zone === "Z" || zone === "z") return utc;

  const digits = zone.slice(1).replace(":", "");
  const offsetHours = Number(digits.slice(0, 2));
  const offsetMinutes = Number(digits.slice(2) || 0);
  if (offsetHours > 14 || offsetMinutes > 59) return null;
  const offset = (offsetHours * 60 + offsetMinutes) * 60000;
  return zone[0] === "+" ? utc - offset : utc + offset;
}

function oneOf<T extends string>(raw: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.indexOf(raw as T) !== -1 ? (raw as T) : fallback;
}

function parseUnits(raw: string | null): Unit[] {
  if (raw === null) return UNITS;
  const wanted = raw.split(",").map((part) => part.trim().toLowerCase());
  const picked = UNITS.filter((unit) => wanted.indexOf(unit) !== -1);
  return picked.length > 0 ? picked : UNITS;
}

export function parseConfig(search: string): Config {
  const query = new URLSearchParams(search);
  return {
    target: parseInstant(query.get("iso")),
    from: parseInstant(query.get("from")),
    theme: oneOf(query.get("theme"), THEMES, "default"),
    mode: oneOf(query.get("mode"), MODES, "default"),
    unit: oneOf(query.get("unit"), GRID_UNITS, DEFAULT_UNIT),
    units: parseUnits(query.get("units")),
    text: query.get("text") ?? "",
  };
}

/** UTC, so a generated link means the same moment for every viewer. */
function instantParam(ms: number): string {
  return new Date(ms).toISOString().replace(".000Z", "Z");
}

/**
 * Builds the query string, leaving out defaults and anything the chosen mode
 * doesn't use. Built by hand because URLSearchParams would escape every colon.
 */
export function serializeConfig(config: Config): string {
  const parts: string[] = [];
  if (config.target !== null) parts.push(`iso=${instantParam(config.target)}`);
  if (config.mode !== "default") {
    if (config.from !== null) parts.push(`from=${instantParam(config.from)}`);
    parts.push(`mode=${config.mode}`);
  }
  if (config.mode === "grid" && config.unit !== DEFAULT_UNIT) parts.push(`unit=${config.unit}`);
  if (config.mode === "default" && config.units.length !== UNITS.length) {
    parts.push(`units=${config.units.join(",")}`);
  }
  if (config.theme !== "default") parts.push(`theme=${config.theme}`);
  if (config.text) parts.push(`text=${encodeURIComponent(config.text)}`);
  return parts.length > 0 ? `?${parts.join("&")}` : "";
}

export function writeUrl(search: string): void {
  const url = window.location.pathname + search;
  try {
    // Next stores its own routing state here; dropping it can revert the URL on popstate.
    window.history.replaceState({ ...window.history.state, url, as: url }, "", url);
  } catch {
    // Safari throws if replaceState is called too often. The next edit writes it again.
  }
}
