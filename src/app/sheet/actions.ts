"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"
import { z } from "zod"
import { auth } from "@/auth"
import { db } from "@/db"
import { characters, seasons } from "@/db/schema"
import { getSkin } from "@/data/skins"
import {
  MAX_HARM,
  XP_PER_ADVANCE,
  sheetSchema,
  stringTargetSchema,
} from "@/types/sheet"
import type { StringTarget } from "@/types/sheet"

export interface SheetActionResult {
  error: string
}

type Loaded =
  | { ok: false; error: string }
  | { ok: true; row: typeof characters.$inferSelect; userId: string }

/**
 * Every mutation goes through here: it resolves the session and confirms the
 * character belongs to it. Explicitly discriminated on `ok` — an inferred
 * union of `{error}` / `{row}` can't be narrowed with `in`, because each
 * member gets the other's keys as optional.
 */
async function loadOwned(characterId: string): Promise<Loaded> {
  const t = await getTranslations("errors")
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { ok: false, error: t("signedIn") }

  const [row] = await db
    .select()
    .from(characters)
    .where(and(eq(characters.id, characterId), eq(characters.ownerId, userId)))
    .limit(1)

  if (!row) return { ok: false, error: t("notYourCharacter") }
  return { ok: true, row, userId }
}

const trackSchema = z.object({
  harm: z.number().int().min(0).max(MAX_HARM).optional(),
  experience: z.number().int().min(0).max(XP_PER_ADVANCE).optional(),
})

/**
 * Writes a track value through immediately — there is no save button, because
 * an unsaved sheet at a table is a lost sheet. The client renders optimistically
 * and this reconciles.
 */
export async function setTracks(
  characterId: string,
  patch: z.infer<typeof trackSchema>,
): Promise<SheetActionResult | undefined> {
  const loaded = await loadOwned(characterId)
  if (!loaded.ok) return { error: loaded.error }

  const parsed = trackSchema.safeParse(patch)
  if (!parsed.success) {
    const t = await getTranslations("errors")
    return { error: t("valueOutOfRange") }
  }

  const sheet = sheetSchema.parse(loaded.row.sheet)
  if (parsed.data.harm !== undefined) sheet.harm = parsed.data.harm
  if (parsed.data.experience !== undefined) {
    sheet.experience = parsed.data.experience
  }

  await db
    .update(characters)
    .set({ sheet, updatedAt: new Date() })
    .where(eq(characters.id, characterId))

  revalidatePath(`/sheet/${characterId}`)
}

