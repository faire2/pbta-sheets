import { getLocale, getTranslations } from "next-intl/server"
import type { Locale } from "@/i18n/config"
import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { getSkin, skins } from "@/data/skins"
import { localizeSkin } from "@/data/skins/localize"
import { Creator } from "./creator"
import { PageBar } from "@/components/page-bar"

export function generateStaticParams() {
  return skins.map((skin) => ({ skinId: skin.id }))
}

export default async function CreateCharacterPage({
  params,
}: PageProps<"/characters/new/monsterhearts/[skinId]">) {
  const { skinId } = await params
  const raw = getSkin(skinId)
  if (!raw) notFound()

  const locale = await getLocale()
  const skin = localizeSkin(raw, locale as Locale)

  const session = await auth()
  const t = await getTranslations()

  return (
    <>
      <PageBar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-8 pb-24 sm:px-8">
        <Link
          href="/characters/new/monsterhearts"
          className="text-ink-faint hover:text-ink font-sans text-[0.928rem] tracking-[0.14em] uppercase transition-colors"
        >
          ← {t("common.backToSkins")}
        </Link>

        <header className="mt-5 mb-8">
          <h1 className="font-display text-ink text-[2.5rem] leading-[0.95] tracking-tight sm:text-5xl">
            {skin.name}
          </h1>
          <p className="text-ink-soft mt-3 font-sans text-[1.218rem] leading-snug italic">
            {skin.tagline}
          </p>
        </header>

        {session?.user ? (
          <Creator skin={skin} />
        ) : (
          <div className="border-rule border-t border-b py-10 text-center">
            <p className="text-ink-soft font-sans text-[1.102rem]">{t("creator.signInPrompt")}</p>
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
                {t("common.signInWithGoogle")}
              </Button>
            </form>
          </div>
        )}
      </main>
    </>
  )
}
