import "@/app/marketing.css";
import type { MarketingCopy } from "./copy";
import { SiteNav } from "./site-nav";
import { WorkflowTabs } from "./workflow-tabs";
import { RoiCalculator } from "./roi-calculator";
import { Reveal } from "./reveal";
import { SiteAtmosphere } from "./site-atmosphere";
import { SmoothScroll } from "./smooth-scroll";
import { StoryScene } from "./story-scene";
import { WhoFor } from "./who-for";
import { ApproachPipeline } from "./approach-pipeline";
import { AuditSteps } from "./audit-steps";
import { TrustSection } from "./trust-section";
import { AgoraLogo } from "./agora-logo";

export function MarketingPage({ copy }: { copy: MarketingCopy }) {
  return (
    <div className="mkt">
      <noscript>
        <style>{`.rv { opacity: 1 !important; transform: none !important; }`}</style>
      </noscript>
      <SmoothScroll />

      {/* Fixed backdrop: dark gradient always, the house shader on top of it
          when motion is allowed. Everything else floats above as glass. */}
      <div className="mk-atmos" aria-hidden="true">
        <SiteAtmosphere />
      </div>

      <SiteNav copy={copy} />

      <main>
        {/* ------------------------------------------- hero + scroll story --- */}
        <StoryScene
          copy={copy}
          hero={
            <div className="st-hero">
              <span className="st-hero__badge">{copy.hero.eyebrow}</span>
              <h1 className="mk-h1">
                {copy.hero.h1Plain}{" "}
                <span className="mk-serif">{copy.hero.h1Serif}</span>
              </h1>
              <p className="mk-lede">{copy.hero.lede}</p>
              <div className="st-hero__ctas">
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
              <p className="st-hero__note">{copy.hero.note}</p>
              <span className="st-hero__scroll" aria-hidden="true" />
            </div>
          }
        />

        {/* --------------------------------------------------- who it's for --- */}
        <section className="mk-section" id="who">
          <div className="mk-container">
            <Reveal>
              <div className="mk-section-head">
                <h2 className="mk-h2">{copy.whoFor.h2}</h2>
                <p className="mk-lede">{copy.whoFor.lede}</p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <WhoFor copy={copy.whoFor} />
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------- workflows --- */}
        <section className="mk-section" id="workflows">
          <div className="mk-container">
            <Reveal>
              <div className="mk-section-head mk-section-head--row">
                <div>
                  <span className="mk-eyebrow">{copy.workflows.eyebrow}</span>
                  <h2 className="mk-h2">{copy.workflows.h2}</h2>
                </div>
                <p className="mk-lede">{copy.workflows.lede}</p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <WorkflowTabs copy={copy.workflows} />
            </Reveal>
          </div>
        </section>

        {/* -------------------------------------------------- approach --- */}
        <section className="mk-section" id="approach">
          <div className="mk-container">
            <Reveal>
              <div className="mk-section-head">
                <h2 className="mk-h2">{copy.approach.h2}</h2>
                <p className="mk-lede">{copy.approach.lede}</p>
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <ApproachPipeline
                steps={copy.approach.pipeline}
                ariaLabel={copy.approach.h2}
              />
            </Reveal>
            <div className="mk-approach">
              {copy.approach.steps.map((step, i) => (
                <Reveal key={step.num} delay={i * 0.04}>
                  <div className="mk-approach__row">
                    <span className="mk-approach__num">
                      {step.num} / {step.name}
                    </span>
                    <h3 className="mk-approach__title">{step.title}</h3>
                    <p className="mk-approach__body">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------- audit --- */}
        <section className="mk-section" id="audit">
          <div className="mk-container">
            <Reveal>
              <div className="mk-section-head">
                <span className="mk-eyebrow">{copy.audit.eyebrow}</span>
                <h2 className="mk-h2">{copy.audit.h2}</h2>
                <p className="mk-lede">{copy.audit.lede}</p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <AuditSteps copy={copy.audit} />
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------------- roi --- */}
        <section className="mk-section" id="roi">
          <div className="mk-container">
            <Reveal>
              <div className="mk-section-head mk-section-head--row">
                <div>
                  <span className="mk-eyebrow">{copy.roi.eyebrow}</span>
                  <h2 className="mk-h2">{copy.roi.h2}</h2>
                </div>
                <p className="mk-lede">{copy.roi.lede}</p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <RoiCalculator copy={{ ...copy.roi, locale: copy.locale }} />
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------------- why --- */}
        <section className="mk-section" id="why">
          <div className="mk-container">
            <Reveal>
              <div className="mk-section-head">
                <h2 className="mk-h2">{copy.why.h2}</h2>
                <p className="mk-lede">{copy.why.lede}</p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="mk-why">
                <div className="mk-why__cell mk-why__cell--statement">
                  <p className="mk-why__statement">
                    {copy.why.statementParts[0]}
                    <em>{copy.why.statementParts[1]}</em>
                    {copy.why.statementParts[2]}
                    <em>{copy.why.statementParts[3]}</em>
                    {copy.why.statementParts[4]}
                    <em>{copy.why.statementParts[5]}</em>
                    {copy.why.statementParts[6]}
                  </p>
                </div>
                {copy.why.cards.map((item, i) => (
                  <div className="mk-why__cell" key={item.title}>
                    <span className="mk-why__num">0{i + 1}</span>
                    <h3 className="mk-why__title">{item.title}</h3>
                    <p className="mk-why__body">{item.body}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ----------------------------------------------------- trust --- */}
        <section className="mk-section" id="trust">
          <div className="mk-container">
            <Reveal>
              <div className="mk-section-head">
                <span className="mk-eyebrow">{copy.trust.eyebrow}</span>
                <h2 className="mk-h2">{copy.trust.h2}</h2>
                <p className="mk-lede">{copy.trust.lede}</p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <TrustSection copy={copy.trust} />
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------------- faq --- */}
        <section className="mk-section" id="faq">
          <div className="mk-container mk-container--narrow">
            <Reveal>
              <div className="mk-section-head">
                <h2 className="mk-h2">{copy.faq.h2}</h2>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="mk-faq">
                {copy.faq.items.map((item) => (
                  <details key={item.q}>
                    <summary>{item.q}</summary>
                    <div className="mk-faq__answer">{item.a}</div>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------- final CTA --- */}
        <section className="mk-cta-section" id="contact">
          <div className="mk-container">
            <Reveal>
              <div className="mk-cta-section__inner">
                <span className="mk-eyebrow">{copy.cta.eyebrow}</span>
                <h2 className="mk-cta-section__title">
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
            </Reveal>
          </div>
        </section>
      </main>

      {/* --------------------------------------------------------- footer --- */}
      <footer className="mk-footer">
        <div className="mk-container mk-footer__inner">
          <a href="#" className="mk-footer__brand" aria-label="Agora">
            <AgoraLogo size={148} />
          </a>
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
