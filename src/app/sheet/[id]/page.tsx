import { eq, inArray } from "drizzle-orm"
import { getLocale, getTranslations } from "next-intl/server"
import type { Locale } from "@/i18n/config"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/db"
import { characters, seasons } from "@/db/schema"
import { getSkin } from "@/data/skins"
import { localizeSkin } from "@/data/skins/localize"
import { XP_PER_ADVANCE, sheetSchema } from "@/types/sheet"
import { HarmTrack, XpTrack } from "./tracks"
import { SeasonPanel, type RosterEntry } from "./season-panel"
import { StringsPanel, type StringCandidate, type StringRow } from "./strings-panel"
import { ConditionsPanel } from "./conditions-panel"
import { AdvancesPanel, type AdvanceRow } from "./advances-panel"
import { NotesPanel } from "./notes-panel"
import { BasicsSection } from "./basics-section"
import { SheetShell } from "./sheet-shell"
import type { StatValues } from "./stats-panel"

/**
 * Identity picks are stored as the English string chosen at creation, not as
 * an index, so they don't follow the locale on their own. Resolve them
 * positionally against the untranslated skin — no migration, and an
 * unrecognised value (hand-edited, or from an older list) passes through.
 */
function localizeChoice(value: string, rawList: string[], localList: string[]): string {
  const index = rawList.indexOf(value)
  return index >= 0 ? (localList[index] ?? value) : value
}

