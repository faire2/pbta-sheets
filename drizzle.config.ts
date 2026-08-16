import { config as loadEnv } from "dotenv"
import type { Config } from "drizzle-kit"

// drizzle-kit reads `.env` by default, while Next.js reads `.env.local`. Point
// it at `.env.local` so there's exactly ONE env file to keep current — the one
// `vercel env pull` writes.
loadEnv({ path: ".env.local" })

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Run `vercel env pull .env.local` first.",
  )
}

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: connectionString },
} satisfies Config
