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

if (failures > 0) {
  console.error(`\n${String(failures)} problem(s) found.`)
  process.exit(1)
}

console.log("\nAll data valid.")
