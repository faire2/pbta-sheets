import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { getSkin, skins } from "@/data/skins"
import { Creator } from "./creator"

export function generateStaticParams() {
  return skins.map((skin) => ({ skinId: skin.id }))
}

export default async function CreateCharacterPage({
  params,
}: PageProps<"/characters/new/monsterhearts/[skinId]">) {
  const { skinId } = await params
  const skin = getSkin(skinId)
  if (!skin) notFound()

  const session = await auth()

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-8 pb-24 sm:px-8">
      <Link
        href="/characters/new/monsterhearts"
        className="text-ink-faint hover:text-ink font-sans text-[0.8rem] tracking-[0.14em] uppercase transition-colors"
      >
        ← All skins
      </Link>

      <header className="mt-5 mb-8">
        <h1 className="font-display text-ink text-[2.5rem] leading-[0.95] tracking-tight sm:text-5xl">
          {skin.name}
        </h1>
        <p className="text-ink-soft mt-3 font-sans text-[1.05rem] leading-snug italic">
          {skin.tagline}
        </p>
      </header>

      {session?.user ? (
        <Creator skin={skin} />
      ) : (
        <div className="border-rule border-t border-b py-10 text-center">
          <p className="text-ink-soft font-sans text-[0.95rem]">
            Sign in to make a character — sheets are saved to your account so
            they survive between sessions.
          </p>
          <form
            className="mt-5"
            action={async () => {
              "use server"
              await signIn("google", {
                redirectTo: `/characters/new/monsterhearts/${skin.id}`,
              })
            }}
          >
            <Button type="submit" className="min-h-11 px-6">
              Sign in with Google
            </Button>
          </form>
        </div>
      )}
    </main>
  )
}
