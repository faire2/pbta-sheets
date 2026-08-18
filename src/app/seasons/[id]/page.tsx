import { eq } from "drizzle-orm"
import { getLocale, getTranslations } from "next-intl/server"
import type { Locale } from "@/i18n/config"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/db"
import { characters, seasons } from "@/db/schema"
import { getSkin } from "@/data/skins"
import { localizeSkin } from "@/data/skins/localize"
import { SeasonEditor } from "./season-editor"

export default async function SeasonPage({
  params,
}: PageProps<"/seasons/[id]">) {
  const { id } = await params

  const session = await auth()
  const t = await getTranslations()
  const locale = (await getLocale()) as Locale
  const userId = session?.user?.id
  if (!userId) redirect("/")

  const [season] = await db
    .select()
    .from(seasons)
    .where(eq(seasons.id, id))
    .limit(1)

  if (!season) notFound()

  const roster = await db
    .select()
    .from(characters)
    .where(eq(characters.seasonId, season.id))

  // The creator can rename and remove the season; players who joined it get
  // the same roster, read-only. Everyone else gets a 404.
  const canEdit = season.createdById === userId
  const isMember = roster.some((character) => character.ownerId === userId)
  if (!canEdit && !isMember) notFound()

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-8 pb-20 sm:px-8">
      <Link
        href="/"
        className="text-ink-faint hover:text-ink font-sans text-[0.8rem] tracking-[0.14em] uppercase transition-colors"
      >
        ← {t("common.backToTable")}
      </Link>

      {canEdit ? (
        <SeasonEditor
          id={season.id}
          name={season.name}
          joinCode={season.joinCode}
        />
      ) : (
        <header className="mt-5">
          <p className="text-ink-faint font-sans text-[0.78rem] tracking-[0.16em] uppercase">
            {t("terms.season")}
          </p>
          <h1 className="font-display text-ink mt-1.5 text-[2.25rem] leading-tight tracking-tight sm:text-5xl">
            {season.name || t("home.untitledSeason")}
          </h1>
          <p className="text-ink-soft mt-3 font-sans text-[0.9rem]">
            <span className="font-mono tracking-[0.24em]">
              {season.joinCode}
            </span>
          </p>
          <p className="text-ink-faint mt-2 font-sans text-[0.82rem] leading-relaxed">
            {t("season.memberView")}
          </p>
        </header>
      )}

      <section className="mt-12">
        <h2 className="sheet-heading">{t("terms.roster")}</h2>
        {roster.length === 0 ? (
          <p className="text-ink-soft mt-4 font-sans text-[0.95rem] italic">
            {t("season.rosterEmpty")}
          </p>
        ) : (
          <ul className="border-rule mt-4 border-t">
            {roster.map((character) => {
              const raw = getSkin(character.skinId)
              const skin = raw ? localizeSkin(raw, locale) : undefined
              return (
                <li key={character.id} className="border-rule border-b">
                  <Link
                    href={`/sheet/${character.id}`}
                    className="press focus-visible:outline-ink flex min-h-[64px] items-center py-4 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span className="font-display text-ink flex-1 text-[1.25rem] leading-none tracking-wide">
                      {character.name || t("common.unnamed")}
                    </span>
                    <span className="text-ink-soft font-sans text-[0.9rem] italic">
                      {skin?.name ?? character.skinId}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}
