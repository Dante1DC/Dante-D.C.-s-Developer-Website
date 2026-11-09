export type Unit = "months" | "weeks" | "days" | "hours" | "minutes" | "seconds";
export type GridUnit = Unit | "years";

/** Largest to smallest: the order digits appear in. */
export const UNITS: Unit[] = ["months", "weeks", "days", "hours", "minutes", "seconds"];
/** Smallest to largest: the order a too-dense grid coarsens through. */
export const GRID_UNITS: GridUnit[] = ["seconds", "minutes", "hours", "days", "weeks", "months", "years"];

/** A fixed cap, so a link draws the same grid on every screen size. */
export const MAX_SQUARES = 100000;

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Starting guesses only; calendar units are corrected against the real calendar. */
const APPROX_MS: Record<GridUnit, number> = {
  seconds: SECOND,
  minutes: MINUTE,
  hours: HOUR,
  days: DAY,
  weeks: 7 * DAY,
  months: 30.436875 * DAY,
  years: 365.2425 * DAY,
};

/** A DST change can move a calendar boundary this far from the nominal end. */
const DST_TOLERANCE = 90 * MINUTE;

function addDays(anchor: number, n: number): number {
  const d = new Date(anchor);
  d.setDate(d.getDate() + n);
  return d.getTime();
}

function addMonths(anchor: number, n: number): number {
  const d = new Date(anchor);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  const lastOfMonth = new Date(d.getTime());
  lastOfMonth.setMonth(lastOfMonth.getMonth() + 1, 0);
  d.setDate(Math.min(day, lastOfMonth.getDate()));
  return d.getTime();
}

/**
 * The instant `n` units from `anchor` (`n` may be negative). Always step from a
 * fixed anchor: repeated adding loses month ends (Jan 31, Feb 28, Mar 28...).
 */
export function stepFrom(anchor: number, unit: GridUnit, n: number): number {
  switch (unit) {
    case "seconds":
      return anchor + n * SECOND;
    case "minutes":
      return anchor + n * MINUTE;
    case "hours":
      return anchor + n * HOUR;
    case "days":
      return addDays(anchor, n);
    case "weeks":
      return addDays(anchor, n * 7);
    case "months":
      return addMonths(anchor, n);
    case "years":
      return addMonths(anchor, n * 12);
  }
}

/** Largest n >= 0 with `stepFrom(anchor, unit, n) <= t`. */
export function wholeUnitsElapsed(anchor: number, t: number, unit: GridUnit): number {
  if (t <= anchor) return 0;
  let n = Math.floor((t - anchor) / APPROX_MS[unit]);
  while (n > 0 && stepFrom(anchor, unit, n) > t) n--;
  while (stepFrom(anchor, unit, n + 1) <= t) n++;
  return n;
}

/** Largest n >= 0 with `stepFrom(anchor, unit, -n) >= limit`. */
function wholeUnitsBack(anchor: number, limit: number, unit: GridUnit): number {
  if (limit >= anchor) return 0;
  let n = Math.floor((anchor - limit) / APPROX_MS[unit]);
  while (n > 0 && stepFrom(anchor, unit, -n) < limit) n--;
  while (stepFrom(anchor, unit, -(n + 1)) >= limit) n++;
  return n;
}

/**
 * Time left, split across `units` (largest first), one value per unit.
 *
 * Counts back from the target: counting forward from `now` freezes the display
 * near month ends (Jan 28, 29, 30 and 31 would all be "1 month 1 day" before
 * Mar 1). `now` is first rounded back to a boundary of the smallest unit so the
 * last unit reaches zero exactly at the target, not one unit early.
 */
export function breakdown(now: number, target: number, units: Unit[]): number[] {
  const values = units.map(() => 0);
  if (now >= target || units.length === 0) return values;

  const smallest = units[units.length - 1];
  let remaining = wholeUnitsBack(target, now, smallest);
  if (stepFrom(target, smallest, -remaining) > now) remaining++;
  const start = stepFrom(target, smallest, -remaining);

  let anchor = target;
  units.forEach((unit, i) => {
    const n = wholeUnitsBack(anchor, start, unit);
    values[i] = n;
    anchor = stepFrom(anchor, unit, -n);
  });
  return values;
}

function squareCount(from: number, to: number, unit: GridUnit): number {
  const isCalendarUnit = APPROX_MS[unit] >= DAY;
  const goal = isCalendarUnit ? to - DST_TOLERANCE : to;
  let n = Math.max(1, Math.ceil((to - from) / APPROX_MS[unit]));
  while (n > 1 && stepFrom(from, unit, n - 1) >= goal) n--;
  while (stepFrom(from, unit, n) < goal) n++;
  return n;
}

export interface ResolvedGrid {
  unit: GridUnit;
  count: number;
  coarsened: boolean;
}

/** Picks the requested unit, or the next one up that fits under MAX_SQUARES. */
export function resolveGrid(from: number, to: number, unit: GridUnit): ResolvedGrid {
  const requested = GRID_UNITS.indexOf(unit);
  let index = requested;
  let count = squareCount(from, to, GRID_UNITS[index]);
  while (count > MAX_SQUARES && index < GRID_UNITS.length - 1) {
    index++;
    count = squareCount(from, to, GRID_UNITS[index]);
  }
  return { unit: GRID_UNITS[index], count, coarsened: index !== requested };
}

/** Squares whose whole unit has ended. The final square ends exactly at `to`. */
export function passedCount(from: number, to: number, grid: ResolvedGrid, now: number): number {
  if (now <= from) return 0;
  if (now >= to) return grid.count;
  return Math.min(grid.count - 1, wholeUnitsElapsed(from, now, grid.unit));
}

export function progressFraction(from: number, to: number, now: number): number {
  return Math.min(1, Math.max(0, (now - from) / (to - from)));
}

/**
 * Milliseconds until the seconds digit next changes. Follows the target's phase
 * rather than the wall clock, with a small margin because timers can fire early.
 */
export function nextTickDelay(now: number, target: number): number {
  const untilBoundary = ((target - now) % 1000 + 1000) % 1000 || 1000;
  return untilBoundary + 20;
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

/** Local `YYYY-MM-DDTHH:mm:ss`, the format a datetime-local input expects. */
export function toLocalInput(ms: number): string {
  const d = new Date(ms);
  const date = `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1, 2)}-${pad(d.getDate(), 2)}`;
  const time = `${pad(d.getHours(), 2)}:${pad(d.getMinutes(), 2)}:${pad(d.getSeconds(), 2)}`;
  return `${date}T${time}`;
}
