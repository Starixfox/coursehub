"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { MarketingCopy } from "./copy";

function BrandMark() {
  return (
    <span className="mk-nav__mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <rect x="2" y="9.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="17" y="9.5" width="5" height="5" rx="2.5" fill="#2b44e7" />
        <path d="M7 12h10" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      </svg>
    </span>
  );
}

function LangSwitch({ current }: { current: "en" | "nl" }) {
  return (
    <span className="mk-nav__lang" aria-label={current === "en" ? "Language" : "Taal"}>
      {current === "en" ? (
        <>
          <span className="mk-nav__lang-current">EN</span>
          <span aria-hidden="true">/</span>
          <Link href="/nl" hrefLang="nl" lang="nl">
            NL
          </Link>
        </>
      ) : (
        <>
          <Link href="/" hrefLang="en" lang="en">
            EN
          </Link>
          <span aria-hidden="true">/</span>
          <span className="mk-nav__lang-current">NL</span>
        </>
      )}
    </span>
  );
}

export function SiteNav({ copy }: { copy: MarketingCopy }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const home = copy.lang === "en" ? "/" : "/nl";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`mk-nav ${scrolled || open ? "is-scrolled" : ""}`}>
      <div className="mk-container mk-nav__inner">
        <Link href={home} className="mk-nav__brand">
          <BrandMark />
          Loopwork
        </Link>

        <nav className="mk-nav__links" aria-label={copy.nav.ariaMain}>
          {copy.nav.links.map((l) => (
            <a key={l.href} href={l.href} className="mk-nav__link">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="mk-nav__actions">
          <LangSwitch current={copy.lang} />
          <a href="#audit" className="mk-btn mk-btn--primary mk-btn--small mk-nav__cta">
            {copy.nav.cta}
          </a>
          <button
            type="button"
            className="mk-nav__toggle"
            aria-expanded={open}
            aria-label={open ? copy.nav.menuClose : copy.nav.menuOpen}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {open ? (
        <nav className="mk-nav__menu" aria-label={copy.nav.ariaMobile}>
          <div className="mk-container">
            {copy.nav.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="mk-nav__link"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <a
              href="#audit"
              className="mk-btn mk-btn--primary mk-btn--small"
              style={{ marginTop: "0.75rem" }}
              onClick={() => setOpen(false)}
            >
              {copy.nav.cta}
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
