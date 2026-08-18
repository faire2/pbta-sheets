"use client"

import { useTranslations } from "next-intl"

export const STAT_KEYS = ["hot", "cold", "volatile", "dark"] as const
export type StatKey = (typeof STAT_KEYS)[number]
export type StatValues = Record<StatKey, number>

export const MIN_BONUS = -3
export const MAX_BONUS = 3

export function signed(n: number): string {
  return n > 0 ? `+${String(n)}` : String(n)
}

/**
 * The sheet's only stat line.
 *
 * Stats are read far more often than they're changed, so the row stays a plain
 * readout. For the owner, tapping a stat turns that one cell into a stepper —
 * editing happens in place, the row keeps its height, and nothing else on the
 * sheet has to repeat the same four numbers.
 */
export function StatStrip({
  values,
  bonuses,
  editable,
  active,
  onSelect,
  onBump,
}: {
  values: StatValues
  bonuses: StatValues
  editable: boolean
  active: StatKey | null
  onSelect: (stat: StatKey | null) => void
  onBump: (stat: StatKey, delta: number) => void
}) {
  const t = useTranslations()

  return (
    <div className="grid grid-cols-4 gap-x-2">
      {STAT_KEYS.map((key) => {
        const label = t(`terms.${key}`)

        if (editable && active === key) {
          return (
            <div key={key} className="flex items-center justify-center gap-0.5">
              <button
                type="button"
                onClick={() => {
                  onBump(key, -1)
                }}
                disabled={bonuses[key] <= MIN_BONUS}
                aria-label={t("sheet.statDecrease", { stat: label })}
                className="text-ink-faint hover:text-ink flex h-8 w-7 items-center justify-center font-sans text-base leading-none transition-colors disabled:opacity-20"
              >
                −
              </button>
              {/* The value doubles as "done" — no extra control to find. */}
              <button
                type="button"
                onClick={() => {
                  onSelect(null)
                }}
                aria-label={t("sheet.statDone", { stat: label })}
                className="font-display text-ink w-7 text-center text-[1.15rem] leading-none tabular-nums underline decoration-dotted underline-offset-4"
              >
                {signed(values[key])}
              </button>
              <button
                type="button"
                onClick={() => {
                  onBump(key, 1)
                }}
                disabled={bonuses[key] >= MAX_BONUS}
                aria-label={t("sheet.statIncrease", { stat: label })}
                className="text-ink-faint hover:text-ink flex h-8 w-7 items-center justify-center font-sans text-base leading-none transition-colors disabled:opacity-20"
              >
                +
              </button>
            </div>
          )
        }

        const content = (
          <>
            <span className="font-display text-ink-soft text-[0.9rem] leading-none">{label}</span>
            <span className="font-display text-ink text-[1.15rem] leading-none tabular-nums">
              {signed(values[key])}
            </span>
          </>
        )

        return editable ? (
          <button
            key={key}
            type="button"
            onClick={() => {
              onSelect(key)
            }}
            aria-label={t("sheet.statAdjust", { stat: label })}
            className="focus-visible:outline-ink flex h-8 items-baseline justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {content}
          </button>
        ) : (
          <div key={key} className="flex h-8 items-baseline justify-center gap-1.5">
            {content}
          </div>
        )
      })}
    </div>
  )
}
