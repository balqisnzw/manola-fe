import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Image URL helper ───────────────────────────────────────────────────────────

/**
 * Converts a backend-relative image path (e.g. `/uploads/photo.jpg`)
 * into an absolute URL pointing to the Express static-file server.
 *
 * NEXT_PUBLIC_API_URL is typically `http://localhost:4000/api`, but static
 * files are served from the server root (`http://localhost:4000`), so we
 * strip the `/api` suffix.
 *
 * If `path` is already an absolute URL or falsy, it is returned as-is.
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder.svg";
  // Already an absolute URL — return unchanged
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  // Remove trailing /api (or /api/) to get the server origin
  const baseUrl = apiUrl.replace(/\/api\/?$/, "");

  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}

// ─── Price formatter ────────────────────────────────────────────────────────────

/**
 * Format a number into Indonesian Rupiah currency string.
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}
