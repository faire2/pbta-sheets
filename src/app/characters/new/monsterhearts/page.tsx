import Link from "next/link"
import { skins } from "@/data/skins"

export const metadata = {
  title: "Choose a Skin — PbtA Sheets",
}

export default function SkinPickerPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-10 pb-16 sm:px-8">
      <header className="mb-8">
        <p className="text-ink-faint font-sans text-[0.7rem] tracking-[0.22em] uppercase">
          Monsterhearts 2
        </p>
        <h1 className="font-display text-ink mt-2 text-[2.75rem] leading-[0.95] tracking-tight sm:text-6xl">
          Choose a Skin
        </h1>
        <p className="text-ink-soft mt-4 max-w-prose font-sans text-[0.95rem] leading-relaxed italic">
          Every skin is a different way of being a monster, and a different way
          of being a teenager. Pick the one that sounds like trouble.
        </p>
      </header>

      <hr className="sheet-rule" />

      <ul>
        {skins.map((skin, i) => (
          <li key={skin.id}>
            <Link
              href={`/characters/new/monsterhearts/${skin.id}`}
              className="press group focus-visible:outline-ink flex min-h-[76px] items-center gap-4 py-5 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                animation: "skin-in 420ms ease-out both",
                animationDelay: `${String(i * 45)}ms`,
              }}
            >
              {/* The sheet's own selection circle, filling on intent. */}
              <span
                aria-hidden
                className="mark group-hover:border-ink group-hover:bg-ink group-focus-visible:border-ink group-focus-visible:bg-ink"
              />
              <span className="min-w-0 flex-1">
                <span className="font-display text-ink block text-[1.6rem] leading-none tracking-wide">
                  {skin.name}
                </span>
                <span className="text-ink-soft mt-1.5 block font-sans text-[0.95rem] leading-snug italic">
                  {skin.tagline}
                </span>
              </span>
              <span
                aria-hidden
                className="text-ink-faint group-hover:text-ink font-display shrink-0 text-xl transition-[color,transform] duration-150 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
            <hr className="sheet-rule" />
          </li>
        ))}
      </ul>

      <p className="text-ink-faint mt-8 font-sans text-[0.8rem] leading-relaxed">
        Ten core skins. The Chosen and the Serpentine aren&rsquo;t in the free
        reference set — they need the book.
      </p>

      <style>{`
        @keyframes skin-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </main>
  )
}
