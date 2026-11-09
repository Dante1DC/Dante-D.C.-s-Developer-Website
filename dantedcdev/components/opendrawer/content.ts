// All of the manuals' words live here. To add a fun fact, add a row to FACTS.

export interface Tip {
  kind: "pro" | "warn";
  text: string;
}

export interface Step {
  n: number;
  title: string;
  note?: string;
  tip?: Tip;
  part?: string;
  alt: string;
}

export const STEPS: Step[] = [
  {
    n: 1,
    title: "Approach the drawer.",
    part: "hand",
    alt: "A toy hand starts away from the closed top drawer, with a dashed arrow leading to the right handle.",
  },
  {
    n: 2,
    title: "Place hand on the handle on the drawer.",
    tip: { kind: "pro", text: "The right drawer handle is better than the left drawer handle." },
    alt: "A toy hand gripping the right handle of the closed drawer, next to the black catch.",
  },
  {
    n: 3,
    title: "Pull on the drawer.",
    note: "You'll hear a click!",
    tip: { kind: "warn", text: "Don't pull too hard!" },
    alt: "The drawer pulled out by the right handle. A close-up shows the black piece on the drawer leaving the black piece on the cabinet, with the word click.",
  },
  {
    n: 4,
    title: "Use the drawer.",
    note: "You can find many things inside this drawer, like utensils!",
    alt: "The open drawer seen from above, holding a tray of knives, forks, spoons and a spatula.",
  },
  {
    n: 5,
    title: "Place hand on handle on the drawer.",
    alt: "A toy hand gripping the right handle of the open drawer.",
  },
  {
    n: 6,
    title: "Close the drawer.",
    note: "Keep pushing until you hear a click.",
    alt: "The drawer pushed closed by the right handle. A close-up shows the black piece on the drawer going under the black piece on the cabinet, with the word click.",
  },
];

export const AC_STEPS: Step[] = [
  {
    n: 1,
    title: "Don't.",
    alt: "A wall thermostat.",
  },
];

export type SpotArt = "catch" | "handles" | "scale" | "ticket" | "fell" | "press" | "white";

export interface Trouble {
  art: SpotArt;
  problem: string;
  fix: string;
}

export const TROUBLE: Trouble[] = [
  {
    art: "fell",
    problem: "A piece fell off!",
    fix: "Reattach it where it belongs.",
  },
  {
    art: "press",
    problem: "It won't close!",
    fix: "Push in the black piece on the face of the drawer in its closed position, then press in the black piece on the side of the cabinet.",
  },
  {
    art: "white",
    problem: "It still won't close!",
    fix: "Check the white piece, and make sure it is pressed down until the piece on the side of the island is parallel to the side of the island.",
  },
];

export interface Fact {
  art: SpotArt;
  text: string;
  link?: { label: string; href: string };
}

export const FACTS: Fact[] = [
  { art: "catch", text: "This drawer used to slide open by itself. Two 3D-printed pieces now hold it shut." },
  { art: "handles", text: "It has two handles. They are not equally good. See step 2." },
  {
    art: "scale",
    text: "These 3D-printed parts weigh a total of 18.2 grams. They were printed with PLA, which is a plastic recycled from plant matter.",
  },
  {
    art: "ticket",
    text: "I would have just filed a service request to fix this, but this apartment complex is notorious for not completing service requests. See",
    link: { label: "How to: Turn on AC", href: "/h2/turnonac" },
  },
];
