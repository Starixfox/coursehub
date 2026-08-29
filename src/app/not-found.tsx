import type { Metadata } from "next";
import Link from "next/link";
import "@/app/marketing.css";
import { SiteAtmosphere } from "@/components/marketing/site-atmosphere";
import { AgoraLogo } from "@/components/marketing/agora-logo";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * The 404.
 *
 * Deliberately not a joke and not an illustration. Somebody arriving here has
 * already failed at something, and the useful thing is a way onward, not a
 * cartoon. It carries the same backdrop, type and palette as the site so it
 * reads as part of the same place rather than as a server error page, and it
 * offers the three destinations that actually cover why a link breaks: the
 * home page, the section they were probably looking for, and a human.
 */
export default function NotFound() {
  return (
    <div className="mkt mk-404">
      <div className="mk-atmos" aria-hidden="true">
        <SiteAtmosphere />
      </div>

      <main className="mk-404__inner">
        <Link href="/" className="mk-404__brand" aria-label="Agora, home">
          <AgoraLogo size={120} />
        </Link>

        <p className="mk-404__code">404</p>

        <h1 className="mk-h1 mk-404__title">
          That page isn&rsquo;t here <span className="mk-serif">any more.</span>
        </h1>

        <p className="mk-lede mk-404__lede">
          The link may be old, or the address may have a typo in it. Nothing is
          broken on your side.
        </p>

        <nav className="mk-404__actions" aria-label="Where to go next">
          <Link href="/" className="mk-btn mk-btn--primary">
            Back to the home page
            <span className="mk-btn__arrow" aria-hidden="true">
              &rarr;
            </span>
          </Link>
          <Link href="/#workflows" className="mk-btn mk-btn--ghost">
            See the workflows
          </Link>
        </nav>

        <p className="mk-404__note">
          Still stuck? Mail{" "}
          <a href="mailto:j.guzman@midnightspaceconsultancy.com">
            j.guzman@midnightspaceconsultancy.com
          </a>{" "}
          and we will point you at the right page.
        </p>
      </main>
    </div>
  );
}
