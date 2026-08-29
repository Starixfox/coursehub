/**
 * All user-visible copy for the marketing site, in English and Dutch.
 * The page structure lives in marketing-page.tsx; only words live here.
 */

export type Lang = "en" | "nl";

export type StepKind = "start" | "ai" | "human" | "end";

/** Node roles used by the before / after chain comparison. */
export type ChainKind = "trigger" | "human" | "agent" | "system" | "end";

export type ChainNode = { label: string; kind: ChainKind };

/** Row roles inside the fake application window of the workflows panel. */
export type RunStepKind = "trigger" | "ai" | "human" | "system" | "end";

/** A value in the fake application window. Rendered differently per type:
 *  text = plain, duration = mono tabular, tool = swatch + underline,
 *  code = bordered periwinkle mono pill. */
export type RunField =
  | { type: "text"; value: string }
  | { type: "duration"; value: string }
  | { type: "tool"; value: string }
  | { type: "code"; value: string };

/** One row of the run list inside the fake application window.
 *
 *  `detail` is the plain-language explanation of the mechanic, written for a
 *  business owner who has never seen the workflow. It answers "what does this
 *  step actually do", not "why is this good". One short sentence, no jargon,
 *  no claims about results. The position number shown next to it (01 to 06) is
 *  derived from the array index in workflow-tabs.tsx and is deliberately not
 *  stored here, so it can never drift out of order. */
export type RunStep = {
  label: string;
  kind: RunStepKind;
  duration: string;
  detail: string;
};

export type WorkflowRun = {
  /** Titlebar name, e.g. "Lead intake to CRM" */
  name: string;
  /** Titlebar meta describing the workflow's shape, not a live run state.
   *  e.g. "6 steps, 1 for you". Never a present-tense status word: the panel
   *  is an illustration and must not read as telemetry from a live system. */
  meta: string;
  /** Exactly 6 rows. Exactly one of them has kind "human". */
  runSteps: RunStep[];
  /** 1-based position of the step the illustration is sitting on. Rows before
   *  it render as completed, rows after it as pending. This MUST agree with the
   *  "Current step" tile in the bento below, which states the same position in
   *  words: change one and you change the other. */
  currentStep: number;
  /** Exactly 5 rows. */
  kv: { label: string; value: RunField }[];
  bento: {
    /** The one tinted tile. Two short sentences maximum. */
    summary: { label: string; body: string };
    /** Exactly 4 tiles: trigger, cadence, connection, current step. */
    tiles: { label: string; value: RunField }[];
  };
};

