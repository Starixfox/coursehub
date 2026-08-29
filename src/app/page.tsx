import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { EN } from "@/components/marketing/copy";

const DESCRIPTION =
  "We design and implement AI-powered workflows that handle repetitive business processes for you: from lead management and communication to administration and operations.";

export const metadata: Metadata = {
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
    languages: { en: "/", nl: "/nl" },
  },
  /* Social cards. Without these the site shares as a bare blue link with the
     URL as its title, which is the single most visible way a site announces
     that nobody finished it. The image is generated at build time by
     opengraph-image.tsx so it never drifts from the brand. */
  openGraph: {
    type: "website",
    locale: "en_GB",
    alternateLocale: ["nl_BE"],
    url: "/",
    siteName: "Agora",
    title: "Agora · AI-powered workflow automation",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Agora · AI-powered workflow automation",
    description: DESCRIPTION,
  },
};

export default function HomePage() {
  return <MarketingPage copy={EN} />;
}
