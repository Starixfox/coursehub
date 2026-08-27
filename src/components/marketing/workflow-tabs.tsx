"use client";

import { useRef, useState } from "react";
import type { MarketingCopy, StepKind } from "./copy";

const STEP_CLASS: Record<StepKind, string> = {
  start: "mk-step mk-step--start",
  ai: "mk-step mk-step--ai",
  human: "mk-step mk-step--human",
  end: "mk-step",
};

export function WorkflowTabs({ copy }: { copy: MarketingCopy["workflows"] }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = copy.items.length;

  const focusTab = (index: number) => {
    const next = (index + count) % count;
    setActive(next);
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
    <div className="mk-tabs">
      <div
        className="mk-tabs__list"
        role="tablist"
        aria-label={copy.tablistAria}
        onKeyDown={onKeyDown}
      >
        {copy.items.map((w, i) => (
          <button
            key={w.key}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            id={`wf-tab-${w.key}`}
            aria-selected={i === active}
            aria-controls={`wf-panel-${w.key}`}
            tabIndex={i === active ? 0 : -1}
            className="mk-tab"
            onClick={() => setActive(i)}
          >
            {w.tab}
          </button>
        ))}
      </div>

      {copy.items.map((wf, i) => (
        <div
          key={wf.key}
          className="mk-tabs__panel"
          role="tabpanel"
          id={`wf-panel-${wf.key}`}
          aria-labelledby={`wf-tab-${wf.key}`}
          hidden={i !== active}
        >
          <div className="mk-tabs__meta">
            <h3 className="mk-tabs__title">{wf.title}</h3>
            <span className="mk-tabs__subtitle">{wf.subtitle}</span>
          </div>

          <div className="mk-steps">
            {wf.steps.map((step, j) => (
              <span key={step.label} className="mk-step-group">
                {j > 0 ? (
                  <svg
                    className="mk-step-arrow"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 7h9m0 0L7.5 3.5M11 7l-3.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
                <span className={STEP_CLASS[step.kind]}>{step.label}</span>
              </span>
            ))}
          </div>

          <p className="mk-tabs__outcome">{wf.outcome}</p>

          <div className="mk-legend" aria-hidden="true">
            <span>
              <i style={{ background: "rgba(255, 255, 255, 0.92)" }} />{" "}
              {copy.legend.trigger}
            </span>
            <span>
              <i style={{ background: "var(--mk-ai)" }} /> {copy.legend.ai}
            </span>
            <span>
              <i style={{ background: "var(--mk-accent)" }} /> {copy.legend.human}
            </span>
            <span>
              <i
                style={{
                  background: "transparent",
                  border: "1px solid var(--mk-line-strong)",
                }}
              />{" "}
              {copy.legend.outcome}
            </span>
          </div>

          <p className="mk-tabs__note">{copy.note}</p>
        </div>
      ))}
    </div>
  );
}
