"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"
import { z } from "zod"
import { auth } from "@/auth"
import { db } from "@/db"
import { characters, seasons } from "@/db/schema"
import { MAX_HARM, XP_PER_ADVANCE, sheetSchema } from "@/types/sheet"

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
