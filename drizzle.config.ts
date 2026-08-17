import { config as loadEnv } from "dotenv"
import type { Config } from "drizzle-kit"

// drizzle-kit reads `.env` by default; Next.js reads `.env.local`. Load the
// same files Next does, in Next's precedence order.
//
// `.env.development.local` comes FIRST and wins — dotenv never overrides an
// already-set variable. That matters because Vercel marks the Neon
// integration's variables as *sensitive*: they are injected into deployments
// but pulled back as empty strings, so `.env.local` arrives with
// `DATABASE_URL=""`. Keep the real local connection string (from the Neon
// console) in `.env.development.local`, where `vercel env pull` can't clobber
// it and this config will still find it.
loadEnv({ path: ".env.development.local" })
loadEnv({ path: ".env.local" })

const envUrl = process.env.DATABASE_URL
const connectionString = envUrl && envUrl.length > 0 ? envUrl : undefined

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is empty or unset.\n" +
      "Vercel returns the Neon integration's variables as empty strings because " +
      "they are marked sensitive. Copy the connection string from the Neon " +
      "console into .env.development.local:\n\n" +
      '  DATABASE_URL="postgresql://...neon.tech/...?sslmode=require"\n',
  )
}

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: connectionString },
} satisfies Config
