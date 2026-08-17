"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { auth } from "@/auth"
import { db } from "@/db"
import { seasons } from "@/db/schema"

/**
 * Unambiguous alphabet — no I/O/0/1, because this code gets read aloud across
 * a table and typed into a phone.
 */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const CODE_LENGTH = 6

function generateJoinCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH)
  crypto.getRandomValues(bytes)
  return Array.from(
    bytes,
    (b) => CODE_ALPHABET[b % CODE_ALPHABET.length] ?? "X",
  ).join("")
}

async function requireUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

export interface SeasonActionResult {
  error: string
}

export async function createSeason(
  name: string,
): Promise<SeasonActionResult | undefined> {
  const ownerId = await requireUserId()
  if (!ownerId) return { error: "You need to be signed in." }

  const parsed = z.string().trim().min(1).max(80).safeParse(name)
  if (!parsed.success) return { error: "Give the season a name." }

  // joinCode is unique; collisions are vanishingly rare but not impossible.
  let created: { id: string } | undefined
  for (let attempt = 0; attempt < 5 && !created; attempt += 1) {
    try {
      const [row] = await db
        .insert(seasons)
        .values({
          name: parsed.data,
          joinCode: generateJoinCode(),
          createdById: ownerId,
          system: "monsterhearts",
        })
        .returning({ id: seasons.id })
      created = row
    } catch {
      // Retry with a fresh code.
    }
  }

  if (!created) return { error: "Couldn't create that season. Try again." }

  redirect(`/seasons/${created.id}`)
}

export async function renameSeason(
  id: string,
  name: string,
): Promise<SeasonActionResult | undefined> {
  const ownerId = await requireUserId()
  if (!ownerId) return { error: "You need to be signed in." }

  const parsed = z.string().trim().min(1).max(80).safeParse(name)
  if (!parsed.success) return { error: "Give the season a name." }

  await db
    .update(seasons)
    .set({ name: parsed.data, updatedAt: new Date() })
    .where(and(eq(seasons.id, id), eq(seasons.createdById, ownerId)))

  revalidatePath(`/seasons/${id}`)
  revalidatePath("/")
}

/**
 * Removing a season does NOT remove anyone's character — `characters.seasonId`
 * is ON DELETE SET NULL, so sheets survive and simply stop belonging to a
 * season. Winding up a game should never destroy a player's work.
 */
export async function deleteSeason(
  id: string,
): Promise<SeasonActionResult | undefined> {
  const ownerId = await requireUserId()
  if (!ownerId) return { error: "You need to be signed in." }

  await db
    .delete(seasons)
    .where(and(eq(seasons.id, id), eq(seasons.createdById, ownerId)))

  revalidatePath("/")
  redirect("/")
}
