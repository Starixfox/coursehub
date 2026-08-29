import type { MarketingCopy } from "./copy";
import { Reveal } from "./reveal";
import "./trust-section.css";

/**
 * Trust: the founder plate and the principles.
 *
 * The one section on the page that reads in a narrow measure. The parent wraps
 * this component in `<section class="mk-section mk-inset mk-inset--narrow"
 * id="trust">`, so the 50rem cap, the id and the horizontal padding all belong
 * to the page, not to us. We render the content bare.
 *
 * Shape: a 2-column split at `13rem 1fr`. A 208px portrait-shaped plate on the
 * left, the h2 and a numbered list of principles on the right. The eyebrow and
 * the lede are deleted; the h2 drops to 24px/500 and sits inside the right
 * column, directly above the list, so the section opens on the plate rather
 * than on another centred section head.
 *
 * The plate is the only square-cornered glass surface on the page. Everything
 * else is rounded at 8/10/12/16px, so `border-radius: 0` on the one
 * biographical surface reads as a decision instead of an oversight. It is not
 * to be rounded "for consistency".
 *
 * There is no portrait image in the repo and none is invented here, so the
 * plate is typographic: a gold register mark, the founder line set as the
 * largest thing on the plate, and the note below a hairline.
 *
 * Motion: one `Reveal` on the plate and nothing else. That is one of exactly
 * two `Reveal` usages left in the codebase (the other is the Workflows head).
 * The principles get no entrance and no stagger, deliberately: they are the
 * payload, and animating three of them in sequence is the cascade the rebuild
 * removed. Reduced motion is handled at the token layer in marketing.css and
 * reinforced in trust-section.css.
 *
 * Copy is rendered exactly as it arrives from `copy.ts`. Nothing in this
 * section may add client logos, client counts, testimonials or any other
 * social proof: there is none to show, and an honest empty column beats an
 * invented full one.
 */

/**
 * Placeholder marker for the founder names. When copy still carries the token
 * it is rendered as a visible mono chip rather than leaked as raw braces, so a
 * missing name looks unfinished on purpose instead of looking broken.
 */
const FOUNDER_TOKEN = "{{FOUNDER_NAMES}}";

export function TrustSection({ copy }: { copy: MarketingCopy["trust"] }) {
  const tokenAt = copy.founderLine.indexOf(FOUNDER_TOKEN);
  const founderLine =
    tokenAt === -1 ? (
      copy.founderLine
    ) : (
      <>
        {copy.founderLine.slice(0, tokenAt)}
        <span className="mk-trust__token">{FOUNDER_TOKEN}</span>
        {copy.founderLine.slice(tokenAt + FOUNDER_TOKEN.length)}
      </>
    );

  return (
    <div className="mk-trust">
      {/* The plate is the Reveal itself, so no wrapper div sits between the
          grid and its first column. Plate first in source order, which is also
          the stacking order below 720px. */}
      <Reveal className="mk-trust__plate">
        <span className="mk-trust__mark" aria-hidden="true" />
        <p className="mk-trust__founder">{founderLine}</p>
        <p className="mk-trust__note">{copy.founderBody}</p>
      </Reveal>

      <div className="mk-trust__main">
        <h2 className="mk-trust__h2">{copy.h2}</h2>

        <ol className="mk-trust__list">
          {copy.principles.map((principle, i) => (
            <li className="mk-trust__item" key={principle.title}>
              <span className="mk-trust__n" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mk-trust__title">{principle.title}</h3>
              <p className="mk-trust__body">{principle.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
