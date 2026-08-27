import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const mkDisplay = Space_Grotesk({
  variable: "--font-mk-display",
  subsets: ["latin"],
});
const mkSans = Inter({
  variable: "--font-mk-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Agora · AI-powered workflow automation",
    template: "%s · Agora",
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
      className={`${geistSans.variable} ${geistMono.variable} ${mkDisplay.variable} ${mkSans.variable} h-full antialiased`}
    >
      {/* suppressHydrationWarning: browser extensions (e.g. unit/currency
          converters) inject attributes onto <body> before React hydrates. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
