import { eq } from "drizzle-orm"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/db"
import { characters, seasons } from "@/db/schema"
import { getSkin } from "@/data/skins"
import { SeasonEditor } from "./season-editor"

export default async function SeasonPage({
  params,
}: PageProps<"/seasons/[id]">) {
  const { id } = await params

  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect("/")

  const [season] = await db
    .select()
    .from(seasons)
    .where(eq(seasons.id, id))
    .limit(1)

  if (!season) notFound()
  // Only the season's creator gets the edit view.
  if (season.createdById !== userId) notFound()

  const roster = await db
    .select()
    .from(characters)
    .where(eq(characters.seasonId, season.id))

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-8 pb-20 sm:px-8">
      <Link
        href="/"
        className="text-ink-faint hover:text-ink font-sans text-[0.8rem] tracking-[0.14em] uppercase transition-colors"
      >
        ← Your table
      </Link>

      <SeasonEditor
        id={season.id}
        name={season.name}
        joinCode={season.joinCode}
      />

      <section className="mt-12">
        <h2 className="sheet-heading">Roster</h2>
        {roster.length === 0 ? (
          <p className="text-ink-soft mt-4 font-sans text-[0.95rem] italic">
            Nobody has joined yet. Share the code above.
          </p>
        ) : (
          <ul className="border-rule mt-4 border-t">
            {roster.map((character) => {
              const skin = getSkin(character.skinId)
              return (
                <li key={character.id} className="border-rule border-b">
                  <Link
                    href={`/sheet/${character.id}`}
                    className="press focus-visible:outline-ink flex min-h-[64px] items-center py-4 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span className="font-display text-ink flex-1 text-[1.25rem] leading-none tracking-wide">
                      {character.name || "Unnamed"}
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
