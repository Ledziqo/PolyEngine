import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const proto = request.headers.get("x-forwarded-proto") || "http";
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: proto === "https",
    path: "/",
    maxAge: 0
  });

  return response;
}
