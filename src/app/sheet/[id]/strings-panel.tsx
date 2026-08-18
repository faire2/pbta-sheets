"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { useOptimistic, useState, useTransition } from "react"
import { addString, setStringCount } from "../actions"

/** A String row, already resolved to something displayable by the server. */
export interface StringRow {
  id: string
  count: number
  label: string
  /** Set when the target is a character that still exists. */
  href?: string
  /** The target character's skin, shown as a disambiguator at the table. */
  detail?: string
}

export interface StringCandidate {
  id: string
  name: string
  skinName: string
}

type Patch =
  | { type: "set"; id: string; count: number }
  | { type: "add"; row: StringRow }

function reduce(rows: StringRow[], patch: Patch): StringRow[] {
  if (patch.type === "add") {
    const existing = rows.find((r) => r.label === patch.row.label)
    if (existing) {
      return rows.map((r) =>
        r.id === existing.id ? { ...r, count: r.count + 1 } : r,
      )
    }
    return [...rows, patch.row]
  }
  return rows
    .map((r) => (r.id === patch.id ? { ...r, count: patch.count } : r))
    .filter((r) => r.count > 0)
}

export function StringsPanel({
  characterId,
  editable,
  rows,
  candidates,
}: {
  characterId: string
  editable: boolean
  rows: StringRow[]
  candidates: StringCandidate[]
}) {
  const t = useTranslations()
  const [optimistic, apply] = useOptimistic(rows, reduce)
  const [, startTransition] = useTransition()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)

  function bump(row: StringRow, delta: number) {
    const next = row.count + delta
    setError(null)
    startTransition(() => {
      apply({ type: "set", id: row.id, count: next })
      void setStringCount(characterId, row.id, next).then((result) => {
        if (result?.error) setError(result.error)
      })
    })
  }

  function addCharacter(candidate: StringCandidate) {
    setError(null)
    startTransition(() => {
      apply({
        type: "add",
        row: {
          id: `pending-${candidate.id}`,
          count: 1,
          label: candidate.name,
          detail: candidate.skinName,
        },
      })
      void addString(characterId, {
        kind: "character",
        characterId: candidate.id,
      }).then((result) => {
        if (result?.error) setError(result.error)
      })
    })
  }

  function addName() {
    const trimmed = name.trim()
    if (trimmed.length === 0) return
    setError(null)
    setName("")
    startTransition(() => {
      apply({
        type: "add",
        row: { id: `pending-${trimmed}`, count: 1, label: trimmed },
      })
      void addString(characterId, { kind: "name", name: trimmed }).then(
        (result) => {
          if (result?.error) setError(result.error)
        },
      )
    })
  }

  return (
    <section className="mt-12">
      <h2 className="sheet-heading">{t("terms.strings")}</h2>
      <p className="text-ink-faint mt-2 font-sans text-[0.82rem] leading-relaxed">
        {t("sheet.stringsLede")}
      </p>

      {optimistic.length === 0 ? (
        <p className="text-ink-soft mt-4 font-sans text-[0.95rem] italic">
          {t("sheet.stringsEmpty")}
        </p>
      ) : (
        <ul className="border-rule mt-4 border-t">
          {optimistic.map((row) => (
            <li
              key={row.id}
              className="border-rule flex min-h-[64px] items-center gap-3 border-b py-2.5"
            >
              <span className="min-w-0 flex-1">
                {row.href ? (
                  <Link
                    href={row.href}
                    className="font-display text-ink hover:text-oxblood block truncate text-[1.2rem] leading-none tracking-wide transition-colors"
                  >
                    {row.label}
                  </Link>
                ) : (
                  <span className="font-display text-ink block truncate text-[1.2rem] leading-none tracking-wide">
                    {row.label}
                  </span>
                )}
                {row.detail ? (
                  <span className="text-ink-soft mt-1 block truncate font-sans text-[0.85rem] italic">
                    {row.detail}
                  </span>
                ) : null}
              </span>

              {editable ? (
                <button
                  type="button"
                  onClick={() => {
                    bump(row, -1)
                  }}
                  aria-label={t("sheet.stringDecrease", { name: row.label })}
                  className="border-rule hover:border-ink text-ink focus-visible:outline-ink flex h-11 w-11 shrink-0 items-center justify-center border font-sans text-xl leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95"
                >
                  −
                </button>
              ) : null}

              <span
                className="font-display text-ink w-8 shrink-0 text-center text-[1.6rem] leading-none tabular-nums"
                aria-label={t("sheet.stringCount", {
                  name: row.label,
                  count: row.count,
                })}
              >
                {row.count}
              </span>

              {editable ? (
                <button
                  type="button"
                  onClick={() => {
                    bump(row, 1)
                  }}
                  aria-label={t("sheet.stringIncrease", { name: row.label })}
                  className="border-rule hover:border-ink text-ink focus-visible:outline-ink flex h-11 w-11 shrink-0 items-center justify-center border font-sans text-xl leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95"
                >
                  +
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {error ? (
        <p className="text-oxblood mt-4 font-sans text-[0.9rem]">{error}</p>
      ) : null}

      {editable ? (
        adding ? (
          <div className="border-rule mt-5 border-t pt-5">
            {candidates.length > 0 ? (
              <>
                <p className="text-ink-faint font-sans text-[0.78rem] tracking-[0.16em] uppercase">
                  {t("sheet.stringsFromSeason")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {candidates.map((candidate) => (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => {
                        addCharacter(candidate)
                      }}
                      className="border-rule hover:border-ink hover:bg-ink hover:text-paper text-ink focus-visible:outline-ink inline-flex min-h-11 items-center gap-2 border px-4 font-sans text-[0.9rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {candidate.name}
                      <span className="text-[0.78rem] italic opacity-70">
                        {candidate.skinName}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            <label className="mt-6 block">
              <span className="text-ink-faint font-sans text-[0.78rem] tracking-[0.16em] uppercase">
                {candidates.length > 0
                  ? t("sheet.stringsSomeoneElse")
                  : t("sheet.stringsAnyone")}
              </span>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addName()
                  }
                }}
                placeholder={t("sheet.stringNamePlaceholder")}
                maxLength={60}
                className="border-rule focus:border-ink font-display text-ink placeholder:text-ink-faint mt-1.5 min-h-12 w-full border-0 border-b bg-transparent pb-1 text-2xl tracking-wide transition-colors outline-none placeholder:font-sans placeholder:text-base placeholder:tracking-normal placeholder:italic"
              />
            </label>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                disabled={name.trim().length === 0}
                onClick={addName}
                className="bg-ink text-paper min-h-12 px-6 font-sans text-[0.9rem] tracking-[0.1em] uppercase transition-opacity disabled:opacity-30"
              >
                {t("sheet.addString")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdding(false)
                  setName("")
                  setError(null)
                }}
                className="text-ink-faint hover:text-ink min-h-12 font-sans text-[0.85rem] tracking-[0.1em] uppercase transition-colors"
              >
                {t("common.done")}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setAdding(true)
            }}
            className="border-ink text-ink hover:bg-ink hover:text-paper focus-visible:outline-ink mt-5 inline-flex min-h-12 items-center border px-6 font-sans text-[0.9rem] tracking-[0.1em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t("sheet.addString")}
          </button>
        )
      ) : null}
    </section>
  )
}
