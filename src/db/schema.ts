import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  jsonb,
  uuid,
  index,
} from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"

// ---------- Auth.js v5 required tables ----------

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
})

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
)

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
)

// ---------- Application tables ----------

/**
 * A season — one group's ongoing game. Monsterhearts frames a campaign as a
 * season of teen TV, and Season Advances are a real mechanic, so the term
 * carries its own weight rather than being generic app furniture.
 *
 * Its job here is to be a ROSTER: it exists so a String can point at a real
 * character instead of a typed name. Deliberately not a shared ledger — Strings
 * are asymmetric (you track the ones you hold), so there is nothing to
 * reconcile between players and no live sync to build.
 *
 * `joinCode` is the whole invite mechanism: share the code, join the season.
 */
export const seasons = pgTable("season", {
  id: uuid("id").primaryKey().defaultRandom(),
  /**
   * Which game system this season plays. Present from day one so adding a
   * second system is additive rather than a migration + backfill — the column
   * is free while the table is empty and expensive once it isn't.
   * A season is one system; you don't mix games at one table.
   */
  system: text("system").notNull().default("monsterhearts"),
  name: text("name").notNull().default(""),
  joinCode: text("joinCode").notNull().unique(),
  createdById: text("createdById")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
})

/**
 * One row per character sheet.
 *
 * `skinId` references a skin defined in `src/data/skins/` — skins are static
 * content, not DB rows, because they don't vary per user (see ROADMAP).
 *
 * `sheet` holds the mutable play state as JSONB: stats, harm, conditions,
 * strings, ticked moves, advances, notes. It's JSONB rather than columns
 * because the shape follows the skin and changes as the data layer is filled
 * in — the same choice `character_sheet_SWRPG` made. Its runtime shape is
 * owned by a Zod schema in `src/types/`, which is the actual source of truth.
 */
export const characters = pgTable(
  "character",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("ownerId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /**
     * Nullable: a character can exist before joining a season. SET NULL on
     * delete, so winding up a season never destroys anyone's sheet.
     */
    seasonId: uuid("seasonId").references(() => seasons.id, {
      onDelete: "set null",
    }),
    /** Which game system. Denormalised from the season so a character that
     * hasn't joined one is still unambiguous. See `seasons.system`. */
    system: text("system").notNull().default("monsterhearts"),
    /**
     * The playbook id — a "skin" in Monsterhearts, a "playbook" in most other
     * PbtA games. Resolved against static data per system, never a DB row.
     */
    skinId: text("skinId").notNull(),
    name: text("name").notNull().default(""),
    sheet: jsonb("sheet").notNull().default({}),
    /** Bumped when the `sheet` shape changes, so old rows can be migrated. */
    sheetVersion: integer("sheetVersion").notNull().default(1),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (character) => [
    index("character_owner_idx").on(character.ownerId),
    index("character_season_idx").on(character.seasonId),
  ],
)

export type Season = typeof seasons.$inferSelect
export type NewSeason = typeof seasons.$inferInsert
export type Character = typeof characters.$inferSelect
export type NewCharacter = typeof characters.$inferInsert