/** Attaches a character to an existing season by its shared code. */
export async function joinSeasonByCode(
  characterId: string,
  code: string,
): Promise<SheetActionResult | undefined> {
  const loaded = await loadOwned(characterId)
  if (!loaded.ok) return { error: loaded.error }

  // Codes get read aloud and typed on phones; be forgiving about case and
  // stray whitespace rather than making people retype.
  const t = await getTranslations("errors")
  const normalised = code.trim().toUpperCase().replace(/\s+/g, "")
  if (normalised.length === 0) return { error: t("enterCode") }

  const [season] = await db
    .select()
    .from(seasons)
    .where(eq(seasons.joinCode, normalised))
    .limit(1)

  if (!season) return { error: t("noSeasonWithCode", { code: normalised }) }
  if (season.system !== loaded.row.system) {
    return { error: t("differentGame") }
  }

  await db
    .update(characters)
    .set({ seasonId: season.id, updatedAt: new Date() })
    .where(eq(characters.id, characterId))

  revalidatePath(`/sheet/${characterId}`)
  revalidatePath("/")
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function generateJoinCode(): string {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return Array.from(
    bytes,
    (b) => CODE_ALPHABET[b % CODE_ALPHABET.length] ?? "X",
  ).join("")
}

/** Creates a season and puts this character in it, in one step. */
export async function createSeasonForCharacter(
  characterId: string,
  name: string,
): Promise<SheetActionResult | undefined> {
  const loaded = await loadOwned(characterId)
  if (!loaded.ok) return { error: loaded.error }

  const t = await getTranslations("errors")
  const parsed = z.string().trim().min(1).max(80).safeParse(name)
  if (!parsed.success) return { error: t("nameSeason") }

  let created: { id: string } | undefined
  for (let attempt = 0; attempt < 5 && !created; attempt += 1) {
    try {
      const [row] = await db
        .insert(seasons)
        .values({
          name: parsed.data,
          joinCode: generateJoinCode(),
          createdById: loaded.userId,
          system: loaded.row.system,
        })
        .returning({ id: seasons.id })
      created = row
    } catch {
      // Unique collision on joinCode — retry with a fresh one.
    }
  }

  if (!created) return { error: t("createSeasonFailed") }

  await db
    .update(characters)
    .set({ seasonId: created.id, updatedAt: new Date() })
    .where(eq(characters.id, characterId))

  revalidatePath(`/sheet/${characterId}`)
  revalidatePath("/")
}

export async function leaveSeason(
  characterId: string,
): Promise<SheetActionResult | undefined> {
  const loaded = await loadOwned(characterId)
  if (!loaded.ok) return { error: loaded.error }

  await db
    .update(characters)
    .set({ seasonId: null, updatedAt: new Date() })
    .where(eq(characters.id, characterId))

  revalidatePath(`/sheet/${characterId}`)
  revalidatePath("/")
}

// ── Strings ───────────────────────────────────────────────────────────────
//
// Monsterhearts sets no ceiling on Strings. This one exists only so a stuck
// button can't write an absurd number into the sheet.
const MAX_STRING_COUNT = 20

/**
 * Two targets are the same person. Names compare case-insensitively so
 * "Ms. Kelly" typed twice increments one row instead of making two.
 */
function sameTarget(a: StringTarget, b: StringTarget): boolean {
  if (a.kind === "character" && b.kind === "character") {
    return a.characterId === b.characterId
  }
  if (a.kind === "name" && b.kind === "name") {
    return a.name.trim().toLowerCase() === b.name.trim().toLowerCase()
  }
  return false
}

async function writeSheet(
  characterId: string,
  sheet: z.infer<typeof sheetSchema>,
): Promise<void> {
  await db
    .update(characters)
    .set({ sheet, updatedAt: new Date() })
    .where(eq(characters.id, characterId))

  revalidatePath(`/sheet/${characterId}`)
}

/**
 * Adds a String, or increments the one already held on that target — holding
 * "two Strings on Rook" is one row at 2, never two rows at 1.
 */
export async function addString(
  characterId: string,
  target: StringTarget,
): Promise<SheetActionResult | undefined> {
  const loaded = await loadOwned(characterId)
  if (!loaded.ok) return { error: loaded.error }

  const t = await getTranslations("errors")
  const parsed = stringTargetSchema.safeParse(
    target.kind === "name" ? { ...target, name: target.name.trim() } : target,
  )
  if (!parsed.success) return { error: t("badStringTarget") }

  if (parsed.data.kind === "character") {
    if (parsed.data.characterId === characterId) {
      return { error: t("noSelfString") }
    }
    const [exists] = await db
      .select({ id: characters.id })
      .from(characters)
      .where(eq(characters.id, parsed.data.characterId))
      .limit(1)
    if (!exists) return { error: t("stringTargetMissing") }
  }

  const sheet = sheetSchema.parse(loaded.row.sheet)
  const existing = sheet.strings.find((entry) =>
    sameTarget(entry.target, parsed.data),
  )

  if (existing) {
    existing.count = Math.min(existing.count + 1, MAX_STRING_COUNT)
  } else {
    sheet.strings.push({
      id: crypto.randomUUID(),
      target: parsed.data,
      count: 1,
    })
  }

  await writeSheet(characterId, sheet)
}

/**
 * Sets a String row to an exact count. Zero removes the row: holding no
 * Strings on someone is the same as not listing them.
 */
export async function setStringCount(
  characterId: string,
  stringId: string,
  count: number,
): Promise<SheetActionResult | undefined> {
  const loaded = await loadOwned(characterId)
  if (!loaded.ok) return { error: loaded.error }

  const t = await getTranslations("errors")
  const parsed = z.number().int().min(0).max(MAX_STRING_COUNT).safeParse(count)
  if (!parsed.success) return { error: t("valueOutOfRange") }

  const sheet = sheetSchema.parse(loaded.row.sheet)
  const entry = sheet.strings.find((s) => s.id === stringId)
  if (!entry) return { error: t("stringNotFound") }

  if (parsed.data === 0) {
    sheet.strings = sheet.strings.filter((s) => s.id !== stringId)
  } else {
    entry.count = parsed.data
  }

  await writeSheet(characterId, sheet)
}

// ── Conditions ────────────────────────────────────────────────────────────
//
// Conditions are named by whoever applies them ("shaken", "guilty"), so this
// is free text rather than a fixed list. The cap is a guard against a runaway
// paste, not a rule.
const MAX_CONDITIONS = 12
const MAX_CONDITION_LENGTH = 40

export async function addCondition(
  characterId: string,
  name: string,
): Promise<SheetActionResult | undefined> {
  const loaded = await loadOwned(characterId)
  if (!loaded.ok) return { error: loaded.error }

  const t = await getTranslations("errors")
  const parsed = z
    .string()
    .trim()
    .min(1)
    .max(MAX_CONDITION_LENGTH)
    .safeParse(name)
  if (!parsed.success) return { error: t("nameCondition") }

  const sheet = sheetSchema.parse(loaded.row.sheet)
  const already = sheet.conditions.some(
    (c) => c.toLowerCase() === parsed.data.toLowerCase(),
  )
  if (already) return { error: t("conditionAlready") }
  if (sheet.conditions.length >= MAX_CONDITIONS) {
    return { error: t("tooManyConditions") }
  }

  sheet.conditions.push(parsed.data)
  await writeSheet(characterId, sheet)
}

export async function removeCondition(
  characterId: string,
  name: string,
): Promise<SheetActionResult | undefined> {
  const loaded = await loadOwned(characterId)
  if (!loaded.ok) return { error: loaded.error }

  const sheet = sheetSchema.parse(loaded.row.sheet)
  sheet.conditions = sheet.conditions.filter((c) => c !== name)
  await writeSheet(characterId, sheet)
}

// ── Stat bonuses ──────────────────────────────────────────────────────────
//
// "Add +1 to one of your stats" is an advance, but which stat is the player's
// choice and the data doesn't model it — so the bonus is adjusted by hand and
// added to the chosen stat line on render.
const MIN_STAT_BONUS = -3
const MAX_STAT_BONUS = 3

const statKeys = ["hot", "cold", "volatile", "dark"] as const
const statBonusSchema = z.object({
  stat: z.enum(statKeys),
  value: z.number().int().min(MIN_STAT_BONUS).max(MAX_STAT_BONUS),
})

export async function setStatBonus(
  characterId: string,
  stat: (typeof statKeys)[number],
  value: number,
): Promise<SheetActionResult | undefined> {
  const loaded = await loadOwned(characterId)
  if (!loaded.ok) return { error: loaded.error }

  const t = await getTranslations("errors")
  const parsed = statBonusSchema.safeParse({ stat, value })
  if (!parsed.success) return { error: t("valueOutOfRange") }

  const sheet = sheetSchema.parse(loaded.row.sheet)
  sheet.statBonuses[parsed.data.stat] = parsed.data.value
  await writeSheet(characterId, sheet)
}

// ── Advances ──────────────────────────────────────────────────────────────

/**
 * Sets how many times an advance has been taken (0…maxTimes).
 *
 * Each step costs a full Experience track, and stepping back refunds it — a
 * mis-tap at the table shouldn't cost five sessions of experience. That does
 * mean the refund is trust-based, which matches a game played on paper.
 */
export async function setAdvanceCount(
  characterId: string,
  advanceId: string,
  count: number,
): Promise<SheetActionResult | undefined> {
  const loaded = await loadOwned(characterId)
  if (!loaded.ok) return { error: loaded.error }

  const t = await getTranslations("errors")
  const skin = getSkin(loaded.row.skinId)
  const advance = skin?.advances.find((a) => a.id === advanceId)
  if (!advance) return { error: t("unknownAdvance") }

  const parsed = z.number().int().min(0).max(advance.maxTimes).safeParse(count)
  if (!parsed.success) return { error: t("valueOutOfRange") }

  const sheet = sheetSchema.parse(loaded.row.sheet)
  const taken = sheet.advancesTaken.filter((a) => a.advanceId === advanceId)
  const delta = parsed.data - taken.length
  if (delta === 0) return

  if (delta > 0) {
    if (sheet.experience < XP_PER_ADVANCE) {
      return { error: t("needFullExperience") }
    }
    sheet.advancesTaken.push({
      advanceId,
      takenAt: new Date().toISOString(),
    })
    sheet.experience = 0
  } else {
    // Drop the most recently taken one, and hand the experience back.
    const lastIndex = sheet.advancesTaken.findLastIndex(
      (a) => a.advanceId === advanceId,
    )
    if (lastIndex >= 0) sheet.advancesTaken.splice(lastIndex, 1)
    sheet.experience = XP_PER_ADVANCE
  }

  await writeSheet(characterId, sheet)
}

// ── Notes ─────────────────────────────────────────────────────────────────

const MAX_NOTES = 5000

export async function setNotes(
  characterId: string,
  notes: string,
): Promise<SheetActionResult | undefined> {
  const loaded = await loadOwned(characterId)
  if (!loaded.ok) return { error: loaded.error }

  const t = await getTranslations("errors")
  const parsed = z.string().max(MAX_NOTES).safeParse(notes)
  if (!parsed.success) return { error: t("notesTooLong") }

  const sheet = sheetSchema.parse(loaded.row.sheet)
  sheet.notes = parsed.data
  await writeSheet(characterId, sheet)
}
