"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import {
  createSeasonForCharacter,
  joinSeasonByCode,
  leaveSeason,
} from "../actions"

export interface RosterEntry {
  id: string
  name: string
  skinName: string
  isSelf: boolean
}

export function SeasonPanel({
  characterId,
  editable,
  season,
  roster,
}: {
  characterId: string
  editable: boolean
  season: { id: string; name: string; joinCode: string } | null
  roster: RosterEntry[]
}) {
  const [mode, setMode] = useState<"idle" | "join" | "create">("idle")
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function run(fn: () => Promise<{ error: string } | undefined>) {
    setError(null)
    startTransition(() => {
      void fn().then((result) => {
        if (result?.error) setError(result.error)
        else setMode("idle")
      })
    })
  }

  // ── In a season: show the other characters at the table. ──────────────
  if (season) {
    return (
      <section className="mt-10">
        <h2 className="sheet-heading">Season</h2>
        <p className="text-ink-soft mt-3 font-sans text-[0.95rem]">
          {season.name}
          <span className="text-ink-faint">
            {" · "}
            <span className="font-mono tracking-[0.18em]">
              {season.joinCode}
            </span>
          </span>
        </p>

        <ul className="border-rule mt-4 border-t">
          {roster.map((entry) => (
            <li key={entry.id} className="border-rule border-b">
              <Link
                href={`/sheet/${entry.id}`}
                className="press focus-visible:outline-ink flex min-h-[60px] items-center gap-3 py-3.5 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span className="font-display text-ink flex-1 text-[1.2rem] leading-none tracking-wide">
                  {entry.name || "Unnamed"}
                  {entry.isSelf ? (
                    <span className="text-ink-faint ml-2 font-sans text-[0.66rem] tracking-[0.18em] uppercase">
                      You
                    </span>
                  ) : null}
                </span>
                <span className="text-ink-soft font-sans text-[0.88rem] italic">
                  {entry.skinName}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {roster.length <= 1 ? (
          <p className="text-ink-faint mt-3 font-sans text-[0.82rem]">
            Nobody else has joined yet. Share the code.
          </p>
        ) : null}

        {editable ? (
          <>
            {error ? (
              <p className="text-oxblood mt-4 font-sans text-[0.9rem]">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                run(() => leaveSeason(characterId))
              }}
              className="text-ink-faint hover:text-oxblood mt-4 min-h-11 font-sans text-[0.78rem] tracking-[0.14em] uppercase transition-colors disabled:opacity-40"
            >
              {pending ? "Leaving…" : "Leave season"}
            </button>
          </>
        ) : null}
      </section>
    )
  }

  // ── Not in a season. Only the owner can do anything about that. ───────
  if (!editable) return null

  return (
    <section className="mt-10">
      <h2 className="sheet-heading">Season</h2>
      <p className="text-ink-soft mt-3 font-sans text-[0.95rem] leading-relaxed">
        This character isn&rsquo;t at a table yet. Join your group&rsquo;s
        season and their characters show up here — so Strings can point at real
        people instead of names you typed.
      </p>

      {error ? (
        <p className="text-oxblood mt-4 font-sans text-[0.9rem]">{error}</p>
      ) : null}

      {mode === "idle" ? (
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setMode("join")
            }}
            className="border-ink text-ink hover:bg-ink hover:text-paper focus-visible:outline-ink inline-flex min-h-12 items-center border px-6 font-sans text-[0.9rem] tracking-[0.1em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Join with a code
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("create")
            }}
            className="text-ink-faint hover:text-ink inline-flex min-h-12 items-center font-sans text-[0.9rem] tracking-[0.1em] uppercase transition-colors"
          >
            Or start one
          </button>
        </div>
      ) : null}

      {mode === "join" ? (
        <div className="border-rule mt-5 border-t pt-5">
          <label className="block">
            <span className="text-ink-faint font-sans text-[0.78rem] tracking-[0.16em] uppercase">
              Join code
            </span>
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase())
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  run(() => joinSeasonByCode(characterId, code))
                }
              }}
              placeholder="ABC234"
              maxLength={8}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="border-rule focus:border-ink text-ink placeholder:text-ink-faint mt-1.5 min-h-12 w-full border-0 border-b bg-transparent pb-1 font-mono text-[1.6rem] tracking-[0.3em] transition-colors outline-none"
            />
          </label>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              disabled={pending || code.trim().length === 0}
              onClick={() => {
                run(() => joinSeasonByCode(characterId, code))
              }}
              className="bg-ink text-paper min-h-12 px-6 font-sans text-[0.9rem] tracking-[0.1em] uppercase transition-opacity disabled:opacity-30"
            >
              {pending ? "Joining…" : "Join"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("idle")
                setError(null)
              }}
              className="text-ink-faint hover:text-ink min-h-12 font-sans text-[0.85rem] tracking-[0.1em] uppercase transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {mode === "create" ? (
        <div className="border-rule mt-5 border-t pt-5">
          <label className="block">
            <span className="text-ink-faint font-sans text-[0.78rem] tracking-[0.16em] uppercase">
              Season name
            </span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  run(() => createSeasonForCharacter(characterId, name))
                }
              }}
              placeholder="Season One"
              className="border-rule focus:border-ink font-display text-ink placeholder:text-ink-faint mt-1.5 min-h-12 w-full border-0 border-b bg-transparent pb-1 text-2xl tracking-wide transition-colors outline-none placeholder:font-sans placeholder:text-base placeholder:tracking-normal placeholder:italic"
            />
          </label>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              disabled={pending || name.trim().length === 0}
              onClick={() => {
                run(() => createSeasonForCharacter(characterId, name))
              }}
              className="bg-ink text-paper min-h-12 px-6 font-sans text-[0.9rem] tracking-[0.1em] uppercase transition-opacity disabled:opacity-30"
            >
              {pending ? "Creating…" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("idle")
                setError(null)
              }}
              className="text-ink-faint hover:text-ink min-h-12 font-sans text-[0.85rem] tracking-[0.1em] uppercase transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
