import { SESSION_COOKIE_NAME, verifySessionToken } from "./lib/session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/auth/sign-in"];

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico" ||
    /\.(?:css|js|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$/.test(pathname)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session && !isPublicRoute) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(signInUrl);
  }

  if (session && pathname === "/auth/sign-in") {
    const redirectTo = request.nextUrl.searchParams.get("redirect");
    const safeRedirect = redirectTo?.startsWith("/") ? redirectTo : "/";
    return NextResponse.redirect(new URL(safeRedirect, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
