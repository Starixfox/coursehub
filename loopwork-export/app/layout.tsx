import type { Metadata } from "next";
import {
  Geist_Mono,
  Inter,
  Space_Grotesk,
} from "next/font/google";

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
    default: "Agora · AI Workflow Automation for Belgian SMEs",
    template: "%s · Agora",
  },
  description:
    "Agora is a Belgian AI workflow automation consultancy. We build automated workflows for SMEs in Belgium and the Netherlands — lead intake, email triage, invoicing, CRM sync, and more. Free 30-minute discovery call.",
  metadataBase: new URL("https://agora.midnightspaceconsultancy.com"),
  keywords: [
    "AI workflow automation Belgium",
    "workflow automatisering België",
    "AI automatisering KMO",
    "n8n consultant België",
    "Make.com consultant Belgium",
    "AI consultant Vlaanderen",
    "automatisering kleine bedrijven",
    "AI automation SME Belgium",
    "workflow automation consultant Belgium",
  ],
};

/**
 * Single root layout on purpose. Splitting EN/NL into route-group root layouts
 * would let each ship its own <html lang>, but Next 16's static exporter then
 * writes the route-group RSC payloads as nested directories while the client
 * router still requests flat dot-joined names, which 404s on every page load.
 * The Dutch page sets its lang via SetHtmlLang instead.
 */
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Agora",
  "alternateName": "Midnight Space Consultancy",
  "description": "Belgian AI workflow automation consultancy designing and building automated workflows for SMEs in Belgium and the Netherlands.",
  "url": "https://agora.midnightspaceconsultancy.com",
  "email": "j.guzman@midnightspaceconsultancy.com",
  "founder": { "@type": "Person", "name": "Jordan Van Der Sloten" },
  "foundingLocation": { "@type": "Place", "name": "Belgium" },
  "areaServed": [
    { "@type": "Country", "name": "Belgium" },
    { "@type": "Country", "name": "Netherlands" },
  ],
  "knowsLanguage": ["en", "nl"],
  "serviceType": ["AI workflow automation", "workflow automatisering", "AI automatisering KMO"],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "AI Workflow Automation Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Free Discovery Call",
          "description": "Free 30-minute call to assess which workflows are worth automating for your business.",
        },
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Workflow Audit",
          "description": "Paid written analysis of your business processes with automation priorities, scope, and roadmap.",
        },
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Automation Build",
          "description": "Custom workflow automation using n8n, Make.com, and API integrations across CRM, email, invoicing, and operations.",
        },
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${mkDisplay.variable} ${mkSans.variable}`}
    >
      <body style={{ margin: 0, minHeight: "100vh" }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
