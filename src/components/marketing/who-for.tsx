import type { MarketingCopy } from "./copy";
import "./who-for.css";

/**
 * "Who it's for": a register of audience types, each with the repetitive work
 * that comes with it. Renders inner content only. The section wrapper, the
 * container and the section head belong to marketing-page.tsx.
 *
 * Deliberately not a card grid: this is a list you scan until one line
 * describes your own week.
 */
export function WhoFor({ copy }: { copy: MarketingCopy["whoFor"] }) {
  return (
    <div className="mk-who">
      <ul className="mk-who__list">
        {copy.audiences.map((audience) => (
          <li className="mk-who__row" key={audience.name}>
            <h3 className="mk-who__name">{audience.name}</h3>
            <p className="mk-who__note">{audience.note}</p>
          </li>
        ))}
      </ul>
      <p className="mk-who__aside">{copy.note}</p>
    </div>
  );
}
