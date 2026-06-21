import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  PlayCircle,
  ShieldCheck,
  Award,
  Gauge,
  Library,
  Check,
} from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { CourseGrid } from "@/components/catalog/course-grid";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/ui/badge";
import { listPublishedCourses } from "@/lib/courses";
import { TIER_PLANS, TIER_ORDER, type Tier } from "@/lib/entitlements";
import { formatPrice } from "@/lib/utils";

export default async function HomePage() {
  const courses = await listPublishedCourses();
  const featured = courses.slice(0, 6);

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden py-12 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs font-medium text-muted">
            <Sparkles className="size-3.5 text-accent" />
            Learn from the best, on your schedule
          </span>
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Master new skills with{" "}
            <span className="text-gradient">premium courses</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted sm:text-lg">
            Stream high-quality lessons from expert creators. Pick a plan, learn at
            your pace, and track every step of your progress.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/catalog">
                Browse the catalog
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured courses */}
      {featured.length > 0 ? (
        <section className="py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Featured courses
              </h2>
              <p className="mt-1 text-sm text-muted">
                Fresh from our top creators.
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/catalog">
                See all
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <CourseGrid courses={featured} />
        </section>
      ) : null}

      {/* Benefits */}
      <section className="py-12">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="rounded-[var(--radius)] border border-border bg-card p-5"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-[var(--radius-sm)] bg-primary/15 text-accent">
                <b.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {b.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers teaser */}
      <section className="py-12">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Plans for every learner
          </h2>
          <p className="mt-1 text-sm text-muted">
            Start free. Upgrade any time as you go deeper.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TIER_ORDER.map((tier) => {
            const plan = TIER_PLANS[tier as Tier];
            return (
              <div
                key={tier}
                className={
                  "relative flex flex-col rounded-[var(--radius)] border bg-card p-5 " +
                  (plan.highlighted
                    ? "border-primary/50 shadow-[0_8px_40px_-12px_rgba(124,108,246,0.45)]"
                    : "border-border")
                }
              >
                {plan.highlighted ? (
                  <span className="absolute -top-2.5 left-5 rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-[11px] font-medium text-accent">
                    Most popular
                  </span>
                ) : null}
                <div className="mb-3">
                  <TierBadge tier={tier as Tier} />
                </div>
                <p className="text-sm text-muted">{plan.tagline}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold text-foreground">
                    {formatPrice(plan.priceMonthly)}
                  </span>
                  {plan.priceMonthly > 0 ? (
                    <span className="text-sm text-muted">/ mo</span>
                  ) : null}
                </div>
                <ul className="mt-4 flex-1 space-y-2">
                  {plan.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex justify-center">
          <Button size="lg" asChild>
            <Link href="/pricing">
              Compare all plans
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}

const BENEFITS = [
  {
    icon: Library,
    title: "A growing catalog",
    body: "Courses across design, engineering, business and more — updated constantly.",
  },
  {
    icon: PlayCircle,
    title: "Crisp video, any device",
    body: "Adaptive streaming up to 4K, with resumable playback wherever you stop.",
  },
  {
    icon: Gauge,
    title: "Track your progress",
    body: "Every lesson, module and course tracked so you always know what's next.",
  },
  {
    icon: Award,
    title: "Earn certificates",
    body: "Finish a course on Premium and claim a verifiable completion certificate.",
  },
] satisfies { icon: typeof ShieldCheck; title: string; body: string }[];
