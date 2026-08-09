import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Schibsted_Grotesk,
  Instrument_Serif,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const mkDisplay = Schibsted_Grotesk({
  variable: "--font-mk-display",
  subsets: ["latin"],
});
const mkSerif = Instrument_Serif({
  variable: "--font-mk-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Loopwork · AI-powered workflow automation",
    template: "%s · Loopwork",
  },
  description:
    "We design and implement AI-powered workflows that handle repetitive business processes for you: from lead management and communication to administration and operations.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${mkDisplay.variable} ${mkSerif.variable} h-full antialiased`}
    >
      {/* suppressHydrationWarning: browser extensions (e.g. unit/currency
          converters) inject attributes onto <body> before React hydrates. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
