/**
 * All user-visible copy for the marketing site, in English and Dutch.
 * The page structure lives in marketing-page.tsx; only words live here.
 */

export type Lang = "en" | "nl";

export type StepKind = "start" | "ai" | "human" | "end";

/** Node roles used by the before / after chain comparison. */
export type ChainKind = "trigger" | "human" | "agent" | "system" | "end";

export type ChainNode = { label: string; kind: ChainKind };

export type WorkflowCopy = {
  key: string;
  tab: string;
  title: string;
  subtitle: string;
  steps: { label: string; kind: StepKind }[];
  /** Qualitative outcome line. No numbers, no invented results. */
  outcome: string;
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
    scene3dAria: string;
  };
  /** Scroll-driven 3D story. The hero is chapter zero; these are chapters 1-4. */
  story: {
    aria: string;
    chapters: {
      id: string;
      kicker: string;
      title: string;
      body: string;
    }[];
    ctaButton: string;
  };
  whoFor: {
    eyebrow: string;
    h2: string;
    lede: string;
    audiences: { name: string; note: string }[];
    note: string;
  };
  positioning: {
    eyebrow: string;
    h2: string;
    lead: string;
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
    beforeChain: ChainNode[];
    beforeFootnote: string;
    afterTag: string;
    afterChain: ChainNode[];
    afterFootnote: string;
    closingLine: string;
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
    pipeline: string[];
    steps: { num: string; name: string; title: string; body: string }[];
  };
  audit: {
    eyebrow: string;
    h2: string;
    lede: string;
    steps: { num: string; title: string; body: string }[];
    note: string;
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
    caveat: string;
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
  trust: {
    eyebrow: string;
    h2: string;
    lede: string;
    principles: { title: string; body: string }[];
    founderLine: string;
    founderBody: string;
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
      { href: "#who", label: "Who it’s for" },
      { href: "#how", label: "How it works" },
      { href: "#workflows", label: "Workflows" },
      { href: "#approach", label: "Approach" },
      { href: "#audit", label: "Audit" },
      { href: "#faq", label: "FAQ" },
    ],
    cta: "Book a free intro call",
    menuOpen: "Open menu",
    menuClose: "Close menu",
  },
  hero: {
    eyebrow: "AI-powered workflow automation",
    h1Plain: "Turn repetitive work into",
    h1Serif: "automated workflows.",
    lede: "For entrepreneurs and small businesses: we design and build automated workflows that take repetitive admin off your plate, without replacing the tools you already use.",
    ctaPrimary: "Book a free intro call",
    ctaSecondary: "See how it works",
    note: "Bring us one workflow. Thirty minutes, and an honest answer about what is worth automating.",
    flowName: "workflow / lead-intake",
    flowStatus: "running",
    flowAria: "Example workflow: a trigger passes through three AI agents to an action",
    roleTrigger: "Trigger",
    roleAgent: "AI agent",
    roleAction: "Action",
    trigger: "New lead arrives",
    agents: ["Research", "Communication", "CRM update"],
    action: "Follow-up sent, meeting planned",
    scene3dAria:
      "A three-dimensional view of the same workflow: a new lead enters on the left, moves through three AI agents, and leaves on the right as a follow-up that has been sent and a meeting that has been planned.",
  },
  story: {
    aria: "Animated story: scattered tasks first all queue behind one person, are then mapped into an ordered workflow, become a running system with one human decision step, and finally settle into a quietly running machine that gives the week back.",
    chapters: [
      {
        id: "bottleneck",
        kicker: "Today",
        title: "Everything still routes through you.",
        body: "A lead comes in. You look them up, you write the reply, you update the CRM, you set the reminder. Four stops, and every one of them waits for the same person: you.",
      },
      {
        id: "mapping",
        kicker: "Step one",
        title: "First, we map how the work actually moves.",
        body: "Not the technology: the workflow. We follow one process through your business, find the steps that come back every week, and mark where a decision genuinely needs a person.",
      },
      {
        id: "machine",
        kicker: "Step two",
        title: "Then we build the system that runs it.",
        body: "Connected to the tools you already use. A lead arrives, gets researched, answered and filed, and the chain keeps moving on its own. The gold step is yours: the system brings you in only where your judgment matters.",
      },
      {
        id: "payoff",
        kicker: "The outcome",
        title: "The workflow keeps running. Your week comes back.",
        body: "AI agents are the engine. Workflow automation is the product. Your time is the outcome.",
      },
    ],
    ctaButton: "Book a free intro call",
  },
  whoFor: {
    eyebrow: "Who it’s for",
    h2: "Built for businesses where too much still depends on you.",
    lede: "If your business runs on e-mails, leads, documents, spreadsheets and repetitive admin, there is probably a workflow worth automating.",
    audiences: [
      {
        name: "Consultants and advisors",
        note: "Proposals, follow-ups and notes that all queue up behind the same person.",
      },
      {
        name: "Agencies and studios",
        note: "Briefs coming in, status updates going out, and reporting every single month.",
      },
      {
        name: "Service businesses",
        note: "Quotes, scheduling, invoices, and all the reminders in between.",
      },
      {
        name: "Sales teams",
        note: "Research, qualification and CRM hygiene before a single call happens.",
      },
      {
        name: "Independent professionals",
        note: "You are the delivery team and the back office at the same time.",
      },
    ],
    note: "Not sure if you qualify? That is exactly what the audit is for.",
  },
  positioning: {
    eyebrow: "Positioning",
    h2: "AI isn’t the product. Your workflow is.",
    lead: "You don’t need another AI tool. You need your existing work to happen with less manual effort.",
    quote:
      "“The bottleneck is rarely the work itself. It’s everything you have to do around it.”",
    pullLine1: "We don’t start with the AI.",
    pullLine2: "We start with your workflow.",
    paragraphs: [
      "You already have tools. Maybe an AI assistant, a lead form, a scheduler. And still, the work only moves when you move it: you copy the details across, you write the reply, you update the CRM, you set the reminder.",
      "That’s not the automation you were looking for. You’re still the one connecting the dots.",
      "So we start with your workflow, not the technology. We map how work actually moves through your business, find the steps that come back every week, and build a system that runs them, so you step in only where your judgment counts.",
    ],
  },
  beforeAfter: {
    eyebrow: "Before / after",
    h2: "From manual work to automated workflows",
    lede: "Same lead. Same outcome. A completely different week.",
    beforeTag: "Before · all on you",
    beforeChain: [
      { label: "New lead", kind: "trigger" },
      { label: "You", kind: "human" },
      { label: "Research", kind: "system" },
      { label: "You", kind: "human" },
      { label: "E-mail", kind: "system" },
      { label: "You", kind: "human" },
      { label: "CRM", kind: "system" },
      { label: "You", kind: "human" },
      { label: "Follow-up", kind: "end" },
    ],
    beforeFootnote:
      "One lead, and four times the whole thing stops and waits for you. Every stop interrupts the work you actually planned to do today.",
    afterTag: "After · one automated workflow",
    afterChain: [
      { label: "New lead", kind: "trigger" },
      { label: "Research Agent", kind: "agent" },
      { label: "Qualification Agent", kind: "agent" },
      { label: "Communication Agent", kind: "agent" },
      { label: "CRM", kind: "system" },
      { label: "You", kind: "human" },
    ],
    afterFootnote:
      "The chain keeps moving without you. You get the result, and a notification only when a decision genuinely needs a person.",
    closingLine: "You only step in when your judgment matters.",
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
        outcome:
          "Intended outcome: fewer manual handoffs, a faster first response, cleaner CRM data.",
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
        outcome:
          "Intended outcome: more consistent follow-up, fewer prospects going cold, less time spent on research.",
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
        outcome:
          "Intended outcome: a shorter inbox, quicker replies, and nothing important buried under the noise.",
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
        outcome:
          "Intended outcome: less retyping, fewer errors in the data, and reports that are ready when you need them.",
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
        outcome:
          "Intended outcome: routine questions answered sooner, and your team free for the ones that need a person.",
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
    h2: "You bring the workflow. We handle the rest.",
    lede: "Not advice you still have to implement, and not another tool to figure out. We map it, design it, build it, connect it and keep it running: one accountable partner from start to finish.",
    pipeline: ["Audit", "Design", "Build", "Integrate", "Maintain"],
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
  audit: {
    eyebrow: "How to start",
    h2: "A free call first. The full audit only if it earns its place.",
    lede: "We start with one conversation about one workflow. If a full audit makes sense after that, it is paid work and you know the price before we begin. Nothing to prepare.",
    steps: [
      {
        num: "01",
        title: "Pick one workflow",
        body: "You choose the process that eats the most time. Lead intake, quoting, onboarding, reporting: whatever you dread on Monday morning.",
      },
      {
        num: "02",
        title: "Talk it through, free",
        body: "Thirty minutes. We walk through what sets it off, who touches it, which systems it passes through, and where it stalls. You get an honest answer about whether automation is worth it for you.",
      },
      {
        num: "03",
        title: "The full audit, if you want it",
        body: "Up to three processes mapped in depth, with a written analysis of where the time goes, what should stay human, and what automation would actually take. Paid work, at a price agreed before it starts.",
      },
      {
        num: "04",
        title: "Build, or do not",
        body: "The written analysis is yours either way. If you want the first automation built, you get a defined scope and price before anything is touched.",
      },
    ],
    note: "The first call costs nothing and commits you to nothing. Everything after it carries a price you agree to in advance.",
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
    resultLabel: "Estimated cost of manual work",
    perYear: "/ year",
    subBefore: "That is roughly",
    hoursWord: "hours",
    subAfter: "of repetitive work per year, based on 46 working weeks.",
    caveat:
      "Not all of this work can or should be automated. That’s exactly what the workflow audit determines.",
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
        title: "From strategy to implementation",
        body: "We don’t hand over a report and leave you to build it. We design the workflow, build it, connect it to your systems, and keep refining it with you.",
      },
      {
        title: "Workflow-first",
        body: "We start with the problem, not the technology. The tools follow from the workflow, never the other way around.",
      },
      {
        title: "Built around your business",
        body: "No one-size-fits-all automation. Every system is designed for how your business actually operates.",
      },
      {
        title: "Keep the tools you already use",
        body: "You keep working where you already work. We connect the automation to your CRM, e-mail, calendar, accounting and internal tools instead of replacing them.",
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
  trust: {
    eyebrow: "How we work",
    h2: "Built with you. Not behind you.",
    lede: "We work directly with business owners to understand how their company actually operates. No black-box automation, no unnecessary complexity, just workflows designed around how you work.",
    principles: [
      {
        title: "We don’t automate everything",
        body: "Some steps should stay human, and we will tell you which ones. We automate what makes sense and design the workflow around the parts that need a person.",
      },
      {
        title: "You see the whole system",
        body: "Before anything goes live, you see which systems the workflow touches, what data moves between them, and what leaves your environment.",
      },
      {
        title: "One accountable partner",
        body: "The same people run the audit, build the workflow and maintain it. Nothing gets handed off to someone who was not in the room.",
      },
    ],
    founderLine: "Agora is run by Noa and Jordan.",
    founderBody:
      "We are a small team, so the people you talk to are the people who build your workflows. That also means we are straight with you about scope: if something falls outside what we can do well, we say so instead of taking the work.",
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
        q: "Will AI replace my employees?",
        a: "No. The goal is to remove repetitive work, not people. The workflow takes over the copying, checking and re-entering, so your team spends its hours on the work that needs judgment, relationships and expertise. If an automation only pays off by cutting your team, we will say that out loud rather than sell it to you.",
      },
      {
        q: "Do I need to replace my existing software?",
        a: "Almost never, and that is the point. We connect the workflow to the systems you already have: your CRM, mailbox, calendar, accounting package and internal tools. If something genuinely cannot be connected, you hear it during the audit, not halfway through a build.",
      },
      {
        q: "What happens to my business data?",
        a: "We keep this concrete instead of promising that everything is simply safe. Access rights are set per system and per agent, so each part of the workflow can only reach the data it needs. Data only goes to an AI model where that step of the workflow requires it, and we agree up front which data may be processed where. Before anything goes live, you get an overview of every system the workflow touches and everything that leaves your environment, and you sign off on it.",
      },
      {
        q: "Can I keep human approval in the workflow?",
        a: "Yes, and in plenty of workflows you should. Any step can be set to wait for a person: an outgoing e-mail, a quote above a certain amount, anything that touches a client relationship. We decide together where the automation stops and your judgment starts, and that line can move once you see the system running.",
      },
      {
        q: "How much does it cost?",
        a: "There is no fixed price list for a build, because no two workflows are the same. The investment follows the complexity of the workflow and the number of systems it has to reach. The first call is free. A full workflow audit is paid, at a price we agree before it starts, and you get a defined scope and price before anything is built, so there are no surprises halfway through.",
      },
      {
        q: "How long does implementation take?",
        a: "It depends on the workflow. For one well-defined process you should think in weeks; a chain of connected processes takes longer, and older or closed systems are what stretch the timing most. After the audit you get a concrete timeline for your situation, before you commit to anything.",
      },
      {
        q: "What happens after implementation?",
        a: "We stay responsible for it. We monitor the workflow, fix what breaks, adjust it when your process changes, and extend it when a new step becomes worth automating. You are not left holding a system that nobody in your business understands.",
      },
      {
        q: "What if my workflow is very specific?",
        a: "Specific is the norm, not the exception. Two businesses that look identical on paper run completely differently in practice. The audit exists precisely to map your version, including the exceptions and the edge cases most tools quietly ignore. The more specific the workflow, the more there is to gain by automating the repetitive work around it.",
      },
    ],
  },
  statement: {
    eyebrow: "The whole idea",
    bigPlain: "Your business already has workflows.",
    bigSerif: "We make more of them run automatically.",
    triad: [
      { plain: "AI agents are", strong: "the engine" },
      { plain: "Workflow automation is", strong: "the product" },
      { plain: "Your time is", strong: "the outcome" },
    ],
  },
  cta: {
    eyebrow: "Free intro call",
    titlePlain: "Give us your workflow.",
    titleSerif: "We’ll build the system that runs it.",
    sub: "Bring us one workflow that takes too much of your time. In thirty minutes we’ll tell you what could be automated, what should stay human, and whether it is worth your money. No charge for that conversation.",
    button: "Book your free intro call",
    mailHref: "mailto:j.guzman@midnightspaceconsultancy.com?subject=Intro%20call%20workflow%20automation",
    mailLead: "Or e-mail us directly:",
    mailAddress: "j.guzman@midnightspaceconsultancy.com",
  },
  footer: {
    aria: "Footer",
    links: [
      { href: "#who", label: "Who it’s for" },
      { href: "#how", label: "How it works" },
      { href: "#workflows", label: "Workflows" },
      { href: "#approach", label: "Approach" },
      { href: "#audit", label: "Audit" },
      { href: "#roi", label: "ROI" },
      { href: "#faq", label: "FAQ" },
      { href: "#contact", label: "Contact" },
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
      { href: "#who", label: "Voor wie" },
      { href: "#how", label: "Hoe het werkt" },
      { href: "#workflows", label: "Workflows" },
      { href: "#approach", label: "Aanpak" },
      { href: "#audit", label: "Audit" },
      { href: "#faq", label: "FAQ" },
    ],
    cta: "Plan een gratis kennismaking",
    menuOpen: "Menu openen",
    menuClose: "Menu sluiten",
  },
  hero: {
    eyebrow: "AI-gedreven workflowautomatisering",
    h1Plain: "Maak van repetitief werk",
    h1Serif: "geautomatiseerde workflows.",
    lede: "Voor ondernemers en kleine bedrijven: wij ontwerpen en bouwen geautomatiseerde workflows die repetitieve administratie van je overnemen, zonder de tools te vervangen die je al gebruikt.",
    ctaPrimary: "Plan een gratis kennismaking",
    ctaSecondary: "Bekijk hoe het werkt",
    note: "Breng ons één workflow. Dertig minuten, en een eerlijk antwoord over wat de moeite loont.",
    flowName: "workflow / lead-intake",
    flowStatus: "actief",
    flowAria: "Voorbeeldworkflow: een trigger loopt via drie AI-agents naar een actie",
    roleTrigger: "Trigger",
    roleAgent: "AI-agent",
    roleAction: "Actie",
    trigger: "Nieuwe lead komt binnen",
    agents: ["Research", "Communicatie", "CRM-update"],
    action: "Opvolging verstuurd, afspraak gepland",
    scene3dAria:
      "Driedimensionale weergave van dezelfde workflow: links komt een nieuwe lead binnen, die loopt door drie AI-agents en gaat er rechts weer uit als een verstuurde opvolging en een geplande afspraak.",
  },
  story: {
    aria: "Geanimeerd verhaal: losse taken wachten eerst allemaal op één persoon, worden daarna in kaart gebracht als een geordende workflow, worden een lopend systeem met één menselijke beslisstap, en komen tot rust als een stil draaiende machine die de week teruggeeft.",
    chapters: [
      {
        id: "bottleneck",
        kicker: "Vandaag",
        title: "Alles loopt nog altijd via jou.",
        body: "Er komt een lead binnen. Jij zoekt op, jij schrijft het antwoord, jij werkt het CRM bij, jij zet de herinnering. Vier stops, en elke stop wacht op dezelfde persoon: jij.",
      },
      {
        id: "mapping",
        kicker: "Stap één",
        title: "Eerst brengen we in kaart hoe het werk echt beweegt.",
        body: "Niet de technologie: de workflow. We volgen één proces door je bedrijf, zoeken de stappen die elke week terugkeren, en markeren waar een beslissing echt een mens nodig heeft.",
      },
      {
        id: "machine",
        kicker: "Stap twee",
        title: "Dan bouwen we het systeem dat hem uitvoert.",
        body: "Verbonden met de tools die je al gebruikt. Een lead komt binnen, wordt onderzocht, beantwoord en verwerkt, en de keten blijft vanzelf lopen. De gouden stap is van jou: het systeem haalt je er alleen bij waar jouw oordeel telt.",
      },
      {
        id: "payoff",
        kicker: "Het resultaat",
        title: "De workflow blijft draaien. Jouw week komt terug.",
        body: "AI-agents zijn de motor. Workflowautomatisering is het product. Jouw tijd is het resultaat.",
      },
    ],
    ctaButton: "Plan een gratis kennismaking",
  },
  whoFor: {
    eyebrow: "Voor wie",
    h2: "Gemaakt voor bedrijven waar nog te veel van jou afhangt.",
    lede: "Draait je bedrijf op e-mails, leads, documenten, spreadsheets en repetitieve administratie? Dan zit er wellicht een workflow tussen die de moeite loont om te automatiseren.",
    audiences: [
      {
        name: "Consultants en adviseurs",
        note: "Offertes, opvolging en verslagen die allemaal op dezelfde persoon wachten.",
      },
      {
        name: "Bureaus en studio’s",
        note: "Briefings die binnenkomen, statusupdates die eruit moeten, en elke maand opnieuw rapporteren.",
      },
      {
        name: "Dienstenbedrijven",
        note: "Offertes, planning, facturen en alle herinneringen daartussen.",
      },
      {
        name: "Salesteams",
        note: "Research, kwalificatie en CRM-hygiëne, nog voor er één gesprek plaatsvindt.",
      },
      {
        name: "Zelfstandige professionals",
        note: "Jij bent tegelijk de uitvoering en de administratie.",
      },
    ],
    note: "Niet zeker of jij hierin past? Daar dient de audit net voor.",
  },
  positioning: {
    eyebrow: "Positionering",
    h2: "AI is niet het product. Jouw workflow wel.",
    lead: "Je hebt geen zoveelste AI-tool nodig. Je wil dat het werk dat er al is, met minder handwerk gebeurt.",
    quote:
      "“Het knelpunt is zelden het werk zelf. Het is alles wat je eromheen moet doen.”",
    pullLine1: "We vertrekken niet vanuit de AI.",
    pullLine2: "We vertrekken vanuit jouw workflow.",
    paragraphs: [
      "Je hebt al tools. Misschien een AI-assistent, een leadformulier, een planningstool. En toch beweegt het werk pas als jij beweegt: jij kopieert de gegevens over, jij schrijft het antwoord, jij werkt het CRM bij, jij zet de herinnering.",
      "Dat is niet de automatisering waar je op zoek naar was. Jij bent nog altijd degene die alles aan elkaar knoopt.",
      "Daarom vertrekken we vanuit je workflow, niet vanuit de technologie. We brengen in kaart hoe het werk echt door je bedrijf loopt, zoeken de stappen die elke week terugkeren, en bouwen een systeem dat ze uitvoert. Jij komt alleen tussen waar je oordeel telt.",
    ],
  },
  beforeAfter: {
    eyebrow: "Voor / na",
    h2: "Van handmatig werk naar geautomatiseerde workflows",
    lede: "Dezelfde lead. Hetzelfde resultaat. Een compleet andere week.",
    beforeTag: "Voor · alles op jouw bord",
    beforeChain: [
      { label: "Nieuwe lead", kind: "trigger" },
      { label: "Jij", kind: "human" },
      { label: "Research", kind: "system" },
      { label: "Jij", kind: "human" },
      { label: "E-mail", kind: "system" },
      { label: "Jij", kind: "human" },
      { label: "CRM", kind: "system" },
      { label: "Jij", kind: "human" },
      { label: "Opvolging", kind: "end" },
    ],
    beforeFootnote:
      "Eén lead, en vier keer valt alles stil tot jij tijd hebt. Elke stop onderbreekt het werk dat je vandaag echt gepland had.",
    afterTag: "Na · één geautomatiseerde workflow",
    afterChain: [
      { label: "Nieuwe lead", kind: "trigger" },
      { label: "Research Agent", kind: "agent" },
      { label: "Qualification Agent", kind: "agent" },
      { label: "Communication Agent", kind: "agent" },
      { label: "CRM", kind: "system" },
      { label: "Jij", kind: "human" },
    ],
    afterFootnote:
      "De keten loopt door zonder jou. Jij krijgt het resultaat, en alleen een melding wanneer er echt iemand moet beslissen.",
    closingLine: "Jij komt alleen tussen wanneer je oordeel ertoe doet.",
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
        outcome:
          "Beoogd resultaat: minder handmatige overdrachten, sneller een eerste antwoord, en CRM-data die klopt.",
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
        outcome:
          "Beoogd resultaat: consistentere opvolging, minder prospects die koud worden, minder tijd kwijt aan research.",
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
        outcome:
          "Beoogd resultaat: een lichtere inbox, snellere antwoorden, en niets belangrijks dat ondersneeuwt.",
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
        outcome:
          "Beoogd resultaat: minder overtypen, minder fouten in de data, en rapporten die klaar zijn wanneer je ze nodig hebt.",
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
        outcome:
          "Beoogd resultaat: routinevragen sneller beantwoord, en je team vrij voor de vragen waar echt iemand voor nodig is.",
      },
    ],
    legend: {
      trigger: "Trigger",
      ai: "AI-agent",
      human: "Menselijke tussenkomst",
      outcome: "Resultaat",
    },
    note: "Dit zijn voorbeelden, geen menukaart. Elke workflow wordt in kaart gebracht, ontworpen en gebouwd rond hoe jouw bedrijf echt werkt.",
  },
  approach: {
    eyebrow: "Onze aanpak",
    h2: "Jij brengt de workflow. Wij doen de rest.",
    lede: "Geen advies dat je zelf nog moet uitvoeren, en geen tool die je zelf moet uitzoeken. Wij brengen je workflow in kaart, ontwerpen en bouwen hem, koppelen hem aan je systemen en houden hem draaiend: één aanspreekbare partner van begin tot eind.",
    pipeline: ["Audit", "Ontwerp", "Bouw", "Integratie", "Onderhoud"],
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
        body: "We zoeken de processen met het grootste automatiseringspotentieel: repetitieve taken, handmatige data-invoer, bottlenecks en stappen die voorspelbaar genoeg zijn om te systematiseren.",
      },
      {
        num: "03",
        name: "Ontwerpen",
        title: "We ontwerpen jouw AI-workflow.",
        body: "We bepalen welke agents, systemen en integraties nodig zijn, en waar mensen precies betrokken blijven.",
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
  audit: {
    eyebrow: "Hoe je start",
    h2: "Eerst een gratis gesprek. De volledige audit alleen als het de moeite is.",
    lede: "We starten met één gesprek over één workflow. Als een volledige audit daarna zinvol is, is dat betaald werk en ken je de prijs voor we beginnen. Je hoeft niets voor te bereiden.",
    steps: [
      {
        num: "01",
        title: "Kies één workflow",
        body: "Jij kiest het proces dat de meeste tijd opslokt. Leadopvolging, offertes, onboarding, rapportering: waar je op maandagochtend het minst zin in hebt.",
      },
      {
        num: "02",
        title: "We bespreken hem, gratis",
        body: "Dertig minuten. We lopen door wat hem in gang zet, wie er aan te pas komt, door welke systemen hij loopt en waar hij blijft hangen. Je krijgt een eerlijk antwoord of automatiseren voor jou de moeite loont.",
      },
      {
        num: "03",
        title: "De volledige audit, als je wil",
        body: "Tot drie processen grondig in kaart, met een schriftelijke analyse van waar de tijd verloren gaat, wat menselijk moet blijven en wat automatiseren echt vraagt. Betaald werk, aan een prijs die vooraf vastligt.",
      },
      {
        num: "04",
        title: "Bouwen, of niet",
        body: "De schriftelijke analyse is hoe dan ook van jou. Wil je de eerste automatisering laten bouwen, dan krijg je een afgebakende scope en prijs voor er iets aangeraakt wordt.",
      },
    ],
    note: "Het eerste gesprek kost niets en verplicht je tot niets. Alles daarna heeft een prijs die je vooraf afspreekt.",
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
    resultLabel: "Geschatte kost van handmatig werk",
    perYear: "/ jaar",
    subBefore: "Dat is ongeveer",
    hoursWord: "uur",
    subAfter: "repetitief werk per jaar, op basis van 46 werkweken.",
    caveat:
      "Niet al dat werk kan of moet geautomatiseerd worden. Dat is precies wat de workflow-audit uitwijst.",
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
        title: "Van strategie tot implementatie",
        body: "We geven je geen rapport dat je daarna zelf mag uitvoeren. We ontwerpen de workflow, bouwen hem, koppelen hem aan je systemen en blijven hem samen met jou verfijnen.",
      },
      {
        title: "Workflow-first",
        body: "We vertrekken vanuit het probleem, niet vanuit de technologie. De tools volgen uit de workflow, nooit omgekeerd.",
      },
      {
        title: "Gebouwd rond jouw bedrijf",
        body: "Geen one-size-fits-all automatisering. Elk systeem wordt ontworpen voor hoe jouw bedrijf echt werkt.",
      },
      {
        title: "Hou de tools die je al gebruikt",
        body: "Je blijft werken waar je al werkt. We koppelen de automatisering aan je CRM, e-mail, agenda, boekhouding en interne tools in plaats van ze te vervangen.",
      },
      {
        title: "Menselijk waar het telt",
        body: "AI handelt de routine af. Mensen blijven betrokken waar menselijk oordeel, relaties of creativiteit het verschil maken.",
      },
      {
        title: "Continue verbetering",
        body: "Je workflows blijven evolueren na de lancering. Eén aanspreekbare partner blijft ze verfijnen en bouwt er nieuwe bij naarmate je bedrijf groeit.",
      },
    ],
  },
  trust: {
    eyebrow: "Hoe we werken",
    h2: "Samen met jou gebouwd. Niet achter je rug.",
    lede: "We werken rechtstreeks met ondernemers om te begrijpen hoe hun bedrijf echt draait. Geen black-box-automatisering, geen overbodige complexiteit, gewoon workflows die passen bij hoe jij werkt.",
    principles: [
      {
        title: "We automatiseren niet alles",
        body: "Sommige stappen blijven beter menselijk, en we zeggen je welke. We automatiseren wat zinvol is en ontwerpen de workflow rond de stappen waar een mens voor nodig is.",
      },
      {
        title: "Je ziet het volledige systeem",
        body: "Voor er iets live gaat, zie je welke systemen de workflow raakt, welke gegevens tussen die systemen bewegen en wat je omgeving verlaat.",
      },
      {
        title: "Eén aanspreekbare partner",
        body: "Dezelfde mensen doen de audit, bouwen de workflow en onderhouden hem. Niets wordt doorgeschoven naar iemand die er niet bij was.",
      },
    ],
    founderLine: "Agora wordt gerund door Noa en Jordan.",
    founderBody:
      "We zijn een klein team, dus de mensen met wie je praat zijn ook de mensen die je workflows bouwen. Dat betekent ook dat we eerlijk zijn over de scope: valt iets buiten wat we goed kunnen, dan zeggen we dat in plaats van het werk aan te nemen.",
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
        q: "Vervangt AI mijn medewerkers?",
        a: "Nee. Het doel is repetitief werk weghalen, geen mensen. De workflow neemt het kopiëren, controleren en opnieuw invoeren over, zodat je team zijn uren besteedt aan werk dat oordeel, relaties en expertise vraagt. Als een automatisering pas rendeert door in je team te snijden, zeggen we dat hardop in plaats van ze aan je te verkopen.",
      },
      {
        q: "Moet ik mijn huidige software vervangen?",
        a: "Bijna nooit, en dat is net het punt. We koppelen de workflow aan de systemen die je al hebt: je CRM, mailbox, agenda, boekhoudpakket en interne tools. Kan iets echt niet gekoppeld worden, dan hoor je dat tijdens de audit, niet halverwege de bouw.",
      },
      {
        q: "Wat gebeurt er met mijn bedrijfsgegevens?",
        a: "We houden dit concreet in plaats van te beloven dat alles zomaar veilig is. Toegangsrechten worden per systeem en per agent ingesteld, zodat elk onderdeel van de workflow alleen bij de data kan die het nodig heeft. Data gaat alleen naar een AI-model wanneer die stap in de workflow dat nodig heeft, en we spreken vooraf af welke gegevens waar verwerkt mogen worden. Voor er iets live gaat, krijg je een overzicht van elk systeem dat de workflow raakt en van alles wat je omgeving verlaat, en jij geeft daar je akkoord voor.",
      },
      {
        q: "Kan ik menselijke goedkeuring in de workflow houden?",
        a: "Ja, en in veel workflows hoor je dat ook te doen. Elke stap kan ingesteld worden om op een mens te wachten: een uitgaande e-mail, een offerte boven een bepaald bedrag, alles wat aan een klantrelatie raakt. Samen beslissen we waar de automatisering stopt en jouw oordeel begint, en die lijn kan verschuiven zodra je het systeem ziet draaien.",
      },
      {
        q: "Wat kost het?",
        a: "Er is geen vaste prijslijst voor een bouwtraject, omdat geen twee workflows hetzelfde zijn. De investering volgt de complexiteit van de workflow en het aantal systemen waaraan hij gekoppeld moet worden. Het eerste gesprek is gratis. Een volledige workflow-audit is betaald, aan een prijs die we vooraf afspreken, en je krijgt een afgebakende scope en prijs voor er iets gebouwd wordt, dus geen verrassingen halverwege.",
      },
      {
        q: "Hoelang duurt een implementatie?",
        a: "Dat hangt af van de workflow. Voor één afgebakend proces reken je in weken; een keten van verbonden processen duurt langer, en oudere of gesloten systemen zijn wat de timing het meest oprekt. Na de audit krijg je een concrete timing voor jouw situatie, voor je je ergens aan vastlegt.",
      },
      {
        q: "Wat gebeurt er na de implementatie?",
        a: "We blijven er verantwoordelijk voor. We monitoren de workflow, herstellen wat stukgaat, passen hem aan wanneer je proces verandert, en breiden hem uit zodra een nieuwe stap de moeite loont. Je blijft niet achter met een systeem dat niemand in je bedrijf begrijpt.",
      },
      {
        q: "Wat als mijn workflow heel specifiek is?",
        a: "Specifiek is de regel, niet de uitzondering. Twee bedrijven die op papier identiek lijken, draaien in de praktijk compleet anders. De audit bestaat net om jouw versie in kaart te brengen, inclusief de uitzonderingen en de randgevallen die de meeste tools stilzwijgend negeren. Hoe specifieker de workflow, hoe meer er te winnen valt door het repetitieve werk eromheen te automatiseren.",
      },
    ],
  },
  statement: {
    eyebrow: "Het hele idee",
    bigPlain: "Je bedrijf heeft al workflows.",
    bigSerif: "Wij zorgen dat er meer automatisch draaien.",
    triad: [
      { plain: "AI-agents zijn", strong: "de motor" },
      { plain: "Workflowautomatisering is", strong: "het product" },
      { plain: "Jouw tijd is", strong: "het resultaat" },
    ],
  },
  cta: {
    eyebrow: "Gratis kennismaking",
    titlePlain: "Geef ons je workflow.",
    titleSerif: "Wij bouwen het systeem dat hem voor je uitvoert.",
    sub: "Breng ons één workflow die te veel van je tijd opslokt. In dertig minuten zeggen we je wat geautomatiseerd kan worden, wat menselijk moet blijven en of het je geld waard is. Dat gesprek kost je niets.",
    button: "Plan je gratis kennismaking",
    mailHref: "mailto:j.guzman@midnightspaceconsultancy.com?subject=Kennismaking%20workflowautomatisering",
    mailLead: "Of mail ons rechtstreeks:",
    mailAddress: "j.guzman@midnightspaceconsultancy.com",
  },
  footer: {
    aria: "Voettekst",
    links: [
      { href: "#who", label: "Voor wie" },
      { href: "#how", label: "Hoe het werkt" },
      { href: "#workflows", label: "Workflows" },
      { href: "#approach", label: "Aanpak" },
      { href: "#audit", label: "Audit" },
      { href: "#roi", label: "ROI" },
      { href: "#faq", label: "FAQ" },
      { href: "#contact", label: "Contact" },
    ],
    legalLeft: "© 2026 Agora. AI-gedreven workflowautomatisering.",
    legalRight: "Ontdek je automatiseringskansen.",
  },
};
