import type { Metadata, Viewport } from "next";
import { Grenze, Grenze_Gotisch, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { LocaleSwitch } from "@/components/locale-switch";
import { Providers } from "@/components/providers";
import "./globals.css";

/*
 * Grenze Gotisch (display) and Grenze (body) are a designed pair from one
 * foundry: gothic character without blackletter's unreadability, which suits a
 * sheet that has to be legible at a dim table.
 *
 * `latin-ext` is REQUIRED on every face — Czech diacritics (ě š č ř ž ů) fall
 * back to another font without it, and mixed glyphs look broken. See ROADMAP.
 */
const display = Grenze_Gotisch({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const body = Grenze({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("appTitle"), description: t("appDescription") };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The paper ground, so the browser chrome and overscroll match the page.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2eee6" },
    { media: "(prefers-color-scheme: dark)", color: "#17140f" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <Providers>
            {/* Top-right on every page, in the flow rather than fixed — a
                floating widget over a sheet reads as browser chrome. */}
            <div className="mx-auto flex w-full max-w-2xl justify-end px-5 pt-4 sm:px-8">
              <LocaleSwitch />
            </div>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
