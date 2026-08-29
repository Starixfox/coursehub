"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { MarketingCopy } from "./copy";
import "./roi-calculator.css";

/**
 * ROI calculator: the only left-aligned unbalanced block on the page.
 *
 * Every other section is either centred, evenly split or a full-bleed band.
 * This one is deliberately off-balance: up to 288px of bottom padding against
 * 48px of top padding, the whole control cluster pinned top left inside 32rem
 * of a 74rem block, and an area chart absolutely filling the rest. Roughly
 * forty percent content, sixty percent chart. The asymmetry is the point, so
 * nothing here is allowed to drift back towards a two-column card layout.
 *
 * The chart is the only saturated shape of any size on the page. It earns that
 * because it is data: a cumulative plot of the visitor's own inputs across
 * twelve months, auto-scaled to a round ceiling the way a real axis is. It
 * draws once on first intersection and never again.
 *
 * Honesty, which outranks every visual note above: this component computes
 * what the visitor's own three inputs imply and nothing else. There is no
 * benchmark, no industry average, no "typical customer saves" figure and no
 * claim that any of this work is actually automatable. The copy carries a
 * caveat and a disclaimer saying exactly that, and both are rendered.
 *
 * Bilingual by construction: no string in this file is user-facing English.
 * Every figure runs through Intl.NumberFormat with the passed locale, so the
 * currency symbol, the decimal separator and the grouping all come from the
 * locale rather than from a hardcoded template.
 */

/** Stated in copy.roi.subAfter, so the two must not drift apart. */
const WORKING_WEEKS = 46;
const MONTHS_PER_YEAR = 12;

/* -------------------------------------------------------------- the chart --- */

/* User-space geometry. The SVG is stretched over the block with
   preserveAspectRatio="none", so these units are proportions rather than
   pixels; the stroke keeps its true 1.5px through vector-effect.
   CHART_TOP is deliberately low: it holds the plotted line under the control
   cluster at every desktop width, which is exactly the region the 18rem of
   bottom padding opens up. Measured, not guessed: the cluster is a fixed 32rem
   of a block that narrows to about 860px at the 900px breakpoint, so at the
   narrow end it covers sixty percent of the width and seventy percent of the
   height. Raising this value puts a 1.5px accent line straight through the
   fine print at those widths. */
const CHART_W = 1000;
const CHART_H = 420;
const CHART_TOP = 216;
const CHART_BASE = 410;

/* A real axis stops on a round number, not on the data. This ladder keeps the
   plotted line between roughly two thirds and full height of the plot, so the
   shape visibly answers the sliders without the ceiling jumping wildly. */
const NICE_STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

