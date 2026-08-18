"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef, useState, useTransition } from "react"
import { createSeason } from "./seasons/actions"

export function NewSeasonForm() {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus on reveal, not on page load — the field only exists after an
  // explicit click, so this doesn't steal focus from anyone.
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function submit() {
    if (name.trim().length === 0) return
    setError(null)
    startTransition(() => {
      void createSeason(name).then((result) => {
        if (result?.error) setError(result.error)
      })
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true)
        }}
        className="border-ink text-ink hover:bg-ink hover:text-paper focus-visible:outline-ink mt-5 inline-flex min-h-12 items-center border px-6 font-sans text-[1.044rem] tracking-[0.1em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {t("home.newSeason")}
      </button>
    )
  }

  return (
    <div className="border-rule mt-5 border-t pt-5">
      <label className="block">
        <span className="text-ink-faint font-sans text-[1.03rem] tracking-[0.16em] uppercase">
          {t("home.seasonNameLabel")}
        </span>
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit()
            if (e.key === "Escape") setOpen(false)
          }}
          placeholder={t("home.seasonNamePlaceholder")}
          className="border-rule focus:border-ink font-display text-ink placeholder:text-ink-faint mt-1.5 min-h-11 w-full border-0 border-b bg-transparent pb-1 text-2xl tracking-wide transition-colors outline-none placeholder:font-sans placeholder:text-base placeholder:tracking-normal placeholder:italic"
        />
      </label>

      {error ? <p className="text-oxblood mt-3 font-sans text-[1.044rem]">{error}</p> : null}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          disabled={pending || name.trim().length === 0}
          onClick={submit}
          className="bg-ink text-paper focus-visible:outline-ink min-h-12 px-6 font-sans text-[1.044rem] tracking-[0.1em] uppercase transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-30"
        >
          {pending ? t("common.creating") : t("common.create")}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setError(null)
          }}
          className="text-ink-faint hover:text-ink min-h-12 font-sans text-[0.986rem] tracking-[0.1em] uppercase transition-colors"
        >
          {t("common.cancel")}
        </button>
      </div>
    </div>
  )
}
