"use client"

import { useTranslations } from "next-intl"
import { useOptimistic, useState, useTransition } from "react"
import { addCondition, removeCondition } from "../actions"

type Patch = { type: "add"; name: string } | { type: "remove"; name: string }

function reduce(list: string[], patch: Patch): string[] {
  return patch.type === "add" ? [...list, patch.name] : list.filter((c) => c !== patch.name)
}

/**
 * Conditions are free text, not a fixed list — whoever applies one names it
 * ("shaken", "guilty"), and the sheet's job is only to remember it until the
 * bearer acts on it.
 */
export function ConditionsPanel({
  characterId,
  editable,
  conditions,
}: {
  characterId: string
  editable: boolean
  conditions: string[]
}) {
  const t = useTranslations()
  const [optimistic, apply] = useOptimistic(conditions, reduce)
  const [, startTransition] = useTransition()
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)

  function add() {
    const trimmed = name.trim()
    if (trimmed.length === 0) return
    setName("")
    setError(null)
    startTransition(() => {
      apply({ type: "add", name: trimmed })
      void addCondition(characterId, trimmed).then((result) => {
        if (result?.error) setError(result.error)
      })
    })
  }

  function drop(condition: string) {
    setError(null)
    startTransition(() => {
      apply({ type: "remove", name: condition })
      void removeCondition(characterId, condition).then((result) => {
        if (result?.error) setError(result.error)
      })
    })
  }

  return (
    <section className="mt-8">
      <h2 className="font-display text-ink text-xl tracking-wide">{t("terms.conditions")}</h2>

      {optimistic.length === 0 ? (
        <p className="text-ink-faint mt-2 font-sans text-[1.044rem] italic">
          {t("sheet.conditionsEmpty")}
        </p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {optimistic.map((condition) => (
            <li key={condition}>
              {editable ? (
                <button
                  type="button"
                  onClick={() => {
                    drop(condition)
                  }}
                  aria-label={t("sheet.conditionClear", { name: condition })}
                  className="border-oxblood text-oxblood hover:bg-oxblood hover:text-paper focus-visible:outline-oxblood inline-flex min-h-11 items-center gap-2 border px-3.5 font-sans text-[1.067rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {condition}
                  <span aria-hidden className="text-[1.218rem] leading-none">
                    ×
                  </span>
                </button>
              ) : (
                <span className="border-oxblood text-oxblood inline-flex min-h-11 items-center border px-3.5 font-sans text-[1.067rem]">
                  {condition}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {error ? <p className="text-oxblood mt-3 font-sans text-[1.044rem]">{error}</p> : null}

      {editable ? (
        <div className="mt-4 flex items-end gap-3">
          <label className="flex-1">
            <span className="sr-only">{t("sheet.conditionAdd")}</span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  add()
                }
              }}
              placeholder={t("sheet.conditionPlaceholder")}
              maxLength={40}
              className="border-rule focus:border-ink text-ink placeholder:text-ink-faint min-h-11 w-full border-0 border-b bg-transparent pb-1 font-sans text-[1.16rem] transition-colors outline-none placeholder:italic"
            />
          </label>
          <button
            type="button"
            disabled={name.trim().length === 0}
            onClick={add}
            className="border-ink text-ink hover:bg-ink hover:text-paper focus-visible:outline-ink inline-flex min-h-11 shrink-0 items-center border px-4 font-sans text-[0.951rem] tracking-[0.1em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-30"
          >
            {t("sheet.conditionAdd")}
          </button>
        </div>
      ) : null}
    </section>
  )
}
