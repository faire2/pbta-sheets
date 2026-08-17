"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { auth } from "@/auth"
import { db } from "@/db"
import { characters } from "@/db/schema"
import { getSkin } from "@/data/skins"
import { emptySheet } from "@/types/sheet"

const inputSchema = z.object({
  skinId: z.string().min(1),
  name: z.string().trim().max(80),
  look: z.string().max(80),
  eyes: z.string().max(80),
  origin: z.string().max(80),
  statLineIndex: z.number().int().nonnegative(),
  moveIds: z.array(z.string().min(1)),
  choiceSelections: z.record(z.string(), z.array(z.string())),
})

export type CreateCharacterInput = z.infer<typeof inputSchema>

export interface CreateCharacterResult {
  error: string
}

/**
 * Creates a character and sends the player to their sheet.
 *
 * Everything the client sends is re-checked against the skin's own rules here.
 * The client enforces the same constraints for feedback, but a server action is
 * a public endpoint — the counts are validated again rather than trusted.
 *
 * Returns only on failure; success redirects.
 */
export async function createCharacter(
  raw: CreateCharacterInput,
): Promise<CreateCharacterResult> {
  const session = await auth()
  const ownerId = session?.user?.id
  if (!ownerId) {
    return { error: "You need to be signed in to create a character." }
  }

  const parsed = inputSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: "That character didn't look right. Try again." }
  }
  const input = parsed.data

  const skin = getSkin(input.skinId)
  if (!skin) {
    return { error: `Unknown skin "${input.skinId}".` }
  }

  if (!skin.statLines[input.statLineIndex]) {
    return { error: "Pick a stat line." }
  }

  // Granted moves are always present; the player chooses exactly the rest.
  const granted = new Set(skin.startingMoveIds)
  const chosen = input.moveIds.filter((id) => !granted.has(id))
  const known = new Set(skin.moves.map((m) => m.id))
  if (chosen.some((id) => !known.has(id))) {
    return { error: "That move isn't on this skin." }
  }
  if (new Set(chosen).size !== skin.chooseMoveCount) {
    return {
      error: `Choose exactly ${String(skin.chooseMoveCount)} move${
        skin.chooseMoveCount === 1 ? "" : "s"
      }.`,
    }
  }

  for (const group of skin.choiceGroups) {
    const picks = new Set(input.choiceSelections[group.id] ?? [])
    const valid = new Set(group.options.map((o) => o.id))
    if ([...picks].some((id) => !valid.has(id))) {
      return { error: `That isn't a valid ${group.label}.` }
    }
    if (picks.size !== group.chooseCount) {
      return {
        error: `Choose exactly ${String(group.chooseCount)} from ${group.label}.`,
      }
    }
  }

  const sheet = emptySheet()
  sheet.identity = {
    look: input.look,
    eyes: input.eyes,
    origin: input.origin,
  }
  sheet.statLineIndex = input.statLineIndex
  sheet.moveIds = [...granted, ...new Set(chosen)]
  sheet.choiceSelections = Object.fromEntries(
    skin.choiceGroups.map((g) => [g.id, input.choiceSelections[g.id] ?? []]),
  )

  const [created] = await db
    .insert(characters)
    .values({
      ownerId,
      system: "monsterhearts",
      skinId: skin.id,
      name: input.name,
      sheet,
    })
    .returning({ id: characters.id })

  if (!created) {
    return { error: "Couldn't save that character. Try again." }
  }

  redirect(`/sheet/${created.id}`)
}
