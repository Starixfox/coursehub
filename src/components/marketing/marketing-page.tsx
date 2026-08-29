import "@/app/marketing.css";
import type { MarketingCopy } from "./copy";
import { SiteNav } from "./site-nav";
import { WorkflowTabs } from "./workflow-tabs";
import { RoiCalculator } from "./roi-calculator";
import { Reveal } from "./reveal";
import { ScrollFx } from "./scroll-fx";
import { SiteAtmosphere } from "./site-atmosphere";
import { SmoothScroll } from "./smooth-scroll";
import { WhoFor } from "./who-for";
import { ApproachSection } from "./approach-section";
import { AuditSteps } from "./audit-steps";
import { TrustSection } from "./trust-section";
import { FaqSection } from "./faq-section";
import { CtaOrbit } from "./cta-orbit";
import { AgoraLogo } from "./agora-logo";

/**
 * The marketing page.
 *
 * Structure note, because this is the thing that was wrong before: every
 * section used to be the same object, an `mk-section > mk-container >
 * Reveal(head) > Reveal(body)` stamped eleven times with the same container
 * width, the same padding, the same 18px fade-up. That repetition, not any
 * individual choice, is what made the page read as generated.
 *
 * Now: one `Reveal` survives in the whole file (the Workflows head), section
 * heads exist only where a section genuinely needs one, and separation between
 * sections comes from a real hatched `.mk-rule` element rather than from
 * uniform block padding, which is what lets section heights vary by more than
 * 3x without the page feeling arrhythmic.
 *
 * Three things sit outside the drafting frame on purpose: the hero, the final
 * CTA and the footer. The frame reads as intentional precisely because
 * something escapes it.
 *
 * On the deleted 3D scene, 2026-08-29. This page carried a scroll-driven
 * WebGL machine through three rebuilds: scattered chips, then a soft toy, then
 * a machined bench lit to hardware-render standard. The last one was
 * technically the best and it still failed, for a reason no amount of craft
 * could fix: a funnel, a conveyor and an output tray say "manufacturing" to a
 * Belgian consultant, not "AI workflow automation". The metaphor misfired, and
 * a viewer who has to be told what an illustration means is not being helped
 * by it. The narrative it carried was good, so it survives here as four plain
 * paragraphs in `.mk-story`, which say the same thing in words that cannot be
 * misread. Do not reintroduce a 3D hero object without a metaphor that a
 * non-technical reader names correctly on sight, unprompted.
 */
