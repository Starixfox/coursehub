import type { Metadata } from "next";
import {
  Geist_Mono,
  Instrument_Serif,
  Schibsted_Grotesk,
} from "next/font/google";

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
  metadataBase: new URL("https://starixfox.github.io/loopwork-concept"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${mkDisplay.variable} ${mkSerif.variable}`}
    >
      <body style={{ margin: 0, minHeight: "100vh" }}>{children}</body>
    </html>
  );
}
