import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { securityHeaders } from "@/lib/security/headers";

/** Route prefixes that require authentication. */
const PROTECTED = ["/dashboard", "/learn", "/account", "/creator", "/admin"];
/** Auth pages a signed-in user should be bounced away from. */
const AUTH_PAGES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  let result = response;

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    result = NextResponse.redirect(url);
  } else if (
    needsAuth &&
    user &&
    !user.email_confirmed_at &&
    !pathname.startsWith("/account")
  ) {
    // Email verification gate: unverified users may only reach /verify-email.
    const url = request.nextUrl.clone();
    url.pathname = "/verify-email";
    result = NextResponse.redirect(url);
  } else if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    result = NextResponse.redirect(url);
  }

  // Apply security headers to whatever response we return.
  for (const [k, v] of Object.entries(securityHeaders())) {
    result.headers.set(k, v);
  }
  return result;
}

export const config = {
  // Run on everything except static assets and image optimizer.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
