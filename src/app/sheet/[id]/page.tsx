import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { db } from "@/db"
import { characters } from "@/db/schema"
import { getSkin } from "@/data/skins"
import { sheetSchema, MAX_HARM, XP_PER_ADVANCE } from "@/types/sheet"

const STAT_ORDER = [
  ["hot", "Hot"],
  ["cold", "Cold"],
  ["volatile", "Volatile"],
  ["dark", "Dark"],
] as const

function signed(n: number): string {
  return n > 0 ? `+${String(n)}` : String(n)
}

/** The sheet's harm track: four chevrons, filled left to right. */
function HarmTrack({ value }: { value: number }) {
  return (
    <div className="flex items-end gap-1.5" aria-label={`Harm ${String(value)} of ${String(MAX_HARM)}`}>
      {Array.from({ length: MAX_HARM }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 22"
          className="h-6 w-6"
          aria-hidden
          role="presentation"
        >
          <path
            d="M1 1 H23 L12 21 Z"
            className={i < value ? "fill-oxblood stroke-oxblood" : "fill-none stroke-ink"}
            strokeWidth="1.25"
          />
        </svg>
      ))}
    </div>
  )
}

function XpTrack({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Experience ${String(value)} of ${String(XP_PER_ADVANCE)}`}>
      {Array.from({ length: XP_PER_ADVANCE }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={`h-[13px] w-[13px] rounded-full border ${
            i < value ? "border-ink bg-ink" : "border-ink-faint"
          }`}
        />
      ))}
    </div>
  )
}

export default async function SheetPage({ params }: PageProps<"/sheet/[id]">) {
  const { id } = await params

  const [row] = await db
    .select()
    .from(characters)
    .where(eq(characters.id, id))
    .limit(1)

  if (!row) notFound()

  const skin = getSkin(row.skinId)
  if (!skin) notFound()

  const parsed = sheetSchema.safeParse(row.sheet)
  const sheet = parsed.success ? parsed.data : sheetSchema.parse({ identity: {} })

  const line = skin.statLines[sheet.statLineIndex] ?? skin.statLines[0]
  const moves = skin.moves.filter((m) => sheet.moveIds.includes(m.id))
  const granted = new Set(skin.startingMoveIds)

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-10 pb-20 sm:px-8">
      <header>
        <p className="text-ink-faint font-sans text-[0.7rem] tracking-[0.22em] uppercase">
          {skin.name}
        </p>
        <h1 className="font-display text-ink mt-2 text-[2.75rem] leading-[0.95] tracking-tight sm:text-6xl">
          {row.name || "Unnamed"}
        </h1>
        <p className="text-ink-soft mt-2 font-sans text-[0.95rem] italic">
          {[sheet.identity.look, sheet.identity.eyes, sheet.identity.origin]
            .filter(Boolean)
            .join(" · ") || skin.tagline}
        </p>
      </header>

      {line ? (
        <section className="border-rule mt-8 grid grid-cols-4 gap-2 border-t border-b py-4">
          {STAT_ORDER.map(([key, label]) => (
            <div key={key}>
              <span className="font-display text-ink block text-[1.15rem] leading-none">
                {label}
              </span>
              <span className="text-ink-soft mt-1.5 block font-sans text-[1.3rem] leading-none tabular-nums">
                {signed(line[key] + sheet.statBonuses[key])}
              </span>
            </div>
          ))}
        </section>
      ) : null}

      <section className="mt-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="font-display text-ink text-xl tracking-wide">Harm</h2>
          <div className="mt-2">
            <HarmTrack value={sheet.harm} />
          </div>
        </div>
        <div>
          <h2 className="font-display text-ink text-xl tracking-wide">
            Experience
          </h2>
          <div className="mt-3">
            <XpTrack value={sheet.experience} />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="sheet-heading">Moves</h2>
        <ul className="border-rule mt-4 border-t">
          {moves.map((move) => (
            <li key={move.id} className="border-rule border-b py-4">
              <h3 className="font-display text-ink flex items-baseline gap-2 text-[1.2rem] leading-tight tracking-wide">
                {move.name}
                {granted.has(move.id) ? (
                  <span className="text-ink-faint font-sans text-[0.66rem] tracking-[0.18em] uppercase">
                    Granted
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
        <h2 className="sheet-heading">Darkest Self</h2>
        <p className="text-ink-soft mt-4 font-sans text-[0.95rem] leading-relaxed">
          {skin.darkestSelf.summary}
        </p>
        <p className="text-ink mt-3 font-sans text-[0.95rem] leading-relaxed">
          <span className="text-ink-faint text-[0.72rem] tracking-[0.18em] uppercase">
            Escape
          </span>
          <br />
          {skin.darkestSelf.escape}
        </p>
      </section>

      <p className="text-ink-faint mt-12 font-sans text-[0.8rem]">
        Read-only for now — editing lands with the full sheet.
      </p>
    </main>
  )
}
