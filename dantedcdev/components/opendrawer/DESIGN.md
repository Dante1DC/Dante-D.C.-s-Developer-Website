---
name: How To manuals
description: Toy-brick instruction booklets for household objects, at /h2/*. Scoped to this folder; the rest of dantedc.dev has its own look.
colors:
  ink: "#141414"
  paper: "#ffffff"
  brick-red: "#d6181f"
  brick-yellow: "#ffc800"
  brick-yellow-hover: "#ffd84a"
  desk-blue: "#0a57a4"
  callout-tint: "#dcebf7"
typography:
  numeral:
    fontFamily: "Rubik"
    fontSize: "clamp(64px, 16cqb, 118px)"
    fontWeight: 900
    lineHeight: 0.84
    letterSpacing: "-0.04em"
  display:
    fontFamily: "Rubik"
    fontSize: "clamp(60px, 21cqi, 118px)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Rubik"
    fontSize: "clamp(22px, 6.4cqi, 34px)"
    fontWeight: 700
    lineHeight: 1.12
  body:
    fontFamily: "Rubik"
    fontSize: "clamp(18px, 5cqi, 23px)"
    fontWeight: 500
    lineHeight: 1.25
rounded:
  control: "12px"
  panel: "14px"
  tag: "6px"
  stud: "3px"
spacing:
  page: "16px"
  page-desktop: "28px"
components:
  button-next:
    backgroundColor: "{colors.brick-yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "60px"
  button-previous:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "60px"
  panel:
    backgroundColor: "{colors.callout-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
---

# Design System: How To manuals

## Overview

**Creative North Star: "The Straight-Faced Manual"**

A printed building-instructions booklet that takes one household object completely seriously. The joke depends on the form never winking: big step numerals, parts boxes, numbered pages, and exact line drawings, applied to opening a drawer.

Pages are nearly silent. They hold a numeral, a sentence, one drawing, and at most one callout. Motion is reserved for the single moment the object does something, which is the click.

**Key Characteristics:**
- White paper and black line for everything that explains
- Primary color only where it marks an action or a cover
- One thing per page, one hand on the phone

## Colors

Toy primaries against white paper.

### Primary
- **Brick Red**: Covers, action arrows, and the Warning tag.
- **Brick Yellow**: The toy hand, the Next button, the Pro Tip tag, and the "How To" subtitle on covers. The back cover is a full field of it.

### Neutral
- **Ink**: All lines and text. Also the solid fill on the catch pieces and the thermostat display.
- **Paper**: Every step page and every drawing's surfaces.
- **Callout Tint**: Parts boxes and tip panels only.
- **Desk Blue**: The surface behind the booklet at desktop width. It never appears on a page.

**The Line Art Rule.** Inside a drawing, only the hand and the action arrows carry color.

## Typography

**Display Font:** Rubik, self-hosted variable (300 to 900), from `fonts/rubik-latin.woff2`.

**Character:** Slightly squared and softly cornered, which reads as both technical and toy-like.

Sizes use container units, so a page sets type the same way as a phone screen or as one half of a spread. Body copy never goes below 18px, because it is read at arm's length.

## Layout

One flat row of pages. A phone shows one page at a time, and swiping or the bottom bar turns it. At `(min-width: 900px) and (min-height: 560px)` facing pages sit side by side as a 1.46:1 booklet on the desk, with single centered pages for covers. Position is always the page index, so changing layout never loses the reader's place.

A step page has three rows: heading, drawing, callout. Only the drawing shrinks, and it may bleed off the page edge.

## Elevation & Depth

Flat. The only shadows are the booklet's soft drop shadow on the desk and the shading at the center fold. Depth inside the drawings comes from the projection.

## Shapes

Softly cornered rectangles with a 2.5px ink outline. Drawings use three line weights: 2.6 for silhouettes, 1.6 for edges, 0.8 for grain and hatching.

## Components

### Drawings
Every object is a small model in centimetres, projected in parallel so all views agree. See `art/geometry.ts` and `art/parts.tsx`. Measurements come from the owner's photos. New objects should use the same projection and line weights.

### The hand
A yellow C-clip and wrist peg, drawn as one continuous outline with no line between them. Its outer radius must stay smaller than a bar's distance from the surface behind it. When gripping a bar, paint back to front as the camera sees it: far leg, bar, hand, near leg, near stretch of bar.

### Build complete
The one photograph in the system: a cut-out of a man giving a thumbs up, emerging from behind the manual's object. The clash with the line art is the point.

### Control bar
Previous, position, sound, Next, at the bottom within thumb reach. Position shows one box for every page after the cover, including Troubleshooting, Fun facts and Build complete. Covers drop the position readout and label Next as "Start".

### Sound
A click synthesized on the moment the drawing changes, and one looping music track that begins when the tutorial starts and never plays on a cover. One toggle controls both.

## Do's and Don'ts

### Do:
- **Do** keep every step to one numeral, one sentence, one drawing, and at most one callout.
- **Do** keep the click fast. It lands about 240ms into a pull and pops on in 90ms.
- **Do** add new manuals as an entry in `manifest.tsx` and words in `content.ts`.

### Don't:
- **Don't** use the LEGO name or logo, or put type inside a brick shape.
- **Don't** let the hand or any object pass through another in a drawing.
- **Don't** add motion to a page where the object doesn't move.
