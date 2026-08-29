"use client";

import { useEffect, useRef, useState } from "react";
import type { MarketingCopy } from "./copy";
import "./faq-section.css";

/**
 * FAQ: a docs-style split, not an accordion.
 *
 * A 2fr / 3fr grid. The left rail is sticky at 96px and lists the three
 * categories from copy.faq.groups; the right column renders all eight answers
 * open, so the content is scannable in one pass and indexable by a crawler
 * that never clicks. The 2:3 asymmetry is the last break in the centred
 * rhythm before the CTA.
 *
 * One DOM, two presentations. Every item is a real <details open>, written
 * open by the server, so at every viewport all eight questions and answers
 * are in the markup and readable with JavaScript disabled. Above 860px the
 * disclosure is made inert rather than duplicated: CSS drops the marker and
 * the pointer affordance, and (once mounted) the summary is taken out of the
 * tab order and its activation is prevented, so the answers cannot be closed.
 * Below 860px the same elements are left alone and behave as a normal
 * accordion; the first client render collapses them, which happens off screen
 * at the bottom of an 11,000px page, so there is nothing to see.
 *
 * The alternative, rendering the content twice and toggling with display:none,
 * would double the DOM, duplicate every id and break the anchor links. It is
 * not used here.
 *
 * Owns its outermost element. The page calls this component bare, so the
 * <section>, the #faq anchor and the horizontal padding all live here. The
 * section keeps a narrower measure than its neighbours.
 *
 * Entrance: none. The rail's active-state border-colour is the only motion.
 */

type FaqCopy = MarketingCopy["faq"];
type Bucket = { id: string; group: string; items: FaqCopy["items"] };

/** "initial" is the server and first-hydration render: everything open. */
type Layout = "initial" | "wide" | "compact";

const COMPACT = "(max-width: 859.98px)";

/**
 * Buckets the items by copy.faq.groups, in the declared display order. The ids
 * are positional rather than slugged from the category name, so the anchors
 * are identical in both languages.
 */
function buildBuckets(copy: FaqCopy): Bucket[] {
  const declared = new Set(copy.groups);
  const buckets: Bucket[] = copy.groups.map((group, i) => ({
    id: `faq-g${i}`,
    group,
    items: copy.items.filter((item) => item.group === group),
  }));

  // An item carrying a group that is not one of copy.faq.groups would drop off
  // the page silently. It joins the last block instead.
  const orphans = copy.items.filter((item) => !declared.has(item.group));
  if (orphans.length > 0 && buckets.length > 0) {
    buckets[buckets.length - 1].items.push(...orphans);
  }

  return buckets.filter((bucket) => bucket.items.length > 0);
}

export function FaqSection({ copy }: { copy: FaqCopy }) {
  const buckets = buildBuckets(copy);
  const count = buckets.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [layout, setLayout] = useState<Layout>("initial");
  const groupRefs = useRef<(HTMLElement | null)[]>([]);

  // Which presentation is live. Kept in state rather than in CSS alone because
  // the open attribute and the tab order cannot be set from a stylesheet. The
  // first render on the client must still match the server, hence "initial".
  useEffect(() => {
    const mq = window.matchMedia(COMPACT);
    const apply = () => setLayout(mq.matches ? "compact" : "wide");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // The rail's active item follows the answer groups. The top margin matches
  // the rail's own sticky offset and the bottom one keeps the reading band in
  // the upper half of the viewport, so the rail advances when a group reaches
  // the top rather than when it merely enters. Disconnected on unmount.
  useEffect(() => {
    if (count === 0) return;
    if (typeof IntersectionObserver === "undefined") return;

    const els = groupRefs.current
      .slice(0, count)
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const visible = new Set<number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = Number((entry.target as HTMLElement).dataset.faqGroup);
          if (entry.isIntersecting) visible.add(i);
          else visible.delete(i);
        }
        if (visible.size > 0) setActiveIndex(Math.min(...visible));
      },
      { rootMargin: "-96px 0px -55% 0px", threshold: 0 },
    );

    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, [count]);

  const forcedOpen = layout !== "compact";

  return (
    <section className="mk-faq-section" id="faq">
      <div className="mk-faq">
        <h2 className="mk-h2 mk-faq__title">{copy.h2}</h2>

        <nav className="mk-faq__nav" aria-label={copy.h2}>
          <ul className="mk-faq__nav-list">
            {buckets.map((bucket, i) => (
              <li key={bucket.id}>
                <a
                  href={`#${bucket.id}`}
                  aria-current={activeIndex === i ? "true" : undefined}
                >
                  <span className="mk-faq__nav-n" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{bucket.group}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mk-faq__answers">
          {buckets.map((bucket, i) => (
            // A plain div, not a <section>: three named sections inside one
            // section would add three region landmarks for no gain. The h3
            // already carries the structure.
            <div
              key={bucket.id}
              id={bucket.id}
              className="mk-faq__group"
              data-faq-group={i}
              ref={(el) => {
                groupRefs.current[i] = el;
              }}
            >
              <h3 className="mk-faq__group-title">{bucket.group}</h3>
              {bucket.items.map((item) => (
                <details key={item.q} className="mk-faq__item" open={forcedOpen}>
                  <summary
                    className="mk-faq__q"
                    tabIndex={layout === "wide" ? -1 : undefined}
                    onClick={(event) => {
                      // Above 860px the answers are static content, so the
                      // summary's activation behaviour is cancelled. Keyboard
                      // activation dispatches the same click, so this covers
                      // both. Below 860px it does nothing and the disclosure
                      // toggles normally.
                      if (layout === "wide") event.preventDefault();
                    }}
                  >
                    <h4 className="mk-faq__qt">{item.q}</h4>
                  </summary>
                  <p className="mk-faq__a">{item.a}</p>
                </details>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
