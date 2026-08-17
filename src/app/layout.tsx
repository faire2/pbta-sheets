import type { Metadata, Viewport } from "next";
import { Grenze, Grenze_Gotisch, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "PbtA Sheets",
  description: "Character sheets for Powered-by-the-Apocalypse games",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The paper ground, so the browser chrome and overscroll match the page.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2eee6" },
    { media: "(prefers-color-scheme: dark)", color: "#17140f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
