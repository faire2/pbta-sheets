# pbta-sheets — Roadmap

Last updated: 2026-08-16

Mobile-first character sheets for **Monsterhearts 2**, built so the sheet *is* the
rules — a player with a phone needs nothing else at the table.

## Current Phase: Setup → first deploy

### Done

- **Scaffold** (2026-08-15) — Next 16.3.1, React 19, Tailwind 4, shadcn/ui, Auth.js v5
  (Google), Drizzle + Neon, TanStack Query, next-intl. ESLint/Prettier/docs/AGENTS.md.
- **Skin data layer** (2026-08-15) — all 10 core skins in `src/data/skins/`, the Player
  Sheet's 6 basic moves and 6 rules boxes in `src/data/basic-moves.ts`. Zod schemas in
  `src/types/`. `yarn validate-data` passes.
- **Data audit** (2026-08-15) — see the audit table below. Seven corrections applied.
- **DB schema settled** (2026-08-16) — `seasons` + `characters`, sheet shape and
  advancement modelled in `src/types/sheet.ts`.

### Blocked on you

- [ ] Create the GitHub repo (**public**) and tell me — I'll add the remote and push
- [ ] Import it into Vercel → creates the project
- [ ] Vercel dashboard → Storage → Neon → provides `DATABASE_URL`
- [ ] Google OAuth credentials → `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
- [ ] `vercel env pull .env.local` then `yarn db:push`

### Multi-system rollout

The app is named for PbtA generally but implements **Monsterhearts 2 only**. Systems get
added one at a time, and nothing gets generalised before a real second system pulls on
it — an abstraction designed against one game fits one game.

**Taken now, because it's free while the DB is empty:**

- `seasons.system` and `characters.system`, `text notNull default 'monsterhearts'`.
  Adding this later would mean a migration plus a backfill.
- `/characters/new` **redirects** to a system-scoped route rather than itself being the
  Monsterhearts creator. Inserting the system picker later then turns a redirect into a
  page — purely additive, and no bookmarked URL breaks.

**Deliberately not done yet:**

- `statKeySchema` is hardcoded `hot/cold/volatile/dark` (`src/types/rules.ts:3`, plus
  `src/types/sheet.ts:45` and `src/types/skin.ts:5`). Every system has different stats;
  making it pluggable is easy *once a second set exists to design against*.
- `MAX_HARM = 4` / `XP_PER_ADVANCE = 5` are Monsterhearts values, not universals.
- The vocabulary: `skin` (most PbtA games say *playbook*), `strings` (Masks has
  Influence, Apocalypse World has Hx), `darkestSelf`, `sexMove`, `conditions`.
- The sheet renderer. A second system needs its own screens, and how much can be shared
  is unknowable until we know which game.

**When a second system arrives**, the order is: move `src/data/skins/` under a per-system
directory (static data, no consumers to break), make the stat enum and numeric constants
system-scoped, then add the picker page. The database doesn't change.

### Next

1. **The sheet UI** — swipeable screens, one concern each:
   `Identity & Stats · Moves · Strings · Conditions & Darkest Self · Advances · Notes`.
   Traits and moves are tap-to-select, not fill-in. Strings are rows with +/− buttons.
2. **Persistence** — every tick writes through optimistically via TanStack Query. No
   save button; an unsaved sheet at a table is a lost sheet.
3. **Seasons** — create/join by code, so String targets come from a roster.
4. **Czech translation** — EN source, CS locale.
5. **Read-only share link** — `/sheet/<uuid>`.

### Backlog

- Dice roller (2d6 + stat) with the move's outcome shown inline.
- Offline / PWA — a phone at a table with bad wifi is the real deployment environment.
- Season Advances (the between-seasons list) — not in the reference PDF; needs the book.
- The Chosen and the Serpentine — not in the free PDF either. One file + one line in
  `src/data/skins/index.ts` when a source turns up.
- Cross-character String visibility ("who holds Strings on me"). Needs a real ledger;
  deliberately out of scope while Strings stay asymmetric.

### Out of scope

- MC-side tools (threats, fronts, prep).
- Character export to PDF.
- Open public sign-up for the app itself. The repo is public; the app is still gated
  behind Google sign-in and meant for your table.

## Architecture Decisions

### Stack (locked at bootstrap)

yarn · Vercel · Neon Postgres · Drizzle · Next.js App Router + Auth.js v5 (Google) ·
route handlers · TanStack Query for server state · shadcn/ui + Tailwind semantic tokens
+ lucide-react · ESLint flat config (strictTypeChecked) · uuid ids · no money or
date/time contracts (Monsterhearts has neither).

### Project-specific

- **Swipe** = shadcn `carousel` (Embla). No second swipe library.
- **i18n** = `next-intl`, **EN is the source language**, CS is the translation. Fonts
  must include `latin-ext` or Czech diacritics break.
- **Skins are static data, not DB rows.** They don't vary per user. Only the
  *character* is persisted.
- **Skin content**: mechanics recorded exactly (stat lines, option lists, move names,
  advances); prose written in our own rules-shorthand. Every move has an optional
  `fullText`, empty in git — fill it locally from your own copy of the book if you want
  the exact wording. The repo is public, so it stays that way.
- **Seasons are a roster, not a ledger.** Strings are asymmetric in Monsterhearts — you
  track the ones you hold — so there's nothing to reconcile between players and no live
  sync to build. A season exists so a String can target a real character instead of a
  typed name. A String target is *either* a roster character *or* a plain name, because
  side characters get Strings constantly and have no sheet.
- **The sheet is JSONB**, validated by `sheetSchema`, with `characters.sheetVersion` as
  the migration escape hatch. Only the owner writes their own sheet and nothing queries
  across characters, so relational Strings/advances tables would buy nothing.
- **Advancement**: `experience` 0–5 (the sheet's five circles); filling it buys one
  advance and resets to 0. `advancesTaken` allows repeats up to each advance's
  `maxTimes`, which is how the sheet's duplicate rows ("Take another Fae move" twice)
  render as two checkboxes. `harm` is 0–4 — four segments, confirmed off the page.
- **One database.** Local dev and production share the single Neon DB — no dev branch,
  no local Postgres. One-off tool, one table; the worst case is scuffing your own sheet
  while developing. `drizzle.config.ts` loads `.env.local`, so it's the only env file.

### Pending

- **The Witch's `chooseMoveCount: 1` is unverified.** The sheet grants Sympathetic
  Tokens + Hex-Casting and says "Choose two" over the Hexes, but never states how many
  of Transgressive Magic / Sanctuary you pick. Inferred from other skins' totals.
  Needs the book. Marked with a comment in `src/data/skins/witch.ts`.

## Data audit — 2026-08-15

Two passes: an automated cross-check of every identity option and move name against its
own PDF page, then a per-skin read-only audit of the summaries. Seven corrections:

| Skin | Correction |
|---|---|
| Fae | `lure` had **you** marking experience both ways; the promise-*maker* marks on the promise, you mark on the break |
| Ghoul | Four invented Hunger descriptions removed — the sheet prints bare labels only |
| Infernal | `cant-save-myself` reversed the String: **you** gain it on your rescuer |
| Mortal | Move name is "Mess With Me**,** Mess With Him" — comma restored |
| Queen | `many-bodies` chained two independent sentences; the Sex Move trigger is unconditional |
| Queen | Sex Move Condition was written from memory as *one of us*; the sheet prints *one of them* |
| Witch | Illusions is *non-existent* subtext, not *hidden* subtext |

Worth keeping: agents reported "no ambiguity" on files containing reversed String
directions. Names were checkable mechanically; the summaries needed a second
independent read. Budget the audit into any future data entry.

## Known Issues / Tech Debt

- **Rotate the Google OAuth client secret.** It was pasted into a chat transcript on
  2026-08-16 and should be considered exposed. Google Auth Platform → Clients → add a
  new secret, delete the old one, update `AUTH_GOOGLE_SECRET` in Vercel and in
  `.env.development.local`. The client, its name and its redirect URIs are unaffected;
  the Client ID is public by design and needs no change.

- **Auth doesn't gate anything yet.** `src/middleware.ts` wires the session into the
  request but doesn't reject signed-out users. Add `callbacks.authorized` in
  `src/auth.ts` (or per-page `auth()` checks) before treating any route as private.
  `/sheet/*` is deliberately excluded — share links are public.
- **ESLint pinned to `^9`.** v10 ships by default but crashes `eslint-plugin-react`,
  the same breakage documented in `hotac-pilot`. Unpin when the ecosystem catches up.
- **`src/components/ui/**` excluded from lint** — shadcn regenerates those files.
- **`npx shadcn add form` fails** (exits silently at "Checking registry"), so
  `react-hook-form` is absent. Not on the critical path — the sheet is tick-boxes.
- **3 of 4 Vercel agent skills didn't install** — that repo's layout changed. Only
  `mastering-typescript` is in `.agents/skills/`.
- **DB driver is `neon-http`.** The `portfolio` repo abandoned it for `postgres-js`
  over TCP after reliability trouble. First thing to swap if queries start timing out.

## Questions / Blockers

None blocking. Open items live under Pending.
