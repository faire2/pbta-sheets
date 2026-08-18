import { eq } from "drizzle-orm"
import { getLocale, getTranslations } from "next-intl/server"
import type { Locale } from "@/i18n/config"
import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/db"
import { characters, seasons } from "@/db/schema"
import { getSkin } from "@/data/skins"
import { localizeSkin } from "@/data/skins/localize"
import { sheetSchema } from "@/types/sheet"
import { HarmTrack, XpTrack } from "./tracks"
import { SeasonPanel, type RosterEntry } from "./season-panel"

/** Stat labels come from the catalogue — see docs/GLOSSARY.md. */
const STAT_KEYS = ["hot", "cold", "volatile", "dark"] as const

function signed(n: number): string {
  return n > 0 ? `+${String(n)}` : String(n)
}

export default async function SheetPage({ params }: PageProps<"/sheet/[id]">) {
  const { id } = await params

  const [row] = await db
    .select()
    .from(characters)
    .where(eq(characters.id, id))
    .limit(1)

  if (!row) notFound()

  const rawSkin = getSkin(row.skinId)
  if (!rawSkin) notFound()

  const locale = await getLocale()
  const skin = localizeSkin(rawSkin, locale as Locale)

  const session = await auth()
  const t = await getTranslations()
  // Sheets are readable by anyone with the link; only the owner can edit.
  const isOwner = session?.user?.id === row.ownerId

  const parsed = sheetSchema.safeParse(row.sheet)
  const sheet = parsed.success
    ? parsed.data
    : sheetSchema.parse({ identity: {} })

  const line = skin.statLines[sheet.statLineIndex] ?? skin.statLines[0]
  const moves = skin.moves.filter((m) => sheet.moveIds.includes(m.id))
  const granted = new Set(skin.startingMoveIds)

  let seasonInfo: { id: string; name: string; joinCode: string } | null = null
  let roster: RosterEntry[] = []

  if (row.seasonId) {
    const [season] = await db
      .select()
      .from(seasons)
      .where(eq(seasons.id, row.seasonId))
      .limit(1)

    if (season) {
      seasonInfo = {
        id: season.id,
        name: season.name,
        joinCode: season.joinCode,
      }
      const members = await db
        .select()
        .from(characters)
        .where(eq(characters.seasonId, season.id))

      roster = members.map((member) => ({
        id: member.id,
        name: member.name,
        skinName: (() => {
          const s = getSkin(member.skinId)
          return s ? localizeSkin(s, locale as Locale).name : member.skinId
        })(),
        isSelf: member.id === row.id,
      }))
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-8 pb-20 sm:px-8">
      <Link
        href="/"
        className="text-ink-faint hover:text-ink font-sans text-[0.8rem] tracking-[0.14em] uppercase transition-colors"
      >
        ← {t("common.backToTable")}
      </Link>

      <header className="mt-5">
        <p className="text-ink-faint font-sans text-[0.7rem] tracking-[0.22em] uppercase">
          {skin.name}
        </p>
        <h1 className="font-display text-ink mt-2 text-[2.75rem] leading-[0.95] tracking-tight sm:text-6xl">
          {row.name || t("common.unnamed")}
        </h1>
        <p className="text-ink-soft mt-2 font-sans text-[0.95rem] italic">
          {[sheet.identity.look, sheet.identity.eyes, sheet.identity.origin]
            .filter(Boolean)
            .join(" · ") || skin.tagline}
        </p>
      </header>

      {line ? (
        <section className="border-rule mt-8 grid grid-cols-4 gap-2 border-t border-b py-4">
          {STAT_KEYS.map((key) => (
            <div key={key}>
              <span className="font-display text-ink block text-[1.15rem] leading-none">
                {t(`terms.${key}`)}
              </span>
              <span className="text-ink-soft mt-1.5 block font-sans text-[1.3rem] leading-none tabular-nums">
                {signed(line[key] + sheet.statBonuses[key])}
              </span>
            </div>
          ))}
        </section>
      ) : null}

      <section className="mt-8 flex flex-wrap items-start justify-between gap-x-8 gap-y-6">
        <div>
          <h2 className="font-display text-ink text-xl tracking-wide">
            {t("terms.harm")}
          </h2>
          <div className="mt-1">
            <HarmTrack
              characterId={row.id}
              value={sheet.harm}
              editable={isOwner}
            />
          </div>
        </div>
        <div>
          <h2 className="font-display text-ink text-xl tracking-wide">
            {t("terms.experience")}
          </h2>
          <div className="mt-1">
            <XpTrack
              characterId={row.id}
              value={sheet.experience}
              editable={isOwner}
            />
          </div>
        </div>
      </section>

      <SeasonPanel
        characterId={row.id}
        editable={isOwner}
        season={seasonInfo}
        roster={roster}
      />

      <section className="mt-12">
        <h2 className="sheet-heading">{t("terms.moves")}</h2>
        <ul className="border-rule mt-4 border-t">
          {moves.map((move) => (
            <li key={move.id} className="border-rule border-b py-4">
              <h3 className="font-display text-ink flex items-baseline gap-2 text-[1.2rem] leading-tight tracking-wide">
                {move.name}
                {granted.has(move.id) ? (
                  <span className="text-ink-faint font-sans text-[0.66rem] tracking-[0.18em] uppercase">
                    {t("terms.granted")}
                  </span>
                ) : null}
              </h3>
              <p className="text-ink-soft mt-1 font-sans text-[0.93rem] leading-snug">
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
                  <h3 className="font-display text-ink text-[1.15rem] tracking-wide">
                    {option.name}
                  </h3>
                  {option.summary ? (
                    <p className="text-ink-soft mt-1 font-sans text-[0.93rem] leading-snug">
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
        <h2 className="sheet-heading">{t("terms.darkestSelf")}</h2>
        <p className="text-ink-soft mt-4 font-sans text-[0.95rem] leading-relaxed">
          {skin.darkestSelf.summary}
        </p>
        <p className="text-ink mt-3 font-sans text-[0.95rem] leading-relaxed">
          <span className="text-ink-faint text-[0.72rem] tracking-[0.18em] uppercase">
            {t("terms.escape")}
          </span>
          <br />
          {skin.darkestSelf.escape}
        </p>
      </section>

      {!isOwner ? (
        <p className="text-ink-faint mt-12 font-sans text-[0.8rem]">
          {t("sheet.readOnly")}
        </p>
      ) : null}
    </main>
  )
}
