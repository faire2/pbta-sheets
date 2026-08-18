/**
 * Validates every skin against the Zod schema, plus a few cross-file invariants
 * the schema can't see on its own (duplicate skin ids, id collisions).
 *
 * Run: yarn validate-data
 */
import { skins } from "../src/data/skins"
import { skinSchema } from "../src/types/skin"
import { basicMoves, rulesEntries } from "../src/data/basic-moves"
import { basicMoveSchema, rulesEntrySchema } from "../src/types/rules"
import { extractAll, extractRules } from "./generate-skin-messages"
import { readFileSync } from "node:fs"

let failures = 0

function fail(message: string): void {
  console.error(`  ✗ ${message}`)
  failures += 1
}

console.log(`Validating ${String(skins.length)} skins…`)

for (const skin of skins) {
  const result = skinSchema.safeParse(skin)
  if (result.success) {
    // Read from result.data, not the input — Zod applies `.default()` on parse.
    const parsed = result.data
    const groupCount = parsed.choiceGroups.length
    console.log(
      `  ✓ ${parsed.name.padEnd(14)} ${String(parsed.moves.length)} moves, ` +
        `${String(parsed.startingMoveIds.length)} granted + choose ${String(parsed.chooseMoveCount)}` +
        (groupCount > 0 ? `, ${String(groupCount)} choice group(s)` : ""),
    )
  } else {
    for (const issue of result.error.issues) {
      fail(`${skin.id}: ${issue.path.join(".")} — ${issue.message}`)
    }
  }
}

const skinIds = skins.map((s) => s.id)
const duplicateSkinIds = skinIds.filter((id, i) => skinIds.indexOf(id) !== i)
if (duplicateSkinIds.length > 0) {
  fail(`duplicate skin ids: ${duplicateSkinIds.join(", ")}`)
}

for (const skin of skins) {
  const groupOptionIds = skin.choiceGroups.flatMap((g) =>
    g.options.map((o) => o.id),
  )
  const moveIds = new Set(skin.moves.map((m) => m.id))
  for (const optionId of groupOptionIds) {
    if (moveIds.has(optionId)) {
      fail(`${skin.id}: "${optionId}" is both a move id and a choice-group id`)
    }
  }
  const advanceIds = skin.advances.map((a) => a.id)
  const duplicateAdvances = advanceIds.filter(
    (id, i) => advanceIds.indexOf(id) !== i,
  )
  if (duplicateAdvances.length > 0) {
    fail(`${skin.id}: duplicate advance ids: ${duplicateAdvances.join(", ")}`)
  }
}

console.log(`\nValidating ${String(basicMoves.length)} basic moves…`)
for (const move of basicMoves) {
  const result = basicMoveSchema.safeParse(move)
  if (result.success) {
    console.log(`  ✓ ${move.name.padEnd(22)} (${move.stat})`)
  } else {
    for (const issue of result.error.issues) {
      fail(`${move.id}: ${issue.path.join(".")} — ${issue.message}`)
    }
  }
}

console.log(`\nValidating ${String(rulesEntries.length)} rules entries…`)
for (const entry of rulesEntries) {
  const result = rulesEntrySchema.safeParse(entry)
  if (!result.success) {
    for (const issue of result.error.issues) {
      fail(`${entry.id}: ${issue.path.join(".")} — ${issue.message}`)
    }
  }
}

/**
 * Walks a translated subtree against the English one.
 *
 * Missing keys are FINE — the resolver falls back per field, so a partial
 * translation is valid. What is not fine:
 *  - a key that isn't in the English (a typo that will never render)
 *  - an array of the wrong length (identity lists are positional; the
 *    resolver silently drops the whole list, leaving that section English)
 *  - a type mismatch (string where a list belongs, etc.)
 */
