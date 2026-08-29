"use client";

import { useRef, useState, type ReactNode } from "react";
import type { MarketingCopy, RunField, WorkflowRun } from "./copy";
import "./workflow-tabs.css";

/**
 * Workflows: one fake application window with a selector bar welded to its top.
 *
 * The panel does not diagram a workflow, it shows one mid-run: a selector bar,
 * a titlebar, a six-step run list with the paper-stack illusion under it, a
 * five-row key/value block and a five-tile bento. One panel is visible at a
 * time and everything premium in this section happens inside that one frame.
 *
 * The run it shows is invented. Midnight Space has no client systems to
 * screenshot, so every duration, count and connection here is designed rather
 * than measured, and the copy is written so that no string claims otherwise:
 * the titlebar meta describes the workflow's shape ("6 steps, 1 for you"), not
 * a live state, and the cadence tile describes a schedule instead of promising
 * the next execution. The .mk-run__badge in the titlebar carries the rest of
 * that weight and is not optional chrome. Anything added here that reads as
 * telemetry from a running client deployment has to be softened the same way.
 *
 * Four things carry the whole component.
 *
 * 1. The selector bar. It is not a row of marketing tabs sitting above a
 *    screenshot, it is the top edge of the instrument: same glass, same border
 *    alpha, square where the two halves meet, so the bar and the panel read as
 *    one machined object with five settings. That is why the panel lost its
 *    content-card hover lift; chrome does not rise when you point at it.
 *
 * 2. renderField. Fake UI stops looking fake at the moment its data types stop
 *    looking alike. A duration is mono, faint and tabular. A connected tool is
 *    a swatch plus an underlined name. A webhook path or a cron string is a
 *    bordered periwinkle pill. A step name is plain text. That switch is the
 *    component's value proposition; if it ever collapses into one grey <span>
 *    the panel becomes placeholder art again.
 *
 * 3. The step list reads as a walkthrough. Every row carries its position
 *    (01 to 06), its name, its duration and one plain sentence saying what the
 *    step actually does, so a reader who has never seen an automation can
 *    follow the mechanic top to bottom without prior knowledge. The position
 *    number is derived from the array index here, never stored in copy.ts, so
 *    it cannot drift out of order.
 *
 * 4. The rotating queue. All five panels are mounted. The head of the order
 *    array is in flow and paints; the rest are absolutely parked, transparent
 *    and inert. Selecting a tab rotates the array so that tab reaches the head,
 *    which is what makes the enter read as a card being dealt onto a stack
 *    rather than a crossfade or a slide. The enter animation restarts because
 *    data-head flips animation-name from none to a name, which is reliable in
 *    a way that depending on DOM reordering is not.
 *
 * The parent owns the <section>, the id and the section head, and calls this
 * component bare. This file owns the selector bar and the panel deck only.
 *
 * Accessibility: real tabs. Roving tabIndex, automatic activation on arrow,
 * Home and End, a focusable panel, and inert parked panels so the four hidden
 * runs are neither tabbable nor announced. The step the run is sitting on is
 * marked aria-current="step", which is the non-visual equivalent of its
 * brighter row, and the bento already states the same position in words. The
 * stack decoys, the titlebar dot and the tab glyphs are aria-hidden scenery.
 */

/**
 * Instrument glyphs for the selector bar, keyed by workflow key rather than by
 * name: the names are translated, the keys are not, so this map stays correct
 * in both locales and an unknown key degrades to a text-only tab. Geometry
 * only, stroked in currentColor, so lighting the active tab lights its glyph
 * and its label with one rule.
 */
