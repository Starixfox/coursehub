import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A small reusable table shell in the dark theme. Renders a header row from
 * `columns` and arbitrary `<tr>` children for the body. Keep it dumb — callers
 * own cell rendering so it stays flexible across the admin tables.
 */
export interface DataTableColumn {
  key: string;
  label: React.ReactNode;
  className?: string;
}

export function DataTable({
  columns,
  children,
  empty = "Nothing here yet.",
  className,
}: {
  columns: DataTableColumn[];
  children?: React.ReactNode;
  empty?: React.ReactNode;
  className?: string;
}) {
  const hasRows = React.Children.count(children) > 0;
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius)] border border-border bg-card",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground",
                    col.className,
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {hasRows ? (
              children
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm text-muted"
                >
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DataTableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("transition-colors hover:bg-card-hover", className)}
      {...props}
    />
  );
}

export function DataTableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 py-3 align-middle text-foreground", className)} {...props} />
  );
}
