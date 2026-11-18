import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { CareerChat } from "@/components/career-chat";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// Subsetted variable WOFF2 files; regenerate with scripts/prepare-assets.py.
const sans = localFont({
  src: "../fonts/manrope.woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "200 800",
});
const display = localFont({
  src: "../fonts/space-grotesk.woff2",
  variable: "--font-display",
  display: "swap",
  weight: "300 700",
});

const description =
  "Alec Dewell is Head of Product and AI Transformation Lead at Oliver James, based in Manchester. Read about his work and career history.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Alec Dewell | Head of Product", template: "%s | Alec Dewell" },
  description,
  applicationName: "Alec Dewell",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Alec Dewell | Head of Product",
    description: "Head of Product and AI Transformation Lead at Oliver James, based in Manchester.",
    type: "website",
    locale: "en_GB",
    url: "/",
    siteName: "Alec Dewell",
  },
  twitter: { card: "summary_large_image" },
};

// The design is dark-only, so native controls and scrollbars should be too.
export const viewport: Viewport = { themeColor: "#171917", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={`${sans.variable} ${display.variable}`}>
      <body>
        {children}
        <CareerChat />
      </body>
    </html>
  );
}
