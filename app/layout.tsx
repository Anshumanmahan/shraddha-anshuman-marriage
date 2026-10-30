import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Jost,
  Marcellus,
  Tiro_Devanagari_Hindi,
} from "next/font/google";
import { weddingConfig } from "@/wedding.config";
import "./globals.css";

/* Self-hosted, preloaded, size-adjusted fallbacks — no layout shift. */

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marcellus",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

const tiro = Tiro_Devanagari_Hindi({
  subsets: ["devanagari", "latin"],
  weight: "400",
  variable: "--font-tiro",
  display: "swap",
});

const { site } = weddingConfig;

/* ------------------------------------------------------------------ */
/* Link preview (WhatsApp, iMessage, Telegram, X…)                     */
/*                                                                     */
/* A static, designed invitation card rather than a generated one:     */
/* WhatsApp is strict — it wants an absolute https image, ideally      */
/* under 300 KB, at 1.91:1 — and a fixed JPEG meets all three every    */
/* time. Source: scripts/og-invitation/card.html.                      */
/*                                                                     */
/* Bump `v` whenever the image changes: WhatsApp caches images by URL. */
/* ------------------------------------------------------------------ */

const OG_IMAGE_PATH = "/og/shraddha-anshuman-wedding-invitation.jpg?v=3";

const SHARE_TITLE = "Shraddha & Anshuman | Wedding Invitation 💍";
const SHARE_DESCRIPTION =
  "With love and joy, we invite you to celebrate the beginning of our forever. Join us for our wedding celebrations!";
const SHARE_IMAGE_ALT =
  "Wedding invitation of Shraddha & Anshuman — 20 & 21 November 2026, Hotel Grand Mercure, Agra";

const ogImageUrl = new URL(OG_IMAGE_PATH, site.url).toString();

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  applicationName: "Shraddha & Anshuman",
  authors: [{ name: "Shraddha & Anshuman" }],
  keywords: [
    "Shraddha",
    "Anshuman",
    "wedding invitation",
    "November 2026",
    "Agra",
  ],
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: "Shraddha & Anshuman",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: [
      {
        url: ogImageUrl,
        secureUrl: ogImageUrl,
        type: "image/jpeg",
        width: 1200,
        height: 630,
        alt: SHARE_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: [{ url: ogImageUrl, alt: SHARE_IMAGE_ALT }],
  },
  robots: {
    // A private family invitation — discoverable by link, not by search.
    index: false,
    follow: false,
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#55172a",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-IN"
      className={`${cormorant.variable} ${marcellus.variable} ${jost.variable} ${tiro.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
