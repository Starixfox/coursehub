import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { EN } from "@/components/marketing/copy";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: { en: "/", nl: "/nl/" },
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Will AI replace my employees?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. The goal is to remove repetitive work, not people. The workflow takes over the copying, checking and re-entering, so your team spends its hours on the work that needs judgment, relationships and expertise." },
    },
    {
      "@type": "Question",
      "name": "Do I need to replace my existing software?",
      "acceptedAnswer": { "@type": "Answer", "text": "Almost never, and that is the point. We connect the workflow to the systems you already have: your CRM, mailbox, calendar, accounting package and internal tools. If something genuinely cannot be connected, you hear it during the audit, not halfway through a build." },
    },
    {
      "@type": "Question",
      "name": "What happens to my business data?",
      "acceptedAnswer": { "@type": "Answer", "text": "Access rights are set per system and per agent, so each part of the workflow can only reach the data it needs. Data only goes to an AI model where that step requires it, and we agree up front which data may be processed where. You get an overview of every system the workflow touches and sign off before anything goes live." },
    },
    {
      "@type": "Question",
      "name": "Can I keep human approval in the workflow?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes, and in plenty of workflows you should. Any step can be set to wait for a person: an outgoing e-mail, a quote above a certain amount, anything that touches a client relationship. We decide together where the automation stops and your judgment starts." },
    },
    {
      "@type": "Question",
      "name": "How much does AI workflow automation cost?",
      "acceptedAnswer": { "@type": "Answer", "text": "The discovery call is free. A full workflow audit is paid, at a price we agree before it starts. After the audit you get a defined scope and price before anything is built, so there are no surprises halfway through." },
    },
    {
      "@type": "Question",
      "name": "How long does workflow automation implementation take?",
      "acceptedAnswer": { "@type": "Answer", "text": "For one well-defined process you should think in weeks. A chain of connected processes takes longer. After the audit you get a concrete timeline for your situation, before you commit to anything." },
    },
    {
      "@type": "Question",
      "name": "What happens after implementation?",
      "acceptedAnswer": { "@type": "Answer", "text": "We stay responsible for it. We monitor the workflow, fix what breaks, adjust it when your process changes, and extend it when a new step becomes worth automating. You are not left holding a system that nobody in your business understands." },
    },
    {
      "@type": "Question",
      "name": "What if my workflow is very specific to my business?",
      "acceptedAnswer": { "@type": "Answer", "text": "Specific is the norm, not the exception. Two businesses that look identical on paper run completely differently in practice. The audit exists precisely to map your version, including the exceptions and edge cases most tools quietly ignore." },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <MarketingPage copy={EN} />
    </>
  );
}
