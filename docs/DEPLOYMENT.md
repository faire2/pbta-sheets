# Deployment Runbook

Wiring a fresh Vercel project to Neon and Google OAuth, from an imported repo to a
working sign-in. Follow in order — several steps depend on the one before.

Prerequisites: the repo is pushed to GitHub, the Vercel project exists (imported from
that repo), and the Vercel CLI is installed (`vercel --version`).

---

## 0. Push everything first

Vercel builds what's on `origin/main`, not what's on your disk.

```bash
git status -sb | head -1        # must NOT say "ahead N"
git push
```

If the project's first deploy is red with `DATABASE_URL is not set`, it built a commit
older than the fix in `src/db/index.ts`. Pushing and redeploying clears it.

## 1. Link the local directory to the project

```bash
vercel link
```

Pick the existing project when prompted. This writes `.vercel/` (gitignored) and is what
makes `vercel env pull` know where to pull from.

## 2. Connect Neon

Vercel dashboard → **Storage** → **Neon** → connect, and attach it to this project.

The integration writes the database variables into the project's environment itself —
you do not create `DATABASE_URL` by hand. It typically sets several, including a pooled
`DATABASE_URL` and a direct `DATABASE_URL_UNPOOLED`.

## 3. Set `AUTH_SECRET`

Vercel dashboard → Settings → Environment Variables. Add `AUTH_SECRET` for all
environments.

```bash
openssl rand -base64 32
```

Setting it here rather than only locally means step 6 syncs your machine to the same
value instead of the two drifting.

## 4. Google OAuth credentials

Google Cloud Console → APIs & Services → Credentials → **Create OAuth client ID** →
Web application. Add **both** authorized redirect URIs:

```
http://localhost:3000/api/auth/callback/google
https://<your-vercel-domain>/api/auth/callback/google
```

Then add `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` to Vercel's environment variables.

**Do not set `AUTH_URL` in Vercel.** `.env.example` carries
`AUTH_URL=http://localhost:3000` for local development only. In production Auth.js v5
infers the host from Vercel and trusts it; a stale localhost value sends production's
OAuth callbacks to your laptop, and the failure is obscure.

## 5. Redeploy

Environment changes do **not** reach a running deployment. Vercel dashboard →
Deployments → ⋯ → Redeploy, or push any commit.

## 6. Set up the local environment

**Do not run `vercel env pull` and develop against the result.** Learned the hard way —
see "Why not `vercel env pull`" below. Local development uses its own file:

`.env.development.local`, holding exactly four variables:

```
DATABASE_URL="postgresql://…neon.tech/…?sslmode=require"   # from the Neon console
AUTH_SECRET="…"                                            # openssl rand -base64 32
AUTH_GOOGLE_ID="…"                                         # from Google Cloud Console
AUTH_GOOGLE_SECRET="…"
```

Both Next.js (in dev) and `drizzle.config.ts` load this file *first*, and neither
dotenv nor Next overrides an already-set variable — so these values win and survive
anything written to `.env.local` later.

`AUTH_SECRET` deliberately differs from production's. It signs local session cookies
only; a local sign-in isn't meant to carry over to the deployed site.

### Why not `vercel env pull`

Two independent problems, both of which cost real time:

1. **Sensitive variables pull back empty.** Vercel marks marketplace-integration
   variables (all of Neon's) and anything flagged sensitive as write-only: injected into
   deployments, never readable. `vercel env pull` writes them as `KEY=""`, so the file
   *looks* populated while `DATABASE_URL` and `AUTH_SECRET` are zero-length strings.
   Deployments are unaffected — this is a local-only trap.
2. **It drags in ~40 Vercel system variables**, and two of them break auth locally:
   - `VERCEL="1"` makes Auth.js believe it's on Vercel, so it trusts any incoming
     `Host` header. Open the dev server on a LAN IP and the OAuth callback becomes
     `http://192.168.x.x:3000/…`, which Google rejects outright — private IPs are not
     valid OAuth redirect targets.
   - `VERCEL_ENV="production"` switches Auth.js to `__Secure-` prefixed, `secure: true`
     cookies, which browsers refuse over plain HTTP. Sign-in then fails on `localhost`
     too, with a less obvious error.

If you have already pulled, move the file aside rather than trying to prune it:

```bash
mv .env.local .env.local.vercel-pull.bak
```

Pull only when you want to *read* what production has, never as the source for dev.

## 7. Create the tables

```bash
yarn db:push
```

If it hangs, it is connecting through Neon's pooler. `drizzle-kit` opens a real TCP
connection, unlike the app's HTTP driver, so use the direct URL:

```bash
DATABASE_URL="$DATABASE_URL_UNPOOLED" yarn db:push
```

## 8. Verify

```bash
yarn dev
```

Sign in with Google at `http://localhost:3000`. Then confirm production works too — a
successful local sign-in proves the credentials but not the production redirect URI.

Tables should exist in the Neon console: `user`, `account`, `session`,
`verificationToken`, `season`, `character`.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| Build fails, `DATABASE_URL is not set` | Deployed commit predates the fix in `src/db/index.ts`. Push and redeploy. |
| `[db] DATABASE_URL is not set — using a placeholder` in build logs | Expected before step 2. The build is meant to pass; only queries fail. |
| Sign-in redirects to localhost in production | `AUTH_URL` was set in Vercel. Delete it and redeploy. |
| `redirect_uri_mismatch` from Google | The production callback URI is missing from the OAuth client (step 4). |
| `yarn db:push` hangs | Pooled connection. Use `DATABASE_URL_UNPOOLED`. |
| Env change appears to do nothing | No redeploy. Vercel bakes environment into a deployment. |
| `MissingSecret` from Auth.js locally | `AUTH_SECRET` is empty. It's sensitive in Vercel, so it pulls as `""`. Generate a local one into `.env.development.local`. |
| `device_id and device_name are required for private IP` | The dev server was reached on a LAN IP, so the callback became `http://192.168.x.x:3000/…`. Google rejects private IPs. Use `localhost`, or a tunnel with `AUTH_TRUST_HOST=true`. |
| Local sign-in fails with cookie/CSRF errors on http | `VERCEL_ENV=production` leaked in from `vercel env pull`, forcing `__Secure-` cookies. Remove `.env.local`. |
| `DATABASE_URL` present but zero-length | Sensitive variable. Read the real string from the Neon console. |
| Queries time out from the deployed app | The `neon-http` driver. The `portfolio` repo swapped to `postgres-js` over TCP for this reason. |

## Notes

Local development uses the **same** Neon database as production — deliberate for a
one-off tool, see ROADMAP.md. There is no dev branch, so a destructive `db:push` hits
live data. If that ever stops being acceptable, create a Neon branch and point
`.env.development.local` at it; Next.js loads that file ahead of `.env.local` in dev and
`vercel env pull` won't clobber it.
