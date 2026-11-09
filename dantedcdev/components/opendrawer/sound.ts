// The manual's sound: a short synthesized click and a looping music track.
// Browsers allow neither until the reader has touched the page.

type WindowWithWebkit = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };

const PREF_KEY = "opendrawer-sound";
const MUSIC_SRC = "/h2/tutorial-music.mp3";
const MUSIC_LEVEL = 0.32;

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let music: HTMLAudioElement | null = null;
let musicRouted = false;

export function unlockAudio(): void {
  if (typeof window === "undefined") return;
  try {
    const w = window as WindowWithWebkit;
    const Ctor = w.AudioContext || w.webkitAudioContext;
    if (!Ctor) return;
    if (!ctx) ctx = new Ctor();
    // iOS reports "interrupted", not "suspended", after the phone has slept.
    if (ctx.state !== "running") void ctx.resume();
  } catch {
    ctx = null;
  }
}

function noiseBuffer(c: AudioContext): AudioBuffer {
  if (noise) return noise;
  const b = c.createBuffer(1, Math.floor(c.sampleRate * 0.012), c.sampleRate);
  const data = b.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  noise = b;
  return b;
}

function tick(c: AudioContext, at: number, level: number): void {
  const n = c.createBufferSource();
  n.buffer = noiseBuffer(c);
  const band = c.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 4200;
  band.Q.value = 0.9;
  const nGain = c.createGain();
  nGain.gain.setValueAtTime(level, at);
  nGain.gain.exponentialRampToValueAtTime(0.001, at + 0.006);
  n.connect(band).connect(nGain).connect(c.destination);
  n.start(at);
  n.stop(at + 0.01);

  const body = c.createOscillator();
  body.type = "triangle";
  body.frequency.setValueAtTime(2400, at);
  body.frequency.exponentialRampToValueAtTime(800, at + 0.012);
  const bGain = c.createGain();
  bGain.gain.setValueAtTime(level * 0.6, at);
  bGain.gain.exponentialRampToValueAtTime(0.001, at + 0.016);
  body.connect(bGain).connect(c.destination);
  body.start(at);
  body.stop(at + 0.02);
}

function scheduleClick(c: AudioContext, inSeconds: number): void {
  const at = c.currentTime + inSeconds;
  tick(c, at, 0.8);
  tick(c, at + 0.014, 0.3);
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    window.setTimeout(() => navigator.vibrate(10), inSeconds * 1000);
  }
}

// A context still waking up (say, after the phone slept) gets until the moment
// of the click. If it misses that, the click is dropped so it can never land
// late, out of step with the picture.
export function playClick(inSeconds: number): void {
  const c = ctx;
  if (!c) return;
  if (c.state === "running") {
    scheduleClick(c, inSeconds);
    return;
  }
  const due = performance.now() + inSeconds * 1000;
  void c.resume().then(() => {
    const left = (due - performance.now()) / 1000;
    if (left >= 0 && c.state === "running") scheduleClick(c, left);
  });
}

function musicElement(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!music) {
    music = new Audio(MUSIC_SRC);
    music.loop = true;
    music.preload = "auto";
    music.volume = MUSIC_LEVEL;
  }
  // Routed through a gain node because iOS ignores element volume.
  if (ctx && !musicRouted) {
    try {
      const source = ctx.createMediaElementSource(music);
      const gain = ctx.createGain();
      gain.gain.value = MUSIC_LEVEL;
      source.connect(gain).connect(ctx.destination);
      music.volume = 1;
      musicRouted = true;
    } catch {
      // Falls back to element volume.
    }
  }
  return music;
}

// Must be called from inside a tap or key press the first time.
export function playMusic(): void {
  unlockAudio();
  const m = musicElement();
  if (m && m.paused) void m.play().catch(() => undefined);
}

export function pauseMusic(): void {
  music?.pause();
}

export function musicIsPlaying(): boolean {
  return !!music && !music.paused;
}

export function stopMusic(): void {
  if (!music) return;
  music.pause();
  music.currentTime = 0;
}

export function readSoundPref(): boolean {
  try {
    return window.localStorage.getItem(PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

export function writeSoundPref(on: boolean): void {
  try {
    window.localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {
    // The toggle still works for this visit without storage.
  }
}
