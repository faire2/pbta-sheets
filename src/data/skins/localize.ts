import type { Locale } from "@/i18n/config"
import type { Skin } from "@/types/skin"
import { resolvers } from "../catalogue"
import en from "../../../messages/skins.en.json"
import cs from "../../../messages/skins.cs.json"

/**
 * Swaps a skin's display text for the requested locale.
 *
 * Returns the same `Skin` shape, so every component renders unchanged — the
 * text simply arrives already localised. Resolution is per-field: `cs` where a
 * translation exists, otherwise the generated English. That means a partial
 * Czech catalogue is useful immediately instead of all-or-nothing.
 *
 * `identity.names` are deliberately untouched — they're proper nouns.
 */

type Catalogue = Record<string, unknown>

const CATALOGUES: Record<string, Catalogue> = { en, cs }

export function localizeSkin(skin: Skin, locale: Locale): Skin {
  if (locale === "en") {
    // Still resolved through the catalogue, so English takes the same path.
    return resolve(skin, [CATALOGUES.en])
  }
  return resolve(skin, [CATALOGUES[locale], CATALOGUES.en])
}

function resolve(skin: Skin, cats: (Catalogue | undefined)[]): Skin {
  const id = skin.id
  const resolve = resolvers(cats)
  const first = (path: string[], fallback: string): string =>
    resolve.first([id, ...path], fallback)
  const firstList = (path: string[], fallback: string[]): string[] =>
    resolve.firstList([id, ...path], fallback)

  return {
    ...skin,
    name: first(["name"], skin.name),
    tagline: first(["tagline"], skin.tagline),
    identity: {
      names: skin.identity.names,
      looks: firstList(["identity", "looks"], skin.identity.looks),
      eyes: firstList(["identity", "eyes"], skin.identity.eyes),
      origins: firstList(["identity", "origins"], skin.identity.origins),
    },
    moves: skin.moves.map((m) => ({
      ...m,
      name: first(["moves", m.id, "name"], m.name),
      summary: first(["moves", m.id, "summary"], m.summary),
    })),
    choiceGroups: skin.choiceGroups.map((g) => ({
      ...g,
      label: first(["choiceGroups", g.id, "label"], g.label),
      options: g.options.map((o) => ({
        ...o,
        name: first(["choiceGroups", g.id, "options", o.id, "name"], o.name),
        summary:
          o.summary === undefined
            ? undefined
            : first(
                ["choiceGroups", g.id, "options", o.id, "summary"],
                o.summary,
              ),
      })),
    })),
    backstory: skin.backstory.map((b) => ({
      ...b,
      summary: first(["backstory", b.id], b.summary),
    })),
    darkestSelf: {
      ...skin.darkestSelf,
      summary: first(["darkestSelf", "summary"], skin.darkestSelf.summary),
      escape: first(["darkestSelf", "escape"], skin.darkestSelf.escape),
    },
    sexMove: {
      ...skin.sexMove,
      summary: first(["sexMove"], skin.sexMove.summary),
    },
    advances: skin.advances.map((a) => ({
      ...a,
      summary: first(["advances", a.id], a.summary),
    })),
  }
}

/** All skins, localised. Order is preserved. */
export function localizeSkins(all: Skin[], locale: Locale): Skin[] {
  return all.map((s) => localizeSkin(s, locale))
}
