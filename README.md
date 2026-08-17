# pbta-sheets

Mobile-first character sheets ("skins") for **Monsterhearts 2**, built so the sheet
*is* the rules — a player with a phone needs nothing else at the table.

Swipeable screens, tap-to-choose traits and moves, Strings tracked with +/− against the
other characters in your season, and everything persisted so nobody loses a sheet
between sessions. Bilingual EN/CS.

## Credits and licensing

**Monsterhearts** is created by **Avery Alder** and published by
**[Buried Without Ceremony](https://buriedwithoutceremony.com)**.

This is an **unofficial, fan-made tool**. It is not affiliated with, endorsed by, or
licensed by Avery Alder or Buried Without Ceremony, and it is no substitute for the
book — if you play this game, buy it.

The skin data in `src/data/` records game *mechanics* — stat lines, which moves a skin
grants, what each move does — described in our own words. It does not reproduce the
book's prose. Each move carries an optional `fullText` field that is deliberately empty
in this repository; fill it locally from your own copy if you want the exact wording.

The reference PDF (`docs/*.pdf`) is **not committed** — it's gitignored. It's a free
download from Buried Without Ceremony, and you need it only to re-run the data audit:

```bash
curl -o docs/monsterhearts-2-reference-sheets-and-core-skins.pdf \
  https://buriedwithoutceremony.com/wp-content/uploads/2017/05/reference-sheets-and-core-skins1.pdf
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · shadcn/ui ·
Auth.js v5 (Google OAuth) · Drizzle + Neon Postgres · TanStack Query · next-intl ·
deployed on Vercel.

## Setup

```bash
yarn install
vercel link                    # link to the Vercel project
                               # then: Vercel dashboard → Storage → Neon
vercel env pull .env.local     # pulls DATABASE_URL (+ AUTH_* if set there)
yarn db:push                   # create the tables
yarn dev                       # http://localhost:3000
```

You also need Google OAuth credentials in `.env.local` — `AUTH_GOOGLE_ID` and
`AUTH_GOOGLE_SECRET` — with `http://localhost:3000/api/auth/callback/google` as an
authorized redirect URI. Generate `AUTH_SECRET` with `openssl rand -base64 32`.

`.env.local` is the **only** env file: `drizzle.config.ts` loads it too, so
`vercel env pull` keeps Next.js and drizzle-kit in sync in one step.

Local development talks to the same Neon database as production — deliberate, for a
one-off tool. See ROADMAP.md.

## Scripts

- `yarn dev` / `yarn build` / `yarn start`
- `yarn typecheck` — `tsc --noEmit`
- `yarn lint` — ESLint flat config (typescript-eslint strictTypeChecked)
- `yarn validate-data` — Zod-validate all 10 skins, the basic moves, and the rules boxes
- `yarn db:push` / `db:generate` / `db:studio`

## Layout

```
src/data/skins/     one file per skin (10 core skins) + registry
src/data/           basic moves and rules boxes from the Player Sheet
src/types/          Zod schemas: skin, rules, sheet
src/db/             Drizzle schema and client
docs/               design system, component catalog, doc index
```

See [`AGENTS.md`](./AGENTS.md) for working conventions and [`ROADMAP.md`](./ROADMAP.md)
for current state.
