import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/markets",
  "/market-sections",
  "/opportunities",
  "/easy-wins",
  "/fast-wins",
  "/traders",
  "/copy-signals",
  "/portfolio",
  "/history",
  "/bot-log",
  "/settings"
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!isProtected) {
    return NextResponse.next();
  }

  if (request.cookies.get("polyengine_owner")?.value === "active") {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/markets/:path*",
    "/market-sections/:path*",
    "/opportunities/:path*",
    "/easy-wins/:path*",
    "/fast-wins/:path*",
    "/traders/:path*",
    "/copy-signals/:path*",
    "/portfolio/:path*",
    "/history/:path*",
    "/bot-log/:path*",
    "/settings/:path*"
  ]
};
