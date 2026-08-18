/**
 * Derives `messages/skins.en.json` from the skin data files.
 *
 * The data files stay the mechanical source of truth — ids, counts, stat
 * numbers — and are still Zod-validated and audited against the reference PDF.
 * This lifts their *display text* into a catalogue so the render path reads
 * English through the same mechanism as Czech, and a translation can be added
 * without touching audited data.
 *
 * Run: yarn generate-skin-messages   (yarn validate-data checks for drift)
 */
import { writeFileSync } from "node:fs"
import { skins } from "../src/data/skins"
import type { Skin } from "../src/types/skin"

export interface SkinMessages {
  name: string
  tagline: string
  /** Descriptive lists only. `identity.names` are proper nouns — not translated. */
  identity: { looks: string[]; eyes: string[]; origins: string[] }
  moves: Record<string, { name: string; summary: string }>
  choiceGroups: Record<
    string,
    { label: string; options: Record<string, { name: string; summary?: string }> }
  >
  backstory: Record<string, string>
  darkestSelf: { summary: string; escape: string }
  sexMove: string
  advances: Record<string, string>
}

export function extract(skin: Skin): SkinMessages {
  return {
    name: skin.name,
    tagline: skin.tagline,
    identity: {
      looks: skin.identity.looks,
      eyes: skin.identity.eyes,
      origins: skin.identity.origins,
    },
    moves: Object.fromEntries(
      skin.moves.map((m) => [m.id, { name: m.name, summary: m.summary }]),
    ),
    choiceGroups: Object.fromEntries(
      skin.choiceGroups.map((g) => [
        g.id,
        {
          label: g.label,
          options: Object.fromEntries(
            g.options.map((o) => [
              o.id,
              o.summary === undefined
                ? { name: o.name }
                : { name: o.name, summary: o.summary },
            ]),
          ),
        },
      ]),
    ),
    backstory: Object.fromEntries(skin.backstory.map((b) => [b.id, b.summary])),
    darkestSelf: {
      summary: skin.darkestSelf.summary,
      escape: skin.darkestSelf.escape,
    },
    sexMove: skin.sexMove.summary,
    advances: Object.fromEntries(skin.advances.map((a) => [a.id, a.summary])),
  }
}

export function extractAll(): Record<string, SkinMessages> {
  return Object.fromEntries(skins.map((s) => [s.id, extract(s)]))
}

const isMain = process.argv[1]?.endsWith("generate-skin-messages.ts") ?? false
if (isMain) {
  const out = JSON.stringify(extractAll(), null, 2) + "\n"
  writeFileSync("messages/skins.en.json", out)
  const count = JSON.stringify(extractAll()).match(/"/g)?.length ?? 0
  console.log(
    `Wrote messages/skins.en.json — ${String(skins.length)} skins, ~${String(Math.floor(count / 4))} strings`,
  )
}
