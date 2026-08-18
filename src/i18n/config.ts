export const locales = ["en", "cs"] as const

export type Locale = (typeof locales)[number]

/** EN is the source language; CS is the translation. See docs/GLOSSARY.md. */
export const defaultLocale: Locale = "en"

/**
 * Locale lives in a cookie rather than a URL prefix.
 *
 * Sheets are shared by link (`/sheet/<uuid>`) and read at a table. A prefix
 * would mean every shared link carries the sharer's language and every route
 * moves under `[locale]/` — cost with no benefit for an app nobody indexes.
 */
export const LOCALE_COOKIE = "locale"

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && locales.includes(value as Locale)
}
