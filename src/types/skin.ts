import { z } from "zod"

/** The four Monsterhearts stats. Every skin offers a choice of opening lines. */
export const statsSchema = z.object({
  hot: z.number().int(),
  cold: z.number().int(),
  volatile: z.number().int(),
  dark: z.number().int(),
})

/**
 * A move.
 *
 * `summary` is our own plain-language description of the mechanics — it ships in
 * the repo and is what gets translated to Czech.
 *
 * `fullText` is the verbatim book text. It is intentionally EMPTY in version
 * control; see ROADMAP → Notes → Content licensing. The app renders `fullText`
 * when present and falls back to `summary`.
 */
export const moveSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  summary: z.string().min(1),
  fullText: z.string().optional(),
})

export const darkestSelfSchema = z.object({
  summary: z.string().min(1),
  /** What it takes to escape your Darkest Self. */
  escape: z.string().min(1),
  fullText: z.string().optional(),
})

export const sexMoveSchema = z.object({
  summary: z.string().min(1),
  fullText: z.string().optional(),
})

/** A backstory prompt — each one hands out or takes Strings at character creation. */
export const backstorySchema = z.object({
  id: z.string().min(1),
  summary: z.string().min(1),
  fullText: z.string().optional(),
})

export const advanceSchema = z.object({
  id: z.string().min(1),
  summary: z.string().min(1),
  /** Some advances can be taken more than once (e.g. "take another skin move"). */
  maxTimes: z.number().int().positive().default(1),
})

/**
 * A secondary pick-list that isn't moves: the Infernal's Bargains, the Witch's
 * Hexes, the Ghoul's Hungers, the Queen's gang strengths. Same interaction as
 * moves on the sheet — tap to select, up to `chooseCount`.
 */
export const choiceGroupSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  chooseCount: z.number().int().positive(),
  options: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        /**
         * Optional: some lists (the Infernal's Bargains, the Witch's Hexes)
         * print a description per option; others (the Ghoul's Hungers, the
         * Queen's gang strengths) print only a bare label. Where the source
         * gives no description, leave this unset rather than inventing one.
         */
        summary: z.string().min(1).optional(),
        fullText: z.string().optional(),
      }),
    )
    .min(1),
})

export const identitySchema = z.object({
  names: z.array(z.string().min(1)).min(1),
  looks: z.array(z.string().min(1)).min(1),
  eyes: z.array(z.string().min(1)).min(1),
  origins: z.array(z.string().min(1)).min(1),
})

export const skinSchema = z
  .object({
    /** Stable slug — used in URLs and as `character.skinId`. Never rename. */
    id: z.string().regex(/^[a-z-]+$/),
    name: z.string().min(1),
    /** The adjective line that opens the skin's page. */
    tagline: z.string().min(1),
    identity: identitySchema,
    statLines: z.array(statsSchema).min(1),
    /** Move ids every character of this skin starts with, no choice involved. */
    startingMoveIds: z.array(z.string().min(1)),
    /** How many additional moves the player picks at creation. */
    chooseMoveCount: z.number().int().nonnegative(),
    moves: z.array(moveSchema).min(1),
    /** Secondary pick-lists, if the skin has any. Most don't. */
    choiceGroups: z.array(choiceGroupSchema).default([]),
    backstory: z.array(backstorySchema).min(1),
    darkestSelf: darkestSelfSchema,
    sexMove: sexMoveSchema,
    advances: z.array(advanceSchema).min(1),
  })
  .superRefine((skin, ctx) => {
    const ids = new Set(skin.moves.map((m) => m.id))
    if (ids.size !== skin.moves.length) {
      ctx.addIssue({ code: "custom", message: `${skin.id}: duplicate move ids` })
    }
    for (const id of skin.startingMoveIds) {
      if (!ids.has(id)) {
        ctx.addIssue({
          code: "custom",
          message: `${skin.id}: startingMoveIds references unknown move "${id}"`,
        })
      }
    }
    if (skin.chooseMoveCount > skin.moves.length - skin.startingMoveIds.length) {
      ctx.addIssue({
        code: "custom",
        message: `${skin.id}: chooseMoveCount exceeds the available moves`,
      })
    }
  })

export type Stats = z.infer<typeof statsSchema>
export type Move = z.infer<typeof moveSchema>
export type Advance = z.infer<typeof advanceSchema>
export type Skin = z.infer<typeof skinSchema>