export default async function SheetPage({ params }: PageProps<"/sheet/[id]">) {
  const { id } = await params

  const [row] = await db.select().from(characters).where(eq(characters.id, id)).limit(1)

  if (!row) notFound()

  const rawSkin = getSkin(row.skinId)
  if (!rawSkin) notFound()

  const locale = (await getLocale()) as Locale
  const skin = localizeSkin(rawSkin, locale)

  const session = await auth()
  const t = await getTranslations()
  // Sheets are readable by anyone with the link; only the owner can edit.
  const isOwner = session?.user?.id === row.ownerId

  const parsed = sheetSchema.safeParse(row.sheet)
  const sheet = parsed.success ? parsed.data : sheetSchema.parse({ identity: {} })

  const line = skin.statLines[sheet.statLineIndex] ?? skin.statLines[0]
  const moves = skin.moves.filter((m) => sheet.moveIds.includes(m.id))
  const granted = new Set(skin.startingMoveIds)

  const base: StatValues = line
    ? { hot: line.hot, cold: line.cold, volatile: line.volatile, dark: line.dark }
    : { hot: 0, cold: 0, volatile: 0, dark: 0 }

  let seasonInfo: { id: string; name: string; joinCode: string } | null = null
  let roster: RosterEntry[] = []

  if (row.seasonId) {
    const [season] = await db.select().from(seasons).where(eq(seasons.id, row.seasonId)).limit(1)

    if (season) {
      seasonInfo = { id: season.id, name: season.name, joinCode: season.joinCode }
      const members = await db.select().from(characters).where(eq(characters.seasonId, season.id))

      roster = members.map((member) => ({
        id: member.id,
        name: member.name,
        skinName: (() => {
          const s = getSkin(member.skinId)
          return s ? localizeSkin(s, locale).name : member.skinId
        })(),
        isSelf: member.id === row.id,
      }))
    }
  }

  // String targets resolve by id rather than from the roster: a String outlives
  // its target leaving the season, and the name has to outlive it too.
  const targetIds = sheet.strings
    .map((entry) => (entry.target.kind === "character" ? entry.target.characterId : null))
    .filter((value): value is string => value !== null)

  const targets =
    targetIds.length > 0
      ? await db
          .select({
            id: characters.id,
            name: characters.name,
            skinId: characters.skinId,
          })
          .from(characters)
          .where(inArray(characters.id, targetIds))
      : []

  const targetById = new Map(targets.map((target) => [target.id, target]))

  const stringRows: StringRow[] = sheet.strings.map((entry) => {
    if (entry.target.kind === "name") {
      return { id: entry.id, count: entry.count, label: entry.target.name }
    }
    const target = targetById.get(entry.target.characterId)
    if (!target) {
      return {
        id: entry.id,
        count: entry.count,
        label: t("sheet.stringTargetGone"),
      }
    }
    const rawTargetSkin = getSkin(target.skinId)
    return {
      id: entry.id,
      count: entry.count,
      label: target.name || t("common.unnamed"),
      href: `/sheet/${target.id}`,
      detail: rawTargetSkin ? localizeSkin(rawTargetSkin, locale).name : target.skinId,
    }
  })

  const stringCandidates: StringCandidate[] = roster
    .filter((entry) => !entry.isSelf)
    .map((entry) => ({
      id: entry.id,
      name: entry.name || t("common.unnamed"),
      skinName: entry.skinName,
    }))

  const advanceRows: AdvanceRow[] = skin.advances.map((advance) => ({
    id: advance.id,
    summary: advance.summary,
    maxTimes: advance.maxTimes,
    taken: sheet.advancesTaken.filter((a) => a.advanceId === advance.id).length,
  }))

  const identityLine =
    [
      localizeChoice(sheet.identity.look, rawSkin.identity.looks, skin.identity.looks),
      localizeChoice(sheet.identity.eyes, rawSkin.identity.eyes, skin.identity.eyes),
      localizeChoice(sheet.identity.origin, rawSkin.identity.origins, skin.identity.origins),
    ]
      .filter(Boolean)
      .join(" · ") || skin.tagline

  const you = (
    <>
      {/* Side by side: the two tracks are read together — "how hurt am I,
          how close to an advance" — and stacking them wasted a whole screen. */}
      <section className="mt-6 grid grid-cols-2 gap-x-3">
        <div>
          <h2 className="font-display text-ink text-[1.218rem] leading-none tracking-wide">
            {t("terms.harm")}
          </h2>
          <div className="mt-1.5">
            <HarmTrack characterId={row.id} value={sheet.harm} editable={isOwner} />
          </div>
        </div>
        <div>
          <h2 className="font-display text-ink text-[1.218rem] leading-none tracking-wide">
            {t("terms.experience")}
          </h2>
          <div className="mt-1.5">
            <XpTrack characterId={row.id} value={sheet.experience} editable={isOwner} />
          </div>
        </div>
      </section>

      <ConditionsPanel characterId={row.id} editable={isOwner} conditions={sheet.conditions} />

      <AdvancesPanel
        characterId={row.id}
        editable={isOwner}
        advances={advanceRows}
        experienceFull={sheet.experience >= XP_PER_ADVANCE}
      />

      {!isOwner ? (
        <p className="text-ink-faint mt-10 font-sans text-[0.928rem]">{t("sheet.readOnly")}</p>
      ) : null}
    </>
  )

  const stringsPane = (
    <>
      <StringsPanel
        characterId={row.id}
        editable={isOwner}
        rows={stringRows}
        candidates={stringCandidates}
      />
      <SeasonPanel characterId={row.id} editable={isOwner} season={seasonInfo} roster={roster} />
    </>
  )

  const movesPane = (
    <>
      <section className="mt-8">
        <h2 className="sheet-heading">{t("terms.moves")}</h2>
        <ul className="border-rule mt-4 border-t">
          {moves.map((move) => (
            <li key={move.id} className="border-rule border-b py-4">
              <h3 className="font-display text-ink flex items-baseline gap-2 text-[1.392rem] leading-tight tracking-wide">
                {move.name}
                {granted.has(move.id) ? (
                  <span className="text-ink-faint font-sans text-[0.871rem] tracking-[0.18em] uppercase">
                    {t("terms.granted")}
                  </span>
                ) : null}
              </h3>
              <p className="text-ink-soft mt-1 font-sans text-[1.079rem] leading-snug">
                {move.fullText ?? move.summary}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {skin.choiceGroups.map((group) => {
        const picked = sheet.choiceSelections[group.id] ?? []
        const options = group.options.filter((o) => picked.includes(o.id))
        if (options.length === 0) return null
        return (
          <section key={group.id} className="mt-10">
            <h2 className="sheet-heading">{group.label}</h2>
            <ul className="border-rule mt-4 border-t">
              {options.map((option) => (
                <li key={option.id} className="border-rule border-b py-4">
                  <h3 className="font-display text-ink text-[1.334rem] tracking-wide">
                    {option.name}
                  </h3>
                  {option.summary ? (
                    <p className="text-ink-soft mt-1 font-sans text-[1.079rem] leading-snug">
                      {option.summary}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <section className="mt-10">
        <h2 className="sheet-heading">{t("terms.sexMove")}</h2>
        <p className="text-ink-soft mt-4 font-sans text-[1.102rem] leading-relaxed">
          {skin.sexMove.fullText ?? skin.sexMove.summary}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="sheet-heading">{t("terms.darkestSelf")}</h2>
        <p className="text-ink-soft mt-4 font-sans text-[1.102rem] leading-relaxed">
          {skin.darkestSelf.summary}
        </p>
        <p className="text-ink mt-3 font-sans text-[1.102rem] leading-relaxed">
          <span className="text-ink-faint text-[0.95rem] tracking-[0.18em] uppercase">
            {t("terms.escape")}
          </span>
          <br />
          {skin.darkestSelf.escape}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="sheet-heading">{t("terms.backstory")}</h2>
        <ul className="border-rule mt-4 border-t">
          {skin.backstory.map((entry) => (
            <li
              key={entry.id}
              className="border-rule text-ink-soft border-b py-3.5 font-sans text-[1.079rem] leading-snug"
            >
              {entry.summary}
            </li>
          ))}
        </ul>
      </section>
    </>
  )

  return (
    <SheetShell
      characterId={row.id}
      editable={isOwner}
      backLabel={t("common.backToTable")}
      skinName={skin.name}
      characterName={row.name || t("common.unnamed")}
      identityLine={identityLine}
      base={base}
      bonuses={sheet.statBonuses}
      panes={{
        strings: stringsPane,
        you,
        moves: movesPane,
        basics: <BasicsSection locale={locale} />,
        notes: <NotesPanel characterId={row.id} editable={isOwner} value={sheet.notes} />,
      }}
    />
  )
}
