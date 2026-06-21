import Link from "next/link";
import { GraduationCap } from "lucide-react";

const SECTIONS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Catalog", href: "/catalog" },
      { label: "Pricing", href: "/pricing" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Security", href: "/security" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="size-5 text-accent" />
            <span className="text-lg font-semibold tracking-tight text-gradient">CourseHub</span>
          </Link>
          <p className="max-w-xs text-sm text-muted">
            Premium courses from expert creators. Learn at the pace your subscription unlocks.
          </p>
        </div>

        {SECTIONS.map((section) => (
          <div key={section.title} className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h3>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} CourseHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
