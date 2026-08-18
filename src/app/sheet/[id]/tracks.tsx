"use client"

import { useTranslations } from "next-intl"
import { useOptimistic, useTransition } from "react"
import { MAX_HARM, XP_PER_ADVANCE } from "@/types/sheet"
import { setTracks } from "../actions"

/**
 * Track semantics, as on paper: tapping the Nth box fills up to N. Tapping the
 * box that is currently last-filled clears it, so a mis-tap costs one tap to
 * undo rather than a reset.
 */
function nextValue(current: number, index: number): number {
  return current === index + 1 ? index : index + 1
}

export function HarmTrack({
  characterId,
  value,
  editable,
}: {
  characterId: string
  value: number
  editable: boolean
}) {
  const t = useTranslations()
  const [optimistic, setOptimistic] = useOptimistic(value)
  const [, startTransition] = useTransition()

  function set(index: number) {
    const next = nextValue(optimistic, index)
    startTransition(() => {
      setOptimistic(next)
      void setTracks(characterId, { harm: next })
    })
  }

  return (
    <div
      className="flex items-end gap-1"
      role={editable ? "group" : undefined}
      aria-label={`${t("terms.harm")} ${String(optimistic)}/${String(MAX_HARM)}`}
    >
      {Array.from({ length: MAX_HARM }, (_, i) => {
        const filled = i < optimistic
        const chevron = (
          <svg viewBox="0 0 24 22" className="h-7 w-7" aria-hidden>
            <path
              d="M1 1 H23 L12 21 Z"
              className={
                filled
                  ? "fill-oxblood stroke-oxblood"
                  : "fill-none stroke-ink transition-colors"
              }
              strokeWidth="1.25"
            />
          </svg>
        )
        return editable ? (
          <button
            key={i}
            type="button"
            onClick={() => {
              set(i)
            }}
            aria-pressed={filled}
            aria-label={`${t("terms.harm")} ${String(i + 1)}`}
            className="focus-visible:outline-oxblood flex h-11 w-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95"
          >
            {chevron}
          </button>
        ) : (
          <span key={i} className="flex h-11 w-11 items-center justify-center">
            {chevron}
          </span>
        )
      })}
    </div>
  )
}

export function XpTrack({
  characterId,
  value,
  editable,
}: {
  characterId: string
  value: number
  editable: boolean
}) {
  const t = useTranslations()
  const [optimistic, setOptimistic] = useOptimistic(value)
  const [, startTransition] = useTransition()

  function set(index: number) {
    const next = nextValue(optimistic, index)
    startTransition(() => {
      setOptimistic(next)
      void setTracks(characterId, { experience: next })
    })
  }

  const full = optimistic >= XP_PER_ADVANCE

  return (
    <div>
      <div
        className="flex items-center gap-0.5"
        role={editable ? "group" : undefined}
        aria-label={`${t("terms.experience")} ${String(optimistic)}/${String(XP_PER_ADVANCE)}`}
      >
        {Array.from({ length: XP_PER_ADVANCE }, (_, i) => {
          const filled = i < optimistic
          const dot = (
            <span
              aria-hidden
              className={`block h-[15px] w-[15px] rounded-full border transition-colors ${
                filled ? "border-ink bg-ink" : "border-ink-faint"
              }`}
            />
          )
          return editable ? (
            <button
              key={i}
              type="button"
              onClick={() => {
                set(i)
              }}
              aria-pressed={filled}
              aria-label={`${t("terms.experience")} ${String(i + 1)}`}
              className="focus-visible:outline-ink flex h-11 w-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95"
            >
              {dot}
            </button>
          ) : (
            <span key={i} className="flex h-11 w-11 items-center justify-center">
              {dot}
            </span>
          )
        })}
      </div>
      {full ? (
        <p className="text-oxblood -mt-1 font-sans text-[0.8rem] tracking-wide">
          {t("sheet.takeAdvance")}
        </p>
      ) : null}
    </div>
  )
}
