import type { MarketingCopy } from "./copy";
import "./trust-section.css";

const FOUNDER_TOKEN = "{{FOUNDER_NAMES}}";

export function TrustSection({ copy }: { copy: MarketingCopy["trust"] }) {
  const tokenAt = copy.founderLine.indexOf(FOUNDER_TOKEN);
  const founderLine =
    tokenAt === -1 ? (
      copy.founderLine
    ) : (
      <>
        {copy.founderLine.slice(0, tokenAt)}
        <span className="mk-tr__token">{FOUNDER_TOKEN}</span>
        {copy.founderLine.slice(tokenAt + FOUNDER_TOKEN.length)}
      </>
    );

  return (
    <div className="mk-tr">
      <ul className="mk-tr__principles">
        {copy.principles.map((principle, i) => (
          <li className="mk-tr__principle" key={principle.title}>
            <span className="mk-tr__index" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mk-tr__title">{principle.title}</h3>
            <p className="mk-tr__body">{principle.body}</p>
          </li>
        ))}
      </ul>

      <div className="mk-tr__founder">
        <span className="mk-tr__ornament" aria-hidden="true" />
        <p className="mk-tr__founder-line">{founderLine}</p>
        <p className="mk-tr__founder-body">{copy.founderBody}</p>
      </div>
    </div>
  );
}