function walk(
  enNode: unknown,
  csNode: unknown,
  path: string,
  label: string,
): void {
  if (Array.isArray(enNode)) {
    if (!Array.isArray(csNode)) {
      fail(`${label}: ${path} should be a list`)
      return
    }
    if (enNode.length !== csNode.length) {
      fail(
        `${label}: ${path} has ${String(csNode.length)} items, English has ${String(enNode.length)} — positional, so it would silently fall back`,
      )
    }
    return
  }
  if (typeof enNode === "object" && enNode !== null) {
    if (typeof csNode !== "object" || csNode === null || Array.isArray(csNode)) {
      fail(`${label}: ${path} should be an object`)
      return
    }
    const enObj = enNode as Record<string, unknown>
    const csObj = csNode as Record<string, unknown>
    for (const key of Object.keys(csObj)) {
      if (!(key in enObj)) {
        fail(`${label}: ${path}.${key} is not in the English catalogue`)
        continue
      }
      walk(enObj[key], csObj[key], `${path}.${key}`, label)
    }
    return
  }
  if (typeof enNode === "string" && typeof csNode !== "string") {
    fail(`${label}: ${path} should be a string`)
  }
}

// ── skin text catalogue ──────────────────────────────────────────────
// The English catalogue is DERIVED from the data files. If they drift, the
// render path shows stale text while the audited data says something else —
// so treat any divergence as a build failure, not a warning.
console.log("\nChecking messages/skins.en.json against the data…")
{
  const expected = JSON.stringify(extractAll(), null, 2) + "\n"
  let actual = ""
  try {
    actual = readFileSync("messages/skins.en.json", "utf8")
  } catch {
    fail("messages/skins.en.json is missing — run `yarn generate-skin-messages`")
  }
  if (actual && actual !== expected) {
    fail(
      "messages/skins.en.json is stale — run `yarn generate-skin-messages`",
    )
  } else if (actual) {
    console.log("  \u2713 in sync with the skin data")
  }
}

// A Czech entry that isn't in the English catalogue is a typo'd key that will
// silently never render.
{
  const en = extractAll()
  let cs: Record<string, unknown> = {}
  try {
    cs = JSON.parse(readFileSync("messages/skins.cs.json", "utf8")) as Record<
      string,
      unknown
    >
  } catch {
    fail("messages/skins.cs.json is missing or invalid JSON")
  }
  const unknownSkins = Object.keys(cs).filter((id) => !(id in en))
  if (unknownSkins.length > 0) {
    fail(`skins.cs.json has unknown skin ids: ${unknownSkins.join(", ")}`)
  }

  for (const [skinId, csSkin] of Object.entries(cs)) {
    const enSkin = (en as Record<string, unknown>)[skinId]
    if (enSkin) walk(enSkin, csSkin, skinId, skinId)
  }

  const translated = Object.keys(cs).length
  const total = Object.keys(en).length
  console.log(
    `  \u2713 skins.cs.json: ${String(translated)}/${String(total)} skins, structure matches`,
  )
}

// ── basic-move / rules catalogue ─────────────────────────────────────
console.log("\nChecking messages/rules.en.json against the data…")
{
  const expected = JSON.stringify(extractRules(), null, 2) + "\n"
  let actual = ""
  try {
    actual = readFileSync("messages/rules.en.json", "utf8")
  } catch {
    fail("messages/rules.en.json is missing — run `yarn generate-skin-messages`")
  }
  if (actual && actual !== expected) {
    fail("messages/rules.en.json is stale — run `yarn generate-skin-messages`")
  } else if (actual) {
    console.log("  \u2713 in sync with the basic moves and rules boxes")
  }
}

{
  const en = extractRules()
  let cs: unknown = {}
  try {
    cs = JSON.parse(readFileSync("messages/rules.cs.json", "utf8"))
  } catch {
    fail("messages/rules.cs.json is missing or invalid JSON")
  }
  walk(en, cs, "rules.cs.json", "rules.cs.json")
  console.log("  \u2713 rules.cs.json: structure matches")
}

if (failures > 0) {
  console.error(`\n${String(failures)} problem(s) found.`)
  process.exit(1)
}

console.log("\nAll data valid.")
