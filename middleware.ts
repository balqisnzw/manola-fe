import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Route access configuration ────────────────────────────────────────────────

/**
 * Maps URL path prefixes to the roles that are allowed to access them.
 * Routes NOT listed here are publicly accessible.
 */
const PROTECTED_ROUTES: Record<string, string[]> = {
  "/owner": ["OWNER"],
  "/admin": ["OWNER", "ADMIN"],
  "/kasir": ["OWNER", "ADMIN", "KASIR"],
  "/packaging": ["OWNER", "ADMIN", "PACKAGING"],
  "/profil": ["OWNER", "ADMIN", "KASIR", "PACKAGING", "USER"],
  "/checkout": ["OWNER", "ADMIN", "KASIR", "PACKAGING", "USER"],
  "/cart": ["OWNER", "ADMIN", "KASIR", "PACKAGING", "USER"],
};

// ─── Middleware ─────────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Find the first matching protected prefix
  const matchedPrefix = Object.keys(PROTECTED_ROUTES).find((prefix) =>
    pathname.startsWith(prefix)
  );

  // Route is public — allow through
  if (!matchedPrefix) return NextResponse.next();

  // Read token from cookie (set by the client after login)
  const token = request.cookies.get("manola_token")?.value;
  const userRaw = request.cookies.get("manola_user")?.value;

  // Not authenticated → redirect to login
  if (!token || !userRaw) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Parse role
  let role: string | undefined;
  try {
    role = (JSON.parse(userRaw) as { role?: string }).role;
  } catch {
    // Corrupted cookie → force re-login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check role
  const allowedRoles = PROTECTED_ROUTES[matchedPrefix];
  if (!role || !allowedRoles.includes(role)) {
    // Authenticated but wrong role → redirect to home
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/owner/:path*",
    "/admin/:path*",
    "/kasir/:path*",
    "/packaging/:path*",
    "/profil/:path*",
    "/checkout/:path*",
    "/cart/:path*",
  ],
};