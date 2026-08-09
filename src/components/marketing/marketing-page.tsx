import { Fragment } from "react";
import "@/app/marketing.css";
import type { MarketingCopy } from "./copy";
import { SiteNav } from "./site-nav";
import { WorkflowTabs } from "./workflow-tabs";
import { RoiCalculator } from "./roi-calculator";
import { Reveal } from "./reveal";

function SectionCrosses() {
  return (
    <>
      <span className="mk-cross mk-cross--left" aria-hidden="true" />
      <span className="mk-cross mk-cross--right" aria-hidden="true" />
    </>
  );
}

function HeroFlow({ copy }: { copy: MarketingCopy["hero"] }) {
  const delay = (i: number) => ({ "--d": `${i * 0.55}s` } as React.CSSProperties);
  return (
    <div className="mk-flow-frame rv is-in">
      <div className="mk-flow-frame__bar">
        <span>{copy.flowName}</span>
        <span className="mk-flow-frame__status">{copy.flowStatus}</span>
      </div>
      <div
        className="mk-flow mk-flow--responsive"
        role="group"
        aria-label={copy.flowAria}
      >
        <div className="mk-chip">
          <span className="mk-chip__role">{copy.roleTrigger}</span>
          <span className="mk-chip__label">{copy.trigger}</span>
        </div>
        <div className="mk-conn" style={delay(0)} />
        <div className="mk-chip mk-chip--agent" style={delay(0.6)}>
          <span className="mk-chip__role">{copy.roleAgent}</span>
          <span className="mk-chip__label">{copy.agents[0]}</span>
        </div>
        <div className="mk-conn" style={delay(1)} />
        <div className="mk-chip mk-chip--agent" style={delay(1.6)}>
          <span className="mk-chip__role">{copy.roleAgent}</span>
          <span className="mk-chip__label">{copy.agents[1]}</span>
        </div>
        <div className="mk-conn" style={delay(2)} />
        <div className="mk-chip mk-chip--agent" style={delay(2.6)}>
          <span className="mk-chip__role">{copy.roleAgent}</span>
          <span className="mk-chip__label">{copy.agents[2]}</span>
        </div>
        <div className="mk-conn" style={delay(3)} />
        <div className="mk-chip mk-chip--action">
          <span className="mk-chip__role">{copy.roleAction}</span>
          <span className="mk-chip__label">{copy.action}</span>
        </div>
      </div>
    </div>
  );
}

