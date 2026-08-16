import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

/**
 * Importing this module MUST NOT throw, and it must yield a real Drizzle
 * client rather than a lazy stand-in.
 *
 * Two constraints force this shape:
 *  - `next build` evaluates the module graph while collecting page data, so a
 *    module-level throw fails the build. That would make the first Vercel
 *    deploy impossible: you can't connect Neon until the project exists, and
 *    the project isn't created until a build succeeds.
 *  - `DrizzleAdapter()` inspects the client synchronously to detect the driver,
 *    so a Proxy or other lazy wrapper is rejected outright.
 *
 * Hence a placeholder connection string when DATABASE_URL is unset: the client
 * constructs, the build passes, and nothing connects until a query runs. The
 * neon-http driver is request-time only, so the placeholder is never dialled.
 */
const PLACEHOLDER_URL = "postgresql://user:pass@placeholder.invalid/db"

// Note: `.env.local` ships DATABASE_URL as an EMPTY STRING, while Vercel leaves
// it undefined before Neon is connected. Both must fall back, so test for a
// non-empty value rather than using `??`.
const envUrl = process.env.DATABASE_URL
const hasUrl = typeof envUrl === "string" && envUrl.length > 0
const connectionString = hasUrl ? envUrl : PLACEHOLDER_URL

if (!hasUrl) {
  console.warn(
    "[db] DATABASE_URL is not set — using a placeholder. Any query will fail. " +
      "Run `vercel env pull .env.local` (see README).",
  )
}

export const db = drizzle(neon(connectionString), { schema })