export type WorkflowCopy = {
  key: string;
  tab: string;
  title: string;
  subtitle: string;
  steps: { label: string; kind: StepKind }[];
  /** Qualitative outcome line. No numbers, no invented results. */
  outcome: string;
  /** The fake application window shown in the workflows panel. */
  run: WorkflowRun;
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
    /** The hero stat bar. Exactly three, and every one of them has to be a
     *  fact about how the work is done, never a result. There are no client
     *  results to quote and inventing one would be the single worst thing on
     *  this site. "0 tools replaced" is the strongest entry precisely because
     *  it is a boast about an absence. */
    stats: { value: string; label: string }[];
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
    /** Badge printed inside the run panel titlebar on every tab. The panel is
     *  a designed illustration, not a system running for a client, and the
     *  frame has to say so without needing hover, scroll or context. One
     *  string per locale rather than a WorkflowRun field: it is the same
     *  statement about all five panels, so it should exist once. */
    runLabel: string;
    items: WorkflowCopy[];
    legend: { trigger: string; ai: string; human: string; outcome: string };
    note: string;
  };
  approach: {
    eyebrow: string;
    h2: string;
    lede: string;
    pipeline: string[];
    steps: {
      num: string;
      name: string;
      title: string;
      body: string;
      /** Two or three concrete deliverables this step hands over. */
      outputs: string[];
    }[];
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
    /** Exactly 3 category names, in rail display order. */
    groups: string[];
    /** Every item's group must be one of faq.groups. */
    items: { q: string; a: string; group: string }[];
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
    stats: [
      { value: "0", label: "Tools replaced" },
      { value: "1", label: "Step stays yours" },
      { value: "30", label: "Minutes, free" },
    ],
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
        title: "The work keeps arriving faster than you can clear it.",
        body: "Leads, e-mails, quotes and follow-ups all land in the same queue, and that queue is you. Every one of them sits there until you get to it.",
      },
      {
        id: "mapping",
        kicker: "Step one",
        title: "First we map every step, then we design the workflow around it.",
        body: "We follow one process from end to end: what sets it off, who touches it, which systems it passes through. Only then do we decide what a machine can carry and what stays yours.",
      },
      {
        id: "machine",
        kicker: "Step two",
        title: "The workflow runs on its own, with you still in the loop.",
        body: "It connects to the tools you already use and keeps moving without waiting for you. The gold step is the one place it stops, because that decision is yours.",
      },
      {
        id: "payoff",
        kicker: "The outcome",
        title: "Your work keeps getting done without you doing it.",
        body: "The routine part runs whether you are at your desk, with a client, or away for the week. What is left on your plate is the work only you can do.",
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
    runLabel: "Example run",
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
        run: {
          name: "Lead intake to CRM",
          meta: "6 steps, 1 for you",
          currentStep: 6,
          runSteps: [
            {
              label: "Website form submitted",
              kind: "trigger",
              duration: "0.2s",
              detail: "Someone fills in the contact form on your site, and that starts the run.",
            },
            {
              label: "Check for a matching contact",
              kind: "system",
              duration: "0.4s",
              detail: "The workflow looks in your CRM to see whether this person is already known.",
            },
            {
              label: "Enrich company details",
              kind: "ai",
              duration: "3.8s",
              detail: "It looks up the company behind the e-mail address and adds what it finds.",
            },
            {
              label: "Score the lead and draft a reply",
              kind: "ai",
              duration: "7.4s",
              detail: "It weighs the lead against your criteria and writes a reply for you to read.",
            },
            {
              label: "You approve the reply",
              kind: "human",
              duration: "4m 12s",
              detail: "Nothing is sent until you have read that draft and given the go-ahead.",
            },
            {
              label: "Send the reply, log the contact",
              kind: "end",
              duration: "1.1s",
              detail: "The reply goes out and the contact lands in your CRM with the notes attached.",
            },
          ],
          kv: [
            { label: "Endpoint", value: { type: "code", value: "POST /hooks/lead-intake" } },
            { label: "Source", value: { type: "text", value: "Website contact form" } },
            { label: "CRM", value: { type: "tool", value: "Teamleader" } },
            { label: "Reply from", value: { type: "tool", value: "Gmail" } },
            { label: "Run time", value: { type: "duration", value: "4m 25s" } },
          ],
          bento: {
            summary: {
              label: "Summary",
              body: "When the lead fits your criteria and no contact exists yet, the workflow creates one. The reply goes out unchanged once you approve it, with the enrichment notes kept on the contact.",
            },
            tiles: [
              { label: "Trigger", value: { type: "text", value: "Website form submission" } },
              { label: "Cadence", value: { type: "text", value: "On every new entry" } },
              { label: "Connection", value: { type: "tool", value: "Teamleader" } },
              { label: "Current step", value: { type: "text", value: "Step 6 of 6, writing to the CRM" } },
            ],
          },
        },
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
        run: {
          name: "Outreach to booked meeting",
          meta: "6 steps, 1 for you",
          currentStep: 6,
          runSteps: [
            {
              label: "Weekly prospect list opens",
              kind: "trigger",
              duration: "0.3s",
              detail: "On weekday mornings the workflow opens the list of accounts to approach.",
            },
            {
              label: "Research each account",
              kind: "ai",
              duration: "11s",
              detail: "It reads up on every company, so the message is not a generic template.",
            },
            {
              label: "You pick who gets contacted",
              kind: "human",
              duration: "6m 38s",
              detail: "You see the list first and decide which accounts are worth an e-mail.",
            },
            {
              label: "Draft personalized e-mails",
              kind: "ai",
              duration: "5.9s",
              detail: "For every account you kept, it writes one e-mail based on that research.",
            },
            {
              label: "Send and set follow-up dates",
              kind: "system",
              duration: "2.2s",
              detail: "The e-mails leave, and each one gets a reminder set for a week later.",
            },
            {
              label: "Log the sequence in the CRM",
              kind: "end",
              duration: "0.8s",
              detail: "Everything that was sent is written to the CRM, so nothing stays in your head.",
            },
          ],
          kv: [
            { label: "Schedule", value: { type: "code", value: "0 8 * * 1-5" } },
            { label: "Batch", value: { type: "text", value: "12 accounts queued" } },
            { label: "Calendar", value: { type: "tool", value: "Google Calendar" } },
            { label: "CRM", value: { type: "tool", value: "HubSpot" } },
            { label: "Run time", value: { type: "duration", value: "6m 58s" } },
          ],
          bento: {
            summary: {
              label: "Summary",
              body: "Where an account matches work you have already won, the draft opens with that reference. Every e-mail leaves with a follow-up date seven days out and a slot held in your calendar.",
            },
            tiles: [
              { label: "Trigger", value: { type: "code", value: "0 8 * * 1-5" } },
              { label: "Cadence", value: { type: "text", value: "Weekday mornings, 08:00" } },
              { label: "Connection", value: { type: "tool", value: "HubSpot" } },
              { label: "Current step", value: { type: "text", value: "Step 6 of 6, logging the sequence" } },
            ],
          },
        },
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
        run: {
          name: "Inbox triage to reply",
          meta: "6 steps, the last one is yours",
          currentStep: 6,
          runSteps: [
            {
              label: "New e-mail in the shared inbox",
              kind: "trigger",
              duration: "0.1s",
              detail: "A message lands in the shared mailbox and the workflow picks it up.",
            },
            {
              label: "Classify the request",
              kind: "ai",
              duration: "1.3s",
              detail: "It works out what the message is about, for example a question about a quote.",
            },
            {
              label: "Pull the thread history",
              kind: "system",
              duration: "0.6s",
              detail: "It reads the earlier messages in the same conversation for context.",
            },
            {
              label: "Check the open quote in the CRM",
              kind: "ai",
              duration: "2.9s",
              detail: "It looks up what you already quoted this client, so the answer matches.",
            },
            {
              label: "Draft the reply",
              kind: "ai",
              duration: "4.7s",
              detail: "The reply is written from that thread and that quote, not from a template.",
            },
            {
              label: "You approve the reply",
              kind: "human",
              duration: "2m 40s",
              detail: "The draft waits in your inbox and only leaves when you say so.",
            },
          ],
          kv: [
            { label: "Watcher", value: { type: "code", value: "*/2 * * * *" } },
            { label: "Mailbox", value: { type: "tool", value: "Outlook" } },
            { label: "Category", value: { type: "text", value: "Quote follow-up" } },
            { label: "Thread", value: { type: "text", value: "4 messages, 1 attachment" } },
            { label: "Waiting since", value: { type: "duration", value: "2m 40s" } },
          ],
          bento: {
            summary: {
              label: "Summary",
              body: "The draft is built from the four messages in the thread and the open quote in your CRM. Nothing leaves the mailbox until you approve it.",
            },
            tiles: [
              { label: "Trigger", value: { type: "text", value: "New e-mail, shared inbox" } },
              { label: "Cadence", value: { type: "code", value: "*/2 * * * *" } },
              { label: "Connection", value: { type: "tool", value: "Outlook" } },
              { label: "Current step", value: { type: "text", value: "Step 6 of 6, waiting for you" } },
            ],
          },
        },
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
        run: {
          name: "Supplier invoice to bookkeeping",
          meta: "6 steps, 1 for you",
          currentStep: 6,
          runSteps: [
            {
              label: "Invoice arrives by e-mail",
              kind: "trigger",
              duration: "0.3s",
              detail: "A supplier sends an invoice to your mailbox, and the run starts there.",
            },
            {
              label: "Read the PDF",
              kind: "ai",
              duration: "5.2s",
              detail: "The amounts, the VAT and the invoice lines are read straight from the PDF.",
            },
            {
              label: "Match the purchase order",
              kind: "ai",
              duration: "1.8s",
              detail: "It searches for the order that belongs to it and flags any difference in price.",
            },
            {
              label: "You approve the amount",
              kind: "human",
              duration: "1m 47s",
              detail: "You see the invoice next to the order and confirm the amount is right.",
            },
            {
              label: "Book the invoice",
              kind: "system",
              duration: "3.4s",
              detail: "The invoice is entered in your accounting package on the right account.",
            },
            {
              label: "File the document, notify accounting",
              kind: "end",
              duration: "0.9s",
              detail: "The PDF is filed with the entry and your bookkeeper gets a short notice.",
            },
          ],
          kv: [
            { label: "Endpoint", value: { type: "code", value: "POST /hooks/invoice-in" } },
            { label: "Accounting", value: { type: "tool", value: "Exact Online" } },
            { label: "Document", value: { type: "text", value: "PDF, 2 pages" } },
            { label: "Match", value: { type: "text", value: "Purchase order found" } },
            { label: "Run time", value: { type: "duration", value: "1m 59s" } },
          ],
          bento: {
            summary: {
              label: "Summary",
              body: "The lines are read from the PDF and matched to an open purchase order, and any price difference is flagged before booking. Nothing reaches the supplier account until you approve the amount, and the original is filed with the entry.",
            },
            tiles: [
              { label: "Trigger", value: { type: "text", value: "Invoice in the mailbox" } },
              { label: "Cadence", value: { type: "text", value: "On every incoming invoice" } },
              { label: "Connection", value: { type: "tool", value: "Exact Online" } },
              { label: "Current step", value: { type: "text", value: "Step 6 of 6, filing the PDF" } },
            ],
          },
        },
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
        run: {
          name: "Customer question to answer",
          meta: "6 steps, 1 for you",
          currentStep: 6,
          runSteps: [
            {
              label: "Question arrives from the site",
              kind: "trigger",
              duration: "0.2s",
              detail: "A customer asks a question through the widget on your website.",
            },
            {
              label: "Classify and set priority",
              kind: "ai",
              duration: "1.1s",
              detail: "It sorts the question by subject and works out how urgent it is.",
            },
            {
              label: "Search the knowledge base",
              kind: "ai",
              duration: "2.4s",
              detail: "It goes through your own articles for the passages that answer this.",
            },
            {
              label: "Draft the answer with sources",
              kind: "ai",
              duration: "4.3s",
              detail: "An answer is written that links to the articles it was built from.",
            },
            {
              label: "You release the answer",
              kind: "human",
              duration: "58s",
              detail: "You read the answer once and decide whether it goes to the customer.",
            },
            {
              label: "Reply sent, ticket updated",
              kind: "end",
              duration: "1.2s",
              detail: "The customer gets the answer and the ticket closes with it saved.",
            },
          ],
          kv: [
            { label: "Endpoint", value: { type: "code", value: "POST /hooks/support-in" } },
            { label: "Channel", value: { type: "text", value: "Widget on your site" } },
            { label: "Helpdesk", value: { type: "tool", value: "Teamleader" } },
            { label: "Sources", value: { type: "text", value: "3 articles cited" } },
            { label: "Run time", value: { type: "duration", value: "1m 07s" } },
          ],
          bento: {
            summary: {
              label: "Summary",
              body: "The answer is built from the three articles the question matches in your knowledge base, and it links to all three. It goes out once you release it, and the ticket closes with that same answer saved as a new snippet.",
            },
            tiles: [
              { label: "Trigger", value: { type: "text", value: "Question from the website" } },
              { label: "Cadence", value: { type: "text", value: "On every incoming question" } },
              { label: "Connection", value: { type: "tool", value: "Teamleader" } },
              { label: "Current step", value: { type: "text", value: "Step 6 of 6, updating the ticket" } },
            ],
          },
        },
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
        outputs: ["Workflow map", "Tool and handoff inventory", "Notes on where the time goes"],
      },
      {
        num: "02",
        name: "Identify",
        title: "We find where time is being lost.",
        body: "We pinpoint the processes with the highest automation potential: repetitive tasks, manual data entry, bottlenecks, and steps that are predictable enough to systematize.",
        outputs: ["Priority shortlist", "Effort and impact estimate per process"],
      },
      {
        num: "03",
        name: "Design",
        title: "We design your AI workflow.",
        body: "We define which agents, systems and integrations are needed, and exactly where humans stay in the loop.",
        outputs: ["Workflow design", "List of approval points", "Data flow overview"],
      },
      {
        num: "04",
        name: "Implement",
        title: "We make it work in your business.",
        body: "We build the agent system and connect it to the software you already use: CRM, e-mail, calendar, accounting, Google Workspace or Microsoft 365.",
        outputs: ["Running workflow", "Connected systems", "Handover walkthrough"],
      },
      {
        num: "05",
        name: "Optimize",
        title: "We make it better over time.",
        body: "We monitor performance, test, improve, and extend workflows when it is relevant. An automation is never a one-off project.",
        outputs: ["Run log and failure alerts", "Improvement backlog"],
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
    groups: ["Your team and your tools", "Data and control", "Scope, cost and what comes after"],
    items: [
      {
        group: "Your team and your tools",
        q: "Will AI replace my employees?",
        a: "No. The goal is to remove repetitive work, not people. The workflow takes over the copying, checking and re-entering, so your team spends its hours on the work that needs judgment, relationships and expertise. If an automation only pays off by cutting your team, we will say that out loud rather than sell it to you.",
      },
      {
        group: "Your team and your tools",
        q: "Do I need to replace my existing software?",
        a: "Almost never, and that is the point. We connect the workflow to the systems you already have: your CRM, mailbox, calendar, accounting package and internal tools. If something genuinely cannot be connected, you hear it during the audit, not halfway through a build.",
      },
      {
        group: "Data and control",
        q: "What happens to my business data?",
        a: "We keep this concrete instead of promising that everything is simply safe. Access rights are set per system and per agent, so each part of the workflow can only reach the data it needs. Data only goes to an AI model where that step of the workflow requires it, and we agree up front which data may be processed where. Before anything goes live, you get an overview of every system the workflow touches and everything that leaves your environment, and you sign off on it.",
      },
      {
        group: "Data and control",
        q: "Can I keep human approval in the workflow?",
        a: "Yes, and in plenty of workflows you should. Any step can be set to wait for a person: an outgoing e-mail, a quote above a certain amount, anything that touches a client relationship. We decide together where the automation stops and your judgment starts, and that line can move once you see the system running.",
      },
      {
        group: "Scope, cost and what comes after",
        q: "How much does it cost?",
        a: "There is no fixed price list for a build, because no two workflows are the same. The investment follows the complexity of the workflow and the number of systems it has to reach. The first call is free. A full workflow audit is paid, at a price we agree before it starts, and you get a defined scope and price before anything is built, so there are no surprises halfway through.",
      },
      {
        group: "Scope, cost and what comes after",
        q: "How long does implementation take?",
        a: "It depends on the workflow. For one well-defined process you should think in weeks; a chain of connected processes takes longer, and older or closed systems are what stretch the timing most. After the audit you get a concrete timeline for your situation, before you commit to anything.",
      },
      {
        group: "Scope, cost and what comes after",
        q: "What happens after implementation?",
        a: "We stay responsible for it. We monitor the workflow, fix what breaks, adjust it when your process changes, and extend it when a new step becomes worth automating. You are not left holding a system that nobody in your business understands.",
      },
      {
        group: "Scope, cost and what comes after",
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
    /* The gold span is deliberately short. When it carried the whole second
       sentence, the closing CTA measured 37 percent gold of its lit pixels,
       eight times the hero, which made the last frame on the page louder than
       the signature one. Gold marks the promise, it does not deliver it. */
    titlePlain: "Give us your workflow. We’ll build the system that",
    titleSerif: "runs it.",
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
    h1Plain: "Zet repetitief werk om in",
    h1Serif: "geautomatiseerde workflows.",
    lede: "Voor ondernemers en kleine bedrijven: wij ontwerpen en bouwen geautomatiseerde workflows die repetitieve administratie van je overnemen, zonder de tools te vervangen die je al gebruikt.",
    ctaPrimary: "Plan een gratis kennismaking",
    ctaSecondary: "Bekijk hoe het werkt",
    note: "Breng ons één workflow. Dertig minuten, en een eerlijk antwoord over wat de moeite loont.",
    stats: [
      { value: "0", label: "Tools vervangen" },
      { value: "1", label: "Stap blijft van jou" },
      { value: "30", label: "Minuten, gratis" },
    ],
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
        title: "Het werk blijft sneller binnenkomen dan je het wegwerkt.",
        body: "Leads, mails, offertes en opvolging komen allemaal in dezelfde wachtrij terecht, en die wachtrij ben jij. Alles blijft liggen tot jij eraan toe komt.",
      },
      {
        id: "mapping",
        kicker: "Stap een",
        title: "Eerst brengen we elke stap in kaart, daarna bouwen we de workflow eromheen.",
        body: "We volgen één proces van begin tot eind: wat het in gang zet, wie eraan te pas komt, door welke systemen het loopt. Pas daarna beslissen we wat een machine mag dragen en wat van jou blijft.",
      },
      {
        id: "machine",
        kicker: "Stap twee",
        title: "De workflow draait vanzelf, met jou nog steeds in de lus.",
        body: "Hij is gekoppeld aan de tools die je al gebruikt en loopt door zonder op jou te wachten. De gouden stap is de enige plek waar hij stopt, want die beslissing is van jou.",
      },
      {
        id: "payoff",
        kicker: "Het resultaat",
        title: "Je werk gebeurt gewoon door, zonder dat jij het doet.",
        body: "Het routinewerk loopt door of je nu aan je bureau zit, bij een klant bent of een week weg bent. Wat op je bord blijft liggen, is het werk dat alleen jij kan doen.",
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
    runLabel: "Voorbeeldrun",
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
        run: {
          name: "Leadintake naar CRM",
          meta: "6 stappen, 1 voor jou",
          currentStep: 6,
          runSteps: [
            {
              label: "Formulier ingediend op je site",
              kind: "trigger",
              duration: "0,2s",
              detail: "Iemand vult het contactformulier op je site in, en daarmee start de run.",
            },
            {
              label: "Zoeken naar een bestaand contact",
              kind: "system",
              duration: "0,4s",
              detail: "De workflow kijkt in je CRM of deze persoon er al in staat.",
            },
            {
              label: "Bedrijfsgegevens aanvullen",
              kind: "ai",
              duration: "3,8s",
              detail: "Hij zoekt het bedrijf achter het mailadres op en vult aan wat hij vindt.",
            },
            {
              label: "Lead scoren en antwoord opstellen",
              kind: "ai",
              duration: "7,4s",
              detail: "Hij weegt de lead af tegen je criteria en schrijft een antwoord dat jij nog leest.",
            },
            {
              label: "Jij keurt het antwoord goed",
              kind: "human",
              duration: "4m 12s",
              detail: "Er vertrekt niets tot jij dat ontwerp gelezen en goedgekeurd hebt.",
            },
            {
              label: "Antwoord versturen, contact loggen",
              kind: "end",
              duration: "1,1s",
              detail: "Het antwoord vertrekt en het contact komt in je CRM met de notities erbij.",
            },
          ],
          kv: [
            { label: "Endpoint", value: { type: "code", value: "POST /hooks/lead-intake" } },
            { label: "Bron", value: { type: "text", value: "Contactformulier website" } },
            { label: "CRM", value: { type: "tool", value: "Teamleader" } },
            { label: "Antwoord via", value: { type: "tool", value: "Gmail" } },
            { label: "Looptijd", value: { type: "duration", value: "4m 25s" } },
          ],
          bento: {
            summary: {
              label: "Samenvatting",
              body: "Past de lead binnen je criteria en staat die nog niet in het CRM, dan maakt de workflow een nieuw contact aan. Het antwoord vertrekt ongewijzigd zodra jij goedkeurt, met de opgezochte bedrijfsgegevens bij het contact.",
            },
            tiles: [
              { label: "Trigger", value: { type: "text", value: "Formulierinzending" } },
              { label: "Ritme", value: { type: "text", value: "Bij elke nieuwe inzending" } },
              { label: "Koppeling", value: { type: "tool", value: "Teamleader" } },
              { label: "Huidige stap", value: { type: "text", value: "Stap 6 van 6, wegschrijven naar CRM" } },
            ],
          },
        },
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
        run: {
          name: "Outreach naar geboekte afspraak",
          meta: "6 stappen, 1 voor jou",
          currentStep: 6,
          runSteps: [
            {
              label: "Wekelijkse prospectlijst opent",
              kind: "trigger",
              duration: "0,3s",
              detail: "Elke weekdagochtend opent de workflow de lijst met bedrijven die aan bod komen.",
            },
            {
              label: "Elk bedrijf onderzoeken",
              kind: "ai",
              duration: "11s",
              detail: "Hij zoekt elk bedrijf op, zodat het bericht geen standaardtekst wordt.",
            },
            {
              label: "Jij kiest wie je contacteert",
              kind: "human",
              duration: "6m 38s",
              detail: "Jij ziet de lijst eerst en beslist welke bedrijven een mail waard zijn.",
            },
            {
              label: "Gepersonaliseerde mails opstellen",
              kind: "ai",
              duration: "5,9s",
              detail: "Voor elk bedrijf dat je hield, schrijft hij één mail op basis van dat onderzoek.",
            },
            {
              label: "Versturen en opvolgdatum zetten",
              kind: "system",
              duration: "2,2s",
              detail: "De mails vertrekken, en per bedrijf komt er een herinnering een week later.",
            },
            {
              label: "Reeks loggen in het CRM",
              kind: "end",
              duration: "0,8s",
              detail: "Alles wat verstuurd is, gaat naar het CRM, zodat niets in je hoofd blijft zitten.",
            },
          ],
          kv: [
            { label: "Planning", value: { type: "code", value: "0 8 * * 1-5" } },
            { label: "Batch", value: { type: "text", value: "12 bedrijven in de wachtrij" } },
            { label: "Agenda", value: { type: "tool", value: "Google Calendar" } },
            { label: "CRM", value: { type: "tool", value: "HubSpot" } },
            { label: "Looptijd", value: { type: "duration", value: "6m 58s" } },
          ],
          bento: {
            summary: {
              label: "Samenvatting",
              body: "Lijkt een bedrijf op werk dat je al binnenhaalde, dan opent de mail met die verwijzing. Elke mail vertrekt met een opvolgdatum zeven dagen later en een blok in je agenda.",
            },
            tiles: [
              { label: "Trigger", value: { type: "code", value: "0 8 * * 1-5" } },
              { label: "Ritme", value: { type: "text", value: "Elke weekdag om 08:00" } },
              { label: "Koppeling", value: { type: "tool", value: "HubSpot" } },
              { label: "Huidige stap", value: { type: "text", value: "Stap 6 van 6, reeks loggen" } },
            ],
          },
        },
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
        run: {
          name: "Inboxtriage naar antwoord",
          meta: "6 stappen, de laatste is voor jou",
          currentStep: 6,
          runSteps: [
            {
              label: "Nieuwe mail in de gedeelde inbox",
              kind: "trigger",
              duration: "0,1s",
              detail: "Er komt een bericht binnen in de gedeelde mailbox en de workflow pikt het op.",
            },
            {
              label: "Vraag classificeren",
              kind: "ai",
              duration: "1,3s",
              detail: "Hij bepaalt waarover het bericht gaat, bijvoorbeeld een vraag over een offerte.",
            },
            {
              label: "Verloop van het gesprek ophalen",
              kind: "system",
              duration: "0,6s",
              detail: "Hij leest de eerdere berichten in hetzelfde gesprek voor de context.",
            },
            {
              label: "Openstaande offerte in het CRM checken",
              kind: "ai",
              duration: "2,9s",
              detail: "Hij zoekt op wat je deze klant al offreerde, zodat het antwoord daarmee klopt.",
            },
            {
              label: "Antwoord opstellen",
              kind: "ai",
              duration: "4,7s",
              detail: "Het antwoord wordt geschreven uit dat gesprek en die offerte, niet uit een sjabloon.",
            },
            {
              label: "Jij keurt het antwoord goed",
              kind: "human",
              duration: "2m 40s",
              detail: "Het ontwerp wacht in je inbox en vertrekt pas wanneer jij het zegt.",
            },
          ],
          kv: [
            { label: "Watcher", value: { type: "code", value: "*/2 * * * *" } },
            { label: "Mailbox", value: { type: "tool", value: "Outlook" } },
            { label: "Categorie", value: { type: "text", value: "Opvolging offerte" } },
            { label: "Gesprek", value: { type: "text", value: "4 berichten, 1 bijlage" } },
            { label: "Wacht al", value: { type: "duration", value: "2m 40s" } },
          ],
          bento: {
            summary: {
              label: "Samenvatting",
              body: "Het antwoord wordt opgesteld uit de vier berichten in het gesprek en de openstaande offerte in je CRM. Er vertrekt niets uit de mailbox voor jij goedkeurt.",
            },
            tiles: [
              { label: "Trigger", value: { type: "text", value: "Nieuwe mail, gedeelde inbox" } },
              { label: "Ritme", value: { type: "code", value: "*/2 * * * *" } },
              { label: "Koppeling", value: { type: "tool", value: "Outlook" } },
              { label: "Huidige stap", value: { type: "text", value: "Stap 6 van 6, wacht op jou" } },
            ],
          },
        },
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
        run: {
          name: "Leveranciersfactuur naar boekhouding",
          meta: "6 stappen, 1 voor jou",
          currentStep: 6,
          runSteps: [
            {
              label: "Factuur komt binnen per mail",
              kind: "trigger",
              duration: "0,3s",
              detail: "Een leverancier stuurt een factuur naar je mailbox, en daar start de run.",
            },
            {
              label: "PDF uitlezen",
              kind: "ai",
              duration: "5,2s",
              detail: "De bedragen, de btw en de factuurlijnen worden rechtstreeks uit de pdf gelezen.",
            },
            {
              label: "Bestelbon zoeken en matchen",
              kind: "ai",
              duration: "1,8s",
              detail: "Hij zoekt de bestelbon die erbij hoort en markeert elk verschil in prijs.",
            },
            {
              label: "Jij keurt het bedrag goed",
              kind: "human",
              duration: "1m 47s",
              detail: "Jij ziet de factuur naast de bestelbon en bevestigt dat het bedrag klopt.",
            },
            {
              label: "Factuur inboeken",
              kind: "system",
              duration: "3,4s",
              detail: "De factuur wordt in je boekhoudpakket geboekt op de juiste rekening.",
            },
            {
              label: "Document archiveren, boekhouder verwittigen",
              kind: "end",
              duration: "0,9s",
              detail: "De pdf wordt bij de boeking bewaard en je boekhouder krijgt een kort bericht.",
            },
          ],
          kv: [
            { label: "Endpoint", value: { type: "code", value: "POST /hooks/invoice-in" } },
            { label: "Boekhouding", value: { type: "tool", value: "Exact Online" } },
            { label: "Document", value: { type: "text", value: "PDF, 2 pagina’s" } },
            { label: "Match", value: { type: "text", value: "Bestelbon gevonden" } },
            { label: "Looptijd", value: { type: "duration", value: "1m 59s" } },
          ],
          bento: {
            summary: {
              label: "Samenvatting",
              body: "De lijnen worden uit de PDF gehaald en gekoppeld aan een openstaande bestelbon, en elk prijsverschil wordt gemarkeerd voor het inboeken. Er komt niets op de leveranciersrekening voor jij het bedrag goedkeurt, en het origineel zit bij de boeking.",
            },
            tiles: [
              { label: "Trigger", value: { type: "text", value: "Factuur in de mailbox" } },
              { label: "Ritme", value: { type: "text", value: "Bij elke binnenkomende factuur" } },
              { label: "Koppeling", value: { type: "tool", value: "Exact Online" } },
              { label: "Huidige stap", value: { type: "text", value: "Stap 6 van 6, PDF archiveren" } },
            ],
          },
        },
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
        run: {
          name: "Klantvraag naar antwoord",
          meta: "6 stappen, 1 voor jou",
          currentStep: 6,
          runSteps: [
            {
              label: "Vraag komt binnen via de site",
              kind: "trigger",
              duration: "0,2s",
              detail: "Een klant stelt een vraag via de widget op je website.",
            },
            {
              label: "Classificeren en prioriteit zetten",
              kind: "ai",
              duration: "1,1s",
              detail: "Hij sorteert de vraag op onderwerp en bepaalt hoe dringend ze is.",
            },
            {
              label: "Kennisbank doorzoeken",
              kind: "ai",
              duration: "2,4s",
              detail: "Hij gaat je eigen artikels af op zoek naar de passages die hierop antwoorden.",
            },
            {
              label: "Antwoord opstellen met bronnen",
              kind: "ai",
              duration: "4,3s",
              detail: "Er wordt een antwoord geschreven met een link naar de artikels erachter.",
            },
            {
              label: "Jij geeft het antwoord vrij",
              kind: "human",
              duration: "58s",
              detail: "Jij leest het antwoord één keer en beslist of het naar de klant gaat.",
            },
            {
              label: "Antwoord verstuurd, ticket bijgewerkt",
              kind: "end",
              duration: "1,2s",
              detail: "De klant krijgt het antwoord en het ticket sluit met dat antwoord erbij.",
            },
          ],
          kv: [
            { label: "Endpoint", value: { type: "code", value: "POST /hooks/support-in" } },
            { label: "Kanaal", value: { type: "text", value: "Widget op je site" } },
            { label: "Helpdesk", value: { type: "tool", value: "Teamleader" } },
            { label: "Bronnen", value: { type: "text", value: "3 artikels geciteerd" } },
            { label: "Looptijd", value: { type: "duration", value: "1m 07s" } },
          ],
          bento: {
            summary: {
              label: "Samenvatting",
              body: "Het antwoord wordt opgebouwd uit de drie artikels die bij de vraag passen in je kennisbank, met een link naar alle drie. Het vertrekt zodra jij het vrijgeeft, en het ticket sluit met datzelfde antwoord als nieuw fragment.",
            },
            tiles: [
              { label: "Trigger", value: { type: "text", value: "Vraag via de website" } },
              { label: "Ritme", value: { type: "text", value: "Bij elke binnenkomende vraag" } },
              { label: "Koppeling", value: { type: "tool", value: "Teamleader" } },
              { label: "Huidige stap", value: { type: "text", value: "Stap 6 van 6, ticket bijwerken" } },
            ],
          },
        },
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
        outputs: ["Workflowkaart", "Overzicht van tools en overdrachten", "Notities over waar de tijd blijft"],
      },
      {
        num: "02",
        name: "Identificeren",
        title: "We vinden waar tijd verloren gaat.",
        body: "We zoeken de processen met het grootste automatiseringspotentieel: repetitieve taken, handmatige data-invoer, bottlenecks en stappen die voorspelbaar genoeg zijn om te systematiseren.",
        outputs: ["Prioriteitenlijst", "Inschatting van werk en impact per proces"],
      },
      {
        num: "03",
        name: "Ontwerpen",
        title: "We ontwerpen jouw AI-workflow.",
        body: "We bepalen welke agents, systemen en integraties nodig zijn, en waar mensen precies betrokken blijven.",
        outputs: ["Workflowontwerp", "Lijst met goedkeuringsmomenten", "Overzicht van de datastromen"],
      },
      {
        num: "04",
        name: "Implementeren",
        title: "We laten het werken in jouw bedrijf.",
        body: "We bouwen het agentsysteem en koppelen het aan de software die je al gebruikt: CRM, e-mail, agenda, boekhouding, Google Workspace of Microsoft 365.",
        outputs: ["Draaiende workflow", "Gekoppelde systemen", "Overdracht met uitleg"],
      },
      {
        num: "05",
        name: "Optimaliseren",
        title: "We maken het steeds beter.",
        body: "We monitoren de prestaties, testen, verbeteren en breiden workflows uit wanneer dat relevant is. Een automatisering is nooit een eenmalig project.",
        outputs: ["Runlog en meldingen bij fouten", "Verbeterlijst"],
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
    groups: ["Je team en je tools", "Data en controle", "Scope, prijs en wat erna komt"],
    items: [
      {
        group: "Je team en je tools",
        q: "Vervangt AI mijn medewerkers?",
        a: "Nee. Het doel is repetitief werk weghalen, geen mensen. De workflow neemt het kopiëren, controleren en opnieuw invoeren over, zodat je team zijn uren besteedt aan werk dat oordeel, relaties en expertise vraagt. Als een automatisering pas rendeert door in je team te snijden, zeggen we dat hardop in plaats van ze aan je te verkopen.",
      },
      {
        group: "Je team en je tools",
        q: "Moet ik mijn huidige software vervangen?",
        a: "Bijna nooit, en dat is net het punt. We koppelen de workflow aan de systemen die je al hebt: je CRM, mailbox, agenda, boekhoudpakket en interne tools. Kan iets echt niet gekoppeld worden, dan hoor je dat tijdens de audit, niet halverwege de bouw.",
      },
      {
        group: "Data en controle",
        q: "Wat gebeurt er met mijn bedrijfsgegevens?",
        a: "We houden dit concreet in plaats van te beloven dat alles zomaar veilig is. Toegangsrechten worden per systeem en per agent ingesteld, zodat elk onderdeel van de workflow alleen bij de data kan die het nodig heeft. Data gaat alleen naar een AI-model wanneer die stap in de workflow dat nodig heeft, en we spreken vooraf af welke gegevens waar verwerkt mogen worden. Voor er iets live gaat, krijg je een overzicht van elk systeem dat de workflow raakt en van alles wat je omgeving verlaat, en jij geeft daar je akkoord voor.",
      },
      {
        group: "Data en controle",
        q: "Kan ik menselijke goedkeuring in de workflow houden?",
        a: "Ja, en in veel workflows hoor je dat ook te doen. Elke stap kan ingesteld worden om op een mens te wachten: een uitgaande e-mail, een offerte boven een bepaald bedrag, alles wat aan een klantrelatie raakt. Samen beslissen we waar de automatisering stopt en jouw oordeel begint, en die lijn kan verschuiven zodra je het systeem ziet draaien.",
      },
      {
        group: "Scope, prijs en wat erna komt",
        q: "Wat kost het?",
        a: "Er is geen vaste prijslijst voor een bouwtraject, omdat geen twee workflows hetzelfde zijn. De investering volgt de complexiteit van de workflow en het aantal systemen waaraan hij gekoppeld moet worden. Het eerste gesprek is gratis. Een volledige workflow-audit is betaald, aan een prijs die we vooraf afspreken, en je krijgt een afgebakende scope en prijs voor er iets gebouwd wordt, dus geen verrassingen halverwege.",
      },
      {
        group: "Scope, prijs en wat erna komt",
        q: "Hoelang duurt een implementatie?",
        a: "Dat hangt af van de workflow. Voor één afgebakend proces reken je in weken; een keten van verbonden processen duurt langer, en oudere of gesloten systemen zijn wat de timing het meest oprekt. Na de audit krijg je een concrete timing voor jouw situatie, voor je je ergens aan vastlegt.",
      },
      {
        group: "Scope, prijs en wat erna komt",
        q: "Wat gebeurt er na de implementatie?",
        a: "We blijven er verantwoordelijk voor. We monitoren de workflow, herstellen wat stukgaat, passen hem aan wanneer je proces verandert, en breiden hem uit zodra een nieuwe stap de moeite loont. Je blijft niet achter met een systeem dat niemand in je bedrijf begrijpt.",
      },
      {
        group: "Scope, prijs en wat erna komt",
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
    /* Zie de EN-versie: de gouden span is bewust kort gehouden. */
    titlePlain: "Geef ons je workflow. Wij bouwen het systeem dat hem voor je",
    titleSerif: "uitvoert.",
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
