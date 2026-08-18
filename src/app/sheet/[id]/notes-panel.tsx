"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { setNotes } from "../actions"

/**
 * Notes save on a pause rather than on every keystroke — the write-through
 * that suits a tick-box doesn't suit a paragraph. Also flushes on blur, so
 * switching screens mid-sentence doesn't lose the tail of it.
 */
export function NotesPanel({
  characterId,
  editable,
  value,
}: {
  characterId: string
  editable: boolean
  value: string
}) {
  const t = useTranslations()
  const [text, setText] = useState(value)
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")
  const saved = useRef(value)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function flush(next: string) {
    if (next === saved.current) return
    saved.current = next
    setStatus("saving")
    void setNotes(characterId, next).then(() => {
      setStatus("saved")
    })
  }

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  if (!editable) {
    return (
      <section className="mt-8">
        <h2 className="sheet-heading">{t("terms.notes")}</h2>
        {value.trim().length > 0 ? (
          <p className="text-ink-soft mt-4 font-sans text-[1.102rem] leading-relaxed whitespace-pre-wrap">
            {value}
          </p>
        ) : (
          <p className="text-ink-faint mt-4 font-sans text-[1.102rem] italic">
            {t("sheet.notesEmpty")}
          </p>
        )}
      </section>
    )
  }

  return (
    <section className="mt-8">
      <h2 className="sheet-heading">{t("terms.notes")}</h2>
      <textarea
        value={text}
        onChange={(e) => {
          const next = e.target.value
          setText(next)
          setStatus("idle")
          if (timer.current) clearTimeout(timer.current)
          timer.current = setTimeout(() => {
            flush(next)
          }, 900)
        }}
        onBlur={() => {
          if (timer.current) clearTimeout(timer.current)
          flush(text)
        }}
        maxLength={5000}
        placeholder={t("sheet.notesPlaceholder")}
        /* Notes own the whole pane now, so the field fills it rather than
           sitting in a fixed box with dead space underneath. */
        className="border-rule focus:border-ink text-ink placeholder:text-ink-faint mt-4 min-h-[55dvh] w-full resize-y border bg-transparent p-3 font-sans text-[1.102rem] leading-relaxed transition-colors outline-none placeholder:italic"
      />
      <p className="text-ink-faint h-5 font-sans text-[0.928rem]">
        {status === "saving" ? t("common.saving") : status === "saved" ? t("common.saved") : ""}
      </p>
    </section>
  )
}
