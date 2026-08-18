"use client"

import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { locales } from "@/i18n/config"
import { setLocale } from "@/i18n/actions"

/**
 * Inline pill, not a floating control — the header has room and a fixed
 * language widget over a sheet reads as browser chrome.
 */
export function LocaleSwitch() {
  const active = useLocale()
  const t = useTranslations("language")
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <div className="border-rule inline-flex border" role="group" aria-label={t("label")}>
      {locales.map((locale) => {
        const isActive = locale === active
        return (
          <button
            key={locale}
            type="button"
            disabled={pending || isActive}
            aria-current={isActive}
            onClick={() => {
              startTransition(() => {
                void setLocale(locale).then(() => {
                  // Re-fetch the tree with the new cookie applied.
                  router.refresh()
                })
              })
            }}
            className={`min-h-9 px-2.5 font-sans text-[0.95rem] tracking-[0.14em] uppercase transition-colors ${
              isActive ? "bg-ink text-paper" : "text-ink-faint hover:text-ink disabled:opacity-50"
            }`}
          >
            {locale}
          </button>
        )
      })}
    </div>
  )
}