function niceCeiling(value: number): number {
  if (!(value > 0)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = NICE_STEPS.find((s) => normalized <= s + 1e-9) ?? 10;
  return step * magnitude;
}

/**
 * The cumulative cost path, month 0 to month 12.
 *
 * Cost accrues linearly because nothing in this model compounds, and inventing
 * a curve would be inventing a claim. Returns the open line and the same line
 * closed to the baseline for the fill.
 */
function buildChart(total: number): { line: string; area: string } {
  const ceiling = niceCeiling(total);
  const plotHeight = CHART_BASE - CHART_TOP;
  const points: string[] = [];

  for (let i = 0; i <= MONTHS_PER_YEAR; i += 1) {
    const x = (i / MONTHS_PER_YEAR) * CHART_W;
    const cumulative = (total * i) / MONTHS_PER_YEAR;
    const y = CHART_BASE - (cumulative / ceiling) * plotHeight;
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  const line = points.join(" ");
  return { line, area: `${line} L${CHART_W} ${CHART_H} L0 ${CHART_H} Z` };
}

/* ------------------------------------------------------------- period word --- */

type Period = "week" | "month";
const PERIODS: readonly Period[] = ["week", "month"];

/**
 * The localised word for a calendar unit, taken from the locale data rather
 * than from a hardcoded label. `Intl.NumberFormat` with `style: "unit"` gives
 * "1 week" / "1 maand"; stripping the formatted numeral leaves the noun.
 *
 * This exists because copy.roi has no per-week / per-month labels. If those
 * are ever added as real copy fields they should replace this outright: a
 * hand-written label will always beat a derived one.
 */
function unitWord(locale: string, unit: Period): string {
  try {
    const withUnit = new Intl.NumberFormat(locale, {
      style: "unit",
      unit,
      unitDisplay: "long",
    }).format(1);
    const numeral = new Intl.NumberFormat(locale).format(1);
    const word = withUnit.replace(numeral, "").trim();
    if (word) return word;
  } catch {
    /* Falls through. */
  }
  /* Last resort on an engine without the unit style, which no current engine
     is. The CLDR unit key, not a translated string. */
  return unit;
}

/* ---------------------------------------------------------------- controls --- */

function Slider({
  id,
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className="mk-roi__field">
      <div className="mk-roi__field-head">
        <label className="mk-roi__field-label" htmlFor={id}>
          {label}
        </label>
        {/* The formatted value reaches assistive tech through aria-valuetext
            on the input itself, so this copy of it is decoration. */}
        <span className="mk-roi__field-value" aria-hidden="true">
          {display}
        </span>
      </div>
      <input
        id={id}
        className="mk-roi__range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={display}
        style={{ "--fill": `${fill}%` } as CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ block --- */

export function RoiCalculator({
  copy,
}: {
  copy: MarketingCopy["roi"] & { locale: string };
}) {
  const [hours, setHours] = useState(8);
  const [rate, setRate] = useState(60);
  const [people, setPeople] = useState(1);
  const [period, setPeriod] = useState<Period>("week");

  const uid = useId();
  const gradientId = `${uid}-roi-fill`;
  const hoursLabelId = `${uid}-roi-hours`;
  const inputsLabelId = `${uid}-roi-inputs`;

  const chartRef = useRef<SVGSVGElement | null>(null);

  const { euro, num, weekWord, monthWord } = useMemo(() => {
    const { locale } = copy;
    return {
      euro: new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }),
      num: new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
      weekWord: unitWord(locale, "week"),
      monthWord: unitWord(locale, "month"),
    };
  }, [copy]);

  const hoursPerWeek = hours * people;
  const hoursPerYear = hoursPerWeek * WORKING_WEEKS;
  const hoursPerMonth = hoursPerYear / MONTHS_PER_YEAR;
  const costPerYear = hoursPerYear * rate;

  const { line, area } = buildChart(costPerYear);

  /* The one entrance in this section: the chart line draws itself once, the
     first time the block comes into view. The figures get nothing, because a
     readout that animates on arrival reads as a marketing stat rather than an
     instrument.
     Armed from JS, like the Who-it's-for wipe, so the chart is simply present
     without scripting and before hydration. Skipped outright under reduced
     motion and when the block is already on screen at mount (a deep link to
     #roi), rather than flashed. roi-calculator.css carries a matching
     reduced-motion rule as a safety net. */
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.classList.add("is-armed");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="mk-roi">
      {/* Decorative: every number in it is also printed as text in the
          readouts below, and the plot carries no axis labels of its own. */}
      <svg
        ref={chartRef}
        className="mk-roi__chart"
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop className="mk-roi__stop mk-roi__stop--top" offset="0" />
            <stop className="mk-roi__stop mk-roi__stop--base" offset="1" />
          </linearGradient>
        </defs>
        <path className="mk-roi__area" d={area} fill={`url(#${gradientId})`} />
        <path
          className="mk-roi__line"
          d={line}
          pathLength={1}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="mk-roi__panel">
        {/* No eyebrow, no lede pair, no section head. One sentence. */}
        <h2 className="mk-roi__lead">{copy.h2}</h2>

        <div className="mk-roi__readouts">
          <div className="mk-roi__readout">
            <span className="mk-roi__readout-label">{copy.resultLabel}</span>
            <span className="mk-roi__figure">
              {euro.format(costPerYear)}
              <span className="mk-roi__unit">{copy.perYear}</span>
            </span>
          </div>

          <div className="mk-roi__readout">
            <span className="mk-roi__readout-label" id={hoursLabelId}>
              {copy.hoursWord}
            </span>

            {/* Zero-shift swap. Both variants occupy the same single grid cell,
                unit noun included, so the cell is sized to the wider of the two
                and neither the figure nor anything after it moves by a pixel
                when the toggle flips. Only opacity changes. */}
            <span className="mk-roi__figure mk-roi__figure--swap">
              <span
                className="mk-roi__swap"
                data-active={period === "week"}
                aria-hidden={period !== "week"}
              >
                {num.format(hoursPerWeek)}
                <span className="mk-roi__unit">{`/ ${weekWord}`}</span>
              </span>
              <span
                className="mk-roi__swap"
                data-active={period === "month"}
                aria-hidden={period !== "month"}
              >
                {num.format(hoursPerMonth)}
                <span className="mk-roi__unit">{`/ ${monthWord}`}</span>
              </span>
            </span>

            <div
              className="mk-toggle"
              data-on={period}
              role="radiogroup"
              aria-labelledby={hoursLabelId}
            >
              {/* The track exists so the thumb's containing block is the inner
                  area rather than the padding box. That is what makes
                  width: calc((100% - 2px) / 2) land exactly on half the track
                  and translateX(calc(100% + 2px)) land exactly on the second
                  option. */}
              <div className="mk-toggle__track">
                <span className="mk-toggle__thumb" aria-hidden="true" />
                {PERIODS.map((p) => (
                  <label
                    className="mk-toggle__opt"
                    key={p}
                    data-active={period === p}
                  >
                    <input
                      className="mk-toggle__input"
                      type="radio"
                      name={`${uid}-roi-period`}
                      value={p}
                      checked={period === p}
                      onChange={() => setPeriod(p)}
                    />
                    <span>{p === "week" ? weekWord : monthWord}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Names the 46-week assumption in the same breath as the figure it
            produces. It is the only reason the annual number is defensible. */}
        <p className="mk-roi__basis">
          {copy.subBefore}{" "}
          <strong>
            {num.format(hoursPerYear)} {copy.hoursWord}
          </strong>{" "}
          {copy.subAfter}
        </p>

        <div
          className="mk-roi__inputs"
          role="group"
          aria-labelledby={inputsLabelId}
        >
          <p className="mk-roi__inputs-label" id={inputsLabelId}>
            {copy.lede}
          </p>
          <Slider
            id="roi-hours"
            label={copy.hoursLabel}
            value={hours}
            display={`${num.format(hours)} ${copy.hoursUnit}`}
            min={1}
            max={40}
            step={1}
            onChange={setHours}
          />
          <Slider
            id="roi-rate"
            label={copy.rateLabel}
            value={rate}
            display={`${euro.format(rate)} ${copy.rateUnit}`}
            min={20}
            max={200}
            step={5}
            onChange={setRate}
          />
          <Slider
            id="roi-people"
            label={copy.peopleLabel}
            value={people}
            display={
              people === 1
                ? copy.personSingular
                : `${num.format(people)} ${copy.peoplePlural}`
            }
            min={1}
            max={15}
            step={1}
            onChange={setPeople}
          />
        </div>

        <p className="mk-roi__caveat">{copy.caveat}</p>

        {/* --primary (white), not --paper (gold). Every button on this page
            pointing at #contact is the same action and must look the same;
            gold is reserved for exactly one button on the whole site, the
            closing CTA, so that the accent means "this is the end of the
            argument" rather than just "this is a button". */}
        <a href="#contact" className="mk-btn mk-btn--primary mk-btn--small mk-roi__cta">
          {copy.cta}
          <span className="mk-btn__arrow" aria-hidden="true">
            &rarr;
          </span>
        </a>

        <p className="mk-roi__disclaimer">{copy.disclaimer}</p>
      </div>
    </div>
  );
}
