"use server"

import { cookies } from "next/headers"
import { LOCALE_COOKIE, type Locale, isLocale } from "./config"

/**
 * Persists the locale choice, and nothing more.
 *
 * The client calls `router.refresh()` afterwards rather than this action
 * calling `revalidatePath("/", "layout")`. Both work; the refresh re-fetches
 * the current tree with the new cookie applied, where the revalidate would
 * invalidate every cached route in the app to change one cookie.
 */
export async function setLocale(locale: Locale): Promise<void> {
  if (!isLocale(locale)) return

  const store = await cookies()
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  })
}