export function MarketingPage({ copy }: { copy: MarketingCopy }) {
  return (
    <div className="mkt">
      <noscript>
        <style>{`.rv { opacity: 1 !important; transform: none !important; }`}</style>
      </noscript>
      <SmoothScroll />
      <ScrollFx />

      {/* Keyboard users land on the nav on every page load and would otherwise
          tab through it before reaching anything. Visually hidden until it
          takes focus, which is the only state where it is useful. */}
      <a href="#main" className="mk-skip">
        Skip to content
      </a>

      {/* Fixed backdrop: dark gradient always, the house shader on top of it
          when motion is allowed. Everything else floats above as glass. */}
      <div className="mk-atmos" aria-hidden="true">
        <SiteAtmosphere />
      </div>

      <SiteNav copy={copy} />

      <main id="main">
        {/* ------------------------------------------- hero (full bleed) --- */}
        <section className="mk-hero">
          <div className="mk-hero__inner">
            <span className="mk-eyebrow mk-eyebrow--pill">
              {copy.hero.eyebrow}
            </span>
            <h1 className="mk-h1">
              {copy.hero.h1Plain}{" "}
              <span className="mk-serif">{copy.hero.h1Serif}</span>
            </h1>
            <p className="mk-lede">{copy.hero.lede}</p>
            <div className="mk-hero__ctas">
              <a href="#contact" className="mk-btn mk-btn--primary">
                {copy.hero.ctaPrimary}
                <span className="mk-btn__arrow" aria-hidden="true">
                  &rarr;
                </span>
              </a>
              <a href="#workflows" className="mk-btn mk-btn--ghost">
                {copy.hero.ctaSecondary}
              </a>
            </div>
            <p className="mk-hero__note">{copy.hero.note}</p>
          </div>
        </section>

        {/* ------------------------------------------------- the narrative ---
            What the scroll story used to say, in words. Four beats: the
            problem today, what we map, what runs, what you get back. It is
            deliberately the only place on the page set at reading width, and
            it carries no illustration at all. */}
        <section className="mk-story" id="how">
          <ol className="mk-story__list">
            {copy.story.chapters.map((ch, i) => (
              <li className="mk-story__beat" key={ch.id}>
                <span className="mk-story__n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="mk-story__text">
                  <span className="mk-story__kicker">{ch.kicker}</span>
                  <h2 className="mk-story__title">{ch.title}</h2>
                  <p className="mk-story__body">{ch.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------------------------------------- drafting frame, part one --- */}
        <div className="mk-frame">
          <div className="mk-frame__rail">
            <div className="mk-frame__rail mk-frame__rail--inner">
              {/* ------------------------------------------- who it's for --- */}
              <WhoFor copy={copy.whoFor} />
            </div>
          </div>
        </div>

        {/* ------------------------------------- workflows (full bleed) ---
            The instrument is the centrepiece of the page, so it gets its own
            field rather than a slot inside the rails. Everything else on the
            page is chrome around this. The technical labels above it are the
            one place the marketing voice steps aside for an annotation
            register, which is what makes the panel below read as equipment
            rather than as a screenshot. */}
        <section className="mk-runs-field" id="workflows">
          <div className="mk-runs-field__inner">
            <ul className="mk-runs-field__labels" aria-hidden="true">
              {copy.workflows.items.map((wf) => (
                <li key={wf.key}>{wf.tab}</li>
              ))}
            </ul>
            <Reveal>
              <div className="mk-runs-field__head">
                <h2 className="mk-h2 mk-h2--moment">{copy.workflows.h2}</h2>
                <p className="mk-lede">{copy.workflows.lede}</p>
              </div>
            </Reveal>
            <WorkflowTabs copy={copy.workflows} />
          </div>
        </section>

        {/* ---------------------------------------- drafting frame, part two --- */}
        <div className="mk-frame">
          <div className="mk-frame__rail">
            <div className="mk-frame__rail mk-frame__rail--inner">
              {/* ----------------------------------------------- approach --- */}
              <ApproachSection copy={copy.approach} />

              <div className="mk-rule" aria-hidden="true" />

              {/* -------------------------------------------------- audit --- */}
              <AuditSteps copy={copy.audit} />

              <div className="mk-rule" aria-hidden="true" />

              {/* ---------------------------------------------------- roi ---
                  No mk-section, no mk-inset on purpose. This block owns its own
                  asymmetric padding (3rem top, 18rem bottom) and its chart runs
                  edge to edge between the frame rails, so a wrapper contributing
                  padding would both double the rhythm and stop the chart
                  reaching them. */}
              <section id="roi">
                <RoiCalculator copy={{ ...copy.roi, locale: copy.locale }} />
              </section>

            </div>
          </div>
        </div>

        {/* ----------------------------------------- why (full bleed) ---
            The second cinematic band. The page alternates from here: framed
            reading sections inside the rails, full-bleed fields outside them.
            Why earns a band because its payload is one large statement rather
            than a block of reading, and a statement wants air on both sides of
            it rather than a rail. */}
        <section className="mk-why-section" id="why">
          <div className="mk-why">
                  <div className="mk-why__cell mk-why__cell--statement">
                    <h2 className="mk-h2 mk-h2--moment mk-why__statement">
                      {copy.why.statementParts[0]}
                      <em>{copy.why.statementParts[1]}</em>
                      {copy.why.statementParts[2]}
                      <em>{copy.why.statementParts[3]}</em>
                      {copy.why.statementParts[4]}
                      <em>{copy.why.statementParts[5]}</em>
                      {copy.why.statementParts[6]}
                    </h2>
                  </div>
                  {copy.why.cards.map((item, i) => (
                    <div className="mk-why__cell" key={item.title}>
                      {/* Not .mk-label: that class carries text-transform
                          uppercase, which is inert on digits but still counts
                          against the "no uppercase outside the run panel" rule
                          and would surprise the next person who reuses it. */}
                      <span className="mk-why__num">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mk-why__title">{item.title}</h3>
                      <p className="mk-why__body">{item.body}</p>
                    </div>
                  ))}
          </div>
        </section>

        {/* -------------------------------------- drafting frame, part three --- */}
        <div className="mk-frame">
          <div className="mk-frame__rail">
            <div className="mk-frame__rail mk-frame__rail--inner">
              {/* -------------------------------------------------- trust --- */}
              <section className="mk-section mk-inset mk-inset--narrow" id="trust">
                <TrustSection copy={copy.trust} />
              </section>

              <div className="mk-rule" aria-hidden="true" />

              {/* ---------------------------------------------------- faq --- */}
              <FaqSection copy={copy.faq} />
            </div>
          </div>
        </div>

        {/* ------------------------------------------ final CTA (full bleed) --- */}
        <section className="mk-cta-section" id="contact">
          <CtaOrbit items={copy.integrations.items} aria={copy.integrations.aria} />
          <div className="mk-container mk-cta-section__inner">
            <h2 className="mk-h2 mk-h2--moment mk-cta-section__title">
              {copy.cta.titlePlain} <em>{copy.cta.titleSerif}</em>
            </h2>
            <p className="mk-cta-section__sub">{copy.cta.sub}</p>
            <div className="mk-cta-section__actions">
              <a href={copy.cta.mailHref} className="mk-btn mk-btn--paper">
                {copy.cta.button}
                <span className="mk-btn__arrow" aria-hidden="true">
                  &rarr;
                </span>
              </a>
            </div>
            <p className="mk-cta-section__mail">
              {copy.cta.mailLead}{" "}
              <a href={copy.cta.mailHref}>{copy.cta.mailAddress}</a>
            </p>
          </div>
        </section>
      </main>

      {/* ------------------------------------------------ footer (full bleed) --- */}
      <footer className="mk-footer">
        <div className="mk-container mk-footer__inner">
          <a href="#" className="mk-footer__brand" aria-label="Agora">
            <AgoraLogo size={148} />
          </a>
          {/* Deliberately a short flat list. A five-column deep-IA footer on a
              two-person consultancy is itself a template tell. */}
          <nav className="mk-footer__nav" aria-label={copy.footer.aria}>
            {copy.footer.links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mk-footer__legal">
            <span>{copy.footer.legalLeft}</span>
            <span>{copy.footer.legalRight}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
