import { desc, eq, inArray } from "drizzle-orm"
import Link from "next/link"
import { auth, signIn, signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import { db } from "@/db"
import { characters, seasons } from "@/db/schema"
import { getSkin } from "@/data/skins"
import { NewSeasonForm } from "./new-season-form"

function SignedOut() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-20 sm:px-8">
      <p className="text-ink-faint font-sans text-[0.7rem] tracking-[0.22em] uppercase">
        Powered by the Apocalypse
      </p>
      <h1 className="font-display text-ink mt-3 text-[3rem] leading-[0.92] tracking-tight sm:text-7xl">
        PbtA Sheets
      </h1>
      <p className="text-ink-soft mt-5 max-w-prose font-sans text-[1.05rem] leading-relaxed italic">
        Character sheets you can actually play from — the whole sheet on a phone,
        so nobody has to pass the book around the table.
      </p>
      <hr className="sheet-rule my-8" />
      <form
        action={async () => {
          "use server"
          await signIn("google", { redirectTo: "/" })
        }}
      >
        <Button type="submit" className="min-h-12 px-7">
          Sign in with Google
        </Button>
      </form>
      <p className="text-ink-faint mt-5 font-sans text-[0.82rem]">
        Currently Monsterhearts 2. Ten skins, all of them trouble.
      </p>
    </main>
  )
}

export default async function HomePage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return <SignedOut />

  const myCharacters = await db
    .select()
    .from(characters)
    .where(eq(characters.ownerId, userId))
    .orderBy(desc(characters.updatedAt))

  const mySeasons = await db
    .select()
    .from(seasons)
    .where(eq(seasons.createdById, userId))
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
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-10 pb-20 sm:px-8">
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-ink-faint font-sans text-[0.7rem] tracking-[0.22em] uppercase">
            Monsterhearts 2
          </p>
          <h1 className="font-display text-ink mt-2 text-[2.5rem] leading-[0.95] tracking-tight sm:text-5xl">
            Your Table
          </h1>
        </div>
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/" })
          }}
        >
          <button
            type="submit"
            className="text-ink-faint hover:text-ink font-sans text-[0.78rem] tracking-[0.14em] uppercase transition-colors"
          >
            Sign out
          </button>
        </form>
      </header>

      <section className="mt-10">
        <h2 className="sheet-heading">Characters</h2>

        {myCharacters.length === 0 ? (
          <p className="text-ink-soft mt-4 font-sans text-[0.95rem] italic">
            No characters yet. Pick a skin and find out what kind of monster
            you are.
          </p>
        ) : (
          <ul className="border-rule mt-4 border-t">
            {myCharacters.map((character) => {
              const skin = getSkin(character.skinId)
              return (
                <li key={character.id} className="border-rule border-b">
                  <Link
                    href={`/sheet/${character.id}`}
                    className="press group focus-visible:outline-ink flex min-h-[68px] items-center gap-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="font-display text-ink block text-[1.35rem] leading-none tracking-wide">
                        {character.name || "Unnamed"}
                      </span>
                      <span className="text-ink-soft mt-1.5 block font-sans text-[0.9rem] italic">
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
          className="border-ink text-ink hover:bg-ink hover:text-paper focus-visible:outline-ink mt-5 inline-flex min-h-12 items-center border px-6 font-sans text-[0.9rem] tracking-[0.1em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          New character
        </Link>
      </section>

      <section className="mt-14">
        <h2 className="sheet-heading">Seasons</h2>
        <p className="text-ink-faint mt-2 font-sans text-[0.82rem] leading-relaxed">
          A season is your group. Share its code and everyone&rsquo;s Strings
          can point at real characters instead of typed names.
        </p>

        {mySeasons.length === 0 ? (
          <p className="text-ink-soft mt-4 font-sans text-[0.95rem] italic">
            No seasons yet.
          </p>
        ) : (
          <ul className="border-rule mt-4 border-t">
            {mySeasons.map((season) => {
              const count = rosterCount.get(season.id) ?? 0
              return (
                <li key={season.id} className="border-rule border-b">
                  <Link
                    href={`/seasons/${season.id}`}
                    className="press group focus-visible:outline-ink flex min-h-[68px] items-center gap-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="font-display text-ink block text-[1.35rem] leading-none tracking-wide">
                        {season.name || "Untitled season"}
                      </span>
                      <span className="text-ink-soft mt-1.5 block font-sans text-[0.9rem]">
                        <span className="font-mono tracking-[0.2em]">
                          {season.joinCode}
                        </span>
                        <span className="text-ink-faint">
                          {" · "}
                          {count === 1
                            ? "1 character"
                            : `${String(count)} characters`}
                        </span>
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="text-ink-faint group-hover:text-ink shrink-0 font-sans text-[0.78rem] tracking-[0.14em] uppercase transition-colors"
                    >
                      Edit
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        <NewSeasonForm />
      </section>
    </main>
  )
}
