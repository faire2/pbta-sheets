import { desc, eq, inArray, or } from "drizzle-orm"
import { getLocale, getTranslations } from "next-intl/server"
import type { Locale } from "@/i18n/config"
import Link from "next/link"
import { auth, signIn, signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import { db } from "@/db"
import { characters, seasons } from "@/db/schema"
import { getSkin } from "@/data/skins"
import { localizeSkin } from "@/data/skins/localize"
import { NewSeasonForm } from "./new-season-form"
import { PageBar } from "@/components/page-bar"

async function SignedOut() {
  const t = await getTranslations()

  return (
    <>
      <PageBar />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-20 sm:px-8">
        <p className="text-ink-faint font-sans text-[0.924rem] tracking-[0.22em] uppercase">
          {t("landing.eyebrow")}
        </p>
        <h1 className="font-display text-ink mt-3 text-[3rem] leading-[0.92] tracking-tight sm:text-7xl">
          {t("landing.title")}
        </h1>
        <p className="text-ink-soft mt-5 max-w-prose font-sans text-[1.218rem] leading-relaxed italic">
          {t("landing.lede")}
        </p>
        <hr className="sheet-rule my-8" />
        <form
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/" })
          }}
        >
          <Button type="submit" className="min-h-12 px-7">
            {t("common.signInWithGoogle")}
          </Button>
        </form>
        <p className="text-ink-faint mt-5 font-sans text-[0.951rem]">{t("landing.note")}</p>
      </main>
    </>
  )
}

export default async function HomePage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return <SignedOut />

  const t = await getTranslations()
  const locale = (await getLocale()) as Locale

  const myCharacters = await db
    .select()
    .from(characters)
    .where(eq(characters.ownerId, userId))
    .orderBy(desc(characters.updatedAt))

  // Seasons you started, plus any your characters joined — a player who typed
  // someone else's code still has to find that season from here.
  const joinedSeasonIds = [
    ...new Set(
      myCharacters
        .map((character) => character.seasonId)
        .filter((value): value is string => value !== null),
    ),
  ]

  const mySeasons = await db
    .select()
    .from(seasons)
    .where(
      joinedSeasonIds.length > 0
        ? or(eq(seasons.createdById, userId), inArray(seasons.id, joinedSeasonIds))
        : eq(seasons.createdById, userId),
    )
    .orderBy(desc(seasons.updatedAt))

  // Roster sizes count every character in the season, not just your own.
  const seasonIds = mySeasons.map((s) => s.id)
  const rosters =
    seasonIds.length > 0
      ? await db
          .select({ id: characters.id, seasonId: characters.seasonId })
          .from(characters)
          .where(inArray(characters.seasonId, seasonIds))
      : []

  const rosterCount = new Map<string, number>()
  for (const row of rosters) {
    if (row.seasonId) {
      rosterCount.set(row.seasonId, (rosterCount.get(row.seasonId) ?? 0) + 1)
    }
  }

  return (
    <>
      <PageBar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-10 pb-20 sm:px-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-ink-faint font-sans text-[0.924rem] tracking-[0.22em] uppercase">
              {t("terms.system")}
            </p>
            <h1 className="font-display text-ink mt-2 text-[2.5rem] leading-[0.95] tracking-tight sm:text-5xl">
              {t("home.title")}
            </h1>
          </div>
          <div className="flex flex-col items-end gap-3">
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/" })
              }}
            >
              <button
                type="submit"
                className="text-ink-faint hover:text-ink font-sans text-[1.03rem] tracking-[0.14em] uppercase transition-colors"
              >
                {t("common.signOut")}
              </button>
            </form>
          </div>
        </header>

        <section className="mt-10">
          <h2 className="sheet-heading">{t("terms.characters")}</h2>

          {myCharacters.length === 0 ? (
            <p className="text-ink-soft mt-4 font-sans text-[1.102rem] italic">
              {t("home.charactersEmpty")}
            </p>
          ) : (
            <ul className="border-rule mt-4 border-t">
              {myCharacters.map((character) => {
                const raw = getSkin(character.skinId)
                const skin = raw ? localizeSkin(raw, locale) : undefined
                return (
                  <li key={character.id} className="border-rule border-b">
                    <Link
                      href={`/sheet/${character.id}`}
                      className="press group focus-visible:outline-ink flex min-h-[68px] items-center gap-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="font-display text-ink block text-[1.431rem] leading-none tracking-wide">
                          {character.name || t("common.unnamed")}
                        </span>
                        <span className="text-ink-soft mt-1.5 block font-sans text-[1.044rem] italic">
                          {skin?.name ?? character.skinId}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className="text-ink-faint group-hover:text-ink font-display shrink-0 text-xl transition-[color,transform] duration-150 group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}

          <Link
            href="/characters/new"
            className="border-ink text-ink hover:bg-ink hover:text-paper focus-visible:outline-ink mt-5 inline-flex min-h-12 items-center border px-6 font-sans text-[1.044rem] tracking-[0.1em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t("home.newCharacter")}
          </Link>
        </section>

        <section className="mt-14">
          <h2 className="sheet-heading">{t("terms.seasons")}</h2>
          <p className="text-ink-faint mt-2 font-sans text-[0.951rem] leading-relaxed">
            {t("home.seasonsLede")}
          </p>

          {mySeasons.length === 0 ? (
            <p className="text-ink-soft mt-4 font-sans text-[1.102rem] italic">
              {t("home.seasonsEmpty")}
            </p>
          ) : (
            <ul className="border-rule mt-4 border-t">
              {mySeasons.map((season) => (
                <li key={season.id} className="border-rule border-b">
                  <Link
                    href={`/seasons/${season.id}`}
                    className="press group focus-visible:outline-ink flex min-h-[68px] items-center gap-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="font-display text-ink block text-[1.431rem] leading-none tracking-wide">
                        {season.name || t("home.untitledSeason")}
                      </span>
                      <span className="text-ink-soft mt-1.5 block font-sans text-[1.044rem]">
                        <span className="font-mono tracking-[0.2em]">{season.joinCode}</span>
                        <span className="text-ink-faint">
                          {" · "}
                          {t("home.characterCount", {
                            count: rosterCount.get(season.id) ?? 0,
                          })}
                        </span>
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="text-ink-faint group-hover:text-ink shrink-0 font-sans text-[1.03rem] tracking-[0.14em] uppercase transition-colors"
                    >
                      {season.createdById === userId ? t("common.edit") : t("common.view")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <NewSeasonForm />
        </section>
      </main>
    </>
  )
}
