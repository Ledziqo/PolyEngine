import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, SESSION_COOKIE } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const proto = request.headers.get("x-forwarded-proto") || "http";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "polyengine.io";
  const response = NextResponse.redirect(new URL("/login", `${proto}://${host}`), 303);
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: proto === "https",
    path: "/",
    maxAge: 0
  });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: false,
    sameSite: "lax",
    secure: proto === "https",
    path: "/",
    maxAge: 0
  });

  return response;
}
