# Project Agent Rules

**monsterhearts-skins** — mobile-first character sheets ("skins") for Monsterhearts 2,
built so the sheet *is* the rules: a player with a phone needs nothing else at the table.

## Deployment & Architecture

- Deployment target: Vercel
- Backend pattern: Next.js route handlers (App Router)
- Database: Neon (Postgres) via Vercel marketplace
- ORM: Drizzle
- Auth: Auth.js v5 with Google OAuth

## Data Type Contracts

- Money: N/A — Monsterhearts has no currency mechanic
- Dates: N/A beyond `createdAt` / `updatedAt` audit columns (UTC at DB)
- IDs: **uuid** — sheets are user-facing and addressable at `/sheet/<uuid>`
- Shared types location: N/A — single Next.js app; types in `src/types/`

## Project-Specific Rules

- **Mobile-first is not a preference, it's the target.** The device is a phone held
  one-handed at a table. Touch targets ≥ 44px. No hover-dependent interactions.
  Desktop is a courtesy, not a design driver.
- **Skins are static data, not DB rows** — `src/data/skins/`, one file per skin,
  Zod-validated. Only the *character* is persisted. Skins don't vary per user.
- **No save button.** Every tick, String and Condition writes through optimistically
  via TanStack Query. At a table, an unsaved sheet is a lost sheet.
- **Swipe is shadcn `carousel`** (Embla). Do not add a second swipe library.
- **i18n is `next-intl`; EN is the source language, CS is the translation.**
  Any user-facing string goes through the message catalog — never hardcoded.
  Fonts must include the `latin-ext` subset or Czech diacritics break.
- **Content licensing** — the app embeds published Monsterhearts text verbatim, by
  deliberate decision (see ROADMAP → Notes). It stays a private, sign-in-gated tool.
  Do not add public sign-up, sitemaps, or SEO indexing without revisiting that.

## Working Agreements

- Plan before implementing. Update ROADMAP.md as work progresses. In autonomous mode, only stop for items in Questions/Blockers.
- Never run `git commit` or `git push` unless explicitly asked in-thread.
- Never use destructive commands without explicit approval.
- Never revert user changes you did not make.
- Do not silently expand scope.
- Preserve existing behavior and architecture unless the task explicitly changes them.
- Do not add new production dependencies without approval.
- Do not remove tests without approval.
- New external I/O must include explicit timeout and error handling.
- Always run `yarn build` before declaring work complete. Build failure is a blocker.
- Never use filtered `tsc` output as a substitute for a full build.
- Distinguish pre-existing failures from newly introduced failures.

## Verification Policy

Full lint / test / build runs only after implementation scope is finished AND the user approves verification. Targeted checks during implementation are allowed and encouraged.

## TypeScript Rules

- ES modules. Named imports preferred over default.
- async/await preferred over `.then` chains.
- Arrow functions for callbacks.
- `any` is forbidden except at narrow, justified boundaries.
- Prefer `unknown`, precise interfaces, generics, type guards.
- Promise handling is explicit: `await` handled promises, `void` for intentionally detached.

## State Management Rules

- Server state always goes through TanStack Query. Never useState or Zustand for server data.
- Client state: useState first, lift to parent second, Zustand only for shared client state across unrelated components.
- Never mix client and server state in the same store.
- Prefer collocated state over global state.

## UI / Component Rules

- Read `docs/COMPONENT-CATALOG.md` and `docs/DESIGN-SYSTEM.md` before writing UI code.
- Reuse existing shadcn components before creating custom ones.
- Never create one-off Button/Input/Dialog primitives — use shadcn.
- No hardcoded colors or spacing — use design tokens (`bg-primary`, not `bg-blue-600`).
- New reusable components require updates to COMPONENT-CATALOG.md.
- Use cva for style variations, not prop drilling.

## React Performance Rules

- Do NOT use useEffect to derive state — calculate during render.
- useEffect is only for actual side effects (subscriptions, DOM, external sync).
- Lazy-load route components and heavy libraries.
- Fetch in parallel via TanStack Query / route loaders, not useEffect.
- Virtualize long lists.
- Use `useOptimistic` for instant feedback on mutations.

## Documentation Rules

- Feature docs collocated with the feature.
- Use explicit names like `FEATURE-NAME.md`, not generic `README.md`.
- Target ~200 lines per doc; hard max 500.
- File references over copying code blocks.
- Update `docs/DOC_CATALOG.md` when adding or materially changing docs.

## Reporting Expectations

- Distinguish "scaffold/changes complete" from "verified working".
- If full verification was not run, say so explicitly.
- Pre-existing failures and newly introduced failures must be reported separately.

## Roadmap Update Protocol

- Update `ROADMAP.md` as tasks complete (mark `[x]` with completion date).
- Document architectural decisions immediately when made.
- Add blockers to Questions/Blockers section — autonomous agents stop there.
- Never re-litigate documented decisions without explicit approval.