const GLYPHS: Record<string, ReactNode> = {
  // Funnel: many in at the top, one qualified lead out at the bottom.
  leads: <path d="M1.6 2h10.8L8.3 6.9v4.4l-2.6 1.2V6.9z" />,
  // Trend line with an arrowhead.
  sales: (
    <>
      <path d="M1.6 11.1 5.4 7.2l2.6 2.3 4.4-5.1" />
      <path d="M9.4 4.4h3v3" />
    </>
  ),
  // Envelope.
  email: (
    <>
      <path d="M1.7 3.4h10.6v7.2H1.7z" />
      <path d="m1.7 3.9 5.3 4.1 5.3-4.1" />
    </>
  ),
  // Document with a folded corner and two ruled lines.
  admin: (
    <>
      <path d="M3.3 1.6h4.8l2.6 2.7v8.1H3.3z" />
      <path d="M7.9 1.8v2.6h2.6" />
      <path d="M5.4 7.7h3.2M5.4 9.9h3.2" />
    </>
  ),
  // Speech bubble.
  support: <path d="M1.8 3.2h10.4v6.2H6.5l-2.8 2.6V9.4H1.8z" />,
};

function TabGlyph({ workflowKey }: { workflowKey: string }) {
  const glyph = GLYPHS[workflowKey];
  if (!glyph) return null;

  return (
    <svg
      className="mk-runs__glyph"
      viewBox="0 0 14 14"
      aria-hidden="true"
      focusable="false"
    >
      {glyph}
    </svg>
  );
}

/** The one switch that matters. Four data types, four different renderings. */
function renderField(field: RunField): ReactNode {
  switch (field.type) {
    case "duration":
      return <span className="mk-fld mk-fld--dur">{field.value}</span>;

    case "tool":
      return (
        <span className="mk-fld mk-fld--tool">
          <i className="mk-fld__swatch" aria-hidden="true" />
          <span className="mk-fld__tool-name">{field.value}</span>
        </span>
      );

    case "code":
      return <code className="mk-fld mk-fld--code">{field.value}</code>;

    case "text":
      return <span className="mk-fld mk-fld--text">{field.value}</span>;
  }
}

