import "./approach-pipeline.css";

/**
 * Compact pipeline signpost for the #approach section:
 * Audit, Design, Build, Integrate, Maintain.
 *
 * Deliberately understated. It orients the reader before the numbered steps
 * below it, so it stays a hairline-and-mono strip, not a hero.
 *
 * Renders inner content only. marketing-page.tsx owns the section, the
 * container and the section head.
 */
export function ApproachPipeline({
  steps,
  ariaLabel,
}: {
  steps: string[];
  ariaLabel: string;
}) {
  return (
    <ol className="mk-pipe" aria-label={ariaLabel}>
      {steps.map((step, i) => (
        <li key={`${i}-${step}`} className="mk-pipe__step">
          <span className="mk-pipe__dot" aria-hidden="true" />
          <span className="mk-pipe__label">{step}</span>
        </li>
      ))}
    </ol>
  );
}
