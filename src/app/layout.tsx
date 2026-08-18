import type { Metadata, Viewport } from "next"
import { Source_Serif_4, Grenze_Gotisch, Geist_Mono } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getTranslations } from "next-intl/server"
import { Providers } from "@/components/providers"
import "./globals.css"

/*
 * Grenze Gotisch carries the display voice — names, headings, stat numbers.
 *
 * Body text is Source Serif 4, NOT Grenze. Grenze is the Gotisch's designed
 * companion and pairs beautifully with it, but its small x-height and narrow
 * counters make paragraph text hard work at phone sizes — the one thing this
 * app cannot afford. Source Serif 4 is drawn for screen reading: tall
 * x-height, open apertures, true italics. Gothic display over a reading serif
 * is the usual pairing for game books regardless.
 *
 * `latin-ext` is REQUIRED on every face — Czech diacritics (ě š č ř ž ů) fall
 * back to another font without it, and mixed glyphs look broken. See ROADMAP.
 */
const display = Grenze_Gotisch({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  display: "swap",
})

const body = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "swap",
})

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
})

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta")
  return { title: t("appTitle"), description: t("appDescription") }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The paper ground, so the browser chrome and overscroll match the page.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2eee6" },
    { media: "(prefers-color-scheme: dark)", color: "#17140f" },
  ],
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale()

  return (
    <html
      lang={locale}
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
