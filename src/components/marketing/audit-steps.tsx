import type { MarketingCopy } from "./copy";
import "./audit-steps.css";

/**
 * "What happens in your free workflow audit": four numbered steps on a rail,
 * ending in the thing the visitor walks away holding. Renders inner content
 * only; the section wrapper and section head belong to marketing-page.tsx.
 */
export function AuditSteps({ copy }: { copy: MarketingCopy["audit"] }) {
  const lastIndex = copy.steps.length - 1;

  return (
    <div className="mk-aud">
      <ol className="mk-aud__list">
        {copy.steps.map((step, i) => (
          <li
            key={step.num}
            className={
              i === lastIndex
                ? "mk-aud__step mk-aud__step--final"
                : "mk-aud__step"
            }
          >
            <span className="mk-aud__marker" aria-hidden="true">
              <span className="mk-aud__num">{step.num}</span>
            </span>
            <div className="mk-aud__text">
              <h3 className="mk-aud__title">{step.title}</h3>
              <p className="mk-aud__body">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mk-aud__note">{copy.note}</p>
    </div>
  );
}
