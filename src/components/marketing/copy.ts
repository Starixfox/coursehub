/**
 * All user-visible copy for the marketing site, in English and Dutch.
 * The page structure lives in marketing-page.tsx; only words live here.
 */

export type Lang = "en" | "nl";

export type StepKind = "start" | "ai" | "human" | "end";

export type WorkflowCopy = {
  key: string;
  tab: string;
  title: string;
  subtitle: string;
  steps: { label: string; kind: StepKind }[];
};

export type MarketingCopy = {
  lang: Lang;
  locale: string;
  nav: {
    ariaMain: string;
    ariaMobile: string;
    links: { href: string; label: string }[];
    cta: string;
    menuOpen: string;
    menuClose: string;
  };
  hero: {
    eyebrow: string;
    h1Plain: string;
    h1Serif: string;
    lede: string;
    ctaPrimary: string;
    ctaSecondary: string;
    note: string;
    flowName: string;
    flowStatus: string;
    flowAria: string;
    roleTrigger: string;
    roleAgent: string;
    roleAction: string;
    trigger: string;
    agents: [string, string, string];
    action: string;
  };
  positioning: {
    eyebrow: string;
    h2: string;
    quote: string;
    pullLine1: string;
    pullLine2: string;
    paragraphs: string[];
  };
  beforeAfter: {
    eyebrow: string;
    h2: string;
    lede: string;
    beforeTag: string;
    beforeItems: string[];
    beforeFootnote: string;
    afterTag: string;
    afterItems: string[];
    afterHumanItem: string;
    afterFootnote: string;
  };
  workflows: {
    eyebrow: string;
    h2: string;
    lede: string;
    tablistAria: string;
    items: WorkflowCopy[];
    legend: { trigger: string; ai: string; human: string; outcome: string };
    note: string;
  };
  approach: {
    eyebrow: string;
    h2: string;
    lede: string;
    steps: { num: string; name: string; title: string; body: string }[];
  };
  roi: {
    eyebrow: string;
    h2: string;
    lede: string;
    hoursLabel: string;
    hoursUnit: string;
    rateLabel: string;
    rateUnit: string;
    peopleLabel: string;
    personSingular: string;
    peoplePlural: string;
    resultLabel: string;
    perYear: string;
    subBefore: string;
    hoursWord: string;
    subAfter: string;
    cta: string;
    disclaimer: string;
  };
  why: {
    eyebrow: string;
    h2: string;
    lede: string;
    statementParts: [string, string, string, string, string, string, string];
    cards: { title: string; body: string }[];
  };
  integrations: { aria: string; items: string[] };
  faq: {
    eyebrow: string;
    h2: string;
    items: { q: string; a: string }[];
  };
  statement: {
    eyebrow: string;
    bigPlain: string;
    bigSerif: string;
    triad: { plain: string; strong: string }[];
  };
  cta: {
    eyebrow: string;
    titlePlain: string;
    titleSerif: string;
    sub: string;
    button: string;
    mailHref: string;
    mailLead: string;
    mailAddress: string;
  };
  footer: {
    aria: string;
    links: { href: string; label: string }[];
    legalLeft: string;
    legalRight: string;
  };
};

