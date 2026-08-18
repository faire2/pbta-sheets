"use client"

import { useTranslations } from "next-intl"
import { useOptimistic, useState, useTransition } from "react"
import { setAdvanceCount } from "../actions"

export interface AdvanceRow {
  id: string
  summary: string
  maxTimes: number
  taken: number
}

/** Same semantics as the paper tracks: tap the Nth box to fill up to N. */
function nextValue(current: number, index: number): number {
  return current === index + 1 ? index : index + 1
}

export function AdvancesPanel({
  characterId,
  editable,
  advances,
  experienceFull,
}: {
  characterId: string
  editable: boolean
  advances: AdvanceRow[]
  experienceFull: boolean
}) {
  const t = useTranslations()
  const [optimistic, apply] = useOptimistic(
    advances,
    (rows: AdvanceRow[], patch: { id: string; taken: number }) =>
      rows.map((r) => (r.id === patch.id ? { ...r, taken: patch.taken } : r)),
  )
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function set(row: AdvanceRow, index: number) {
    const next = nextValue(row.taken, index)
    setError(null)
    startTransition(() => {
      apply({ id: row.id, taken: next })
      void setAdvanceCount(characterId, row.id, next).then((result) => {
        if (result?.error) setError(result.error)
      })
    })
  }

  return (
    <section className="mt-12">
      <h2 className="sheet-heading">{t("terms.advances")}</h2>
      <p className="text-ink-faint mt-2 font-sans text-[0.82rem] leading-relaxed">
        {experienceFull ? t("sheet.advanceReady") : t("sheet.advanceHint")}
      </p>

      {error ? (
        <p className="text-oxblood mt-3 font-sans text-[0.9rem]">{error}</p>
      ) : null}

      <ul className="border-rule mt-4 border-t">
        {optimistic.map((row) => (
          <li
            key={row.id}
            className="border-rule flex items-start gap-3 border-b py-3.5"
          >
            <span className="flex shrink-0 items-center gap-0.5 pt-0.5">
              {Array.from({ length: row.maxTimes }, (_, i) => {
                const filled = i < row.taken
                const box = (
                  <span
                    aria-hidden
                    className={`block h-[15px] w-[15px] border transition-colors ${
                      filled ? "border-ink bg-ink" : "border-ink-faint"
                    }`}
                  />
                )
                return editable ? (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      set(row, i)
                    }}
                    aria-pressed={filled}
                    aria-label={`${row.summary} ${String(i + 1)}`}
                    className="focus-visible:outline-ink flex h-11 w-9 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95"
                  >
                    {box}
                  </button>
                ) : (
                  <span
                    key={i}
                    className="flex h-11 w-9 items-center justify-center"
                  >
                    {box}
                  </span>
                )
              })}
            </span>
            <span className="text-ink flex-1 pt-2.5 font-sans text-[0.95rem] leading-snug">
              {row.summary}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
