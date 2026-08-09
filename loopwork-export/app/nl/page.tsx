import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { SetHtmlLang } from "@/components/marketing/set-html-lang";
import { NL } from "@/components/marketing/copy";

export const metadata: Metadata = {
  title: { absolute: "Loopwork · AI-gedreven workflowautomatisering" },
  description:
    "Wij ontwerpen en implementeren AI-workflows die repetitieve bedrijfsprocessen voor je afhandelen: van leadbeheer en communicatie tot administratie en operations.",
  alternates: {
    canonical: "/nl/",
    languages: { en: "/", nl: "/nl/" },
  },
};

export default function DutchHomePage() {
  return (
    <>
      <SetHtmlLang lang="nl" />
      <MarketingPage copy={NL} />
    </>
  );
}
