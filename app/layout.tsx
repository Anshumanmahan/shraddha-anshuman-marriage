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

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  applicationName: "Anshuman & Shraddha",
  authors: [{ name: "Anshuman & Shraddha" }],
  keywords: [
    "Anshuman",
    "Shraddha",
    "wedding invitation",
    "November 2026",
    "Agra",
  ],
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: "Anshuman & Shraddha",
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
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
