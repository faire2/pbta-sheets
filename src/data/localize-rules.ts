import type { Locale } from "@/i18n/config"
import type { BasicMove, RulesEntry } from "@/types/rules"
import { basicMoves, rulesEntries } from "./basic-moves"
import { type Catalogue, resolvers } from "./catalogue"
import en from "../../messages/rules.en.json"
import cs from "../../messages/rules.cs.json"

const CATALOGUES: Record<string, Catalogue> = { en, cs }

function chain(locale: Locale): (Catalogue | undefined)[] {
  // English still resolves through the catalogue, so both locales take the
  // same path and a drifted generated file fails the same way in either.
  return locale === "en"
    ? [CATALOGUES.en]
    : [CATALOGUES[locale], CATALOGUES.en]
}

export function localizeBasicMoves(locale: Locale): BasicMove[] {
  const { first, firstList } = resolvers(chain(locale))
  return basicMoves.map((move) => ({
    ...move,
    name: first(["basicMoves", move.id, "name"], move.name),
    trigger: first(["basicMoves", move.id, "trigger"], move.trigger),
    strongHit: first(["basicMoves", move.id, "strongHit"], move.strongHit),
    weakHit: first(["basicMoves", move.id, "weakHit"], move.weakHit),
    options: firstList(["basicMoves", move.id, "options"], move.options),
  }))
}

export function localizeRulesEntries(locale: Locale): RulesEntry[] {
  const { first, firstList } = resolvers(chain(locale))
  return rulesEntries.map((entry) => ({
    ...entry,
    name: first(["rules", entry.id, "name"], entry.name),
    summary: first(["rules", entry.id, "summary"], entry.summary),
    options: firstList(["rules", entry.id, "options"], entry.options),
  }))
}
