import { getTranslations } from "next-intl/server"
import type { Locale } from "@/i18n/config"
import { localizeBasicMoves, localizeRulesEntries } from "@/data/localize-rules"

/**
 * The Player Sheet's shared half: the six basic moves every character can
 * make, and the rules boxes that aren't moves. Static reference — nothing
 * here is per-character, so it stays a server component.
 */
export async function BasicsSection({ locale }: { locale: Locale }) {
  const t = await getTranslations()
  const moves = localizeBasicMoves(locale)
  const rules = localizeRulesEntries(locale)

  return (
    <>
      <section className="mt-8">
        <h2 className="sheet-heading">{t("terms.basicMoves")}</h2>
        <ul className="border-rule mt-4 border-t">
          {moves.map((move) => (
            <li key={move.id} className="border-rule border-b py-4">
              <h3 className="font-display text-ink flex items-baseline gap-2 text-[1.392rem] leading-tight tracking-wide">
                {move.name}
                <span className="text-ink-faint font-sans text-[0.871rem] tracking-[0.18em] uppercase">
                  {t(`terms.${move.stat}`)}
                </span>
              </h3>
              <p className="text-ink-soft mt-1.5 font-sans text-[1.079rem] leading-snug italic">
                {move.trigger}
              </p>
              <dl className="mt-2.5 space-y-1.5">
                <div className="flex gap-2.5">
                  <dt className="text-ink-faint w-9 shrink-0 pt-0.5 font-sans text-[0.924rem] tracking-[0.1em] tabular-nums">
                    {t("sheet.strongHit")}
                  </dt>
                  <dd className="text-ink flex-1 font-sans text-[1.079rem] leading-snug">
                    {move.strongHit}
                  </dd>
                </div>
                <div className="flex gap-2.5">
                  <dt className="text-ink-faint w-9 shrink-0 pt-0.5 font-sans text-[0.924rem] tracking-[0.1em] tabular-nums">
                    {t("sheet.weakHit")}
                  </dt>
                  <dd className="text-ink flex-1 font-sans text-[1.079rem] leading-snug">
                    {move.weakHit}
                  </dd>
                </div>
              </dl>
              {move.options.length > 0 ? (
                <ul className="border-rule mt-2.5 space-y-1 border-l pl-3">
                  {move.options.map((option) => (
                    <li
                      key={option}
                      className="text-ink-soft font-sans text-[1.044rem] leading-snug"
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="sheet-heading">{t("terms.rules")}</h2>
        <ul className="border-rule mt-4 border-t">
          {rules.map((entry) => (
            <li key={entry.id} className="border-rule border-b py-4">
              <h3 className="font-display text-ink text-[1.334rem] leading-tight tracking-wide">
                {entry.name}
              </h3>
              <p className="text-ink-soft mt-1.5 font-sans text-[1.079rem] leading-snug">
                {entry.summary}
              </p>
              {entry.options.length > 0 ? (
                <ul className="border-rule mt-2 space-y-1 border-l pl-3">
                  {entry.options.map((option) => (
                    <li
                      key={option}
                      className="text-ink-soft font-sans text-[1.044rem] leading-snug"
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
