import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { EN } from "@/components/marketing/copy";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: { en: "/", nl: "/nl/" },
  },
};

export default function HomePage() {
  return <MarketingPage copy={EN} />;
}
