/**
 * Skeleton loading components for Toko Manola.
 * Use these to show placeholder UI while data is being fetched from the API.
 */

import { cn } from "@/lib/utils";

// ─── Base Skeleton ──────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[#E5E7EB]",
        className
      )}
    />
  );
}

// ─── Product Card Skeleton ──────────────────────────────────────────────────────

export function ProductCardSkeleton() {
  return (
    <div className="bg-[var(--brand-white)] rounded-xl overflow-hidden border border-[var(--brand-border)]">
      {/* Image placeholder */}
      <Skeleton className="aspect-square w-full rounded-none" />
      {/* Text placeholders */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-28" />
      </div>
    </div>
  );
}

// ─── Table Row Skeleton ─────────────────────────────────────────────────────────

interface TableRowSkeletonProps {
  columns?: number;
}

export function TableRowSkeleton({ columns = 5 }: TableRowSkeletonProps) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

// ─── Order Card Skeleton ────────────────────────────────────────────────────────

export function OrderCardSkeleton() {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-56" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-28 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