export const EN: MarketingCopy = {
  lang: "en",
  locale: "en-IE",
  nav: {
    ariaMain: "Main",
    ariaMobile: "Mobile",
    links: [
      { href: "#how", label: "How it works" },
      { href: "#workflows", label: "Workflows" },
      { href: "#approach", label: "Approach" },
      { href: "#roi", label: "ROI" },
      { href: "#faq", label: "FAQ" },
    ],
    cta: "Book a free workflow audit",
    menuOpen: "Open menu",
    menuClose: "Close menu",
  },
  hero: {
    eyebrow: "AI-powered workflow automation",
    h1Plain: "Automate the work that",
    h1Serif: "slows your business down.",
    lede: "We design and implement AI-powered workflows that handle repetitive business processes for you: from lead management and communication to administration and operations.",
    ctaPrimary: "Book a free workflow audit",
    ctaSecondary: "See how it works",
    note: "One workflow in. A concrete automation plan out.",
    flowName: "workflow / lead-intake",
    flowStatus: "running",
    flowAria: "Example workflow: a trigger passes through three AI agents to an action",
    roleTrigger: "Trigger",
    roleAgent: "AI agent",
    roleAction: "Action",
    trigger: "New lead arrives",
    agents: ["Research", "Communication", "CRM update"],
    action: "Follow-up sent, meeting planned",
  },
  positioning: {
    eyebrow: "Positioning",
    h2: "AI isn’t the product. Your workflow is.",
    quote:
      "“Most businesses don’t need another AI tool. They need their existing work to happen more efficiently.”",
    pullLine1: "We don’t start with the AI.",
    pullLine2: "We start with your workflow.",
    paragraphs: [
      "You probably already use AI. ChatGPT writes an e-mail here, another tool collects leads there, a third one helps with admin. But you are still the one copying and pasting, switching between tools, writing prompts and re-entering data into other systems.",
      "That is not automation. That is you doing the integration work by hand.",
      "Real automation means the workflow starts running on its own. So we look at your business first and at the technology second: we map how you work today, find the repetitive steps, and design a system of specialized AI agents around them. Each agent has one job and hands its output to the next.",
      "The goal is not to remove people from the process. It is to free people from repetitive work, so they can focus on the work that needs human expertise, creativity and judgment.",
    ],
  },
  beforeAfter: {
    eyebrow: "Before / after",
    h2: "From manual work to autonomous workflows",
    lede: "Same lead. Same outcome. A completely different week.",
    beforeTag: "Before · all on you",
    beforeItems: [
      "New lead comes in",
      "Research the company yourself",
      "Write the e-mail yourself",
      "Update the CRM by hand",
      "Set a follow-up reminder",
      "Check the calendar",
      "Enter the data again elsewhere",
      "Build the report",
    ],
    beforeFootnote:
      "One lead, seven manual steps. Every handoff can slip, every step interrupts your real work.",
    afterTag: "After · one integrated workflow",
    afterItems: [
      "New lead comes in",
      "Research Agent gathers context",
      "Qualification Agent scores the lead",
      "Communication Agent drafts the follow-up",
      "CRM and Scheduling Agents do the admin",
    ],
    afterHumanItem: "You get the relevant output, nothing else",
    afterFootnote: "You are only notified when human input is actually needed.",
  },
  workflows: {
    eyebrow: "Example workflows",
    h2: "What this looks like in practice",
    lede: "Five workflows we design and build. Yours will look different, because it starts from how you actually work.",
    tablistAria: "Example workflows",
    items: [
      {
        key: "leads",
        tab: "Lead management",
        title: "Lead management",
        subtitle: "From new lead to qualified prospect.",
        steps: [
          { label: "New lead arrives", kind: "start" },
          { label: "Gather information", kind: "ai" },
          { label: "Qualify the lead", kind: "ai" },
          { label: "Personalize outreach", kind: "ai" },
          { label: "Update CRM", kind: "ai" },
          { label: "Follow-up prepared", kind: "end" },
        ],
      },
      {
        key: "sales",
        tab: "Sales",
        title: "Sales",
        subtitle: "From prospect to booked meeting.",
        steps: [
          { label: "Prospect identified", kind: "start" },
          { label: "Research", kind: "ai" },
          { label: "Personalization", kind: "ai" },
          { label: "Outreach", kind: "ai" },
          { label: "Follow-up", kind: "ai" },
          { label: "Update CRM", kind: "ai" },
          { label: "Meeting booked", kind: "end" },
        ],
      },
      {
        key: "email",
        tab: "E-mail",
        title: "E-mail",
        subtitle: "From inbox to action.",
        steps: [
          { label: "New e-mail", kind: "start" },
          { label: "Classify", kind: "ai" },
          { label: "Gather context", kind: "ai" },
          { label: "Draft the reply", kind: "ai" },
          { label: "Assess urgency", kind: "ai" },
          { label: "Your approval, if needed", kind: "human" },
          { label: "Sent", kind: "end" },
        ],
      },
      {
        key: "admin",
        tab: "Administration",
        title: "Administration",
        subtitle: "From document to organized data.",
        steps: [
          { label: "Document arrives", kind: "start" },
          { label: "Extract information", kind: "ai" },
          { label: "Verify", kind: "ai" },
          { label: "Structure", kind: "ai" },
          { label: "Database / CRM", kind: "ai" },
          { label: "Report ready", kind: "end" },
        ],
      },
      {
        key: "support",
        tab: "Customer support",
        title: "Customer support",
        subtitle: "From question to solution.",
        steps: [
          { label: "Customer question", kind: "start" },
          { label: "Classify", kind: "ai" },
          { label: "Check knowledge base", kind: "ai" },
          { label: "Generate answer", kind: "ai" },
          { label: "Escalate to you, if needed", kind: "human" },
          { label: "Answer sent, CRM updated", kind: "end" },
        ],
      },
    ],
    legend: {
      trigger: "Trigger",
      ai: "AI agent",
      human: "Human in the loop",
      outcome: "Outcome",
    },
    note: "These are examples, not a menu. Every workflow is mapped, designed and built around how your business actually works.",
  },
  approach: {
    eyebrow: "Our approach",
    h2: "We take responsibility for the full process.",
    lede: "Not advice you still have to implement. Not a tool you still have to figure out. Analysis, design, build, integration and optimization: one accountable partner.",
    steps: [
      {
        num: "01",
        name: "Discover",
        title: "We understand your business.",
        body: "We analyze how you work today: the processes, the tools, the handoffs, and where time actually goes.",
      },
      {
        num: "02",
        name: "Identify",
        title: "We find where time is being lost.",
        body: "We pinpoint the processes with the highest automation potential: repetitive tasks, manual data entry, bottlenecks, and steps that are predictable enough to systematize.",
      },
      {
        num: "03",
        name: "Design",
        title: "We design your AI workflow.",
        body: "We define which agents, systems and integrations are needed, and exactly where humans stay in the loop.",
      },
      {
        num: "04",
        name: "Implement",
        title: "We make it work in your business.",
        body: "We build the agent system and connect it to the software you already use: CRM, e-mail, calendar, accounting, Google Workspace or Microsoft 365.",
      },
      {
        num: "05",
        name: "Optimize",
        title: "We make it better over time.",
        body: "We monitor performance, test, improve, and extend workflows when it is relevant. An automation is never a one-off project.",
      },
    ],
  },
  roi: {
    eyebrow: "ROI calculator",
    h2: "How much is manual work costing your business?",
    lede: "A rough estimate in ten seconds. Move the sliders.",
    hoursLabel: "Hours spent on repetitive work per week",
    hoursUnit: "h / week",
    rateLabel: "Average hourly value of that work",
    rateUnit: "/ h",
    peopleLabel: "People doing this work",
    personSingular: "1 person",
    peoplePlural: "people",
    resultLabel: "Estimated annual cost of manual work",
    perYear: "/ year",
    subBefore: "That is roughly",
    hoursWord: "hours",
    subAfter: "of repetitive work per year, based on 46 working weeks.",
    cta: "Let’s see what you could automate",
    disclaimer:
      "This is an indicative calculation, not a guarantee of savings. The workflow audit tells you what is realistic for your business.",
  },
  why: {
    eyebrow: "Why us",
    h2: "Not another tool. Not just advice.",
    lede: "We are not a traditional consultancy that stops at recommendations, and we are not a software company selling one standard product.",
    statementParts: ["We combine ", "strategy", ", ", "AI", " and ", "implementation", "."],
    cards: [
      {
        title: "Workflow-first",
        body: "We start with the problem, not the technology. The tools follow from the workflow, never the other way around.",
      },
      {
        title: "Built around your business",
        body: "No one-size-fits-all automation. Every system is designed for how your business actually operates.",
      },
      {
        title: "Integrated",
        body: "We connect AI to the systems you already use, so you keep your CRM, mailbox and calendar instead of replacing them.",
      },
      {
        title: "Human when it matters",
        body: "AI handles the routine. People stay involved wherever human judgment, relationships or creativity matter.",
      },
      {
        title: "Continuous improvement",
        body: "Your workflows keep evolving after launch. One accountable partner keeps refining them and builds new ones as your business grows.",
      },
    ],
  },
  integrations: {
    aria: "Systems we integrate with",
    items: [
      "CRM",
      "E-mail",
      "Calendar",
      "Accounting",
      "Databases",
      "Google Workspace",
      "Microsoft 365",
      "Project management",
      "Internal tools",
    ],
  },
  faq: {
    eyebrow: "FAQ",
    h2: "Fair questions, straight answers",
    items: [
      {
        q: "What is an AI agent?",
        a: "An AI agent is a system that can carry out specific tasks on its own, based on instructions, the information it receives and the tools it is allowed to use. In our workflows every agent has one clear responsibility, like research, communication or data entry, and hands its output to the next agent.",
      },
      {
        q: "What’s the difference between an AI agent and ChatGPT?",
        a: "ChatGPT is mainly an interface: you type, it answers, and you do something with the result. An AI agent works inside a workflow. It takes steps on its own, processes information and passes work to the next step, without you writing prompts or copying results around.",
      },
      {
        q: "Do I need to replace my existing software?",
        a: "Not necessarily. The goal is exactly the opposite: we integrate AI with the systems you already use (your CRM, mailbox, calendar or accounting package), wherever that is possible and sensible.",
      },
      {
        q: "Do I need technical knowledge?",
        a: "No. We design, build and maintain the system. You and your team simply work with the results, and you have one point of contact instead of a stack of tools to learn.",
      },
      {
        q: "Can AI work completely autonomously?",
        a: "That depends on the workflow. Some tasks can run fully automatically. Others deliberately include a human checkpoint, for example approving an outgoing e-mail before it is sent. Together, we decide where automation ends and your judgment begins.",
      },
      {
        q: "Is my business data secure?",
        a: "We keep this concrete and verifiable rather than making blanket promises. Access rights are set per system and per agent, data is only shared with AI models where the workflow requires it, and we agree with you up front which data may be processed where. Before anything goes live, you see exactly which systems the workflow touches and what leaves your environment.",
      },
      {
        q: "How long does implementation take?",
        a: "That depends on the complexity of the workflow and the number of integrations. A single well-defined workflow moves faster than a chain of connected processes. After the free audit you get a concrete timeline for your situation, before you commit to anything.",
      },
      {
        q: "How much does it cost?",
        a: "There is no fixed price list, because no two workflows are the same. The investment depends on the complexity and scope of the automation. The audit is free, and you always know the full picture before we build anything.",
      },
    ],
  },
  statement: {
    eyebrow: "The whole idea",
    bigPlain: "Your business already has workflows.",
    bigSerif: "We make them run themselves.",
    triad: [
      { plain: "AI agents are", strong: "the engine" },
      { plain: "Workflow automation is", strong: "the product" },
      { plain: "Your time is", strong: "the outcome" },
    ],
  },
  cta: {
    eyebrow: "Free workflow audit",
    titlePlain: "Give us your workflow.",
    titleSerif: "We’ll build the system that runs it.",
    sub: "Bring us one workflow that takes too much of your time. We’ll show you what could be automated, what should stay human, and what it would take to build.",
    button: "Request your free workflow audit",
    mailHref: "mailto:hello@agora.be?subject=Free%20workflow%20audit",
    mailLead: "Or e-mail us directly:",
    mailAddress: "hello@agora.be",
  },
  footer: {
    aria: "Footer",
    links: [
      { href: "#how", label: "How it works" },
      { href: "#workflows", label: "Workflows" },
      { href: "#approach", label: "Approach" },
      { href: "#roi", label: "ROI" },
      { href: "#faq", label: "FAQ" },
      { href: "#audit", label: "Contact" },
    ],
    legalLeft: "© 2026 Agora. AI-powered workflow automation.",
    legalRight: "Find your automation opportunities.",
  },
};

