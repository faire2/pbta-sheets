import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"
import { LOCALE_COOKIE, defaultLocale, isLocale } from "./config"

type Messages = Record<string, unknown>

/**
 * Resolves the request's locale from the cookie. next-intl requires this as a
 * default export — see the eslint override for `src/i18n/request.ts`.
 */
export default getRequestConfig(async () => {
  const store = await cookies()
  const cookieLocale = store.get(LOCALE_COOKIE)?.value
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale

  // A template-literal import is `any`; assert the shape rather than leaking it.
  const imported = (await import(`../../messages/${locale}.json`)) as {
    default: Messages
  }

  return { locale, messages: imported.default }
})
