import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, OWNER_EMAIL, OWNER_PASSWORD, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/dashboard");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "polyengine.io";
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const baseUrl = `${proto}://${host}`;

  if (email.toLowerCase() !== OWNER_EMAIL.toLowerCase() || password !== OWNER_PASSWORD) {
    const failedUrl = new URL("/login", baseUrl);
    failedUrl.searchParams.set("error", "invalid");
    if (next.startsWith("/")) {
      failedUrl.searchParams.set("next", next);
    }
    return NextResponse.redirect(failedUrl, 303);
  }

  const response = NextResponse.redirect(new URL(next.startsWith("/") ? next : "/dashboard", baseUrl), 303);
  const secure = proto === "https";

  response.cookies.set(AUTH_COOKIE, "active", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
  response.cookies.set(SESSION_COOKIE, "active", {
    httpOnly: false,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}
