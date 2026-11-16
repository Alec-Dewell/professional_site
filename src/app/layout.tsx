import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sans = localFont({ src: "../fonts/manrope.ttf", variable: "--font-sans", display: "swap", weight: "200 800" });
const display = localFont({ src: "../fonts/space-grotesk.ttf", variable: "--font-display", display: "swap", weight: "300 700" });

export const metadata: Metadata = {
  title: { default: "Alec Dewell | Head of Product", template: "%s | Alec Dewell" },
  description: "Alec Dewell is Head of Product and AI Transformation Lead at Oliver James, based in Manchester. Read about his work and career history.",
  applicationName: "Alec Dewell",
  robots: { index: true, follow: true },
  openGraph: { title: "Alec Dewell | Head of Product", description: "Head of Product and AI Transformation Lead at Oliver James, based in Manchester.", type: "website", locale: "en_GB" },
};

export const viewport: Viewport = { themeColor: "#171917", colorScheme: "dark light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-GB" className={`${sans.variable} ${display.variable}`}><body>{children}</body></html>;
}
