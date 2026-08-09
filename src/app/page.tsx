import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { EN } from "@/components/marketing/copy";

export const metadata: Metadata = {
  description:
    "We design and implement AI-powered workflows that handle repetitive business processes for you: from lead management and communication to administration and operations.",
  alternates: {
    canonical: "/",
    languages: { en: "/", nl: "/nl" },
  },
};

export default function HomePage() {
  return <MarketingPage copy={EN} />;
}
