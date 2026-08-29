import type { MarketingCopy } from "./copy";
import "./audit-steps.css";

/**
 * "How to start": the four audit steps as a spacer-aligned comparison grid,
 * never a <table>. Five columns, one fixed and four fluid: a 168px label rail
 * and the four steps. It is the only fixed-plus-fluid grid on the page and the
 * only section with pinned chrome below the nav.
 *
 * The rail carries the entire voice of the section. The h2 sits in it at 18px
 * rather than at display size, with the lede under it and the note pinned to
 * the closing hairline, so the section opens quietly straight after the loud
 * Workflows block above it. There is no eyebrow and no section head.
 *
 * Alignment comes from spacers, not from row tracks. Grid row 1 is the rail
 * head plus four aria-hidden spacers, so the four step columns start exactly
 * where the rail head ends however the h2 wraps, in either language. Grid row
 * 2 holds the five column stacks, each opening on the same 96px band and
 * closing on the same hairline, so all five columns end flush.
 *
 * Semantics: this is a list of four ordered steps, so it is a real <ol> read in
 * DOM order (step, then its body, then the next step). Nothing is duplicated
 * for screen readers and nothing that carries meaning is hidden from them; the
 * only aria-hidden nodes are the four alignment spacers, the empty rail segment
 * of the sticky band, and the step numbers, which the list already conveys.
 *
 * Copy gap, deliberately not papered over: a comparison grid wants labelled
 * rows, and `copy.audit` has no field that can express one. The 56px row unit
 * is in the CSS and the rail is sized for row labels, but rendering rows here
 * would mean inventing English strings in a bilingual site. See the note in
 * audit-steps.css for the exact field the copy shape would need.
 *
 * Entrance: none. No Reveal, no fade, no stagger. The sticky header's backdrop
 * blur is the only effect in the section.
 *
 * Owns its outermost element. The page calls this component bare, so the
 * <section>, the #audit anchor and the horizontal padding all live here.
 */
export function AuditSteps({ copy }: { copy: MarketingCopy["audit"] }) {
  return (
    <section className="mk-section mk-audit" id="audit">
      <div className="mk-audit__grid">
        <h2 className="mk-audit__h2">{copy.h2}</h2>

        {/* Row 1, columns 2 to 5: the spacers that buy the alignment. They
            stretch to whatever height the h2 needs, so nothing below them
            steps out of line when the copy language changes. */}
        {copy.steps.map((step) => (
          <div className="mk-audit__spacer" key={step.num} aria-hidden="true" />
        ))}

        <div className="mk-audit__rail">
          {/* The rail's segment of the sticky band. Empty on purpose: it exists
              so the bar reads as one continuous surface across all five
              columns rather than four floating tiles. */}
          <div
            className="mk-audit__band mk-audit__band--rail"
            aria-hidden="true"
          />
          <div className="mk-audit__cell mk-audit__cell--rail">
            <p className="mk-audit__lede">{copy.lede}</p>
            <p className="mk-audit__note">{copy.note}</p>
          </div>
        </div>

        <ol className="mk-audit__cols">
          {copy.steps.map((step) => (
            <li className="mk-audit__col" key={step.num}>
              <div className="mk-audit__band">
                <span className="mk-audit__chip" aria-hidden="true">
                  {step.num}
                </span>
                <h3 className="mk-audit__title">{step.title}</h3>
              </div>
              <div className="mk-audit__cell">
                <p className="mk-audit__body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
