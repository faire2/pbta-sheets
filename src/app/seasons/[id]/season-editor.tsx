"use client"

import { useState, useTransition } from "react"
import { deleteSeason, renameSeason } from "../actions"

export function SeasonEditor({
  id,
  name: initialName,
  joinCode,
}: {
  id: string
  name: string
  joinCode: string
}) {
  const [name, setName] = useState(initialName)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const dirty = name.trim() !== initialName.trim() && name.trim().length > 0

  function save() {
    if (!dirty) return
    setError(null)
    startTransition(() => {
      void renameSeason(id, name).then((result) => {
        if (result?.error) {
          setError(result.error)
        } else {
          setSaved(true)
          setTimeout(() => {
            setSaved(false)
          }, 1800)
        }
      })
    })
  }

  function remove() {
    setError(null)
    startTransition(() => {
      void deleteSeason(id).then((result) => {
        if (result?.error) setError(result.error)
      })
    })
  }

  return (
    <>
      <header className="mt-5">
        <label className="block">
          <span className="text-ink-faint font-sans text-[0.78rem] tracking-[0.16em] uppercase">
            Season
          </span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") save()
            }}
            onBlur={save}
            className="border-rule focus:border-ink font-display text-ink mt-1.5 min-h-12 w-full border-0 border-b bg-transparent pb-1 text-[2.25rem] leading-tight tracking-tight transition-colors outline-none sm:text-5xl"
          />
        </label>
        <p className="text-ink-faint mt-2 h-5 font-sans text-[0.8rem]">
          {pending ? "Saving…" : saved ? "Saved." : dirty ? "Unsaved" : ""}
        </p>
      </header>

      <section className="mt-8">
        <h2 className="sheet-heading">Join code</h2>
        <p className="text-ink-faint mt-2 font-sans text-[0.82rem] leading-relaxed">
          Read this out at the table. Anyone with it can put a character in this
          season.
        </p>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(joinCode).then(() => {
              setCopied(true)
              setTimeout(() => {
                setCopied(false)
              }, 1600)
            })
          }}
          className="border-rule hover:border-ink focus-visible:outline-ink press mt-4 flex min-h-16 w-full items-center justify-between border px-5 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <span className="text-ink font-mono text-[1.75rem] tracking-[0.32em]">
            {joinCode}
          </span>
          <span className="text-ink-faint font-sans text-[0.75rem] tracking-[0.14em] uppercase">
            {copied ? "Copied" : "Copy"}
          </span>
        </button>
      </section>

      {error ? (
        <p className="text-oxblood mt-6 font-sans text-[0.9rem]">{error}</p>
      ) : null}

      <section className="mt-12">
        <h2 className="sheet-heading">Remove</h2>
        <p className="text-ink-soft mt-3 font-sans text-[0.9rem] leading-relaxed">
          Removing a season does <strong>not</strong> delete anyone&rsquo;s
          character. Sheets survive and simply stop belonging to a season.
        </p>
        {confirming ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={remove}
              className="bg-oxblood text-paper focus-visible:outline-oxblood min-h-12 px-6 font-sans text-[0.9rem] tracking-[0.1em] uppercase transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40"
            >
              {pending ? "Removing…" : "Yes, remove it"}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false)
              }}
              className="text-ink-faint hover:text-ink min-h-12 font-sans text-[0.85rem] tracking-[0.1em] uppercase transition-colors"
            >
              Keep it
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setConfirming(true)
            }}
            className="border-oxblood text-oxblood hover:bg-oxblood hover:text-paper focus-visible:outline-oxblood mt-4 inline-flex min-h-12 items-center border px-6 font-sans text-[0.9rem] tracking-[0.1em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Remove season
          </button>
        )}
      </section>
    </>
  )
}
