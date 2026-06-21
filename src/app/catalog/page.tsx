import { Search } from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { PageHeader } from "@/components/site/page-header";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CourseGrid } from "@/components/catalog/course-grid";
import { listPublishedCourses, listCategories } from "@/lib/courses";
import { TIER_ORDER, type Tier } from "@/lib/entitlements";

export const metadata = {
  title: "Catalog · CourseHub",
  description: "Browse every published course on CourseHub.",
};

type SearchParams = Promise<{
  q?: string;
  category?: string;
  tier?: string;
}>;

const TIER_SET = new Set<string>(TIER_ORDER);

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, category, tier } = await searchParams;
  const tierFilter = tier && TIER_SET.has(tier) ? (tier as Tier) : undefined;

  const [courses, categories] = await Promise.all([
    listPublishedCourses({
      search: q?.trim() || undefined,
      category: category || undefined,
      tier: tierFilter,
    }),
    listCategories(),
  ]);

  return (
    <SiteShell>
      <PageHeader
        title="Catalog"
        description="Browse every published course. Filter by category or plan to find your next skill."
      />

      <CatalogFilters
        categories={categories}
        q={q}
        category={category}
        tier={tierFilter}
      />

      {courses.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-muted">
            {courses.length} {courses.length === 1 ? "course" : "courses"}
          </p>
          <CourseGrid courses={courses} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-border bg-card/40 px-6 py-16 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground">
            <Search className="size-5" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            No courses found
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted">
            Nothing matches these filters yet. Try a broader search or clear the
            filters to see the whole catalog.
          </p>
        </div>
      )}
    </SiteShell>
  );
}
