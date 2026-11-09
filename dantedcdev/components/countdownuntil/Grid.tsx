import { ReactElement, useEffect, useRef, useState } from "react";
import type { Theme } from "./params";
import styles from "./countdown.module.css";

interface Size {
  width: number;
  height: number;
  scale: number;
}

/** Spacing as a share of the square-to-square distance, widening as squares shrink. */
const WIDEST_GAP_SHARE = 0.45;
const NARROWEST_GAP_SHARE = 0.2;
/** Distances between squares, in CSS pixels, where the spacing reaches those limits. */
const SMALL_PITCH = 6;
const LARGE_PITCH = 48;

const CORNER_SHARE = 0.18;
const MAX_CORNER = 6;
/** Below this many device pixels a square is too small for a rounded corner to read. */
const MIN_ROUNDED_CELL = 3;

/** The largest whole-pixel cell spacing that fits `count` squares in the area. */
function fitGrid(width: number, height: number, count: number): { pitch: number; columns: number } {
  let pitch = Math.max(1, Math.floor(Math.sqrt((width * height) / count)));
  while (pitch > 1 && Math.floor(width / pitch) * Math.floor(height / pitch) < count) pitch--;
  return { pitch, columns: Math.max(1, Math.floor(width / pitch)) };
}

function gapFor(pitch: number, scale: number): number {
  if (pitch < 2) return 0;
  const shrink = Math.log(LARGE_PITCH / (pitch / scale)) / Math.log(LARGE_PITCH / SMALL_PITCH);
  const share = NARROWEST_GAP_SHARE + (WIDEST_GAP_SHARE - NARROWEST_GAP_SHARE) * Math.min(1, Math.max(0, shrink));
  return Math.max(1, Math.round(pitch * share));
}

/** One square, drawn once and then copied into place for every position in the grid. */
function makeSquare(cell: number, radius: number, color: string): HTMLCanvasElement {
  const square = document.createElement("canvas");
  square.width = cell;
  square.height = cell;
  const context = square.getContext("2d");
  if (context) {
    context.fillStyle = color;
    context.beginPath();
    if (radius > 0 && context.roundRect) context.roundRect(0, 0, cell, cell, radius);
    else context.rect(0, 0, cell, cell);
    context.fill();
  }
  return square;
}

function draw(canvas: HTMLCanvasElement, size: Size, count: number, passed: number): void {
  // Assigning the size also clears the canvas.
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  if (!context || size.width === 0 || size.height === 0) return;

  const { pitch, columns } = fitGrid(size.width, size.height, count);
  const gap = gapFor(pitch, size.scale);
  const cell = pitch - gap;
  const radius = cell >= MIN_ROUNDED_CELL ? Math.min(cell * CORNER_SHARE, MAX_CORNER * size.scale) : 0;
  const rows = Math.ceil(count / columns);
  const left = Math.floor((size.width - (columns * pitch - gap)) / 2);
  const top = Math.floor((size.height - (rows * pitch - gap)) / 2);

  const paint = (start: number, end: number, color: string) => {
    const square = makeSquare(cell, radius, color);
    for (let i = start; i < end; i++) {
      context.drawImage(square, left + (i % columns) * pitch, top + Math.floor(i / columns) * pitch);
    }
  };

  const colors = getComputedStyle(canvas);
  paint(0, passed, colors.getPropertyValue("--cd-fg").trim());
  paint(passed, count, colors.getPropertyValue("--cd-pending").trim());
}

export default function Grid({ count, passed, theme }: { count: number; passed: number; theme: Theme }): ReactElement {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState<Size | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const scale = window.devicePixelRatio || 1;
      setSize({ width: Math.round(wrap.clientWidth * scale), height: Math.round(wrap.clientHeight * scale), scale });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    // Moving between screens changes the pixel ratio without resizing the element.
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current && size) draw(canvasRef.current, size, count, passed);
  }, [size, count, passed, theme]);

  return (
    <div ref={wrapRef} className={styles.gridWrap}>
      <canvas ref={canvasRef} className={styles.gridCanvas} role="img" aria-label={`${passed} of ${count}`} />
    </div>
  );
}
