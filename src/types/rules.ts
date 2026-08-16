import { z } from "zod"

export const statKeySchema = z.enum(["hot", "cold", "volatile", "dark"])

/**
 * A basic move — available to every character regardless of skin.
 *
 * Split into trigger / strong hit (10+) / weak hit (7-9) so the sheet can show
 * the relevant outcome inline when a roll lands, rather than making the player
 * re-read a paragraph mid-scene. Same `fullText` convention as `Move`.
 */
export const basicMoveSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  stat: statKeySchema,
  /** What sets the move off. */
  trigger: z.string().min(1),
  /** Result on 10 or higher. */
  strongHit: z.string().min(1),
  /** Result on 7-9. */
  weakHit: z.string().min(1),
  /** Pick-lists attached to the outcomes, if the move has one. */
  options: z.array(z.string().min(1)).default([]),
  fullText: z.string().optional(),
})

/** A rules box from the Player Sheet that isn't a move (Healing, Conditions, …). */
export const rulesEntrySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  summary: z.string().min(1),
  options: z.array(z.string().min(1)).default([]),
  fullText: z.string().optional(),
})

export type StatKey = z.infer<typeof statKeySchema>
export type BasicMove = z.infer<typeof basicMoveSchema>
export type RulesEntry = z.infer<typeof rulesEntrySchema>