export function MarketingPage({ copy }: { copy: MarketingCopy }) {
  return (
    <div className="mkt">
      <noscript>
        <style>{`.rv { opacity: 1 !important; transform: none !important; }`}</style>
      </noscript>
      <SiteNav copy={copy} />

      <main>
        {/* ------------------------------------------------------- hero --- */}
        <section className="mk-hero">
          <div className="mk-hero__grid" aria-hidden="true" />
          <div className="mk-container mk-hero__inner">
            <span className="mk-eyebrow">{copy.hero.eyebrow}</span>
            <h1 className="mk-h1">
              {copy.hero.h1Plain}{" "}
              <span className="mk-serif">{copy.hero.h1Serif}</span>
            </h1>
            <p className="mk-lede">{copy.hero.lede}</p>
            <div className="mk-hero__ctas">
              <a href="#audit" className="mk-btn mk-btn--primary">
                {copy.hero.ctaPrimary}
                <span className="mk-btn__arrow" aria-hidden="true">
                  &rarr;
                </span>
              </a>
              <a href="#how" className="mk-btn mk-btn--ghost">
                {copy.hero.ctaSecondary}
              </a>
            </div>
            <p className="mk-hero__note">{copy.hero.note}</p>
            <HeroFlow copy={copy.hero} />
          </div>
        </section>

        {/* ----------------------------------------------- positioning --- */}
        <section className="mk-section" id="positioning">
          <SectionCrosses />
          <div className="mk-container">
            <Reveal>
              <div className="mk-section-head">
                <span className="mk-eyebrow">{copy.positioning.eyebrow}</span>
                <h2 className="mk-h2">{copy.positioning.h2}</h2>
              </div>
            </Reveal>
            <div className="mk-position__grid">
              <Reveal delay={0.1}>
                <blockquote className="mk-quote">
                  {copy.positioning.quote}
                </blockquote>
                <p className="mk-pull">
                  {copy.positioning.pullLine1}
                  <br />
                  {copy.positioning.pullLine2}
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="mk-position__copy mk-body">
                  {copy.positioning.paragraphs.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------- before/after --- */}
        <section className="mk-section mk-dark-section" id="how">
          <div className="mk-container">
            <Reveal>
              <div className="mk-section-head">
                <span className="mk-eyebrow">{copy.beforeAfter.eyebrow}</span>
                <h2 className="mk-h2">{copy.beforeAfter.h2}</h2>
                <p className="mk-lede">{copy.beforeAfter.lede}</p>
              </div>
            </Reveal>
            <div className="mk-ba">
              <Reveal delay={0.1}>
                <div className="mk-ba__panel mk-ba__panel--before">
                  <span className="mk-ba__tag">{copy.beforeAfter.beforeTag}</span>
                  <ul className="mk-ba__list">
                    {copy.beforeAfter.beforeItems.map((item, i) => (
                      <li
                        key={item}
                        className={
                          i === 0
                            ? "mk-ba__item mk-ba__item--trigger"
                            : "mk-ba__item"
                        }
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mk-ba__footnote">
                    {copy.beforeAfter.beforeFootnote}
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="mk-ba__panel mk-ba__panel--after">
                  <span className="mk-ba__tag mk-ba__tag--after">
                    {copy.beforeAfter.afterTag}
                  </span>
                  <ul className="mk-ba__list">
                    {copy.beforeAfter.afterItems.map((item, i) => (
                      <Fragment key={item}>
                        <li className="mk-ba__item mk-ba__item--clean">{item}</li>
                        <li
                          className="mk-ba__connector mk-ba__connector--live"
                          style={{ "--d": `${i * 0.4}s` } as React.CSSProperties}
                          aria-hidden="true"
                        />
                      </Fragment>
                    ))}
                    <li className="mk-ba__item mk-ba__item--clean mk-ba__item--human">
                      {copy.beforeAfter.afterHumanItem}
                    </li>
                  </ul>
                  <p className="mk-ba__footnote mk-ba__footnote--after">
                    {copy.beforeAfter.afterFootnote}
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------- workflows --- */}
        <section className="mk-section" id="workflows">
          <SectionCrosses />
          <div className="mk-container">
            <Reveal>
              <div className="mk-section-head">
                <span className="mk-eyebrow">{copy.workflows.eyebrow}</span>
                <h2 className="mk-h2">{copy.workflows.h2}</h2>
                <p className="mk-lede">{copy.workflows.lede}</p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <WorkflowTabs copy={copy.workflows} />
            </Reveal>
          </div>
        </section>

        {/* -------------------------------------------------- approach --- */}
        <section className="mk-section" id="approach">
          <SectionCrosses />
          <div className="mk-container">
            <Reveal>
              <div className="mk-section-head">
                <span className="mk-eyebrow">{copy.approach.eyebrow}</span>
                <h2 className="mk-h2">{copy.approach.h2}</h2>
                <p className="mk-lede">{copy.approach.lede}</p>
              </div>
            </Reveal>
            <div className="mk-approach">
              {copy.approach.steps.map((step, i) => (
                <Reveal key={step.num} delay={i * 0.05}>
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

        {/* ------------------------------------------------------- roi --- */}
        <section className="mk-section" id="roi">
          <SectionCrosses />
          <div className="mk-container">
            <Reveal>
              <div className="mk-section-head">
                <span className="mk-eyebrow">{copy.roi.eyebrow}</span>
                <h2 className="mk-h2">{copy.roi.h2}</h2>
                <p className="mk-lede">{copy.roi.lede}</p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <RoiCalculator copy={{ ...copy.roi, locale: copy.locale }} />
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------------- why --- */}
        <section className="mk-section" id="why">
          <SectionCrosses />
          <div className="mk-container">
            <Reveal>
              <div className="mk-section-head">
                <span className="mk-eyebrow">{copy.why.eyebrow}</span>
                <h2 className="mk-h2">{copy.why.h2}</h2>
                <p className="mk-lede">{copy.why.lede}</p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
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

        {/* --------------------------------------------- integrations --- */}
        <div className="mk-marquee" role="group" aria-label={copy.integrations.aria}>
          <div className="mk-marquee__track">
            {[...copy.integrations.items, ...copy.integrations.items].map(
              (item, i) => (
                <span className="mk-marquee__item" key={`${item}-${i}`}>
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        {/* ------------------------------------------------------- faq --- */}
        <section className="mk-section mk-section--flush" id="faq">
          <div className="mk-container mk-container--narrow">
            <Reveal>
              <div className="mk-section-head">
                <span className="mk-eyebrow">{copy.faq.eyebrow}</span>
                <h2 className="mk-h2">{copy.faq.h2}</h2>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
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

        {/* ------------------------------------------------- statement --- */}
        <section className="mk-section mk-statement">
          <SectionCrosses />
          <div className="mk-container">
            <Reveal>
              <span className="mk-eyebrow">{copy.statement.eyebrow}</span>
              <p className="mk-statement__big">
                {copy.statement.bigPlain}{" "}
                <span className="mk-serif">{copy.statement.bigSerif}</span>
              </p>
              <div className="mk-statement__triad">
                {copy.statement.triad.map((t) => (
                  <span key={t.strong}>
                    {t.plain} <strong>{t.strong}</strong>
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------- final CTA --- */}
        <section className="mk-section mk-cta-section" id="audit">
          <div className="mk-cta-section__grid" aria-hidden="true" />
          <div className="mk-container mk-cta-section__inner">
            <Reveal>
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
            </Reveal>
          </div>
        </section>
      </main>

      {/* --------------------------------------------------------- footer --- */}
      <footer className="mk-footer">
        <div className="mk-container mk-footer__inner">
          <a href="#" className="mk-footer__brand">
            Loopwork
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
