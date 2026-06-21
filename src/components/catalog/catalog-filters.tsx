"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TIER_ORDER, tierLabel, type Tier } from "@/lib/entitlements";
import { cn } from "@/lib/utils";

export interface CatalogFiltersProps {
  categories: string[];
  /** Current values, read from searchParams server-side. */
  q?: string;
  category?: string;
  tier?: string;
}

const selectClass = cn(
  "h-10 rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-border-strong",
);

export function CatalogFilters({
  categories,
  q = "",
  category = "",
  tier = "",
}: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(q);

  // Keep the input in sync if the URL changes externally (e.g. back/forward).
  React.useEffect(() => {
    setSearch(q);
  }, [q]);

  const pushQuery = React.useCallback(
    (next: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(next)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams],
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushQuery({ q: search.trim() });
  }

  const hasFilters = Boolean(q || category || tier);

  return (
    <form
      onSubmit={onSubmit}
      className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses…"
          aria-label="Search courses"
          className="pl-9"
        />
      </div>

      <select
        className={selectClass}
        value={category}
        aria-label="Filter by category"
        onChange={(e) => pushQuery({ category: e.target.value })}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={tier}
        aria-label="Filter by tier"
        onChange={(e) => pushQuery({ tier: e.target.value })}
      >
        <option value="">All tiers</option>
        {TIER_ORDER.map((t) => (
          <option key={t} value={t}>
            {tierLabel(t as Tier)}
          </option>
        ))}
      </select>

      <Button type="submit" variant="secondary" className="shrink-0">
        Search
      </Button>

      {hasFilters ? (
        <Button
          type="button"
          variant="ghost"
          className="shrink-0"
          onClick={() => {
            setSearch("");
            router.push(pathname);
          }}
        >
          <X className="size-4" />
          Clear
        </Button>
      ) : null}
    </form>
  );
}
