import { ReactNode } from "react";
import { AC_STEPS, STEPS, Step } from "./content";
import { Variant } from "./art/AnimatedScene";
import {
  SceneApproach,
  SceneCover,
  SceneFinished,
  SceneGrip,
  SceneRegrip,
  SceneThermostat,
  SceneThermostatCover,
  SceneThermostatDone,
  SceneUse,
} from "./art/scenes";

export type Kind = "cover" | "step" | "trouble" | "facts" | "back";

export interface PageDef {
  slug: string;
  kind: Kind;
  // Which facing pair this page belongs to in the desktop booklet.
  spread: number;
  side: "single" | "left" | "right";
  step?: Step;
  label: string;
}

type Art = (label: string) => ReactNode;

export interface Manual {
  basePath: string;
  coverTitle: string;
  coverAlt: string;
  coverArt: Art;
  // `active` is true while the build complete page is the one on screen.
  backArt: (active: boolean) => ReactNode;
  pages: PageDef[];
  animated: Partial<Record<number, Variant>>;
  stillArt: Partial<Record<number, Art>>;
}

const stepPage = (steps: Step[], i: number, spread: number, side: PageDef["side"]): PageDef => ({
  slug: `step-${steps[i].n}`,
  kind: "step",
  spread,
  side,
  step: steps[i],
  label: `Step ${steps[i].n} of ${steps.length}`,
});

const COVER: PageDef = { slug: "", kind: "cover", spread: 0, side: "single", label: "Cover" };
const backPage = (spread: number): PageDef => ({ slug: "back", kind: "back", spread, side: "single", label: "Build complete" });

export const OPEN_DRAWER: Manual = {
  basePath: "/h2/opendrawer",
  coverTitle: "Open Drawer",
  coverAlt: "A toy hand gripping the right handle of the closed top kitchen drawer, with the black catch at its corner.",
  coverArt: (label) => <SceneCover label={label} />,
  backArt: () => <SceneFinished label="The top drawer, closed, with a man giving a thumbs up coming out of the top of it." />,
  pages: [
    COVER,
    stepPage(STEPS, 0, 1, "left"),
    stepPage(STEPS, 1, 1, "right"),
    stepPage(STEPS, 2, 2, "left"),
    stepPage(STEPS, 3, 2, "right"),
    stepPage(STEPS, 4, 3, "left"),
    stepPage(STEPS, 5, 3, "right"),
    { slug: "troubleshooting", kind: "trouble", spread: 4, side: "left", label: "Troubleshooting" },
    { slug: "fun-facts", kind: "facts", spread: 4, side: "right", label: "Fun facts" },
    backPage(5),
  ],
  animated: { 3: "open", 6: "close" },
  stillArt: {
    1: (label) => <SceneApproach label={label} />,
    2: (label) => <SceneGrip label={label} />,
    4: (label) => <SceneUse label={label} />,
    5: (label) => <SceneRegrip label={label} />,
  },
};

export const TURN_ON_AC: Manual = {
  basePath: "/h2/turnonac",
  coverTitle: "Turn On AC",
  coverAlt: "A wall thermostat.",
  coverArt: (label) => <SceneThermostatCover label={label} />,
  backArt: (active) => <SceneThermostatDone active={active} label="A wall thermostat. After two seconds, a man giving a thumbs up shoots up from behind it." />,
  pages: [COVER, stepPage(AC_STEPS, 0, 1, "single"), backPage(2)],
  animated: {},
  stillArt: { 1: (label) => <SceneThermostat label={label} /> },
};

export function hrefFor(manual: Manual, index: number): string {
  const slug = manual.pages[index].slug;
  return slug ? `${manual.basePath}/${slug}` : manual.basePath;
}

export function indexFromQuery(pages: PageDef[], q: string | string[] | undefined): number {
  const slug = Array.isArray(q) ? q[0] : q;
  if (!slug) return 0;
  const i = pages.findIndex((p) => p.slug === slug);
  return i < 0 ? 0 : i;
}

export const staticPathsFor = (manual: Manual) => manual.pages.map((p) => ({ params: { page: p.slug ? [p.slug] : [] } }));
