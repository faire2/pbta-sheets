# Design System

**The concept: the sheet itself, photocopied.** The reference PDF is a monochrome print
sheet — cream stock, ink-black type, hairline rules, hollow circles, a chevron harm
track. The app reproduces that ground and makes its vocabulary interactive, rather than
dressing the data in generic app chrome.

Everything here is defined in `src/app/globals.css`. Use the tokens; never hardcode.

## Colour

Two themes. **Paper** is the default; **Ink** is the same sheet after dark, for playing
at a dim table. Both are near-monochrome by design.

| Token | Role |
|---|---|
| `--paper` | Page ground. Warm cream, never pure white. |
| `--paper-deep` | Recessed / pressed state, selected rows. |
| `--ink` | Primary type, filled marks, rules at full strength. |
| `--ink-soft` | Body copy, move summaries. |
| `--ink-faint` | Labels, metadata, unselected mark borders. |
| `--rule` | Hairline dividers — `--ink` at 24%. |
| `--oxblood` | **Harm, danger, the Darkest Self. Never chrome.** |

The single-accent rule is the discipline holding this together. Oxblood appears on the
harm track and on error text, nowhere else. The moment it becomes a button colour, the
sheet reads as a web app instead of a document.

Tailwind utilities: `bg-paper`, `text-ink-soft`, `border-rule`, `fill-oxblood`.

## Type

Grenze Gotisch (display) + Grenze (body) — one foundry, designed as a pair, gothic
character without blackletter's unreadability.

- `font-display` — skin names, section headings, stat labels, move names. Wide tracking.
- `font-sans` (Grenze) — body copy, summaries, labels. Italic for flavour lines.

**Every face must include the `latin-ext` subset.** Czech diacritics (ě š č ř ž ů) fall
back to a different font without it and mixed glyphs look broken. Not optional — CS is a
target locale.

## Motifs

Three shapes carry the identity. They come from the sheet; don't invent others.

- **The mark** (`.mark`) — a 15px circle, hollow when unchosen, filled when chosen or
  granted. Used for moves, stat lines, choice groups, and as an affordance on skin rows.
  Always inside a ≥44px hit area.
- **The chevron** — the harm track. Four downward triangles filling oxblood left to
  right. `MAX_HARM` is 4, read off the page rather than assumed.
- **The hairline** (`.sheet-rule`, `.sheet-heading`) — 1px rules separating everything.
  Section headings trail a rule to the end of the measure, as on the sheet.

## Texture

A single fixed turbulence layer over the page (`body::before`), multiply-blended at low
opacity and screen-blended in dark. This is what stops the design reading as flat digital
UI. It should register as paper, never as noise — if individual grains are visible, it's
too strong.

## Interaction

- **Square corners.** Radii are 0–4px. Print sheets have no rounded rectangles.
- **Touch targets ≥ 44px**, always. The device is a phone held one-handed at a table.
- **`.press`** — ink-spread feedback: a wash of `--paper-deep` plus a 0.5% scale-down.
  Replaces hover, which doesn't exist on the target device.
- **No hover-dependent information.** Hover may enhance; it may never reveal.
- Focus rings are `--ink`, 2px, offset 2px — visible, and in keeping.

## Motion

Restraint. One staggered reveal on the skin list (45ms apart, 420ms each) and 150ms
colour transitions on marks and chips. Nothing else moves. All of it collapses under
`prefers-reduced-motion`.

## Layout

`max-w-2xl`, centred, `px-5` on mobile and `px-8` above. The sheet is a column of
sections separated by rules — no cards, no shadows, no panels. Depth comes from the
grain and the type, not from elevation.