export const NL: MarketingCopy = {
  lang: "nl",
  locale: "nl-BE",
  nav: {
    ariaMain: "Hoofdmenu",
    ariaMobile: "Mobiel menu",
    links: [
      { href: "#how", label: "Hoe het werkt" },
      { href: "#workflows", label: "Workflows" },
      { href: "#approach", label: "Aanpak" },
      { href: "#roi", label: "ROI" },
      { href: "#faq", label: "FAQ" },
    ],
    cta: "Boek een gratis workflow-audit",
    menuOpen: "Menu openen",
    menuClose: "Menu sluiten",
  },
  hero: {
    eyebrow: "AI-gedreven workflowautomatisering",
    h1Plain: "Automatiseer het werk dat",
    h1Serif: "je bedrijf vertraagt.",
    lede: "Wij ontwerpen en implementeren AI-workflows die repetitieve bedrijfsprocessen voor je afhandelen: van leadbeheer en communicatie tot administratie en operations.",
    ctaPrimary: "Boek een gratis workflow-audit",
    ctaSecondary: "Bekijk hoe het werkt",
    note: "Eén workflow erin. Een concreet automatiseringsplan eruit.",
    flowName: "workflow / lead-intake",
    flowStatus: "actief",
    flowAria: "Voorbeeldworkflow: een trigger passeert drie AI agents naar een actie",
    roleTrigger: "Trigger",
    roleAgent: "AI agent",
    roleAction: "Actie",
    trigger: "Nieuwe lead komt binnen",
    agents: ["Research", "Communicatie", "CRM-update"],
    action: "Opvolging verstuurd, afspraak gepland",
  },
  positioning: {
    eyebrow: "Positionering",
    h2: "AI is niet het product. Jouw workflow wel.",
    quote:
      "“De meeste bedrijven hebben geen zoveelste AI-tool nodig. Ze hebben nodig dat hun bestaande werk efficiënter verloopt.”",
    pullLine1: "We vertrekken niet vanuit de AI.",
    pullLine2: "We vertrekken vanuit jouw workflow.",
    paragraphs: [
      "Waarschijnlijk gebruik je al AI. ChatGPT schrijft hier een e-mail, een andere tool verzamelt leads, een derde helpt met administratie. Maar jij bent nog altijd degene die kopieert en plakt, tussen tools schakelt, prompts schrijft en data opnieuw invoert in andere systemen.",
      "Dat is geen automatisering. Dat is integratiewerk dat jij met de hand doet.",
      "Echte automatisering betekent dat de workflow vanzelf begint te draaien. Daarom kijken we eerst naar je bedrijf en pas daarna naar de technologie: we brengen in kaart hoe je vandaag werkt, zoeken de repetitieve stappen en ontwerpen daar een systeem van gespecialiseerde AI agents omheen. Elke agent heeft één taak en geeft zijn output door aan de volgende.",
      "Het doel is niet om mensen uit het proces te halen. Het doel is om mensen te bevrijden van repetitief werk, zodat ze zich kunnen concentreren op werk dat menselijke expertise, creativiteit en oordeel vraagt.",
    ],
  },
  beforeAfter: {
    eyebrow: "Voor / na",
    h2: "Van handmatig werk naar autonome workflows",
    lede: "Dezelfde lead. Hetzelfde resultaat. Een compleet andere week.",
    beforeTag: "Voor · alles op jouw bord",
    beforeItems: [
      "Nieuwe lead komt binnen",
      "Zelf het bedrijf onderzoeken",
      "Zelf de e-mail schrijven",
      "CRM handmatig bijwerken",
      "Opvolgherinnering instellen",
      "Agenda controleren",
      "Data nog eens elders invoeren",
      "Rapport opstellen",
    ],
    beforeFootnote:
      "Eén lead, zeven handmatige stappen. Elke overdracht kan mislopen, elke stap onderbreekt je echte werk.",
    afterTag: "Na · één geïntegreerde workflow",
    afterItems: [
      "Nieuwe lead komt binnen",
      "Research Agent verzamelt context",
      "Qualification Agent scoort de lead",
      "Communication Agent stelt de opvolging op",
      "CRM en Scheduling Agents doen de administratie",
    ],
    afterHumanItem: "Jij krijgt alleen de relevante output",
    afterFootnote: "Je wordt alleen verwittigd wanneer menselijke input echt nodig is.",
  },
  workflows: {
    eyebrow: "Voorbeeldworkflows",
    h2: "Hoe dat er in de praktijk uitziet",
    lede: "Vijf workflows die we ontwerpen en bouwen. De jouwe zal er anders uitzien, want die vertrekt vanuit hoe jij echt werkt.",
    tablistAria: "Voorbeeldworkflows",
    items: [
      {
        key: "leads",
        tab: "Leadbeheer",
        title: "Leadbeheer",
        subtitle: "Van nieuwe lead naar gekwalificeerde prospect.",
        steps: [
          { label: "Nieuwe lead komt binnen", kind: "start" },
          { label: "Informatie verzamelen", kind: "ai" },
          { label: "Lead kwalificeren", kind: "ai" },
          { label: "Outreach personaliseren", kind: "ai" },
          { label: "CRM bijwerken", kind: "ai" },
          { label: "Opvolging klaargezet", kind: "end" },
        ],
      },
      {
        key: "sales",
        tab: "Sales",
        title: "Sales",
        subtitle: "Van prospect naar geboekte afspraak.",
        steps: [
          { label: "Prospect geïdentificeerd", kind: "start" },
          { label: "Research", kind: "ai" },
          { label: "Personalisatie", kind: "ai" },
          { label: "Outreach", kind: "ai" },
          { label: "Opvolging", kind: "ai" },
          { label: "CRM bijwerken", kind: "ai" },
          { label: "Afspraak geboekt", kind: "end" },
        ],
      },
      {
        key: "email",
        tab: "E-mail",
        title: "E-mail",
        subtitle: "Van inbox naar actie.",
        steps: [
          { label: "Nieuwe e-mail", kind: "start" },
          { label: "Classificeren", kind: "ai" },
          { label: "Context verzamelen", kind: "ai" },
          { label: "Antwoord opstellen", kind: "ai" },
          { label: "Urgentie inschatten", kind: "ai" },
          { label: "Jouw goedkeuring, indien nodig", kind: "human" },
          { label: "Verzonden", kind: "end" },
        ],
      },
      {
        key: "admin",
        tab: "Administratie",
        title: "Administratie",
        subtitle: "Van document naar georganiseerde data.",
        steps: [
          { label: "Document komt binnen", kind: "start" },
          { label: "Informatie extraheren", kind: "ai" },
          { label: "Controleren", kind: "ai" },
          { label: "Structureren", kind: "ai" },
          { label: "Database / CRM", kind: "ai" },
          { label: "Rapport klaar", kind: "end" },
        ],
      },
      {
        key: "support",
        tab: "Klantensupport",
        title: "Klantensupport",
        subtitle: "Van vraag naar oplossing.",
        steps: [
          { label: "Klantvraag", kind: "start" },
          { label: "Classificeren", kind: "ai" },
          { label: "Kennisbank raadplegen", kind: "ai" },
          { label: "Antwoord genereren", kind: "ai" },
          { label: "Escalatie naar jou, indien nodig", kind: "human" },
          { label: "Antwoord verstuurd, CRM bijgewerkt", kind: "end" },
        ],
      },
    ],
    legend: {
      trigger: "Trigger",
      ai: "AI agent",
      human: "Menselijke controle",
      outcome: "Resultaat",
    },
    note: "Dit zijn voorbeelden, geen menukaart. Elke workflow wordt in kaart gebracht, ontworpen en gebouwd rond hoe jouw bedrijf echt werkt.",
  },
  approach: {
    eyebrow: "Onze aanpak",
    h2: "Wij nemen verantwoordelijkheid voor het volledige proces.",
    lede: "Geen advies dat je zelf nog moet implementeren. Geen tool die je zelf nog moet uitzoeken. Analyse, ontwerp, bouw, integratie en optimalisatie: één aanspreekbare partner.",
    steps: [
      {
        num: "01",
        name: "Ontdekken",
        title: "We leren je bedrijf kennen.",
        body: "We analyseren hoe je vandaag werkt: de processen, de tools, de overdrachten en waar de tijd echt naartoe gaat.",
      },
      {
        num: "02",
        name: "Identificeren",
        title: "We vinden waar tijd verloren gaat.",
        body: "We sporen de processen op met het grootste automatiseringspotentieel: repetitieve taken, handmatige data-invoer, bottlenecks en stappen die voorspelbaar genoeg zijn om te systematiseren.",
      },
      {
        num: "03",
        name: "Ontwerpen",
        title: "We ontwerpen jouw AI-workflow.",
        body: "We bepalen welke agents, systemen en integraties nodig zijn, en waar mensen precies in de loop blijven.",
      },
      {
        num: "04",
        name: "Implementeren",
        title: "We laten het werken in jouw bedrijf.",
        body: "We bouwen het agentsysteem en koppelen het aan de software die je al gebruikt: CRM, e-mail, agenda, boekhouding, Google Workspace of Microsoft 365.",
      },
      {
        num: "05",
        name: "Optimaliseren",
        title: "We maken het steeds beter.",
        body: "We monitoren de prestaties, testen, verbeteren en breiden workflows uit wanneer dat relevant is. Een automatisering is nooit een eenmalig project.",
      },
    ],
  },
  roi: {
    eyebrow: "ROI-calculator",
    h2: "Hoeveel kost handmatig werk jouw bedrijf?",
    lede: "Een ruwe schatting in tien seconden. Schuif met de sliders.",
    hoursLabel: "Uren repetitief werk per week",
    hoursUnit: "u / week",
    rateLabel: "Gemiddelde uurwaarde van dat werk",
    rateUnit: "/ u",
    peopleLabel: "Mensen die dit werk doen",
    personSingular: "1 persoon",
    peoplePlural: "mensen",
    resultLabel: "Geschatte jaarlijkse kost van handmatig werk",
    perYear: "/ jaar",
    subBefore: "Dat is ongeveer",
    hoursWord: "uur",
    subAfter: "repetitief werk per jaar, gerekend met 46 werkweken.",
    cta: "Ontdek wat jij kan automatiseren",
    disclaimer:
      "Dit is een indicatieve berekening, geen gegarandeerde besparing. De workflow-audit vertelt je wat realistisch is voor jouw bedrijf.",
  },
  why: {
    eyebrow: "Waarom wij",
    h2: "Geen zoveelste tool. Geen vrijblijvend advies.",
    lede: "We zijn geen klassieke consultancy die stopt bij aanbevelingen, en geen softwarebedrijf dat één standaardproduct verkoopt.",
    statementParts: ["Wij combineren ", "strategie", ", ", "AI", " en ", "implementatie", "."],
    cards: [
      {
        title: "Workflow-first",
        body: "We vertrekken vanuit het probleem, niet vanuit de technologie. De tools volgen uit de workflow, nooit omgekeerd.",
      },
      {
        title: "Gebouwd rond jouw bedrijf",
        body: "Geen one-size-fits-all automatisering. Elk systeem wordt ontworpen voor hoe jouw bedrijf echt werkt.",
      },
      {
        title: "Geïntegreerd",
        body: "We verbinden AI met de systemen die je al gebruikt, zodat je je CRM, mailbox en agenda houdt in plaats van ze te vervangen.",
      },
      {
        title: "Menselijk waar het telt",
        body: "AI handelt de routine af. Mensen blijven betrokken waar menselijk oordeel, relaties of creativiteit het verschil maken.",
      },
      {
        title: "Continue verbetering",
        body: "Je workflows blijven evolueren na de lancering. Eén aanspreekbare partner blijft ze verfijnen en bouwt nieuwe naarmate je bedrijf groeit.",
      },
    ],
  },
  integrations: {
    aria: "Systemen waarmee we integreren",
    items: [
      "CRM",
      "E-mail",
      "Agenda",
      "Boekhouding",
      "Databases",
      "Google Workspace",
      "Microsoft 365",
      "Projectmanagement",
      "Interne tools",
    ],
  },
  faq: {
    eyebrow: "FAQ",
    h2: "Eerlijke vragen, eerlijke antwoorden",
    items: [
      {
        q: "Wat is een AI agent?",
        a: "Een AI agent is een systeem dat zelfstandig specifieke taken kan uitvoeren op basis van instructies, de informatie die het ontvangt en de tools die het mag gebruiken. In onze workflows heeft elke agent één duidelijke verantwoordelijkheid, zoals research, communicatie of data-invoer, en geeft hij zijn output door aan de volgende agent.",
      },
      {
        q: "Wat is het verschil tussen een AI agent en ChatGPT?",
        a: "ChatGPT is vooral een interface: jij typt, het antwoordt, en jij doet iets met het resultaat. Een AI agent werkt binnen een workflow. Hij zet zelfstandig stappen, verwerkt informatie en geeft werk door aan de volgende stap, zonder dat jij prompts schrijft of resultaten rondkopieert.",
      },
      {
        q: "Moet ik mijn huidige software vervangen?",
        a: "Niet noodzakelijk. Het doel is net het omgekeerde: we integreren AI met de systemen die je al gebruikt (je CRM, mailbox, agenda of boekhoudpakket), overal waar dat mogelijk en zinvol is.",
      },
      {
        q: "Heb ik technische kennis nodig?",
        a: "Nee. Wij ontwerpen, bouwen en onderhouden het systeem. Jij en je team werken gewoon met de resultaten, en je hebt één aanspreekpunt in plaats van een stapel tools om te leren.",
      },
      {
        q: "Kan AI volledig autonoom werken?",
        a: "Dat hangt af van de workflow. Sommige taken kunnen volledig automatisch lopen. Andere bevatten bewust een menselijke controle, bijvoorbeeld het goedkeuren van een uitgaande e-mail voor die vertrekt. Samen beslissen we waar de automatisering stopt en jouw oordeel begint.",
      },
      {
        q: "Zijn mijn bedrijfsgegevens veilig?",
        a: "We houden dit concreet en controleerbaar in plaats van holle beloftes te doen. Toegangsrechten worden per systeem en per agent ingesteld, data wordt alleen gedeeld met AI-modellen waar de workflow dat vereist, en we spreken vooraf met jou af welke gegevens waar verwerkt mogen worden. Voor er iets live gaat, zie je exact welke systemen de workflow raakt en wat je omgeving verlaat.",
      },
      {
        q: "Hoelang duurt een implementatie?",
        a: "Dat hangt af van de complexiteit van de workflow en het aantal integraties. Eén afgebakende workflow gaat sneller dan een keten van verbonden processen. Na de gratis audit krijg je een concrete timing voor jouw situatie, voor je ergens aan vastzit.",
      },
      {
        q: "Wat kost het?",
        a: "Er is geen vaste prijslijst, omdat geen twee workflows dezelfde zijn. De investering hangt af van de complexiteit en omvang van de automatisering. De audit is gratis, en je kent altijd het volledige plaatje voor we iets bouwen.",
      },
    ],
  },
  statement: {
    eyebrow: "Het hele idee",
    bigPlain: "Je bedrijf heeft al workflows.",
    bigSerif: "Wij zorgen dat ze zichzelf uitvoeren.",
    triad: [
      { plain: "AI agents zijn", strong: "de motor" },
      { plain: "Workflowautomatisering is", strong: "het product" },
      { plain: "Jouw tijd is", strong: "het resultaat" },
    ],
  },
  cta: {
    eyebrow: "Gratis workflow-audit",
    titlePlain: "Geef ons je workflow.",
    titleSerif: "Wij bouwen het systeem dat hem voor je uitvoert.",
    sub: "Breng ons één workflow die te veel van je tijd opslokt. We tonen je wat geautomatiseerd kan worden, wat menselijk moet blijven en wat ervoor nodig is.",
    button: "Vraag je gratis workflow-audit aan",
    mailHref: "mailto:hello@agora.be?subject=Gratis%20workflow-audit",
    mailLead: "Of mail ons rechtstreeks:",
    mailAddress: "hello@agora.be",
  },
  footer: {
    aria: "Voettekst",
    links: [
      { href: "#how", label: "Hoe het werkt" },
      { href: "#workflows", label: "Workflows" },
      { href: "#approach", label: "Aanpak" },
      { href: "#roi", label: "ROI" },
      { href: "#faq", label: "FAQ" },
      { href: "#audit", label: "Contact" },
    ],
    legalLeft: "© 2026 Agora. AI-gedreven workflowautomatisering.",
    legalRight: "Ontdek je automatiseringskansen.",
  },
};
