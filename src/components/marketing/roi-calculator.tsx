"use client";

import { useState } from "react";
import type { MarketingCopy } from "./copy";

const WORKING_WEEKS = 46;

function Field({
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
    <div className="mk-field">
      <div className="mk-field__head">
        <label className="mk-field__label" htmlFor={id}>
          {label}
        </label>
        <span className="mk-field__value">{display}</span>
      </div>
      <input
        id={id}
        className="mk-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ "--fill": `${fill}%` } as React.CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function RoiCalculator({ copy }: { copy: MarketingCopy["roi"] & { locale: string } }) {
  const [hours, setHours] = useState(8);
  const [rate, setRate] = useState(60);
  const [people, setPeople] = useState(1);

  const euro = new Intl.NumberFormat(copy.locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
  const num = new Intl.NumberFormat(copy.locale, { maximumFractionDigits: 0 });

  const hoursPerYear = hours * people * WORKING_WEEKS;
  const costPerYear = hoursPerYear * rate;

  return (
    <div className="mk-calc">
      <div className="mk-calc__inputs">
        <Field
          id="roi-hours"
          label={copy.hoursLabel}
          value={hours}
          display={`${hours} ${copy.hoursUnit}`}
          min={1}
          max={40}
          step={1}
          onChange={setHours}
        />
        <Field
          id="roi-rate"
          label={copy.rateLabel}
          value={rate}
          display={`${euro.format(rate)} ${copy.rateUnit}`}
          min={20}
          max={200}
          step={5}
          onChange={setRate}
        />
        <Field
          id="roi-people"
          label={copy.peopleLabel}
          value={people}
          display={people === 1 ? copy.personSingular : `${people} ${copy.peoplePlural}`}
          min={1}
          max={15}
          step={1}
          onChange={setPeople}
        />
      </div>

      <div className="mk-calc__result">
        <div>
          <div className="mk-calc__result-label">{copy.resultLabel}</div>
          <div className="mk-calc__figure">
            {euro.format(costPerYear)}
            <span className="mk-calc__per-year"> {copy.perYear}</span>
          </div>
          <p className="mk-calc__sub">
            {copy.subBefore}{" "}
            <strong>
              {num.format(hoursPerYear)} {copy.hoursWord}
            </strong>{" "}
            {copy.subAfter}
          </p>
          <a
            href="#audit"
            className="mk-btn mk-btn--paper mk-btn--small mk-calc__cta"
          >
            {copy.cta}
            <span className="mk-btn__arrow" aria-hidden="true">
              &rarr;
            </span>
          </a>
        </div>
        <p className="mk-calc__disclaimer">{copy.disclaimer}</p>
      </div>
    </div>
  );
}