function RunWindow({ run, label }: { run: WorkflowRun; label: string }) {
  return (
    <>
      <header className="mk-run__bar">
        <span className="mk-run__dot" aria-hidden="true" />
        <span className="mk-run__name">{run.name}</span>
        <span className="mk-run__sep" aria-hidden="true">
          ·
        </span>
        <span className="mk-run__meta">{run.meta}</span>
        {/* Not decoration and not a hover affordance: the badge is the one
            piece of chrome that says this window is a designed illustration
            rather than a system running for a client. Plain text in the
            titlebar, server-rendered on every panel, announced like any other
            text. It must never become a tooltip or a hover reveal. */}
        <span className="mk-run__badge">{label}</span>
      </header>

      <div className="mk-run__body">
        <div className="mk-run__steps">
          <ol className="mk-run__list">
            {run.runSteps.map((step, i) => {
              const position = i + 1;
              // Three states, derived from one number on the run rather than
              // flagged per row, so the list can never disagree with itself.
              // run.currentStep also has to agree with the "Current step" tile
              // in the bento, which states the same position in words.
              const state =
                position < run.currentStep
                  ? "done"
                  : position === run.currentStep
                    ? "current"
                    : "pending";

              return (
                <li
                  className="mk-run__step"
                  key={step.label}
                  aria-current={state === "current" ? "step" : undefined}
                >
                  <span className="mk-run__row" data-kind={step.kind} data-state={state}>
                    {/* Derived, never stored: 01 through 06 always match the
                        order of the array they are printed beside. */}
                    <span className="mk-run__step-index">
                      {String(position).padStart(2, "0")}
                    </span>
                    <span className="mk-run__step-name">{step.label}</span>
                    {renderField({ type: "duration", value: step.duration })}
                    {/* The reason the panel is on the page: one plain sentence
                        per step, so the mechanic is legible without prior
                        knowledge of automation. */}
                    <span className="mk-run__step-detail">{step.detail}</span>
                  </span>
                </li>
              );
            })}
          </ol>

          {/* Two decoys behind the last real row so the list reads as
              continuing beneath it. Scenery, never announced. */}
          <div className="mk-run__stack" aria-hidden="true">
            <i />
            <i />
          </div>
        </div>

        {/* flatMap, not wrapper divs: the dt and the dd have to be real
            children of the dl or the two-column grid never sees them. A keyed
            Fragment expresses the same thing and would also be correct; the
            flat array just avoids the extra import and one level of nesting. */}
        <dl className="mk-run__kv">
          {run.kv.flatMap((row) => [
            <dt key={`${row.label}-label`}>{row.label}</dt>,
            <dd key={`${row.label}-value`}>{renderField(row.value)}</dd>,
          ])}
        </dl>

        <div className="mk-run__bento">
          <div className="mk-run__tile mk-run__tile--ai">
            <span className="mk-run__tile-label">{run.bento.summary.label}</span>
            <p className="mk-run__tile-body">{run.bento.summary.body}</p>
          </div>

          {run.bento.tiles.map((tile) => (
            <div className="mk-run__tile" key={tile.label}>
              <span className="mk-run__tile-label">{tile.label}</span>
              <span className="mk-run__tile-value">{renderField(tile.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function WorkflowTabs({ copy }: { copy: MarketingCopy["workflows"] }) {
  const count = copy.items.length;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // The queue. order[0] is the panel in flow; the rest are parked behind it in
  // the order they will come back round.
  const [order, setOrder] = useState<number[]>(() =>
    copy.items.map((_, i) => i),
  );
  const active = order[0] ?? 0;

  const rotateTo = (index: number) => {
    setOrder((prev) => {
      const at = prev.indexOf(index);
      if (at <= 0) return prev;
      return [...prev.slice(at), ...prev.slice(0, at)];
    });
  };

  const focusTab = (index: number) => {
    const next = (index + count) % count;
    rotateTo(next);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") focusTab(active + 1);
    else if (e.key === "ArrowLeft") focusTab(active - 1);
    else if (e.key === "Home") focusTab(0);
    else if (e.key === "End") focusTab(count - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div className="mk-runs">
      {/* The selector bar. Rendered once, above the deck rather than inside a
          panel, because five stacked panels would otherwise mean five
          tablists. It carries the same bleed as the deck so its edges land on
          the panel's edges exactly, and the two share a border alpha, a glass
          fill and a squared seam so they read as one instrument.

          Tabs are rendered in copy order, never in queue order: arrow-key
          order has to stay stable while the deck behind them rotates. */}
      <div
        className="mk-runs__tabs"
        role="tablist"
        aria-label={copy.tablistAria}
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
      >
        {copy.items.map((wf, i) => (
          <button
            key={wf.key}
            type="button"
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            id={`wf-tab-${wf.key}`}
            aria-selected={i === active}
            aria-controls={`wf-panel-${wf.key}`}
            tabIndex={i === active ? 0 : -1}
            className="mk-runs__tab"
            onClick={() => rotateTo(i)}
          >
            <TabGlyph workflowKey={wf.key} />
            <span className="mk-runs__tab-name">{wf.tab}</span>
          </button>
        ))}
      </div>

      {/* Rendered in queue order, not source order, so the DOM matches the
          stack. Paint order follows depth for the same reason. */}
      <div className="mk-runs__deck">
        {order.map((itemIndex, depth) => {
          const wf = copy.items[itemIndex];
          const isHead = depth === 0;

          return (
            <article
              key={wf.key}
              className="mk-run"
              data-head={isHead}
              style={{ zIndex: count - depth }}
              role="tabpanel"
              id={`wf-panel-${wf.key}`}
              aria-labelledby={`wf-tab-${wf.key}`}
              tabIndex={isHead ? 0 : -1}
              inert={!isHead}
            >
              <RunWindow run={wf.run} label={copy.runLabel} />
            </article>
          );
        })}
      </div>
    </div>
  );
}
