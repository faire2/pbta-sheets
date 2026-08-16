import { z } from "zod"

/** Harm track length, from the sheet: four segments. */
export const MAX_HARM = 4
/** Experience track: five circles. Fill all five to take an advance. */
export const XP_PER_ADVANCE = 5

/**
 * A String you hold on someone.
 *
 * The target is either a character in your season (so the roster drives a
 * picker instead of free typing) or a plain name — side characters get Strings
 * constantly, and they have no sheet: the Queen's gang, an NPC Lover, the
 * Infernal's Dark Power.
 */
export const stringTargetSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("character"), characterId: z.uuid() }),
  z.object({ kind: z.literal("name"), name: z.string().min(1) }),
])

export const stringEntrySchema = z.object({
  id: z.string().min(1),
  target: stringTargetSchema,
  count: z.number().int().nonnegative(),
})

/** A taken advance. Repeats are allowed up to the advance's `maxTimes`. */
export const takenAdvanceSchema = z.object({
  advanceId: z.string().min(1),
  /** ISO 8601. Ordering only — nothing depends on the clock. */
  takenAt: z.iso.datetime(),
})

export const sheetSchema = z.object({
  identity: z.object({
    look: z.string().default(""),
    eyes: z.string().default(""),
    origin: z.string().default(""),
  }),

  /** Which of the skin's stat lines was picked, then any +1s from advances. */
  statLineIndex: z.number().int().nonnegative().default(0),
  statBonuses: z
    .object({
      hot: z.number().int().default(0),
      cold: z.number().int().default(0),
      volatile: z.number().int().default(0),
      dark: z.number().int().default(0),
    })
    .default({ hot: 0, cold: 0, volatile: 0, dark: 0 }),

  harm: z.number().int().min(0).max(MAX_HARM).default(0),
  conditions: z.array(z.string().min(1)).default([]),

  /** Move ids the character has: granted + chosen at creation + from advances. */
  moveIds: z.array(z.string().min(1)).default([]),
  /** Selections within a skin's choice groups, keyed by group id. */
  choiceSelections: z.record(z.string(), z.array(z.string())).default({}),

  strings: z.array(stringEntrySchema).default([]),

  /** Marks on the Experience track. Reaching XP_PER_ADVANCE buys an advance. */
  experience: z.number().int().min(0).max(XP_PER_ADVANCE).default(0),
  advancesTaken: z.array(takenAdvanceSchema).default([]),

  notes: z.string().default(""),
})

export type StringTarget = z.infer<typeof stringTargetSchema>
export type StringEntry = z.infer<typeof stringEntrySchema>
export type TakenAdvance = z.infer<typeof takenAdvanceSchema>
export type Sheet = z.infer<typeof sheetSchema>

/** A blank sheet. `sheetSchema` supplies every default, so this can't drift. */
export function emptySheet(): Sheet {
  return sheetSchema.parse({ identity: {} })
}
