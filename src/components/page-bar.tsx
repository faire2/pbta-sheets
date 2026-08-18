import type { ReactNode } from "react"
import { LocaleSwitch } from "@/components/locale-switch"

/**
 * The top bar: whatever the page wants on the left, the language switch on
 * the right. It lives per-page rather than in the root layout so a page can
 * put its own title on that line instead of spending a row below it.
 */
export function PageBar({ children }: { children?: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-5 pt-4 sm:px-8">
      <div className="min-w-0 flex-1">{children}</div>
      <LocaleSwitch />
    </div>
  )
}
